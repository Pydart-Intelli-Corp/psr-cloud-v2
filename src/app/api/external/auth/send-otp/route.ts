import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/emailService';

// Extend global interface for OTP store
declare global {
  var otpStore: Map<string, {
    otp: string;
    expiry: Date;
    entityType: 'society' | 'dairy' | 'bmc' | 'farmer';
    entityData: any;
    schemaName: string;
    adminInfo: any;
  }> | undefined;
}

// Helper function to find entity by email across all admin schemas
async function findEntityByEmail(email: string): Promise<{
  found: boolean;
  entityType?: 'society' | 'dairy' | 'bmc' | 'farmer';
  entityData?: any;
  schemaName?: string;
  adminInfo?: any;
}> {
  const { sequelize, User } = await import('@/models').then(m => m.getModels());
  
  // Get all admin schemas
  const [schemas] = await sequelize.query(`
    SELECT DISTINCT TABLE_SCHEMA 
    FROM information_schema.TABLES 
    WHERE (TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%' OR TABLE_SCHEMA LIKE 'tishnu_%') 
    ORDER BY TABLE_SCHEMA
  `);
  
  const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
  
  // Get admin info for each schema
  const [adminUsers] = await sequelize.query(`
    SELECT id, fullName, email, dbKey 
    FROM users 
    WHERE role = 'admin' AND dbKey IS NOT NULL
  `);
  
  const adminLookup = (adminUsers as any[]).reduce((acc, admin) => {
    const cleanName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanName}_${admin.dbKey.toLowerCase()}`;
    acc[schemaName] = admin;
    return acc;
  }, {} as Record<string, any>);
  
  for (const schema of adminSchemas) {
    try {
      // console.log(`Checking schema: ${schema} for email: ${email}`);
      // Check societies
      const [societies] = await sequelize.query(`
        SELECT s.id, s.name, s.society_id, s.email, s.location, s.president_name, 
               s.contact_phone, s.bmc_id, s.status
        FROM \`${schema}\`.societies s
        WHERE s.email = ?
      `, { replacements: [email.trim().toLowerCase()] });
      
      if (Array.isArray(societies) && societies.length > 0) {
        const society = societies[0] as any;
        try {
          const [extras] = await sequelize.query(`
            SELECT b.name as bmc_name, d.name as dairy_name, d.id as dairy_id
            FROM \`${schema}\`.bmcs b
            LEFT JOIN \`${schema}\`.dairies d ON b.dairy_id = d.id
            WHERE b.id = ?
          `, { replacements: [society.bmc_id] });
          if (Array.isArray(extras) && extras.length > 0) Object.assign(society, extras[0]);
        } catch (e) { /* Ignore missing tables */ }

        return {
          found: true,
          entityType: 'society',
          entityData: society,
          schemaName: schema,
          adminInfo: adminLookup[schema]
        };
      }
      
      // Check farmers
      const [farmers] = await sequelize.query(`
        SELECT f.id, f.farmer_id, f.name, f.email, f.phone, f.society_id, f.status
        FROM \`${schema}\`.farmers f
        WHERE f.email = ?
      `, { replacements: [email.trim().toLowerCase()] });
      
      if (Array.isArray(farmers) && farmers.length > 0) {
        const farmer = farmers[0] as any;
        try {
          const [extras] = await sequelize.query(`
            SELECT s.name as society_name, s.society_id as society_identifier,
                   b.name as bmc_name, d.name as dairy_name, d.id as dairy_id
            FROM \`${schema}\`.societies s
            LEFT JOIN \`${schema}\`.bmcs b ON s.bmc_id = b.id
            LEFT JOIN \`${schema}\`.dairies d ON b.dairy_id = d.id
            WHERE s.id = ?
          `, { replacements: [farmer.society_id] });
          if (Array.isArray(extras) && extras.length > 0) Object.assign(farmer, extras[0]);
        } catch (e) { /* Ignore missing tables */ }

        return {
          found: true,
          entityType: 'farmer',
          entityData: farmer,
          schemaName: schema,
          adminInfo: adminLookup[schema]
        };
      }
      
      // Check BMCs
      const [bmcs] = await sequelize.query(`
        SELECT b.id, b.name, b.bmc_id, b.email, b.location, b.contact_phone, 
               b.dairy_id, b.status
        FROM \`${schema}\`.bmcs b
        WHERE b.email = ?
      `, { replacements: [email.trim().toLowerCase()] });
      
      if (Array.isArray(bmcs) && bmcs.length > 0) {
        const bmc = bmcs[0] as any;
        try {
          const [extras] = await sequelize.query(`
            SELECT d.name as dairy_name, d.dairy_id as dairy_identifier
            FROM \`${schema}\`.dairies d
            WHERE d.id = ?
          `, { replacements: [bmc.dairy_id] });
          if (Array.isArray(extras) && extras.length > 0) Object.assign(bmc, extras[0]);
        } catch (e) { /* Ignore missing tables */ }

        return {
          found: true,
          entityType: 'bmc',
          entityData: bmc,
          schemaName: schema,
          adminInfo: adminLookup[schema]
        };
      }
      
      // Check Dairies
      const [dairies] = await sequelize.query(`
        SELECT d.id, d.name, d.dairy_id, d.email, d.location, d.contact_phone, 
               d.president_name, d.status
        FROM \`${schema}\`.dairies d
        WHERE d.email = ?
      `, { replacements: [email.trim().toLowerCase()] });
      
      if (Array.isArray(dairies) && dairies.length > 0) {
        return {
          found: true,
          entityType: 'dairy',
          entityData: dairies[0],
          schemaName: schema,
          adminInfo: adminLookup[schema]
        };
      }
      
    } catch (error) {
      console.error(`⚠️ Schema ${schema} error:`, error);
      continue;
    }
  }
  
  return { found: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return createErrorResponse('Email address is required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return createErrorResponse('Please enter a valid email address', 400);
    }

    await connectDB();

    // Find entity by email across all admin schemas
    const result = await findEntityByEmail(email);
    
    if (!result.found) {
      console.log(`📧 Email not found in any schema: ${email}`);
      return createErrorResponse('Email address not found. Please contact your supervisor for registration.', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in a temporary session storage (you might want to use Redis in production)
    // For now, using a simple in-memory store
    global.otpStore = global.otpStore || new Map();
    
    // Ensure we have the required data before storing
    if (!result.entityType || !result.schemaName || !result.adminInfo) {
      return createErrorResponse('Invalid entity data found', 500);
    }
    
    global.otpStore.set(email.toLowerCase(), {
      otp,
      expiry: otpExpiry,
      entityType: result.entityType,
      entityData: result.entityData,
      schemaName: result.schemaName,
      adminInfo: result.adminInfo
    });

    // Clean up expired OTPs
    const now = new Date();
    for (const [key, value] of global.otpStore.entries()) {
      if (value.expiry < now) {
        global.otpStore.delete(key);
      }
    }

    // Send OTP email
    const entityName = result.entityData.name || result.entityData.farmer_id || 'User';
    const entityTypeTitle = result.entityType ? result.entityType.charAt(0).toUpperCase() + result.entityType.slice(1) : 'User';
    
    try {
      await sendOTPEmail(email, otp, entityName);
      console.log(`✅ OTP sent successfully to ${email} for ${result.entityType}: ${entityName}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return createErrorResponse('Failed to send OTP. Please try again later.', 500);
    }

    return createSuccessResponse('OTP sent successfully to your email address', {
      email,
      entityType: result.entityType,
      entityName,
      adminName: result.adminInfo?.fullName,
      message: `OTP sent to ${email}. Please check your email and enter the 6-digit code.`
    });

  } catch (error: unknown) {
    console.error('Error in send-otp:', error);
    return createErrorResponse('Failed to process request', 500);
  }
}