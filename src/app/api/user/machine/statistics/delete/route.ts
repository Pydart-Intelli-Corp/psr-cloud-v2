import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';

/**
 * DELETE /api/user/machine/statistics/delete
 * Delete machine statistics records
 * Body: { statisticIds: number[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Only admin and super admin can delete statistics
    if (!['admin', 'super_admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied - Admin privileges required' },
        { status: 403 }
      );
    }

    // Get database connection
    const sequelize = await connectDB();
    if (!sequelize) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get admin schema
    const { User } = await import('@/models').then(m => m.getModels());
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.dbKey) {
      return NextResponse.json(
        { success: false, message: 'Admin schema not found' },
        { status: 404 }
      );
    }

    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    // Parse request body
    const body = await req.json();
    const { statisticIds } = body;

    if (!statisticIds || !Array.isArray(statisticIds) || statisticIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No statistics selected for deletion' },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    if (!statisticIds.every(id => typeof id === 'number' && id > 0)) {
      return NextResponse.json(
        { success: false, message: 'Invalid statistic IDs provided' },
        { status: 400 }
      );
    }

    // Delete statistics records from admin schema
    const deleteQuery = `
      DELETE FROM ${schemaName}.machine_statistics 
      WHERE id IN (${statisticIds.map(() => '?').join(',')})
    `;

    const [result] = await sequelize.query(deleteQuery, {
      replacements: statisticIds
    }) as [{ affectedRows?: number }, unknown];

    const deletedCount = result.affectedRows || 0;

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No statistics found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} statistic${deletedCount !== 1 ? 's' : ''}`,
      data: {
        deletedCount,
        requestedCount: statisticIds.length
      }
    });

  } catch (error) {
    console.error('Error deleting statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
