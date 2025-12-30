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
          s.id,
          s.count,
          s.sales_date,
          s.sales_time,
          s.shift_type,
          s.channel,
          s.quantity,
          s.rate_per_liter,
          s.total_amount,
          s.machine_type,
          s.machine_version,
          s.created_at,
          soc.society_id,
          soc.name as society_name,
          soc.bmc_id,
          b.name as bmc_name,
          b.dairy_farm_id as dairy_id,
          df.name as dairy_name,
          m.machine_id
        FROM \`${schemaName}\`.milk_sales s
        LEFT JOIN \`${schemaName}\`.societies soc ON s.society_id = soc.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON soc.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
        LEFT JOIN \`${schemaName}\`.machines m ON s.machine_id = m.id
        WHERE s.society_id = ?
        ORDER BY s.sales_date DESC, s.sales_time DESC, s.created_at DESC
        LIMIT ? OFFSET ?
      `;
      replacements = [id, limit, offset];
    } else {
      return createErrorResponse('Unauthorized role', 403, undefined, corsHeaders);
    }

    const [records] = await sequelize.query(query, { replacements });

    return createSuccessResponse('Sales retrieved successfully', {
      records,
      limit,
      offset,
    }, 200, corsHeaders);

  } catch (error: any) {
    console.error('Error fetching sales:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch sales', 500, undefined, corsHeaders);
  }
}
