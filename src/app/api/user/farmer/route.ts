import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { generateUniqueFarmerUID, generateUniqueFarmerUIDsBatch } from '@/lib/farmeruid-generator';

// Helper function to check email uniqueness across ALL entities in the entire system
async function checkGlobalEmailUniqueness(
  email: string, 
  excludeEntityType?: 'farmer' | 'society' | 'dairy' | 'bmc' | 'user',
  excludeEntityId?: number, 
  currentSchemaName?: string
): Promise<{ isUnique: boolean; existingLocation?: string }> {
  if (!email || email.trim() === '') {
    return { isUnique: true };
  }

  const { sequelize } = await import('@/models').then(m => m.getModels());
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Check main database Users table (Admins and Super Admin)
  if (excludeEntityType !== 'user') {
    try {
      const [users] = await sequelize.query(`
        SELECT email, fullName, role 
        FROM users 
        WHERE LOWER(email) = ?
      `, { replacements: [normalizedEmail] });
      
      if (Array.isArray(users) && users.length > 0) {
        const user = users[0] as any;
        return { 
          isUnique: false, 
          existingLocation: `${user.role} user: ${user.fullName}` 
        };
      }
    } catch (error) {
      console.log('⚠️ Error checking users table:', error);
    }
  }
  
  // 2. Get all admin schemas
  const [schemas] = await sequelize.query(`
    SELECT DISTINCT TABLE_SCHEMA 
    FROM information_schema.TABLES 
    WHERE (TABLE_SCHEMA LIKE '%_%') 
    AND TABLE_NAME IN ('farmers', 'societies', 'dairies', 'bmcs')
    ORDER BY TABLE_SCHEMA
  `);
  
  const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
  const uniqueSchemas = [...new Set(adminSchemas)];
  
  for (const schema of uniqueSchemas) {
    try {
      // Check Farmers table
      if (excludeEntityType !== 'farmer' || schema !== currentSchemaName) {
        try {
          let farmerQuery = `SELECT farmer_id, name FROM \`${schema}\`.\`farmers\` WHERE LOWER(email) = ?`;
          const farmerReplacements: any[] = [normalizedEmail];
          
          if (excludeEntityType === 'farmer' && excludeEntityId && currentSchemaName && schema === currentSchemaName) {
            farmerQuery += ' AND id != ?';
            farmerReplacements.push(excludeEntityId);
          }
          
          const [existingFarmer] = await sequelize.query(farmerQuery, { replacements: farmerReplacements });
          
          if (Array.isArray(existingFarmer) && existingFarmer.length > 0) {
            const farmer = existingFarmer[0] as any;
            return { 
              isUnique: false, 
              existingLocation: `Farmer: ${farmer.name} (${farmer.farmer_id}) in ${schema}` 
            };
          }
        } catch (error) {
          // Table might not exist in this schema
        }
      }
      
      // Check Societies table
      if (excludeEntityType !== 'society' || schema !== currentSchemaName) {
        try {
          let societyQuery = `SELECT society_id, name FROM \`${schema}\`.\`societies\` WHERE LOWER(email) = ?`;
          const societyReplacements: any[] = [normalizedEmail];
          
          if (excludeEntityType === 'society' && excludeEntityId && currentSchemaName && schema === currentSchemaName) {
            societyQuery += ' AND id != ?';
            societyReplacements.push(excludeEntityId);
          }
          
          const [existingSociety] = await sequelize.query(societyQuery, { replacements: societyReplacements });
          
          if (Array.isArray(existingSociety) && existingSociety.length > 0) {
            const society = existingSociety[0] as any;
            return { 
              isUnique: false, 
              existingLocation: `Society: ${society.name} (${society.society_id}) in ${schema}` 
            };
          }
        } catch (error) {
          // Table might not exist in this schema
        }
      }
      
      // Check Dairies table
      if (excludeEntityType !== 'dairy' || schema !== currentSchemaName) {
        try {
          let dairyQuery = `SELECT dairy_id, name FROM \`${schema}\`.\`dairies\` WHERE LOWER(email) = ?`;
          const dairyReplacements: any[] = [normalizedEmail];
          
          if (excludeEntityType === 'dairy' && excludeEntityId && currentSchemaName && schema === currentSchemaName) {
            dairyQuery += ' AND id != ?';
            dairyReplacements.push(excludeEntityId);
          }
          
          const [existingDairy] = await sequelize.query(dairyQuery, { replacements: dairyReplacements });
          
          if (Array.isArray(existingDairy) && existingDairy.length > 0) {
            const dairy = existingDairy[0] as any;
            return { 
              isUnique: false, 
              existingLocation: `Dairy: ${dairy.name} (${dairy.dairy_id}) in ${schema}` 
            };
          }
        } catch (error) {
          // Table might not exist in this schema
        }
      }
      
      // Check BMCs table
      if (excludeEntityType !== 'bmc' || schema !== currentSchemaName) {
        try {
          let bmcQuery = `SELECT bmc_id, name FROM \`${schema}\`.\`bmcs\` WHERE LOWER(email) = ?`;
          const bmcReplacements: any[] = [normalizedEmail];
          
          if (excludeEntityType === 'bmc' && excludeEntityId && currentSchemaName && schema === currentSchemaName) {
            bmcQuery += ' AND id != ?';
            bmcReplacements.push(excludeEntityId);
          }
          
          const [existingBmc] = await sequelize.query(bmcQuery, { replacements: bmcReplacements });
          
          if (Array.isArray(existingBmc) && existingBmc.length > 0) {
            const bmc = existingBmc[0] as any;
            return { 
              isUnique: false, 
              existingLocation: `BMC: ${bmc.name} (${bmc.bmc_id}) in ${schema}` 
            };
          }
        } catch (error) {
          // Table might not exist in this schema
        }
      }
      
    } catch (error) {
      console.log(`⚠️ Schema ${schema} not fully accessible`);
      continue;
    }
  }
  
  return { isUnique: true };
}

