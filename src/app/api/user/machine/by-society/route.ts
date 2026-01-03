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
  user_password?: string;
  supervisor_password?: string;
  statusU?: number;
  statusS?: number;
  is_master_machine?: number;
  image_url?: string;
  active_charts_count?: number;
  chart_details?: string;
  active_corrections_count?: number;
  correction_details?: string;
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

    // Query machines for the specific society with all details
    const query = `
      SELECT 
        m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
        m.installation_date, m.operator_name, m.contact_phone, m.status, 
        m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
        m.is_master_machine, m.created_at,
        mt.image_url,
        (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
         WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
        (SELECT GROUP_CONCAT(DISTINCT 
          CONCAT(rc.channel, ':', rc.file_name, ':', 
            CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
          SEPARATOR '|||')
         FROM \`${schemaName}\`.rate_charts rc
         LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
           ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
         WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details,
        (SELECT COUNT(*) FROM \`${schemaName}\`.machine_corrections mc 
         WHERE mc.machine_id = m.id AND mc.status = 1) as active_corrections_count,
        (SELECT GROUP_CONCAT(DISTINCT
          CONCAT(
            NULLIF(CONCAT_WS(',',
              CASE WHEN mc.channel1_fat != 0 OR mc.channel1_snf != 0 THEN '1' ELSE NULL END,
              CASE WHEN mc.channel2_fat != 0 OR mc.channel2_snf != 0 THEN '2' ELSE NULL END,
              CASE WHEN mc.channel3_fat != 0 OR mc.channel3_snf != 0 THEN '3' ELSE NULL END
            ), ''),
            ':',
            CASE WHEN mc.status = 1 THEN 'pending' ELSE 'downloaded' END
          )
          SEPARATOR '|||')
         FROM \`${schemaName}\`.machine_corrections mc
         WHERE mc.machine_id = m.id
           AND (mc.channel1_fat != 0 OR mc.channel1_snf != 0 OR mc.channel2_fat != 0 OR mc.channel2_snf != 0 OR mc.channel3_fat != 0 OR mc.channel3_snf != 0)) as correction_details
      FROM \`${schemaName}\`.machines m
      LEFT JOIN psr_v4_main.machinetype mt ON m.machine_type COLLATE utf8mb4_unicode_ci = mt.machine_type
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
      userPassword: machine.user_password,
      supervisorPassword: machine.supervisor_password,
      statusU: machine.statusU,
      statusS: machine.statusS,
      isMasterMachine: machine.is_master_machine === 1,
      imageUrl: machine.image_url,
      activeChartsCount: machine.active_charts_count || 0,
      chartDetails: machine.chart_details,
      activeCorrectionsCount: machine.active_corrections_count || 0,
      correctionDetails: machine.correction_details,
      createdAt: machine.created_at
    }));

    return createSuccessResponse(machines);

  } catch (error) {
    console.error('Error fetching machines by society:', error);
    return createErrorResponse('Failed to fetch machines', 500);
  }
}
