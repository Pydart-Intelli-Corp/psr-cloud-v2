import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { QueryTypes } from 'sequelize';

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

/**
 * PUT /api/external/auth/machines/[id]/password
 * Update machine passwords (User and Supervisor)
 * Only accessible by admin or society users
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    const { entityType, schemaName } = payload;

    // Only admin and society can update machine passwords
    if (!['admin', 'society'].includes(entityType)) {
      return createErrorResponse('Permission denied. Only admin or society can update machine passwords', 403, undefined, corsHeaders);
    }

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    // Parse request body
    const { userPassword, supervisorPassword } = await request.json();

    // Validate input - at least one password required
    if (!userPassword && !supervisorPassword) {
      return createErrorResponse('At least one password must be provided', 400, undefined, corsHeaders);
    }

    // Validate password format (6 digits)
    const validatePassword = (pwd: string, name: string) => {
      if (!pwd) return null;
      if (pwd.length !== 6) return `${name} must be exactly 6 digits`;
      if (!/^\d{6}$/.test(pwd)) return `${name} must contain only digits`;
      return null;
    };

    if (userPassword) {
      const error = validatePassword(userPassword, 'User password');
      if (error) {
        return createErrorResponse(error, 400, undefined, corsHeaders);
      }
    }

    if (supervisorPassword) {
      const error = validatePassword(supervisorPassword, 'Supervisor password');
      if (error) {
        return createErrorResponse(error, 400, undefined, corsHeaders);
      }
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // For society users, verify they own the machine
    if (entityType === 'society') {
      const [machineCheck] = await sequelize.query(`
        SELECT m.id, m.society_id, m.bmc_id 
        FROM \`${schemaName}\`.machines m
        WHERE m.id = ?
      `, { replacements: [id] }) as any[];

      if (!machineCheck || machineCheck.length === 0) {
        return createErrorResponse('Machine not found', 404, undefined, corsHeaders);
      }

      // Check if machine belongs to society (either directly or through BMC)
      if (machineCheck[0].society_id !== payload.id && !machineCheck[0].bmc_id) {
        return createErrorResponse('Permission denied. You can only update passwords for machines in your society', 403, undefined, corsHeaders);
      }
    }

    // Determine password status based on provided passwords
    // Status 1 = Password set (ready to inject)
    // Status 0 = No password OR password already injected
    const statusU = userPassword ? 1 : 0;
    const statusS = supervisorPassword ? 1 : 0;

    // Build dynamic update query based on what was provided
    let updateFields = [];
    let replacements: any[] = [];

    if (userPassword !== undefined) {
      updateFields.push('user_password = ?');
      updateFields.push('statusU = ?');
      replacements.push(userPassword || null);
      replacements.push(statusU);
    }

    if (supervisorPassword !== undefined) {
      updateFields.push('supervisor_password = ?');
      updateFields.push('statusS = ?');
      replacements.push(supervisorPassword || null);
      replacements.push(statusS);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    replacements.push(id);

    const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const [results] = await sequelize.query(updateQuery, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (results === 0) {
      return createErrorResponse('Machine not found or no changes made', 404, undefined, corsHeaders);
    }

    console.log(`✅ Machine passwords updated - ID: ${id}, User: ${userPassword ? 'Set' : 'N/A'}, Supervisor: ${supervisorPassword ? 'Set' : 'N/A'}`);

    return createSuccessResponse(
      'Machine passwords updated successfully',
      { 
        machineId: parseInt(id),
        statusU: userPassword ? statusU : undefined,
        statusS: supervisorPassword ? statusS : undefined,
        message: 'Passwords will be downloaded to the machine on next sync'
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error('Error updating machine passwords:', error);
    return createErrorResponse('Failed to update machine passwords', 500, undefined, corsHeaders);
  }
}

/**
 * GET /api/external/auth/machines/[id]/password
 * Get machine password status and actual passwords (for authorized users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    const { entityType, schemaName } = payload;

    if (!['admin', 'society'].includes(entityType)) {
      return createErrorResponse('Permission denied', 403, undefined, corsHeaders);
    }

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // For society users, verify they own the machine
    if (entityType === 'society') {
      const [machineCheck] = await sequelize.query(`
        SELECT m.id, m.society_id, m.bmc_id 
        FROM \`${schemaName}\`.machines m
        WHERE m.id = ?
      `, { replacements: [id] }) as any[];

      if (!machineCheck || machineCheck.length === 0) {
        return createErrorResponse('Machine not found', 404, undefined, corsHeaders);
      }

      // Check if machine belongs to society (either directly or through BMC)
      if (machineCheck[0].society_id !== payload.id && !machineCheck[0].bmc_id) {
        return createErrorResponse('Permission denied. You can only view passwords for machines in your society', 403, undefined, corsHeaders);
      }
    }

    const [machines] = await sequelize.query(`
      SELECT 
        m.id, m.machine_id, m.statusU, m.statusS,
        m.user_password, m.supervisor_password,
        CASE WHEN m.user_password IS NOT NULL AND m.user_password != '' THEN true ELSE false END as hasUserPassword,
        CASE WHEN m.supervisor_password IS NOT NULL AND m.supervisor_password != '' THEN true ELSE false END as hasSupervisorPassword
      FROM \`${schemaName}\`.machines m
      WHERE m.id = ?
    `, { replacements: [id] }) as any[];

    if (!machines || machines.length === 0) {
      return createErrorResponse('Machine not found', 404, undefined, corsHeaders);
    }

    const machine = machines[0];

    return createSuccessResponse('Machine password status retrieved', {
      machineId: machine.machine_id,
      hasUserPassword: !!machine.hasUserPassword,
      hasSupervisorPassword: !!machine.hasSupervisorPassword,
      userPassword: machine.user_password || null,
      supervisorPassword: machine.supervisor_password || null,
      userPasswordStatus: machine.statusU === 1 ? 'pending' : (machine.hasUserPassword ? 'downloaded' : 'none'),
      supervisorPasswordStatus: machine.statusS === 1 ? 'pending' : (machine.hasSupervisorPassword ? 'downloaded' : 'none'),
    }, 200, corsHeaders);

  } catch (error) {
    console.error('Error getting machine password status:', error);
    return createErrorResponse('Failed to get password status', 500, undefined, corsHeaders);
  }
}
