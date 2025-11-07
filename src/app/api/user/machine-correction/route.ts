import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import getSequelize from '@/lib/database';
import { QueryTypes } from 'sequelize';
import { UserRole } from '@/models/User';

/**
 * POST /api/user/machine-correction
 * Save machine correction data to admin schema
 */
export async function POST(request: NextRequest) {
  try {
    // Get and verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only Admin role can add corrections
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Only admins can add correction data' },
        { status: 403 }
      );
    }

    const sequelize = getSequelize();
    if (!sequelize) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Import models to get User
    const { getModels } = await import('@/models');
    const { User } = getModels();

    const body = await request.json();
    const {
      machineId,
      societyId,
      channel1_fat,
      channel1_snf,
      channel1_clr,
      channel1_temp,
      channel1_water,
      channel1_protein,
      channel2_fat,
      channel2_snf,
      channel2_clr,
      channel2_temp,
      channel2_water,
      channel2_protein,
      channel3_fat,
      channel3_snf,
      channel3_clr,
      channel3_temp,
      channel3_water,
      channel3_protein
    } = body;

    // Validate required fields
    if (!machineId || !societyId) {
      return NextResponse.json(
        { success: false, error: 'Machine ID and Society ID are required' },
        { status: 400 }
      );
    }

    // Get admin's dbKey and generate schema name (same pattern as other APIs)
    const admin = await User.findByPk(user.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json(
        { success: false, error: 'Admin schema not found' },
        { status: 404 }
      );
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Convert empty strings to null or 0.00
    const convertValue = (val: string) => {
      if (!val || val === '') return 0.00;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0.00 : parsed;
    };

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Set all previous corrections for this machine to status 0 (inactive)
      await sequelize.query(
        `UPDATE \`${schemaName}\`.\`machine_corrections\` 
         SET status = 0 
         WHERE machine_id = :machineId AND status = 1`,
        {
          replacements: { machineId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      // Insert new correction data with status 1 (active)
      await sequelize.query(
        `INSERT INTO \`${schemaName}\`.\`machine_corrections\` (
          machine_id,
          society_id,
          channel1_fat,
          channel1_snf,
          channel1_clr,
          channel1_temp,
          channel1_water,
          channel1_protein,
          channel2_fat,
          channel2_snf,
          channel2_clr,
          channel2_temp,
          channel2_water,
          channel2_protein,
          channel3_fat,
          channel3_snf,
          channel3_clr,
          channel3_temp,
          channel3_water,
          channel3_protein,
          status,
          created_at,
          updated_at
        ) VALUES (
          :machineId,
          :societyId,
          :channel1_fat,
          :channel1_snf,
          :channel1_clr,
          :channel1_temp,
          :channel1_water,
          :channel1_protein,
          :channel2_fat,
          :channel2_snf,
          :channel2_clr,
          :channel2_temp,
          :channel2_water,
          :channel2_protein,
          :channel3_fat,
          :channel3_snf,
          :channel3_clr,
          :channel3_temp,
          :channel3_water,
          :channel3_protein,
          1,
          NOW(),
          NOW()
        )`,
        {
          replacements: {
            machineId,
            societyId,
            channel1_fat: convertValue(channel1_fat),
            channel1_snf: convertValue(channel1_snf),
            channel1_clr: convertValue(channel1_clr),
            channel1_temp: convertValue(channel1_temp),
            channel1_water: convertValue(channel1_water),
            channel1_protein: convertValue(channel1_protein),
            channel2_fat: convertValue(channel2_fat),
            channel2_snf: convertValue(channel2_snf),
            channel2_clr: convertValue(channel2_clr),
            channel2_temp: convertValue(channel2_temp),
            channel2_water: convertValue(channel2_water),
            channel2_protein: convertValue(channel2_protein),
            channel3_fat: convertValue(channel3_fat),
            channel3_snf: convertValue(channel3_snf),
            channel3_clr: convertValue(channel3_clr),
            channel3_temp: convertValue(channel3_temp),
            channel3_water: convertValue(channel3_water),
            channel3_protein: convertValue(channel3_protein)
          },
          type: QueryTypes.INSERT,
          transaction
        }
      );

      // Keep only the last 5 records for this machine (delete older ones)
      // First, get the IDs of records to keep
      const recordsToKeep = await sequelize.query(
        `SELECT id FROM \`${schemaName}\`.\`machine_corrections\` 
         WHERE machine_id = :machineId 
         ORDER BY created_at DESC 
         LIMIT 5`,
        {
          replacements: { machineId },
          type: QueryTypes.SELECT,
          transaction
        }
      ) as Array<{ id: number }>;

      if (recordsToKeep.length > 0) {
        const idsToKeep = recordsToKeep.map(r => r.id);
        
        // Delete all records except the last 5
        await sequelize.query(
          `DELETE FROM \`${schemaName}\`.\`machine_corrections\` 
           WHERE machine_id = :machineId 
           AND id NOT IN (:idsToKeep)`,
          {
            replacements: { 
              machineId,
              idsToKeep 
            },
            type: QueryTypes.DELETE,
            transaction
          }
        );
      }

      // Commit transaction
      await transaction.commit();

      return NextResponse.json({
        success: true,
        message: 'Correction data saved successfully'
      });

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error saving correction data:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save correction data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/machine-correction?machineId=123
 * Get correction history for a machine
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only Admin role can view corrections
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Only admins can view correction data' },
        { status: 403 }
      );
    }

    const sequelize = getSequelize();
    if (!sequelize) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Import models to get User
    const { getModels } = await import('@/models');
    const { User } = getModels();

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: 'Machine ID is required' },
        { status: 400 }
      );
    }

    // Get admin's dbKey and generate schema name (same pattern as other APIs)
    const admin = await User.findByPk(user.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json(
        { success: false, error: 'Admin schema not found' },
        { status: 404 }
      );
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get correction history for the machine (last 5 records only)
    const corrections = await sequelize.query(
      `SELECT * FROM \`${schemaName}\`.\`machine_corrections\` 
       WHERE machine_id = :machineId 
       ORDER BY created_at DESC
       LIMIT 5`,
      {
        replacements: { machineId },
        type: QueryTypes.SELECT
      }
    ) as Array<Record<string, unknown>>;

    // Return the active correction (status=1) as the main data
    // and all 5 records as history
    const activeCorrection = corrections.find((c) => c.status === 1);

    return NextResponse.json({
      success: true,
      data: activeCorrection || (corrections.length > 0 ? corrections[0] : null),
      history: corrections
    });

  } catch (error) {
    console.error('Error fetching correction data:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch correction data' },
      { status: 500 }
    );
  }
}
