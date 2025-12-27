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

// Calculate user statistics for last 30 days
async function calculateUserStatistics(
  schemaName: string,
  entityType: 'society' | 'dairy' | 'bmc' | 'farmer' | 'admin',
  entityId: number
): Promise<{
  totalRevenue30Days?: number;
  totalCollection30Days?: number;
  avgFat?: number;
  avgSnf?: number;
  avgClr?: number;
}> {
  try {
    const { sequelize } = await import('@/models').then(m => m.getModels());
    
    console.log(`📊 calculateUserStatistics called: entityType=${entityType}, entityId=${entityId}, schema=${schemaName}`);
    
    // Date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    let query = '';
    let replacements: any[] = [];

    // Build query based on entity type
    if (entityType === 'admin') {
      // Admin sees all statistics in their schema
      query = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as totalRevenue,
          COALESCE(SUM(quantity), 0) as totalCollection,
          COALESCE((SUM(channel1_fat * quantity) + SUM(COALESCE(channel2_fat, 0) * COALESCE(quantity2, 0)) + SUM(COALESCE(channel3_fat, 0) * COALESCE(quantity3, 0))) / NULLIF(SUM(quantity) + SUM(COALESCE(quantity2, 0)) + SUM(COALESCE(quantity3, 0)), 0), 0) as avgFat,
          COALESCE((SUM(channel1_snf * quantity) + SUM(COALESCE(channel2_snf, 0) * COALESCE(quantity2, 0)) + SUM(COALESCE(channel3_snf, 0) * COALESCE(quantity3, 0))) / NULLIF(SUM(quantity) + SUM(COALESCE(quantity2, 0)) + SUM(COALESCE(quantity3, 0)), 0), 0) as avgSnf,
          COALESCE((SUM(channel1_clr * quantity) + SUM(COALESCE(channel2_clr, 0) * COALESCE(quantity2, 0)) + SUM(COALESCE(channel3_clr, 0) * COALESCE(quantity3, 0))) / NULLIF(SUM(quantity) + SUM(COALESCE(quantity2, 0)) + SUM(COALESCE(quantity3, 0)), 0), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections
        WHERE collection_date >= ?
      `;
      replacements = [dateStr];
      
      // First check if table exists
      console.log(`📊 Checking if milk_collections table exists in schema ${schemaName}`);
      try {
        const [tableCheck] = await sequelize.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'milk_collections'
        `);
        
        if (!tableCheck || (tableCheck as any[]).length === 0) {
          console.log(`❌ milk_collections table does not exist in schema ${schemaName}`);
          return {
            totalRevenue30Days: 0,
            totalCollection30Days: 0,
            avgFat: 0,
            avgSnf: 0,
            avgClr: 0,
          };
        }
        
        console.log(`✅ milk_collection table exists in schema ${schemaName}`);
        
        // Check row count
        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as total_rows 
          FROM \`${schemaName}\`.milk_collections
        `);
        console.log(`📊 Total rows in milk_collections: ${(countResult as any[])[0]?.total_rows || 0}`);
        
        // Check rows in last 30 days
        const [recentCount] = await sequelize.query(`
          SELECT COUNT(*) as recent_rows 
          FROM \`${schemaName}\`.milk_collections
          WHERE collection_date >= ?
        `, { replacements: [dateStr] });
        console.log(`📊 Rows in last 30 days (>= ${dateStr}): ${(recentCount as any[])[0]?.recent_rows || 0}`);
        
      } catch (tableError) {
        console.error(`❌ Error checking milk_collections table:`, tableError);
      }
      
    } else if (entityType === 'farmer') {
      query = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as totalRevenue,
          COALESCE(SUM(quantity), 0) as totalCollection,
          COALESCE(SUM(channel1_fat * quantity) / NULLIF(SUM(quantity), 0), 0) as avgFat,
          COALESCE(SUM(channel1_snf * quantity) / NULLIF(SUM(quantity), 0), 0) as avgSnf,
          COALESCE(SUM(channel1_clr * quantity) / NULLIF(SUM(quantity), 0), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections
        WHERE farmer_id = ? AND collection_date >= ?
      `;
      replacements = [entityId, dateStr];
    } else if (entityType === 'society') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(SUM(mc.channel1_fat * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgFat,
          COALESCE(SUM(mc.channel1_snf * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgSnf,
          COALESCE(SUM(mc.channel1_clr * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections mc
        INNER JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.id
        WHERE f.society_id = ? AND mc.collection_date >= ?
      `;
      replacements = [entityId, dateStr];
    } else if (entityType === 'bmc') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(SUM(mc.channel1_fat * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgFat,
          COALESCE(SUM(mc.channel1_snf * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgSnf,
          COALESCE(SUM(mc.channel1_clr * mc.quantity) / NULLIF(SUM(mc.quantity), 0), 0) as avgClr
        FROM \`${schemaName}\`.milk_collections mc
        INNER JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.id
        INNER JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
        WHERE s.bmc_id = ? AND mc.collection_date >= ?
      `;
      replacements = [entityId, dateStr];
    } else if (entityType === 'dairy') {
      query = `
        SELECT 
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(SUM(mc.quantity), 0) as totalCollection,
          COALESCE(AVG(mc.fat), 0) as avgFat,
          COALESCE(AVG(mc.snf), 0) as avgSnf,
          COALESCE(AVG(mc.clr), 0) as avgClr
        FROM \`${schemaName}\`.milk_collection mc
      `;
      replacements = [];
      
      // Only filter by date for dairy (gets all data from schema)
      if (dateStr) {
        query += ` WHERE mc.collection_date >= ?`;
        replacements = [dateStr];
      }
    }

    console.log(`📊 Executing query with replacements:`, replacements);
    const [results] = await sequelize.query(query, { replacements });
    
    console.log(`📊 Query results:`, results);
    
    if (Array.isArray(results) && results.length > 0) {
      const stats = results[0] as any;
      const calculatedStats = {
        totalRevenue30Days: parseFloat(stats.totalRevenue || 0),
        totalCollection30Days: parseFloat(stats.totalCollection || 0),
        avgFat: parseFloat(stats.avgFat || 0),
        avgSnf: parseFloat(stats.avgSnf || 0),
        avgClr: parseFloat(stats.avgClr || 0),
      };
      console.log(`📊 Calculated statistics:`, calculatedStats);
      return calculatedStats;
    }
  } catch (error) {
    console.error('❌ Error calculating statistics:', error);
  }

  // Return zeros if query fails or no data
  console.log(`📊 Returning zero statistics (no data or error)`);
  return {
    totalRevenue30Days: 0,
    totalCollection30Days: 0,
    avgFat: 0,
    avgSnf: 0,
    avgClr: 0,
  };
}

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

    // Calculate statistics for the last 30 days
    console.log(`📊 Calculating statistics for ${otpData.entityType} in schema ${otpData.schemaName}`);
    const statistics = await calculateUserStatistics(
      otpData.schemaName,
      otpData.entityType,
      otpData.entityData.id
    );
    console.log(`📊 Statistics calculated:`, statistics);

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
          dbKey: otpData.entityData.dbKey,
          ...statistics
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
          schema: otpData.schemaName,
          ...statistics
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
          schema: otpData.schemaName,
          ...statistics
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
          schema: otpData.schemaName,
          ...statistics
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
          schema: otpData.schemaName,
          ...statistics
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


