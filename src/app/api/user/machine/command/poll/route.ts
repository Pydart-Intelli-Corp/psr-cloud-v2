import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/user/machine/command/poll
 * Poll for pending commands for a machine
 * Machines or the mobile app use this to get commands to send via BLE
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get machineId from query params
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: 'machineId is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // First, expire old pending commands
    await sequelize.query(`
      UPDATE machine_commands 
      SET status = 'expired' 
      WHERE machine_id = ? 
        AND status = 'pending' 
        AND expires_at < NOW()
    `, {
      replacements: [machineId]
    });

    // Get pending commands for this machine
    const [commands]: any = await sequelize.query(`
      SELECT id, command_type, hex_command, command_description, created_at, expires_at
      FROM machine_commands
      WHERE machine_id = ?
        AND status = 'pending'
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at ASC
      LIMIT 10
    `, {
      replacements: [machineId]
    });

    return NextResponse.json({
      success: true,
      machineId,
      pendingCommands: commands.length,
      commands: commands.map((cmd: any) => ({
        id: cmd.id,
        type: cmd.command_type,
        hex: cmd.hex_command,
        description: cmd.command_description,
        createdAt: cmd.created_at,
        expiresAt: cmd.expires_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to poll commands' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/machine/command/poll
 * Acknowledge that a command has been sent/processed
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commandId, status, errorMessage } = body;

    if (!commandId) {
      return NextResponse.json(
        { success: false, error: 'commandId is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['sent', 'acknowledged', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: sent, acknowledged, or failed' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // Update command status
    const timestampField = status === 'sent' ? 'sent_at' : 'acknowledged_at';
    
    await sequelize.query(`
      UPDATE machine_commands 
      SET status = ?, ${timestampField} = NOW()
      WHERE id = ?
    `, {
      replacements: [status, commandId]
    });

    return NextResponse.json({
      success: true,
      message: `Command ${commandId} marked as ${status}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to acknowledge command' },
      { status: 500 }
    );
  }
}
