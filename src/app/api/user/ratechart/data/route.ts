import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

// GET - Fetch rate chart data
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
    const fileName = searchParams.get('fileName');
    const channel = searchParams.get('channel');
    const societyId = searchParams.get('societyId');

    if (!fileName || !channel || !societyId) {
      return createErrorResponse('File name, channel, and society ID are required', 400);
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
