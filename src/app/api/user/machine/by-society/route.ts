import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';

// Helper function to create error response
const createErrorResponse = (message: string, status: number) => {
  return Response.json({ success: false, error: message }, { status });
};

// Helper function to create success response
const createSuccessResponse = (data: unknown, message?: string) => {
  return Response.json({ 
    success: true, 
    data,
    ...(message && { message })
  });
};

interface MachineQueryResult {
  id: number;
  machine_id: string;
  machine_type: string;
  society_id: number;
  location?: string;
  installation_date?: string;
  operator_name?: string;
  contact_phone?: string;
  status: string;
  notes?: string;
  created_at: string;
}

// GET - Fetch machines by society ID
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

    // Get societyId from search params
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('societyId');
    
    if (!societyId) {
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

    // Query machines for the specific society
    const query = `
      SELECT 
        m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
        m.installation_date, m.operator_name, m.contact_phone, m.status, 
        m.notes, m.created_at
      FROM \`${schemaName}\`.machines m
      WHERE m.society_id = ? AND m.status = 'active'
      ORDER BY m.machine_id ASC
    `;

    const [results] = await sequelize.query(query, { replacements: [societyId] });

    const machines = (results as MachineQueryResult[]).map((machine) => ({
      id: machine.id,
      machineId: machine.machine_id,
      machineType: machine.machine_type,
      societyId: machine.society_id,
      location: machine.location,
      installationDate: machine.installation_date,
      operatorName: machine.operator_name,
      contactPhone: machine.contact_phone,
      status: machine.status,
      notes: machine.notes,
      createdAt: machine.created_at
    }));

    return createSuccessResponse(machines);

  } catch (error) {
    console.error('Error fetching machines by society:', error);
    return createErrorResponse('Failed to fetch machines', 500);
  }
}
