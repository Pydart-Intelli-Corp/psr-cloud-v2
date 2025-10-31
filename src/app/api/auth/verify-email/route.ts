import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { sendWelcomeEmail, sendAdminApprovalRequest } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { UserStatus } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { email, otp } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'otp']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    // Find user by email
    const user = await User.findOne({
      where: { 
        email: email.toLowerCase(),
        isEmailVerified: false
      }
    });

    if (!user) {
      return createErrorResponse('User not found or already verified', 404);
    }

    // Check if OTP has expired
    if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
      return createErrorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (user.emailVerificationToken !== otp) {
      // Increment failed attempts (could be tracked in future)
      return createErrorResponse('Invalid OTP. Please try again.', 400);
    }

    // Update user as verified but pending approval for admin roles
    const newStatus = user.role === 'admin' ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;
    
    await user.update({
      isEmailVerified: true,
      status: newStatus,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
      otpCode: undefined,
      otpExpires: undefined
    });

    // For admin users, send approval request to super admin
    if (user.role === 'admin') {
      try {
        await sendAdminApprovalRequest(user.email, user.fullName, user.companyName || '');
        console.log('✅ Admin approval request sent to super admin');
      } catch (emailError) {
        console.error('⚠️ Failed to send admin approval request:', emailError);
      }
    } else {
      // For non-admin users, send welcome email immediately
      try {
        await sendWelcomeEmail(
          user.email,
          user.fullName,
          user.role
        );
      } catch (emailError) {
        console.error('Welcome email sending failed:', emailError);
      }
    }

    // Return success response (without sensitive data)
    const userResponse = {
      id: user.id,
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      parentId: user.parentId
    };

    const successMessage = user.role === 'admin' 
      ? 'Email verified successfully! Your admin account is pending approval from the Organization. You will receive a welcome email once approved.'
      : 'Email verified successfully. Welcome to Poornasree Equipments Cloud!';

    return createSuccessResponse(
      successMessage,
      JSON.stringify(userResponse)
    );

  } catch (error: unknown) {
    console.error('Email verification error:', error);
    return createErrorResponse('Email verification failed. Please try again.', 500);
  }
}