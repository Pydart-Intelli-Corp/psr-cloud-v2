import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

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

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Check if this is a master chart (shared_chart_id IS NULL)
      const [chartInfo] = await sequelize.query(`
        SELECT id, shared_chart_id FROM ${schemaName}.rate_charts
        WHERE id = :id
      `, {
        replacements: { id },
        transaction
      }) as [Array<{ id: number; shared_chart_id: number | null }>, unknown];

      if (!chartInfo || chartInfo.length === 0) {
        await transaction.rollback();
        return createErrorResponse('Rate chart not found', 404);
      }

      const chart = chartInfo[0];
      const isMasterChart = chart.shared_chart_id === null;

      if (isMasterChart) {
        // Get all chart IDs that will be deleted (master + shared)
        const [chartIdsToDelete] = await sequelize.query(`
          SELECT id FROM ${schemaName}.rate_charts
          WHERE id = :id OR shared_chart_id = :id
        `, {
          replacements: { id },
          transaction
        }) as [Array<{ id: number }>, unknown];

        const idsToDelete = chartIdsToDelete.map(c => c.id);

        // Delete download history for all affected charts
        if (idsToDelete.length > 0) {
          await sequelize.query(`
            DELETE FROM ${schemaName}.rate_chart_download_history
            WHERE rate_chart_id IN (${idsToDelete.join(',')})
          `, { transaction });
        }

        // This is a master chart - delete all shared charts that reference it
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_charts
          WHERE shared_chart_id = :id
        `, {
          replacements: { id },
          transaction
        });

        // Delete the master chart's data
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_data
          WHERE rate_chart_id = :id
        `, {
          replacements: { id },
          transaction
        });
      } else {
        // This is a shared chart - delete its download history
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_download_history
          WHERE rate_chart_id = :id
        `, {
          replacements: { id },
          transaction
        });
        // The data belongs to the master chart, so we don't delete data
      }

      // Delete the chart record itself
      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_charts
        WHERE id = :id
      `, {
        replacements: { id },
        transaction
      });

      await transaction.commit();

      console.log(`🗑️  Rate chart ${id} deleted successfully${isMasterChart ? ' (including all shared references)' : ''}`);

      return createSuccessResponse('Rate chart deleted successfully', null);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error deleting rate chart:', error);
    return createErrorResponse('Failed to delete rate chart', 500);
  }
}
