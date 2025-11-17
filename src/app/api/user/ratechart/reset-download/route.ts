import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { 
  createErrorResponse, 
  createSuccessResponse
} from '@/middleware/auth';

/**
 * POST /api/user/ratechart/reset-download
 * Reset download history for specific machines to allow re-download
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return createErrorResponse('Invalid token', 401);
    }

    // Only allow admin users
    if (payload.role !== 'admin') {
      return createErrorResponse('Unauthorized - Admin access required', 403);
    }

    const body = await request.json();
    const { chartIds, machineIds, channel } = body;

    if (!chartIds || !Array.isArray(chartIds) || chartIds.length === 0 || !machineIds || !Array.isArray(machineIds) || machineIds.length === 0) {
      return createErrorResponse('Chart IDs and machine IDs are required', 400);
    }

    if (!channel || !['COW', 'BUF', 'MIX'].includes(channel)) {
      return createErrorResponse('Valid channel (COW, BUF, or MIX) is required', 400);
    }

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Delete download history records for the specified machines, charts, and channel
    const chartPlaceholders = chartIds.map(() => '?').join(', ');
    const machinePlaceholders = machineIds.map(() => '?').join(', ');
    const deleteQuery = `
      DELETE FROM \`${schemaName}\`.rate_chart_download_history
      WHERE rate_chart_id IN (${chartPlaceholders}) AND machine_id IN (${machinePlaceholders}) AND channel = ?
    `;

    const [result] = await sequelize.query(deleteQuery, {
      replacements: [...chartIds, ...machineIds, channel]
    });

    const deletedCount = (result as { affectedRows?: number }).affectedRows || 0;

    return createSuccessResponse(
      `Reset ${channel} channel download history for ${deletedCount} machine(s). They can now re-download the ${channel} chart.`,
      JSON.stringify({ deletedCount, chartIds, machineIds, channel })
    );

  } catch (error) {
    console.error('Error resetting download history:', error);
    return createErrorResponse('Failed to reset download history', 500);
  }
}
