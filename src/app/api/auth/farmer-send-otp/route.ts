import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/middleware/auth';
import { generateOTP, sendOTPEmail } from '@/lib/emailService';

/**
 * POST /api/auth/farmer-send-otp
 * Send OTP to farmer's email for authentication
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.success) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    const { email } = body;
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

    console.log(`🔍 Farmer OTP Request: Searching for email ${normalizedEmail} across ${uniqueSchemas.length} schemas...`);

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
            f.status,
            f.society_id,
            s.name as society_name
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
        console.log(`⚠️ Could not query schema ${schema}:`, error);
        continue;
      }
    }

    // Check if farmer was found
    if (!farmerFound) {
      console.log(`❌ Farmer OTP Request: No farmer found with email ${normalizedEmail}`);
      return createErrorResponse('No farmer account found with this email address', 404);
    }

    const farmer = farmerFound as any;

    // Check if farmer account is active
    if (farmer.status !== 'active') {
      return createErrorResponse(
        `Your account is ${farmer.status}. Please contact your society administrator.`,
        403
      );
    }

    // Check if email is provided
    if (!farmer.email || farmer.email.trim() === '') {
      return createErrorResponse(
        'No email address registered for your account. Please contact your society administrator.',
        403
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in the farmer record
    // First, check if otp_code and otp_expires columns exist
    try {
      await sequelize.query(`
        UPDATE \`${farmerSchema}\`.farmers 
        SET otp_code = ?, otp_expires = ?
        WHERE id = ?
      `, { replacements: [otp, otpExpiry, farmer.id] });
    } catch (updateError) {
      // Columns might not exist, try to add them
      console.log('⚠️ OTP columns might not exist, attempting to add...');
      try {
        // Check which columns exist
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'farmers'
          AND COLUMN_NAME IN ('otp_code', 'otp_expires')
        `, { replacements: [farmerSchema] });

        const existingColumns = (columns as Array<{ COLUMN_NAME: string }>).map(c => c.COLUMN_NAME);

        // Add missing columns
        if (!existingColumns.includes('otp_code')) {
          await sequelize.query(`
            ALTER TABLE \`${farmerSchema}\`.farmers 
            ADD COLUMN otp_code VARCHAR(6)
          `);
          console.log('✅ Added otp_code column');
        }
        
        if (!existingColumns.includes('otp_expires')) {
          await sequelize.query(`
            ALTER TABLE \`${farmerSchema}\`.farmers 
            ADD COLUMN otp_expires DATETIME
          `);
          console.log('✅ Added otp_expires column');
        }
        
        // Retry update
        await sequelize.query(`
          UPDATE \`${farmerSchema}\`.farmers 
          SET otp_code = ?, otp_expires = ?
          WHERE id = ?
        `, { replacements: [otp, otpExpiry, farmer.id] });
      } catch (alterError) {
        console.error('❌ Failed to add OTP columns:', alterError);
        return createErrorResponse('Database configuration error. Please contact support.', 500);
      }
    }

    // Send OTP email
    try {
      await sendOTPEmail(farmer.email, otp, farmer.name);
      console.log(`✅ OTP sent to farmer ${farmer.name} (${farmer.farmer_id}) at ${farmer.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      return createErrorResponse('Failed to send OTP email. Please try again.', 500);
    }

    return createSuccessResponse({
      email: farmer.email,
      farmerId: farmer.farmer_id,
      farmerName: farmer.name,
      expiresIn: '10 minutes'
    }, 'OTP sent successfully to your registered email');

  } catch (error) {
    console.error('❌ Farmer OTP request error:', error);
    return createErrorResponse('Failed to send OTP. Please try again.', 500);
  }
}
