import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

interface LocalReading {
  timestamp: string;           // ISO string from local storage
  collection_date: string;     // YYYY-MM-DD
  collection_time: string;     // HH:MM:SS
  farmer_id: string;
  shift: string;               // MR or EV
  channel: string;             // CH1, CH2, CH3 or COW, BUFFALO, MIXED
  fat: number;
  snf: number;
  clr: number;
  protein: number;
  lactose: number;
  salt: number;
  water: number;
  temperature: number;
  quantity: number;
  rate: number;
  total_amount: number;
  bonus: number;
  machine_id: string;
  local_id?: string;           // Unique local identifier for tracking
}

interface SyncRequest {
  readings: LocalReading[];
  checkOnly?: boolean;  // If true, only check for duplicates without inserting
}

/**
 * POST /api/external/reports/collections/sync
 * 
 * Sync local readings from mobile app to cloud
 * - Receives array of local readings
 * - Checks for duplicates based on farmer_id, collection_date, collection_time, machine_id
 * - Inserts new records
 * - Returns sync status for each record
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization token required', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id, role, schemaName } = decoded;

    if (role !== 'society') {
      return createErrorResponse('Only society users can sync collections', 403, undefined, corsHeaders);
    }

    const body: SyncRequest = await request.json();
    const { readings, checkOnly = false } = body;

    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return createErrorResponse('No readings provided', 400, undefined, corsHeaders);
    }

    const mode = checkOnly ? 'check-only' : 'full-sync';
    console.log(`📤 Sync request received: ${readings.length} readings for society ${id} (mode: ${mode})`);

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get machine ID for this society
    const machineQuery = `
      SELECT id, machine_id 
      FROM \`${schemaName}\`.machines 
      WHERE society_id = ?
      LIMIT 10
    `;
    const [machines] = await sequelize.query(machineQuery, { replacements: [id] }) as [any[], any];
    
    const machineMap = new Map<string, number>();
    machines.forEach((m: any) => {
      // Store various formats of machine ID
      machineMap.set(m.machine_id, m.id);
      machineMap.set(m.machine_id.replace(/^M/, ''), m.id);
      machineMap.set(m.machine_id.replace(/^0+/, ''), m.id);
    });

    const results: { local_id: string; status: 'synced' | 'duplicate' | 'error'; message?: string; details?: any }[] = [];
    let syncedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const reading of readings) {
      try {
        // Map channel format
        let channel = reading.channel?.toUpperCase() || 'COW';
        if (channel === 'CH1') channel = 'COW';
        else if (channel === 'CH2') channel = 'BUFFALO';
        else if (channel === 'CH3') channel = 'MIXED';

        // Map shift format
        const shiftType = reading.shift?.toUpperCase() === 'MR' || reading.shift?.toUpperCase() === 'MORNING' 
          ? 'morning' 
          : 'evening';

        // Find machine database ID
        let machineDbId = machineMap.get(reading.machine_id);
        if (!machineDbId) {
          machineDbId = machineMap.get(reading.machine_id.replace(/^M/, ''));
        }
        if (!machineDbId) {
          machineDbId = machineMap.get(reading.machine_id.replace(/^0+/, ''));
        }
        
        if (!machineDbId && machines.length > 0) {
          // Use first machine if no match found
          machineDbId = machines[0].id;
        }

        if (!machineDbId) {
          results.push({
            local_id: reading.local_id || reading.timestamp,
            status: 'error',
            message: 'Machine not found'
          });
          errorCount++;
          continue;
        }

        // Normalize farmer_id to match machine format (strip leading zeros)
        // Machine sends "I000000" → "0", app sends "000000"
        // This ensures duplicate detection works correctly
        const normalizedFarmerId = reading.farmer_id.replace(/^0+/, '') || '0';
        
        if (reading.farmer_id !== normalizedFarmerId) {
          console.log(`🔄 Farmer ID normalized: "${reading.farmer_id}" → "${normalizedFarmerId}"`);
        }

        // Round values to 2 decimal places for comparison
        const fatRounded = Math.round((reading.fat || 0) * 100) / 100;
        const snfRounded = Math.round((reading.snf || 0) * 100) / 100;
        const clrRounded = Math.round((reading.clr || 0) * 100) / 100;
        const proteinRounded = Math.round((reading.protein || 0) * 100) / 100;
        const lactoseRounded = Math.round((reading.lactose || 0) * 100) / 100;
        const saltRounded = Math.round((reading.salt || 0) * 100) / 100;
        const waterRounded = Math.round((reading.water || 0) * 100) / 100;
        const tempRounded = Math.round((reading.temperature || 0) * 100) / 100;
        const qtyRounded = Math.round((reading.quantity || 0) * 100) / 100;

        // Check for duplicate with comprehensive matching
        // This prevents duplicate syncing when machine also pushes via WiFi
        // Match criteria: farmer_id, society_id, machine_id, date, and ALL quality parameters (2 decimal precision)
        const duplicateQuery = `
          SELECT id, collection_time, fat_percentage, snf_percentage, clr_value,
                 ROUND(fat_percentage, 2) as fat_r, 
                 ROUND(snf_percentage, 2) as snf_r, 
                 ROUND(clr_value, 2) as clr_r,
                 ROUND(protein_percentage, 2) as protein_r,
                 ROUND(lactose_percentage, 2) as lactose_r,
                 ROUND(salt_percentage, 2) as salt_r,
                 ROUND(water_percentage, 2) as water_r,
                 ROUND(temperature, 2) as temp_r,
                 ROUND(quantity, 2) as qty_r
          FROM \`${schemaName}\`.milk_collections 
          WHERE society_id = ? 
            AND farmer_id = ? 
            AND machine_id = ?
            AND collection_date = ? 
            AND ROUND(fat_percentage, 2) = ?
            AND ROUND(snf_percentage, 2) = ?
            AND ROUND(clr_value, 2) = ?
            AND ROUND(protein_percentage, 2) = ?
            AND ROUND(lactose_percentage, 2) = ?
            AND ROUND(salt_percentage, 2) = ?
            AND ROUND(water_percentage, 2) = ?
            AND ROUND(temperature, 2) = ?
            AND ROUND(quantity, 2) = ?
          LIMIT 1
        `;
        const [duplicates] = await sequelize.query(duplicateQuery, {
          replacements: [
            id, normalizedFarmerId, machineDbId, reading.collection_date,
            fatRounded, snfRounded, clrRounded, proteinRounded, lactoseRounded,
            saltRounded, waterRounded, tempRounded, qtyRounded
          ]
        }) as [any[], any];

        if (duplicates.length > 0) {
          console.log(`🔍 Duplicate detected:`);
          console.log(`   Farmer: ${normalizedFarmerId} (original: ${reading.farmer_id})`);
          console.log(`   Date: ${reading.collection_date}`);
          console.log(`   Request Time: ${reading.collection_time}`);
          console.log(`   DB Time: ${duplicates[0].collection_time}`);
          console.log(`   All Parameters Match (2 decimal precision):`);
          console.log(`     FAT: ${fatRounded} = ${duplicates[0].fat_r}`);
          console.log(`     SNF: ${snfRounded} = ${duplicates[0].snf_r}`);
          console.log(`     CLR: ${clrRounded} = ${duplicates[0].clr_r}`);
          console.log(`     Protein: ${proteinRounded} = ${duplicates[0].protein_r}`);
          console.log(`     Lactose: ${lactoseRounded} = ${duplicates[0].lactose_r}`);
          console.log(`     Salt: ${saltRounded} = ${duplicates[0].salt_r}`);
          console.log(`     Water: ${waterRounded} = ${duplicates[0].water_r}`);
          console.log(`     Temperature: ${tempRounded} = ${duplicates[0].temp_r}`);
          console.log(`     Quantity: ${qtyRounded} = ${duplicates[0].qty_r}`);
          results.push({
            local_id: reading.local_id || reading.timestamp,
            status: 'duplicate',
            message: `Already exists: ${reading.collection_date}`,
            details: {
              farmer_id: normalizedFarmerId,
              values: { 
                fat: fatRounded, snf: snfRounded, clr: clrRounded,
                protein: proteinRounded, lactose: lactoseRounded,
                salt: saltRounded, water: waterRounded,
                temperature: tempRounded, quantity: qtyRounded
              }
            }
          });
          duplicateCount++;
          continue;
        }

        // DEBUG: Show why no duplicate found - check what exists in DB for this farmer/date
        console.log(`🔍 No duplicate found, checking what exists in DB:`);
        console.log(`   Searching for: Farmer=${normalizedFarmerId}, Date=${reading.collection_date}`);
        console.log(`   Request Values (2 decimal precision):`);
        console.log(`     FAT=${fatRounded}, SNF=${snfRounded}, CLR=${clrRounded}`);
        console.log(`     Protein=${proteinRounded}, Lactose=${lactoseRounded}, Salt=${saltRounded}`);
        console.log(`     Water=${waterRounded}, Temp=${tempRounded}, Qty=${qtyRounded}`);
        
        const debugQuery = `
          SELECT farmer_id, collection_date, collection_time, 
                 fat_percentage, snf_percentage, clr_value,
                 protein_percentage, lactose_percentage, salt_percentage,
                 water_percentage, temperature, quantity,
                 ROUND(fat_percentage, 2) as fat_r,
                 ROUND(snf_percentage, 2) as snf_r,
                 ROUND(clr_value, 2) as clr_r,
                 ROUND(protein_percentage, 2) as protein_r,
                 ROUND(lactose_percentage, 2) as lactose_r,
                 ROUND(salt_percentage, 2) as salt_r,
                 ROUND(water_percentage, 2) as water_r,
                 ROUND(temperature, 2) as temp_r,
                 ROUND(quantity, 2) as qty_r
          FROM \`${schemaName}\`.milk_collections 
          WHERE society_id = ? 
            AND farmer_id = ? 
            AND collection_date = ?
          LIMIT 5
        `;
        const [existingRecords] = await sequelize.query(debugQuery, {
          replacements: [id, normalizedFarmerId, reading.collection_date]
        }) as [any[], any];
        
        if (existingRecords.length > 0) {
          console.log(`   📊 Found ${existingRecords.length} existing record(s) for this farmer on this date:`);
          existingRecords.forEach((rec: any, idx: number) => {
            console.log(`   [${idx + 1}] Time: ${rec.collection_time}`);
            console.log(`       FAT=${rec.fat_r}, SNF=${rec.snf_r}, CLR=${rec.clr_r}`);
            console.log(`       Protein=${rec.protein_r}, Lactose=${rec.lactose_r}, Salt=${rec.salt_r}`);
            console.log(`       Water=${rec.water_r}, Temp=${rec.temp_r}, Qty=${rec.qty_r}`);
            
            // Show which parameters don't match
            const mismatches = [];
            if (rec.fat_r !== fatRounded) mismatches.push(`FAT(${rec.fat_r}≠${fatRounded})`);
            if (rec.snf_r !== snfRounded) mismatches.push(`SNF(${rec.snf_r}≠${snfRounded})`);
            if (rec.clr_r !== clrRounded) mismatches.push(`CLR(${rec.clr_r}≠${clrRounded})`);
            if (rec.protein_r !== proteinRounded) mismatches.push(`Protein(${rec.protein_r}≠${proteinRounded})`);
            if (rec.lactose_r !== lactoseRounded) mismatches.push(`Lactose(${rec.lactose_r}≠${lactoseRounded})`);
            if (rec.salt_r !== saltRounded) mismatches.push(`Salt(${rec.salt_r}≠${saltRounded})`);
            if (rec.water_r !== waterRounded) mismatches.push(`Water(${rec.water_r}≠${waterRounded})`);
            if (rec.temp_r !== tempRounded) mismatches.push(`Temp(${rec.temp_r}≠${tempRounded})`);
            if (rec.qty_r !== qtyRounded) mismatches.push(`Qty(${rec.qty_r}≠${qtyRounded})`);
            
            if (mismatches.length > 0) {
              console.log(`       ❌ Mismatches: ${mismatches.join(', ')}`);
            } else {
              console.log(`       ✅ All values match!`);
            }
          });
        } else {
          console.log(`   ℹ️ No records found for farmer ${normalizedFarmerId} on ${reading.collection_date}`);
        }

        // If checkOnly mode, just mark as new and skip insertion
        if (checkOnly) {
          results.push({
            local_id: reading.local_id || reading.timestamp,
            status: 'synced',
            message: 'Would be synced'
          });
          syncedCount++;
          continue;
        }

        console.log(`✅ Inserting new record:`);
        console.log(`   Farmer: ${normalizedFarmerId} (original: ${reading.farmer_id})`);
        console.log(`   Date/Time: ${reading.collection_date} ${reading.collection_time}`);
        console.log(`   Values - FAT: ${fatRounded}, SNF: ${snfRounded}, CLR: ${clrRounded}`);
        console.log(`   Qty: ${reading.quantity || 0}L, Rate: ₹${reading.rate || 0}, Amount: ₹${reading.total_amount || 0}`);

        // Insert new record
        const insertQuery = `
          INSERT INTO \`${schemaName}\`.milk_collections (
            farmer_id,
            society_id,
            machine_id,
            collection_date,
            collection_time,
            shift_type,
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
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Lactosure', CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
        `;

        await sequelize.query(insertQuery, {
          replacements: [
            normalizedFarmerId, // Use normalized farmer_id to match machine format
            id, // society_id
            machineDbId,
            reading.collection_date,
            reading.collection_time,
            shiftType,
            channel,
            reading.fat || 0,
            reading.snf || 0,
            reading.clr || 0,
            reading.protein || 0,
            reading.lactose || 0,
            reading.salt || 0,
            reading.water || 0,
            reading.temperature || 0,
            reading.quantity || 0,
            reading.rate || 0,
            reading.total_amount || 0,
            reading.bonus || 0
          ]
        });

        results.push({
          local_id: reading.local_id || reading.timestamp,
          status: 'synced'
        });
        syncedCount++;

      } catch (error: any) {
        console.error(`Error syncing reading:`, error);
        results.push({
          local_id: reading.local_id || reading.timestamp,
          status: 'error',
          message: error.message || 'Unknown error'
        });
        errorCount++;
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} synced, ${duplicateCount} duplicates, ${errorCount} errors`);

    return createSuccessResponse('Sync completed', {
      total: readings.length,
      synced: syncedCount,
      duplicates: duplicateCount,
      errors: errorCount,
      results
    }, 200, corsHeaders);

  } catch (error: any) {
    console.error('Error in sync endpoint:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Sync failed', 500, undefined, corsHeaders);
  }
}

/**
 * GET /api/external/reports/collections/sync
 * 
 * Get existing collection timestamps for the society
 * Used by mobile app to check which records need to be synced
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization token required', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id, role, schemaName } = decoded;

    if (role !== 'society') {
      return createErrorResponse('Only society users can access sync data', 403, undefined, corsHeaders);
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date');
    const limit = parseInt(searchParams.get('limit') || '1000');

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get existing collection identifiers for comparison
    let query = `
      SELECT 
        farmer_id,
        collection_date,
        collection_time,
        CONCAT(farmer_id, '_', collection_date, '_', collection_time) as sync_key
      FROM \`${schemaName}\`.milk_collections 
      WHERE society_id = ?
    `;
    const replacements: any[] = [id];

    if (fromDate) {
      query += ` AND collection_date >= ?`;
      replacements.push(fromDate);
    }

    query += ` ORDER BY collection_date DESC, collection_time DESC LIMIT ?`;
    replacements.push(limit);

    const [records] = await sequelize.query(query, { replacements }) as [any[], any];

    // Return just the sync keys for efficient comparison
    const syncKeys = records.map((r: any) => r.sync_key);

    return createSuccessResponse('Sync keys retrieved', {
      count: syncKeys.length,
      sync_keys: syncKeys
    }, 200, corsHeaders);

  } catch (error: any) {
    console.error('Error getting sync keys:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to get sync keys', 500, undefined, corsHeaders);
  }
}
