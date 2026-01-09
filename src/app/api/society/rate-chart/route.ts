import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/society/rate-chart
 * Get rate charts available to the society
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'society') {
      return createErrorResponse('Society access required', 403);
    }

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get parameters from query string
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('societyId');
    const schemaName = searchParams.get('schemaName');

    if (!societyId || !schemaName) {
      return createErrorResponse('Society ID and schemaName are required', 400);
    }

    // Verify this society matches the authenticated user
    if (payload.uid !== societyId) {
      return createErrorResponse('Unauthorized access to society data', 403);
    }

    console.log(`📊 Fetching rate charts for society ${societyId} in schema ${schemaName}`);

    // First, get the society's BMC to find shared rate charts
    const [societyInfo] = await sequelize.query(`
      SELECT s.bmc_id, s.id as society_db_id
      FROM \`${schemaName}\`.societies s
      WHERE s.society_id = ?
    `, { 
      replacements: [societyId],
      type: 'SELECT'
    });

    const societyData = (societyInfo as any) || {};
    console.log('Society info:', societyData);

    // Get rate charts - either directly assigned to society or shared by BMC
    const [rateCharts] = await sequelize.query(`
      SELECT 
        rc.id,
        rc.channel,
        rc.file_name as fileName,
        rc.uploaded_at as uploadedAt,
        rc.status,
        CASE WHEN rc.society_id = ? THEN false ELSE true END as isShared
      FROM \`${schemaName}\`.rate_charts rc
      WHERE rc.status = 1 
        AND (rc.society_id = ? OR (rc.bmc_id = ? AND rc.is_shared = 1))
      ORDER BY rc.uploaded_at DESC
    `, { 
      replacements: [societyData.society_db_id || societyId, societyData.society_db_id || societyId, societyData.bmc_id || 0],
      type: 'SELECT'
    });

    // For each rate chart, get the rate data
    const chartsWithData = await Promise.all(
      (rateCharts as any[]).map(async (chart) => {
        const [rateData] = await sequelize.query(`
          SELECT 
            fat,
            snf,
            clr,
            rate
          FROM \`${schemaName}\`.rate_chart_data
          WHERE rate_chart_id = ?
          ORDER BY fat ASC, snf ASC
          LIMIT 100
        `, { 
          replacements: [chart.id],
          type: 'SELECT'
        });

        return {
          ...chart,
          recordCount: (rateData as any[]).length,
          rateData
        };
      })
    );

    console.log(`✅ Retrieved ${chartsWithData.length} rate charts for society ${societyId}`);

    return NextResponse.json({
      success: true,
      message: 'Rate charts retrieved successfully',
      data: chartsWithData
    });

  } catch (error) {
    console.error('❌ Error fetching society rate charts:', error);
    return createErrorResponse('Failed to fetch rate charts', 500);
  }
}
