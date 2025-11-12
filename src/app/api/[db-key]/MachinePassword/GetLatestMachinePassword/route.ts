import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

interface MachinePasswordResult {
  id: number;
  machine_id: string;
  user_password: string | null;
  supervisor_password: string | null;
  statusU: number;
  statusS: number;
  society_string_id?: string;
}

/**
 * GetLatestMachinePassword API Endpoint
 * 
 * Purpose: Retrieve machine user/supervisor password
 * InputString format: societyId|machineType|version|machineId|passwordType
 * Example: 333|ECOD|LE3.34|M00001|U or S-s12|DPST-G|LE2.00|Mm00005|S
 * 
 * Endpoint: GET/POST /api/[db-key]/MachinePassword/GetLatestMachinePassword
 */

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
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    // Validate InputString is provided
    if (!inputString) {
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    // Connect to database
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Find admin by dbKey
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found or missing DB Key for: ${dbKey}`);
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    // Parse InputString (5 parts)
    const inputParts = inputString.split('|');
    if (inputParts.length !== 5) {
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    const [societyIdStr, machineType, machineModel, machineId, passwordType] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { societyIdStr, machineType, machineModel, machineId, passwordType });

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Failed to get password. Invalid token.');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Failed to get password. Invalid machine details.');
    }

    // Validate Password Type
    const passwordValidation = InputValidator.validatePasswordType(passwordType);
    if (!passwordValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    // Validate Machine Model (log warning only)
    if (!machineModel || machineModel.trim() === '') {
      console.log(`⚠️ Machine model is empty: "${machineModel}"`);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🔍 Using schema: ${schemaName} for society: ${societyIdStr}, machine: ${machineId}`);

    // Build query filters
    const societyFilter = QueryBuilder.buildSocietyFilter(
      societyValidation.id,
      societyValidation.fallback,
      societyValidation.numericId
    );

    const machineFilter = QueryBuilder.buildMachineFilter(machineValidation);

    // Build complete password query
    const { query, replacements } = QueryBuilder.buildMachinePasswordQuery(
      schemaName,
      societyFilter,
      machineFilter
    );

    console.log(`🔍 Executing query with replacements:`, replacements);

    // Execute query
    const [results] = await sequelize.query(query, { replacements });
    const machines = results as MachinePasswordResult[];

    console.log(`✅ Found ${machines.length} machines in schema: ${schemaName}`);
    
    if (machines.length > 0) {
      console.log(`🔍 Machine result:`, {
        id: machines[0].id,
        machine_id: machines[0].machine_id,
        society_string_id: machines[0].society_string_id,
        statusU: machines[0].statusU,
        statusS: machines[0].statusS
      });
    }

    // Check if machine found
    if (machines.length === 0) {
      console.log(`ℹ️ No active machine found for society ${societyIdStr}, machine ${machineId}`);
      return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
    }

    const machine = machines[0];

    // Return appropriate password based on type
    if (passwordValidation.isUser) {
      // Check if user password is set
      if (machine.statusU !== 1) {
        console.log(`ℹ️ User password not set for machine ${machineId} (statusU: ${machine.statusU})`);
        return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
      }
      
      const password = machine.user_password || '';
      const response = `PU|${password}`;
      console.log(`📤 Returning user password for machine ${machineId}`);
      
      return ESP32ResponseHelper.createDataResponse(response);
      
    } else if (passwordValidation.isSupervisor) {
      // Check if supervisor password is set
      if (machine.statusS !== 1) {
        console.log(`ℹ️ Supervisor password not set for machine ${machineId} (statusS: ${machine.statusS})`);
        return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
      }
      
      const password = machine.supervisor_password || '';
      const response = `PS|${password}`;
      console.log(`📤 Returning supervisor password for machine ${machineId}`);
      
      return ESP32ResponseHelper.createDataResponse(response);
    }

    // Should never reach here
    return ESP32ResponseHelper.createErrorResponse('Machine password not found.');

  } catch (error) {
    console.error('❌ Error in GetLatestMachinePassword API:', error);
    return ESP32ResponseHelper.createErrorResponse('Machine password not found.');
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