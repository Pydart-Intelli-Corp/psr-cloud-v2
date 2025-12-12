import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { generateOTP } from '@/lib/emailService';
import nodemailer from 'nodemailer';

// In-memory store for OTPs (you could also use Redis or database)
const otpStore = new Map<string, { otp: string; expires: Date; bmcId: number }>();

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
    const { bmcId, bmcName } = body;

    if (!bmcId) {
      return createErrorResponse('BMC ID is required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { User } = getModels();

    // Get admin details
    const admin = await User.findByPk(payload.id);
    if (!admin) {
      return createErrorResponse('Admin not found', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in memory
    const otpKey = `${admin.id}_${bmcId}`;
    otpStore.set(otpKey, { otp, expires, bmcId });

    // Clean up expired OTPs
    for (const [key, value] of otpStore.entries()) {
      if (value.expires < new Date()) {
        otpStore.delete(key);
      }
    }

    // Send OTP email with custom message for deletion
    try {
      await sendDeleteConfirmationOTP(admin.email, otp, admin.fullName, bmcName);
      console.log(`✅ Delete confirmation OTP sent to ${admin.email} for BMC ${bmcName}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return createErrorResponse('Failed to send OTP email', 500);
    }

    return createSuccessResponse(
      { expiresIn: 600 }, // 10 minutes
      'OTP sent to your email. Please check and verify.'
    );

  } catch (error: unknown) {
    console.error('Error sending delete OTP:', error);
    return createErrorResponse('Failed to send OTP', 500);
  }
}

// Custom email function for delete confirmation
async function sendDeleteConfirmationOTP(
  email: string,
  otp: string,
  name: string,
  bmcName: string
): Promise<void> {
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
    to: email,
    subject: '⚠️ CRITICAL: BMC Deletion Confirmation Required',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Critical Action Required</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">BMC Deletion Confirmation</p>
        </div>
        
        <div style="padding: 20px; background: #fef2f2; border: 2px solid #dc2626; border-radius: 10px;">
          <h2 style="color: #dc2626; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You have requested to <strong style="color: #dc2626;">permanently delete</strong> the following BMC and all its associated data:
          </p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="margin: 0; color: #dc2626;">${bmcName}</h3>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              This action will delete:
            </p>
            <ul style="color: #666; font-size: 14px; margin: 10px 0;">
              <li>All societies under this BMC</li>
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
            <p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold; font-size: 14px;">
              ⚠️ THIS ACTION CANNOT BE UNDONE!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            To confirm this deletion, please enter the following OTP:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background: #dc2626; color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This OTP is valid for <strong>10 minutes</strong>. If you didn't request this deletion, please ignore this email and contact support immediately.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fca5a5; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Export function to verify OTP (called from delete endpoint)
export function verifyDeleteOTP(adminId: number, bmcId: number, providedOtp: string): boolean {
  const otpKey = `${adminId}_${bmcId}`;
  const stored = otpStore.get(otpKey);

  if (!stored) {
    console.log('❌ No OTP found for this deletion request');
    return false;
  }

  if (stored.expires < new Date()) {
    otpStore.delete(otpKey);
    console.log('❌ OTP expired');
    return false;
  }

  if (stored.otp !== providedOtp) {
    console.log('❌ Invalid OTP');
    return false;
  }

  // OTP is valid, delete it so it can't be reused
  otpStore.delete(otpKey);
  console.log('✅ OTP verified successfully');
  return true;
}
