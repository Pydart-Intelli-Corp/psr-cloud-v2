import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { chartId, bmcId } = await request.json();

    if (!chartId || !bmcId) {
      return createErrorResponse('Chart ID and BMC ID are required', 400);
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
      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_chart_data
        WHERE rate_chart_id IN (
          SELECT id FROM ${schemaName}.rate_charts
          WHERE bmc_id = ? AND (id = ? OR shared_chart_id = ?) AND is_bmc_assigned = 1
        )
      `, { replacements: [bmcId, chartId, chartId], transaction });

      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_charts
        WHERE bmc_id = ? AND (id = ? OR shared_chart_id = ?) AND is_bmc_assigned = 1
      `, { replacements: [bmcId, chartId, chartId], transaction });

      await transaction.commit();

      return createSuccessResponse('BMC removed from chart successfully', {
        chartId,
        bmcId
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error removing BMC from chart:', error);
    return createErrorResponse('Failed to remove BMC from chart', 500);
  }
}
