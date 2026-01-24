import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { schemaName, id, entityType } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401);
    }

    try {
      // Get ALL rate charts for debugging (not just active ones)
      const [allCharts] = await sequelize.query(`
        SELECT 
          rc.id,
          rc.society_id,
          rc.bmc_id,
          rc.channel,
          rc.file_name,
          rc.uploaded_at,
          rc.record_count,
          rc.status,
          rc.is_bmc_assigned,
          rc.shared_chart_id,
          s.name as society_name
        FROM \`${schemaName}\`.rate_charts rc
        LEFT JOIN \`${schemaName}\`.societies s ON s.id = rc.society_id
        ${entityType === 'society' ? 'WHERE rc.society_id = ?' : ''}
        ORDER BY rc.uploaded_at DESC
      `, { replacements: entityType === 'society' ? [id] : [] });

      return createSuccessResponse('Debug info retrieved', {
        entityType,
        entityId: id,
        schemaName,
        totalCharts: allCharts.length,
        charts: allCharts,
      });

    } catch (error) {
      console.error('Error in debug endpoint:', error);
      return createErrorResponse('Failed to fetch debug info', 500);
    }

  } catch (error) {
    console.error('Debug API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
