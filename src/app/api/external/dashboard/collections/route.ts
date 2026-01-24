import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return createErrorResponse('Unauthorized', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return createErrorResponse('Invalid or expired token', 401, undefined, corsHeaders);
    }

    await connectDB();

    const { email, schemaName, role } = decoded;

    if (!email || !schemaName || role !== 'farmer') {
      return createErrorResponse('Invalid token payload', 400, undefined, corsHeaders);
    }

    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get farmer_id from email
    const farmerQuery = `SELECT farmer_id FROM \`${schemaName}\`.farmers WHERE email = ?`;
    const [farmerResults] = await sequelize.query(farmerQuery, { replacements: [email] });

    if (!Array.isArray(farmerResults) || farmerResults.length === 0) {
      return createSuccessResponse('No farmer found', { collections: [] }, 200, corsHeaders);
    }

    const farmerId = (farmerResults[0] as any).farmer_id;

    // Get collection records
    const collectionsQuery = `
      SELECT 
        mc.*,
        s.name as society_name,
        f.name as farmer_name
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.farmer_id
      WHERE mc.farmer_id = ?
      ORDER BY mc.collection_date DESC, mc.collection_time DESC
      LIMIT 1000
    `;

    const [collections] = await sequelize.query(collectionsQuery, { replacements: [farmerId] });

    // Convert numeric string fields to numbers
    const formattedCollections = Array.isArray(collections) ? collections.map((record: any) => ({
      ...record,
      quantity: parseFloat(record.quantity) || 0,
      total_amount: parseFloat(record.total_amount) || 0,
      fat_percentage: parseFloat(record.fat_percentage) || 0,
      snf_percentage: parseFloat(record.snf_percentage) || 0,
      clr_value: parseFloat(record.clr_value) || 0,
      rate_per_liter: parseFloat(record.rate_per_liter) || 0,
      bonus: parseFloat(record.bonus) || 0,
      water_percentage: parseFloat(record.water_percentage) || 0,
      protein_percentage: parseFloat(record.protein_percentage) || 0,
      lactose_percentage: parseFloat(record.lactose_percentage) || 0,
      salt_percentage: parseFloat(record.salt_percentage) || 0,
      temperature: parseFloat(record.temperature) || 0,
    })) : [];

    return createSuccessResponse(
      'Collections retrieved successfully',
      { collections: formattedCollections },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error('❌ [Collections API] Error:', error);
    return createErrorResponse('Failed to fetch collections', 500, error, corsHeaders);
  }
}
