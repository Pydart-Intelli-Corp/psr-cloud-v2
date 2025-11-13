import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

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

    // Query rate charts with society information
    const [rateCharts] = await sequelize.query(`
      SELECT 
        rc.id,
        rc.society_id AS societyId,
        s.name AS societyName,
        s.society_id AS societyIdentifier,
        rc.channel,
        rc.uploaded_at AS uploadedAt,
        rc.uploaded_by AS uploadedBy,
        rc.file_name AS fileName,
        rc.record_count AS recordCount,
        rc.shared_chart_id
      FROM ${schemaName}.rate_charts rc
      LEFT JOIN ${schemaName}.societies s ON rc.society_id = s.id
      ORDER BY rc.uploaded_at DESC
    `);

    return createSuccessResponse('Rate charts retrieved successfully', rateCharts);

  } catch (error) {
    console.error('Error fetching rate charts:', error);
    return createErrorResponse('Failed to fetch rate charts', 500);
  }
}
