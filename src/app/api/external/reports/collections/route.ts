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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization token required', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id, role, schemaName } = decoded;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    let query = '';
    let replacements: any[] = [];

    // Build query based on user role
    if (role === 'society') {
      query = `
        SELECT 
          mc.id,
          mc.farmer_id,
          COALESCE(f.name, 'Unknown') as farmer_name,
          s.society_id,
          s.name as society_name,
          s.bmc_id,
          b.name as bmc_name,
          b.dairy_farm_id as dairy_id,
          df.name as dairy_name,
          m.machine_id,
          mc.collection_date,
          mc.collection_time,
          mc.shift_type,
          mc.channel,
          mc.quantity,
          mc.fat_percentage,
          mc.snf_percentage,
          mc.clr_value,
          mc.protein_percentage,
          mc.lactose_percentage,
          mc.salt_percentage,
          mc.water_percentage,
          mc.temperature,
          mc.rate_per_liter,
          mc.bonus,
          mc.total_amount,
          mc.machine_type,
          mc.machine_version,
          mc.created_at
        FROM \`${schemaName}\`.milk_collections mc
        LEFT JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.farmer_id AND f.society_id = mc.society_id
        LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
        LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
        WHERE mc.society_id = ?
        ORDER BY mc.collection_date DESC, mc.collection_time DESC
        LIMIT ? OFFSET ?
      `;
      replacements = [id, limit, offset];
    } else {
      return createErrorResponse('Unauthorized role', 403, undefined, corsHeaders);
    }

    const [records] = await sequelize.query(query, { replacements });

    return createSuccessResponse('Collections retrieved successfully', {
      records,
      limit,
      offset,
    }, 200, corsHeaders);

  } catch (error: any) {
    console.error('Error fetching collections:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch collections', 500, undefined, corsHeaders);
  }
}
