import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator 
} from '@/lib/external-api';

interface DispatchInput {
  societyId: string;
  machineType: string;
  version: string;
  machineId: string;
  shift: string;
  extra: string;
  channel: string;
  fat: number;
  snf: number;
  clr: number;
  dispatchId: string;
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
 * SaveDispatchDetails API Endpoint
 * 
 * Purpose: Save milk dispatch data from machines
 * InputString format: societyId|machineType|version|machineId|shift|extra|channel|
 *                     F{fat}|S{snf}|C{clr}|I{dispatchId}|Q{quantity}|R{totalAmount}|r{rate}|D{datetime}
 * 
 * Example: S-1|LSE-SVPWTBQ-12AH|LE2.00|Mm1|MR|N|COW|F090.70|S07.90|C28.00|I001001|Q00010.00|R00059.70|r005.97|D2001-01-01_00:00:00
 * 
 * Endpoint: GET/POST /api/[db-key]/Dispatch/SaveDispatchDetails
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
    console.log(`📡 SaveDispatchDetails API Request:`);
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

    // Parse input string - 15 parts expected
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 15) {
      console.log(`❌ Invalid InputString format. Expected 15 parts, got ${inputParts.length}`);
      console.log(`   Parts received:`, inputParts);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    const [
      societyIdStr,
      machineType,
      version,
      machineId,
      shift,
      dispatchIdStr,
      extra,
      channel,
      fatStr,
      snfStr,
      clrStr,
      quantityStr,
      totalAmountStr,
      rateStr,
      datetimeStr
    ] = inputParts;

    console.log(`🔍 Parsed InputString:`, {
      societyIdStr,
      machineType,
      version,
      machineId,
      shift,
      extra,
      channel,
      dispatchIdStr,
      datetime: datetimeStr
    });

    // Parse numeric values from formatted strings
    const parseValue = (str: string, prefix: string): number => {
      if (!str || !str.startsWith(prefix)) return 0;
      const numStr = str.substring(prefix.length);
      return parseFloat(numStr) || 0;
    };

    const dispatchData: DispatchInput = {
      societyId: societyIdStr,
      machineType,
      version,
      machineId,
      shift,
      extra,
      channel,
      fat: parseValue(fatStr, 'F'),
      snf: parseValue(snfStr, 'S'),
      clr: parseValue(clrStr, 'C'),
      dispatchId: (dispatchIdStr?.substring(1) || '').replace(/^0+/, '') || '0', // Remove 'I' prefix and leading zeros
      quantity: parseValue(quantityStr, 'Q'),
      totalAmount: parseValue(totalAmountStr, 'R'),
      rate: parseValue(rateStr, 'r'),
      datetime: datetimeStr.substring(1) // Remove 'D' prefix
    };

    console.log(`🔍 Parsed dispatch data:`, dispatchData);

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(dispatchData.societyId);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(dispatchData.machineId);
    if (!machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid machine ID');
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🔍 Using schema: ${schemaName}`);

    // Look up society or BMC
    const societyQuery = `
      SELECT id, 'society' as type FROM \`${schemaName}\`.societies 
      WHERE society_id = ? OR society_id = ?
      UNION
      SELECT id, 'bmc' as type FROM \`${schemaName}\`.bmcs
      WHERE bmc_id = ? OR bmc_id = ?
      LIMIT 1
    `;
    
    const societyLookupParams = societyValidation.id.startsWith('S-') || societyValidation.id.startsWith('B-')
      ? [societyValidation.id, societyValidation.fallback, societyValidation.id, societyValidation.fallback]
      : [`S-${societyValidation.id}`, societyValidation.id, `B-${societyValidation.id}`, societyValidation.id];
    
    const [societyResults] = await sequelize.query(societyQuery, { replacements: societyLookupParams });
    
    if (!Array.isArray(societyResults) || societyResults.length === 0) {
      console.log(`❌ Society/BMC not found: "${societyValidation.id}"`);
      return ESP32ResponseHelper.createErrorResponse('Society/BMC not found');
    }
    
    const lookupResult = societyResults[0] as SocietyResult & { type: string };
    const actualSocietyId = lookupResult.id;
    const isBmc = lookupResult.type === 'bmc';
    console.log(`✅ Found ${isBmc ? 'BMC' : 'society'}: "${societyValidation.id}" -> database ID: ${actualSocietyId}`);

    // Look up machine - check society_id or bmc_id based on lookup result
    const machineIdVariants = (machineValidation.variants || []).map(v => String(v));
    
    if (machineIdVariants.length === 0) {
      const machineIdCleaned = machineValidation.alphanumericId || machineValidation.numericId?.toString() || '';
      machineIdVariants.push(machineIdCleaned);
    }
    
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const machineQuery = `
      SELECT id, machine_id, bmc_id, society_id 
      FROM \`${schemaName}\`.machines 
      WHERE ${isBmc ? 'bmc_id' : 'society_id'} = ? 
        AND machine_id IN (${placeholders})
      LIMIT 1
    `;
    
    const [machineResults] = await sequelize.query(machineQuery, { 
      replacements: [actualSocietyId, ...machineIdVariants]
    });
    
    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine not found: "${dispatchData.machineId}"`);
      return ESP32ResponseHelper.createErrorResponse('Machine not found');
    }
    
    const actualMachine = machineResults[0] as MachineResult & { bmc_id?: number; society_id?: number };
    console.log(`✅ Found machine: "${dispatchData.machineId}" -> database ID: ${actualMachine.id}, bmc_id: ${actualMachine.bmc_id}, society_id: ${actualMachine.society_id}`);

    // Ensure machine has correct bmc_id if this is a BMC dispatch
    if (isBmc && !actualMachine.bmc_id) {
      console.log(`🔧 Updating machine ${actualMachine.id} to set bmc_id = ${actualSocietyId}`);
      await sequelize.query(
        `UPDATE \`${schemaName}\`.machines SET bmc_id = ? WHERE id = ?`,
        { replacements: [actualSocietyId, actualMachine.id] }
      );
    }

    console.log(`ℹ️  Dispatch ID from input: "${dispatchData.dispatchId}"`);

    // Parse datetime: D2025-07-24_02:40:26 -> date: 2025-07-24, time: 02:40:26
    const datetimeParts = dispatchData.datetime.split('_');
    const datePart = datetimeParts[0] || ''; // 2025-07-24
    const timePart = datetimeParts[1]?.replace(/-/g, ':') || '00:00:00'; // 02:40:26
    const formattedDate = datePart;
    const formattedTime = timePart;

    // Determine shift time
    const shiftType = dispatchData.shift.toUpperCase() === 'MR' ? 'morning' : 
                      dispatchData.shift.toUpperCase() === 'EV' ? 'evening' : 'morning';

    // Insert dispatch record
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.milk_dispatches (
        dispatch_id,
        society_id,
        machine_id,
        dispatch_date,
        dispatch_time,
        shift_type,
        channel,
        fat_percentage,
        snf_percentage,
        clr_value,
        quantity,
        rate_per_liter,
        total_amount,
        machine_type,
        machine_version,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        channel = VALUES(channel),
        fat_percentage = VALUES(fat_percentage),
        snf_percentage = VALUES(snf_percentage),
        clr_value = VALUES(clr_value),
        quantity = VALUES(quantity),
        rate_per_liter = VALUES(rate_per_liter),
        total_amount = VALUES(total_amount),
        machine_type = VALUES(machine_type),
        machine_version = VALUES(machine_version),
        updated_at = NOW()
    `;

    const insertParams = [
      dispatchData.dispatchId,
      isBmc ? null : actualSocietyId,
      actualMachine.id,
      formattedDate,
      formattedTime,
      shiftType,
      dispatchData.channel,
      dispatchData.fat,
      dispatchData.snf,
      dispatchData.clr,
      dispatchData.quantity,
      dispatchData.rate,
      dispatchData.totalAmount,
      dispatchData.machineType,
      dispatchData.version
    ];

    console.log(`💾 Saving dispatch record (will insert or update if duplicate)...`);
    console.log(`   Dispatch ID: ${dispatchData.dispatchId}`);
    console.log(`   Date: ${formattedDate}`);
    console.log(`   Time: ${formattedTime}`);
    console.log(`   Shift: ${shiftType}`);
    console.log(`   Channel: ${dispatchData.channel}`);
    console.log(`   Fat: ${dispatchData.fat}%, SNF: ${dispatchData.snf}%, CLR: ${dispatchData.clr}`);
    console.log(`   Quantity: ${dispatchData.quantity}L, Rate: ${dispatchData.rate}, Total: ${dispatchData.totalAmount}`);

    await sequelize.query(insertQuery, { replacements: insertParams });

    console.log(`✅ Dispatch details saved successfully`);
    console.log(`${'='.repeat(80)}\n`);

    // Return success response
    return ESP32ResponseHelper.createResponse('Dispatch details saved successfully.', {
      addQuotes: true
    });

  } catch (error) {
    console.error(`❌ Error in SaveDispatchDetails API:`, error);
    console.log(`${'='.repeat(80)}\n`);
    return ESP32ResponseHelper.createErrorResponse('Failed to save dispatch details');
  }
}

export const GET = handleRequest;
export const POST = handleRequest;

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
