import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface BMCData {
  name: string;
  password: string;
  bmcId: string;
  dairyFarmId?: number;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  monthlyTarget?: number;
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
    const { name, password, bmcId, dairyFarmId, location, contactPerson, phone, email, capacity, status, monthlyTarget }: BMCData = body;

    if (!name || !password || !bmcId) {
      return createErrorResponse('Name, password, and BMC ID are required', 400);
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

    // Insert BMC data into admin's schema with all fields
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`bmcs\` 
      (name, bmc_id, password, dairy_farm_id, location, contactPerson, phone, email, capacity, status, monthly_target) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await sequelize.query(insertQuery, {
      replacements: [
        name, 
        bmcId, 
        password, 
        dairyFarmId || null,
        location || null, 
        contactPerson || null, 
        phone || null, 
        email || null,
        capacity || 2000,
        status || 'active',
        monthlyTarget || 2000
      ]
    });

    console.log(`✅ BMC added successfully to schema: ${schemaName}`);

    return createSuccessResponse('BMC added successfully', {
      bmcId,
      name,
      dairyFarmId,
      location,
      contactPerson,
      capacity: capacity || 2000,
      status: status || 'active',
      monthlyTarget: monthlyTarget || 2000
    });

  } catch (error: unknown) {
    console.error('Error adding BMC:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return createErrorResponse('BMC ID already exists', 409);
    }
    
    return createErrorResponse('Failed to add BMC', 500);
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

    // Get all BMCs from admin's schema with enhanced data and 30-day statistics
    const [bmcs] = await sequelize.query(`
      SELECT 
        b.id, 
        b.name, 
        b.bmc_id as bmcId,
        b.dairy_farm_id as dairyFarmId,
        d.name as dairyFarmName,
        b.location, 
        b.contactPerson, 
        b.phone, 
        b.email,
        b.capacity,
        b.status,
        b.monthly_target as monthlyTarget,
        b.created_at as createdAt, 
        b.updated_at as updatedAt,
        COUNT(DISTINCT s.id) as societyCount,
        COALESCE(COUNT(DISTINCT mc.id), 0) as totalCollections30d,
        COALESCE(SUM(mc.quantity), 0) as totalQuantity30d,
        COALESCE(SUM(mc.total_amount), 0) as totalAmount30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weightedFat30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weightedSnf30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weightedClr30d,
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
        ) as weightedWater30d
      FROM \`${schemaName}\`.\`bmcs\` b
      LEFT JOIN \`${schemaName}\`.\`dairy_farms\` d ON d.id = b.dairy_farm_id
      LEFT JOIN \`${schemaName}\`.\`societies\` s ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY b.id, b.name, b.bmc_id, b.dairy_farm_id, d.name, b.location, b.contactPerson, 
               b.phone, b.email, b.capacity, b.status, b.monthly_target, b.created_at, b.updated_at
      ORDER BY b.created_at DESC
    `);

    return createSuccessResponse('BMCs retrieved successfully', bmcs);

  } catch (error: unknown) {
    console.error('Error retrieving BMCs:', error);
    return createErrorResponse('Failed to retrieve BMCs', 500);
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return createErrorResponse('BMC ID is required', 400);
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

    // Check if BMC exists
    const [existingBMC] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingBMC || existingBMC.length === 0) {
      return createErrorResponse('BMC not found', 404);
    }

    // Delete BMC from admin's schema
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    console.log(`✅ BMC deleted successfully from schema: ${schemaName}`);

    return createSuccessResponse('BMC deleted successfully');

  } catch (error: unknown) {
    console.error('Error deleting BMC:', error);
    return createErrorResponse('Failed to delete BMC', 500);
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
    const { id, name, password, dairyFarmId, location, contactPerson, phone, email, capacity, status, monthlyTarget } = body;

    if (!id) {
      return createErrorResponse('BMC ID is required', 400);
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

    // Check if BMC exists
    const [existingBMC] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingBMC || existingBMC.length === 0) {
      return createErrorResponse('BMC not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (dairyFarmId !== undefined) {
      updateFields.push('dairy_farm_id = ?');
      updateValues.push(dairyFarmId || null);
    }

    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location || null);
    }

    if (contactPerson !== undefined) {
      updateFields.push('contactPerson = ?');
      updateValues.push(contactPerson || null);
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email || null);
    }

    if (capacity !== undefined) {
      updateFields.push('capacity = ?');
      updateValues.push(capacity || null);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (monthlyTarget !== undefined) {
      updateFields.push('monthly_target = ?');
      updateValues.push(monthlyTarget || null);
    }

    if (password !== undefined && password !== '') {
      updateFields.push('password = ?');
      updateValues.push(password);
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');

    // Add ID to values array for WHERE clause
    updateValues.push(id);

    // Execute update query
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`bmcs\`
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, { replacements: updateValues });

    console.log(`✅ BMC updated successfully in schema: ${schemaName}`);

    return createSuccessResponse('BMC updated successfully');

  } catch (error: unknown) {
    console.error('Error updating BMC:', error);
    return createErrorResponse('Failed to update BMC', 500);
  }
}