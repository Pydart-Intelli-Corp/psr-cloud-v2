import { NextRequest } from 'next/server';
import { getModels } from '@/models';
import { sendAdminRejectionEmail, sendAdminWelcomeEmail } from '@/lib/emailService';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { UserStatus } from '@/models/User';
import { generateUniqueDbKey, createAdminSchema } from '@/lib/adminSchema';

// Get pending admin approvals
export async function GET() {
  try {
    await connectDB();
    const { User } = getModels();

    // Get all pending admin approvals
    const pendingAdmins = await User.findAll({
      where: {
        role: 'admin',
        status: UserStatus.PENDING_APPROVAL,
        isEmailVerified: true
      },
      attributes: [
        'id', 'uid', 'email', 'fullName', 'companyName', 
        'companyPincode', 'companyCity', 'companyState', 
        'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    return createSuccessResponse(
      pendingAdmins,
      'Pending admin approvals retrieved successfully'
    );

  } catch (error: unknown) {
    console.error('Get pending approvals error:', error);
    return createErrorResponse('Failed to retrieve pending approvals', 500);
  }
}

// Approve or reject admin
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    
    const body = await request.json();
    const { adminId, action, reason } = body; // action: 'approve' or 'reject'

    // Validate required fields
    const validation = validateRequiredFields(body, ['adminId', 'action']);
    if (!validation.success) {
      const missingFields = validation.missing?.join(', ') || 'Required fields missing';
      return createErrorResponse(`Missing required fields: ${missingFields}`, 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return createErrorResponse('Invalid action. Must be "approve" or "reject"', 400);
    }

    // Find the admin user
    const adminUser = await User.findOne({
      where: {
        id: adminId,
        role: 'admin',
        status: UserStatus.PENDING_APPROVAL,
        isEmailVerified: true
      }
    });

    if (!adminUser) {
      return createErrorResponse('Admin user not found or not pending approval', 404);
    }

    if (action === 'approve') {
      // Generate unique dbKey for the admin
      const dbKey = await generateUniqueDbKey(adminUser.fullName);
      
      // Update admin with dbKey and activate account
      await adminUser.update({
        status: UserStatus.ACTIVE,
        dbKey: dbKey
      });

      console.log(`🔑 Generated dbKey for ${adminUser.fullName}: ${dbKey}`);

      // Create dedicated schema for the admin
      try {
        await createAdminSchema(adminUser.toJSON(), dbKey);
        console.log(`✅ Schema created successfully for admin: ${adminUser.fullName}`);
      } catch (schemaError) {
        console.error('❌ Failed to create admin schema:', schemaError);
        // Rollback the approval if schema creation fails
        await adminUser.update({
          status: UserStatus.PENDING_APPROVAL,
          dbKey: undefined
        });
        return createErrorResponse('Failed to create admin database schema. Please try again.', 500);
      }

      // Send welcome email with dbKey
      try {
        await sendAdminWelcomeEmail(
          adminUser.email,
          adminUser.fullName,
          dbKey
        );
        console.log('✅ Admin welcome email with dbKey sent successfully');
      } catch (emailError) {
        console.error('⚠️ Failed to send admin welcome email:', emailError);
        // Don't rollback approval just for email failure, but log it
      }

      // Return success response
      const userResponse = {
        id: adminUser.id,
        uid: adminUser.uid,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status,
        companyName: adminUser.companyName
      };

      return createSuccessResponse(
        'Admin account approved successfully',
        JSON.stringify(userResponse)
      );

    } else {
      // Reject the admin
      await adminUser.update({
        status: UserStatus.INACTIVE
      });

      // Send rejection email with reason
      try {
        await sendAdminRejectionEmail(
          adminUser.email,
          adminUser.fullName,
          reason // Optional rejection reason
        );
        console.log('✅ Rejection email sent to admin');
      } catch (emailError) {
        console.error('⚠️ Failed to send rejection email:', emailError);
      }
      
      return createSuccessResponse(
        'Admin account rejected successfully',
        JSON.stringify({ id: adminUser.id, status: 'rejected', reason })
      );
    }

  } catch (error: unknown) {
    console.error('Admin approval error:', error);
    return createErrorResponse('Failed to process admin approval', 500);
  }
}