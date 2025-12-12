import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { generateOTP } from '@/lib/emailService';
import nodemailer from 'nodemailer';

// In-memory store for OTPs (you could also use Redis or database)
const otpStore = new Map<string, { otp: string; expires: Date; dairyId: number }>();

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { dairyId } = body;

    if (!dairyId) {
      return createErrorResponse('Dairy ID is required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { User } = getModels();

    // Get admin details
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.email) {
      return createErrorResponse('Admin email not found', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in memory
    const otpKey = `${admin.id}_${dairyId}`;
    otpStore.set(otpKey, { otp, expires, dairyId });

    // Clean up expired OTPs
    for (const [key, value] of otpStore.entries()) {
      if (value.expires < new Date()) {
        otpStore.delete(key);
      }
    }

    // Send OTP email
    try {
      const emailConfig = {
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
        secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
        auth: {
          user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
        },
      };

      const transporter = nodemailer.createTransport(emailConfig);

      const mailOptions = {
        from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: '⚠️ CRITICAL: Dairy Deletion Confirmation Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 2px solid #fee2e2; }
            .otp-box { background: white; border: 3px dashed #dc2626; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
            .otp { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🚨</div>
              <h1 style="margin: 0; font-size: 24px;">CRITICAL DELETION REQUEST</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Dairy Farm & All Related Data</p>
            </div>
            
            <div class="content">
              <p style="margin-top: 0; font-size: 16px;">Hello <strong>${admin.fullName}</strong>,</p>
              
              <div class="warning">
                <strong style="color: #dc2626; font-size: 18px;">⚠️ THIS ACTION CANNOT BE UNDONE!</strong>
                <p style="margin: 10px 0 0 0;">You are about to permanently delete a dairy farm and ALL associated data from your system.</p>
              </div>

              <p style="font-weight: 600; margin-bottom: 10px;">The following data will be permanently deleted:</p>
              <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>All BMCs under this dairy</li>
                <li>All societies under these BMCs</li>
                <li>All farmers</li>
                <li>All machines</li>
                <li>All machine statistics</li>
                <li>All machine corrections (admin & device saved)</li>
                <li>All rate charts and rate chart data</li>
                <li>All milk collections</li>
                <li>All sales records</li>
                <li>All dispatch records</li>
                <li>All section pulse tracking data</li>
              </ul>

              <p style="font-weight: 600; margin-top: 25px;">Your One-Time Verification Code:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">OTP Code</p>
                <div class="otp">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes only</p>
              </div>

              <div style="background: #fee2e2; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; color: #991b1b;">
                  <strong>Security Notice:</strong> If you did not request this deletion, please ignore this email and contact your system administrator immediately.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Poornasree Equipments Cloud</p>
              <p style="margin: 5px 0;">This is an automated security message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Delete confirmation OTP sent to ${admin.email} for dairy ${dairyId}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return createErrorResponse('Failed to send OTP email', 500);
    }

    return createSuccessResponse(
      { expiresIn: 600 }, // 10 minutes
      'OTP sent to your email address'
    );

  } catch (error: unknown) {
    console.error('Error sending delete OTP:', error);
    return createErrorResponse('Failed to send OTP', 500);
  }
}

// Export verification function for use in DELETE endpoint
export function verifyDeleteOTP(adminId: number, dairyId: number, otp: string): boolean {
  const otpKey = `${adminId}_${dairyId}`;
  const stored = otpStore.get(otpKey);

  if (!stored) {
    return false;
  }

  if (stored.expires < new Date()) {
    otpStore.delete(otpKey);
    return false;
  }

  if (stored.otp !== otp || stored.dairyId !== dairyId) {
    return false;
  }

  // OTP is valid, delete it (one-time use)
  otpStore.delete(otpKey);
  return true;
}