interface FarmerData {
  farmerId: string;
  rfId?: string;
  farmerName: string;
  password?: string;
  contactNumber?: string;
  email?: string;
  smsEnabled?: 'ON' | 'OFF';  emailNotificationsEnabled?: string;  bonus?: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  societyId?: number;
  machineId?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'maintenance';
  notes?: string;
}

interface FarmerQueryResult {
  id: number;
  farmer_id: string;
  rf_id?: string;
  farmeruid?: string; // Unique farmer identifier
  name: string;
  password?: string;
  phone?: string;
  email?: string;
  sms_enabled?: 'ON' | 'OFF';
  email_notifications_enabled?: 'ON' | 'OFF';
  bonus?: number;
  address?: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  society_id?: number;
  society_name?: string;
  society_identifier?: string;
  machine_id?: number;
  machine_name?: string;
  machine_type?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'maintenance';
  notes?: string;
  cattle_count?: number;
  created_at: string;
  updated_at?: string;
}

// GET - Retrieve farmers
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin not found or database not configured', 404);
    }

    // Generate admin-specific schema name  
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🔍 Fetching farmers from schema: ${schemaName}`);

    let query: string;
    let replacements: (string | number)[] = [];

    if (id) {
      // Query single farmer
      query = `
        SELECT 
          f.id, f.farmer_id, f.rf_id, f.farmeruid, f.name, f.password, f.phone, f.email, f.sms_enabled, 
          f.email_notifications_enabled, f.bonus, f.address, f.bank_name, f.bank_account_number, f.ifsc_code, 
          f.society_id, f.machine_id, f.status, f.notes, f.cattle_count, f.created_at, f.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          m.machine_id as machine_name, m.machine_type
        FROM \`${schemaName}\`.farmers f
        LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.machines m ON f.machine_id = m.id
        WHERE f.id = ?
      `;
      replacements = [id];
    } else {
      // Query all farmers
      query = `
        SELECT 
          f.id, f.farmer_id, f.rf_id, f.farmeruid, f.name, f.password, f.phone, f.email, f.sms_enabled, 
          f.email_notifications_enabled, f.bonus, f.address, f.bank_name, f.bank_account_number, f.ifsc_code, 
          f.society_id, f.machine_id, f.status, f.notes, f.cattle_count, f.created_at, f.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          m.machine_id as machine_name, m.machine_type
        FROM \`${schemaName}\`.farmers f
        LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.machines m ON f.machine_id = m.id
        ORDER BY f.created_at DESC
      `;
    }

    const [results] = await sequelize.query(query, { replacements });

    const farmers = (results as FarmerQueryResult[]).map((farmer) => ({
      id: farmer.id,
      farmerId: farmer.farmer_id,
      rfId: farmer.rf_id,
      farmeruid: farmer.farmeruid, // Unique farmer identifier
      farmerName: farmer.name,
      password: farmer.password,
      contactNumber: farmer.phone,
      email: farmer.email,
      smsEnabled: farmer.sms_enabled || 'OFF',
      emailNotificationsEnabled: farmer.email_notifications_enabled || 'ON',
      bonus: Number(farmer.bonus) || 0,
      address: farmer.address,
      bankName: farmer.bank_name,
      bankAccountNumber: farmer.bank_account_number,
      ifscCode: farmer.ifsc_code,
      societyId: farmer.society_id,
      societyName: farmer.society_name,
      societyIdentifier: farmer.society_identifier,
      machineId: farmer.machine_id,
      machineName: farmer.machine_name,
      machineType: farmer.machine_type,
      status: farmer.status || 'active',
      notes: farmer.notes,
      cattleCount: farmer.cattle_count,
      createdAt: farmer.created_at,
      updatedAt: farmer.updated_at
    }));

    if (id) {
      console.log(`✅ Retrieved farmer ${id} from schema: ${schemaName}`);
      return createSuccessResponse('Farmer retrieved successfully', farmers);
    } else {
      console.log(`✅ Retrieved ${farmers.length} farmers from schema: ${schemaName}`);
      return createSuccessResponse('Farmers retrieved successfully', farmers);
    }

  } catch (error) {
    console.error('Error fetching farmers:', error);
    return createErrorResponse('Failed to fetch farmers', 500);
  }
}

