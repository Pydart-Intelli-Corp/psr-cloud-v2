import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Update rate chart status (active/inactive)
 * PATCH /api/user/ratechart/status
 * Body: { chartId: number, status: number } OR { chartIds: number[], status: number }
 */
export async function PATCH(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { chartId, chartIds, status } = body;

    if ((!chartId && !chartIds) || status === undefined) {
      return createErrorResponse('Chart ID(s) and status are required', 400);
    }

    // Validate status value (0 or 1)
    if (status !== 0 && status !== 1) {
      return createErrorResponse('Status must be 0 (inactive) or 1 (active)', 400);
    }

    // Handle bulk update
    if (chartIds && Array.isArray(chartIds) && chartIds.length > 0) {
      await sequelize.query(
        `UPDATE ${schemaName}.rate_charts SET status = ? WHERE id IN (${chartIds.join(',')})`,
        { replacements: [status] }
      );

      const statusText = status === 1 ? 'active' : 'inactive';
      return createSuccessResponse(`${chartIds.length} rate charts updated to ${statusText}`, { chartIds, status });
    }

    // Handle single update
    await sequelize.query(
      `UPDATE ${schemaName}.rate_charts SET status = ? WHERE id = ?`,
      { replacements: [status, chartId] }
    );

    const statusText = status === 1 ? 'active' : 'inactive';
    return createSuccessResponse(`Rate chart status updated to ${statusText}`, { chartId, status });

  } catch (error) {
    console.error('Error updating rate chart status:', error);
    return createErrorResponse('Failed to update rate chart status', 500);
  }
}
