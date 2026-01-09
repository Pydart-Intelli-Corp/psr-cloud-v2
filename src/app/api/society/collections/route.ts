import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/society/collections
 * Get milk collection records for the society
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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!societyId || !schemaName) {
      return createErrorResponse('Society ID and schemaName are required', 400);
    }

    // Verify this society matches the authenticated user
    if (payload.uid !== societyId) {
      return createErrorResponse('Unauthorized access to society data', 403);
    }

    console.log(`📊 Fetching collections for society ${societyId} in schema ${schemaName}`);

    // Build date filter
    let dateFilter = '';
    const replacements: any[] = [societyId];
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND mc.collection_date BETWEEN ? AND ?';
      replacements.push(dateFrom, dateTo);
    } else if (dateFrom) {
      dateFilter = 'AND mc.collection_date >= ?';
      replacements.push(dateFrom);
    } else if (dateTo) {
      dateFilter = 'AND mc.collection_date <= ?';
      replacements.push(dateTo);
    }

    // Query collections for all farmers in this society
    const collections = await sequelize.query(`
      SELECT 
        mc.id,
        mc.collection_date as collectionDate,
        mc.collection_time as collectionTime,
        mc.shift_type as shiftType,
        mc.channel,
        mc.farmer_id as farmerId,
        f.name as farmerName,
        mc.quantity,
        mc.fat_percentage as fatPercentage,
        mc.snf_percentage as snfPercentage,
        mc.clr_value as clrValue,
        mc.rate_per_liter as ratePerLiter,
        mc.total_amount as totalAmount
      FROM \`${schemaName}\`.milk_collections mc
      JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.farmer_id
      WHERE f.society_id = ? ${dateFilter}
      ORDER BY mc.collection_date DESC, mc.collection_time DESC
      LIMIT ${limit} OFFSET ${offset}
    `, { 
      replacements,
      type: 'SELECT'
    }) as any[];

    console.log(`✅ Retrieved ${collections.length} collection records`);

    return NextResponse.json({
      success: true,
      message: 'Collection records retrieved successfully',
      data: collections,
      pagination: {
        limit,
        offset,
        hasMore: collections.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Error fetching society collections:', error);
    return createErrorResponse('Failed to fetch collection records', 500);
  }
}
