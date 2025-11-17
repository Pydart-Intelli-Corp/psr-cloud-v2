import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import getSequelize from '@/lib/database';
import { QueryTypes } from 'sequelize';

interface MachineCorrection {
  id: number;
  machine_id: string;
  channel1_fat: string | null;
  channel1_snf: string | null;
  channel1_clr: string | null;
  channel1_temp: string | null;
  channel1_water: string | null;
  channel1_protein: string | null;
  channel2_fat: string | null;
  channel2_snf: string | null;
  channel2_clr: string | null;
  channel2_temp: string | null;
  channel2_water: string | null;
  channel2_protein: string | null;
  channel3_fat: string | null;
  channel3_snf: string | null;
  channel3_clr: string | null;
  channel3_temp: string | null;
  channel3_water: string | null;
  channel3_protein: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /api/user/machine/correction/[machineId]
 * 
 * Retrieves machine correction data that was saved via SaveMachineCorrectionFromMachine endpoint.
 * This data represents corrections sent from ESP32 devices.
 * 
 * @param machineId - Machine ID to retrieve corrections for
 * @returns Machine correction data for all three channels (COW, BUF, MIX)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;

    // Verify token and get user info
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.dbKey) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log(`[GetMachineCorrection] Machine: ${machineId}`);

    // Get database connection
    const sequelize = getSequelize();
    if (!sequelize) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    // Get admin schema name from user's dbKey
    const { getModels } = await import('@/models');
    const { User } = getModels();
    
    const adminUser = await User.findByPk(decoded.id);
    if (!adminUser || !adminUser.dbKey) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate schema name
    const cleanAdminName = adminUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${adminUser.dbKey.toLowerCase()}`;

    // Fetch machine correction data from machine_corrections_from_machine table
    // This table stores corrections sent by ESP32 device via SaveMachineCorrectionFromMachine endpoint
    // Only show the most recent correction per date (one per day)
    const corrections = await sequelize.query<MachineCorrection>(
      `SELECT 
        mc.id,
        mc.machine_id,
        mc.channel1_fat, mc.channel1_snf, mc.channel1_clr, mc.channel1_temp, mc.channel1_water, mc.channel1_protein,
        mc.channel2_fat, mc.channel2_snf, mc.channel2_clr, mc.channel2_temp, mc.channel2_water, mc.channel2_protein,
        mc.channel3_fat, mc.channel3_snf, mc.channel3_clr, mc.channel3_temp, mc.channel3_water, mc.channel3_protein,
        mc.created_at,
        mc.updated_at
       FROM ${schemaName}.machine_corrections_from_machine mc
       INNER JOIN (
         SELECT DATE(created_at) as correction_date, MAX(created_at) as max_created_at
         FROM ${schemaName}.machine_corrections_from_machine
         WHERE machine_id = ?
         GROUP BY DATE(created_at)
       ) latest ON DATE(mc.created_at) = latest.correction_date 
                  AND mc.created_at = latest.max_created_at
       WHERE mc.machine_id = ?
       ORDER BY mc.created_at DESC
       LIMIT 30`,
      {
        replacements: [machineId, machineId],
        type: QueryTypes.SELECT
      }
    );

    if (corrections.length === 0) {
      console.log(`[GetMachineCorrection] No correction data found for machine ${machineId}`);
      return NextResponse.json({ 
        success: true,
        data: [],
        message: 'No correction data found for this machine'
      });
    }

    const correctionData = corrections.map((correction: MachineCorrection) => ({
      id: correction.id,
      machineId: correction.machine_id,
      channel1: {
        fat: correction.channel1_fat,
        snf: correction.channel1_snf,
        clr: correction.channel1_clr,
        temp: correction.channel1_temp,
        water: correction.channel1_water,
        protein: correction.channel1_protein
      },
      channel2: {
        fat: correction.channel2_fat,
        snf: correction.channel2_snf,
        clr: correction.channel2_clr,
        temp: correction.channel2_temp,
        water: correction.channel2_water,
        protein: correction.channel2_protein
      },
      channel3: {
        fat: correction.channel3_fat,
        snf: correction.channel3_snf,
        clr: correction.channel3_clr,
        temp: correction.channel3_temp,
        water: correction.channel3_water,
        protein: correction.channel3_protein
      },
      date: new Date(correction.created_at).toLocaleDateString(),
      createdAt: correction.created_at,
      lastUpdated: correction.updated_at
    }));

    console.log(`[GetMachineCorrection] Found ${corrections.length} correction records for machine ${machineId}`);

    return NextResponse.json({
      success: true,
      data: correctionData
    });

  } catch (error) {
    console.error('[GetMachineCorrection] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch machine correction data',
      details: error instanceof Error ? error.message : 'Unknown error'
    },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/machine/correction/[machineId]
 * 
 * Deletes machine correction data by selected IDs
 * Query param: ?ids=1,2,3 (comma-separated list of correction IDs)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;

    // Verify token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.dbKey) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get database connection
    const sequelize = getSequelize();
    if (!sequelize) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    // Get admin schema name
    const { getModels } = await import('@/models');
    const { User } = getModels();
    
    const adminUser = await User.findByPk(decoded.id);
    if (!adminUser || !adminUser.dbKey) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cleanAdminName = adminUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${adminUser.dbKey.toLowerCase()}`;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ error: 'No correction IDs provided' }, { status: 400 });
    }

    // Parse comma-separated IDs
    const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Invalid correction IDs' }, { status: 400 });
    }

    // Delete selected records
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM ${schemaName}.machine_corrections 
                   WHERE id IN (${placeholders}) AND machine_id = ?`;
    const replacements = [...ids, machineId];

    await sequelize.query(query, {
      replacements,
      type: QueryTypes.DELETE
    });

    console.log(`[DeleteMachineCorrection] Deleted ${ids.length} records for machine ${machineId}`);

    return NextResponse.json({
      success: true,
      message: `${ids.length} correction record${ids.length > 1 ? 's' : ''} deleted successfully`
    });

  } catch (error) {
    console.error('[DeleteMachineCorrection] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete correction data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}