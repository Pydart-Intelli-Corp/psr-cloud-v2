import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return createErrorResponse('Invalid authentication token', 401);
    }

    // For JWT-based authentication, logout is primarily handled client-side
    // by removing the tokens. In production, you might want to maintain a 
    // blacklist of revoked tokens in Redis or similar.

    console.log(`✅ Logout successful for ${payload.entityType}: ${payload.uid}`);

    return createSuccessResponse('Logout successful', {
      message: 'You have been successfully logged out'
    });

  } catch (error: unknown) {
    console.error('Error during logout:', error);
    return createErrorResponse('Failed to logout', 500);
  }
}