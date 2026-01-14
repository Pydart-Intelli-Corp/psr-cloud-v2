import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface MachineData {
  machineId: string;
  machineType: string;
  societyId?: number;
  bmcId?: number;
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
  bmc_id?: number;
  society_name?: string;
  society_identifier?: string;
  bmc_name?: string;
  bmc_identifier?: string;
  location?: string;
  installation_date?: string;
  operator_name?: string;
  contact_phone?: string;
  status: string;
  notes?: string;
  is_master_machine?: number;
  user_password?: string;
  supervisor_password?: string;
  statusU: number;
  statusS: number;
  created_at: string;
  updated_at?: string;
  active_charts_count?: number;
  chart_details?: string;
  active_corrections_count?: number;
  correction_details?: string;
  total_collections_30d?: number;
  total_quantity_30d?: number;
  image_url?: string;
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
    const { machineId, machineType, societyId, bmcId, location, installationDate, operatorName, contactPhone, status = 'active', notes, setAsMaster, disablePasswordInheritance }: MachineData & { setAsMaster?: boolean; disablePasswordInheritance?: boolean } = body;

    if (!machineId || !machineType || (!societyId && !bmcId)) {
      return createErrorResponse('Machine ID, Machine Type, and Society ID or BMC ID are required', 400);
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

    // Check if machine ID already exists in the same society/bmc
    const existingQuery = societyId 
      ? `SELECT id FROM \`${schemaName}\`.machines WHERE machine_id = ? AND society_id = ? LIMIT 1`
      : `SELECT id FROM \`${schemaName}\`.machines WHERE machine_id = ? AND bmc_id = ? LIMIT 1`;
    
    const [existing] = await sequelize.query(existingQuery, {
      replacements: [machineId, societyId || bmcId]
    });

    if (existing.length > 0) {
      return createErrorResponse(societyId ? 'Machine ID already exists in this society' : 'Machine ID already exists in this BMC', 409);
    }

    // Verify society or BMC exists
    if (societyId) {
      const societyQuery = `SELECT id FROM \`${schemaName}\`.societies WHERE id = ? LIMIT 1`;
      const [societyExists] = await sequelize.query(societyQuery, { replacements: [societyId] });
      if (societyExists.length === 0) {
        return createErrorResponse('Selected society not found', 400);
      }
    } else if (bmcId) {
      const bmcQuery = `SELECT id FROM \`${schemaName}\`.bmcs WHERE id = ? LIMIT 1`;
      const [bmcExists] = await sequelize.query(bmcQuery, { replacements: [bmcId] });
      if (bmcExists.length === 0) {
        return createErrorResponse('Selected BMC not found', 400);
      }
    }

    // Check if this is the first machine for the society (will be master)
    const countQuery = `
      SELECT COUNT(*) as count FROM \`${schemaName}\`.machines 
      WHERE society_id = ?
    `;
    
    const [countResult] = await sequelize.query(countQuery, {
      replacements: [societyId]
    });
    
    const machineCount = (countResult as Array<{ count: number }>)[0]?.count || 0;
    const isFirstMachine = machineCount === 0;
    
    // Determine if this should be master: first machine OR explicitly requested
    let isMasterMachine = isFirstMachine || setAsMaster ? 1 : 0;

    // If setAsMaster is true and there's already a master, replace it
    if (setAsMaster && !isFirstMachine) {
      // Remove master status from current master
      await sequelize.query(
        `UPDATE \`${schemaName}\`.machines 
         SET is_master_machine = 0 
         WHERE society_id = ? AND is_master_machine = 1`,
        { replacements: [societyId] }
      );
      console.log(`[Machine POST] Replaced existing master machine for society ${societyId}`);
    }

    // If not the first machine AND not being set as master AND inheritance not disabled, get master machine passwords
    let inheritedUserPassword = null;
    let inheritedSupervisorPassword = null;
    let inheritedStatusU = 0;
    let inheritedStatusS = 0;

    if (!isMasterMachine && !isFirstMachine && !disablePasswordInheritance) {
      const masterQuery = `
        SELECT user_password, supervisor_password, statusU, statusS 
        FROM \`${schemaName}\`.machines 
        WHERE society_id = ? AND is_master_machine = 1 
        LIMIT 1
      `;
      
      const [masterResult] = await sequelize.query(masterQuery, {
        replacements: [societyId]
      });

      if (Array.isArray(masterResult) && masterResult.length > 0) {
        const master = masterResult[0] as {
          user_password: string | null;
          supervisor_password: string | null;
          statusU: number;
          statusS: number;
        };
        inheritedUserPassword = master.user_password;
        inheritedSupervisorPassword = master.supervisor_password;
        inheritedStatusU = master.statusU;
        inheritedStatusS = master.statusS;
        
        console.log(`[Machine POST] Inheriting passwords from master machine for society ${societyId}`);
      }
    } else if (disablePasswordInheritance) {
      console.log(`[Machine POST] Password inheritance disabled for machine ${machineId} in society ${societyId}`);
    }

    // Insert new machine
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.machines 
      (machine_id, machine_type, society_id, bmc_id, location, installation_date, 
       operator_name, contact_phone, status, notes, is_master_machine, 
       user_password, supervisor_password, statusU, statusS, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await sequelize.query(insertQuery, {
      replacements: [
        machineId,
        machineType,
        societyId || null,
        bmcId || null,
        location || null,
        installationDate || null,
        operatorName || null,
        contactPhone || null,
        status,
        notes || null,
        isMasterMachine,
        inheritedUserPassword,
        inheritedSupervisorPassword,
        inheritedStatusU,
        inheritedStatusS
      ]
    });

    console.log(`✅ Machine added successfully to schema: ${schemaName}${isMasterMachine ? ' (MASTER MACHINE)' : ' (inherited passwords from master)'}`);
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
    const societyIdsParam = searchParams.get('societyIds');

    let query: string;
    let replacements: (string | number)[] = [];

    if (id) {
      // Query single machine with rate chart information
      query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.bmc_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at, m.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          b.name as bmc_name, b.bmc_id as bmc_identifier,
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
             AND (mc.channel1_fat != 0 OR mc.channel1_snf != 0 OR mc.channel2_fat != 0 OR mc.channel2_snf != 0 OR mc.channel3_fat != 0 OR mc.channel3_snf != 0)) as correction_details,
          COALESCE(
            (SELECT COUNT(*) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.machine_id 
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT SUM(mc.quantity) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.machine_id 
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON m.bmc_id = b.id
        LEFT JOIN psr_v4_main.machinetype mt ON m.machine_type COLLATE utf8mb4_unicode_ci = mt.machine_type
        WHERE m.id = ?
      `;
      replacements = [id];
    } else if (societyIdsParam) {
      // Query machines filtered by society IDs
      const societyIds = societyIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (societyIds.length === 0) {
        return createSuccessResponse('Machines retrieved successfully', []);
      }

      const placeholders = societyIds.map(() => '?').join(', ');
      
      query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.bmc_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at,
          s.name as society_name, s.society_id as society_identifier,
          b.name as bmc_name, b.bmc_id as bmc_identifier,
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
             AND (mc.channel1_fat != 0 OR mc.channel1_snf != 0 OR mc.channel2_fat != 0 OR mc.channel2_snf != 0 OR mc.channel3_fat != 0 OR mc.channel3_snf != 0)) as correction_details,
          COALESCE(
            (SELECT COUNT(DISTINCT mc.id) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT ROUND(SUM(mc.quantity), 2)
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON m.bmc_id = b.id
        LEFT JOIN psr_v4_main.machinetype mt ON m.machine_type COLLATE utf8mb4_unicode_ci = mt.machine_type
        WHERE m.society_id IN (${placeholders})
        ORDER BY m.created_at DESC
      `;
      replacements = societyIds;
    } else {
      // Query all machines with rate chart information
      query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.bmc_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at,
          s.name as society_name, s.society_id as society_identifier,
          b.name as bmc_name, b.bmc_id as bmc_identifier,
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
             AND (mc.channel1_fat != 0 OR mc.channel1_snf != 0 OR mc.channel2_fat != 0 OR mc.channel2_snf != 0 OR mc.channel3_fat != 0 OR mc.channel3_snf != 0)) as correction_details,
          COALESCE(
            (SELECT COUNT(DISTINCT mc.id) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT ROUND(SUM(mc.quantity), 2)
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        LEFT JOIN \`${schemaName}\`.bmcs b ON m.bmc_id = b.id
        LEFT JOIN psr_v4_main.machinetype mt ON m.machine_type COLLATE utf8mb4_unicode_ci = mt.machine_type
        ORDER BY m.created_at DESC
      `;
    }

    const [results] = await sequelize.query(query, { replacements });

    const machines = (results as MachineQueryResult[]).map((machine) => ({
      id: machine.id,
      machineId: machine.machine_id,
      machineType: machine.machine_type,
      societyId: machine.society_id,
      bmcId: machine.bmc_id,
      societyName: machine.society_name,
      societyIdentifier: machine.society_identifier,
      bmcName: machine.bmc_name,
      bmcIdentifier: machine.bmc_identifier,
      location: machine.location,
      installationDate: machine.installation_date,
      operatorName: machine.operator_name,
      contactPhone: machine.contact_phone,
      status: machine.status,
      notes: machine.notes,
      isMasterMachine: machine.is_master_machine === 1,
      // Include passwords for admin to check if they're set (needed for ESP32 download too)
      userPassword: machine.user_password,
      supervisorPassword: machine.supervisor_password,
      statusU: machine.statusU,
      statusS: machine.statusS,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at,
      // Rate chart information
      activeChartsCount: machine.active_charts_count,
      chartDetails: machine.chart_details,
      // Correction information
      activeCorrectionsCount: machine.active_corrections_count,
      correctionDetails: machine.correction_details,
      // Collection statistics (last 30 days)
      totalCollections30d: Number(machine.total_collections_30d) || 0,
      totalQuantity30d: Number(machine.total_quantity_30d) || 0,
      // Machine type image
      imageUrl: machine.image_url
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

    // Check if this is a bulk status update
    if (body.bulkStatusUpdate && Array.isArray(body.machineIds)) {
      const { machineIds, status: newStatus } = body;
      
      if (!newStatus || machineIds.length === 0) {
        return createErrorResponse('Status and machine IDs are required for bulk update', 400);
      }

      console.log(`🔄 Processing bulk status update for ${machineIds.length} machines to status: ${newStatus}`);

      // Use a single UPDATE query with IN clause for better performance
      const placeholders = machineIds.map(() => '?').join(',');
      const query = `
        UPDATE \`${schemaName}\`.machines 
        SET status = ?, updated_at = NOW()
        WHERE id IN (${placeholders})
      `;

      const replacements = [newStatus, ...machineIds];
      const [result] = await sequelize.query(query, { replacements });

      // Check affected rows
      const affectedRows = (result as any).affectedRows || 0;
      
      console.log(`✅ Successfully updated status for ${affectedRows} machines in schema: ${schemaName}`);
      
      if (affectedRows === 0) {
        return createErrorResponse('No machines were updated', 404);
      }

      return createSuccessResponse(
        `Successfully updated status to "${newStatus}" for ${affectedRows} machine(s)`, 
        { updated: affectedRows }
      );
    }

    // Single machine update
    const { id, machineId, machineType, societyId, location, installationDate, operatorName, contactPhone, status, notes } = body;

    if (!id) {
      return createErrorResponse('Machine ID is required', 400);
    }

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
    const idsParam = searchParams.get('ids');

    if (!id && !idsParam) {
      return createErrorResponse('Machine ID(s) required', 400);
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

    if (idsParam) {
      // Bulk delete
      const ids = JSON.parse(idsParam).map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id));
      
      if (ids.length === 0) {
        return createErrorResponse('No valid machine IDs provided', 400);
      }

      // First verify all machines exist
      const placeholders = ids.map(() => '?').join(',');
      const verifyQuery = `SELECT id FROM \`${schemaName}\`.machines WHERE id IN (${placeholders})`;
      const [verification] = await sequelize.query(verifyQuery, { replacements: ids });
      
      if (!Array.isArray(verification) || verification.length !== ids.length) {
        return createErrorResponse('One or more machines not found', 404);
      }

      // Delete the machines
      const deleteQuery = `DELETE FROM \`${schemaName}\`.machines WHERE id IN (${placeholders})`;
      await sequelize.query(deleteQuery, { replacements: ids });

      console.log(`✅ Successfully deleted ${ids.length} machines from schema: ${schemaName}`);
      return createSuccessResponse(`Successfully deleted ${ids.length} machines`, null);
    } else {
      // Single delete
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
    }

  } catch (error) {
    console.error('Error deleting machine:', error);
    return createErrorResponse('Failed to delete machine', 500);
  }
}