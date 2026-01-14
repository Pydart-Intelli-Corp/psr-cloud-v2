import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator 
} from '@/lib/external-api';

interface SalesInput {
  societyId: string;
  machineType: string;
  version: string;
  machineId: string;
  shiftType: string;
  count: string;
  channel: string;
  quantity: number;
  totalAmount: number;
  rate: number;
  datetime: string;
}

interface SocietyResult {
  id: number;
  society_id: string;
}

interface MachineResult {
  id: number;
  machine_id: string;
}

/**
 * SaveSalesDetails API Endpoint
 * 
 * Purpose: Save milk sales data from machines
 * InputString format: societyId|machineType|version|machineId|shiftType|count|channel|
 *                     Q{quantity}|R{totalAmount}|r{rate}|D{datetime}
 * 
 * Example: S-102|LSE-SVPWTBQ-12AH|LE3.36|Mm00101|EV|I4|COW|Q00100.00|R05500.00|r055.00|D2025-11-24_00:00:00
 * 
 * Endpoint: GET/POST /api/[db-key]/Sales/SaveSalesDetails
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
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📡 SaveSalesDetails API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    ESP32ResponseHelper.logRequest(request, dbKey, inputString);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return ESP32ResponseHelper.createErrorResponse('DB Key is required');
    }

    if (!inputString) {
      console.log(`❌ InputString is required`);
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

    // Parse input string - 10 or 11 parts expected
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 10 && inputParts.length !== 11) {
      console.log(`❌ Invalid InputString format. Expected 10 or 11 parts, got ${inputParts.length}`);
      console.log(`   Parts received:`, inputParts);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    // Handle both formats: with and without shift type
    let societyIdStr, machineType, version, machineId, shiftType, countStr, channel, quantityStr, totalAmountStr, rateStr, datetimeStr;
    
    if (inputParts.length === 11) {
      // Format: societyId|machineType|version|machineId|shiftType|count|channel|quantity|totalAmount|rate|datetime
      [societyIdStr, machineType, version, machineId, shiftType, countStr, channel, quantityStr, totalAmountStr, rateStr, datetimeStr] = inputParts;
    } else {
      // Format: societyId|machineType|version|machineId|count|channel|quantity|totalAmount|rate|datetime (no shift type)
      [societyIdStr, machineType, version, machineId, countStr, channel, quantityStr, totalAmountStr, rateStr, datetimeStr] = inputParts;
      shiftType = 'EV'; // Default to evening shift
    }

    console.log(`🔍 Parsed InputString (${inputParts.length} parts):`, {
      societyIdStr,
      machineType,
      version,
      machineId,
      shiftType: shiftType || 'EV (default)',
      countStr,
      channel,
      datetime: datetimeStr
    });

    // Parse numeric values from formatted strings
    const parseValue = (str: string, prefix: string): number => {
      if (!str || !str.startsWith(prefix)) return 0;
      const numStr = str.substring(prefix.length);
      return parseFloat(numStr) || 0;
    };

    const salesData: SalesInput = {
      societyId: societyIdStr,
      machineType,
      version,
      machineId,
      shiftType,
      count: (countStr?.substring(1) || '').replace(/^0+/, '') || '0', // Remove 'I' prefix and leading zeros
      channel,
      quantity: parseValue(quantityStr, 'Q'),
      totalAmount: parseValue(totalAmountStr, 'R'),
      rate: parseValue(rateStr, 'r'),
      datetime: datetimeStr.substring(1) // Remove 'D' prefix
    };

    console.log(`🔍 Parsed sales data:`, salesData);

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(salesData.societyId);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(salesData.machineId);
    if (!machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid machine ID');
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🔍 Using schema: ${schemaName}`);

    // Look up society or BMC
    const lookupQuery = `
      SELECT id, 'society' as type FROM \`${schemaName}\`.societies 
      WHERE society_id = ? OR society_id = ?
      UNION
      SELECT id, 'bmc' as type FROM \`${schemaName}\`.bmcs
      WHERE bmc_id = ? OR bmc_id = ?
      LIMIT 1
    `;
    
    const lookupParams = societyValidation.id.startsWith('S-') || societyValidation.id.startsWith('B-')
      ? [societyValidation.id, societyValidation.fallback, societyValidation.id, societyValidation.fallback]
      : [`S-${societyValidation.id}`, societyValidation.id, `B-${societyValidation.id}`, societyValidation.id];
    
    const [lookupResults] = await sequelize.query(lookupQuery, { replacements: lookupParams });
    
    if (!Array.isArray(lookupResults) || lookupResults.length === 0) {
      console.log(`❌ Society/BMC not found: "${societyValidation.id}"`);
      return ESP32ResponseHelper.createErrorResponse('Society/BMC not found');
    }
    
    const result = lookupResults[0] as { id: number; type: string };
    const isBMC = result.type === 'bmc';
    const actualSocietyId = isBMC ? null : result.id;
    const actualBmcId = isBMC ? result.id : null;
    console.log(`✅ Found ${isBMC ? 'BMC' : 'society'}: "${societyValidation.id}" -> database ID: ${result.id}`);

    // Look up machine
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    if (machineIdVariants.length === 0) {
      const machineIdCleaned = machineValidation.alphanumericId || machineValidation.numericId?.toString() || '';
      machineIdVariants.push(machineIdCleaned);
    }
    
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const machineQuery = isBMC
      ? `SELECT id, machine_id, bmc_id FROM \`${schemaName}\`.machines 
         WHERE bmc_id = ? AND machine_id IN (${placeholders})
         LIMIT 1`
      : `SELECT id, machine_id, society_id FROM \`${schemaName}\`.machines 
         WHERE society_id = ? AND machine_id IN (${placeholders})
         LIMIT 1`;
    
    const [machineResults] = await sequelize.query(machineQuery, { 
      replacements: [result.id, ...machineIdVariants]
    });
    
    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine not found: "${salesData.machineId}"`);
      return ESP32ResponseHelper.createErrorResponse('Machine not found');
    }
    
    const actualMachine = machineResults[0] as MachineResult & { bmc_id?: number; society_id?: number };
    console.log(`✅ Found machine: "${salesData.machineId}" -> database ID: ${actualMachine.id}, ${isBMC ? 'bmc_id' : 'society_id'}: ${result.id}`);

    // Auto-update machine's bmc_id if not set
    if (isBMC && !actualMachine.bmc_id) {
      console.log(`🔄 Auto-updating machine's bmc_id to ${actualBmcId}`);
      await sequelize.query(
        `UPDATE \`${schemaName}\`.machines SET bmc_id = ? WHERE id = ?`,
        { replacements: [actualBmcId, actualMachine.id] }
      );
    }

    console.log(`ℹ️  Sales count from input: "${salesData.count}"`);

    // Parse datetime: D2025-09-26_10:29: -> date: 2025-09-26, time: 10:29:00
    const datetimeParts = salesData.datetime.split('_');
    const datePart = datetimeParts[0] || ''; // 2025-09-26
    const timePart = (datetimeParts[1] || '00:00:').replace(/-/g, ':'); // 10:29:
    // Ensure time has seconds
    const timeComponents = timePart.split(':');
    const formattedTime = `${timeComponents[0] || '00'}:${timeComponents[1] || '00'}:${timeComponents[2] || '00'}`;
    const formattedDate = datePart;

    // Insert sales record
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.milk_sales (
        count,
        society_id,
        machine_id,
        sales_date,
        sales_time,
        shift_type,
        channel,
        quantity,
        rate_per_liter,
        total_amount,
        machine_type,
        machine_version,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        shift_type = VALUES(shift_type),
        channel = VALUES(channel),
        quantity = VALUES(quantity),
        rate_per_liter = VALUES(rate_per_liter),
        total_amount = VALUES(total_amount),
        machine_type = VALUES(machine_type),
        machine_version = VALUES(machine_version),
        updated_at = NOW()
    `;

    const insertParams = [
      salesData.count,
      actualSocietyId,
      actualMachine.id,
      formattedDate,
      formattedTime,
      salesData.shiftType,
      salesData.channel,
      salesData.quantity,
      salesData.rate,
      salesData.totalAmount,
      salesData.machineType,
      salesData.version
    ];

    console.log(`💾 Saving sales record (will insert or update if duplicate)...`);
    console.log(`   Count: ${salesData.count}`);
    console.log(`   ${isBMC ? 'BMC' : 'Society'} ID: ${result.id}`);
    console.log(`   Date: ${formattedDate}`);
    console.log(`   Time: ${formattedTime}`);
    console.log(`   Shift: ${salesData.shiftType}`);
    console.log(`   Channel: ${salesData.channel}`);
    console.log(`   Quantity: ${salesData.quantity}L, Rate: ${salesData.rate}, Total: ${salesData.totalAmount}`);

    await sequelize.query(insertQuery, { replacements: insertParams });

    console.log(`✅ Sales details saved successfully`);
    console.log(`${'='.repeat(80)}\n`);

    // Return success response
    return ESP32ResponseHelper.createResponse('Sales details saved successfully.', {
      addQuotes: true
    });

  } catch (error) {
    console.error(`❌ Error in SaveSalesDetails API:`, error);
    console.log(`${'='.repeat(80)}\n`);
    return ESP32ResponseHelper.createErrorResponse('Failed to save sales details');
  }
}

export const GET = handleRequest;
export const POST = handleRequest;

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
