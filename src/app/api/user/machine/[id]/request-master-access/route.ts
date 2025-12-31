import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

export async function POST(
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

    const { societyName, machineName } = await request.json();

    // Get admin schema from main database
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
    for (const adm of allAdmins) {
      const cleanName = adm.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schema = `${cleanName}_${adm.dbKey.toLowerCase()}`;
      if (schema === decoded.schemaName) {
        admin = adm;
        break;
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found for this schema' },
        { status: 404 }
      );
    }
    await mainConnection.end();
    mainConnection = null;

    // Get machine and society details from admin schema
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: decoded.schemaName,
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    await adminConnection.query(`USE \`${decoded.schemaName}\``);

    const [machineRows] = await adminConnection.query(
      `SELECT m.machine_id, m.machine_type, s.name as society_name, s.society_id
       FROM machines m
       JOIN societies s ON m.society_id = s.id
       WHERE m.id = ? LIMIT 1`,
      [machineId]
    ) as any[];

    if (!machineRows || machineRows.length === 0) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    const machine = machineRows[0];

    // Generate access token (15 minutes validity)
    const accessToken = jwt.sign(
      {
        machineId,
        schema: decoded.schemaName,
        userId: decoded.id,
        type: 'master_access',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Delete old expired requests for this machine+user before creating new one
    await adminConnection.query(
      `DELETE FROM machine_access_requests 
       WHERE machine_id = ? AND user_id = ? 
       AND (status IN ('rejected', 'active') OR expires_at < NOW())`,
      [machineId, decoded.id]
    );

    // Store NEW access request in admin schema
    await adminConnection.query(
      `INSERT INTO machine_access_requests 
       (machine_id, user_id, access_token, expires_at, status, created_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'pending', NOW())`,
      [machineId, decoded.id, accessToken]
    );

    await adminConnection.end();
    adminConnection = null;

    // Send email to admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/machine/${machineId}/access-response?token=${accessToken}&action=accept`;
    const rejectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/machine/${machineId}/access-response?token=${accessToken}&action=reject`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .info-row { display: flex; margin: 10px 0; }
          .info-label { font-weight: bold; color: #555; min-width: 120px; }
          .info-value { color: #333; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 15px 40px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
          .button-accept { background: #10b981; color: white; }
          .button-reject { background: #ef4444; color: white; }
          .button:hover { opacity: 0.9; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Master & Password Access Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${admin.fullName}</strong>,</p>
            <p>A user has requested access to change the master machine setting and view/edit passwords.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #667eea;">📊 Request Details</h3>
              <div class="info-row">
                <div class="info-label">Society:</div>
                <div class="info-value">${machine.society_name} (${machine.society_id})</div>
              </div>
              <div class="info-row">
                <div class="info-label">Machine:</div>
                <div class="info-value">${machine.machine_id} (${machine.machine_type})</div>
              </div>
              <div class="info-row">
                <div class="info-label">User:</div>
                <div class="info-value">${decoded.uid} (${decoded.email})</div>
              </div>
            </div>

            <div class="warning">
              <strong>⏱️ Access Duration:</strong> If you approve this request, the user will have access for <strong>15 minutes</strong> to change the master machine setting and view/edit passwords.
            </div>

            <div class="button-container">
              <a href="${acceptUrl}" class="button button-accept">✓ Accept Request</a>
              <a href="${rejectUrl}" class="button button-reject">✗ Reject Request</a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you did not expect this request or have concerns, please reject it immediately.
            </p>
          </div>
          <div class="footer">
            <p>Poornasree Equipments Cloud</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Poornasree Cloud" <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: '🔐 Master & Password Access Request',
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Access request sent to admin',
    });

  } catch (error: any) {
    console.error('Error in request-master-access:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (mainConnection) await mainConnection.end();
    if (adminConnection) await adminConnection.end();
  }
}
