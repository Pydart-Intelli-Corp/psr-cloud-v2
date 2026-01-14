import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/user/ratechart/download-status?chartId=123
 * Fetch download status for all machines in societies assigned to a specific chart
 */
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

    if (!chartId) {
      return createErrorResponse('Chart ID is required', 400);
    }

    const chartIdNum = parseInt(chartId);
    if (isNaN(chartIdNum)) {
      return createErrorResponse('Invalid chart ID', 400);
    }

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

    // Get the rate chart details including BMC assignment
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

    // Get all society IDs associated with these charts
    let societiesQuery: string;
    let societyResults: any[];

    if (chart.is_bmc_assigned) {
      // For BMC-assigned charts, get all BMC IDs from all chart records
      const bmcIdsQuery = `
        SELECT DISTINCT bmc_id FROM \`${schemaName}\`.rate_charts
        WHERE id IN (${chartIds.join(',')})
      `;
      const [bmcResults] = await sequelize.query(bmcIdsQuery);
      const bmcIds = (bmcResults as Array<{ bmc_id: number }>).map(b => b.bmc_id);

      // Get machines for ALL BMCs
      const downloadStatusBySociety: Record<number, any> = {};
      let totalMachines = 0;
      let totalDownloaded = 0;

      for (const bmcId of bmcIds) {
        const machinesQuery = `
          SELECT 
            m.id,
            m.machine_id as machineId,
            m.machine_type as machineType,
            m.location,
            rcdh.downloaded_at as downloadedAt
          FROM \`${schemaName}\`.machines m
          LEFT JOIN \`${schemaName}\`.rate_chart_download_history rcdh 
            ON m.id = rcdh.machine_id 
            AND rcdh.rate_chart_id IN (${chartIds.join(',')})
            AND rcdh.channel = ?
          WHERE m.bmc_id = ? AND m.status = 1
          ORDER BY m.machine_id ASC
        `;

        const [machinesResults] = await sequelize.query(machinesQuery, {
          replacements: [chart.channel, bmcId]
        });

        const machines = (machinesResults as Array<{
          id: number;
          machineId: string;
          machineType: string;
          location: string | null;
          downloadedAt: string | null;
        }>).map(m => ({
          ...m,
          downloaded: !!m.downloadedAt,
          downloadedAt: m.downloadedAt
        }));

        const downloadedCount = machines.filter(m => m.downloaded).length;

        // Get BMC name
        const bmcQuery = `SELECT name, bmc_id FROM \`${schemaName}\`.bmcs WHERE id = ?`;
        const [bmcDataResults] = await sequelize.query(bmcQuery, {
          replacements: [bmcId]
        });
        const bmcData = bmcDataResults[0] as { name: string; bmc_id: string };

        downloadStatusBySociety[bmcId] = {
          societyId: bmcId,
          societyName: bmcData?.name || 'BMC',
          societyIdentifier: bmcData?.bmc_id || '',
          totalMachines: machines.length,
          downloadedMachines: downloadedCount,
          pendingMachines: machines.length - downloadedCount,
          machines
        };

        totalMachines += machines.length;
        totalDownloaded += downloadedCount;
      }

      const totalPending = totalMachines - totalDownloaded;
      const allDownloaded = totalMachines > 0 && totalPending === 0;

      return createSuccessResponse('Download status retrieved successfully', {
        chartId: chartIdNum,
        channel: chart.channel,
        allDownloaded,
        totalMachines,
        totalDownloaded,
        totalPending,
        societies: downloadStatusBySociety
      });
    }

    // For society-assigned charts, get societies from chart records
    societiesQuery = `
      SELECT DISTINCT rc.society_id, s.name, s.society_id as identifier
      FROM \`${schemaName}\`.rate_charts rc
      LEFT JOIN \`${schemaName}\`.societies s ON rc.society_id = s.id
      WHERE rc.id IN (${chartIds.join(',')})
    `;
    [societyResults] = await sequelize.query(societiesQuery);
    const societies = societyResults as Array<{ society_id: number; name: string; identifier: string }>;

    // For each society, get machine download status
    const downloadStatusBySociety: Record<number, {
      societyId: number;
      societyName: string;
      societyIdentifier: string;
      totalMachines: number;
      downloadedMachines: number;
      pendingMachines: number;
      machines: Array<{
        id: number;
        machineId: string;
        machineType: string;
        location: string | null;
        downloaded: boolean;
        downloadedAt: string | null;
      }>;
    }> = {};

    for (const society of societies) {
      // Get all active machines for this society
      const machinesQuery = `
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          m.location,
          rcdh.downloaded_at as downloadedAt
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.rate_chart_download_history rcdh 
          ON m.id = rcdh.machine_id 
          AND rcdh.rate_chart_id IN (${chartIds.join(',')})
          AND rcdh.channel = ?
        WHERE m.society_id = ? AND m.status = 1 AND m.bmc_id IS NULL
        ORDER BY m.machine_id ASC
      `;

      const [machinesResults] = await sequelize.query(machinesQuery, {
        replacements: [chart.channel, society.society_id]
      });

      const machines = (machinesResults as Array<{
        id: number;
        machineId: string;
        machineType: string;
        location: string | null;
        downloadedAt: string | null;
      }>).map(m => ({
        ...m,
        downloaded: !!m.downloadedAt,
        downloadedAt: m.downloadedAt
      }));

      const downloadedCount = machines.filter(m => m.downloaded).length;

      downloadStatusBySociety[society.society_id] = {
        societyId: society.society_id,
        societyName: society.name,
        societyIdentifier: society.identifier,
        totalMachines: machines.length,
        downloadedMachines: downloadedCount,
        pendingMachines: machines.length - downloadedCount,
        machines
      };
    }

    // Calculate overall status
    const allSocieties = Object.values(downloadStatusBySociety);
    const totalMachines = allSocieties.reduce((sum, s) => sum + s.totalMachines, 0);
    const totalDownloaded = allSocieties.reduce((sum, s) => sum + s.downloadedMachines, 0);
    const totalPending = totalMachines - totalDownloaded;
    const allDownloaded = totalMachines > 0 && totalPending === 0;

    return createSuccessResponse('Download status retrieved successfully', {
      chartId: chartIdNum,
      channel: chart.channel,
      allDownloaded,
      totalMachines,
      totalDownloaded,
      totalPending,
      societies: downloadStatusBySociety
    });

  } catch (error) {
    console.error('Error fetching download status:', error);
    return createErrorResponse('Failed to fetch download status', 500);
  }
}
