import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface FarmerData {
  farmerId: string;
  rfId?: string;
  farmerName: string;
  password?: string;
  contactNumber?: string;
  smsEnabled?: 'ON' | 'OFF';
  bonus?: number;
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
  name: string;
  password?: string;
  phone?: string;
  sms_enabled?: 'ON' | 'OFF';
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
          f.id, f.farmer_id, f.rf_id, f.name, f.password, f.phone, f.sms_enabled, 
          f.bonus, f.address, f.bank_name, f.bank_account_number, f.ifsc_code, 
          f.society_id, f.machine_id, f.status, f.notes, f.cattle_count, f.created_at, f.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          m.machine_id as machine_name
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
          f.id, f.farmer_id, f.rf_id, f.name, f.password, f.phone, f.sms_enabled, 
          f.bonus, f.address, f.bank_name, f.bank_account_number, f.ifsc_code, 
          f.society_id, f.machine_id, f.status, f.notes, f.cattle_count, f.created_at, f.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          m.machine_id as machine_name
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
      farmerName: farmer.name,
      password: farmer.password,
      contactNumber: farmer.phone,
      smsEnabled: farmer.sms_enabled || 'OFF',
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
      
      const insertData = bulkFarmers.map((farmer: FarmerData) => [
        farmer.farmerId,
        farmer.rfId || null,
        farmer.farmerName,
        farmer.password || null,
        farmer.contactNumber || null,
        farmer.smsEnabled || 'OFF',
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
        (farmer_id, rf_id, name, password, phone, sms_enabled, bonus, address, 
         bank_name, bank_account_number, ifsc_code, society_id, machine_id, status, notes)
        VALUES ${insertData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
      `;

      const replacements = insertData.flat();
      await sequelize.query(query, { replacements });
      
      console.log(`✅ Successfully uploaded ${bulkFarmers.length} farmers to schema: ${schemaName}`);
      return createSuccessResponse(`Successfully uploaded ${bulkFarmers.length} farmers`, null);

    } else {
      // Single farmer creation
      const { 
        farmerId, rfId, farmerName, password, contactNumber, smsEnabled, 
        bonus, address, bankName, bankAccountNumber, ifscCode, societyId, 
        machineId, status, notes 
      }: FarmerData = singleFarmer;

      if (!farmerId || !farmerName) {
        return createErrorResponse('Farmer ID and name are required', 400);
      }

      const query = `
        INSERT INTO \`${schemaName}\`.farmers 
        (farmer_id, rf_id, name, password, phone, sms_enabled, bonus, address, 
         bank_name, bank_account_number, ifsc_code, society_id, machine_id, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const replacements = [
        farmerId, rfId || null, farmerName, password || null, contactNumber || null,
        smsEnabled || 'OFF', bonus || 0, address || null, bankName || null,
        bankAccountNumber || null, ifscCode || null, societyId || null,
        machineId || null, status || 'active', notes || null
      ];

      await sequelize.query(query, { replacements });
      
      console.log(`✅ Successfully created farmer: ${farmerId} in schema: ${schemaName}`);
      return createSuccessResponse('Farmer created successfully', null);
    }

  } catch (error) {
    console.error('Error creating farmer(s):', error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeUniqueConstraintError') {
      // Check if it's a farmer_id constraint error
      if (error && typeof error === 'object' && 'original' in error && error.original && typeof error.original === 'object') {
        const originalError = error.original as { sqlMessage?: string };
        if (originalError.sqlMessage && originalError.sqlMessage.includes('farmer_id')) {
          return createErrorResponse('Farmer ID already exists', 400);
        }
      }
      return createErrorResponse('Farmer ID or RF-ID already exists', 400);
    }
    
    return createErrorResponse('Failed to create farmer(s)', 500);
  }
}

// PUT - Update farmer
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
    const { 
      id, farmerId, rfId, farmerName, password, contactNumber, smsEnabled, 
      bonus, address, bankName, bankAccountNumber, ifscCode, societyId, 
      machineId, status, notes 
    } = body;

    if (!id || !farmerId || !farmerName) {
      return createErrorResponse('ID, Farmer ID and name are required', 400);
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

    const query = `
      UPDATE \`${schemaName}\`.farmers 
      SET farmer_id = ?, rf_id = ?, name = ?, password = ?, phone = ?, 
          sms_enabled = ?, bonus = ?, address = ?, bank_name = ?, 
          bank_account_number = ?, ifsc_code = ?, society_id = ?, 
          machine_id = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const replacements = [
      farmerId, rfId || null, farmerName, password || null, contactNumber || null,
      smsEnabled || 'OFF', bonus || 0, address || null, bankName || null,
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

  } catch (error) {
    console.error('Error updating farmer:', error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeUniqueConstraintError') {
      // Check if it's a farmer_id constraint error
      if (error && typeof error === 'object' && 'original' in error && error.original && typeof error.original === 'object') {
        const originalError = error.original as { sqlMessage?: string };
        if (originalError.sqlMessage && originalError.sqlMessage.includes('farmer_id')) {
          return createErrorResponse('Farmer ID already exists', 400);
        }
      }
      return createErrorResponse('Farmer ID or RF-ID already exists', 400);
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