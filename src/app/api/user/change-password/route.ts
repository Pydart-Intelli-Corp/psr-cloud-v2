import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { verifyToken, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return createErrorResponse('Invalid token', 401);
    }

    await connectDB();
    const { User } = getModels();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return createErrorResponse('Current password and new password are required', 400);
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return createErrorResponse(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({
      password: hashedPassword
    });

    return createSuccessResponse(
      { message: 'Password changed successfully' },
      'Password changed successfully'
    );

  } catch (error) {
    console.error('Password change error:', error);
    return createErrorResponse('Failed to change password', 500);
  }
}
