import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
  dbKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get request body
    const body = await request.json();
    const { email, csvContent, pdfContent, reportType, dateRange, stats } = body;

    if (!email || !pdfContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check SMTP configuration
    const smtpUser = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    
    if (!smtpUser || !smtpPass) {
      console.error('SMTP credentials not configured');
      return NextResponse.json({ 
        error: 'Email service not configured. Please contact administrator.' 
      }, { status: 500 });
    }

    // Create transporter using same pattern as BMC delete OTP
    const emailConfig = {
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
      secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

    const transporter = nodemailer.createTransport(emailConfig);

    // Verify transporter
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json({ 
        error: 'Email service connection failed. Please check SMTP configuration.' 
      }, { status: 500 });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const reportTypeLower = reportType.toLowerCase().replace(' ', '-');
    const csvFilename = `${reportTypeLower}-${timestamp}.csv`;
    const pdfFilename = `${reportTypeLower}-${timestamp}.pdf`;

    // Prepare email with attachments
    const mailOptions = {
      from: `"Poornasree Equipments Cloud" <${smtpUser}>`,
      to: email,
      subject: `${reportType} - ${dateRange}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">LactoConnect Report</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Poornasree Equipments</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748; margin-top: 0;">${reportType}</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Hello,<br><br>
              Please find attached the ${reportType.toLowerCase()} for the date range: <strong>${dateRange}</strong>.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="color: #2d3748; margin-top: 0; font-size: 16px;">Report Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${reportType === 'Collection Report' ? `
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Collections:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.totalCollections}</td>
                </tr>
                ` : reportType === 'Dispatch Report' ? `
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Dispatches:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.totalDispatches}</td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Sales:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.totalSales}</td>
                </tr>
                `}
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Quantity:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.totalQuantity.toFixed(2)} L</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">₹${stats.totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Average Rate:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">₹${stats.averageRate.toFixed(2)}/L</td>
                </tr>
                ${reportType !== 'Sales Report' ? `
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; padding-top: 12px; color: #718096; font-size: 14px;">Weighted FAT:</td>
                  <td style="padding: 8px 0; padding-top: 12px; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.weightedFat.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Weighted SNF:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.weightedSnf.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Weighted CLR:</td>
                  <td style="padding: 8px 0; color: #2d3748; font-weight: bold; text-align: right; font-size: 14px;">${stats.weightedClr.toFixed(2)}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #edf2f7; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #2d3748; margin: 0; font-size: 14px;">
                <strong>📎 Attachment${csvContent ? 's' : ''}:</strong><br>
                ${csvContent ? `• ${csvFilename} (CSV Format)<br>` : ''}
                • ${pdfFilename} (PDF Format)
              </p>
            </div>
            
            <p style="color: #718096; font-size: 13px; margin-top: 30px;">
              This is an automated email from LactoConnect. For support, please contact us at 
              <a href="mailto:marketing@poornasree.com" style="color: #4299e1; text-decoration: none;">marketing@poornasree.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Poornasree Equipments. All rights reserved.
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 5px 0 0 0;">
                <a href="https://www.poornasree.com" style="color: #4299e1; text-decoration: none;">www.poornasree.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        ...(csvContent ? [{
          filename: csvFilename,
          content: csvContent,
          contentType: 'text/csv'
        }] : []),
        {
          filename: pdfFilename,
          content: Buffer.from(pdfContent, 'base64'),
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Report sent successfully to ${email}`
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
