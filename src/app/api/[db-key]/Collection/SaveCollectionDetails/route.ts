import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { 
  ESP32ResponseHelper, 
  InputValidator 
} from '@/lib/external-api';
import { SectionPulseTracker } from '@/lib/sectionPulseTracker';

interface CollectionInput {
  societyId: string;
  machineType: string;
  version: string;
  machineId: string;
  session: string;      // EV (Evening) or MO (Morning)
  extra: string;        // Extra field (shift number or other data)
  channel: string;      // COW, BUFFALO, etc. (channel type)
  fat: number;          // F090.70 -> 90.70
  snf: number;          // S07.90 -> 7.90
  clr: number;          // C28.00 -> 28.00
  protein: number;      // P02.90 -> 2.90
  lactose: number;      // L04.30 -> 4.30
  salt: number;         // s00.65 -> 0.65
  water: number;        // W06.00 -> 6.00
  temperature: number;  // T26.47 -> 26.47
  farmerId: string;     // I00005 -> 5
  quantity: number;     // Q00000.00 -> 0.00
  totalAmount: number;  // R00000.00 -> 0.00
  rate: number;         // r033.60 -> 33.60
  bonus: number;        // i10.99 -> 10.99
  datetime: string;     // D2025-07-24_02:40:26
}

interface SocietyLookupResult {
  id: number;
}

interface MachineResult {
  id: number;
  machine_id: string;
}

