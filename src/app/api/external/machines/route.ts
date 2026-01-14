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

    let machines: any[] = [];

    try {
      switch (entityType) {
        case 'admin':
          // Admin gets all machines in their schema
          const [adminMachines] = await sequelize.query(`
            SELECT 
              m.id,
              m.machine_id,
              m.machine_type,
              m.status,
              m.location,
              m.installation_date,
              m.operator_name,
              m.contact_phone,
              s.name as society_name,
              b.name as bmc_name
            FROM \`${schemaName}\`.machines m
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON (s.bmc_id = b.id OR m.bmc_id = b.id)
            ORDER BY m.created_at DESC
          `);
          machines = adminMachines as any[];
          break;
          
        case 'society':
          // Get machines for society
          const [societyMachines] = await sequelize.query(`
            SELECT 
              m.id,
              m.machine_id,
              m.machine_type,
              m.status,
              m.location,
              m.installation_date,
              m.operator_name,
              m.contact_phone,
              s.name as society_name
            FROM \`${schemaName}\`.machines m
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE m.society_id = ?
            ORDER BY m.created_at DESC
          `, { replacements: [id] });
          machines = societyMachines as any[];
          break;

        case 'bmc':
          // Get machines for all societies under BMC
          const [bmcMachines] = await sequelize.query(`
            SELECT 
              m.id,
              m.machine_id,
              m.machine_type,
              m.status,
              m.location,
              m.installation_date,
              m.operator_name,
              m.contact_phone,
              s.name as society_name
            FROM \`${schemaName}\`.machines m
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE s.bmc_id = ?
            ORDER BY m.created_at DESC
          `, { replacements: [id] });
          machines = bmcMachines as any[];
          break;

        case 'dairy':
          // Get machines for all societies under dairy's BMCs
          const [dairyMachines] = await sequelize.query(`
            SELECT 
              m.id,
              m.machine_id,
              m.machine_type,
              m.status,
              m.location,
              m.installation_date,
              m.operator_name,
              m.contact_phone,
              s.name as society_name,
              b.name as bmc_name
            FROM \`${schemaName}\`.machines m
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            WHERE b.dairy_id = ?
            ORDER BY m.created_at DESC
          `, { replacements: [id] });
          machines = dairyMachines as any[];
          break;

        case 'farmer':
          // Farmers cannot access machines
          return createSuccessResponse(
            'Farmers do not have access to machine information',
            [],
            200,
            corsHeaders
          );

        default:
          return createErrorResponse('Invalid entity type', 400, undefined, corsHeaders);
      }

      return createSuccessResponse(
        'Machines retrieved successfully',
        machines,
        200,
        corsHeaders
      );

    } catch (error) {
      console.error('Error fetching machines:', error);
      return createErrorResponse(
        'Failed to fetch machines data',
        500,
        undefined,
        corsHeaders
      );
    }

  } catch (error) {
    console.error('Machines API error:', error);
    return createErrorResponse(
      'An error occurred while processing your request',
      500,
      undefined,
      corsHeaders
    );
  }
}
