import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

// GET - Fetch rate chart data OR machines for reset download
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const chartId = searchParams.get('chartId');
    const fileName = searchParams.get('fileName');
    const channel = searchParams.get('channel');
    const societyId = searchParams.get('societyId');

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Use case 1: Fetch machines for reset download modal (chartId provided)
    if (chartId) {
      const chartIdNum = parseInt(chartId);
      if (isNaN(chartIdNum)) {
        return createErrorResponse('Invalid chart ID', 400);
      }

      // First get the rate chart details
      const chartQuery = `
        SELECT rc.id, rc.society_id, rc.bmc_id, rc.channel, rc.shared_chart_id, rc.is_bmc_assigned
        FROM \`${schemaName}\`.rate_charts rc
        WHERE rc.id = ?
        LIMIT 1
      `;

      const [charts] = await sequelize.query(chartQuery, {
        replacements: [chartIdNum]
      });

      if (!Array.isArray(charts) || charts.length === 0) {
        return createErrorResponse('Rate chart not found', 404);
      }

      const chart = charts[0] as { id: number; society_id: number | null; bmc_id: number | null; channel: string; shared_chart_id: number | null; is_bmc_assigned: number };

      // Get all chart IDs that share the same data
      let chartIds = [chart.id];
      
      if (chart.shared_chart_id) {
        const sharedChartsQuery = `
          SELECT id FROM \`${schemaName}\`.rate_charts
          WHERE shared_chart_id = ? OR id = ?
        `;
        const [sharedCharts] = await sequelize.query(sharedChartsQuery, {
          replacements: [chart.shared_chart_id, chart.shared_chart_id]
        });
        chartIds = (sharedCharts as Array<{ id: number }>).map(c => c.id);
      } else {
        const sharedChartsQuery = `
          SELECT id FROM \`${schemaName}\`.rate_charts
          WHERE shared_chart_id = ?
        `;
        const [sharedCharts] = await sequelize.query(sharedChartsQuery, {
          replacements: [chart.id]
        });
        chartIds = [chart.id, ...(sharedCharts as Array<{ id: number }>).map(c => c.id)];
      }

      let machines;

      if (chart.is_bmc_assigned) {
        // For BMC-assigned charts, get all machines from BMCs
        const bmcIdsQuery = `
          SELECT DISTINCT bmc_id FROM \`${schemaName}\`.rate_charts
          WHERE id IN (${chartIds.join(',')})
        `;
        const [bmcResults] = await sequelize.query(bmcIdsQuery);
        const bmcIds = (bmcResults as Array<{ bmc_id: number }>).map(b => b.bmc_id);

        const machinesQuery = `
          SELECT DISTINCT
            m.id,
            m.machine_id as machineId,
            m.bmc_id as bmcId,
            m.machine_type as machineType,
            m.location,
            b.name as bmcName,
            b.bmc_id as bmcIdentifier,
            CASE WHEN rcdh.id IS NOT NULL THEN 1 ELSE 0 END as downloaded
          FROM \`${schemaName}\`.machines m
          INNER JOIN \`${schemaName}\`.bmcs b ON m.bmc_id = b.id
          LEFT JOIN \`${schemaName}\`.rate_chart_download_history rcdh 
            ON m.id = rcdh.machine_id 
            AND rcdh.rate_chart_id IN (${chartIds.join(',')})
            AND rcdh.channel = ?
          WHERE m.bmc_id IN (${bmcIds.join(',')}) AND m.status = 1
          ORDER BY m.machine_id ASC
        `;

        [machines] = await sequelize.query(machinesQuery, {
          replacements: [chart.channel]
        });
      } else {
        // For society-assigned charts
        const societiesQuery = `
          SELECT DISTINCT society_id FROM \`${schemaName}\`.rate_charts
          WHERE id IN (${chartIds.join(',')})
        `;
        const [societyResults] = await sequelize.query(societiesQuery);
        const societyIds = (societyResults as Array<{ society_id: number }>).map(s => s.society_id);

        const machinesQuery = `
          SELECT DISTINCT
            m.id,
            m.machine_id as machineId,
            m.society_id as societyId,
            m.machine_type as machineType,
            m.location,
            s.name as societyName,
            s.society_id as societyIdentifier,
            CASE WHEN rcdh.id IS NOT NULL THEN 1 ELSE 0 END as downloaded
          FROM \`${schemaName}\`.machines m
          INNER JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
          LEFT JOIN \`${schemaName}\`.rate_chart_download_history rcdh 
            ON m.id = rcdh.machine_id 
            AND rcdh.rate_chart_id IN (${chartIds.join(',')})
            AND rcdh.channel = ?
          WHERE m.society_id IN (${societyIds.join(',')}) AND m.status = 1
          ORDER BY m.machine_id ASC
        `;

        [machines] = await sequelize.query(machinesQuery, {
          replacements: [chart.channel]
        });
      }

      console.log(`✅ Retrieved ${Array.isArray(machines) ? machines.length : 0} machines that downloaded chart ID ${chartIdNum}`);

      return createSuccessResponse('Machines retrieved successfully', { machines, isBmcAssigned: chart.is_bmc_assigned });
    }

    // Use case 2: Fetch rate chart data (fileName, channel, societyId provided)
    if (!fileName || !channel || !societyId) {
      return createErrorResponse('Either chartId OR (fileName, channel, societyId) are required', 400);
    }

    // Find the rate chart
    const chartQuery = `
      SELECT rc.id, rc.file_name, rc.channel
      FROM \`${schemaName}\`.rate_charts rc
      WHERE rc.file_name = ? 
        AND rc.channel = ? 
        AND rc.society_id = ?
        AND rc.status = 1
      LIMIT 1
    `;

    const [charts] = await sequelize.query(chartQuery, {
      replacements: [fileName, channel, societyId]
    });

    if (!Array.isArray(charts) || charts.length === 0) {
      return createErrorResponse('Rate chart not found', 404);
    }

    const chart = charts[0] as { id: number; file_name: string; channel: string };

    // Fetch rate chart data
    const dataQuery = `
      SELECT fat, snf, clr, rate
      FROM \`${schemaName}\`.rate_chart_data
      WHERE rate_chart_id = ?
      ORDER BY CAST(fat AS DECIMAL(5,2)) ASC, CAST(snf AS DECIMAL(5,2)) ASC
    `;

    const [data] = await sequelize.query(dataQuery, {
      replacements: [chart.id]
    });

    console.log(`✅ Retrieved ${Array.isArray(data) ? data.length : 0} rate chart records for ${fileName} (${channel})`);

    return createSuccessResponse('Rate chart data retrieved successfully', data);

  } catch (error) {
    console.error('Error fetching rate chart data:', error);
    return createErrorResponse('Failed to fetch rate chart data', 500);
  }
}