// POST - Create new farmer or bulk upload
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
    const { farmers: bulkFarmers, ...singleFarmer } = body;

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin not found or database not configured', 404);
    }

    // Generate admin-specific schema name  
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    if (bulkFarmers && Array.isArray(bulkFarmers)) {
      // Bulk upload
      console.log(`🔄 Processing bulk upload of ${bulkFarmers.length} farmers...`);
      
      // Generate unique farmeruids for all farmers
      const farmeruids = await generateUniqueFarmerUIDsBatch(bulkFarmers.length, schemaName, sequelize);
      
      const insertData = bulkFarmers.map((farmer: FarmerData, index: number) => [
        farmer.farmerId,
        farmer.rfId || null,
        farmeruids[index], // Add generated farmeruid
        farmer.farmerName,
        farmer.password || null,
        farmer.contactNumber || null,
        farmer.email || null,
        farmer.smsEnabled || 'OFF',
        farmer.emailNotificationsEnabled || 'ON',
        farmer.bonus || 0,
        farmer.address || null,
        farmer.bankName || null,
        farmer.bankAccountNumber || null,
        farmer.ifscCode || null,
        farmer.societyId || null,
        farmer.machineId || null,
        farmer.status || 'active',
        farmer.notes || null
      ]);

      const query = `
        INSERT INTO \`${schemaName}\`.farmers 
        (farmer_id, rf_id, farmeruid, name, password, phone, email, sms_enabled, email_notifications_enabled, bonus, address,
         bank_name, bank_account_number, ifsc_code, society_id, machine_id, status, notes)
        VALUES ${insertData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
      `;

      const replacements = insertData.flat();
      await sequelize.query(query, { replacements });
      
      console.log(`✅ Successfully uploaded ${bulkFarmers.length} farmers to schema: ${schemaName}`);
      return createSuccessResponse(`Successfully uploaded ${bulkFarmers.length} farmers with unique IDs`, { 
        count: bulkFarmers.length,
        farmeruids: farmeruids.slice(0, 5) // Return first 5 as sample
      });

    } else {
      // Single farmer creation
      const { 
        farmerId, farmeruid, rfId, farmerName, password, contactNumber, email, smsEnabled, 
        emailNotificationsEnabled, bonus, address, bankName, bankAccountNumber, ifscCode, societyId, 
        machineId, status, notes 
      }: FarmerData & { farmeruid?: string } = singleFarmer;

      if (!farmerId || !farmerName) {
        return createErrorResponse('Farmer ID and name are required', 400);
      }

      if (!farmeruid || !farmeruid.trim()) {
        return createErrorResponse('Farmer UID is required', 400);
      }

      // Check if farmeruid already exists
      const [existingUid] = await sequelize.query(
        `SELECT id FROM \`${schemaName}\`.farmers WHERE farmeruid = ?`,
        { replacements: [farmeruid.trim()] }
      );
      
      if ((existingUid as unknown[]).length > 0) {
        return createErrorResponse('This Farmer UID already exists. Please use a different UID.', 400);
      }

      // Check for global email uniqueness across ALL entities in the system
      if (email && email.trim() !== '') {
        const emailCheck = await checkGlobalEmailUniqueness(email);
        if (!emailCheck.isUnique) {
          console.log(`📧 Global duplicate email detected: ${email}`);
          console.log(`📧 Location: ${emailCheck.existingLocation}`);
          return createErrorResponse(
            `Email address already exists in the system (${emailCheck.existingLocation}). Please use a different email.`, 
            400
          );
        }
      }

      const query = `
        INSERT INTO \`${schemaName}\`.farmers 
        (farmer_id, rf_id, farmeruid, name, password, phone, email, sms_enabled, email_notifications_enabled, bonus, address, 
         bank_name, bank_account_number, ifsc_code, society_id, machine_id, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const replacements = [
        farmerId, rfId || null, farmeruid.trim(), farmerName, password || null, contactNumber || null,
        email || null, smsEnabled || 'OFF', emailNotificationsEnabled || 'ON', bonus || 0, address || null, bankName || null,
        bankAccountNumber || null, ifscCode || null, societyId || null,
        machineId || null, status || 'active', notes || null
      ];

      await sequelize.query(query, { replacements });
      
      console.log(`✅ Successfully created farmer: ${farmerId} in schema: ${schemaName}`);
      return createSuccessResponse('Farmer created successfully', {
        farmerId,
        farmeruid: farmeruid.trim(),
        rfId,
        name: farmerName,
        message: `Farmer created with UID: ${farmeruid.trim()}`
      });
    }

  } catch (error: any) {
    console.error('Error creating farmer(s):', error);
    
    // Check for duplicate key errors (raw SQL queries)
    const errorMessage = error?.message || error?.original?.sqlMessage || error?.parent?.sqlMessage || '';
    const errorCode = error?.original?.code || error?.code || error?.parent?.code || '';
    const errno = error?.original?.errno || error?.errno || error?.parent?.errno || '';
    
    // MySQL duplicate entry error code is ER_DUP_ENTRY or 1062
    if (errorCode === 'ER_DUP_ENTRY' || errno === 1062 || errorMessage.includes('Duplicate entry')) {
      // Check which field caused the duplicate
      if (errorMessage.includes('farmer_id') || errorMessage.includes('unique_farmer_id')) {
        return createErrorResponse('Farmer ID already exists', 400);
      }
      if (errorMessage.includes('email') || errorMessage.includes('unique_email')) {
        return createErrorResponse('Email address already exists. Please use a different email.', 400);
      }
      if (errorMessage.includes('rf_id')) {
        return createErrorResponse('RF-ID already exists', 400);
      }
      return createErrorResponse('Farmer ID, RF-ID, or Email already exists', 400);
    }
    
    // Check for Sequelize unique constraint error
    if (error?.name === 'SequelizeUniqueConstraintError') {
      if (error?.original?.sqlMessage) {
        if (error.original.sqlMessage.includes('farmer_id')) {
          return createErrorResponse('Farmer ID already exists', 400);
        }
        if (error.original.sqlMessage.includes('email') || error.original.sqlMessage.includes('unique_email')) {
          return createErrorResponse('Email address already exists. Please use a different email.', 400);
        }
      }
      return createErrorResponse('Farmer ID, RF-ID, or Email already exists', 400);
    }
    
    return createErrorResponse('Failed to create farmer(s)', 500);
  }
}

// PUT - Update farmer (single or bulk)
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

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin not found or database not configured', 404);
    }

    // Generate admin-specific schema name  
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check if this is a bulk status update
    if (body.bulkStatusUpdate && Array.isArray(body.farmerIds)) {
      const { farmerIds, status: newStatus } = body;
      
      if (!newStatus || farmerIds.length === 0) {
        return createErrorResponse('Status and farmer IDs are required for bulk update', 400);
      }

      console.log(`🔄 Processing bulk status update for ${farmerIds.length} farmers to status: ${newStatus}`);

      // Use a single UPDATE query with IN clause for better performance
      const placeholders = farmerIds.map(() => '?').join(',');
      const query = `
        UPDATE \`${schemaName}\`.farmers 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id IN (${placeholders})
      `;

      const replacements = [newStatus, ...farmerIds];
      const [result] = await sequelize.query(query, { replacements });

      // Check affected rows
      const affectedRows = (result as any).affectedRows || 0;
      
      console.log(`✅ Successfully updated status for ${affectedRows} farmers in schema: ${schemaName}`);
      
      if (affectedRows === 0) {
        return createErrorResponse('No farmers were updated', 404);
      }

      return createSuccessResponse(
        `Successfully updated status to "${newStatus}" for ${affectedRows} farmer(s)`, 
        { updated: affectedRows }
      );
    }

    // Single farmer update
    const { 
      id, farmerId, farmeruid, rfId, farmerName, password, contactNumber, email, smsEnabled, 
      emailNotificationsEnabled, bonus, address, bankName, bankAccountNumber, ifscCode, societyId, 
      machineId, status, notes 
    } = body;

    if (!id || !farmerId || !farmerName) {
      return createErrorResponse('ID, Farmer ID and name are required', 400);
    }

    // Check for global email uniqueness across ALL entities in the system (exclude current farmer)
    if (email && email.trim() !== '') {
      const emailCheck = await checkGlobalEmailUniqueness(email, 'farmer', id, schemaName);
      if (!emailCheck.isUnique) {
        console.log(`📧 Global duplicate email detected: ${email}`);
        console.log(`📧 Location: ${emailCheck.existingLocation}`);
        return createErrorResponse(
          `Email address already exists in the system (${emailCheck.existingLocation}). Please use a different email.`, 
          400
        );
      }
    }

    const query = `
      UPDATE \`${schemaName}\`.farmers 
      SET farmer_id = ?, farmeruid = ?, rf_id = ?, name = ?, password = ?, phone = ?, email = ?,
          sms_enabled = ?, email_notifications_enabled = ?, bonus = ?, address = ?, bank_name = ?,
          bank_account_number = ?, ifsc_code = ?, society_id = ?, 
          machine_id = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const replacements = [
      farmerId, farmeruid || null, rfId || null, farmerName, password || null, contactNumber || null,
      email || null, smsEnabled || 'OFF', emailNotificationsEnabled || 'ON', bonus || 0, address || null, bankName || null,
      bankAccountNumber || null, ifscCode || null, societyId || null,
      machineId || null, status || 'active', notes || null, id
    ];

    await sequelize.query(query, { replacements });

    // Query to verify the update was successful
    const verifyQuery = `SELECT id FROM \`${schemaName}\`.farmers WHERE id = ?`;
    const [verification] = await sequelize.query(verifyQuery, { replacements: [id] });
    
    if (Array.isArray(verification) && verification.length === 0) {
      return createErrorResponse('Farmer not found', 404);
    }

    console.log(`✅ Successfully updated farmer: ${farmerId} in schema: ${schemaName}`);
    return createSuccessResponse('Farmer updated successfully', null);

  } catch (error: any) {
    console.error('Error updating farmer:', error);
    
    // Check for duplicate key errors (raw SQL queries)
    const errorMessage = error?.message || error?.original?.sqlMessage || '';
    const errorCode = error?.original?.code || error?.code || '';
    
    // MySQL duplicate entry error code is ER_DUP_ENTRY or 1062
    if (errorCode === 'ER_DUP_ENTRY' || errorCode === 1062 || errorMessage.includes('Duplicate entry')) {
      // Check which field caused the duplicate
      if (errorMessage.includes('farmer_id') || errorMessage.includes('unique_farmer_id')) {
        return createErrorResponse('Farmer ID already exists', 400);
      }
      if (errorMessage.includes('email') || errorMessage.includes('unique_email')) {
        return createErrorResponse('Email address already exists. Please use a different email.', 400);
      }
      if (errorMessage.includes('rf_id')) {
        return createErrorResponse('RF-ID already exists', 400);
      }
      return createErrorResponse('Farmer ID, RF-ID, or Email already exists', 400);
    }
    
    // Check for Sequelize unique constraint error
    if (error?.name === 'SequelizeUniqueConstraintError') {
      if (error?.original?.sqlMessage) {
        if (error.original.sqlMessage.includes('farmer_id')) {
          return createErrorResponse('Farmer ID already exists', 400);
        }
        if (error.original.sqlMessage.includes('email') || error.original.sqlMessage.includes('unique_email')) {
          return createErrorResponse('Email address already exists. Please use a different email.', 400);
        }
      }
      return createErrorResponse('Farmer ID, RF-ID, or Email already exists', 400);
    }
    
    return createErrorResponse('Failed to update farmer', 500);
  }
}

