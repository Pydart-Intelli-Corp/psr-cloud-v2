import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    let machines: any[] = [];

    // Common fields to select for all machine queries
    const machineFields = `
      m.id, m.machine_id, m.machine_type, m.status, m.location,
      m.is_master_machine, m.operator_name, m.contact_phone,
      m.installation_date, m.notes, m.statusU, m.statusS,
      m.user_password, m.supervisor_password,
      m.created_at, m.updated_at
    `;
    
    // Get imageUrl from main database machinetype table
    // Use COLLATE to handle collation mismatch between schemas
    const machineImageJoin = `
      LEFT JOIN psr_v4_main.machinetype mt ON m.machine_type COLLATE utf8mb4_unicode_ci = mt.machine_type
    `;
    
    const machineFieldsWithImage = `
      ${machineFields},
      mt.image_url
    `;

    // Subquery for 30-day collection statistics
    const collectionStatsSubquery = (schemaName: string) => `
      LEFT JOIN (
        SELECT 
          machine_id,
          COUNT(*) as total_collections_30d,
          COALESCE(SUM(quantity), 0) as total_quantity_30d,
          COALESCE(AVG(fat_percentage), 0) as avg_fat_30d,
          COALESCE(AVG(snf_percentage), 0) as avg_snf_30d
        FROM \`${schemaName}\`.milk_collections
        WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY machine_id
      ) stats ON m.id = stats.machine_id
    `;

    // Subquery for rate chart status (per machine with download history)
    const rateChartSubquery = (schemaName: string) => `
      LEFT JOIN (
        SELECT 
          m_inner.id as machine_id,
          GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||'
          ) as chart_details,
          COUNT(DISTINCT rc.id) as active_charts_count
        FROM \`${schemaName}\`.machines m_inner
        JOIN \`${schemaName}\`.rate_charts rc ON rc.society_id = m_inner.society_id AND rc.status = 1
        LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
          ON dh.rate_chart_id = rc.id AND dh.machine_id = m_inner.id
        GROUP BY m_inner.id
      ) rc_info ON m.id = rc_info.machine_id
    `;

    // Subquery for machine corrections with channel details and download status
    const correctionSubquery = (schemaName: string) => `
      LEFT JOIN (
        SELECT 
          machine_id,
          COUNT(*) as active_corrections_count,
          GROUP_CONCAT(DISTINCT CONCAT(
            NULLIF(CONCAT_WS(',',
              CASE WHEN mc.channel1_fat != 0 OR mc.channel1_snf != 0 THEN '1' ELSE NULL END,
              CASE WHEN mc.channel2_fat != 0 OR mc.channel2_snf != 0 THEN '2' ELSE NULL END,
              CASE WHEN mc.channel3_fat != 0 OR mc.channel3_snf != 0 THEN '3' ELSE NULL END
            ), ''),
            ':',
            CASE WHEN mc.status = 1 THEN 'pending' ELSE 'downloaded' END
          ) SEPARATOR '|||') as correction_details
        FROM \`${schemaName}\`.machine_corrections mc
        WHERE (mc.channel1_fat != 0 OR mc.channel1_snf != 0 OR mc.channel2_fat != 0 OR mc.channel2_snf != 0 OR mc.channel3_fat != 0 OR mc.channel3_snf != 0)
        GROUP BY machine_id
      ) corr_info ON m.id = corr_info.machine_id
    `;

    // Subquery for latest ESP32 machine statistics (from machine_statistics table)
    const machineStatsSubquery = (schemaName: string) => `
      LEFT JOIN (
        SELECT 
          ms1.machine_id,
          ms1.total_test,
          ms1.daily_cleaning,
          ms1.weekly_cleaning,
          ms1.cleaning_skip,
          ms1.gain,
          ms1.auto_channel,
          ms1.version,
          ms1.statistics_date,
          ms1.statistics_time
        FROM \`${schemaName}\`.machine_statistics ms1
        INNER JOIN (
          SELECT machine_id, MAX(created_at) as max_created
          FROM \`${schemaName}\`.machine_statistics
          GROUP BY machine_id
        ) ms2 ON ms1.machine_id = ms2.machine_id AND ms1.created_at = ms2.max_created
      ) ms_info ON m.id = ms_info.machine_id
    `;

    try {
      switch (entityType) {
        case 'admin':
          // Admin gets all machines in their schema with full details
          const [adminMachines] = await sequelize.query(`
            SELECT 
              ${machineFieldsWithImage},
              s.name as society_name, s.society_id as society_identifier, s.id as society_db_id,
              s.president_name, s.location as society_location,
              b.name as bmc_name, b.bmc_id as bmc_identifier,
              d.name as dairy_name, d.dairy_id as dairy_identifier,
              COALESCE(stats.total_collections_30d, 0) as total_collections_30d,
              COALESCE(stats.total_quantity_30d, 0) as total_quantity_30d,
              COALESCE(stats.avg_fat_30d, 0) as avg_fat_30d,
              COALESCE(stats.avg_snf_30d, 0) as avg_snf_30d,
              rc_info.chart_details,
              COALESCE(rc_info.active_charts_count, 0) as active_charts_count,
              corr_info.correction_details,
              COALESCE(corr_info.active_corrections_count, 0) as active_corrections_count,
              COALESCE(ms_info.total_test, 0) as total_test,
              COALESCE(ms_info.daily_cleaning, 0) as daily_cleaning,
              COALESCE(ms_info.weekly_cleaning, 0) as weekly_cleaning,
              COALESCE(ms_info.cleaning_skip, 0) as cleaning_skip,
              COALESCE(ms_info.gain, 0) as gain,
              ms_info.auto_channel,
              ms_info.version,
              ms_info.statistics_date,
              ms_info.statistics_time
            FROM \`${schemaName}\`.machines m
            ${machineImageJoin}
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON (s.bmc_id = b.id OR m.bmc_id = b.id)
            LEFT JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
            ${collectionStatsSubquery(schemaName)}
            ${rateChartSubquery(schemaName)}
            ${correctionSubquery(schemaName)}
            ${machineStatsSubquery(schemaName)}
            ORDER BY b.name, s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `);
          
          machines = adminMachines || [];
          break;
          
        case 'society':
          // Get machines for society with full details
          const [societyMachines] = await sequelize.query(`
            SELECT 
              ${machineFieldsWithImage},
              s.name as society_name, s.society_id as society_identifier, s.id as society_db_id,
              s.president_name, s.location as society_location,
              b.name as bmc_name, b.bmc_id as bmc_identifier,
              COALESCE(stats.total_collections_30d, 0) as total_collections_30d,
              COALESCE(stats.total_quantity_30d, 0) as total_quantity_30d,
              COALESCE(stats.avg_fat_30d, 0) as avg_fat_30d,
              COALESCE(stats.avg_snf_30d, 0) as avg_snf_30d,
              rc_info.chart_details,
              COALESCE(rc_info.active_charts_count, 0) as active_charts_count,
              corr_info.correction_details,
              COALESCE(corr_info.active_corrections_count, 0) as active_corrections_count,
              COALESCE(ms_info.total_test, 0) as total_test,
              COALESCE(ms_info.daily_cleaning, 0) as daily_cleaning,
              COALESCE(ms_info.weekly_cleaning, 0) as weekly_cleaning,
              COALESCE(ms_info.cleaning_skip, 0) as cleaning_skip,
              COALESCE(ms_info.gain, 0) as gain,
              ms_info.auto_channel,
              ms_info.version,
              ms_info.statistics_date,
              ms_info.statistics_time
            FROM \`${schemaName}\`.machines m
            ${machineImageJoin}
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            ${collectionStatsSubquery(schemaName)}
            ${rateChartSubquery(schemaName)}
            ${correctionSubquery(schemaName)}
            ${machineStatsSubquery(schemaName)}
            WHERE s.id = ?
            ORDER BY m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = societyMachines || [];
          break;

        case 'bmc':
          // Get machines for all societies under this BMC with full details
          const [bmcMachines] = await sequelize.query(`
            SELECT 
              ${machineFieldsWithImage},
              s.name as society_name, s.society_id as society_identifier, s.id as society_db_id,
              s.president_name, s.location as society_location,
              b.name as bmc_name, b.bmc_id as bmc_identifier,
              COALESCE(stats.total_collections_30d, 0) as total_collections_30d,
              COALESCE(stats.total_quantity_30d, 0) as total_quantity_30d,
              COALESCE(stats.avg_fat_30d, 0) as avg_fat_30d,
              COALESCE(stats.avg_snf_30d, 0) as avg_snf_30d,
              rc_info.chart_details,
              COALESCE(rc_info.active_charts_count, 0) as active_charts_count,
              corr_info.correction_details,
              COALESCE(corr_info.active_corrections_count, 0) as active_corrections_count,
              COALESCE(ms_info.total_test, 0) as total_test,
              COALESCE(ms_info.daily_cleaning, 0) as daily_cleaning,
              COALESCE(ms_info.weekly_cleaning, 0) as weekly_cleaning,
              COALESCE(ms_info.cleaning_skip, 0) as cleaning_skip,
              COALESCE(ms_info.gain, 0) as gain,
              ms_info.auto_channel,
              ms_info.version,
              ms_info.statistics_date,
              ms_info.statistics_time
            FROM \`${schemaName}\`.machines m
            ${machineImageJoin}
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            ${collectionStatsSubquery(schemaName)}
            ${rateChartSubquery(schemaName)}
            ${correctionSubquery(schemaName)}
            ${machineStatsSubquery(schemaName)}
            WHERE b.id = ?
            ORDER BY s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = bmcMachines || [];
          break;

        case 'dairy':
          // Get machines for all societies under this Dairy with full details
          const [dairyMachines] = await sequelize.query(`
            SELECT 
              ${machineFieldsWithImage},
              s.name as society_name, s.society_id as society_identifier, s.id as society_db_id,
              s.president_name, s.location as society_location,
              b.name as bmc_name, b.bmc_id as bmc_identifier,
              d.name as dairy_name, d.dairy_id as dairy_identifier,
              COALESCE(stats.total_collections_30d, 0) as total_collections_30d,
              COALESCE(stats.total_quantity_30d, 0) as total_quantity_30d,
              COALESCE(stats.avg_fat_30d, 0) as avg_fat_30d,
              COALESCE(stats.avg_snf_30d, 0) as avg_snf_30d,
              rc_info.chart_details,
              COALESCE(rc_info.active_charts_count, 0) as active_charts_count,
              corr_info.correction_details,
              COALESCE(corr_info.active_corrections_count, 0) as active_corrections_count,
              COALESCE(ms_info.total_test, 0) as total_test,
              COALESCE(ms_info.daily_cleaning, 0) as daily_cleaning,
              COALESCE(ms_info.weekly_cleaning, 0) as weekly_cleaning,
              COALESCE(ms_info.cleaning_skip, 0) as cleaning_skip,
              COALESCE(ms_info.gain, 0) as gain,
              ms_info.auto_channel,
              ms_info.version,
              ms_info.statistics_date,
              ms_info.statistics_time
            FROM \`${schemaName}\`.machines m
            ${machineImageJoin}
            JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
            ${collectionStatsSubquery(schemaName)}
            ${rateChartSubquery(schemaName)}
            ${correctionSubquery(schemaName)}
            ${machineStatsSubquery(schemaName)}
            WHERE d.id = ?
            ORDER BY b.name, s.society_id, m.is_master_machine DESC, m.machine_id ASC
          `, { replacements: [id] });
          
          machines = dairyMachines || [];
          break;

        case 'farmer':
          // Farmers don't have access to machines
          return createSuccessResponse('Machines data retrieved successfully', {
            type: 'farmer',
            machines: [],
            message: 'Farmers do not have access to machine information'
          }, 200, corsHeaders);

        default:
          return createErrorResponse('Invalid entity type', 400, undefined, corsHeaders);
      }

      // Transform the data to camelCase for mobile app
      const transformedMachines = machines.map((m: any) => ({
        id: m.id,
        machineId: m.machine_id,
        machineType: m.machine_type,
        status: m.status,
        location: m.location,
        isMasterMachine: m.is_master_machine === 1,
        operatorName: m.operator_name,
        contactPhone: m.contact_phone,
        installationDate: m.installation_date,
        notes: m.notes,
        statusU: m.statusU,
        statusS: m.statusS,
        // Password status computed fields
        hasUserPassword: !!(m.user_password && m.user_password !== ''),
        hasSupervisorPassword: !!(m.supervisor_password && m.supervisor_password !== ''),
        userPasswordStatus: m.statusU === 1 ? 'pending' : ((m.user_password && m.user_password !== '') ? 'downloaded' : 'none'),
        supervisorPasswordStatus: m.statusS === 1 ? 'pending' : ((m.supervisor_password && m.supervisor_password !== '') ? 'downloaded' : 'none'),
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        // Society info
        societyName: m.society_name,
        societyId: m.society_identifier,
        societyDbId: m.society_db_id,
        presidentName: m.president_name,
        societyLocation: m.society_location,
        // BMC info
        bmcName: m.bmc_name,
        bmcId: m.bmc_identifier,
        // Dairy info
        dairyName: m.dairy_name,
        dairyId: m.dairy_identifier,
        // 30-day statistics
        totalCollections30d: parseInt(m.total_collections_30d) || 0,
        totalQuantity30d: parseFloat(m.total_quantity_30d) || 0,
        avgFat30d: parseFloat(m.avg_fat_30d) || 0,
        avgSnf30d: parseFloat(m.avg_snf_30d) || 0,
        // Rate chart info
        chartDetails: m.chart_details,
        activeChartsCount: parseInt(m.active_charts_count) || 0,
        // Correction info
        correctionDetails: m.correction_details,
        activeCorrectionsCount: parseInt(m.active_corrections_count) || 0,
        // Machine image
        imageUrl: m.image_url,
        // ESP32 Machine Statistics
        totalTests: parseInt(m.total_test) || 0,
        dailyCleaning: parseInt(m.daily_cleaning) || 0,
        weeklyCleaning: parseInt(m.weekly_cleaning) || 0,
        cleaningSkip: parseInt(m.cleaning_skip) || 0,
        gain: parseInt(m.gain) || 0,
        autoChannel: m.auto_channel,
        machineVersion: m.version,
        statisticsDate: m.statistics_date,
        statisticsTime: m.statistics_time,
      }));

      console.log(`✅ Machines data fetched for ${entityType}: ${payload.uid} - ${transformedMachines.length} machines`);

      return createSuccessResponse('Machines data retrieved successfully', {
        type: entityType,
        machines: transformedMachines,
        totalMachines: transformedMachines.length
      }, 200, corsHeaders);

    } catch (queryError) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Failed to fetch machines data', 500, undefined, corsHeaders);
    }

  } catch (error: unknown) {
    console.error('Error fetching machines:', error);
    return createErrorResponse('Failed to fetch machines data', 500, undefined, corsHeaders);
  }
}
// PUT - Update machine status
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    const body = await request.json();
    const { id, status: newStatus } = body;

    if (!id || !newStatus) {
      return createErrorResponse('Machine ID and status are required', 400, undefined, corsHeaders);
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'maintenance', 'suspended'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
      return createErrorResponse('Invalid status value', 400, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id: entityId } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    // Check if user has permission to update this machine
    let hasPermission = false;
    let machineQuery = '';
    let replacements: any[] = [];

    switch (entityType) {
      case 'admin':
        // Admin can update any machine in their schema
        machineQuery = `
          SELECT id FROM \`${schemaName}\`.machines 
          WHERE id = ?
        `;
        replacements = [id];
        hasPermission = true;
        break;

      case 'dairy':
        // Dairy can update machines in societies under their BMCs
        machineQuery = `
          SELECT m.id FROM \`${schemaName}\`.machines m
          JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
          JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
          WHERE m.id = ? AND b.dairy_farm_id = ?
        `;
        replacements = [id, entityId];
        hasPermission = true;
        break;

      case 'bmc':
        // BMC can update machines in their societies
        machineQuery = `
          SELECT m.id FROM \`${schemaName}\`.machines m
          JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
          WHERE m.id = ? AND s.bmc_id = ?
        `;
        replacements = [id, entityId];
        hasPermission = true;
        break;

      case 'society':
        // Society can update their own machines
        machineQuery = `
          SELECT m.id FROM \`${schemaName}\`.machines m
          JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
          WHERE m.id = ? AND s.id = ?
        `;
        replacements = [id, entityId];
        hasPermission = true;
        break;

      case 'farmer':
        // Farmers cannot update machines
        return createErrorResponse('Farmers do not have permission to update machines', 403, undefined, corsHeaders);

      default:
        return createErrorResponse('Invalid entity type', 400, undefined, corsHeaders);
    }

    if (!hasPermission) {
      return createErrorResponse('Permission denied', 403, undefined, corsHeaders);
    }

    // Check if machine exists and user has access
    const [machineExists] = await sequelize.query(machineQuery, { replacements });

    if (!Array.isArray(machineExists) || machineExists.length === 0) {
      return createErrorResponse('Machine not found or access denied', 404, undefined, corsHeaders);
    }

    // Update machine status
    const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await sequelize.query(updateQuery, {
      replacements: [newStatus, id]
    });

    console.log(`✅ Machine ${id} status updated to "${newStatus}" by ${entityType}: ${payload.uid} in schema: ${schemaName}`);

    return createSuccessResponse('Machine status updated successfully', {
      id,
      status: newStatus,
      updatedBy: entityType,
      updatedAt: new Date().toISOString()
    }, 200, corsHeaders);

  } catch (error: unknown) {
    console.error('Error updating machine status:', error);
    return createErrorResponse('Failed to update machine status', 500, undefined, corsHeaders);
  }
}