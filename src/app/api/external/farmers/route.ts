import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    let farmers: any[] = [];

    try {
      switch (entityType) {
        case 'admin':
          // Admin gets all farmers in their schema
          const [adminFarmers] = await sequelize.query(`
            SELECT 
              f.id,
              f.name,
              f.phone,
              f.email,
              f.society_id,
              s.name as society_name,
              b.name as bmc_name
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            ORDER BY f.name ASC
          `);
          farmers = adminFarmers as any[];
          break;
          
        case 'society':
          // Get farmers for society
          const [societyFarmers] = await sequelize.query(`
            SELECT 
              f.id,
              f.name,
              f.phone,
              f.email,
              f.society_id,
              s.name as society_name
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            WHERE f.society_id = ?
            ORDER BY f.name ASC
          `, { replacements: [id] });
          farmers = societyFarmers as any[];
          break;

        case 'bmc':
          // Get farmers for all societies under BMC
          const [bmcFarmers] = await sequelize.query(`
            SELECT 
              f.id,
              f.name,
              f.phone,
              f.email,
              f.society_id,
              s.name as society_name
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            WHERE s.bmc_id = ?
            ORDER BY f.name ASC
          `, { replacements: [id] });
          farmers = bmcFarmers as any[];
          break;

        case 'dairy':
          // Get farmers for all societies under dairy's BMCs
          const [dairyFarmers] = await sequelize.query(`
            SELECT 
              f.id,
              f.name,
              f.phone,
              f.email,
              f.society_id,
              s.name as society_name,
              b.name as bmc_name
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            WHERE b.dairy_id = ?
            ORDER BY f.name ASC
          `, { replacements: [id] });
          farmers = dairyFarmers as any[];
          break;

        default:
          return createErrorResponse('Unsupported entity type', 403, undefined, corsHeaders);
      }

      return createSuccessResponse('Farmers retrieved successfully', farmers, 200, corsHeaders);

    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Database query failed', 500, queryError.message, corsHeaders);
    }

  } catch (error: any) {
    console.error('Error fetching farmers:', error);
    if (error.name === 'JsonWebTokenError') {
      return createErrorResponse('Invalid token', 401, undefined, corsHeaders);
    }
    return createErrorResponse('Failed to fetch farmers', 500, error.message, corsHeaders);
  }
}
