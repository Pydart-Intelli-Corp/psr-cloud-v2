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

interface MachineResult {
  id: number;
  machine_id: string;
  society_id: number;
}

/**
 * SaveMachineStatisticsFromMachine API Endpoint
 * 
 * Purpose: Save machine statistics data from ESP32 machines
 * InputString format: societyId|machineType|version|machineId|T30|D1|W1|S8|G2|ENABLE|D2025-11-15_12:31:04
 * 
 * Parameters:
 * - societyId: Society identifier (e.g., S-101)
 * - machineType: Machine type (e.g., LSE-SVWTBQ-12AH)
 * - version: Machine version (e.g., LE3.36)
 * - machineId: Machine identifier (e.g., MM223202)
 * - T30: Total tests count
 * - D1: Daily cleaning count
 * - W1: Weekly cleaning count
 * - S8: Cleaning skip count
 * - G2: Gain value
 * - ENABLE/DISABLE: Auto channel status
 * - D2025-11-15_12:31:04: Date and time stamp
 * 
 * Endpoint: GET/POST /api/[db-key]/MachineStatistics/SaveMachineStatisticsFromMachine
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
    console.log(`📊 SaveMachineStatisticsFromMachine API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate DB Key
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      console.log(`❌ DB Key validation failed`);
      return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
    }

    // Validate InputString is provided
    if (!inputString) {
      console.log(`❌ InputString is missing`);
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

    // Parse input string format: S-101|LSE-SVWTBQ-12AH|LE3.36|MM223202|T30|D1|W1|S8|G2|ENABLE|D2025-11-15_12:31:04
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 11) {
      console.log(`❌ Invalid InputString format. Expected 11 parts, got ${inputParts.length}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    const [
      societyIdStr, 
      machineType, 
      version, 
      machineId, 
      totalTestStr, 
      dailyCleaningStr, 
      weeklyCleaningStr, 
      cleaningSkipStr, 
      gainStr, 
      autoChannel, 
      dateTimeStr
    ] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { 
      societyIdStr, 
      machineType, 
      version, 
      machineId,
      totalTestStr,
      dailyCleaningStr,
      weeklyCleaningStr,
      cleaningSkipStr,
      gainStr,
      autoChannel,
      dateTimeStr
    });

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(societyIdStr);
    if (!societyValidation.isValid) {
      console.log(`❌ Invalid society ID: ${societyIdStr}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(machineId);
    if (!machineValidation.isValid) {
      console.log(`❌ Invalid machine ID: ${machineId}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid machine ID format');
    }

    // Parse statistics values
    const totalTest = parseInt(totalTestStr.substring(1)) || 0; // Remove 'T' prefix
    const dailyCleaning = parseInt(dailyCleaningStr.substring(1)) || 0; // Remove 'D' prefix
    const weeklyCleaning = parseInt(weeklyCleaningStr.substring(1)) || 0; // Remove 'W' prefix
    const cleaningSkip = parseInt(cleaningSkipStr.substring(1)) || 0; // Remove 'S' prefix
    const gain = parseInt(gainStr.substring(1)) || 0; // Remove 'G' prefix

    // Parse date and time from format: D2025-11-15_12:31:04
    const dateTimePart = dateTimeStr.substring(1); // Remove 'D' prefix
    const [datePart, timePart] = dateTimePart.split('_');
    const statisticsDate = datePart; // 2025-11-15
    const statisticsTime = timePart; // 12:31:04

    console.log(`📊 Parsed statistics:`, {
      totalTest,
      dailyCleaning,
      weeklyCleaning,
      cleaningSkip,
      gain,
      autoChannel,
      statisticsDate,
      statisticsTime
    });

    // Build schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    console.log(`🔍 Using schema: ${schemaName}`);

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
        societyIdStr
      );
      
      const [societyResults] = await sequelize.query(societyQuery, { replacements: societyReplacements });
      
      if (!Array.isArray(societyResults) || societyResults.length === 0) {
        console.log(`❌ Society not found: "${societyIdStr}"`);
        return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
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
      return ESP32ResponseHelper.createErrorResponse('Invalid machine ID');
    }
    
    const machineData = machineResults[0] as MachineResult;
    console.log(`✅ Found machine: "${machineId}" -> database ID: ${machineData.id}`);

    // Check if statistics already exist for today
    const checkQuery = `
      SELECT id FROM \`${schemaName}\`.machine_statistics 
      WHERE machine_id = ? AND DATE(created_at) = CURDATE()
      LIMIT 1
    `;

    const [existingResults] = await sequelize.query(checkQuery, {
      replacements: [machineData.id]
    });

    if (Array.isArray(existingResults) && existingResults.length > 0) {
      // Update existing record for today
      console.log(`📝 Updating today's statistics for machine ${machineData.id}`);
      
      const updateQuery = `
        UPDATE \`${schemaName}\`.machine_statistics 
        SET 
          society_id = ?,
          machine_type = ?,
          version = ?,
          total_test = ?,
          daily_cleaning = ?,
          weekly_cleaning = ?,
          cleaning_skip = ?,
          gain = ?,
          auto_channel = ?,
          statistics_date = ?,
          statistics_time = ?
        WHERE machine_id = ? AND DATE(created_at) = CURDATE()
      `;

      await sequelize.query(updateQuery, {
        replacements: [
          actualSocietyId,
          machineType,
          version,
          totalTest,
          dailyCleaning,
          weeklyCleaning,
          cleaningSkip,
          gain,
          autoChannel,
          statisticsDate,
          statisticsTime,
          machineData.id
        ]
      });

      console.log(`✅ Today's machine statistics updated successfully`);
    } else {
      // Insert new record for today
      console.log(`📝 Creating new statistics record for machine ${machineData.id}`);
      
      const insertQuery = `
        INSERT INTO \`${schemaName}\`.machine_statistics 
        (
          machine_id, 
          society_id, 
          machine_type, 
          version, 
          total_test, 
          daily_cleaning, 
          weekly_cleaning, 
          cleaning_skip, 
          gain, 
          auto_channel, 
          statistics_date, 
          statistics_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await sequelize.query(insertQuery, {
        replacements: [
          machineData.id,
          actualSocietyId,
          machineType,
          version,
          totalTest,
          dailyCleaning,
          weeklyCleaning,
          cleaningSkip,
          gain,
          autoChannel,
          statisticsDate,
          statisticsTime
        ]
      });

      console.log(`✅ New machine statistics created successfully`);
    }
    console.log(`${'='.repeat(80)}\n`);

    // Return success response
    return ESP32ResponseHelper.createDataResponse('Machine statistics saved successfully.');

  } catch (error) {
    console.error('❌ SaveMachineStatisticsFromMachine API Error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.log(`${'='.repeat(80)}\n`);
    
    return ESP32ResponseHelper.createErrorResponse('Failed to save machine statistics');
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
