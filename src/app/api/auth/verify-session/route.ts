import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return createErrorResponse('Access token required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return createErrorResponse('Invalid or expired token', 401);
    }

    // Verify user still exists in database and is active
    const { User } = getModels();
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        status: 'active',
        isEmailVerified: true
      }
    });

    if (!user) {
      return createErrorResponse('User not found or inactive', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return createErrorResponse('Account is temporarily locked', 423);
    }

    return createSuccessResponse({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        dbKey: user.dbKey
      }
    }, 'Session valid');

  } catch (error) {
    console.error('Session verification error:', error);
    return createErrorResponse('Session verification failed', 500);
  }
}