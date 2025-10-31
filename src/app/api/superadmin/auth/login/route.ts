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
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      type: 'admin'
    };

    const refreshTokenPayload = { 
      userId: adminUser.id,
      username: adminUser.username,
      type: 'admin_refresh'
    };

    // Generate JWT tokens (simplified for now to avoid TypeScript issues)
    const token = jwt.sign(tokenPayload, jwtSecret as string, { expiresIn: '7d' });
    const refreshToken = jwt.sign(refreshTokenPayload, jwtRefreshSecret as string, { expiresIn: '30d' });

    // Log successful login
    console.log(`Super admin login successful: ${username} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: adminUser,
        token,
        refreshToken
      }
    });

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