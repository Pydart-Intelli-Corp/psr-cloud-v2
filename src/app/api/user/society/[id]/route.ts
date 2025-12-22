import { NextRequest } from 'next/server';
import { QueryTypes } from 'sequelize';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: societyId } = await params;
    
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

    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`[Society Details API] Fetching society ${societyId} from schema: ${schemaName}`);

    // Initialize all data structures with safe defaults
    let society;
    let machines: unknown[] = [];
    let farmers: unknown[] = [];
    let collections: unknown[] = [];
    let dispatches: unknown[] = [];
    let sales: unknown[] = [];
    let analytics = {
      totalFarmers: 0,
      activeFarmers: 0,
      totalMachines: 0,
      activeMachines: 0,
      totalCollections: 0,
      totalDispatches: 0,
      totalSales: 0,
      totalQuantityCollected: 0,
      totalQuantityDispatched: 0,
      totalQuantitySold: 0,
      totalRevenue: 0,
      avgFat: 0,
      avgSnf: 0,
      avgRate: 0
    };
    let dailyTrends: unknown[] = [];
    let shiftAnalysis: unknown[] = [];
    let topFarmers: unknown[] = [];
    let channelBreakdown: unknown[] = [];

    // Get society basic info
    try {
      [society] = await sequelize.query(`
        SELECT 
          s.id,
          s.society_id as societyId,
          s.name,
          s.location,
          s.president_name as presidentName,
          s.contact_phone as contactPhone,
          s.email,
          s.bmc_id as bmcId,
          b.name as bmcName,
          b.bmc_id as bmcIdentifier,
          b.dairy_farm_id as dairyId,
          df.name as dairyName,
          df.dairy_id as dairyIdentifier,
          s.status,
          s.created_at as createdAt,
          s.updated_at as updatedAt
        FROM \`${schemaName}\`.\`societies\` s
        LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
        LEFT JOIN \`${schemaName}\`.\`dairy_farms\` df ON b.dairy_farm_id = df.id
        WHERE s.id = ?
      `, { replacements: [societyId] });

      if (!Array.isArray(society) || society.length === 0) {
        return createErrorResponse('Society not found', 404);
      }

      society = (society as Array<unknown>)[0];
      console.log(`[Society Details API] Found society: ${(society as Record<string, unknown>).name}`);
    } catch (error) {
      console.error('[Society Details API] Error fetching society:', error);
      return createErrorResponse('Failed to fetch society information. Table may not exist.', 500);
    }

    // Get machines for this society
    try {
      [machines] = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          m.location,
          m.installation_date as installationDate,
          m.operator_name as operatorName,
          m.contact_phone as contactPhone,
          m.status,
          m.is_master_machine as isMasterMachine,
          COUNT(DISTINCT mc.id) as totalCollections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          MAX(mc.collection_date) as lastCollectionDate
        FROM \`${schemaName}\`.\`machines\` m
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.machine_id = m.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE m.society_id = ?
        GROUP BY m.id
        ORDER BY m.created_at DESC
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(machines as Array<unknown>).length} machines`);
    } catch (error) {
      console.error('[Society Details API] Error fetching machines:', error);
    }

    // Get farmers for this society
    try {
      [farmers] = await sequelize.query(`
        SELECT 
          f.id,
          f.farmer_id as farmerId,
          f.rf_id as rfId,
          f.name,
          f.contact_number as contactNumber,
          f.address,
          f.bank_name as bankName,
          f.bank_account_number as bankAccountNumber,
          f.status,
          COUNT(DISTINCT mc.id) as totalCollections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf,
          MAX(mc.collection_date) as lastCollectionDate
        FROM \`${schemaName}\`.\`farmers\` f
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.farmer_id = f.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE f.society_id = ?
        GROUP BY f.id
        ORDER BY totalQuantity DESC
        LIMIT 100
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(farmers as Array<unknown>).length} farmers`);
    } catch (error) {
      console.error('[Society Details API] Error fetching farmers:', error);
    }

    // Get recent collections
    try {
      [collections] = await sequelize.query(`
        SELECT 
          mc.id,
          mc.farmer_id as farmerId,
          f.name as farmerName,
          m.machine_id as machineId,
          mc.collection_date as collectionDate,
          mc.collection_time as collectionTime,
          mc.shift_type as shiftType,
          mc.channel,
          mc.fat_percentage as fat,
          mc.snf_percentage as snf,
          mc.clr_value as clr,
          mc.quantity,
          mc.rate_per_liter as rate,
          mc.total_amount as amount,
          mc.bonus,
          mc.created_at as createdAt
        FROM \`${schemaName}\`.\`milk_collections\` mc
        LEFT JOIN \`${schemaName}\`.\`farmers\` f ON f.farmer_id = mc.farmer_id AND f.society_id = mc.society_id
        LEFT JOIN \`${schemaName}\`.\`machines\` m ON mc.machine_id = m.id
        WHERE mc.society_id = ?
        ORDER BY mc.collection_date DESC, mc.collection_time DESC
        LIMIT 200
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(collections as Array<unknown>).length} collections`);
    } catch (error) {
      console.error('[Society Details API] Error fetching collections:', error);
    }

    // Get recent dispatches
    try {
      [dispatches] = await sequelize.query(`
        SELECT 
          md.id,
          md.dispatch_id as dispatchId,
          m.machine_id as machineId,
          md.dispatch_date as dispatchDate,
          md.dispatch_time as dispatchTime,
          md.shift_type as shiftType,
          md.channel,
          md.fat_percentage as fat,
          md.snf_percentage as snf,
          md.clr_value as clr,
          md.quantity,
          md.rate_per_liter as rate,
          md.total_amount as amount,
          md.created_at as createdAt
        FROM \`${schemaName}\`.\`milk_dispatches\` md
        LEFT JOIN \`${schemaName}\`.\`machines\` m ON md.machine_id = m.id
        WHERE md.society_id = ?
        ORDER BY md.dispatch_date DESC, md.dispatch_time DESC
        LIMIT 200
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(dispatches as Array<unknown>).length} dispatches`);
    } catch (error) {
      console.error('[Society Details API] Error fetching dispatches:', error);
    }

    // Get recent sales
    try {
      [sales] = await sequelize.query(`
        SELECT 
          ms.id,
          ms.count,
          m.machine_id as machineId,
          ms.sales_date as salesDate,
          ms.sales_time as salesTime,
          ms.channel,
          ms.quantity,
          ms.rate_per_liter as rate,
          ms.total_amount as amount,
          ms.created_at as createdAt
        FROM \`${schemaName}\`.\`milk_sales\` ms
        LEFT JOIN \`${schemaName}\`.\`machines\` m ON ms.machine_id = m.id
        WHERE ms.society_id = ?
        ORDER BY ms.sales_date DESC, ms.sales_time DESC
        LIMIT 200
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(sales as Array<unknown>).length} sales`);
    } catch (error) {
      console.error('[Society Details API] Error fetching sales:', error);
    }

    // Get analytics data
    try {
      const [analyticsResult] = await sequelize.query(`
        SELECT 
          (SELECT COUNT(DISTINCT f.id) FROM \`${schemaName}\`.\`farmers\` f WHERE f.society_id = ?) as totalFarmers,
          (SELECT COUNT(DISTINCT f.id) FROM \`${schemaName}\`.\`farmers\` f WHERE f.society_id = ? AND f.status = 'active') as activeFarmers,
          (SELECT COUNT(DISTINCT m.id) FROM \`${schemaName}\`.\`machines\` m WHERE m.society_id = ?) as totalMachines,
          (SELECT COUNT(DISTINCT m.id) FROM \`${schemaName}\`.\`machines\` m WHERE m.society_id = ? AND m.status = 'active') as activeMachines,
          (SELECT COUNT(mc.id) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalCollections,
          (SELECT COUNT(md.id) FROM \`${schemaName}\`.\`milk_dispatches\` md WHERE md.society_id = ? AND md.dispatch_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalDispatches,
          (SELECT COUNT(ms.id) FROM \`${schemaName}\`.\`milk_sales\` ms WHERE ms.society_id = ? AND ms.sales_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalSales,
          (SELECT COALESCE(SUM(mc.quantity), 0) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalQuantityCollected,
          (SELECT COALESCE(SUM(md.quantity), 0) FROM \`${schemaName}\`.\`milk_dispatches\` md WHERE md.society_id = ? AND md.dispatch_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalQuantityDispatched,
          (SELECT COALESCE(SUM(ms.quantity), 0) FROM \`${schemaName}\`.\`milk_sales\` ms WHERE ms.society_id = ? AND ms.sales_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalQuantitySold,
          (SELECT COALESCE(SUM(mc.total_amount), 0) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalRevenue,
          (SELECT COALESCE(AVG(mc.fat_percentage), 0) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as avgFat,
          (SELECT COALESCE(AVG(mc.snf_percentage), 0) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as avgSnf,
          (SELECT COALESCE(AVG(mc.rate_per_liter), 0) FROM \`${schemaName}\`.\`milk_collections\` mc WHERE mc.society_id = ? AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as avgRate
      `, { replacements: [societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId, societyId] });
      analytics = (analyticsResult as Array<Record<string, unknown>>)[0] as typeof analytics;
      console.log(`[Society Details API] Analytics - Collections: ${analytics.totalCollections}, Revenue: ₹${analytics.totalRevenue}, Qty Collected: ${analytics.totalQuantityCollected}L, Qty Dispatched: ${analytics.totalQuantityDispatched}L, Dispatches: ${analytics.totalDispatches}, Sales: ${analytics.totalSales}`);
    } catch (error) {
      console.error('[Society Details API] Error fetching analytics:', error);
    }

    // Get daily trends (last 7 days)
    try {
      [dailyTrends] = await sequelize.query(`
        SELECT 
          DATE(mc.collection_date) as date,
          COUNT(DISTINCT mc.id) as collections,
          COUNT(DISTINCT mc.farmer_id) as farmers,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf
        FROM \`${schemaName}\`.\`milk_collections\` mc
        WHERE mc.society_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(mc.collection_date)
        ORDER BY date DESC
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(dailyTrends as Array<unknown>).length} daily trends`);
    } catch (error) {
      console.error('[Society Details API] Error fetching daily trends:', error);
    }

    // Get shift-wise analysis
    try {
      [shiftAnalysis] = await sequelize.query(`
        SELECT 
          mc.shift_type as shiftType,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf
        FROM \`${schemaName}\`.\`milk_collections\` mc
        WHERE mc.society_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY mc.shift_type
        ORDER BY collections DESC
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(shiftAnalysis as Array<unknown>).length} shift analyses`);
    } catch (error) {
      console.error('[Society Details API] Error fetching shift analysis:', error);
    }

    // Get top performing farmers
    try {
      [topFarmers] = await sequelize.query(`
        SELECT 
          f.farmer_id as farmerId,
          f.name,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf
        FROM \`${schemaName}\`.\`farmers\` f
        LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc ON mc.farmer_id = f.id
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE f.society_id = ?
        GROUP BY f.id, f.farmer_id, f.name
        HAVING totalQuantity > 0
        ORDER BY totalQuantity DESC
        LIMIT 10
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(topFarmers as Array<unknown>).length} top farmers`);
    } catch (error) {
      console.error('[Society Details API] Error fetching top farmers:', error);
    }

    // Get channel-wise breakdown
    try {
      [channelBreakdown] = await sequelize.query(`
        SELECT 
          mc.channel,
          COUNT(DISTINCT mc.id) as collections,
          COALESCE(SUM(mc.quantity), 0) as totalQuantity,
          COALESCE(SUM(mc.total_amount), 0) as totalRevenue,
          COALESCE(AVG(mc.fat_percentage), 0) as avgFat,
          COALESCE(AVG(mc.snf_percentage), 0) as avgSnf
        FROM \`${schemaName}\`.\`milk_collections\` mc
        WHERE mc.society_id = ?
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY mc.channel
        ORDER BY totalQuantity DESC
      `, { replacements: [societyId] });
      console.log(`[Society Details API] Found ${(channelBreakdown as Array<unknown>).length} channels`);
    } catch (error) {
      console.error('[Society Details API] Error fetching channel breakdown:', error);
    }

    // Get section pulse data with farmer counts
    let sections: unknown[] = [];
    try {
      [sections] = await sequelize.query(`
        SELECT 
          sp.id,
          DATE_FORMAT(sp.pulse_date, '%Y-%m-%d') as pulseDate,
          sp.pulse_status as pulseStatus,
          DATE_FORMAT(sp.first_collection_time, '%Y-%m-%d %H:%i:%s') as firstCollectionTime,
          DATE_FORMAT(sp.last_collection_time, '%Y-%m-%d %H:%i:%s') as lastCollectionTime,
          DATE_FORMAT(sp.section_end_time, '%Y-%m-%d %H:%i:%s') as sectionEndTime,
          sp.total_collections as totalCollections,
          sp.inactive_days as inactiveDays,
          DATE_FORMAT(sp.last_checked, '%Y-%m-%d %H:%i:%s') as lastChecked,
          (SELECT COUNT(*) FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ? AND status = 'active') as totalFarmers,
          (SELECT COUNT(DISTINCT mc.farmer_id) 
           FROM \`${schemaName}\`.\`milk_collections\` mc 
           WHERE mc.society_id = ? AND DATE(mc.collection_date) = sp.pulse_date) as presentFarmers,
          ((SELECT COUNT(*) FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ? AND status = 'active') - 
           (SELECT COUNT(DISTINCT mc.farmer_id) 
            FROM \`${schemaName}\`.\`milk_collections\` mc 
            WHERE mc.society_id = ? AND DATE(mc.collection_date) = sp.pulse_date)) as absentFarmers,
          DATE_FORMAT(sp.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
          DATE_FORMAT(sp.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt
        FROM \`${schemaName}\`.\`section_pulse\` sp
        WHERE sp.society_id = ?
        ORDER BY sp.pulse_date DESC
        LIMIT 30
      `, { replacements: [societyId, societyId, societyId, societyId, societyId] });
      console.log(`[Society Details API] Found ${(sections as Array<unknown>).length} section pulse records with farmer counts`);
    } catch (error) {
      console.error('[Society Details API] Error fetching section pulse:', error);
    }

    console.log(`[Society Details API] Successfully compiled society details for: ${(society as Record<string, unknown>).name}`);

    return createSuccessResponse('Society details retrieved successfully', {
      society,
      machines,
      farmers,
      collections,
      dispatches,
      sales,
      analytics,
      dailyTrends,
      shiftAnalysis,
      topPerformers: {
        farmers: topFarmers
      },
      channelBreakdown,
      sections
    });

  } catch (error: unknown) {
    console.error('[Society Details API] Error:', error);
    return createErrorResponse('Failed to fetch society details', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: societyId } = await params;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse request body
    const body = await request.json();
    const { name, location, presidentName, contactPhone, email, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return createErrorResponse('Society name is required', 400);
    }

    if (!email || !email.trim()) {
      return createErrorResponse('Email is required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return createErrorResponse('Please enter a valid email address', 400);
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'maintenance'];
    if (status && !validStatuses.includes(status)) {
      return createErrorResponse('Invalid status value', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`[Society Update API] Updating society ${societyId} in schema: ${schemaName}`);

    // Check if society exists
    const existingSociety = await sequelize.query<{ id: number }>(
      `SELECT id FROM \`${schemaName}\`.\`societies\` WHERE id = ? LIMIT 1`,
      { replacements: [societyId], type: QueryTypes.SELECT }
    );

    if (!existingSociety || existingSociety.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    // Check for duplicate email (exclude current society)
    const emailCheckQuery = `
      SELECT society_id FROM \`${schemaName}\`.\`societies\`
      WHERE email = ? AND id != ? LIMIT 1
    `;
    const [existingEmail] = await sequelize.query(emailCheckQuery, {
      replacements: [email.trim().toLowerCase(), societyId]
    });
    
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      console.log(`📧 Duplicate email detected: ${email}`);
      return createErrorResponse('Email address already exists. Please use a different email.', 400);
    }

    // Update society
    await sequelize.query(
      `UPDATE \`${schemaName}\`.\`societies\`
       SET name = ?,
           location = ?,
           president_name = ?,
           contact_phone = ?,
           email = ?,
           status = ?,
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [
          name.trim(),
          location || null,
          presidentName || null,
          contactPhone || null,
          email.trim().toLowerCase(),
          status || 'active',
          societyId
        ]
      }
    );

    console.log(`[Society Update API] Successfully updated society ${societyId}`);

    // Fetch updated society data with joins (same structure as GET endpoint)
    const [updatedSociety] = await sequelize.query(
      `SELECT 
        s.id,
        s.society_id as societyId,
        s.name,
        s.location,
        s.president_name as presidentName,
        s.contact_phone as contactPhone,
        s.bmc_id as bmcId,
        b.name as bmcName,
        b.bmc_id as bmcIdentifier,
        b.dairy_farm_id as dairyId,
        df.name as dairyName,
        df.dairy_id as dairyIdentifier,
        s.status,
        DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(s.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`dairy_farms\` df ON b.dairy_farm_id = df.id
      WHERE s.id = ?
      LIMIT 1`,
      { replacements: [societyId] }
    );

    return createSuccessResponse('Society updated successfully', {
      society: updatedSociety[0]
    });

  } catch (error: unknown) {
    console.error('[Society Update API] Error:', error);
    return createErrorResponse('Failed to update society details', 500);
  }
}
