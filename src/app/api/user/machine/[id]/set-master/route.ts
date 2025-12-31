import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';

// Helper functions for consistent response format
const createSuccessResponse = (message: string, data: unknown = null) => {
  return NextResponse.json({ success: true, message, data }, { status: 200 });
};

const createErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

// PUT - Set machine as master and optionally update all machines in society
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      return createErrorResponse('Authentication required', 401);
    }

    // Extract token - handle both "Bearer token" and "token" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7).trim() 
      : authHeader.trim();
    
    console.log('Extracted token length:', token.length);
    console.log('Token first 20 chars:', token.substring(0, 20));
    
    if (!token) {
      return createErrorResponse('Invalid token format', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return createErrorResponse('Invalid or expired token', 401);
    }

    // Allow admin or society (after access approval) to change master
    if (payload.role !== 'admin' && payload.role !== 'society') {
      return createErrorResponse('Admin or Society access required', 403);
    }

    const { id: machineId } = await params;

    // For society role, verify machine ownership
    if (payload.role === 'society') {
      const { getModels } = await import('@/models');
      const { sequelize } = getModels();
      
      // Get schema name from payload
      const schemaName = payload.schemaName;
      if (!schemaName) {
        return createErrorResponse('Schema not found in token', 400);
      }

      // Check if machine exists and belongs to this society
      const [machineCheck] = await sequelize!.query(
        `SELECT society_id FROM \`${schemaName}\`.machines WHERE id = ?`,
        { replacements: [machineId] }
      );

      if (!machineCheck || (machineCheck as any[]).length === 0) {
        return createErrorResponse('Machine not found', 404);
      }

      const societyId = (machineCheck as any[])[0].society_id;
      
      // Verify this society owns the machine
      if (societyId !== payload.id) {
        return createErrorResponse('Permission denied. You can only change master for machines in your society', 403);
      }
    }
    const { setForAll } = await request.json();

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get schema name based on role
    let schemaName: string;
    
    if (payload.role === 'admin') {
      // For admin, get schema from admin user
      const admin = await User.findByPk(payload.id);
      if (!admin || !admin.dbKey) {
        return createErrorResponse('Admin schema not found', 404);
      }
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    } else {
      // For society and other roles, schema name is in the token payload
      if (!payload.schemaName) {
        return createErrorResponse('Schema not found in token', 400);
      }
      schemaName = payload.schemaName;
    }

    if (!sequelize) {
      return createErrorResponse('Database connection failed', 500);
    }

    // Get current machine details
    const [machineResults] = await sequelize.query(
      `SELECT id, machine_id, society_id, user_password, supervisor_password, statusU, statusS, is_master_machine 
       FROM \`${schemaName}\`.machines 
       WHERE id = ?`,
      { replacements: [machineId] }
    );

    const machine = (machineResults as Array<{
      id: number;
      machine_id: string;
      society_id: number;
      user_password: string | null;
      supervisor_password: string | null;
      statusU: number;
      statusS: number;
      is_master_machine: number;
    }>)[0];
    if (!machine) {
      return createErrorResponse('Machine not found', 404);
    }

    // Start transaction
    await sequelize.query('START TRANSACTION');

    try {
      // If this machine is not already master, update master status
      if (machine.is_master_machine !== 1) {
        // Remove master status from current master in this society
        await sequelize.query(
          `UPDATE \`${schemaName}\`.machines 
           SET is_master_machine = 0 
           WHERE society_id = ? AND is_master_machine = 1`,
          { replacements: [machine.society_id] }
        );

        // Set this machine as master
        await sequelize.query(
          `UPDATE \`${schemaName}\`.machines 
           SET is_master_machine = 1 
           WHERE id = ?`,
          { replacements: [machineId] }
        );

        console.log(`✅ Machine ${machine.machine_id} set as master for society ${machine.society_id}`);
      }

      // If setForAll is true, update all other machines in the society
      if (setForAll) {
        const updateResult = await sequelize.query(
          `UPDATE \`${schemaName}\`.machines 
           SET user_password = ?, 
               supervisor_password = ?, 
               statusU = ?, 
               statusS = ?
           WHERE society_id = ? AND id != ?`,
          { 
            replacements: [
              machine.user_password,
              machine.supervisor_password,
              machine.statusU,
              machine.statusS,
              machine.society_id,
              machineId
            ] 
          }
        );

        const affectedRows = (updateResult as unknown as [{ affectedRows?: number }, unknown])[0]?.affectedRows || 0;
        console.log(`✅ Updated passwords for ${affectedRows} machines in society ${machine.society_id}`);
      }

      // Commit transaction
      await sequelize.query('COMMIT');

      const message = setForAll 
        ? 'Master machine set and all machines in society updated successfully'
        : 'Master machine set successfully';

      return createSuccessResponse(message, {
        machineId: machine.machine_id,
        societyId: machine.society_id,
        machinesUpdated: setForAll
      });

    } catch (error) {
      // Rollback on error
      await sequelize.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error setting master machine:', error);
    return createErrorResponse('Failed to set master machine', 500);
  }
}
