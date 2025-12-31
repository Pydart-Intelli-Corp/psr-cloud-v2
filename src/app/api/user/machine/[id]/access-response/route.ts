import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
const mysql = require('mysql2/promise');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AccessTokenPayload {
  machineId: number;
  schema: string;
  userId: number;
  type: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminConnection;

  try {
    const { id } = await params;
    const machineId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
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
            <p>Missing required parameters</p>
          </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Action</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h1>Invalid Action</h1>
            <p>Action must be 'accept' or 'reject'</p>
          </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify token
    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    } catch (error: any) {
      const isExpired = error.name === 'TokenExpiredError';
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>${isExpired ? 'Request Expired' : 'Invalid Token'}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">⏱️</div>
            <h1>${isExpired ? 'Request Expired' : 'Invalid Token'}</h1>
            <p>${isExpired ? 'This access request has expired (15 minutes limit)' : 'The access token is invalid'}</p>
          </div>
        </body>
        </html>`,
        { status: 401, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (decoded.type !== 'master_access' || decoded.machineId !== machineId) {
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

    // Update status in database
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: decoded.schema,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Check if request exists and is still pending
    const [requestRows] = await adminConnection.query(
      `SELECT id, status, expires_at FROM machine_access_requests 
       WHERE machine_id = ? AND user_id = ? AND access_token = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [machineId, decoded.userId, token]
    ) as any[];

    if (!requestRows || requestRows.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Request Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #ef4444; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❓</div>
            <h1>Request Not Found</h1>
            <p>This access request could not be found</p>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const accessRequest = requestRows[0];

    if (accessRequest.status !== 'pending') {
      const statusText = accessRequest.status === 'approved' ? 'Already Approved' : 'Already Rejected';
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>${statusText}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info { color: #3b82f6; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="info">ℹ️</div>
            <h1>${statusText}</h1>
            <p>This request has already been ${accessRequest.status}</p>
          </div>
        </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Update request status
    const newStatus = action === 'accept' ? 'approved' : 'rejected';
    await adminConnection.query(
      `UPDATE machine_access_requests 
       SET status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newStatus, accessRequest.id]
    );

    // If approved, send confirmation email to society with Start button
    if (action === 'accept') {
      // Get society details from admin schema (not from main users table)
      const [societyRows] = await adminConnection.query(
        `SELECT s.id, s.name, s.email, s.society_id, m.machine_id, m.id as machine_db_id
         FROM societies s
         INNER JOIN machines m ON m.society_id = s.id
         WHERE m.id = ?`,
        [machineId]
      ) as any[];

      if (societyRows && societyRows.length > 0) {
        const society = societyRows[0];

        // Generate start token (valid for 24 hours)
        const startToken = jwt.sign(
          {
            machineId,
            userId: decoded.userId,
            type: 'start_access'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Send email to society (not admin)
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const startUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/machine/${machineId}/start-access?token=${startToken}`;

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
              .info-label { font-weight: bold; color: #555; min-width: 120px; }
              .info-value { color: #333; }
              .button-container { text-align: center; margin: 30px 0; }
              .button-start { display: inline-block; padding: 18px 50px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); }
              .button-start:hover { background: #059669; }
              .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .timer-info { background: #e0f2fe; padding: 20px; border-left: 4px solid #0284c7; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1>Access Request Approved!</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${society.name}</strong>,</p>
                <p>Great news! Your request to change the master machine and access passwords has been <strong>approved</strong> by the admin.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #10b981;">📊 Request Details</h3>
                  <div class="info-row">
                    <span class="info-label">Society:</span>
                    <span class="info-value">${society.name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Society ID:</span>
                    <span class="info-value">${society.society_id}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Machine ID:</span>
                    <span class="info-value">${society.machine_id || 'N/A'}</span>
                  </div>
                </div>

                <div class="timer-info">
                  <h3 style="margin-top: 0; color: #0284c7;">⏱️ How It Works</h3>
                  <p style="margin: 5px 0;"><strong>Click the "Start Access" button below to activate your 15-minute access window.</strong></p>
                  <p style="margin: 5px 0; font-size: 14px;">• The timer will start only after you click the button</p>
                  <p style="margin: 5px 0; font-size: 14px;">• You'll have exactly 15 minutes to change the master machine and view/edit passwords</p>
                  <p style="margin: 5px 0; font-size: 14px;">• After 15 minutes, access will automatically expire</p>
                </div>

                <div class="button-container">
                  <a href="${startUrl}" class="button-start">🚀 Start 15-Minute Access</a>
                </div>

                <div class="warning">
                  <strong>⚠️ Important:</strong> This button is valid for 24 hours. Click it only when you're ready to change the master machine and/or access passwords, as the 15-minute countdown will begin immediately.
                </div>

                <div class="footer">
                  <p>This is an automated email from Poornasree Equipments Cloud System</p>
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
            to: society.email,
            subject: '✅ Master & Password Access Approved - Start Your Session',
            html: emailHtml,
          });
          console.log(`✅ Confirmation email sent to society: ${society.email}`);
        } catch (emailError) {
          console.error('❌ Failed to send confirmation email:', emailError);
        }
      }
    }

    await adminConnection.end();
    adminConnection = null;

    // Return success page
    const isAccepted = action === 'accept';
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>${isAccepted ? 'Access Approved' : 'Access Rejected'}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container { 
            text-align: center; 
            background: white; 
            padding: 60px; 
            border-radius: 20px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
            max-width: 500px;
          }
          .icon { 
            font-size: 80px; 
            margin-bottom: 20px;
          }
          .success { color: #10b981; }
          .reject { color: #ef4444; }
          h1 { 
            margin: 20px 0; 
            color: #333;
          }
          p { 
            color: #666; 
            font-size: 16px; 
            line-height: 1.6;
          }
          .info-box {
            background: ${isAccepted ? '#d1fae5' : '#fee2e2'};
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
          }
          .info-box strong {
            color: ${isAccepted ? '#065f46' : '#991b1b'};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon ${isAccepted ? 'success' : 'reject'}">
            ${isAccepted ? '✓' : '✗'}
          </div>
          <h1>${isAccepted ? 'Access Approved!' : 'Access Rejected'}</h1>
          <p>
            ${isAccepted 
              ? 'The user will receive a confirmation email with a "Start" button. The 15-minute timer will begin when they click it.' 
              : 'The access request has been rejected. The user has been notified.'}
          </p>
          ${isAccepted ? `
          <div class="info-box">
            <strong>📧 Email Sent:</strong><br>
            A confirmation email has been sent to the user. They need to click the "Start Access" button to activate their 15-minute window.
          </div>
          ` : ''}
          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            You can close this window now.
          </p>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Error in access-response:', error);
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
    if (adminConnection) await adminConnection.end();
  }
}
