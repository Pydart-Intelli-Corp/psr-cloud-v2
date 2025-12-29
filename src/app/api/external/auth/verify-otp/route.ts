import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { generateTokens } from '@/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Extend global interface for OTP store
declare global {
  var otpStore: Map<string, {
    otp: string;
    expiry: Date;
    entityType: 'society' | 'dairy' | 'bmc' | 'farmer' | 'admin';
    entityData: any;
    schemaName: string;
    adminInfo: any;
  }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return createErrorResponse('Email and OTP are required', 400, undefined, corsHeaders);
    }

    // Check OTP from temporary storage
    global.otpStore = global.otpStore || new Map();
    const otpData = global.otpStore.get(email.toLowerCase());

    if (!otpData) {
      return createErrorResponse('OTP session not found. Please request a new OTP.', 404, undefined, corsHeaders);
    }

    // Check if OTP is expired
    if (new Date() > otpData.expiry) {
      global.otpStore.delete(email.toLowerCase());
      return createErrorResponse('OTP has expired. Please request a new OTP.', 400, undefined, corsHeaders);
    }

    // Verify OTP
    if (otpData.otp !== otp.trim()) {
      return createErrorResponse('Invalid OTP. Please check and try again.', 400, undefined, corsHeaders);
    }

    await connectDB();

    // Clean up the used OTP
    global.otpStore.delete(email.toLowerCase());

    // Generate authentication tokens
    const tokenPayload = {
      id: otpData.entityData.id,
      uid: otpData.entityData.society_id || otpData.entityData.farmer_id || otpData.entityData.bmc_id || otpData.entityData.dairy_id,
      email: email.toLowerCase(),
      role: otpData.entityType,
      dbKey: otpData.adminInfo?.dbKey,
      entityType: otpData.entityType,
      schemaName: otpData.schemaName
    };

    const { token, refreshToken } = generateTokens(tokenPayload as any);

    // Prepare entity data based on type
    let dashboardData: any = {};
    
    switch (otpData.entityType) {
      case 'admin':
        dashboardData = {
          type: 'admin',
          id: otpData.entityData.id,
          name: otpData.entityData.fullName,
          email: otpData.entityData.email,
          role: otpData.entityData.role,
          companyName: otpData.entityData.companyName,
          schema: otpData.schemaName,
          dbKey: otpData.entityData.dbKey
        };
        break;
        
      case 'society':
        dashboardData = {
          type: 'society',
          id: otpData.entityData.id,
          societyId: otpData.entityData.society_id,
          name: otpData.entityData.name,
          email: otpData.entityData.email,
          location: otpData.entityData.location,
          presidentName: otpData.entityData.president_name,
          contactPhone: otpData.entityData.contact_phone,
          bmcId: otpData.entityData.bmc_id,
          bmcName: otpData.entityData.bmc_name,
          dairyName: otpData.entityData.dairy_name,
          dairyId: otpData.entityData.dairy_id,
          status: otpData.entityData.status,
          adminName: otpData.adminInfo?.fullName,
          adminEmail: otpData.adminInfo?.email,
          schema: otpData.schemaName
        };
        break;
        
      case 'farmer':
        dashboardData = {
          type: 'farmer',
          id: otpData.entityData.id,
          farmerId: otpData.entityData.farmer_id,
          name: otpData.entityData.name,
          email: otpData.entityData.email,
          phone: otpData.entityData.phone,
          societyId: otpData.entityData.society_id,
          societyName: otpData.entityData.society_name,
          societyIdentifier: otpData.entityData.society_identifier,
          bmcName: otpData.entityData.bmc_name,
          dairyName: otpData.entityData.dairy_name,
          dairyId: otpData.entityData.dairy_id,
          status: otpData.entityData.status,
          adminName: otpData.adminInfo?.fullName,
          adminEmail: otpData.adminInfo?.email,
          schema: otpData.schemaName
        };
        break;
        
      case 'bmc':
        dashboardData = {
          type: 'bmc',
          id: otpData.entityData.id,
          bmcId: otpData.entityData.bmc_id,
          name: otpData.entityData.name,
          email: otpData.entityData.email,
          location: otpData.entityData.location,
          contactPhone: otpData.entityData.contact_phone,
          dairyId: otpData.entityData.dairy_id,
          dairyName: otpData.entityData.dairy_name,
          dairyIdentifier: otpData.entityData.dairy_identifier,
          status: otpData.entityData.status,
          adminName: otpData.adminInfo?.fullName,
          adminEmail: otpData.adminInfo?.email,
          schema: otpData.schemaName
        };
        break;
        
      case 'dairy':
        dashboardData = {
          type: 'dairy',
          id: otpData.entityData.id,
          dairyId: otpData.entityData.dairy_id,
          name: otpData.entityData.name,
          email: otpData.entityData.email,
          location: otpData.entityData.location,
          contactPhone: otpData.entityData.contact_phone,
          presidentName: otpData.entityData.president_name,
          status: otpData.entityData.status,
          adminName: otpData.adminInfo?.fullName,
          adminEmail: otpData.adminInfo?.email,
          schema: otpData.schemaName
        };
        break;
    }

    console.log(`✅ Authentication successful for ${otpData.entityType}: ${dashboardData.name || dashboardData.farmerId}`);

    return createSuccessResponse('Authentication successful', {
      token,
      refreshToken,
      user: dashboardData,
      expiresIn: '7d'
    }, 200, corsHeaders);

  } catch (error: unknown) {
    console.error('Error in verify-otp:', error);
    return createErrorResponse('Failed to verify OTP', 500, undefined, corsHeaders);
  }
}


