import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface LoginRequest {
  username: string;
  password: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password }: LoginRequest = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Username and password are required',
            code: 'MISSING_CREDENTIALS'
          }
        },
        { status: 400 }
      );
    }

    // Get super admin credentials from environment
    const superAdminUsername = process.env.SUPER_ADMIN_USERNAME;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminUsername || !superAdminPassword) {
      console.error('Super admin credentials not configured in environment');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Server configuration error',
            code: 'CONFIG_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Check credentials
    if (username !== superAdminUsername || password !== superAdminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          }
        },
        { status: 401 }
      );
    }

    // Create admin user object
    const adminUser: AdminUser = {
      id: 1,
      username: superAdminUsername,
      email: 'admin@poornasree.com',
      role: 'super_admin'
    };

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !jwtRefreshSecret) {
      console.error('JWT secrets not configured');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Server configuration error',
            code: 'JWT_CONFIG_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Generate tokens
    const tokenPayload = { 
      id: adminUser.id,  // Use 'id' instead of 'userId' to match JWTPayload interface
      uid: 'super-admin',
      email: adminUser.email,
      role: adminUser.role,
      dbKey: 'master',
      type: 'admin'
    };

    const refreshTokenPayload = { 
      id: adminUser.id,  // Use 'id' instead of 'userId' 
      uid: 'super-admin',
      email: adminUser.email,
      type: 'admin_refresh'
    };

    // Generate JWT tokens with proper options
    const jwtOptions: jwt.SignOptions = {
      expiresIn: '7d',
      issuer: 'poornasree-equipments-cloud',
      audience: 'psr-client'
    };
    
    const refreshJwtOptions: jwt.SignOptions = {
      expiresIn: '30d',
      issuer: 'poornasree-equipments-cloud',
      audience: 'psr-client'
    };
    
    const token = jwt.sign(tokenPayload, jwtSecret as string, jwtOptions);
    const refreshToken = jwt.sign(refreshTokenPayload, jwtRefreshSecret as string, refreshJwtOptions);

    // Log successful login
    console.log(`Super admin login successful: ${username} at ${new Date().toISOString()}`);

    // Create response with cookies for middleware compatibility
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: adminUser,
        token,
        refreshToken
      }
    });

    // Set HTTP-only cookies for middleware authentication
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    },
    { status: 405 }
  );
}