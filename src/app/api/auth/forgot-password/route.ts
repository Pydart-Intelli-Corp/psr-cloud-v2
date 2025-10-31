import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import crypto from 'crypto';

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
        isEmailVerified: true // Only allow password reset for verified users
      }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return createSuccessResponse(
        'If an account with that email exists, you will receive a password reset link.',
        '{}'
      );
    }

    // Check rate limiting for password reset requests
    if (user.passwordResetExpires) {
      const timeSinceLastRequest = Date.now() - (user.passwordResetExpires.getTime() - 60 * 60 * 1000);
      if (timeSinceLastRequest < 5 * 60 * 1000) { // 5 minute cooldown
        return createErrorResponse('Please wait before requesting another password reset', 429);
      }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpiry
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        user.fullName,
        resetToken
      );
    } catch (emailError) {
      console.error('Password reset email sending failed:', emailError);
      return createErrorResponse('Failed to send password reset email. Please try again.', 500);
    }

    return createSuccessResponse(
      'If an account with that email exists, you will receive a password reset link.',
      JSON.stringify({
        email: email.toLowerCase(),
        message: 'Password reset email sent if account exists'
      })
    );

  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    return createErrorResponse('Password reset request failed. Please try again.', 500);
  }
}