import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Get all machine statistics across all machines and societies
 * GET /api/user/machine/all-statistics
 */
export async function GET(request: NextRequest) {
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

    // Fetch all machine statistics with related machine and society data
    const query = `
      SELECT 
        ms.id,
        ms.machine_id,
        m.machine_id as machine_identifier,
        m.machine_type,
        m.operator_name,
        ms.society_id,
        s.name as society_name,
        s.society_id as society_identifier,
        ms.machine_type as stats_machine_type,
        ms.version,
        ms.total_test,
        ms.daily_cleaning,
        ms.weekly_cleaning,
        ms.cleaning_skip,
        ms.gain,
        ms.auto_channel,
        ms.statistics_date,
        ms.statistics_time,
        ms.created_at
      FROM \`${schemaName}\`.machine_statistics ms
      INNER JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
      INNER JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      ORDER BY ms.created_at DESC, ms.statistics_date DESC, ms.statistics_time DESC
    `;

    const [results] = await sequelize.query(query);

    return createSuccessResponse('Machine statistics fetched successfully', { 
      statistics: results,
      totalCount: Array.isArray(results) ? results.length : 0
    });

  } catch (error) {
    console.error('Error fetching machine statistics:', error);
    return createErrorResponse('Failed to fetch machine statistics', 500);
  }
}