/**
 * SaveCollectionDetails API Endpoint
 * 
 * Purpose: Save milk collection test data from machines
 * InputString format: societyId|machineType|version|machineId|session|extra|channel|
 *                     F{fat}|S{snf}|C{clr}|P{protein}|L{lactose}|s{salt}|W{water}|T{temp}|
 *                     I{farmerId}|Q{quantity}|R{totalAmount}|r{rate}|i{bonus}|D{datetime}
 * 
 * Example: S-1|LSE-SVPWTBQ-12AH|LE2.00|Mm1|EV|4|COW|F090.70|S07.90|C28.00|P02.90|L04.30|s00.65|W06.00|T26.47|I00005|Q00000.00|R00000.00|r033.60|i10.99|D2025-07-24_02:40:26
 * 
 * Endpoint: GET/POST /api/[db-key]/Collection/SaveCollectionDetails
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
    console.log(`📡 SaveCollectionDetails API Request:`);
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

    // Parse input string - 21 parts expected
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 21) {
      console.log(`❌ Invalid InputString format. Expected 21 parts, got ${inputParts.length}`);
      console.log(`   Parts received:`, inputParts);
      return ESP32ResponseHelper.createErrorResponse('Invalid InputString format');
    }

    const [
      societyIdStr,
      machineType,
      version,
      machineId,
      session,
      extra,
      channel,
      fatStr,
      snfStr,
      clrStr,
      proteinStr,
      lactoseStr,
      saltStr,
      waterStr,
      temperatureStr,
      farmerIdStr,
      quantityStr,
      totalAmountStr,
      rateStr,
      bonusStr,
      datetimeStr
    ] = inputParts;

    console.log(`🔍 Parsed InputString:`, {
      societyIdStr,
      machineType,
      version,
      machineId,
      session,
      extra,
      channel,
      farmerIdStr,
      datetime: datetimeStr
    });

    // Parse numeric values from formatted strings
    const parseValue = (str: string, prefix: string): number => {
      if (!str || !str.startsWith(prefix)) return 0;
      const numStr = str.substring(prefix.length);
      return parseFloat(numStr) || 0;
    };

    const collectionData: CollectionInput = {
      societyId: societyIdStr,
      machineType,
      version,
      machineId,
      session,
      extra,
      channel,
      fat: parseValue(fatStr, 'F'),
      snf: parseValue(snfStr, 'S'),
      clr: parseValue(clrStr, 'C'),
      protein: parseValue(proteinStr, 'P'),
      lactose: parseValue(lactoseStr, 'L'),
      salt: parseValue(saltStr, 's'),
      water: parseValue(waterStr, 'W'),
      temperature: parseValue(temperatureStr, 'T'),
      farmerId: farmerIdStr.substring(1).replace(/^0+/, '') || '0', // Remove 'I' prefix and leading zeros
      quantity: parseValue(quantityStr, 'Q'),
      totalAmount: parseValue(totalAmountStr, 'R'),
      rate: parseValue(rateStr, 'r'),
      bonus: parseValue(bonusStr, 'i'),
      datetime: datetimeStr.substring(1) // Remove 'D' prefix
    };

    console.log(`🔍 Parsed collection data:`, collectionData);

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(collectionData.societyId);
    if (!societyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(collectionData.machineId);
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
    
    const lookupResult = societyResults[0] as SocietyLookupResult & { type: string };
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
      console.log(`❌ Machine not found: "${collectionData.machineId}"`);
      return ESP32ResponseHelper.createErrorResponse('Machine not found');
    }
    
    const actualMachine = machineResults[0] as MachineResult & { bmc_id?: number; society_id?: number };
    console.log(`✅ Found machine: "${collectionData.machineId}" -> database ID: ${actualMachine.id}, bmc_id: ${actualMachine.bmc_id}, society_id: ${actualMachine.society_id}`);

    // Ensure machine has correct bmc_id if this is a BMC collection
    if (isBmc && !actualMachine.bmc_id) {
      console.log(`🔧 Updating machine ${actualMachine.id} to set bmc_id = ${actualSocietyId}`);
      await sequelize.query(
        `UPDATE \`${schemaName}\`.machines SET bmc_id = ? WHERE id = ?`,
        { replacements: [actualSocietyId, actualMachine.id] }
      );
    }

    console.log(`ℹ️  Farmer ID from input: "${collectionData.farmerId}"`);

    // Parse datetime: D2025-07-24_02:40:26 -> date: 2025-07-24, time: 02:40:26
    const datetimeParts = collectionData.datetime.split('_');
    const datePart = datetimeParts[0] || ''; // 2025-07-24
    const timePart = datetimeParts[1]?.replace(/-/g, ':') || '00:00:00'; // 02:40:26
    const formattedDate = datePart;
    const formattedTime = timePart;

    // Determine shift time (morning or evening)
    const shiftType = collectionData.session.toUpperCase() === 'EV' ? 'evening' : 'morning';
    
    // Use extra field as farmer name
    const farmerName = collectionData.extra || null;

    // Insert collection record
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.milk_collections (
        farmer_id,
        society_id,
        machine_id,
        collection_date,
        collection_time,
        shift_type,
        farmer_name,
        channel,
        fat_percentage,
        snf_percentage,
        clr_value,
        protein_percentage,
        lactose_percentage,
        salt_percentage,
        water_percentage,
        temperature,
        quantity,
        rate_per_liter,
        total_amount,
        bonus,
        machine_type,
        machine_version,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
      ON DUPLICATE KEY UPDATE
        farmer_name = VALUES(farmer_name),
        channel = VALUES(channel),
        fat_percentage = VALUES(fat_percentage),
        snf_percentage = VALUES(snf_percentage),
        clr_value = VALUES(clr_value),
        protein_percentage = VALUES(protein_percentage),
        lactose_percentage = VALUES(lactose_percentage),
        salt_percentage = VALUES(salt_percentage),
        water_percentage = VALUES(water_percentage),
        temperature = VALUES(temperature),
        quantity = VALUES(quantity),
        rate_per_liter = VALUES(rate_per_liter),
        total_amount = VALUES(total_amount),
        bonus = VALUES(bonus),
        machine_type = VALUES(machine_type),
        machine_version = VALUES(machine_version),
        updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
    `;

    const insertParams = [
      collectionData.farmerId,
      isBmc ? null : actualSocietyId,
      actualMachine.id,
      formattedDate,
      formattedTime,
      shiftType,
      farmerName,
      collectionData.channel,
      collectionData.fat,
      collectionData.snf,
      collectionData.clr,
      collectionData.protein,
      collectionData.lactose,
      collectionData.salt,
      collectionData.water,
      collectionData.temperature,
      collectionData.quantity,
      collectionData.rate,
      collectionData.totalAmount,
      collectionData.bonus,
      collectionData.machineType,
      collectionData.version
    ];

    console.log(`💾 Saving collection record (will insert or update if duplicate)...`);
    console.log(`   Farmer ID: ${collectionData.farmerId}`);
    console.log(`   Farmer Name: ${farmerName}`);
    console.log(`   Date: ${formattedDate}`);
    console.log(`   Time: ${formattedTime}`);
    console.log(`   Shift: ${shiftType}`);
    console.log(`   Channel: ${collectionData.channel}`);
    console.log(`   Fat: ${collectionData.fat}%, SNF: ${collectionData.snf}%`);
    console.log(`   Quantity: ${collectionData.quantity}L, Rate: ${collectionData.rate}, Total: ${collectionData.totalAmount}, Bonus: ${collectionData.bonus}`);

    const queryResult = await sequelize.query(insertQuery, { replacements: insertParams }) as any;
    
    // Check if this was a new insert or an update
    // For Sequelize raw queries with INSERT...ON DUPLICATE KEY UPDATE:
    // - Returns array [lastInsertId, affectedRows]
    // - affectedRows = 1 means INSERT (new record)
    // - affectedRows = 2 means UPDATE (duplicate key, existing record updated)
    const [lastInsertId, affectedRows] = queryResult;
    console.log(`📊 Query result - lastInsertId: ${lastInsertId}, affectedRows: ${affectedRows}`);
    
    const isNewCollection = affectedRows === 1;

    console.log(`✅ Collection record saved successfully${isNewCollection ? ' (new collection)' : ' (duplicate updated)'}`);

    // Update section pulse tracking
    try {
      const collectionDateTime = `${formattedDate} ${formattedTime}`;
      await SectionPulseTracker.updatePulseOnCollection(
        sequelize,
        schemaName,
        actualSocietyId,
        collectionDateTime,
        isNewCollection  // Pass flag to indicate if this is a new collection
      );
      console.log(`✅ Section pulse updated successfully`);
    } catch (pulseError) {
      // Log pulse tracking error but don't fail the collection save
      console.error(`⚠️ Failed to update section pulse:`, pulseError);
    }

    // Send email notification to farmer (if new collection and email exists)
    if (isNewCollection) {
      try {
        // Fetch farmer details including email and notification preference
        const farmerQuery = `
          SELECT f.name as farmer_name, f.email, f.email_notifications_enabled, s.name as society_name
          FROM \`${schemaName}\`.farmers f
          LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
          WHERE f.farmer_id = ?
          LIMIT 1
        `;
        
        const [farmerResults] = await sequelize.query(farmerQuery, {
          replacements: [collectionData.farmerId]
        });
        
        if (Array.isArray(farmerResults) && farmerResults.length > 0) {
          const farmerData = farmerResults[0] as any;
          
          console.log(`📧 Email check for farmer ${collectionData.farmerId}:`, {
            hasEmail: !!farmerData.email,
            email: farmerData.email,
            notificationSetting: farmerData.email_notifications_enabled,
            willSend: farmerData.email && farmerData.email.trim() !== '' && farmerData.email_notifications_enabled === 'ON'
          });
          
          // Only send email if: (1) email exists, (2) notifications are enabled
          if (farmerData.email && farmerData.email.trim() !== '' && 
              farmerData.email_notifications_enabled === 'ON') {
            console.log(`📧 Sending collection email to farmer ${collectionData.farmerId} at ${farmerData.email}`);
            
            // Import email service
            const { sendMilkCollectionEmail } = await import('@/lib/emailService');
            
            // Send email (don't await - send async)
            sendMilkCollectionEmail(
              farmerData.email,
              farmerData.farmer_name || farmerName || collectionData.farmerId,
              {
                farmerId: collectionData.farmerId,
                societyName: farmerData.society_name,
                collectionDate: formattedDate,
                collectionTime: formattedTime,
                shiftType: shiftType,
                channel: collectionData.channel,
                quantity: collectionData.quantity,
                fatPercentage: collectionData.fat,
                snfPercentage: collectionData.snf,
                clrValue: collectionData.clr,
                proteinPercentage: collectionData.protein,
                lactosePercentage: collectionData.lactose,
                waterPercentage: collectionData.water,
                temperature: collectionData.temperature,
                ratePerLiter: collectionData.rate,
                totalAmount: collectionData.totalAmount,
                bonus: collectionData.bonus
              }
            ).catch((emailError) => {
              // Log email error but don't fail the collection
              console.error(`⚠️ Failed to send collection email:`, emailError);
            });
            
            console.log(`✅ Collection email queued for sending`);
          } else {
            console.log(`ℹ️  No email address found for farmer ${collectionData.farmerId}`);
          }
        } else {
          console.log(`ℹ️  Farmer not found in database: ${collectionData.farmerId}`);
        }
      } catch (emailError) {
        // Log email error but don't fail the collection save
        console.error(`⚠️ Error processing collection email:`, emailError);
      }
    }

    console.log(`${'='.repeat(80)}\n`);

    // Return success response
    return ESP32ResponseHelper.createResponse('Collection details saved successfully.', {
      addQuotes: true
    });

  } catch (error) {
    console.error(`❌ Error in SaveCollectionDetails API:`, error);
    console.log(`${'='.repeat(80)}\n`);
    return ESP32ResponseHelper.createErrorResponse('Failed to save collection details');
  }
}

export const GET = handleRequest;
export const POST = handleRequest;

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
