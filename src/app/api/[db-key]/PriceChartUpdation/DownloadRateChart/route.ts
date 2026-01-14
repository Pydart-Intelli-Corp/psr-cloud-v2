import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
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

interface MachineResult {
  id: number;
  machine_id: string;
  society_id: number;
}

/**
 * DownloadRateChart API Endpoint
 * 
 * Purpose: Download rate chart data as CSV file
 * InputString format: societyId|machineType|version|machineId|channel
 * Example: S-101|LSE-SVWTBQ-12AH|LE3.36|MM223202|COW
 * 
 * Response: CSV file with headers: Clr,Fat,Snf,Rate
 * 
 * Endpoint: GET/POST /api/[db-key]/PriceChartUpdation/DownloadRateChart
 */

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // Extract InputString using helper
    let inputString = await ESP32ResponseHelper.extractInputString(request);
    
    // Await the params Promise
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    // Filter line endings from InputString
    if (inputString) {
      inputString = ESP32ResponseHelper.filterLineEndings(inputString);
    }

    // Log request
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📥 DownloadRateChart API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate DB Key
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      console.log(`❌ DB Key validation failed`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Validate InputString is provided
    if (!inputString) {
      console.log(`❌ InputString is missing`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Connect to database and validate DB Key
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Find admin by dbKey to get schema name
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found for DB Key: ${dbKey}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Parse input string format: S-101|LSE-SVWTBQ-12AH|LE3.36|MM223202|COW
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 5 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const [societyIdStr, machineType, machineModel, machineId, channel] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { 
      societyIdStr, 
      machineType, 
      machineModel, 
      machineId, 
      channel 
    });

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      console.log(`❌ Invalid society ID: ${societyIdStr}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      console.log(`❌ Invalid machine ID: ${machineId}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Validate Channel
    const channelUpper = channel.toUpperCase();
    if (!['COW', 'BUF', 'MIX'].includes(channelUpper)) {
      console.log(`❌ Invalid channel: "${channel}". Must be COW, BUF, or MIX`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Build schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    console.log(`🔍 Using schema: ${schemaName}`);

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

    // Look up machine to verify it exists
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    if (machineIdVariants.length === 0) {
      const machineIdCleaned = machineValidation.alphanumericId || machineValidation.numericId?.toString() || machineValidation.strippedId || '';
      machineIdVariants.push(machineIdCleaned);
    }
    
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const machineQuery = `
      SELECT id, machine_id, society_id 
      FROM \`${schemaName}\`.machines 
      WHERE machine_id IN (${placeholders}) AND (society_id = ? OR bmc_id IS NOT NULL)
      LIMIT 1
    `;
    
    const [machineResults] = await sequelize.query(machineQuery, { 
      replacements: [...machineIdVariants, actualSocietyId] 
    });
    
    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine not found: "${machineId}" for society ${actualSocietyId}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }
    
    const machineData = machineResults[0] as MachineResult;
    console.log(`✅ Found machine: "${machineId}" -> database ID: ${machineData.id}`);

    // Find active rate chart for this society/BMC and channel
    let chartQuery: string;
    let chartReplacements: any[];
    
    // Check if machine is BMC-assigned
    const machineTypeQuery = `SELECT bmc_id FROM \`${schemaName}\`.machines WHERE id = ? LIMIT 1`;
    const [machineTypeResults] = await sequelize.query(machineTypeQuery, {
      replacements: [machineData.id]
    });
    const machineInfo = machineTypeResults[0] as { bmc_id: number | null };
    
    if (machineInfo.bmc_id) {
      // BMC machine - check for BMC-assigned charts
      chartQuery = `
        SELECT id, society_id, bmc_id, channel, file_name, shared_chart_id, uploaded_at, status
        FROM \`${schemaName}\`.rate_charts
        WHERE bmc_id = ? AND channel = ? AND status = 1 AND is_bmc_assigned = 1
        ORDER BY uploaded_at DESC
        LIMIT 1
      `;
      chartReplacements = [machineInfo.bmc_id, channelUpper];
    } else {
      // Society machine - check for society-assigned charts
      chartQuery = `
        SELECT id, society_id, channel, file_name, shared_chart_id, uploaded_at, status
        FROM \`${schemaName}\`.rate_charts
        WHERE society_id = ? AND channel = ? AND status = 1
        ORDER BY uploaded_at DESC
        LIMIT 1
      `;
      chartReplacements = [actualSocietyId, channelUpper];
    }

    const [chartResults] = await sequelize.query(chartQuery, {
      replacements: chartReplacements
    });

    if (!Array.isArray(chartResults) || chartResults.length === 0) {
      console.log(`❌ No active rate chart found for society ${actualSocietyId}, channel ${channelUpper}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const chart = chartResults[0] as RateChartResult;
    console.log(`✅ Found rate chart: ${chart.file_name} (ID: ${chart.id}, Type: ${chart.shared_chart_id ? 'SHARED' : 'MASTER'})`);

    // Determine which chart ID to use for data lookup
    // If this is a shared chart, use the master chart's ID for data
    const dataChartId = chart.shared_chart_id || chart.id;
    if (chart.shared_chart_id) {
      console.log(`   📌 Using master chart ID ${dataChartId} for data lookup`);
    }

    // Check if machine already downloaded this chart for this channel
    const checkHistoryQuery = `
      SELECT id, downloaded_at
      FROM \`${schemaName}\`.rate_chart_download_history
      WHERE machine_id = ? AND rate_chart_id = ? AND channel = ?
      LIMIT 1
    `;

    const [historyResults] = await sequelize.query(checkHistoryQuery, {
      replacements: [machineData.id, chart.id, channelUpper]
    });

    if (Array.isArray(historyResults) && historyResults.length > 0) {
      console.log(`❌ Machine ${machineData.id} already downloaded chart ${chart.id} for channel ${channelUpper}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    // Fetch rate chart data using the master chart ID
    const dataQuery = `
      SELECT fat, snf, clr, rate
      FROM \`${schemaName}\`.rate_chart_data
      WHERE rate_chart_id = ?
      ORDER BY CAST(fat AS DECIMAL(10,2)) ASC, CAST(snf AS DECIMAL(10,2)) ASC
    `;

    const [dataResults] = await sequelize.query(dataQuery, {
      replacements: [dataChartId]
    });

    if (!Array.isArray(dataResults) || dataResults.length === 0) {
      console.log(`❌ No data found for rate chart: ${chart.file_name}`);
      return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
    }

    const chartData = dataResults as RateChartDataResult[];
    console.log(`✅ Found ${chartData.length} rate chart records`);

    // Record download history with channel
    try {
      const historyQuery = `
        INSERT INTO \`${schemaName}\`.rate_chart_download_history 
        (rate_chart_id, machine_id, society_id, channel, downloaded_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await sequelize.query(historyQuery, {
        replacements: [chart.id, machineData.id, actualSocietyId, channelUpper]
      });
      
      console.log(`✅ Recorded download history for machine ${machineData.id} channel ${channelUpper}`);
    } catch (historyError) {
      console.error(`⚠️ Failed to record download history:`, historyError);
      // Continue with download even if history recording fails
    }

    // Generate CSV content
    const csvLines: string[] = [];
    csvLines.push('Clr,Fat,Snf,Rate'); // Header

    chartData.forEach(row => {
      csvLines.push(`${row.clr},${row.fat},${row.snf},${row.rate}`);
    });

    // Add "Price chart not found." at the end
    csvLines.push('Price chart not found.');

    const csvContent = csvLines.join('\n');
    
    console.log(`📄 Generated CSV with ${chartData.length} records`);
    console.log(`✅ Download successful for machine ${machineId}`);
    console.log(`${'='.repeat(80)}\n`);

    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="PriceChart.csv"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('❌ DownloadRateChart API Error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.log(`${'='.repeat(80)}\n`);
    
    return ESP32ResponseHelper.createErrorResponse('Price chart not found.');
  }
}

// Export both GET and POST methods
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
