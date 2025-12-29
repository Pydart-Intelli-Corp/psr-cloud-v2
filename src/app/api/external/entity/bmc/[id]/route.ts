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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bmcId } = await params;
    
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization token required', 401, undefined, corsHeaders);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { schemaName } = decoded;

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Fetch BMC details with dairy info
    const [bmcs] = await sequelize.query(`
      SELECT 
        b.id,
        b.bmc_id,
        b.name,
        b.email,
        b.location,
        b.status,
        b.dairy_farm_id,
        d.name as dairy_name,
        d.dairy_id as dairy_identifier,
        d.location as dairy_location
      FROM \`${schemaName}\`.bmcs b
      LEFT JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
      WHERE b.id = ?
    `, { replacements: [bmcId] });

    if (!Array.isArray(bmcs) || bmcs.length === 0) {
      return createErrorResponse('BMC not found', 404, undefined, corsHeaders);
    }

    return createSuccessResponse('BMC details retrieved successfully', bmcs[0], 200, corsHeaders);

  } catch (error: any) {
    console.error('Error fetching BMC details:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch BMC details', 500, undefined, corsHeaders);
  }
}
