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

    const { chartId, bmcIds } = await request.json();

    if (!chartId || !bmcIds || !Array.isArray(bmcIds) || bmcIds.length === 0) {
      return createErrorResponse('Chart ID and BMC IDs are required', 400);
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

    // Get the source chart details
    const [[sourceChart]] = await sequelize.query(`
      SELECT rc.id, rc.bmc_id, rc.channel, rc.shared_chart_id, rc.is_bmc_assigned
      FROM ${schemaName}.rate_charts rc
      WHERE rc.id = ?
      LIMIT 1
    `, { replacements: [chartId] }) as any[];

    if (!sourceChart) {
      return createErrorResponse('Rate chart not found', 404);
    }

    if (!(sourceChart as any).is_bmc_assigned) {
      return createErrorResponse('This is not a BMC-assigned chart', 400);
    }

    const transaction = await sequelize.transaction();

    try {
      // Delete existing BMC charts for these BMCs and channel
      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_chart_data
        WHERE rate_chart_id IN (
          SELECT id FROM ${schemaName}.rate_charts
          WHERE bmc_id IN (${bmcIds.join(',')}) AND channel = ? AND is_bmc_assigned = 1
        )
      `, { replacements: [(sourceChart as any).channel], transaction });

      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_charts
        WHERE bmc_id IN (${bmcIds.join(',')}) AND channel = ? AND is_bmc_assigned = 1
      `, { replacements: [(sourceChart as any).channel], transaction });

      const values = bmcIds.map((bmcId: number) => 
        `(${bmcId}, '${(sourceChart as any).channel}', NOW(), '${user.fullName}', 'BMC Assignment', 0, 1, 1)`
      ).join(',');

      await sequelize.query(`
        INSERT INTO ${schemaName}.rate_charts 
        (bmc_id, channel, uploaded_at, uploaded_by, file_name, record_count, status, is_bmc_assigned)
        VALUES ${values}
      `, { transaction });

      await sequelize.query(`
        UPDATE ${schemaName}.rate_charts
        SET shared_chart_id = ?
        WHERE bmc_id IN (${bmcIds.join(',')}) AND channel = ? AND is_bmc_assigned = 1
      `, { replacements: [chartId, (sourceChart as any).channel], transaction });

      await transaction.commit();

      return createSuccessResponse('BMC chart assigned successfully', {
        chartId,
        assignedBmcs: bmcIds.length
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error assigning BMC chart:', error);
    return createErrorResponse('Failed to assign BMC chart', 500);
  }
}
