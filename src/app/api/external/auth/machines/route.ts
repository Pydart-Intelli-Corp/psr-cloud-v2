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
              m.id, m.machine_id, m.machine_type, m.status, m.location,
              m.is_master_machine, m.created_at,
              s.name as society_name, s.society_id,
              b.name as bmc_name
            FROM \`${schemaName}\`.machines m
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            ORDER BY b.name, s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `);
          
          machines = adminMachines || [];
          break;
          
        case 'society':
          // Get machines for society
          const [societyMachines] = await sequelize.query(`
            SELECT 
              m.id, m.machine_id, m.machine_type, m.status, m.location,
              m.is_master_machine, m.created_at,
              s.name as society_name, s.society_id
            FROM \`${schemaName}\`.machines m
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE s.id = ?
            ORDER BY m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = societyMachines || [];
          break;

        case 'bmc':
          // Get machines for all societies under this BMC
          const [bmcMachines] = await sequelize.query(`
            SELECT 
              m.id, m.machine_id, m.machine_type, m.status, m.location,
              m.is_master_machine, m.created_at,
              s.name as society_name, s.society_id
            FROM \`${schemaName}\`.machines m
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE s.bmc_id = (SELECT bmc_id FROM \`${schemaName}\`.bmcs WHERE id = ?)
            ORDER BY s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = bmcMachines || [];
          break;

        case 'dairy':
          // Get machines for all societies under this Dairy
          const [dairyMachines] = await sequelize.query(`
            SELECT 
              m.id, m.machine_id, m.machine_type, m.status, m.location,
              m.is_master_machine, m.created_at,
              s.name as society_name, s.society_id,
              b.name as bmc_name
            FROM \`${schemaName}\`.machines m
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            WHERE b.dairy_id = ?
            ORDER BY b.name, s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = dairyMachines || [];
          break;

        case 'farmer':
          // Farmers don't have access to machines
          return createSuccessResponse('Machines data retrieved successfully', {
            type: 'farmer',
            machines: [],
            message: 'Farmers do not have access to machine information'
          });

        default:
          return createErrorResponse('Invalid entity type', 400, undefined, corsHeaders);
      }

      console.log(`✅ Machines data fetched for ${entityType}: ${payload.uid} - ${machines.length} machines`);

      return createSuccessResponse('Machines data retrieved successfully', {
        type: entityType,
        machines: machines || [],
        totalMachines: machines?.length || 0
      }, 200, corsHeaders);

    } catch (queryError) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Failed to fetch machines data', 500, undefined, corsHeaders);
    }

  } catch (error: unknown) {
    console.error('Error fetching machines:', error);
    return createErrorResponse('Failed to fetch machines data', 500, undefined, corsHeaders);
  }
}
