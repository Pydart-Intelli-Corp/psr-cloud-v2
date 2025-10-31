import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { UserStatus } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.success) {
      return createErrorResponse('Email is required', 400);
    }

    // Find user by email
    const user = await User.findOne({
      where: { 
        email: email.toLowerCase()
      }
    });

    if (!user) {
      // Return success response indicating no user exists
      return createSuccessResponse({
        exists: false,
        email: email.toLowerCase(),
        message: 'Email is available for registration'
      }, 'Email is available for registration');
    }

    // Generate status response
    let statusMessage = '';
    let statusType = '';
    let canLogin = false;
    let nextAction = '';

    switch (user.status) {
      case UserStatus.PENDING:
        if (!user.isEmailVerified) {
          statusMessage = 'Account created but email not verified. Please check your email for the verification code.';
          statusType = 'email_verification_pending';
          nextAction = 'verify_email';
        } else {
          statusMessage = 'Email verified but account activation is pending.';
          statusType = 'activation_pending';
          nextAction = 'wait_for_activation';
        }
        break;

      case UserStatus.PENDING_APPROVAL:
        statusMessage = 'Your admin account is pending approval from the Organization. You will receive a welcome email once approved.';
        statusType = 'admin_approval_pending';
        nextAction = 'wait_for_approval';
        break;

      case UserStatus.ACTIVE:
        statusMessage = 'Account is active and ready to use.';
        statusType = 'active';
        canLogin = true;
        nextAction = 'login';
        break;

      case UserStatus.INACTIVE:
        statusMessage = 'Account has been deactivated. Please contact support for assistance.';
        statusType = 'inactive';
        nextAction = 'contact_support';
        break;

      case UserStatus.SUSPENDED:
        statusMessage = 'Account has been suspended. Please contact support for assistance.';
        statusType = 'suspended';
        nextAction = 'contact_support';
        break;

      default:
        statusMessage = 'Account status is unknown. Please contact support.';
        statusType = 'unknown';
        nextAction = 'contact_support';
    }

    // Additional context for rejected admins (if we add rejection reason field later)
    if (user.role === 'admin' && user.status === UserStatus.INACTIVE && user.isEmailVerified) {
      statusMessage = 'Your admin application was not approved. Please contact support if you believe this is an error.';
      statusType = 'admin_rejected';
      nextAction = 'contact_support';
    }

    const response = {
      exists: true,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status, // This will be the actual database status
      isEmailVerified: user.isEmailVerified,
      statusMessage,
      statusType,
      canLogin,
      nextAction,
      accountExists: true // Keep for backward compatibility
    };

    return createSuccessResponse(
      response,
      statusMessage
    );

  } catch (error: unknown) {
    console.error('Account status check error:', error);
    return createErrorResponse('Failed to check account status. Please try again.', 500);
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (!email) {
    return createErrorResponse('Email parameter is required', 400);
  }

  // Create a fake request body for the POST handler
  const fakeRequest = {
    json: async () => ({ email })
  } as NextRequest;

  return POST(fakeRequest);
}