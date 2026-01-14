import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { generateOTP, sendOTPEmail } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { UserRole, UserStatus } from '@/models/User';

interface SequelizeError extends Error {
  errors: Array<{ message: string }>;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { fullName, email, password, role, parentId, companyName, companyPincode, companyCity, companyState } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['fullName', 'email', 'password', 'role', 'companyName', 'companyPincode', 'companyCity', 'companyState']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    // Validate role hierarchy
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return createErrorResponse('Invalid role specified', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409);
    }

    // Validate parent relationship for hierarchical roles
    if (role !== UserRole.ADMIN && !parentId) {
      return createErrorResponse('Parent ID is required for non-admin users', 400);
    }

    let parentUser = null;
    if (parentId) {
      parentUser = await User.findByPk(parentId);
      if (!parentUser) {
        return createErrorResponse('Invalid parent user', 400);
      }

      // Validate hierarchy logic
      const hierarchyMap: Record<UserRole, UserRole[]> = {
        [UserRole.SUPER_ADMIN]: [],
        [UserRole.ADMIN]: [UserRole.SUPER_ADMIN],
        [UserRole.DAIRY]: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
        [UserRole.BMC]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY],
        [UserRole.SOCIETY]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC],
        [UserRole.FARMER]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY]
      };

      if (!hierarchyMap[role as UserRole].includes(parentUser.role)) {
        return createErrorResponse('Invalid parent-child role relationship', 400);
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate unique UID
    const uid = `PSR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user (password will be hashed automatically by the model hook)
    const newUser = await User.create({
      uid,
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      status: UserStatus.PENDING_APPROVAL,
      parentId: parentId || null,
      companyName: companyName || null,
      companyPincode: companyPincode || null,
      companyCity: companyCity || null,
      companyState: companyState || null,
      isEmailVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpiry,
      otpCode: otp,
      otpExpires: otpExpiry,
      loginAttempts: 0
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, fullName);
      console.log('✅ OTP email sent successfully');
    } catch (emailError) {
      // Log the error but allow registration to continue (for development)
      console.error('⚠️ Email sending failed, but registration continues:', emailError);
      // In production, you might want to fail the registration if email is critical
      // await User.destroy({ where: { id: newUser.id } });
      // return createErrorResponse('Failed to send verification email. Please try again.', 500);
    }

    // Return success response (without sensitive data)
    const userResponse = {
      id: newUser.id,
      uid: newUser.uid,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      parentId: newUser.parentId,
      isEmailVerified: newUser.isEmailVerified,
      status: newUser.status
    };

    return createSuccessResponse(
      'Registration successful. Please check your email for verification code.',
      JSON.stringify(userResponse)
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'SequelizeValidationError') {
        const validationError = error as SequelizeError;
        const validationErrors = validationError.errors.map((err) => err.message);
        return createErrorResponse(`Validation failed: ${validationErrors.join(', ')}`, 400);
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return createErrorResponse('User with this email already exists', 409);
      }
    }

    return createErrorResponse('Registration failed. Please try again.', 500);
  }
}