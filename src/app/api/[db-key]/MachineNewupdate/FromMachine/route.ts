import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

/**
 * MachineNewupdate FromMachine API Endpoint
 * 
 * Purpose: Check for machine firmware/software updates
 * Returns: Update availability status with timestamp
 * 
 * Endpoint: GET/POST /api/[db-key]/MachineNewupdate/FromMachine
 * 
 * Input Format: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09$0D$0A
 * - Part 1: Society ID (e.g., S-1)
 * - Part 2: Machine Type (e.g., LSE-SVPWTBQ-12AH)
 * - Part 3: Machine Model/Version (e.g., LE3.36)
 * - Part 4: Machine ID (e.g., Mm00001)
 * - Part 5: DateTime stamp (e.g., D2025-11-12_10:59:09)
 * 
 * Response Format: "DD-MM-YYYY HH:MM:SS AM/PM|Status"
 * Example: "06-11-2025 05:41:18 AM|No update"
 */

interface SocietyLookupResult {
  id: number;
}

interface MachineResult {
  id: number;
  machine_id: string;
  society_id: number;
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
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📡 MachineNewupdate FromMachine API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate DB Key
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse(dbKeyValidation.error || 'DB Key is required');
    }

    // Validate InputString is provided
    if (!inputString) {
      return ESP32ResponseHelper.createErrorResponse('InputString parameter is required');
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
      return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
    }

    // Parse input string format: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 5 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    const [societyIdStr, machineType, machineModel, machineId, datetime] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { 
      societyIdStr, 
      machineType, 
      machineModel, 
      machineId, 
      datetime 
    });

    // Validate components using InputValidator
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
    }

    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid machine ID format');
    }
    
    // Validate Society/BMC ID and find actual database ID
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
        return ESP32ResponseHelper.createErrorResponse('Invalid BMC ID');
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
        return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
      }
      
      actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
      console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);
    }

    // Get machine ID variants for matching
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    // Fallback: if variants is empty, create basic variants
    if (machineIdVariants.length === 0) {
      const machineIdCleaned = machineValidation.alphanumericId || machineValidation.numericId?.toString() || machineValidation.strippedId || '';
      machineIdVariants.push(machineIdCleaned);
    }
    
    console.log(`🔄 Machine ID conversion: "${machineId}" -> Variants: ${JSON.stringify(machineIdVariants)}`);
    
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
      // Still return a valid response format but with "No update" message
    }
    
    const machineData = machineResults.length > 0 ? machineResults[0] as MachineResult : null;
    if (machineData) {
      console.log(`✅ Found machine: "${machineId}" -> database ID: ${machineData.id}`);
    }

    // Parse datetime from input (format: D2025-11-12_10:59:09)
    // Extract date-time part after 'D' prefix
    let requestTimestamp = new Date();
    if (datetime && datetime.startsWith('D')) {
      try {
        const dateTimeStr = datetime.substring(1); // Remove 'D' prefix
        const [datePart, timePart] = dateTimeStr.split('_');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        
        requestTimestamp = new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day), 
          parseInt(hour), 
          parseInt(minute), 
          parseInt(second)
        );
        
        console.log(`📅 Parsed request timestamp: ${requestTimestamp.toISOString()}`);
      } catch {
        console.log(`⚠️ Failed to parse datetime: "${datetime}", using current time`);
      }
    }

    // Generate current timestamp in the required format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const hoursStr = String(hours).padStart(2, '0');
    
    const formattedTimestamp = `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;

    // Check for pending updates if machine was found
    const updateTypes: string[] = [];
    
    if (machineData) {
      try {
        // Check 1: Password updates (statusU = 1 or statusS = 1)
        const passwordCheckQuery = `
          SELECT statusU, statusS 
          FROM \`${schemaName}\`.machines 
          WHERE id = ?
          LIMIT 1
        `;
        const [passwordResults] = await sequelize.query(passwordCheckQuery, { 
          replacements: [machineData.id] 
        });
        
        if (Array.isArray(passwordResults) && passwordResults.length > 0) {
          const passwordStatus = passwordResults[0] as { statusU: number; statusS: number };
          if (passwordStatus.statusU === 1 || passwordStatus.statusS === 1) {
            updateTypes.push('password');
            console.log(`🔑 Password update available for machine ${machineData.id}`);
          }
        }

        // Check 2: Rate chart updates (status = 1 and not yet downloaded by this machine)
        // First check if machine is BMC-assigned or society-assigned
        const machineTypeQuery = `
          SELECT bmc_id, society_id FROM \`${schemaName}\`.machines WHERE id = ? LIMIT 1
        `;
        const [machineTypeResults] = await sequelize.query(machineTypeQuery, {
          replacements: [machineData.id]
        });
        
        const machineInfo = machineTypeResults[0] as { bmc_id: number | null; society_id: number | null };
        
        let chartCheckQuery: string;
        let chartReplacements: any[];
        
        if (machineInfo.bmc_id) {
          // BMC machine - check for BMC-assigned charts
          chartCheckQuery = `
            SELECT COUNT(*) as pending_charts
            FROM \`${schemaName}\`.rate_charts rc
            WHERE rc.bmc_id = ? 
              AND rc.is_bmc_assigned = 1
              AND rc.status = 1
              AND NOT EXISTS (
                SELECT 1 
                FROM \`${schemaName}\`.rate_chart_download_history rcdh
                WHERE rcdh.rate_chart_id = rc.id 
                  AND rcdh.machine_id = ?
              )
          `;
          chartReplacements = [machineInfo.bmc_id, machineData.id];
        } else {
          // Society machine - check for society-assigned charts
          chartCheckQuery = `
            SELECT COUNT(*) as pending_charts
            FROM \`${schemaName}\`.rate_charts rc
            WHERE rc.society_id = ? 
              AND rc.status = 1
              AND NOT EXISTS (
                SELECT 1 
                FROM \`${schemaName}\`.rate_chart_download_history rcdh
                WHERE rcdh.rate_chart_id = rc.id 
                  AND rcdh.machine_id = ?
              )
          `;
          chartReplacements = [actualSocietyId, machineData.id];
        }
        
        const [chartResults] = await sequelize.query(chartCheckQuery, { 
          replacements: chartReplacements
        });
        
        if (Array.isArray(chartResults) && chartResults.length > 0) {
          const chartStatus = chartResults[0] as { pending_charts: number };
          if (chartStatus.pending_charts > 0) {
            updateTypes.push('chart');
            console.log(`📊 Rate chart update available for machine ${machineData.id} (${chartStatus.pending_charts} pending)`);
          }
        }

        // Check 3: Machine correction updates (status = 1)
        const correctionCheckQuery = `
          SELECT status 
          FROM \`${schemaName}\`.machine_corrections 
          WHERE machine_id = ? AND status = 1
          LIMIT 1
        `;
        const [correctionResults] = await sequelize.query(correctionCheckQuery, { 
          replacements: [machineData.id] 
        });
        
        if (Array.isArray(correctionResults) && correctionResults.length > 0) {
          updateTypes.push('correction');
          console.log(`🔧 Correction update available for machine ${machineData.id}`);
        }

      } catch (checkError) {
        console.error('⚠️ Error checking for updates:', checkError);
        // Continue with "No update" if checks fail
      }
    }

    // Build response based on available updates
    let updateStatus: string;
    if (updateTypes.length > 0) {
      updateStatus = updateTypes.join(',');
      console.log(`✅ Updates available: ${updateStatus}`);
    } else {
      updateStatus = "No update";
      console.log(`ℹ️ No updates available`);
    }

    const responseText = `${formattedTimestamp}|${updateStatus}`;
    console.log(`✅ Response: "${responseText}"`);

    return ESP32ResponseHelper.createDataResponse(responseText);

  } catch (error) {
    console.error('❌ MachineNewupdate FromMachine API Error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.log(`${'='.repeat(80)}\n`);
    
    // Return error in the expected format with current timestamp
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    const formattedTimestamp = `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    const errorResponse = `${formattedTimestamp}|Error`;
    
    return ESP32ResponseHelper.createDataResponse(errorResponse);
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
