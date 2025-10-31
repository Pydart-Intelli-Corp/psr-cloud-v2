import { createSuccessResponse } from '@/middleware/auth';

export async function POST() {
  try {
    // Create response
    const response = createSuccessResponse(
      null,
      'Logged out successfully'
    );

    // Clear cookies
    response.cookies.delete('authToken');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies and return success
    const response = createSuccessResponse(
      null,
      'Logged out successfully'
    );
    
    response.cookies.delete('authToken');
    response.cookies.delete('refreshToken');
    
    return response;
  }
}