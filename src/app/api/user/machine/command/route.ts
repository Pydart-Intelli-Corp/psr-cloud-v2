import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

/**
 * Machine Control Command Types
 * Based on Lactosure machine protocol
 */
type CommandType = 'TEST' | 'OK' | 'CANCEL' | 'CLEAN';

interface CommandRequest {
  command: CommandType;
  machineId: string;
  channel?: 'CH1' | 'CH2' | 'CH3';  // CH1=Cow, CH2=Buffalo, CH3=Mixed
  farmerId?: string;
  weight?: number;
  cycleMode?: number;
}

interface CommandResponse {
  success: boolean;
  message: string;
  command?: string;
  hexCommand?: string;
}

/**
 * Build hex command for machine communication
 * Based on Lactosure protocol from Flutter app
 */
function buildTestCommand(params: {
  channel: 'CH1' | 'CH2' | 'CH3';
  farmerId: number;
  weight: number;
  cycleMode?: number;
}): string {
  // Get channel byte based on dropdown selection
  // CH1 (Cow) = 0x00, CH2 (Buffalo) = 0x01, CH3 (Mixed) = 0x02
  let channelByte: number;
  switch (params.channel) {
    case 'CH1':
      channelByte = 0x00; // Cow
      break;
    case 'CH2':
      channelByte = 0x01; // Buffalo
      break;
    case 'CH3':
      channelByte = 0x02; // Mixed
      break;
    default:
      channelByte = 0x00; // Default to Cow
  }

  // Convert farmer ID to 3 bytes (Big-Endian: MSB, MID, LSB)
  const farmerId = params.farmerId || 1;
  const farmerIdMsb = (farmerId >> 16) & 0xFF;
  const farmerIdMid = (farmerId >> 8) & 0xFF;
  const farmerIdLsb = farmerId & 0xFF;

  // Multiply weight by 100 (e.g., 2.55 → 255, 0.01 → 1)
  const weightInt = Math.round((params.weight || 1) * 100);

  // Convert weight to 4 bytes (Big-Endian: MSB first)
  const weightByte3 = (weightInt >> 24) & 0xFF;
  const weightByte2 = (weightInt >> 16) & 0xFF;
  const weightByte1 = (weightInt >> 8) & 0xFF;
  const weightByte0 = weightInt & 0xFF;

  // Cycle mode (default to 0x00)
  const cycleMode = params.cycleMode || 0x00;

  // Build command bytes
  // Format: 40 0B 07 [channel] [cycleMode] [farmerID_MSB] [farmerID_MID] [farmerID_LSB] [weight3] [weight2] [weight1] [weight0] [LRC]
  const bytes = [
    0x40, // Header
    0x0B, // Number of bytes (11)
    0x07, // Command: Test
    channelByte,
    cycleMode,
    farmerIdMsb,
    farmerIdMid,
    farmerIdLsb,
    weightByte3,
    weightByte2,
    weightByte1,
    weightByte0,
  ];

  // Calculate LRC (XOR of all bytes)
  let lrc = 0;
  for (const byte of bytes) {
    lrc ^= byte;
  }
  bytes.push(lrc);

  // Convert to hex string
  return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

/**
 * Pre-defined command hex codes
 */
const COMMANDS = {
  OK: '40 04 01 04 00 41',
  CANCEL: '40 04 01 0A 00 4F',
  CLEAN: '40 04 09 00 0A 47',
};

/**
 * POST /api/user/machine/command
 * Send control commands to a machine
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

    // Parse request body
    const body: CommandRequest = await request.json();
    const { command, machineId, channel, farmerId, weight, cycleMode } = body;

    if (!command || !machineId) {
      return NextResponse.json(
        { success: false, error: 'Command and machineId are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    let hexCommand: string;
    let commandDescription: string;

    switch (command) {
      case 'TEST':
        hexCommand = buildTestCommand({
          channel: channel || 'CH1',
          farmerId: parseInt(farmerId || '1', 10),
          weight: weight || 1,
          cycleMode: cycleMode || 0,
        });
        commandDescription = `Test command for machine ${machineId} (Channel: ${channel || 'CH1'})`;
        break;

      case 'OK':
        hexCommand = COMMANDS.OK;
        commandDescription = `OK command for machine ${machineId}`;
        break;

      case 'CANCEL':
        hexCommand = COMMANDS.CANCEL;
        commandDescription = `Cancel command for machine ${machineId}`;
        break;

      case 'CLEAN':
        hexCommand = COMMANDS.CLEAN;
        commandDescription = `Clean command for machine ${machineId}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid command type' },
          { status: 400 }
        );
    }

    // Log the command for debugging

    // Store command in machine_commands queue table
    // This allows machines to poll for pending commands
    let commandId: number | null = null;
    let commandSent = false;
    
    try {
      const { getModels } = await import('@/models');
      const { sequelize } = getModels();
      
      // Create command queue table if it doesn't exist
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS machine_commands (
          id INT AUTO_INCREMENT PRIMARY KEY,
          machine_id VARCHAR(50) NOT NULL,
          command_type VARCHAR(20) NOT NULL,
          hex_command VARCHAR(100) NOT NULL,
          command_description TEXT,
          status ENUM('pending', 'sent', 'acknowledged', 'failed', 'expired') DEFAULT 'pending',
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sent_at TIMESTAMP NULL,
          acknowledged_at TIMESTAMP NULL,
          expires_at TIMESTAMP NULL,
          INDEX idx_machine_status (machine_id, status),
          INDEX idx_created_at (created_at)
        )
      `);
      
      // Set expiration time (commands expire after 30 seconds if not picked up)
      const expiresAt = new Date(Date.now() + 30 * 1000);
      
      // Insert command into queue
      const [result]: any = await sequelize.query(`
        INSERT INTO machine_commands 
        (machine_id, command_type, hex_command, command_description, created_by, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          machineId,
          command,
          hexCommand,
          commandDescription,
          decoded.id,
          expiresAt
        ]
      });
      
      commandId = result;
      commandSent = true;
      
      
      // Also log to activity/audit if needed
      try {
        await sequelize.query(`
          INSERT INTO activity_logs (user_id, action, details, created_at)
          VALUES (?, 'machine_command', ?, NOW())
        `, {
          replacements: [
            decoded.id,
            JSON.stringify({ machineId, command, hexCommand })
          ]
        });
      } catch (logErr) {
        // Activity logging is optional, continue even if it fails
      }
      
    } catch (err) {
      // Still return success for the command generation, but note the queue failure
      commandSent = false;
    }

    const response: CommandResponse = {
      success: true,
      message: commandSent 
        ? `${command} command sent to machine ${machineId}`
        : `${command} command prepared for machine ${machineId} (queue unavailable)`,
      command: commandDescription,
      hexCommand,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process command' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/machine/command
 * Get available commands documentation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    commands: [
      {
        type: 'TEST',
        description: 'Start milk testing cycle',
        parameters: {
          machineId: 'Required - Machine identifier',
          channel: 'Optional - CH1 (Cow), CH2 (Buffalo), CH3 (Mixed). Default: CH1',
          farmerId: 'Optional - Farmer ID. Default: 1',
          weight: 'Optional - Weight in kg. Default: 1',
          cycleMode: 'Optional - Cycle mode. Default: 0',
        },
      },
      {
        type: 'OK',
        description: 'Confirm/Accept current action',
        parameters: {
          machineId: 'Required - Machine identifier',
        },
      },
      {
        type: 'CANCEL',
        description: 'Cancel current operation',
        parameters: {
          machineId: 'Required - Machine identifier',
        },
      },
      {
        type: 'CLEAN',
        description: 'Start cleaning cycle',
        parameters: {
          machineId: 'Required - Machine identifier',
        },
      },
    ],
    hexProtocol: {
      TEST: 'Dynamic - built from parameters',
      OK: COMMANDS.OK,
      CANCEL: COMMANDS.CANCEL,
      CLEAN: COMMANDS.CLEAN,
    },
  });
}
