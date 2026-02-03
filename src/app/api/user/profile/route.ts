import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    // Get token from cookie or Authorization header
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify token and get user ID
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return createErrorResponse('Invalid token', 401);
    }

    const userId = decoded.id;

    // Find user
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'passwordResetToken', 'emailVerificationToken', 'otpCode']
      }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    console.log('🔍 Profile API - User details:', {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      dbKey: user.dbKey,
      fullName: user.fullName
    });

    return createSuccessResponse(
      user,
      'User profile retrieved successfully'
    );

  } catch (error: unknown) {
    console.error('Get profile error:', error);
    return createErrorResponse('Failed to retrieve profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    // Get token from cookie or Authorization header
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify token and get user ID
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return createErrorResponse('Invalid token', 401);
    }

    const userId = decoded.id;
    const body = await request.json();
    const { fullName, firstName, lastName, phone, companyName, companyCity, companyState, companyPincode } = body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Update allowed fields only
    const updateData: Partial<{
      fullName: string;
      phone: string;
      companyName: string;
      companyCity: string;
      companyState: string;
      companyPincode: string;
    }> = {};
    
    // Handle fullName - construct from firstName and lastName if provided
    if (firstName && lastName) {
      updateData.fullName = `${firstName.trim()} ${lastName.trim()}`;
    } else if (fullName !== undefined) {
      updateData.fullName = fullName;
    }
    
    if (phone !== undefined) updateData.phone = phone;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyCity !== undefined) updateData.companyCity = companyCity;
    if (companyState !== undefined) updateData.companyState = companyState;
    if (companyPincode !== undefined) updateData.companyPincode = companyPincode;

    await user.update(updateData);

    // Return updated user (without sensitive data)
    const updatedUser = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'passwordResetToken', 'emailVerificationToken', 'otpCode']
      }
    });

    return createSuccessResponse(
      'Profile updated successfully',
      JSON.stringify(updatedUser)
    );

  } catch (error: unknown) {
    console.error('Update profile error:', error);
    return createErrorResponse('Failed to update profile', 500);
  }
}