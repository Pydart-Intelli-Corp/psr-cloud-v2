import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { generateOTP, sendOTPEmail } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';

// Resend OTP
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    // Find user by email
    const user = await User.findOne({
      where: { 
        email: email.toLowerCase(),
        isEmailVerified: false
      }
    });

    if (!user) {
      return createErrorResponse('User not found or already verified', 404);
    }

    // Check rate limiting - prevent too frequent requests
    if (user.emailVerificationExpires) {
      const timeSinceLastOTP = Date.now() - (user.emailVerificationExpires.getTime() - 10 * 60 * 1000);
      if (timeSinceLastOTP < 60 * 1000) { // 1 minute cooldown
        return createErrorResponse('Please wait before requesting a new OTP', 429);
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await user.update({
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpiry,
      otpCode: otp,
      otpExpires: otpExpiry
    });

    // Send OTP email
    try {
      console.log('Resend OTP debug:', {
        userObject: user.toJSON(),
        userEmail: user.email,
        userFullName: user.fullName,
        otp: otp
      });
      await sendOTPEmail(
        user.email,
        otp,
        user.fullName
      );
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);
      return createErrorResponse('Failed to send OTP email. Please try again.', 500);
    }

    return createSuccessResponse(
      'OTP sent successfully. Please check your email.',
      JSON.stringify({
        email: user.email,
        expiresIn: '10 minutes'
      })
    );

  } catch (error: unknown) {
    console.error('OTP resend error:', error);
    return createErrorResponse('Failed to send OTP. Please try again.', 500);
  }
}