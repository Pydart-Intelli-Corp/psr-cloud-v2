import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { requestLogger, extractRequestMetadata } from '@/lib/monitoring/requestLogger';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

interface SocietyLookupResult {
  id: number;
}

interface MachineResult {
  id: number;
  machine_id: string;
  society_id: number;
}

/**
 * SaveMachineCorrectionFromMachine API Endpoint
 * 
 * Purpose: Save machine correction values from ESP32/machine device
 * InputString format: societyId|machineType|version|machineId||channel|F±value|S±value|C±value|T±value|W±value|P±value|Dtimestamp
 * 
 * Channel mapping:
 * - ||1| = COW channel
 * - ||2| = BUF channel
 * - ||3| = MIX channel
 * 
 * Values format:
 * - F = Fat (e.g., F+0.16, F-0.10)
 * - S = SNF (Solid Not Fat) (e.g., S-1.00, S+0.50)
 * - C = CLR (Color) (e.g., C+0.00, C-0.20)
 * - T = Temperature (e.g., T+0.00, T-1.50)
 * - W = Water (e.g., W+00, W-05)
 * - P = Protein (e.g., P+0.00, P+1.25)
 * - D = Date/Timestamp (e.g., D2025-11-06_01:04:05)
 * 
 * Example: 2121|ECOD-G|LE2.00|M00000003||1|F+0.16|S-1.00|C+0.00|T+0.00|W+00|P+0.00|D2025-11-06_01:04:05
 * 
 * Endpoint: GET/POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionFromMachine
 */

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

    // Filter line endings from InputString
    if (inputString) {
      inputString = ESP32ResponseHelper.filterLineEndings(inputString);
    }

    // Log request
    console.log('\n' + '='.repeat(80));
    console.log('📥 SaveMachineCorrectionFromMachine API Request:');
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return ESP32ResponseHelper.createErrorResponse('DB Key is required');
    }

    if (!inputString) {
      return ESP32ResponseHelper.createErrorResponse('InputString parameter is required');
    }

    // Connect to database and validate DB Key
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

    // Parse input string: societyId|machineType|version|machineId||channel|F±value|S±value|C±value|T±value|W±value|P±value|Dtimestamp
    const inputParts = inputString.split('|');
    
    if (inputParts.length < 13) {
      console.log(`❌ Invalid InputString format. Expected at least 13 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    const [societyIdStr, machineType, machineModel, machineId, , channelStr, fatStr, snfStr, clrStr, tempStr, waterStr, proteinStr, timestampStr] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { 
      societyIdStr, 
      machineType, 
      machineModel, 
      machineId, 
      channelStr,
      fatStr,
      snfStr,
      clrStr,
      tempStr,
      waterStr,
      proteinStr,
      timestampStr
    });

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    // Validate and find society
    const { query: societyQuery, replacements: societyReplacements } = QueryBuilder.buildSocietyLookupQuery(
      schemaName,
      societyIdStr
    );
    
    const [societyResults] = await sequelize.query(societyQuery, { replacements: societyReplacements });
    
    if (!Array.isArray(societyResults) || societyResults.length === 0) {
      console.log(`❌ Society not found: "${societyIdStr}"`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction save failed.');
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

    // Validate and find machine
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      console.log(`❌ Invalid machine ID: "${machineId}"`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction save failed.');
    }
    
    const parsedMachineId = machineValidation.numericId;
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    console.log(`🔄 Machine ID conversion: "${machineId}" -> parsed: ${parsedMachineId}, variants: [${machineIdVariants.join(', ')}]`);

    // Find machine
    let machineQuery: string;
    let machineReplacements: (string | number)[];
    
    if (parsedMachineId !== null && parsedMachineId !== undefined) {
      machineQuery = `
        SELECT id, machine_id, society_id 
        FROM \`${schemaName}\`.machines
        WHERE id = ? AND society_id = ?
        LIMIT 1
      `;
      machineReplacements = [parsedMachineId, actualSocietyId];
    } else {
      const placeholders = machineIdVariants.map(() => '?').join(', ');
      machineQuery = `
        SELECT id, machine_id, society_id
        FROM \`${schemaName}\`.machines
        WHERE machine_id IN (${placeholders}) AND society_id = ?
        LIMIT 1
      `;
      machineReplacements = [...machineIdVariants, actualSocietyId];
    }

    const [machineResults] = await sequelize.query(machineQuery, {
      replacements: machineReplacements
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine not found: "${machineId}" for society ${actualSocietyId}`);
      return ESP32ResponseHelper.createErrorResponse('Machine correction save failed.');
    }
    
    const machineData = machineResults[0] as MachineResult;
    console.log(`✅ Found machine: "${machineId}" -> database ID: ${machineData.id}`);

    // Map channel number to channel name
    const channelNum = parseInt(channelStr);
    let channelName: 'COW' | 'BUF' | 'MIX';
    
    switch (channelNum) {
      case 1:
        channelName = 'COW';
        break;
      case 2:
        channelName = 'BUF';
        break;
      case 3:
        channelName = 'MIX';
        break;
      default:
        console.log(`❌ Invalid channel: ${channelStr}`);
        return ESP32ResponseHelper.createErrorResponse('Invalid channel number');
    }
    
    console.log(`🔍 Channel mapping: ${channelStr} -> ${channelName}`);

    // Parse correction values (format: F+0.16, S-1.00, etc.)
    const parseValue = (str: string): number => {
      // Remove the first character (F, S, C, T, W, P, D) and parse the number
      const valueStr = str.substring(1).replace(/\+/g, '');
      const value = parseFloat(valueStr);
      return isNaN(value) ? 0.00 : value;
    };

    const fat = parseValue(fatStr);
    const snf = parseValue(snfStr);
    const clr = parseValue(clrStr);
    const temp = parseValue(tempStr);
    const water = parseValue(waterStr);
    const protein = parseValue(proteinStr);

    console.log(`📊 Parsed correction values:`, {
      channel: channelName,
      fat,
      snf,
      clr,
      temp,
      water,
      protein
    });

    // Check if correction already exists for this machine TODAY
    // If same day: UPDATE, if different day: INSERT new record
    const checkQuery = `
      SELECT id, DATE(created_at) as created_date FROM \`${schemaName}\`.machine_corrections
      WHERE machine_id = ? AND society_id = ?
      AND DATE(created_at) = CURDATE()
      LIMIT 1
    `;

    const [existingRecords] = await sequelize.query(checkQuery, {
      replacements: [machineData.id, actualSocietyId]
    });

    if (Array.isArray(existingRecords) && existingRecords.length > 0) {
      // Update existing record for TODAY
      const updateQuery = `
        UPDATE \`${schemaName}\`.machine_corrections
        SET 
          machine_type = ?,
          channel${channelNum}_fat = ?,
          channel${channelNum}_snf = ?,
          channel${channelNum}_clr = ?,
          channel${channelNum}_temp = ?,
          channel${channelNum}_water = ?,
          channel${channelNum}_protein = ?,
          status = 1,
          updated_at = NOW()
        WHERE machine_id = ? AND society_id = ? AND DATE(created_at) = CURDATE()
      `;

      await sequelize.query(updateQuery, {
        replacements: [
          machineType,
          fat,
          snf,
          clr,
          temp,
          water,
          protein,
          machineData.id,
          actualSocietyId
        ]
      });

      console.log(`✅ Updated today's correction for machine ${machineData.id}, channel ${channelName}`);
    } else {
      // Insert new record for NEW DAY
      const insertQuery = `
        INSERT INTO \`${schemaName}\`.machine_corrections
        (machine_id, society_id, machine_type, 
         channel${channelNum}_fat, channel${channelNum}_snf, channel${channelNum}_clr,
         channel${channelNum}_temp, channel${channelNum}_water, channel${channelNum}_protein,
         status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `;

      await sequelize.query(insertQuery, {
        replacements: [
          machineData.id,
          actualSocietyId,
          machineType,
          fat,
          snf,
          clr,
          temp,
          water,
          protein
        ]
      });

      console.log(`✅ Inserted new daily correction for machine ${machineData.id}, channel ${channelName}`);
    }

    console.log(`✅ Machine correction saved successfully`);

    return ESP32ResponseHelper.createDataResponse('Machine correction saved successfully.');

  } catch (error) {
    console.error('❌ Error in SaveMachineCorrectionFromMachine API:', error);
    return ESP32ResponseHelper.createErrorResponse('Machine correction save failed.');
  }
}

// Export GET handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const startTime = Date.now();
  try {
    const response = await handleRequest(request, context);
    const endTime = Date.now();
    
    // Log request
    try {
      const metadata = extractRequestMetadata(request.url);
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'MachineCorrection/SaveFromMachine',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: response.status,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        category: 'external',
      });
    } catch (logError) {
      console.error('❌ Failed to log request:', logError);
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    try {
      const metadata = extractRequestMetadata(request.url);
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'MachineCorrection/SaveFromMachine',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: 500,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        error: errorMsg,
        category: 'external',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return ESP32ResponseHelper.createErrorResponse('Machine correction save failed.');
  }
}

// Export POST handler
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return GET(request, context);
}
