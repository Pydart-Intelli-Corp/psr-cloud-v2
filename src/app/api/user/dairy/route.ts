import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface DairyData {
  name: string;
  password: string;
  dairyId: string;
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
    const { name, password, dairyId, location, contactPerson, phone, email, capacity, status, monthlyTarget }: DairyData = body;

    if (!name || !password || !dairyId) {
      return createErrorResponse('Name, password, and dairy ID are required', 400);
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

    // Insert dairy data into admin's schema with all fields
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`dairy_farms\` 
      (name, dairy_id, password, location, contact_person, phone, email, capacity, status, monthly_target) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await sequelize.query(insertQuery, {
      replacements: [
        name, 
        dairyId, 
        password, 
        location || null, 
        contactPerson || null, 
        phone || null, 
        email || null,
        capacity || 5000,
        status || 'active',
        monthlyTarget || 5000
      ]
    });

    console.log(`✅ Dairy farm added successfully to schema: ${schemaName}`);

    return createSuccessResponse('Dairy farm added successfully', {
      dairyId,
      name,
      location,
      contactPerson,
      capacity: capacity || 5000,
      status: status || 'active',
      monthlyTarget: monthlyTarget || 5000
    });

  } catch (error: unknown) {
    console.error('Error adding dairy farm:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return createErrorResponse('Dairy ID already exists', 409);
    }
    
    return createErrorResponse('Failed to add dairy farm', 500);
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

    // Get all dairy farms from admin's schema with enhanced data
    const [dairyFarms] = await sequelize.query(`
      SELECT 
        d.id, 
        d.name, 
        d.dairy_id as dairyId, 
        d.location, 
        d.contact_person as contactPerson, 
        d.phone, 
        d.email,
        d.capacity,
        d.status,
        d.monthly_target as monthlyTarget,
        d.created_at as createdAt, 
        d.updated_at as updatedAt,
        COUNT(DISTINCT b.id) as bmcCount
      FROM \`${schemaName}\`.\`dairy_farms\` d
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON b.dairy_farm_id = d.id
      GROUP BY d.id, d.name, d.dairy_id, d.location, d.contact_person, d.phone, d.email, 
               d.capacity, d.status, d.monthly_target, d.created_at, d.updated_at
      ORDER BY d.created_at DESC
    `);

    // Add calculated fields to each dairy farm
    const dairyFarmsWithCalculatedData = (dairyFarms as Array<Record<string, unknown>>).map(farm => ({
      ...farm,
      societyCount: 0, // Will be calculated when societies table is added
      farmerCount: 0, // Will be calculated when farmers table is added
      totalMilkProduction: 0, // Will be calculated from production records
      lastActivity: farm.updatedAt || farm.createdAt
    }));

    return createSuccessResponse('Dairy farms retrieved successfully', dairyFarmsWithCalculatedData);

  } catch (error: unknown) {
    console.error('Error retrieving dairy farms:', error);
    return createErrorResponse('Failed to retrieve dairy farms', 500);
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
      return createErrorResponse('Dairy ID is required', 400);
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

    // Check if dairy exists
    const [existingDairy] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`dairy_farms\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingDairy || existingDairy.length === 0) {
      return createErrorResponse('Dairy not found', 404);
    }

    // Delete dairy farm from admin's schema
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`dairy_farms\` WHERE id = ?
    `, { replacements: [id] });

    console.log(`✅ Dairy farm deleted successfully from schema: ${schemaName}`);

    return createSuccessResponse('Dairy farm deleted successfully');

  } catch (error: unknown) {
    console.error('Error deleting dairy farm:', error);
    return createErrorResponse('Failed to delete dairy farm', 500);
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
    const { id, name, password, location, contactPerson, phone, email, capacity, status, monthlyTarget } = body;

    if (!id) {
      return createErrorResponse('Dairy ID is required', 400);
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

    // Check if dairy exists
    const [existingDairy] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`dairy_farms\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingDairy || existingDairy.length === 0) {
      return createErrorResponse('Dairy not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location || null);
    }

    if (contactPerson !== undefined) {
      updateFields.push('contact_person = ?');
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

    // Only update password if provided
    if (password) {
      updateFields.push('password = ?');
      updateValues.push(password);
    }

    // Check if there are fields to update
    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    
    // Add id for WHERE clause
    updateValues.push(id);

    const updateQuery = `
      UPDATE \`${schemaName}\`.\`dairy_farms\` 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await sequelize.query(updateQuery, { replacements: updateValues });

    console.log(`✅ Dairy farm updated successfully in schema: ${schemaName}`);

    return createSuccessResponse('Dairy farm updated successfully', {
      id,
      name,
      location,
      contactPerson,
      phone,
      email,
      capacity,
      status,
      monthlyTarget
    });

  } catch (error: unknown) {
    console.error('Error updating dairy farm:', error);
    return createErrorResponse('Failed to update dairy farm', 500);
  }
}