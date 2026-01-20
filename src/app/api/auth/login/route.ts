import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getModels } from '@/models';
import { UserRole } from '@/models/User';
import { generateTokens, isSuperAdmin } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'password']);
    if (!validation.success) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    const { email, password } = body;

    // Check if this is super admin login
    if (isSuperAdmin({ email })) {
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'psr@2025';
      
      if (password !== superAdminPassword) {
        return createErrorResponse('Invalid credentials', 401);
      }

      // Create super admin user data
      const superAdminUser = {
        id: 0,
        uid: 'super-admin',
        email,
        role: UserRole.SUPER_ADMIN,
        dbKey: 'master'
      };

      const tokens = generateTokens(superAdminUser);
      
      // Set HTTP-only cookie
      const response = createSuccessResponse({
        user: {
          id: superAdminUser.id,
          uid: superAdminUser.uid,
          email: superAdminUser.email,
          fullName: 'Super Admin',
          role: superAdminUser.role
        },
        token: tokens.token
      }, 'Login successful');

      response.cookies.set('authToken', tokens.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });

      console.log('✅ Super Admin Login: Cookies set successfully');

      return response;
    }

    // Regular user login
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return createErrorResponse(
        'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
        423
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return createErrorResponse('Invalid credentials', 401);
    }

    // Check if user status is active
    if (user.status !== 'active') {
      return createErrorResponse(
        'Your account is pending approval. Please wait for an administrator to approve your registration.',
        403
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return createErrorResponse(
        'Please verify your email address before logging in.',
        403
      );
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    await user.update({ 
      lastLogin: new Date()
    });

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,
      dbKey: user.dbKey
    });

    // Create response
    const response = createSuccessResponse({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token: tokens.token,
      refreshToken: tokens.refreshToken
    }, 'Login successful');

    // Set cookies
    response.cookies.set('authToken', tokens.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    console.log('✅ Login: Cookies set successfully');

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Login failed. Please try again.', 500);
  }
}