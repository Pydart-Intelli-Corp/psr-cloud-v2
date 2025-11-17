import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { requestLogger, extractRequestMetadata } from '@/lib/monitoring/requestLogger';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

interface RateChartDataResult {
  fat: string;
  snf: string;
  clr: string;
  rate: string;
}

interface RateChartResult {
  id: number;
  society_id: number;
  channel: string;
  file_name: string;
  shared_chart_id: number | null;
  uploaded_at: Date;
  status: number;
}

interface SocietyLookupResult {
  id: number;
}

/**
 * GetLatestPriceChart API Endpoint
 * 
 * Purpose: Retrieve rate chart data for a society/machine by channel with pagination
 * InputString format: societyId|machineType|version|machineId|channel|pageNumber
 * Example: bmc_301|DPST-W|LE2.00|Mm401|COW|C00001 (page 1)
 * Example: bmc_301|DPST-W|LE2.00|Mm401|COW|C00002 (page 2)
 * 
 * Response Format: "DD-MM-YYYY HH:mm:ss AM/PM||CHANNEL|fat|snf|clr|rate||CHANNEL|fat|snf|clr|rate||..."
 * 
 * Endpoint: GET/POST /api/[db-key]/PriceChartUpdation/GetLatestPriceChart
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

    // Parse input string format: bmc_301|DPST-W|LE2.00|Mm401|COW|C00001
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 6) {
      console.log(`❌ Invalid InputString format. Expected 6 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format. Expected: societyId|machineType|version|machineId|channel|pageNumber');
    }

    const [societyIdStr, machineType, machineModel, machineId, channel, pageParam] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, channel, pageParam });
    
    // PRIORITY 2: Validate Society ID and find actual database ID
    // Generate admin-specific schema name for society lookup
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    // Look up society using QueryBuilder
    const { query: societyQuery, replacements: societyReplacements } = QueryBuilder.buildSocietyLookupQuery(
      schemaName,
      societyIdStr
    );
    
    const [societyResults] = await sequelize.query(societyQuery, { replacements: societyReplacements });
    
    if (!Array.isArray(societyResults) || societyResults.length === 0) {
      console.log(`❌ No society found for society_id: "${societyIdStr}"`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

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

    // PRIORITY 5: Extract page number from C parameter (C00001 = page 1, C00002 = page 2, etc.)
    const pageNumber = parseInt(pageParam.replace(/^C0*/, '')) || 1;
    const pageSize = 10; // 10 records per page
    const offset = (pageNumber - 1) * pageSize;
    
    console.log(`🔍 Pagination: Page ${pageNumber}, Size ${pageSize}, Offset ${offset}`);
    
    if (pageNumber < 1) {
      console.log(`⚠️ Invalid page number: ${pageNumber}, using page 1`);
    }

    console.log(`🔍 Using schema: ${schemaName} for society: ${actualSocietyId}, channel: ${channelUpper}`);

    // PRIORITY 6: Find active rate chart for society and channel (status = 1)
    // AND check if this machine has NOT downloaded it yet
    const rateChartQuery = `
      SELECT 
        rc.id,
        rc.society_id,
        rc.channel,
        rc.file_name,
        rc.shared_chart_id,
        rc.uploaded_at,
        rc.status
      FROM \`${schemaName}\`.rate_charts rc
      LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
        ON dh.rate_chart_id = rc.id 
        AND dh.machine_id = ?
      WHERE rc.society_id = ? 
        AND rc.channel = ?
        AND rc.status = 1
        AND dh.id IS NULL
      ORDER BY rc.uploaded_at DESC
      LIMIT 1
    `;

    const [chartResults] = await sequelize.query(rateChartQuery, { 
      replacements: [machineData.id, actualSocietyId, channelUpper] 
    });
    const charts = chartResults as RateChartResult[];

    if (charts.length === 0) {
      console.log(`ℹ️ No rate chart found for society ${actualSocietyId}, channel ${channelUpper}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const chart = charts[0];
    console.log(`✅ Found rate chart: ${chart.file_name} (ID: ${chart.id}, Type: ${chart.shared_chart_id ? 'SHARED' : 'MASTER'})`);

    // Determine which chart ID to use for data lookup
    // If this is a shared chart, use the master chart's ID for data
    const dataChartId = chart.shared_chart_id || chart.id;
    if (chart.shared_chart_id) {
      console.log(`   📌 Using master chart ID ${dataChartId} for data lookup`);
    }
    
    const rateChartDataQuery = `
      SELECT 
        fat,
        snf,
        clr,
        rate
      FROM \`${schemaName}\`.rate_chart_data
      WHERE rate_chart_id = ?
      ORDER BY 
        CAST(fat AS DECIMAL(10,2)) ASC,
        CAST(snf AS DECIMAL(10,2)) ASC
      LIMIT ? OFFSET ?
    `;

    const [dataResults] = await sequelize.query(rateChartDataQuery, { 
      replacements: [dataChartId, pageSize, offset] 
    });
    const rateData = dataResults as RateChartDataResult[];

    console.log(`✅ Found ${rateData.length} rate chart records for chart ${chart.id} using data from chart ${dataChartId} (Page ${pageNumber}, Offset ${offset})`);

    if (rateData.length === 0) {
      // End of chart - no more data for this page
      console.log(`ℹ️ End of rate chart reached at page ${pageNumber}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Check if this is the last page (fewer than 10 records means end of chart)
    const isLastPage = rateData.length < pageSize;

    // PRIORITY 8: Format response
    // Format: "DD-MM-YYYY HH:mm:ss AM/PM||CHANNEL|fat|snf|clr|rate||CHANNEL|fat|snf|clr|rate||..."
    
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
    const formatNumber = (value: string): string => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return '0.00';
      }
      return num.toFixed(2);
    };

    const dateTimeStr = formatDateTime(chart.uploaded_at);
    
    // Build response data array
    const responseData = [dateTimeStr, ''];  // Start with datetime and empty field (double pipe)
    
    rateData.forEach((record) => {
      // Add channel and data
      responseData.push(channelUpper);
      responseData.push(formatNumber(record.fat));
      responseData.push(formatNumber(record.snf));
      responseData.push(formatNumber(record.clr));
      responseData.push(formatNumber(record.rate));
      
      // Add empty field after each record for double pipe separator
      responseData.push('');
    });

    // If this is the last page, append "Price chart not found." to indicate end
    if (isLastPage) {
      responseData.push('"Price chart not found."');
    }

    const response = responseData.join('|');

    console.log(`📤 Returning rate chart data for ${rateData.length} records (Page ${pageNumber}${isLastPage ? ' - LAST PAGE' : ''})`);
    console.log(`📤 Response format: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);

    // Wrap the entire response in double quotes
    const quotedResponse = `"${response}"`;

    return new Response(quotedResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Error in GetLatestPriceChart API:', error);
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
      console.log('🔔 Logging request to monitoring system:', {
        endpoint: 'PriceChartUpdation/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        statusCode: response.status,
        responseTime: endTime - startTime
      });
      
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'PriceChartUpdation/GetLatest',
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
      
      console.log('✅ Request logged successfully');
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
        endpoint: 'PriceChartUpdation/GetLatest',
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
        endpoint: 'PriceChartUpdation/GetLatest',
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
        endpoint: 'PriceChartUpdation/GetLatest',
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
