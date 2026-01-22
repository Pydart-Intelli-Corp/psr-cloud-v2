import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    // Only societies can view rate charts
    if (entityType !== 'society') {
      return createErrorResponse('Rate chart access is only available for societies', 403, undefined, corsHeaders);
    }

    try {
      // Get the society's active rate chart
      const [rateCharts] = await sequelize.query(`
        SELECT 
          rc.id,
          rc.society_id,
          rc.channel,
          rc.file_name,
          rc.uploaded_at,
          rc.record_count,
          rc.status
        FROM \`${schemaName}\`.rate_charts rc
        WHERE rc.society_id = ? AND rc.status = 1
        ORDER BY rc.uploaded_at DESC
        LIMIT 1
      `, { replacements: [id] });

      if (!Array.isArray(rateCharts) || rateCharts.length === 0) {
        return createErrorResponse('No active rate chart found for your society', 404, undefined, corsHeaders);
      }

      const rateChart = rateCharts[0] as any;

      // Get the rate chart data
      const [rateData] = await sequelize.query(`
        SELECT 
          fat,
          snf,
          clr,
          rate
        FROM \`${schemaName}\`.rate_chart_data
        WHERE rate_chart_id = ?
        ORDER BY fat ASC, snf ASC
      `, { replacements: [rateChart.id] });

      return createSuccessResponse('Rate chart retrieved successfully', {
        info: {
          id: rateChart.id,
          fileName: rateChart.file_name,
          channel: rateChart.channel,
          uploadedAt: rateChart.uploaded_at,
          recordCount: rateChart.record_count,
        },
        data: rateData,
      }, 200, corsHeaders);

    } catch (error) {
      console.error('Error fetching rate chart:', error);
      return createErrorResponse('Failed to fetch rate chart data', 500, undefined, corsHeaders);
    }

  } catch (error) {
    console.error('Rate chart API error:', error);
    return createErrorResponse('Internal server error', 500, undefined, corsHeaders);
  }
}
