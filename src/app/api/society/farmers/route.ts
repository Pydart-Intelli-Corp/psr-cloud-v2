import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/society/farmers
 * Get farmers belonging to the society
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
    const status = searchParams.get('status'); // 'active', 'inactive', or 'all'
    const search = searchParams.get('search');

    if (!societyId || !schemaName) {
      return createErrorResponse('Society ID and schemaName are required', 400);
    }

    // Verify this society matches the authenticated user
    if (payload.uid !== societyId) {
      return createErrorResponse('Unauthorized access to society data', 403);
    }

    console.log(`👨‍🌾 Fetching farmers for society ${societyId} in schema ${schemaName}`);

    // Build query with optional filters
    let query = `
      SELECT 
        f.id,
        f.farmer_id as farmerId,
        f.name as farmerName,
        f.phone,
        f.email,
        f.address,
        f.village,
        f.channel,
        f.status,
        f.created_at as createdAt,
        (SELECT COUNT(*) FROM \`${schemaName}\`.milk_collections mc WHERE mc.farmer_id = f.farmer_id) as totalCollections,
        (SELECT COALESCE(SUM(quantity), 0) FROM \`${schemaName}\`.milk_collections mc WHERE mc.farmer_id = f.farmer_id) as totalQuantity
      FROM \`${schemaName}\`.farmers f
      WHERE f.society_id = ?
    `;
    
    const replacements: any[] = [societyId];

    // Add status filter
    if (status && status !== 'all') {
      query += ` AND f.status = ?`;
      replacements.push(status === 'active' ? 1 : 0);
    }

    // Add search filter
    if (search) {
      query += ` AND (f.farmer_id LIKE ? OR f.name LIKE ? OR f.phone LIKE ?)`;
      const searchPattern = `%${search}%`;
      replacements.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY f.name ASC`;

    const [farmers] = await sequelize.query(query, { 
      replacements,
      type: 'SELECT'
    });

    console.log(`✅ Retrieved ${(farmers as any[]).length} farmers for society ${societyId}`);

    return NextResponse.json({
      success: true,
      message: 'Farmers retrieved successfully',
      data: farmers
    });

  } catch (error) {
    console.error('❌ Error fetching society farmers:', error);
    return createErrorResponse('Failed to fetch farmers', 500);
  }
}
