import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return createErrorResponse('Refresh token is required', 400);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return createErrorResponse('Invalid or expired refresh token', 401);
    }

    // Generate new tokens
    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(payload);

    console.log(`✅ Token refreshed for ${payload.entityType}: ${payload.uid}`);

    return createSuccessResponse('Token refreshed successfully', {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: '7d'
    });

  } catch (error: unknown) {
    console.error('Error refreshing token:', error);
    return createErrorResponse('Failed to refresh token', 500);
  }
}