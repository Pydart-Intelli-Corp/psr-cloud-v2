import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/farmer/stats
 * Get farmer's milk collection statistics
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'farmer') {
      return createErrorResponse('Farmer access required', 403);
    }

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get parameters from query string
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const dbKey = searchParams.get('dbKey');

    if (!farmerId || !dbKey) {
      return createErrorResponse('Farmer ID and dbKey are required', 400);
    }

    // Verify this farmer matches the authenticated user
    if (payload.uid !== farmerId) {
      return createErrorResponse('Unauthorized access to farmer data', 403);
    }

    console.log(`📊 Fetching stats for farmer ${farmerId} in schema ${dbKey}`);

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Query farmer's collection statistics
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalCollections,
        COALESCE(SUM(quantity), 0) as totalQuantity,
        COALESCE(AVG(fat_percentage), 0) as avgFat,
        COALESCE(AVG(snf_percentage), 0) as avgSNF,
        MAX(collection_date) as lastCollectionDate,
        COALESCE(SUM(CASE 
          WHEN MONTH(collection_date) = ? AND YEAR(collection_date) = ? 
          THEN quantity 
          ELSE 0 
        END), 0) as thisMonthQuantity,
        COALESCE(SUM(CASE 
          WHEN MONTH(collection_date) = ? AND YEAR(collection_date) = ? 
          THEN quantity 
          ELSE 0 
        END), 0) as lastMonthQuantity
      FROM \`${dbKey}\`.milk_collections
      WHERE farmer_id = ?
    `, { 
      replacements: [currentMonth, currentYear, lastMonth, lastMonthYear, farmerId],
      type: 'SELECT'
    });

    console.log('📊 Raw query results:', results);
    console.log('📊 Results type:', typeof results, 'Is array:', Array.isArray(results), 'Length:', results?.length);
    
    // For aggregate queries, results is the object itself, not an array
    const result = (results || {}) as any;
    console.log('📊 Result object:', result);

    const statsData = {
      totalCollections: parseInt(result.totalCollections) || 0,
      totalQuantity: parseFloat(result.totalQuantity) || 0,
      avgFat: parseFloat(result.avgFat) || 0,
      avgSNF: parseFloat(result.avgSNF) || 0,
      lastCollectionDate: result.lastCollectionDate || null,
      thisMonthQuantity: parseFloat(result.thisMonthQuantity) || 0,
      lastMonthQuantity: parseFloat(result.lastMonthQuantity) || 0
    };

    console.log(`✅ Stats retrieved for farmer ${farmerId}:`, statsData);

    return NextResponse.json({
      success: true,
      message: 'Farmer statistics retrieved successfully',
      data: statsData
    });

  } catch (error) {
    console.error('❌ Error fetching farmer stats:', error);
    return createErrorResponse('Failed to fetch farmer statistics', 500);
  }
}
