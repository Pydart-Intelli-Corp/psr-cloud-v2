import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface SocietyData {
  name: string;
  password: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
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
    const { name, password, societyId, location, presidentName, contactPhone, bmcId }: SocietyData = body;

    if (!name || !password || !societyId) {
      return createErrorResponse('Name, password, and society ID are required', 400);
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

    // Insert society data into admin's schema
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`societies\` 
      (name, society_id, password, location, president_name, contact_phone, bmc_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    await sequelize.query(insertQuery, {
      replacements: [name, societyId, password, location || null, presidentName || null, contactPhone || null, bmcId || null]
    });

    console.log(`✅ Society added successfully to schema: ${schemaName}`);

    return createSuccessResponse('Society added successfully', {
      societyId,
      name,
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

    // Get all societies from admin's schema with BMC names
    const [societies] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, s.bmc_id, s.status,
        b.name as bmc_name, s.created_at, s.updated_at 
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return createErrorResponse('Society ID is required', 400);
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

    // Delete the society
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [id]
    });

    return createSuccessResponse('Society deleted successfully', { id });

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
    const { id, name, location, presidentName, contactPhone, bmcId, status, password } = body;

    if (!id || !name) {
      return createErrorResponse('Society ID and name are required', 400);
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

    // Build update query dynamically
    const updateFields = ['name = ?'];
    const replacements = [name];

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
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      replacements.push(hashedPassword);
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
    return createErrorResponse('Failed to update society', 500);
  }
}