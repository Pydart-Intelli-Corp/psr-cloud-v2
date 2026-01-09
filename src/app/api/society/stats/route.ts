import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/society/stats
 * Get society's statistics including farmers, collections, and revenue
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

    console.log(`📊 Fetching stats for society ${societyId} in schema ${schemaName}`);

    // Get current date info for 30-day calculations
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get farmer statistics
    const [farmerResults] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalFarmers,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as activeFarmers
      FROM \`${schemaName}\`.farmers
      WHERE society_id = ?
    `, { 
      replacements: [societyId],
      type: 'SELECT'
    });

    // Get collection statistics for last 30 days
    const [collectionResults] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalCollections,
        COALESCE(SUM(quantity), 0) as totalQuantity,
        COALESCE(AVG(fat_percentage), 0) as avgFat,
        COALESCE(AVG(snf_percentage), 0) as avgSNF,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        MAX(collection_date) as lastCollectionDate
      FROM \`${schemaName}\`.milk_collections mc
      JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.farmer_id
      WHERE f.society_id = ? AND mc.collection_date >= ?
    `, { 
      replacements: [societyId, thirtyDaysAgo],
      type: 'SELECT'
    });

    // Get monthly comparison
    const [monthlyResults] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN MONTH(mc.collection_date) = ? AND YEAR(mc.collection_date) = ? 
          THEN mc.quantity 
          ELSE 0 
        END), 0) as thisMonthQuantity,
        COALESCE(SUM(CASE 
          WHEN MONTH(mc.collection_date) = ? AND YEAR(mc.collection_date) = ? 
          THEN mc.quantity 
          ELSE 0 
        END), 0) as lastMonthQuantity
      FROM \`${schemaName}\`.milk_collections mc
      JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.farmer_id
      WHERE f.society_id = ?
    `, { 
      replacements: [currentMonth, currentYear, lastMonth, lastMonthYear, societyId],
      type: 'SELECT'
    });

    const farmerData = (farmerResults || {}) as any;
    const collectionData = (collectionResults || {}) as any;
    const monthlyData = (monthlyResults || {}) as any;

    const statsData = {
      totalFarmers: parseInt(farmerData.totalFarmers) || 0,
      activeFarmers: parseInt(farmerData.activeFarmers) || 0,
      totalCollections: parseInt(collectionData.totalCollections) || 0,
      totalQuantity: parseFloat(collectionData.totalQuantity) || 0,
      avgFat: parseFloat(collectionData.avgFat) || 0,
      avgSNF: parseFloat(collectionData.avgSNF) || 0,
      totalRevenue: parseFloat(collectionData.totalRevenue) || 0,
      lastCollectionDate: collectionData.lastCollectionDate || null,
      thisMonthQuantity: parseFloat(monthlyData.thisMonthQuantity) || 0,
      lastMonthQuantity: parseFloat(monthlyData.lastMonthQuantity) || 0
    };

    console.log(`✅ Stats retrieved for society ${societyId}:`, statsData);

    return NextResponse.json({
      success: true,
      message: 'Society statistics retrieved successfully',
      data: statsData
    });

  } catch (error) {
    console.error('❌ Error fetching society stats:', error);
    return createErrorResponse('Failed to fetch society statistics', 500);
  }
}
