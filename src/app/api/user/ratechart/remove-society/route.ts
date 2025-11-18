import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * POST /api/user/ratechart/remove-society
 * Remove a society assignment from a rate chart
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
    const { chartId, societyId } = body;

    if (!chartId || !societyId) {
      return createErrorResponse('Chart ID and Society ID are required', 400);
    }

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // First, get the chart details to find other assignments with same file_name and channel
    const [chartDetails] = await sequelize.query(`
      SELECT file_name, channel, shared_chart_id
      FROM \`${schemaName}\`.rate_charts
      WHERE id = ?
      LIMIT 1
    `, {
      replacements: [chartId]
    });

    if (!Array.isArray(chartDetails) || chartDetails.length === 0) {
      return createErrorResponse('Rate chart not found', 404);
    }

    const chart = chartDetails[0] as { file_name: string; channel: string; shared_chart_id: number | null };

    // Count how many societies have this same chart (by file_name and channel, or shared_chart_id)
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM \`${schemaName}\`.rate_charts
      WHERE file_name = ? AND channel = ?
    `, {
      replacements: [chart.file_name, chart.channel]
    });

    const count = (countResult[0] as { count: number }).count;

    if (count <= 1) {
      return createErrorResponse('Cannot remove the last society. At least one society must be assigned to the chart.', 400);
    }

    // Check if this is the master chart (shared_chart_id is NULL)
    const isMasterChart = chart.shared_chart_id === null;

    if (isMasterChart) {
      // If removing the master chart's society, we need to promote a shared chart to be the new master
      const [sharedCharts] = await sequelize.query(`
        SELECT id, society_id FROM \`${schemaName}\`.rate_charts
        WHERE shared_chart_id = ? 
        ORDER BY id ASC
        LIMIT 1
      `, {
        replacements: [chartId]
      });

      if (Array.isArray(sharedCharts) && sharedCharts.length > 0) {
        const sharedChart = sharedCharts[0] as { id: number; society_id: number };
        
        // Step 1: Transfer rate_chart_data ownership from old master to new master
        await sequelize.query(`
          UPDATE \`${schemaName}\`.rate_chart_data
          SET rate_chart_id = ?
          WHERE rate_chart_id = ?
        `, {
          replacements: [sharedChart.id, chartId]
        });

        // Step 2: Promote the selected shared chart to master (set shared_chart_id to NULL)
        await sequelize.query(`
          UPDATE \`${schemaName}\`.rate_charts
          SET shared_chart_id = NULL
          WHERE id = ?
        `, {
          replacements: [sharedChart.id]
        });

        // Step 3: Update all OTHER shared charts to point to the promoted chart as new master
        await sequelize.query(`
          UPDATE \`${schemaName}\`.rate_charts
          SET shared_chart_id = ?
          WHERE shared_chart_id = ? AND id != ?
        `, {
          replacements: [sharedChart.id, chartId, sharedChart.id]
        });

        // Step 4: Clean up download history for the removed master chart
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.rate_chart_download_history
          WHERE rate_chart_id = ?
        `, {
          replacements: [chartId]
        });

        // Step 5: Delete the old master chart record
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.rate_charts
          WHERE id = ?
        `, {
          replacements: [chartId]
        });

        console.log(`✅ Removed master chart ${chartId}, promoted ${sharedChart.id} to master in schema: ${schemaName}`);
        return createSuccessResponse('Society removed from rate chart successfully', null);
      }
    }

    // If it's a shared chart, just delete it
    // If it's a shared chart, just delete it
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.rate_charts
      WHERE id = ? AND society_id = ?
    `, {
      replacements: [chartId, societyId]
    });

    // Clean up download history for this specific chart record
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.rate_chart_download_history
      WHERE rate_chart_id = ?
    `, {
      replacements: [chartId]
    });

    console.log(`✅ Removed shared chart ${chartId} for society ${societyId} in schema: ${schemaName}`);

    return createSuccessResponse('Society removed from rate chart successfully', null);

  } catch (error) {
    console.error('Error removing society from rate chart:', error);
    return createErrorResponse('Failed to remove society from rate chart', 500);
  }
}
