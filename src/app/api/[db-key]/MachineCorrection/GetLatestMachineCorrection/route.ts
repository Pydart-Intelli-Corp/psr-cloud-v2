import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

interface MachineCorrectionResult {
  id: number;
  machine_id: number;
  channel1_fat: number;
  channel1_snf: number;
  channel1_clr: number;
  channel1_temp: number;
  channel1_water: number;
  channel1_protein: number;
  channel2_fat: number;
  channel2_snf: number;
  channel2_clr: number;
  channel2_temp: number;
  channel2_water: number;
  channel2_protein: number;
  channel3_fat: number;
  channel3_snf: number;
  channel3_clr: number;
  channel3_temp: number;
  channel3_water: number;
  channel3_protein: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

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
    
    if (societyValidation.isBmc) {
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
    
    console.log(`🔍 Machine ID validation result:`, {
      numericId: machineValidation.numericId,
      alphanumericId: machineValidation.alphanumericId,
      variants: machineValidation.variants,
      isNumeric: machineValidation.isNumeric
    });
    
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

    // Build query to fetch active machine correction with multiple machine ID variants
    // Use IN clause to match any of the machine ID variants (e.g., "0000df" or "df")
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const query = `
      SELECT 
        mc.id,
        mc.machine_id,
        mc.channel1_fat,
        mc.channel1_snf,
        mc.channel1_clr,
        mc.channel1_temp,
        mc.channel1_water,
        mc.channel1_protein,
        mc.channel2_fat,
        mc.channel2_snf,
        mc.channel2_clr,
        mc.channel2_temp,
        mc.channel2_water,
        mc.channel2_protein,
        mc.channel3_fat,
        mc.channel3_snf,
        mc.channel3_clr,
        mc.channel3_temp,
        mc.channel3_water,
        mc.channel3_protein,
        mc.status,
        mc.created_at,
        mc.updated_at
      FROM \`${schemaName}\`.machine_corrections mc
      INNER JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      WHERE (m.society_id = ? OR m.bmc_id IS NOT NULL)
        AND m.machine_id IN (${placeholders})
        AND mc.status = 1
        AND m.status = 'active'
      ORDER BY mc.created_at DESC
      LIMIT 1
    `;

    const replacements: (string | number)[] = [actualSocietyId, ...machineIdVariants];

    console.log(`🔍 Executing query with replacements:`, replacements);
    console.log(`🔍 Machine ID variants for search:`, machineIdVariants);
    console.log(`🔍 Full query:`, query);

    const [results] = await sequelize.query(query, { replacements });
    const corrections = results as MachineCorrectionResult[];

    console.log(`✅ Found ${corrections.length} active correction records in schema: ${schemaName}`);

    if (corrections.length === 0) {
      console.log(`ℹ️ No active correction found for machine ${machineId} (variants: ${JSON.stringify(machineIdVariants)}) in schema ${schemaName}`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction not found.');
    }

    const correction = corrections[0];
    
    // Format date as DD-MM-YYYY HH:mm:ss AM/PM
    const formatDateTime = (date: Date): string => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hoursStr = String(hours).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    };

    // Format numbers with 2 decimal places
    const formatNumber = (value: number | null | undefined): string => {
      if (value === null || value === undefined) {
        return '0.00';
      }
      return Number(value).toFixed(2);
    };

    // Build response format:
    // "DD-MM-YYYY HH:mm:ss AM/PM||1|fat|snf|clr|temp|water|protein||2|fat|snf|clr|temp|water|protein||3|fat|snf|clr|temp|water|protein"
    const dateTimeStr = formatDateTime(correction.created_at);
    
    const response = [
      dateTimeStr,
      '',  // Empty field after datetime (double pipe)
      '1',  // Channel 1
      formatNumber(correction.channel1_fat),
      formatNumber(correction.channel1_snf),
      formatNumber(correction.channel1_clr),
      formatNumber(correction.channel1_temp),
      formatNumber(correction.channel1_water),
      formatNumber(correction.channel1_protein),
      '',  // Empty field before next channel (double pipe)
      '2',  // Channel 2
      formatNumber(correction.channel2_fat),
      formatNumber(correction.channel2_snf),
      formatNumber(correction.channel2_clr),
      formatNumber(correction.channel2_temp),
      formatNumber(correction.channel2_water),
      formatNumber(correction.channel2_protein),
      '',  // Empty field before next channel (double pipe)
      '3',  // Channel 3
      formatNumber(correction.channel3_fat),
      formatNumber(correction.channel3_snf),
      formatNumber(correction.channel3_clr),
      formatNumber(correction.channel3_temp),
      formatNumber(correction.channel3_water),
      formatNumber(correction.channel3_protein)
    ].join('|');

    console.log(`📤 Returning correction data for machine ${machineId}: ${response.substring(0, 100)}...`);

    return ESP32ResponseHelper.createDataResponse(response);

  } catch (error) {
    console.error('❌ Error in GetLatestMachineCorrection API:', error);
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
