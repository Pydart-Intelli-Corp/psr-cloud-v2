import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface MachineData {
  machineId: string;
  machineType: string;
  societyId: number;
  location?: string;
  installationDate?: string;
  operatorName?: string;
  contactPhone?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
}

interface MachineQueryResult {
  id: number;
  machine_id: string;
  machine_type: string;
  society_id: number;
  society_name?: string;
  society_identifier?: string;
  location?: string;
  installation_date?: string;
  operator_name?: string;
  contact_phone?: string;
  status: string;
  notes?: string;
  user_password?: string;
  supervisor_password?: string;
  statusU: number;
  statusS: number;
  created_at: string;
  updated_at?: string;
  active_charts_count?: number;
  chart_details?: string;
}

// POST - Create new machine
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
    const { machineId, machineType, societyId, location, installationDate, operatorName, contactPhone, status = 'active', notes }: MachineData = body;

    if (!machineId || !machineType || !societyId) {
      return createErrorResponse('Machine ID, Machine Type, and Society ID are required', 400);
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

    // Check if machine ID already exists in the same society
    const existingQuery = `
      SELECT id FROM \`${schemaName}\`.machines 
      WHERE machine_id = ? AND society_id = ? LIMIT 1
    `;
    
    const [existing] = await sequelize.query(existingQuery, {
      replacements: [machineId, societyId]
    });

    if (existing.length > 0) {
      return createErrorResponse('Machine ID already exists in this society', 409);
    }

    // Verify society exists
    const societyQuery = `
      SELECT id FROM \`${schemaName}\`.societies 
      WHERE id = ? LIMIT 1
    `;
    
    const [societyExists] = await sequelize.query(societyQuery, {
      replacements: [societyId]
    });

    if (societyExists.length === 0) {
      return createErrorResponse('Selected society not found', 400);
    }

    // Insert new machine
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.machines 
      (machine_id, machine_type, society_id, location, installation_date, 
       operator_name, contact_phone, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await sequelize.query(insertQuery, {
      replacements: [
        machineId,
        machineType,
        societyId,
        location || null,
        installationDate || null,
        operatorName || null,
        contactPhone || null,
        status,
        notes || null
      ]
    });

    console.log(`✅ Machine added successfully to schema: ${schemaName}`);
    return createSuccessResponse('Machine created successfully');

  } catch (error) {
    console.error('Error creating machine:', error);
    return createErrorResponse('Failed to create machine', 500);
  }
}

// GET - Fetch machines (all or single by id)
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

    // Check if id parameter is provided for single machine fetch
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let query: string;
    let replacements: (string | number)[] = [];

    if (id) {
      // Query single machine with rate chart information
      query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.created_at, m.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
           WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
          (SELECT GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||')
           FROM \`${schemaName}\`.rate_charts rc
           LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
             ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
           WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE m.id = ?
      `;
      replacements = [id];
    } else {
      // Query all machines with rate chart information
      query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.created_at,
          s.name as society_name, s.society_id as society_identifier,
          (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
           WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
          (SELECT GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||')
           FROM \`${schemaName}\`.rate_charts rc
           LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
             ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
           WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        ORDER BY m.created_at DESC
      `;
    }

    const [results] = await sequelize.query(query, { replacements });

    const machines = (results as MachineQueryResult[]).map((machine) => ({
      id: machine.id,
      machineId: machine.machine_id,
      machineType: machine.machine_type,
      societyId: machine.society_id,
      societyName: machine.society_name,
      societyIdentifier: machine.society_identifier,
      location: machine.location,
      installationDate: machine.installation_date,
      operatorName: machine.operator_name,
      contactPhone: machine.contact_phone,
      status: machine.status,
      notes: machine.notes,
      // Don't include actual passwords in response for security
      statusU: machine.statusU,
      statusS: machine.statusS,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at,
      // Rate chart information
      activeChartsCount: machine.active_charts_count,
      chartDetails: machine.chart_details
    }));

    if (id) {
      console.log(`✅ Retrieved machine ${id} from schema: ${schemaName}`);
      return createSuccessResponse('Machine retrieved successfully', machines);
    } else {
      console.log(`✅ Retrieved ${machines.length} machines from schema: ${schemaName}`);
      return createSuccessResponse('Machines retrieved successfully', machines);
    }

  } catch (error) {
    console.error('Error fetching machines:', error);
    return createErrorResponse('Failed to fetch machines', 500);
  }
}

// PUT - Update machine
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
    const { id, machineId, machineType, societyId, location, installationDate, operatorName, contactPhone, status, notes } = body;

    if (!id) {
      return createErrorResponse('Machine ID is required', 400);
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

    // Check if machine exists
    const existsQuery = `
      SELECT id FROM \`${schemaName}\`.machines 
      WHERE id = ? LIMIT 1
    `;
    
    const [exists] = await sequelize.query(existsQuery, {
      replacements: [id]
    });

    if (exists.length === 0) {
      return createErrorResponse('Machine not found', 404);
    }

    // If society is being updated, verify it exists
    if (societyId) {
      const societyQuery = `
        SELECT id FROM \`${schemaName}\`.societies 
        WHERE id = ? LIMIT 1
      `;
      
      const [societyExists] = await sequelize.query(societyQuery, {
        replacements: [societyId]
      });

      if (societyExists.length === 0) {
        return createErrorResponse('Selected society not found', 400);
      }
    }

    // Check if machine ID already exists in the same society (excluding current machine)
    if (machineId && societyId) {
      const duplicateQuery = `
        SELECT id FROM \`${schemaName}\`.machines 
        WHERE machine_id = ? AND society_id = ? AND id != ? LIMIT 1
      `;
      
      const [duplicate] = await sequelize.query(duplicateQuery, {
        replacements: [machineId, societyId, id]
      });

      if (duplicate.length > 0) {
        return createErrorResponse('Machine ID already exists in this society', 409);
      }
    }

    // Update machine
    const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET machine_id = ?, machine_type = ?, society_id = ?, location = ?, 
          installation_date = ?, operator_name = ?, contact_phone = ?, 
          status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await sequelize.query(updateQuery, {
      replacements: [
        machineId,
        machineType,
        societyId,
        location || null,
        installationDate || null,
        operatorName || null,
        contactPhone || null,
        status || 'active',
        notes || null,
        id
      ]
    });

    console.log(`✅ Machine updated successfully in schema: ${schemaName}`);
    return createSuccessResponse('Machine updated successfully');

  } catch (error) {
    console.error('Error updating machine:', error);
    return createErrorResponse('Failed to update machine', 500);
  }
}

// DELETE - Delete machine
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

    if (!id) {
      return createErrorResponse('Machine ID is required', 400);
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

    // Check if machine exists
    const existsQuery = `
      SELECT id FROM \`${schemaName}\`.machines 
      WHERE id = ? LIMIT 1
    `;
    
    const [exists] = await sequelize.query(existsQuery, {
      replacements: [id]
    });

    if (exists.length === 0) {
      return createErrorResponse('Machine not found', 404);
    }

    // Delete machine
    const deleteQuery = `
      DELETE FROM \`${schemaName}\`.machines 
      WHERE id = ?
    `;

    await sequelize.query(deleteQuery, {
      replacements: [id]
    });

    console.log(`✅ Machine deleted successfully from schema: ${schemaName}`);
    return createSuccessResponse('Machine deleted successfully');

  } catch (error) {
    console.error('Error deleting machine:', error);
    return createErrorResponse('Failed to delete machine', 500);
  }
}