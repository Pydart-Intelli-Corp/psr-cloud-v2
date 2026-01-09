import { NextRequest } from 'next/server';
import { generateTokens } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { UserRole } from '@/models/User';

/**
 * POST /api/auth/farmer-login
 * Farmer login endpoint - verifies OTP and logs in farmer
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields (now using OTP instead of password)
    const validation = validateRequiredFields(body, ['email', 'otpCode']);
    if (!validation.success) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    const { email, otpCode } = body;
    const normalizedEmail = email.trim().toLowerCase();

    // Get database connection
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE (TABLE_SCHEMA LIKE '%_%') 
      AND TABLE_NAME = 'farmers'
      ORDER BY TABLE_SCHEMA
    `);

    const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
    const uniqueSchemas = [...new Set(adminSchemas)];

    console.log(`🔍 Farmer Login (OTP): Searching for email ${normalizedEmail} across ${uniqueSchemas.length} schemas...`);

    // Search for farmer across all schemas
    let farmerFound = null;
    let farmerSchema = '';

    for (const schema of uniqueSchemas) {
      try {
        const [farmers] = await sequelize.query(`
          SELECT 
            f.id,
            f.farmer_id,
            f.name,
            f.email,
            f.phone,
            f.status,
            f.otp_code,
            f.otp_expires,
            f.society_id,
            s.name as society_name,
            s.society_id as society_identifier
          FROM \`${schema}\`.farmers f
          LEFT JOIN \`${schema}\`.societies s ON f.society_id = s.id
          WHERE LOWER(f.email) = ?
          LIMIT 1
        `, { replacements: [normalizedEmail] });

        if (Array.isArray(farmers) && farmers.length > 0) {
          farmerFound = farmers[0];
          farmerSchema = schema;
          console.log(`✅ Farmer found in schema: ${schema}`);
          break;
        }
      } catch (error) {
        // Schema might not have farmers table or might not be accessible
        console.log(`⚠️ Could not query schema ${schema}:`, error);
        continue;
      }
    }

    // Check if farmer was found
    if (!farmerFound) {
      console.log(`❌ Farmer Login: No farmer found with email ${normalizedEmail}`);
      return createErrorResponse('Invalid email or OTP', 401);
    }

    const farmer = farmerFound as any;

    // Check if farmer account is active
    if (farmer.status !== 'active') {
      return createErrorResponse(
        `Your account is ${farmer.status}. Please contact your society administrator.`,
        403
      );
    }

    // Check if OTP exists
    if (!farmer.otp_code || !farmer.otp_expires) {
      return createErrorResponse(
        'No OTP found. Please request an OTP first.',
        400
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const otpExpires = new Date(farmer.otp_expires);
    if (now > otpExpires) {
      console.log(`❌ Farmer Login: OTP expired for farmer ${farmer.farmer_id}`);
      return createErrorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (farmer.otp_code !== otpCode) {
      console.log(`❌ Farmer Login: Invalid OTP for farmer ${farmer.farmer_id}`);
      return createErrorResponse('Invalid OTP. Please try again.', 401);
    }

    // Clear OTP after successful verification
    await sequelize.query(`
      UPDATE \`${farmerSchema}\`.farmers 
      SET otp_code = NULL, otp_expires = NULL
      WHERE id = ?
    `, { replacements: [farmer.id] });

    // Generate tokens with farmer role
    const tokens = generateTokens({
      id: farmer.id,
      uid: farmer.farmer_id,
      email: farmer.email,
      role: UserRole.FARMER,
      dbKey: farmerSchema // Store the schema name to identify which admin's schema this farmer belongs to
    });

    // Create response
    const response = createSuccessResponse({
      user: {
        id: farmer.id,
        uid: farmer.farmer_id,
        email: farmer.email,
        fullName: farmer.name,
        role: UserRole.FARMER,
        phone: farmer.phone,
        societyId: farmer.society_id,
        societyName: farmer.society_name,
        societyIdentifier: farmer.society_identifier,
        dbKey: farmerSchema
      },
      token: tokens.token,
      refreshToken: tokens.refreshToken
    }, 'Login successful');

    // Set cookies
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

    console.log(`✅ Farmer Login: Login successful for ${farmer.name} (${farmer.farmer_id})`);

    return response;

  } catch (error) {
    console.error('❌ Farmer login error:', error);
    return createErrorResponse('Login failed. Please try again.', 500);
  }
}
