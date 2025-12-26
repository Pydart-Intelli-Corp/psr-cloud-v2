import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Lightweight analytics summary endpoint
 * Returns only key metrics without detailed breakdowns - much faster
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

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    let dateCondition = '';
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      dateCondition = `WHERE collection_date >= '${startDateStr}'`;
    }

    // Single optimized query for summary statistics
    const [summary] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT id) as totalCollections,
        COALESCE(SUM(quantity), 0) as totalQuantity,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COALESCE(AVG(rate_per_liter), 0) as avgRate,
        COALESCE(
          SUM(quantity * fat_percentage) / NULLIF(SUM(quantity), 0),
          0
        ) as avgFat,
        COALESCE(
          SUM(quantity * snf_percentage) / NULLIF(SUM(quantity), 0),
          0
        ) as avgSnf,
        COUNT(DISTINCT society_id) as activeSocieties,
        COUNT(DISTINCT machine_id) as activeMachines,
        COUNT(DISTINCT DATE(collection_date)) as daysActive
      FROM \`${schemaName}\`.milk_collections
      ${dateCondition}
    `);

    // Quick daily trend (last 7 days only)
    const [dailyTrend] = await sequelize.query(`
      SELECT 
        DATE(collection_date) as date,
        COUNT(*) as collections,
        COALESCE(SUM(quantity), 0) as quantity,
        COALESCE(SUM(total_amount), 0) as amount
      FROM \`${schemaName}\`.milk_collections
      WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(collection_date)
      ORDER BY date DESC
      LIMIT 7
    `);

    // Top 5 societies only
    const [topSocieties] = await sequelize.query(`
      SELECT 
        s.name as societyName,
        COUNT(DISTINCT mc.id) as collections,
        COALESCE(SUM(mc.quantity), 0) as quantity
      FROM \`${schemaName}\`.milk_collections mc
      INNER JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      ${dateCondition}
      GROUP BY s.id, s.name
      ORDER BY quantity DESC
      LIMIT 5
    `);

    return createSuccessResponse('Analytics summary retrieved successfully', {
      summary: summary[0],
      dailyTrend,
      topSocieties
    });

  } catch (error: unknown) {
    console.error('Error fetching analytics summary:', error);
    return createErrorResponse('Failed to fetch analytics summary', 500);
  }
}
