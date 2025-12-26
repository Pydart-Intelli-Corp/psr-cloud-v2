import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['token', 'newPassword', 'confirmPassword']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return createErrorResponse('Passwords do not match', 400);
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return createErrorResponse(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        400
      );
    }

    // Find user by reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        isEmailVerified: true
      }
    });

    if (!user) {
      return createErrorResponse('Invalid or expired reset token', 400);
    }

    // Check if token has expired
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return createErrorResponse('Reset token has expired. Please request a new password reset.', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await user.update({
      password: hashedPassword,
      passwordResetToken: null as any,
      passwordResetExpires: null as any,
      // Reset login attempts on successful password change
      loginAttempts: 0,
      lockUntil: null as any
    });

    // Return success response
    return createSuccessResponse(
      'Password reset successfully. You can now login with your new password.',
      JSON.stringify({
        message: 'Password reset successful',
        email: user.email
      })
    );

  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return createErrorResponse('Password reset failed. Please try again.', 500);
  }
}