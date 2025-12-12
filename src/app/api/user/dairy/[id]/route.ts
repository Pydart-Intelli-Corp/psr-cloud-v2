import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { id: dairyId } = await params;

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

    console.log(`[Dairy Details API] Fetching dairy ${dairyId} from schema: ${schemaName}`);

    // Get dairy basic info
    let dairyResult;
    try {
      [dairyResult] = await sequelize.query(`
        SELECT 
          id, 
          name, 
          dairy_id as dairyId, 
          location, 
          contact_person as contactPerson, 
          phone, 
          email,
          capacity,
          status,
          monthly_target as monthlyTarget,
          created_at as createdAt, 
          updated_at as updatedAt
        FROM \`${schemaName}\`.\`dairy_farms\`
        WHERE id = ?
      `, { replacements: [dairyId] });
    } catch (error) {
      console.error('[Dairy Details API] Error fetching dairy:', error);
      return createErrorResponse('Failed to fetch dairy information. Table may not exist.', 500);
    }

    if (!dairyResult || (dairyResult as Array<unknown>).length === 0) {
      console.log(`[Dairy Details API] Dairy ${dairyId} not found in schema ${schemaName}`);
      return createErrorResponse('Dairy not found', 404);
    }

    const dairy = (dairyResult as Array<Record<string, unknown>>)[0];
    console.log(`[Dairy Details API] Found dairy: ${dairy.name}`);

    // Initialize data structures with safe defaults
    let bmcs: unknown[] = [];
    let societies: unknown[] = [];
    let farmers: unknown[] = [];
    let machines: unknown[] = [];
    let collections: unknown[] = [];
    let analytics = {
      totalBmcs: 0,
      totalSocieties: 0,
      totalFarmers: 0,
      totalMachines: 0,
      totalCollections: 0,
      totalQuantity: 0,
      totalRevenue: 0,
      avgFat: 0,
      avgSnf: 0,
      avgRate: 0
    };
    let dailyTrends: unknown[] = [];
    let shiftAnalysis: unknown[] = [];
    let topFarmers: unknown[] = [];
    let topSocieties: unknown[] = [];

    // Get BMCs under this dairy (with error handling)
    try {
      [bmcs] = await sequelize.query(`
        SELECT 
          b.id,
          b.bmc_id as bmcId,
          b.name,
          b.location,
          b.capacity,
          b.status,
          b.created_at as createdAt,
          COUNT(DISTINCT s.id) as societyCount,
          COUNT(DISTINCT f.id) as farmerCount,
          COALESCE(SUM(mc.quantity), 0) as totalCollections
        FROM \`${schemaName}\`.\`bmcs\` b
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.bmc_id = b.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY b.id, b.bmc_id, b.name, b.location, b.capacity, b.status, b.created_at
        ORDER BY b.created_at DESC
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(bmcs as Array<unknown>).length} BMCs`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching BMCs:', error);
      // Continue with empty array
    }

    // Get societies under this dairy
    try {
      [societies] = await sequelize.query(`
        SELECT 
          s.id,
          s.society_id as societyId,
          s.name,
          s.location,
          s.contact_person as contactPerson,
          s.phone,
          s.status,
          b.name as bmcName,
          b.bmc_id as bmcId,
          COUNT(DISTINCT f.id) as farmerCount,
          COALESCE(SUM(mc.quantity), 0) as totalCollections
        FROM \`${schemaName}\`.\`societies\` s
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.society_id = s.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY s.id, s.society_id, s.name, s.location, s.contact_person, s.phone, s.status, b.name, b.bmc_id
        ORDER BY s.created_at DESC
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(societies as Array<unknown>).length} societies`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching societies:', error);
    }

    // Get farmers under this dairy
    try {
      [farmers] = await sequelize.query(`
        SELECT 
          f.id,
          f.farmer_id as farmerId,
          f.rf_id as rfId,
          f.name,
          f.phone,
          f.status,
          s.name as societyName,
          s.society_id as societyId,
          b.name as bmcName,
          COUNT(DISTINCT mc.id) as totalCollections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf
        FROM \`${schemaName}\`.\`farmers\` f
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.farmer_id = f.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY f.id, f.farmer_id, f.rf_id, f.name, f.phone, f.status, s.name, s.society_id, b.name
        ORDER BY totalQuantity DESC
        LIMIT 50
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(farmers as Array<unknown>).length} farmers`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching farmers:', error);
    }

    // Get machines under this dairy
    try {
      [machines] = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          m.status,
          m.is_master_machine as isMasterMachine,
          s.name as societyName,
          s.society_id as societyId,
          b.name as bmcName,
          COUNT(DISTINCT mc.id) as totalCollections,
          MAX(mc.collection_date) as lastCollection
        FROM \`${schemaName}\`.\`machines\` m
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON m.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.machine_id = m.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY m.id, m.machine_id, m.machine_type, m.status, m.is_master_machine, s.name, s.society_id, b.name
        ORDER BY m.created_at DESC
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(machines as Array<unknown>).length} machines`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching machines:', error);
    }

    // Get recent collections (last 30 days)
    try {
      [collections] = await sequelize.query(`
        SELECT 
          mc.id,
          mc.collection_date as collectionDate,
          mc.shift,
          mc.quantity,
          mc.fat_percentage as fat,
          mc.snf_percentage as snf,
          mc.rate,
          mc.total_amount as totalAmount,
          f.name as farmerName,
          f.farmer_id as farmerId,
          s.name as societyName,
          s.society_id as societyId
        FROM \`${schemaName}\`.\`milk_collections\` mc
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON mc.farmer_id = f.id
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        WHERE b.dairy_farm_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY mc.collection_date DESC, mc.created_at DESC
        LIMIT 100
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(collections as Array<unknown>).length} collections`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching collections:', error);
    }

    // Get analytics data (using same structure as list API - WITHOUT farmers/machines joins)
    try {
      const [analyticsResult] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT b.id) as totalBmcs,
          COUNT(DISTINCT s.id) as totalSocieties,
          COALESCE(COUNT(DISTINCT mc.id), 0) as totalCollections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.total_amount) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgRate
        FROM \`${schemaName}\`.\`dairy_farms\` d
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON b.dairy_farm_id = d.id
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.society_id = s.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE d.id = ?
      `, { replacements: [dairyId] });

      console.log('[Dairy Details API] Raw analytics result:', JSON.stringify(analyticsResult, null, 2));
      analytics = (analyticsResult as Array<Record<string, unknown>>)[0] as typeof analytics;
      
      // Get farmer count separately to avoid JOIN issues
      const [farmerCountResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT f.id) as totalFarmers
        FROM \`${schemaName}\`.\`dairy_farms\` d
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON b.dairy_farm_id = d.id
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON f.society_id = s.id
        WHERE d.id = ?
      `, { replacements: [dairyId] });
      
      // Get machine count separately
      const [machineCountResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT m.id) as totalMachines
        FROM \`${schemaName}\`.\`dairy_farms\` d
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON b.dairy_farm_id = d.id
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`machines\` m ON m.society_id = s.id
        WHERE d.id = ?
      `, { replacements: [dairyId] });
      
      analytics.totalFarmers = ((farmerCountResult as Array<Record<string, unknown>>)[0] as { totalFarmers: number }).totalFarmers || 0;
      analytics.totalMachines = ((machineCountResult as Array<Record<string, unknown>>)[0] as { totalMachines: number }).totalMachines || 0;
      
      console.log('[Dairy Details API] Parsed analytics:', JSON.stringify(analytics, null, 2));
      console.log(`[Dairy Details API] Analytics: ${analytics.totalCollections} collections, ${analytics.totalQuantity} L`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching analytics:', error);
    }

    // Get daily collection trends (last 7 days) - with weighted averages
    try {
      [dailyTrends] = await sequelize.query(`
        SELECT 
          DATE(mc.collection_date) as date,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as quantity,
          COALESCE(SUM(mc.total_amount), 0) as revenue,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf
        FROM \`${schemaName}\`.\`milk_collections\` mc
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        WHERE b.dairy_farm_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(mc.collection_date)
        ORDER BY date DESC
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(dailyTrends as Array<unknown>).length} daily trends`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching daily trends:', error);
    }

    // Get shift-wise analysis (with weighted averages)
    try {
      [shiftAnalysis] = await sequelize.query(`
        SELECT 
          mc.shift,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as quantity,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf
        FROM \`${schemaName}\`.\`milk_collections\` mc
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        WHERE b.dairy_farm_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY mc.shift
        ORDER BY mc.shift
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(shiftAnalysis as Array<unknown>).length} shift analysis records`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching shift analysis:', error);
    }

    // Get top performing farmers (with weighted averages)
    try {
      [topFarmers] = await sequelize.query(`
        SELECT 
          f.farmer_id as farmerId,
          f.name,
          s.name as societyName,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf
        FROM \`${schemaName}\`.\`farmers\` f
        LEFT JOIN \`${schemaName}\`.\`societies\` s ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.farmer_id = f.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY f.id, f.farmer_id, f.name, s.name
        HAVING totalQuantity > 0
        ORDER BY totalQuantity DESC
        LIMIT 10
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(topFarmers as Array<unknown>).length} top farmers`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching top farmers:', error);
    }

    // Get top performing societies
    try {
      [topSocieties] = await sequelize.query(`
        SELECT 
          s.society_id as societyId,
          s.name,
          b.name as bmcName,
          COUNT(DISTINCT f.id) as farmerCount,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgFat,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as avgSnf
        FROM \`${schemaName}\`.\`societies\` s
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON f.society_id = s.id
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.society_id = s.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE b.dairy_farm_id = ?
        GROUP BY s.id, s.society_id, s.name, b.name
        HAVING totalQuantity > 0
        ORDER BY totalQuantity DESC
        LIMIT 10
      `, { replacements: [dairyId] });
      console.log(`[Dairy Details API] Found ${(topSocieties as Array<unknown>).length} top societies`);
    } catch (error) {
      console.error('[Dairy Details API] Error fetching top societies:', error);
    }

    return createSuccessResponse('Dairy details retrieved successfully', {
      dairy,
      bmcs,
      societies,
      farmers,
      machines,
      collections,
      analytics,
      trends: {
        daily: dailyTrends,
        byShift: shiftAnalysis
      },
      topPerformers: {
        farmers: topFarmers,
        societies: topSocieties
      }
    });

  } catch (error: unknown) {
    console.error('Error retrieving dairy details:', error);
    return createErrorResponse('Failed to retrieve dairy details', 500);
  }
}
