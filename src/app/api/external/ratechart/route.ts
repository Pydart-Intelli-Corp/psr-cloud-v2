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
      // Verify the society exists and get its BMC ID
      const [societyData] = await sequelize.query(`
        SELECT s.id, s.name, s.society_id, s.bmc_id, b.name as bmc_name
        FROM \`${schemaName}\`.societies s
        LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
        WHERE s.id = ?
      `, { replacements: [id] });

      if (!Array.isArray(societyData) || societyData.length === 0) {
        console.error(`❌ Society not found: id=${id}, schema=${schemaName}`);
        return createErrorResponse('Society not found', 404, undefined, corsHeaders);
      }

      const society = societyData[0] as any;
      console.log(`✅ Fetching rate charts for society: ${society.name} (ID: ${society.id}, Society Code: ${society.society_id}, BMC ID: ${society.bmc_id})`);

      /**
       * Rate Chart Assignment Logic:
       * 1. Society-specific charts: WHERE rc.society_id = ? AND rc.is_bmc_assigned = 0
       * 2. BMC-assigned charts (if no society chart): WHERE rc.bmc_id = ? AND rc.is_bmc_assigned = 1
       * 
       * For each channel (COW, BUF, MIX):
       * - First check for society-specific chart
       * - If not found, check for BMC-assigned chart
       * - Return the latest active chart per channel
       */

      // Get all active rate charts for this society (both society-assigned and BMC-assigned)
      const [rateCharts] = await sequelize.query(`
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
          CASE 
            WHEN rc.society_id = ? THEN 1 
            ELSE 2 
          END as priority
        FROM \`${schemaName}\`.rate_charts rc
        WHERE (
          (rc.society_id = ? AND rc.is_bmc_assigned = 0)
          OR 
          (rc.bmc_id = ? AND rc.is_bmc_assigned = 1)
        )
        AND rc.status = 1
        ORDER BY rc.channel ASC, priority ASC, rc.uploaded_at DESC
      `, { replacements: [id, id, society.bmc_id] });

      if (!Array.isArray(rateCharts) || rateCharts.length === 0) {
        console.log(`ℹ️  No active rate charts found for society ${society.name} (ID: ${id})`);
        return createErrorResponse('No active rate chart found for your society', 404, undefined, corsHeaders);
      }

      console.log(`📊 Found ${rateCharts.length} rate chart(s) for society ${society.name}`);

      // Group by channel and get the latest (highest priority, most recent) for each
      const latestByChannel = new Map();
      (rateCharts as any[]).forEach(chart => {
        if (!latestByChannel.has(chart.channel)) {
          latestByChannel.set(chart.channel, chart);
          console.log(`  ✅ ${chart.channel}: Chart ID ${chart.id} (${chart.is_bmc_assigned ? 'BMC-assigned' : 'Society-specific'}) - ${chart.record_count} records`);
        }
      });

      // Fetch rate data for all channels
      const allChannelData: any = {};
      
      for (const [channel, rateChart] of latestByChannel.entries()) {
        // Get the rate chart data for this channel
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

        allChannelData[channel] = {
          info: {
            id: rateChart.id,
            fileName: rateChart.file_name,
            channel: rateChart.channel,
            uploadedAt: rateChart.uploaded_at,
            recordCount: rateChart.record_count,
            assignmentType: rateChart.is_bmc_assigned ? 'bmc' : 'society',
            societyId: rateChart.society_id,
            bmcId: rateChart.bmc_id,
          },
          data: rateData,
        };
      }

      console.log(`✅ Successfully retrieved ${Object.keys(allChannelData).length} channel(s): ${Object.keys(allChannelData).join(', ')}`);

      return createSuccessResponse('Rate charts retrieved successfully', {
        society: {
          id: society.id,
          name: society.name,
          societyCode: society.society_id,
          bmcId: society.bmc_id,
          bmcName: society.bmc_name,
        },
        channels: allChannelData,
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
