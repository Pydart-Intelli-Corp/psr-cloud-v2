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
    const { id: dairyId } = await params;
    
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

    // Fetch Dairy details
    const [dairies] = await sequelize.query(`
      SELECT 
        d.id,
        d.dairy_id,
        d.name,
        d.email,
        d.location,
        d.status,
        d.created_at
      FROM \`${schemaName}\`.dairy_farms d
      WHERE d.id = ?
    `, { replacements: [dairyId] });

    if (!Array.isArray(dairies) || dairies.length === 0) {
      return createErrorResponse('Dairy not found', 404, undefined, corsHeaders);
    }

    return createSuccessResponse('Dairy details retrieved successfully', dairies[0], 200, corsHeaders);

  } catch (error: any) {
    console.error('Error fetching Dairy details:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch Dairy details', 500, undefined, corsHeaders);
  }
}
