import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

interface SocietyLookupResult {
  id: number;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // Extract InputString using ESP32ResponseHelper
    let inputString = await ESP32ResponseHelper.extractInputString(request);
    
    // Get DB Key from params
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    // Filter line endings from InputString
    if (inputString) {
      inputString = ESP32ResponseHelper.filterLineEndings(inputString);
    }

    // Log request
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate DB Key
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    // Validate InputString is provided
    if (!inputString) {
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    // PRIORITY 1: Connect to database and validate DB Key first
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Find admin by dbKey to get schema name
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found for DB Key: ${dbKey}`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    // Parse input string format: societyId|machineType|version|machineId
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 4) {
      console.log(`❌ Invalid InputString format. Expected 4 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    const [societyIdStr, machineType, machineModel, machineId] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { societyIdStr, machineType, machineModel, machineId });
    
    // Validate Society ID using InputValidator
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    // Validate Machine ID using InputValidator
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }
    
    // PRIORITY 2: Validate Society/BMC ID and find actual database ID
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    let actualSocietyId: number;
    
    // Check if this is a BMC ID or Society ID
    if (societyValidation.isBmc) {
      // Look up BMC using QueryBuilder
      const { query: bmcQuery, replacements: bmcReplacements } = QueryBuilder.buildBmcLookupQuery(
        schemaName,
        societyValidation.id
      );
      
      const [bmcResults] = await sequelize.query(bmcQuery, { replacements: bmcReplacements });
      
      if (!Array.isArray(bmcResults) || bmcResults.length === 0) {
        console.log(`❌ BMC not found: "${societyIdStr}"`);
        return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
      }
      
      actualSocietyId = (bmcResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found BMC: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    } else {
      // Look up society using QueryBuilder
      const { query: societyQuery, replacements: societyReplacements } = QueryBuilder.buildSocietyLookupQuery(
        schemaName,
        societyValidation.id
      );
      
      const [societyResults] = await sequelize.query(societyQuery, { replacements: societyReplacements });
      
      if (!Array.isArray(societyResults) || societyResults.length === 0) {
        console.log(`❌ Society not found: "${societyIdStr}"`);
        return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
      }
      
      actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    }

    // PRIORITY 3: Get machine ID variants for matching
    // Use the comprehensive variants from InputValidator which includes all possible formats
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    // Fallback: if variants is empty, create basic variants
    if (machineIdVariants.length === 0) {
      const machineIdCleaned = machineValidation.alphanumericId || machineValidation.numericId?.toString() || machineValidation.strippedId || '';
      machineIdVariants.push(machineIdCleaned);
      
      // Add trimmed version if it starts with zeros
      const trimmedMachineId = machineIdCleaned.replace(/^0+/, '');
      if (trimmedMachineId && trimmedMachineId !== machineIdCleaned) {
        machineIdVariants.push(trimmedMachineId);
      }
    }
    
    console.log(`🔍 Machine ID conversion: "${machineId}" -> Variants: ${JSON.stringify(machineIdVariants)}`);

    // PRIORITY 5: Find the machine to get its database ID
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const findMachineQuery = `
      SELECT id, machine_id 
      FROM \`${schemaName}\`.machines 
      WHERE machine_id IN (${placeholders}) AND (society_id = ? OR bmc_id IS NOT NULL)
        AND status = 'active'
      LIMIT 1
    `;

    const [machineResults] = await sequelize.query(findMachineQuery, { 
      replacements: [...machineIdVariants, actualSocietyId] 
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ No machine found for society ${actualSocietyId}, machine ID variants: ${JSON.stringify(machineIdVariants)}`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    const machine = machineResults[0] as { id: number; machine_id: string };
    console.log(`✅ Found machine: ID ${machine.id}, machine_id: ${machine.machine_id}`);

    // PRIORITY 6: Update the correction status to 0
    const updateQuery = `
      UPDATE \`${schemaName}\`.machine_corrections 
      SET status = 0, updated_at = NOW()
      WHERE machine_id = ? AND status = 1
    `;

    console.log(`🔄 Updating correction status to 0 for machine ID: ${machine.id}`);

    // Execute the update
    await sequelize.query(updateQuery, { replacements: [machine.id] });

    console.log(`✅ Successfully updated correction status to 0 for machine ${machine.machine_id} in schema: ${schemaName}`);

    // Return success response
    return ESP32ResponseHelper.createDataResponse('Machine correction status updated successfully.');

  } catch (error) {
    console.error('❌ Error in SaveMachineCorrectionUpdationHistory API:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
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
