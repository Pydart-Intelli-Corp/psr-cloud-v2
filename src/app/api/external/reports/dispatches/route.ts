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
          d.id,
          d.dispatch_id,
          d.dispatch_date,
          d.dispatch_time,
          d.quantity,
          d.fat_percentage,
          d.snf_percentage,
          d.clr_value,
          d.shift_type,
          d.channel,
          d.rate_per_liter,
          d.total_amount,
          d.machine_type,
          d.machine_version,
          d.created_at,
          s.society_id,
          s.name as society_name,
          s.bmc_id,
          b.name as bmc_name,
          b.dairy_farm_id as dairy_id,
          df.name as dairy_name,
          m.machine_id
        FROM \`${schemaName}\`.milk_dispatches d
        LEFT JOIN \`${schemaName}\`.societies s ON d.society_id = s.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
        LEFT JOIN \`${schemaName}\`.machines m ON d.machine_id = m.id
        WHERE d.society_id = ?
        ORDER BY d.dispatch_date DESC, d.dispatch_time DESC, d.created_at DESC
        LIMIT ? OFFSET ?
      `;
      replacements = [id, limit, offset];
    } else {
      return createErrorResponse('Unauthorized role', 403, undefined, corsHeaders);
    }

    const [records] = await sequelize.query(query, { replacements });

    return createSuccessResponse('Dispatches retrieved successfully', {
      records,
      limit,
      offset,
    }, 200, corsHeaders);

  } catch (error: any) {
    console.error('Error fetching dispatches:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch dispatches', 500, undefined, corsHeaders);
  }
}
