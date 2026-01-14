import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

// Helper function to check email uniqueness across entire database
async function checkGlobalEmailUniqueness(email: string, excludeSocietyId?: number, currentSchemaName?: string): Promise<{ isUnique: boolean; existingLocation?: string }> {
  console.log(`📧 Checking email uniqueness for: ${email} (exclude ID: ${excludeSocietyId}, schema: ${currentSchemaName})`);
  const { sequelize, User } = await import('@/models').then(m => m.getModels());
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Check main users table (super_admin, admin, dairy, bmc, society, farmer users)
  try {
    const [existingUser] = await sequelize.query(`
      SELECT email, role, fullName FROM users WHERE LOWER(email) = ?
    `, { replacements: [normalizedEmail] });
    
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      const user = existingUser[0] as any;
      return { 
        isUnique: false, 
        existingLocation: `Used by ${user.role} user: ${user.fullName} (${user.email})`
      };
    }
  } catch (error) {
    console.log('⚠️ Could not check main users table');
  }

  // 2. Get all admin schemas to check dairy_farms, bmcs, societies, farmers
  const [schemas] = await sequelize.query(`
    SELECT DISTINCT TABLE_SCHEMA 
    FROM information_schema.TABLES 
    WHERE (
      TABLE_SCHEMA LIKE '%\\_db\\_%' OR 
      TABLE_SCHEMA LIKE 'db_%' OR
      TABLE_SCHEMA REGEXP '^[a-zA-Z0-9]+_[a-zA-Z]{3}[0-9]{4}$'
    )
    AND TABLE_NAME IN ('dairy_farms', 'bmcs', 'societies', 'farmers')
    ORDER BY TABLE_SCHEMA
  `);
  
  const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
  console.log(`🗂️ Found admin schemas:`, adminSchemas);
  
  // Entity types to check in each admin schema
  const entityTables = [
    { table: 'dairy_farms', idField: 'dairy_id', nameField: 'name', type: 'Dairy Farm' },
    { table: 'bmcs', idField: 'bmc_id', nameField: 'name', type: 'BMC' },
    { table: 'societies', idField: 'id', nameField: 'name', type: 'Society' },
    { table: 'farmers', idField: 'farmer_id', nameField: 'name', type: 'Farmer' }
  ];
  
  for (const schema of adminSchemas) {
    for (const entity of entityTables) {
      try {
        // Check if table exists first
        const [tableExists] = await sequelize.query(`
          SELECT 1 FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        `, { replacements: [schema, entity.table] });
        
        if (!Array.isArray(tableExists) || tableExists.length === 0) {
          continue; // Table doesn't exist in this schema
        }
        
        let query = `SELECT ${entity.idField}, ${entity.nameField} FROM \`${schema}\`.\`${entity.table}\` WHERE LOWER(email) = ?`;
        const replacements: any[] = [normalizedEmail];
        
        // If checking for society update (exclude current society)
        if (excludeSocietyId && currentSchemaName && schema === currentSchemaName && entity.table === 'societies') {
          query += ` AND ${entity.idField} != ?`;
          replacements.push(excludeSocietyId);
        }
        
        console.log(`🔍 Checking ${entity.table} in schema ${schema}: ${query}`, replacements);
        const [existingEmail] = await sequelize.query(query, { replacements });
        console.log(`📊 Results for ${entity.table} in ${schema}:`, existingEmail);
        
        if (Array.isArray(existingEmail) && existingEmail.length > 0) {
          const record = existingEmail[0] as any;
          console.log(`❌ Duplicate found in ${entity.table}:`, record);
          return { 
            isUnique: false, 
            existingLocation: `Used by ${entity.type}: ${record[entity.nameField]} (${record[entity.idField]}) in schema ${schema}`
          };
        }
      } catch (error) {
        console.log(`⚠️ Could not check ${entity.table} in schema ${schema}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
  }
  
  return { isUnique: true };
}

interface SocietyData {
  name: string;
  password: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  email: string;
  bmcId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { name, password, societyId, location, presidentName, contactPhone, email, bmcId }: SocietyData = body;

    if (!name || !password || !societyId || !email) {
      return createErrorResponse('Name, password, society ID, and email are required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return createErrorResponse('Please enter a valid email address', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check for global email uniqueness across entire database (including current schema)
    const emailCheck = await checkGlobalEmailUniqueness(email, undefined, schemaName);
    if (!emailCheck.isUnique) {
      console.log(`📧 Global duplicate email detected: ${email}`);
      console.log(`📧 Location: ${emailCheck.existingLocation}`);
      return createErrorResponse(`Email address already exists in the system. ${emailCheck.existingLocation}. Please use a different email.`, 400);
    }

    // Insert society data into admin's schema
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`societies\` 
      (name, society_id, password, location, president_name, contact_phone, email, bmc_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    await sequelize.query(insertQuery, {
      replacements: [name, societyId, password, location || null, presidentName || null, contactPhone || null, email.trim().toLowerCase(), bmcId || null]
    });

    console.log(`✅ Society added successfully to schema: ${schemaName}`);

    return createSuccessResponse('Society added successfully', {
      societyId,
      name,
      email,
      location,
      presidentName
    });

  } catch (error: unknown) {
    console.error('Error adding society:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return createErrorResponse('Society ID already exists', 409);
    }
    
    return createErrorResponse('Failed to add society', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get all societies from admin's schema with BMC names and 30-day statistics
    const [societies] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, s.email, s.bmc_id, s.status,
        b.name as bmc_name, s.created_at, s.updated_at,
        COALESCE(COUNT(DISTINCT mc.id), 0) as total_collections_30d,
        COALESCE(SUM(mc.quantity), 0) as total_quantity_30d,
        COALESCE(SUM(mc.total_amount), 0) as total_amount_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_fat_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_snf_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_clr_30d,
        COALESCE(
          CASE 
            WHEN SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) > 0 
            THEN ROUND(
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.water_percentage * mc.quantity ELSE 0 END) / 
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END), 
              2
            )
            ELSE 0 
          END, 0
        ) as weighted_water_30d
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, 
               s.bmc_id, s.status, b.name, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `);

    return createSuccessResponse('Societies retrieved successfully', societies);

  } catch (error: unknown) {
    console.error('Error retrieving societies:', error);
    return createErrorResponse('Failed to retrieve societies', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('id');
    const otp = searchParams.get('otp');

    if (!societyId || !otp) {
      return createErrorResponse('Society ID and OTP are required', 400);
    }

    // Verify OTP
    const { verifyDeleteOTP } = await import('./send-delete-otp/route');
    const isValidOTP = verifyDeleteOTP(payload.id, parseInt(societyId), otp);
    
    if (!isValidOTP) {
      return createErrorResponse('Invalid or expired OTP', 401);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check if society exists
    const [society] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [societyId]
    });

    if (!Array.isArray(society) || society.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    const societyData = society[0] as { id: number; name: string };
    console.log(`🗑️ Starting cascade delete for Society ID ${societyId}: ${societyData.name}`);

    // Get all farmers under this society
    const [farmers] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });

    const farmerIds = Array.isArray(farmers) ? (farmers as Array<{ id: number }>).map(f => f.id) : [];

    // Get rate chart IDs for this society
    const [rateCharts] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });

    const rateChartIds = Array.isArray(rateCharts) ? (rateCharts as Array<{ id: number }>).map(rc => rc.id) : [];

    // Start cascade delete (13 steps)
    
    // Step 1: Delete milk collections for farmers
    if (farmerIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`milk_collections\` 
        WHERE farmer_id IN (?)
      `, {
        replacements: [farmerIds]
      });
      console.log(`✅ Step 1: Deleted milk collections for farmers`);
    }

    // Step 2: Delete milk sales records
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_sales\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 2: Deleted milk sales records`);

    // Step 3: Delete milk dispatches
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_dispatches\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 3: Deleted milk dispatches`);

    // Step 4: Delete section pulse data
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`section_pulse\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 4: Deleted section pulse data`);

    // Step 5: Delete rate chart download history
    if (rateChartIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_download_history\` 
        WHERE rate_chart_id IN (?)
      `, {
        replacements: [rateChartIds]
      });
      console.log(`✅ Step 5: Deleted rate chart download history`);
    }

    // Step 6: Delete rate chart data
    if (rateChartIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_data\` 
        WHERE rate_chart_id IN (?)
      `, {
        replacements: [rateChartIds]
      });
      console.log(`✅ Step 6: Deleted rate chart data`);
    }

    // Step 7: Delete rate charts
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 7: Deleted rate charts`);

    // Step 8: Delete machine statistics
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_statistics\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 8: Deleted machine statistics`);

    // Step 9: Delete machine corrections (admin saved)
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 9: Deleted machine corrections (admin saved)`);

    // Step 10: Delete machine corrections from machine (device saved)
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections_from_machine\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 10: Deleted machine corrections (device saved)`);

    // Step 11: Delete farmers
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 11: Deleted farmers`);

    // Step 12: Delete machines (society_id will be set to NULL)
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`machines\` SET society_id = NULL WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 12: Unlinked machines from society`);

    // Step 13: Finally delete the society
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 13: Deleted society "${societyData.name}"`);

    console.log(`🎉 Cascade delete completed successfully for Society ID ${societyId}`);

    return createSuccessResponse('Society and all related data deleted successfully', {
      societyId: parseInt(societyId),
      societyName: societyData.name,
      deletedItems: {
        farmers: farmerIds.length,
        rateCharts: rateChartIds.length
      }
    });

  } catch (error: unknown) {
    console.error('Error deleting society:', error);
    return createErrorResponse('Failed to delete society', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { id, name, location, presidentName, contactPhone, email, bmcId, status, password } = body;

    if (!id || !name || !email) {
      return createErrorResponse('Society ID, name, and email are required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return createErrorResponse('Please enter a valid email address', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check if society exists
    const [existingSociety] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [id]
    });

    if (!Array.isArray(existingSociety) || existingSociety.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    // Check for global email uniqueness across entire database (exclude current society)
    const updateEmailCheck = await checkGlobalEmailUniqueness(email, id, schemaName);
    if (!updateEmailCheck.isUnique) {
      console.log(`📧 Global duplicate email detected during update: ${email}`);
      console.log(`📧 Location: ${updateEmailCheck.existingLocation}`);
      return createErrorResponse(`Email address already exists in the system. ${updateEmailCheck.existingLocation}. Please use a different email.`, 400);
    }

    // Build update query dynamically
    const updateFields = ['name = ?', 'email = ?'];
    const replacements = [name, email.trim().toLowerCase()];

    if (location !== undefined) {
      updateFields.push('location = ?');
      replacements.push(location);
    }

    if (presidentName !== undefined) {
      updateFields.push('president_name = ?');
      replacements.push(presidentName);
    }

    if (contactPhone !== undefined) {
      updateFields.push('contact_phone = ?');
      replacements.push(contactPhone);
    }

    if (bmcId !== undefined) {
      updateFields.push('bmc_id = ?');
      replacements.push(bmcId);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      replacements.push(status);
    }

    if (password) {
      updateFields.push('password = ?');
      replacements.push(password);
    }

    updateFields.push('updated_at = NOW()');
    replacements.push(id);

    // Update the society
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`societies\` 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, {
      replacements: replacements
    });

    return createSuccessResponse('Society updated successfully', { id });

  } catch (error: unknown) {
    console.error('Error updating society:', error);
    
    // Check for unique constraint violations
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage.includes('email') || errorMessage.includes('unique_society_email')) {
        return createErrorResponse('Email address already exists. Please use a different email.', 400);
      }
    }
    
    return createErrorResponse('Failed to update society', 500);
  }
}