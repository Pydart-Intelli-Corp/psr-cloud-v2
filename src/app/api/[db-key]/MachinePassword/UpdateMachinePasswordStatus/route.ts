import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { ESP32ResponseHelper } from '@/lib/external-api/ESP32ResponseHelper';
import { InputValidator } from '@/lib/external-api/InputValidator';
import { QueryBuilder } from '@/lib/external-api/QueryBuilder';

interface MachinePasswordUpdateResult {
  id: number;
  machine_id: string;
  statusU: number;
  statusS: number;
}

interface SocietyLookupResult {
  id: number;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // Extract InputString using helper
    let inputString = await ESP32ResponseHelper.extractInputString(request);
    
    // Await the params Promise in Next.js 15
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    console.log(`🔍 UpdateMachinePasswordStatus API Request - Full URL: ${request.url}`);
    console.log(`🔍 Resolved Params:`, resolvedParams);
    console.log(`🔍 DB Key: "${dbKey}", InputString: "${inputString}"`);
    console.log(`🔍 DB Key type: ${typeof dbKey}, length: ${dbKey?.length}`);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return ESP32ResponseHelper.createErrorResponse('DB Key is required');
    }

    if (!inputString) {
      console.log(`❌ InputString is required`);
      return ESP32ResponseHelper.createErrorResponse('InputString parameter is required');
    }

    // Filter line ending characters from InputString
    inputString = ESP32ResponseHelper.filterLineEndings(inputString);

    // PRIORITY 1: Connect to database and validate DB Key first
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Validate DB key format
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse(dbKeyValidation.error || 'Invalid DB Key');
    }

    // Find admin by dbKey to get schema name
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found or missing DB Key for: ${dbKey}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
    }

    // Parse input string format: societyId|machineType|version|machineId|passwordType (optional)
    // Example: S-s12|ECOD|LE3.34|M00001|U or S-s12|ECOD|LE3.34|M00001 (updates both)
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 4 && inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 4 or 5 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format. Expected: societyId|machineType|version|machineId|passwordType(optional)');
    }

    const [societyIdStr, machineType, machineModel, machineId, passwordType] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, passwordType: passwordType || 'both' });
    
    // PRIORITY 2: Validate Society/BMC ID and find actual database ID
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid society/BMC ID');
    }
    
    let actualSocietyId: number;
    
    if (societyValidation.isBmc) {
      const { query: bmcQuery, replacements: bmcReplacements } = QueryBuilder.buildBmcLookupQuery(
        schemaName,
        societyValidation.id
      );
      
      const [bmcResults] = await sequelize.query(bmcQuery, { replacements: bmcReplacements });
      
      if (!Array.isArray(bmcResults) || bmcResults.length === 0) {
        console.log(`❌ BMC not found: "${societyIdStr}"`);
        return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
      }
      
      actualSocietyId = (bmcResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found BMC: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    } else {
      const { query: societyQuery, replacements: societyReplacements } = QueryBuilder.buildSocietyLookupQuery(
        schemaName,
        societyValidation.id
      );
      
      const [societyResults] = await sequelize.query(societyQuery, { replacements: societyReplacements });
      
      if (!Array.isArray(societyResults) || societyResults.length === 0) {
        console.log(`❌ Society not found: "${societyIdStr}"`);
        return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
      }
      
      actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    }

    // PRIORITY 3: Validate Machine ID and create variants for flexible matching
    const machineIdValidation = InputValidator.validateMachineId(machineId);
    if (!machineIdValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse(machineIdValidation.error || 'Invalid machine ID');
    }
    
    // Extract parsed values or use defaults
    const parsedMachineId = machineIdValidation.numericId || null;
    const machineIdVariants = machineIdValidation.variants || [];

    // PRIORITY 4: Validate Password Type (optional - if not provided, update both)
    const updateBoth = !passwordType;
    const isUserPassword = passwordType === 'U';
    const isSupervisorPassword = passwordType === 'S';
    
    if (passwordType && passwordType !== 'U' && passwordType !== 'S') {
      console.log(`❌ Invalid password type: "${passwordType}". Must be 'U' for User or 'S' for Supervisor`);
      return ESP32ResponseHelper.createErrorResponse('Invalid password type. Must be U or S');
    }
    
    console.log(`🔍 Password type: ${passwordType || 'both'} (${updateBoth ? 'Both passwords' : isUserPassword ? 'User password' : 'Supervisor password'})`);

    console.log(`🔍 Using schema: ${schemaName} for society: ${actualSocietyId}, machine: ${machineId}`);

    // PRIORITY 5: Find the machine to update
    let findMachineQuery: string;
    let queryReplacements: (string | number)[];
    
    if (parsedMachineId !== null) {
      // Numeric machine ID - use direct matching by id
      findMachineQuery = `
        SELECT 
          id, machine_id, statusU, statusS
        FROM \`${schemaName}\`.machines 
        WHERE (society_id = ? OR bmc_id = ?) AND id = ?
        LIMIT 1
      `;
      queryReplacements = [actualSocietyId, actualSocietyId, parsedMachineId];
    } else {
      // Alphanumeric machine ID - use variant matching by machine_id string
      const placeholders = machineIdVariants.map(() => '?').join(', ');
      findMachineQuery = `
        SELECT 
          id, machine_id, statusU, statusS
        FROM \`${schemaName}\`.machines 
        WHERE (society_id = ? OR bmc_id = ?) AND machine_id IN (${placeholders})
        LIMIT 1
      `;
      queryReplacements = [actualSocietyId, actualSocietyId, ...machineIdVariants];
    }

    const [machineResults] = await sequelize.query(findMachineQuery, { 
      replacements: queryReplacements
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ No machine found for society ${actualSocietyId}, machine ID ${parsedMachineId}`);
      return ESP32ResponseHelper.createErrorResponse('Machine not found');
    }

    const machine = machineResults[0] as MachinePasswordUpdateResult;
    console.log(`✅ Found machine: ID ${machine.id}, machine_id: ${machine.machine_id}`);
    console.log(`🔍 Current status - User: ${machine.statusU}, Supervisor: ${machine.statusS}`);

    // PRIORITY 6: Update the appropriate password status
    let updateQuery: string;
    let statusField: string;

    if (updateBoth) {
      updateQuery = `
        UPDATE \`${schemaName}\`.machines 
        SET statusU = 0, statusS = 0 
        WHERE id = ?
      `;
      statusField = 'statusU and statusS';
      console.log(`🔄 Updating both statusU (${machine.statusU}) and statusS (${machine.statusS}) to 0 for machine ID: ${machine.id}`);
    } else if (isUserPassword) {
      updateQuery = `
        UPDATE \`${schemaName}\`.machines 
        SET statusU = 0 
        WHERE id = ?
      `;
      statusField = 'statusU';
      console.log(`🔄 Updating ${statusField} from ${machine.statusU} to 0 for machine ID: ${machine.id}`);
    } else {
      updateQuery = `
        UPDATE \`${schemaName}\`.machines 
        SET statusS = 0 
        WHERE id = ?
      `;
      statusField = 'statusS';
      console.log(`🔄 Updating ${statusField} from ${machine.statusS} to 0 for machine ID: ${machine.id}`);
    }

    // Execute the update
    await sequelize.query(updateQuery, { replacements: [machine.id] });

    console.log(`✅ Successfully updated ${statusField} to 0 for machine ${machine.machine_id} in schema: ${schemaName}`);

    // PRIORITY 7: Verify the update
    const verifyQuery = `
      SELECT statusU, statusS 
      FROM \`${schemaName}\`.machines 
      WHERE id = ?
    `;

    const [verifyResults] = await sequelize.query(verifyQuery, { replacements: [machine.id] });
    const updatedMachine = verifyResults[0] as { statusU: number, statusS: number };

    console.log(`🔍 Verification - Updated status - User: ${updatedMachine.statusU}, Supervisor: ${updatedMachine.statusS}`);

    // Return success response
    const successMessage = updateBoth
      ? `Both password statuses updated to 0 for machine ${machine.machine_id}`
      : isUserPassword 
      ? `User password status updated to 0 for machine ${machine.machine_id}`
      : `Supervisor password status updated to 0 for machine ${machine.machine_id}`;

    console.log(`📤 ${successMessage}`);

    return ESP32ResponseHelper.createDataResponse('Machine password status updated successfully.');

  } catch (error) {
    console.error('❌ Error in UpdateMachinePasswordStatus API:', error);
    return ESP32ResponseHelper.createErrorResponse('Status update failed');
  }
}

// Export GET handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

// Export POST handler
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}