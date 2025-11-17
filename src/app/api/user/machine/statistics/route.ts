import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import getSequelize from '@/lib/database';
import { QueryTypes } from 'sequelize';

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

    // Get machine ID from query params
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: 'Machine ID is required' },
        { status: 400 }
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

    // Get user and schema
    const dbUser = await User.findByPk(user.id);
    if (!dbUser || !dbUser.dbKey) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build schema name
    const cleanAdminName = dbUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${dbUser.dbKey.toLowerCase()}`;

    // Get machine to verify it exists and belongs to this admin
    const [machineResults] = await sequelize.query(
      `SELECT id FROM \`${schemaName}\`.machines WHERE id = ?`,
      { replacements: [machineId], type: QueryTypes.SELECT }
    );

    if (!machineResults) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Fetch statistics for this machine
    const statisticsResults = await sequelize.query(
      `SELECT 
        id,
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
        statistics_time,
        created_at
      FROM \`${schemaName}\`.machine_statistics
      WHERE machine_id = ?
      ORDER BY statistics_date DESC, statistics_time DESC
      LIMIT 100`,
      { replacements: [machineId], type: QueryTypes.SELECT }
    );

    return NextResponse.json({
      success: true,
      data: statisticsResults || []
    });

  } catch (error) {
    console.error('Error fetching machine statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch machine statistics' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/machine/statistics
 * 
 * Deletes machine statistics by selected IDs
 * Query params: ?machineId=5&ids=1,2,3 (comma-separated list of statistics IDs)
 */
export async function DELETE(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    const idsParam = searchParams.get('ids');

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: 'Machine ID is required' },
        { status: 400 }
      );
    }

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'No statistics IDs provided' },
        { status: 400 }
      );
    }

    // Parse comma-separated IDs
    const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid statistics IDs' },
        { status: 400 }
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

    // Get user and schema
    const dbUser = await User.findByPk(user.id);
    if (!dbUser || !dbUser.dbKey) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build schema name
    const cleanAdminName = dbUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${dbUser.dbKey.toLowerCase()}`;

    // Verify machine exists and belongs to this admin
    const [machineResults] = await sequelize.query(
      `SELECT id FROM \`${schemaName}\`.machines WHERE id = ?`,
      { replacements: [machineId], type: QueryTypes.SELECT }
    );

    if (!machineResults) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Delete selected statistics records
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM \`${schemaName}\`.machine_statistics 
                   WHERE id IN (${placeholders}) AND machine_id = ?`;
    const replacements = [...ids, machineId];

    await sequelize.query(query, {
      replacements,
      type: QueryTypes.DELETE
    });

    console.log(`[DeleteMachineStatistics] Deleted ${ids.length} records for machine ${machineId}`);

    return NextResponse.json({
      success: true,
      message: `${ids.length} statistics record${ids.length > 1 ? 's' : ''} deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting machine statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete machine statistics' },
      { status: 500 }
    );
  }
}
