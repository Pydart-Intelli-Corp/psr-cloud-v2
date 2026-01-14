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

/**
 * SavePriceChartUpdationHistory API Endpoint
 * 
 * Purpose: Mark rate chart as downloaded by machine (set status = 0)
 * InputString format: societyId|machineType|version|machineId|channel
 * Example: bmc_301|DPST-W|LE2.00|Mm401|COW
 * 
 * Endpoint: GET/POST /api/[db-key]/PriceChartUpdation/SavePriceChartUpdationHistory
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
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return ESP32ResponseHelper.createErrorResponse('DB Key is required');
    }

    if (!inputString) {
      return ESP32ResponseHelper.createErrorResponse('InputString parameter is required');
    }

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

    // Parse input string format: bmc_301|DPST-W|LE2.00|Mm401|COW
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 5 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format. Expected: societyId|machineType|version|machineId|channel');
    }

    const [societyIdStr, machineType, machineModel, machineId, channel] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, channel });
    
    // PRIORITY 2: Validate Society/BMC ID and find actual database ID
    // Generate admin-specific schema name for society lookup
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
        return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
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
        return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
      }
      
      actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    }

    // PRIORITY 3: Validate Machine ID and verify it's registered under this society
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      console.log(`❌ Invalid machine ID: "${machineId}" - ${machineValidation.error}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }
    
    const parsedMachineId = machineValidation.numericId;
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    console.log(`🔍 Machine ID parsing: "${machineId}" -> ${parsedMachineId || machineIdVariants.join(', ')}`);

    // Verify machine is registered under this society
    let verifyMachineQuery: string;
    let verifyReplacements: (string | number)[];
    
    if (parsedMachineId !== null && parsedMachineId !== undefined) {
      // Numeric machine ID - use direct matching by id
      verifyMachineQuery = `
        SELECT id, machine_id, society_id
        FROM \`${schemaName}\`.machines 
        WHERE id = ? AND society_id = ? AND status = 'active'
        LIMIT 1
      `;
      verifyReplacements = [parsedMachineId, actualSocietyId];
    } else {
      // Alphanumeric machine ID - use variant matching by machine_id string
      const placeholders = machineIdVariants.map(() => '?').join(', ');
      verifyMachineQuery = `
        SELECT id, machine_id, society_id
        FROM \`${schemaName}\`.machines 
        WHERE machine_id IN (${placeholders}) AND society_id = ? AND status = 'active'
        LIMIT 1
      `;
      verifyReplacements = [...machineIdVariants, actualSocietyId];
    }

    const [machineResults] = await sequelize.query(verifyMachineQuery, { 
      replacements: verifyReplacements
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine "${machineId}" not registered under society ${actualSocietyId}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const machineData = machineResults[0] as { id: number; machine_id: string; society_id: number };
    console.log(`✅ Verified machine: "${machineData.machine_id}" (ID: ${machineData.id}) registered under society ${actualSocietyId}`);

    // PRIORITY 4: Validate Channel
    const channelUpper = channel.toUpperCase();
    if (!['COW', 'BUF', 'MIX'].includes(channelUpper)) {
      console.log(`❌ Invalid channel: "${channel}". Must be COW, BUF, or MIX`);
      return ESP32ResponseHelper.createErrorResponse('Invalid channel. Must be COW, BUF, or MIX');
    }

    console.log(`🔍 Using schema: ${schemaName} for society: ${actualSocietyId}, channel: ${channelUpper}`);

    // PRIORITY 5: Find the active rate chart for this society and channel
    const findChartQuery = `
      SELECT id 
      FROM \`${schemaName}\`.rate_charts 
      WHERE society_id = ? AND channel = ? AND status = 1
      ORDER BY uploaded_at DESC
      LIMIT 1
    `;

    const [chartResults] = await sequelize.query(findChartQuery, { 
      replacements: [actualSocietyId, channelUpper] 
    });

    if (!Array.isArray(chartResults) || chartResults.length === 0) {
      console.log(`❌ No active rate chart found for society ${actualSocietyId}, channel ${channelUpper}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const rateChartId = (chartResults[0] as { id: number }).id;

    // Check if machine already downloaded this chart for this channel
    const checkHistoryQuery = `
      SELECT id 
      FROM \`${schemaName}\`.rate_chart_download_history 
      WHERE machine_id = ? AND rate_chart_id = ? AND channel = ?
      LIMIT 1
    `;

    const [historyResults] = await sequelize.query(checkHistoryQuery, { 
      replacements: [machineData.id, rateChartId, channelUpper] 
    });

    if (Array.isArray(historyResults) && historyResults.length > 0) {
      console.log(`ℹ️ Machine ${machineData.id} already downloaded chart ${rateChartId} for channel ${channelUpper}`);
      return ESP32ResponseHelper.createDataResponse('Price chart history saved successfully.');
    }

    // Insert download history record for this machine
    const insertHistoryQuery = `
      INSERT INTO \`${schemaName}\`.rate_chart_download_history 
      (rate_chart_id, machine_id, society_id, channel, downloaded_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    await sequelize.query(insertHistoryQuery, { 
      replacements: [rateChartId, machineData.id, actualSocietyId, channelUpper] 
    });

    console.log(`✅ Recorded download history for machine ${machineData.id}, chart ${rateChartId}`);

    // Return success response
    return ESP32ResponseHelper.createDataResponse('Price chart history saved successfully.');

  } catch (error) {
    console.error('❌ Error in SavePriceChartUpdationHistory API:', error);
    return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
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
        endpoint: 'PriceChartUpdation/SaveHistory',
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
        endpoint: 'PriceChartUpdation/SaveHistory',
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
    
    throw error;
  }
}

// Export POST handler
export async function POST(
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
        endpoint: 'PriceChartUpdation/SaveHistory',
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
      console.error('Failed to log request:', logError);
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
        endpoint: 'PriceChartUpdation/SaveHistory',
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
    
    throw error;
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