// DELETE - Delete farmer
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
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (!id && !idsParam) {
      return createErrorResponse('Farmer ID(s) required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin not found or database not configured', 404);
    }

    // Generate admin-specific schema name  
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    if (idsParam) {
      // Bulk delete
      const ids = JSON.parse(idsParam).map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id));
      
      if (ids.length === 0) {
        return createErrorResponse('No valid farmer IDs provided', 400);
      }

      // First verify all farmers exist
      const placeholders = ids.map(() => '?').join(',');
      const verifyQuery = `SELECT id FROM \`${schemaName}\`.farmers WHERE id IN (${placeholders})`;
      const [verification] = await sequelize.query(verifyQuery, { replacements: ids });
      
      if (!Array.isArray(verification) || verification.length !== ids.length) {
        return createErrorResponse('One or more farmers not found', 404);
      }

      // Delete the farmers
      const deleteQuery = `DELETE FROM \`${schemaName}\`.farmers WHERE id IN (${placeholders})`;
      await sequelize.query(deleteQuery, { replacements: ids });

      console.log(`✅ Successfully deleted ${ids.length} farmers from schema: ${schemaName}`);
      return createSuccessResponse(`Successfully deleted ${ids.length} farmers`, null);
    } else {
      // Single delete
      // First verify the farmer exists
      const verifyQuery = `SELECT id FROM \`${schemaName}\`.farmers WHERE id = ?`;
      const [verification] = await sequelize.query(verifyQuery, { replacements: [id] });
      
      if (Array.isArray(verification) && verification.length === 0) {
        return createErrorResponse('Farmer not found', 404);
      }

      // Delete the farmer
      const query = `DELETE FROM \`${schemaName}\`.farmers WHERE id = ?`;
      await sequelize.query(query, { replacements: [id] });

      console.log(`✅ Successfully deleted farmer with ID: ${id} from schema: ${schemaName}`);
      return createSuccessResponse('Farmer deleted successfully', null);
    }

  } catch (error) {
    console.error('Error deleting farmer:', error);
    return createErrorResponse('Failed to delete farmer', 500);
  }
}