import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
const mysql = require('mysql2/promise');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface StartTokenPayload {
  machineId: number;
  userId: number;
  type: string;
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
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h1>Invalid Request</h1>
            <p>Missing access token</p>
          </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify token
    let decoded: StartTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as StartTokenPayload;
    } catch (error: any) {
      const isExpired = error.name === 'TokenExpiredError';
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>${isExpired ? 'Link Expired' : 'Invalid Token'}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">⏱️</div>
            <h1>${isExpired ? 'Link Expired' : 'Invalid Token'}</h1>
            <p>${isExpired ? 'This activation link has expired (24-hour limit)' : 'The access token is invalid'}</p>
            <p style="margin-top: 20px; color: #666;">Please request new access from the admin.</p>
          </div>
        </body>
        </html>`,
        { status: 401, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (decoded.type !== 'start_access' || decoded.machineId !== machineId) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Token</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h1>Invalid Token</h1>
            <p>Token type or machine ID mismatch</p>
          </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Connect to main database to get admin schema
    mainConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Get all admins to find matching schema
    const [allAdmins] = await mainConnection.query(
      'SELECT fullName, dbKey FROM users WHERE role = ?',
      ['admin']
    ) as any[];

    if (!allAdmins || allAdmins.length === 0) {
      await mainConnection.end();
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Admin Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❓</div>
            <h1>Admin Not Found</h1>
            <p>Unable to find admin information</p>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    await mainConnection.end();
    mainConnection = null;

    // Try each admin schema to find the one with the access request
    let schemaName = '';
    let society = null;

    for (const admin of allAdmins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const testSchema = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      try {
        // Connect to this admin schema
        adminConnection = await mysql.createConnection({
          host: process.env.DB_HOST || '168.231.121.19',
          user: process.env.DB_USER || 'psr_admin',
          password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
          database: testSchema,
          port: parseInt(process.env.DB_PORT || '3306'),
        });

        // Check if request exists and is approved in this schema
        const [requestRows] = await adminConnection.query(
          `SELECT id, status, expires_at FROM machine_access_requests 
           WHERE machine_id = ? AND user_id = ? AND status = 'approved'
           ORDER BY created_at DESC LIMIT 1`,
          [machineId, decoded.userId]
        ) as any[];

        if (requestRows && requestRows.length > 0) {
          // Found the schema with the access request
          schemaName = testSchema;
          
          // Get society details
          const [societyRows] = await adminConnection.query(
            `SELECT s.id, s.name, s.email, s.society_id, m.machine_id
             FROM societies s
             INNER JOIN machines m ON m.society_id = s.id
             WHERE s.id = ?`,
            [decoded.userId]
          ) as any[];

          if (societyRows && societyRows.length > 0) {
            society = societyRows[0];
            break;
          }
        }

        await adminConnection.end();
        adminConnection = null;
      } catch (err) {
        if (adminConnection) await adminConnection.end();
        adminConnection = null;
        // Continue to next admin
      }
    }

    if (!schemaName || !society) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>No Approved Request</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌</div>
            <h1>No Approved Request Found</h1>
            <p>Your access request may have been rejected or already used.</p>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Reconnect to the correct admin schema
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: schemaName,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Check if request exists and is approved (double check)
    const [requestRows] = await adminConnection.query(
      `SELECT id, status, expires_at FROM machine_access_requests 
       WHERE machine_id = ? AND user_id = ? AND status = 'approved'
       ORDER BY created_at DESC LIMIT 1`,
      [machineId, decoded.userId]
    ) as any[];

    if (!requestRows || requestRows.length === 0) {
      await adminConnection.end();
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>No Approved Request</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌</div>
            <h1>No Approved Request Found</h1>
            <p>Your access request may have been rejected or already used.</p>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Start the 15-minute timer by updating expires_at and status to 'active'
    await adminConnection.query(
      `UPDATE machine_access_requests 
       SET status = 'active', expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), updated_at = NOW()
       WHERE id = ?`,
      [requestRows[0].id]
    );

    // Get machine details for display
    const [machineRows] = await adminConnection.query(
      `SELECT m.machine_id, m.society_id, s.name as society_name, s.email as society_email 
       FROM machines m 
       LEFT JOIN societies s ON m.society_id = s.id 
       WHERE m.id = ?`,
      [machineId]
    ) as any[];

    const machine = machineRows && machineRows.length > 0 ? machineRows[0] : null;

    // Send confirmation email to society
    if (machine && machine.society_email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
      const expiryTimeStr = expiryTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; margin-bottom: 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 5px; }
            .info-row { display: flex; margin: 10px 0; }
            .info-label { font-weight: bold; color: #555; min-width: 140px; }
            .info-value { color: #333; }
            .timer-box { background: #e0f2fe; padding: 20px; border-left: 4px solid #0284c7; border-radius: 5px; margin: 20px 0; }
            .timer-display { font-size: 36px; font-weight: bold; color: #1e40af; margin: 15px 0; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🚀</div>
              <h1>Master & Password Access Activated</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${machine.society_name}</strong>,</p>
              <p>A user has activated their 15-minute access window to change the master machine setting and access passwords.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #10b981;">📊 Access Details</h3>
                <div class="info-row">
                  <span class="info-label">Society:</span>
                  <span class="info-value">${society.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Society Email:</span>
                  <span class="info-value">${society.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Machine ID:</span>
                  <span class="info-value">${machine.machine_id || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Started At:</span>
                  <span class="info-value">${new Date().toLocaleString('en-US')}</span>
                </div>
              </div>

              <div class="timer-box">
                <h3 style="margin-top: 0; color: #0284c7;">⏱️ Timer Information</h3>
                <p style="margin: 5px 0;"><strong>Access Duration:</strong> 15 Minutes</p>
                <div class="timer-display">15:00</div>
                <p style="margin: 5px 0; font-size: 14px; color: #64748b;">
                  <strong>Expires at:</strong> ${expiryTimeStr}
                </p>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> The user can change the master machine setting and view/edit passwords within the next 15 minutes. After this time, access will automatically expire.
              </div>

              <div class="footer">
                <p>This is an automated notification from Poornasree Equipments Cloud System</p>
                <p>Please do not reply to this email</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await transporter.sendMail({
          from: process.env.SMTP_USERNAME,
          to: machine.society_email,
          subject: '🚀 Master & Password Access Activated - 15 Minutes',
          html: emailHtml,
        });
        console.log(`✅ Start confirmation email sent to society: ${machine.society_email}`);
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email to society:', emailError);
      }
    }

    await adminConnection.end();
    adminConnection = null;

    // Calculate expiry time for display
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    const expiryTimeStr = expiryTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    // Return success page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Access Activated</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 20px;
          }
          .container { 
            text-align: center; 
            background: white; 
            padding: 60px 40px; 
            border-radius: 20px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
            max-width: 600px;
            width: 100%;
          }
          .icon { 
            font-size: 100px; 
            margin-bottom: 20px;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .success { color: #10b981; }
          h1 { 
            margin: 20px 0; 
            color: #333;
            font-size: 32px;
          }
          p { 
            color: #666; 
            font-size: 16px; 
            line-height: 1.6;
          }
          .timer-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            border: 2px solid #60a5fa;
          }
          .timer-display {
            font-size: 48px;
            font-weight: bold;
            color: #1e40af;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
          }
          .info-box {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: left;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
          }
          .label {
            font-weight: bold;
            color: #065f46;
          }
          .instructions {
            background: #fff7ed;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            border-left: 4px solid #f59e0b;
          }
          .instructions ul {
            text-align: left;
            margin: 10px 0;
            padding-left: 30px;
          }
          .instructions li {
            margin: 8px 0;
          }
        </style>
        <script>
          let timeLeft = 15 * 60; // 15 minutes in seconds
          
          function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').innerText = 
              minutes.toString().padStart(2, '0') + ':' + 
              seconds.toString().padStart(2, '0');
            
            if (timeLeft <= 0) {
              document.getElementById('timer').innerText = '00:00';
              document.getElementById('status').innerText = 'Access Expired';
              document.getElementById('status').style.color = '#ef4444';
            } else {
              timeLeft--;
              setTimeout(updateTimer, 1000);
            }
          }
          
          window.onload = function() {
            updateTimer();
          };
        </script>
      </head>
      <body>
        <div class="container">
          <div class="icon success">🚀</div>
          <h1>Access Activated!</h1>
          <p style="font-size: 18px; color: #10b981; font-weight: bold;" id="status">
            15-Minute Timer Started
          </p>
          
          <div class="timer-box">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">Time Remaining</p>
            <div class="timer-display" id="timer">15:00</div>
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              Expires at: ${expiryTimeStr}
            </p>
          </div>

          ${machine ? `
          <div class="info-box">
            <h3 style="margin-top: 0; color: #065f46;">📋 Access Details</h3>
            <div class="info-item">
              <span class="label">Machine ID:</span> ${machine.machine_id || 'N/A'}
            </div>
            <div class="info-item">
              <span class="label">Society:</span> ${society.name}
            </div>
            <div class="info-item">
              <span class="label">Society ID:</span> ${society.society_id}
            </div>
          </div>
          ` : ''}

          <div class="instructions">
            <h3 style="margin-top: 0; color: #92400e;">📱 Next Steps</h3>
            <ul>
              <li>Open your Poornasree Connect mobile app</li>
              <li>Go to the machine management section</li>
              <li>Select the machine and change master settings</li>
              <li>Complete the action within 15 minutes</li>
            </ul>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            You can close this window and return to the app.
          </p>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Error in start-access:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #ef4444; font-size: 48px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">⚠️</div>
          <h1>An Error Occurred</h1>
          <p>${error.message || 'Please try again later'}</p>
        </div>
      </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
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
