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
    const { email, uid, otpCode } = body;

    console.log('🔐 OTP verification request:', { email, uid, otpCode });

    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'otpCode']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    // Find user by email (and optionally uid for extra security)
    const whereClause: { 
      email: string; 
      isEmailVerified: boolean; 
      uid?: string; 
    } = { 
      email: email.toLowerCase(),
      isEmailVerified: false
    };
    
    // Add uid to search criteria if provided for extra security
    if (uid) {
      whereClause.uid = uid;
    }

    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return createErrorResponse('User not found or already verified', 404);
    }

    // Check if OTP has expired
    if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
      return createErrorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP (check both emailVerificationToken and otpCode fields)
    const isValidOtp = (user.emailVerificationToken === otpCode) || (user.otpCode === otpCode);
    
    if (!isValidOtp) {
      console.log('❌ OTP verification failed:', { 
        provided: otpCode, 
        expected: user.emailVerificationToken || user.otpCode 
      });
      return createErrorResponse('Invalid OTP. Please try again.', 400);
    }

    console.log('✅ OTP verification successful for user:', user.email);

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
        await sendAdminApprovalRequest(user.email, user.fullName, user.companyName || 'Not specified');
        console.log('✅ Admin approval request email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send admin approval request email:', emailError);
        // Don't fail the verification if email fails
      }
    } else {
      // For non-admin users, send welcome email
      try {
        await sendWelcomeEmail(user.email, user.fullName, user.role);
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail the verification if email fails
      }
    }

    // Return success response
    const userResponse = {
      id: user.id,
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified
    };

    const message = user.role === 'admin' 
      ? 'Email verified successfully! Your admin account is now pending approval from Super Admin.'
      : 'Email verified successfully! You can now login to your account.';

    return createSuccessResponse(
      userResponse,
      message
    );

  } catch (error: unknown) {
    console.error('OTP verification error:', error);
    return createErrorResponse('OTP verification failed. Please try again.', 500);
  }
}