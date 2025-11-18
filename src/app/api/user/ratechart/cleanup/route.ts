import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * POST /api/user/ratechart/cleanup
 * Clean up orphaned rate chart records and data
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return createErrorResponse('Invalid token', 401);
    }

    if (decoded.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const sequelize = await connectDB();
    if (!sequelize) {
      return createErrorResponse('Database connection failed', 500);
    }

    const { User } = await import('@/models').then(m => m.getModels());
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    const transaction = await sequelize.transaction();

    try {
      // 1. Find orphaned shared charts (referencing non-existent master charts)
      const [orphanedShared] = await sequelize.query(`
        SELECT rc.id
        FROM ${schemaName}.rate_charts rc
        WHERE rc.shared_chart_id IS NOT NULL
        AND rc.shared_chart_id NOT IN (
          SELECT id FROM ${schemaName}.rate_charts WHERE shared_chart_id IS NULL
        )
      `, { transaction });

      const orphanedSharedIds = (orphanedShared as Array<{ id: number }>).map(r => r.id);

      if (orphanedSharedIds.length > 0) {
        // Delete orphaned shared chart records
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_charts
          WHERE id IN (${orphanedSharedIds.join(',')})
        `, { transaction });

        // Delete their download history
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_download_history
          WHERE rate_chart_id IN (${orphanedSharedIds.join(',')})
        `, { transaction });
      }

      // 2. Find orphaned rate chart data (data without a chart record)
      const [orphanedData] = await sequelize.query(`
        SELECT DISTINCT rcd.rate_chart_id
        FROM ${schemaName}.rate_chart_data rcd
        WHERE rcd.rate_chart_id NOT IN (
          SELECT id FROM ${schemaName}.rate_charts
        )
      `, { transaction });

      const orphanedDataIds = (orphanedData as Array<{ rate_chart_id: number }>).map(r => r.rate_chart_id);

      if (orphanedDataIds.length > 0) {
        // Delete orphaned data
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_data
          WHERE rate_chart_id IN (${orphanedDataIds.join(',')})
        `, { transaction });
      }

      // 3. Find orphaned download history
      const [orphanedHistory] = await sequelize.query(`
        SELECT DISTINCT dh.rate_chart_id
        FROM ${schemaName}.rate_chart_download_history dh
        WHERE dh.rate_chart_id NOT IN (
          SELECT id FROM ${schemaName}.rate_charts
        )
      `, { transaction });

      const orphanedHistoryIds = (orphanedHistory as Array<{ rate_chart_id: number }>).map(r => r.rate_chart_id);

      if (orphanedHistoryIds.length > 0) {
        // Delete orphaned history
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_download_history
          WHERE rate_chart_id IN (${orphanedHistoryIds.join(',')})
        `, { transaction });
      }

      await transaction.commit();

      const totalCleaned = orphanedSharedIds.length + orphanedDataIds.length + orphanedHistoryIds.length;

      console.log(`🧹 Cleanup completed in ${schemaName}:
        - Orphaned shared charts: ${orphanedSharedIds.length}
        - Orphaned data records: ${orphanedDataIds.length}
        - Orphaned history records: ${orphanedHistoryIds.length}
        - Total cleaned: ${totalCleaned}`);

      return createSuccessResponse('Database cleanup completed successfully', {
        orphanedSharedCharts: orphanedSharedIds.length,
        orphanedDataRecords: orphanedDataIds.length,
        orphanedHistoryRecords: orphanedHistoryIds.length,
        totalCleaned
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
    return createErrorResponse('Failed to cleanup database', 500);
  }
}
