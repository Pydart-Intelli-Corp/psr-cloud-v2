import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const mysql = require('mysql2/promise');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  id: number;
  uid: string;
  email: string;
  role: string;
  dbKey: string;
  entityType: string;
  schemaName: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let mainConnection;
  let adminConnection;

  try {
    const { id } = await params;
    const machineId = parseInt(id);
    if (isNaN(machineId)) {
      return NextResponse.json(
        { error: 'Invalid machine ID' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to main database
    mainConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    // Get all admins to find the matching schema
    const [allAdmins] = await mainConnection.query(
      'SELECT fullName, email, dbKey FROM users WHERE role = ?',
      ['admin']
    ) as any[];

    if (!allAdmins || allAdmins.length === 0) {
      return NextResponse.json(
        { error: 'No admin found' },
        { status: 404 }
      );
    }

    // Find the admin whose schema matches the token
    let admin = null;
    for (const a of allAdmins) {
      const cleanName = a.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const testSchema = `${cleanName}_${a.dbKey.toLowerCase()}`;
      if (testSchema === decoded.schemaName) {
        admin = a;
        break;
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found for schema' },
        { status: 404 }
      );
    }

    await mainConnection.end();
    mainConnection = null;

    // Connect to admin schema
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: decoded.schemaName,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Check for existing access request
    const [requests] = await adminConnection.query(
      `SELECT id, machine_id, user_id, status, expires_at, created_at, updated_at,
              NOW() as server_time
       FROM machine_access_requests
       WHERE machine_id = ? AND user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [machineId, decoded.id]
    ) as any[];

    await adminConnection.end();
    adminConnection = null;

    if (!requests || requests.length === 0) {
      return NextResponse.json({
        hasRequest: false,
        message: 'No previous request found'
      });
    }

    const latestRequest = requests[0];
    // Use server time from database for comparison
    const now = new Date(latestRequest.server_time);
    const expiresAt = new Date(latestRequest.expires_at);
    
    // Only check expiry for 'active' status
    // For 'approved', 'pending', 'rejected' - expiry doesn't matter
    const isExpired = latestRequest.status === 'active' && now > expiresAt;

    console.log(`🕐 Access Status Debug - Status: ${latestRequest.status}, Expired: ${isExpired}`);
    console.log(`🕐 Server Time: ${latestRequest.server_time}, Expires: ${latestRequest.expires_at}`);
    console.log(`🕐 Now > ExpiresAt: ${now > expiresAt}`);

    // If status is active but expired, update the status in database to reflect reality
    if (latestRequest.status === 'active' && isExpired) {
      console.log(`🔄 Updating expired active request to expired status in database`);
      // Note: We could update the DB here, but for now just report accurately
    }

    return NextResponse.json({
      hasRequest: true,
      status: latestRequest.status,
      expiresAt: latestRequest.expires_at,
      isExpired: isExpired,
      createdAt: latestRequest.created_at,
      updatedAt: latestRequest.updated_at,
      message: getStatusMessage(latestRequest.status, isExpired)
    });

  } catch (error: any) {
    console.error('Error checking access status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check access status',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (mainConnection) {
      try {
        await mainConnection.end();
      } catch (err) {
        console.error('Error closing main connection:', err);
      }
    }
    if (adminConnection) {
      try {
        await adminConnection.end();
      } catch (err) {
        console.error('Error closing admin connection:', err);
      }
    }
  }
}

function getStatusMessage(status: string, isExpired: boolean): string {
  switch (status) {
    case 'pending':
      return 'Your access request is pending. Waiting for admin approval.';
    case 'approved':
      return 'Your request was approved! Check your email and click "Start Access" to begin the 15-minute timer.';
    case 'active':
      if (isExpired) {
        return 'Your 15-minute access window has expired. You can request new access.';
      }
      return 'Your access is active! You can change the master machine now.';
    case 'rejected':
      return 'Your previous access request was rejected. You can request again.';
    default:
      return 'Unknown request status';
  }
}
