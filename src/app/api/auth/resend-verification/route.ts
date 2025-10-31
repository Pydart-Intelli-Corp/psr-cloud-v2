import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { generateOTP, sendOTPEmail } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';

// Resend email verification
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
      const timeSinceLastVerification = Date.now() - (user.emailVerificationExpires.getTime() - 10 * 60 * 1000);
      if (timeSinceLastVerification < 60 * 1000) { // 1 minute cooldown
        return createErrorResponse('Please wait before requesting a new verification email', 429);
      }
    }

    // Generate new verification token/OTP
    const verificationToken = generateOTP();
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new verification token
    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry,
      otpCode: verificationToken,
      otpExpires: tokenExpiry
    });

    // Send verification email
    try {
      console.log('Resend verification debug:', {
        userObject: user.toJSON(),
        userEmail: user.email,
        userFullName: user.fullName,
        verificationToken: verificationToken
      });
      
      await sendOTPEmail(
        user.email,
        verificationToken,
        user.fullName
      );
    } catch (emailError) {
      console.error('Verification email sending failed:', emailError);
      return createErrorResponse('Failed to send verification email. Please try again.', 500);
    }

    return createSuccessResponse(
      'Verification email sent successfully. Please check your email.',
      JSON.stringify({
        email: user.email,
        expiresIn: '10 minutes'
      })
    );

  } catch (error: unknown) {
    console.error('Verification resend error:', error);
    return createErrorResponse('Failed to send verification email. Please try again.', 500);
  }
}
