import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

// Calculate user statistics for last 30 days
async function calculateStatistics(
  schemaName: string,
  entityType: 'society' | 'dairy' | 'bmc' | 'farmer' | 'admin',
  entityId: number,
  userEmail?: string
): Promise<{
  totalRevenue30Days: number;
  totalCollection30Days: number;
  avgFat: number;
  avgSnf: number;
  avgClr: number;
}> {
  try {
    const { sequelize } = await import('@/models').then(m => m.getModels());
    
    console.log(`📊 [Stats API] Calculating for ${entityType} ID ${entityId} in schema ${schemaName}`);
    
    // Date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    console.log(`📊 [Stats API] Date range: From ${dateStr} to today`);

    let query = '';
    let replacements: any[] = [];

    // Build query based on entity type
    if (entityType === 'admin') {
      query = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as totalRevenue,
          COALESCE(SUM(quantity), 0) as totalCollection,
          COALESCE(AVG(fat_percentage), 0) as avgFat,
          COALESCE(AVG(snf_percentage), 0) as avgSnf,
          COALESCE(AVG(clr_value), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections
        WHERE collection_date >= ?
      `;
      replacements = [dateStr];
    } else if (entityType === 'farmer') {
      // Use email from token to find farmer
      if (!userEmail) {
        console.log(`⚠️ [Stats API] No email provided for farmer`);
        return {
          totalRevenue30Days: 0,
          totalCollection30Days: 0,
          avgFat: 0,
          avgSnf: 0,
          avgClr: 0,
        };
      }
      
      console.log(`📊 [Stats API] Looking up farmer by email: ${userEmail}`);
      
      const farmerQuery = `SELECT farmer_id FROM \`${schemaName}\`.farmers WHERE email = ?`;
      const [farmerResults] = await sequelize.query(farmerQuery, { replacements: [userEmail] });
      
      if (!Array.isArray(farmerResults) || farmerResults.length === 0) {
        console.log(`⚠️ [Stats API] No farmer found for email ${userEmail}`);
        return {
          totalRevenue30Days: 0,
          totalCollection30Days: 0,
          avgFat: 0,
          avgSnf: 0,
          avgClr: 0,
        };
      }
      
      const farmerIdStr = (farmerResults[0] as any).farmer_id;
      console.log(`📊 [Stats API] Found farmer_id ${farmerIdStr} for email ${userEmail}`);
      
      query = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as totalRevenue,
          COALESCE(SUM(quantity), 0) as totalCollection,
          COALESCE(AVG(fat_percentage), 0) as avgFat,
          COALESCE(AVG(snf_percentage), 0) as avgSnf,
          COALESCE(AVG(clr_value), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections
        WHERE farmer_id = ? AND collection_date >= ?
      `;
      replacements = [farmerIdStr, dateStr];
    } else if (entityType === 'society') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf,
          COALESCE(AVG(mc.clr_value), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections mc
        WHERE mc.society_id = ? AND mc.collection_date >= ?
      `;
      replacements = [entityId, dateStr];
    } else if (entityType === 'bmc') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf,
          COALESCE(AVG(mc.clr_value), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections mc
        INNER JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
        WHERE s.bmc_id = ? AND mc.collection_date >= ?
      `;
      replacements = [entityId, dateStr];
    } else if (entityType === 'dairy') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf,
          COALESCE(AVG(mc.clr_value), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections mc
        WHERE mc.collection_date >= ?
      `;
      replacements = [dateStr];
    }

    console.log(`📊 [Stats API] Executing query...`);
    const [results] = await sequelize.query(query, { replacements });
    
    if (Array.isArray(results) && results.length > 0) {
      const stats = results[0] as any;
      const calculatedStats = {
        totalRevenue30Days: parseFloat(stats.totalRevenue || 0),
        totalCollection30Days: parseFloat(stats.totalCollection || 0),
        avgFat: parseFloat(stats.avgFat || 0),
        avgSnf: parseFloat(stats.avgSnf || 0),
        avgClr: parseFloat(stats.avgClr || 0),
      };
      console.log(`📊 [Stats API] Results:`, calculatedStats);
      return calculatedStats;
    }
  } catch (error) {
    console.error('❌ [Stats API] Error calculating statistics:', error);
  }

  // Return zeros if query fails or no data
  return {
    totalRevenue30Days: 0,
    totalCollection30Days: 0,
    avgFat: 0,
    avgSnf: 0,
    avgClr: 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [Stats API] ===== NEW REQUEST =====');
    
    // Get auth token
    const authHeader = request.headers.get('authorization');
    console.log('📊 [Stats API] Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ [Stats API] No Bearer token found');
      return createErrorResponse('Unauthorized', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    console.log('📊 [Stats API] Token extracted, length:', token.length);
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('📊 [Stats API] Token decoded successfully');
      console.log('📊 [Stats API] Token payload:', JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ [Stats API] Token verification failed:', error);
      return createErrorResponse('Invalid or expired token', 401, undefined, corsHeaders);
    }

    await connectDB();
    console.log('📊 [Stats API] Database connected');

    // Extract entity info from token
    const { id, role, schemaName, email } = decoded;
    console.log('📊 [Stats API] Extracted from token - id:', id, 'role:', role, 'schemaName:', schemaName, 'email:', email);

    if (!id || !role || !schemaName) {
      console.log('❌ [Stats API] Missing required fields in token');
      return createErrorResponse('Invalid token payload', 400, undefined, corsHeaders);
    }

    console.log(`📊 [Stats API] Request from ${role} ID ${id} in schema ${schemaName}`);

    // Calculate statistics
    const statistics = await calculateStatistics(schemaName, role, id, email);
    console.log('📊 [Stats API] Statistics result:', statistics);

    return createSuccessResponse(
      'Statistics retrieved successfully',
      statistics,
      200,
      corsHeaders
    );

  } catch (error) {
    console.error('❌ [Stats API] Error:', error);
    return createErrorResponse(
      'Failed to fetch statistics',
      500,
      error,
      corsHeaders
    );
  }
}
