import { NextRequest } from 'next/server';
import { authenticateToken, createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { connectDB } from '@/lib/database';
import { QueryTypes } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = authenticateToken(request);
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(authResult.error || 'Authentication failed', 401);
    }

    const { user } = authResult;
    const dbKey = user.dbKey;

    console.log('📊 Analytics API - User:', {
      id: user.id,
      email: user.email,
      role: user.role,
      dbKey: user.dbKey
    });

    if (!dbKey) {
      return createErrorResponse('Database key not found. Only Admin users can access analytics.', 400);
    }

    // Connect to main database and get admin details
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    const admin = await User.findByPk(user.id);
    if (!admin || !admin.fullName) {
      return createErrorResponse('Admin details not found', 404);
    }

    // Generate schema name dynamically: cleanName_dbKey
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const adminSchema = `${cleanAdminName}_${dbKey.toLowerCase()}`;

    console.log('📊 Using schema:', adminSchema);
    
    // Get date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Parallel queries for better performance
    const [
      entityCounts,
      collectionStats,
      topSocieties,
      topMachines,
      topFarmers,
      topBMCs,
      topDairies,
      recentCollections,
      qualityMetrics,
      collectionTrends,
      machineStats,
      sectionPulseStats
    ] = await Promise.all([
      // Entity counts
      sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM \`${adminSchema}\`.dairy_farms WHERE status = 'active') as totalDairies,
          (SELECT COUNT(*) FROM \`${adminSchema}\`.bmcs WHERE status = 'active') as totalBMCs,
          (SELECT COUNT(*) FROM \`${adminSchema}\`.societies WHERE status = 'active') as totalSocieties,
          (SELECT COUNT(*) FROM \`${adminSchema}\`.farmers WHERE status = 'active') as totalFarmers,
          (SELECT COUNT(*) FROM \`${adminSchema}\`.machines WHERE status = 'active') as totalMachines
      `, { type: QueryTypes.SELECT }),

      // Collection statistics
      sequelize.query(`
        SELECT 
          COUNT(*) as totalCollections,
          SUM(quantity) as totalQuantity,
          AVG(fat_percentage) as avgFat,
          AVG(snf_percentage) as avgSNF,
          COUNT(DISTINCT farmer_id) as activeFarmers,
          COUNT(DISTINCT society_id) as activeSocieties,
          COUNT(DISTINCT DATE(collection_date)) as collectionDays
        FROM \`${adminSchema}\`.milk_collections
        WHERE collection_date >= ?
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Top 5 societies by collection
      sequelize.query(`
        SELECT 
          s.id,
          s.society_id,
          s.name,
          COUNT(mc.id) as totalCollections,
          SUM(mc.quantity) as totalQuantity,
          AVG(mc.fat_percentage) as avgFat,
          AVG(mc.snf_percentage) as avgSNF,
          (
            SELECT f.name
            FROM \`${adminSchema}\`.farmers f
            LEFT JOIN \`${adminSchema}\`.milk_collections mc2 ON f.id = mc2.farmer_id
              AND mc2.collection_date >= ?
            WHERE f.society_id = s.id AND f.status = 'active'
            GROUP BY f.id, f.name
            ORDER BY SUM(mc2.quantity) DESC
            LIMIT 1
          ) as bestFarmerName,
          (
            SELECT f.farmer_id
            FROM \`${adminSchema}\`.farmers f
            LEFT JOIN \`${adminSchema}\`.milk_collections mc2 ON f.id = mc2.farmer_id
              AND mc2.collection_date >= ?
            WHERE f.society_id = s.id AND f.status = 'active'
            GROUP BY f.id, f.farmer_id
            ORDER BY SUM(mc2.quantity) DESC
            LIMIT 1
          ) as bestFarmerId,
          (
            SELECT SUM(mc2.quantity)
            FROM \`${adminSchema}\`.farmers f
            LEFT JOIN \`${adminSchema}\`.milk_collections mc2 ON f.id = mc2.farmer_id
              AND mc2.collection_date >= ?
            WHERE f.society_id = s.id AND f.status = 'active'
            GROUP BY f.id
            ORDER BY SUM(mc2.quantity) DESC
            LIMIT 1
          ) as bestFarmerQuantity
        FROM \`${adminSchema}\`.societies s
        LEFT JOIN \`${adminSchema}\`.milk_collections mc ON s.id = mc.society_id
          AND mc.collection_date >= ?
        WHERE s.status = 'active'
        GROUP BY s.id, s.society_id, s.name
        ORDER BY totalQuantity DESC
        LIMIT 5
      `, { 
        replacements: [thirtyDaysAgoStr, thirtyDaysAgoStr, thirtyDaysAgoStr, thirtyDaysAgoStr, thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Top 5 machines by collection count
      sequelize.query(`
        SELECT 
          m.id,
          m.machine_id,
          m.machine_type,
          m.location as machineLocation,
          COUNT(mc.id) as totalCollections,
          SUM(mc.quantity) as totalQuantity,
          s.name as societyName,
          s.society_id as societyId,
          s.location as societyLocation
        FROM \`${adminSchema}\`.machines m
        LEFT JOIN \`${adminSchema}\`.milk_collections mc ON m.id = mc.machine_id
          AND mc.collection_date >= ?
        LEFT JOIN \`${adminSchema}\`.societies s ON m.society_id = s.id
        WHERE m.status = 'active'
        GROUP BY m.id, m.machine_id, m.machine_type, m.location, s.name, s.society_id, s.location
        ORDER BY totalCollections DESC
        LIMIT 5
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Top 5 farmers by quantity
      sequelize.query(`
        SELECT 
          f.id,
          f.farmer_id,
          f.name,
          f.phone,
          COUNT(mc.id) as totalCollections,
          SUM(mc.quantity) as totalQuantity,
          AVG(mc.fat_percentage) as avgFat,
          AVG(mc.snf_percentage) as avgSNF,
          s.name as societyName
        FROM \`${adminSchema}\`.farmers f
        LEFT JOIN \`${adminSchema}\`.milk_collections mc ON f.farmer_id = mc.farmer_id
          AND mc.collection_date >= ?
        LEFT JOIN \`${adminSchema}\`.societies s ON f.society_id = s.id
        WHERE f.status = 'active'
        GROUP BY f.id, f.farmer_id, f.name, f.phone, s.name
        ORDER BY totalQuantity DESC
        LIMIT 5
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Top BMCs by collection
      sequelize.query(`
        SELECT 
          b.id,
          b.bmc_id,
          b.name,
          COUNT(mc.id) as totalCollections,
          SUM(mc.quantity) as totalQuantity
        FROM \`${adminSchema}\`.bmcs b
        LEFT JOIN \`${adminSchema}\`.societies s ON b.id = s.bmc_id
        LEFT JOIN \`${adminSchema}\`.milk_collections mc ON s.id = mc.society_id
          AND mc.collection_date >= ?
        WHERE b.status = 'active'
        GROUP BY b.id, b.bmc_id, b.name
        ORDER BY totalQuantity DESC
        LIMIT 5
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Top dairies
      sequelize.query(`
        SELECT 
          d.id,
          d.dairy_id,
          d.name,
          COUNT(mc.id) as totalCollections,
          SUM(mc.quantity) as totalQuantity
        FROM \`${adminSchema}\`.dairy_farms d
        LEFT JOIN \`${adminSchema}\`.bmcs b ON d.id = b.dairy_farm_id
        LEFT JOIN \`${adminSchema}\`.societies s ON b.id = s.bmc_id
        LEFT JOIN \`${adminSchema}\`.milk_collections mc ON s.id = mc.society_id
          AND mc.collection_date >= ?
        WHERE d.status = 'active'
        GROUP BY d.id, d.dairy_id, d.name
        ORDER BY totalQuantity DESC
        LIMIT 5
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Recent collections (last 10)
      sequelize.query(`
        SELECT 
          mc.id,
          mc.collection_date,
          mc.collection_time,
          mc.quantity,
          mc.fat_percentage as fat,
          mc.snf_percentage as snf,
          f.name as farmerName,
          f.farmer_id,
          s.name as societyName,
          m.machine_id as machineId
        FROM \`${adminSchema}\`.milk_collections mc
        LEFT JOIN \`${adminSchema}\`.farmers f ON mc.farmer_id = f.id
        LEFT JOIN \`${adminSchema}\`.societies s ON mc.society_id = s.id
        LEFT JOIN \`${adminSchema}\`.machines m ON mc.machine_id = m.id
        ORDER BY mc.collection_date DESC, mc.collection_time DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT }),

      // Quality metrics comparison
      sequelize.query(`
        SELECT 
          'Last 7 Days' as period,
          AVG(fat_percentage) as avgFat,
          AVG(snf_percentage) as avgSNF,
          MIN(fat_percentage) as minFat,
          MAX(fat_percentage) as maxFat,
          MIN(snf_percentage) as minSNF,
          MAX(snf_percentage) as maxSNF
        FROM \`${adminSchema}\`.milk_collections
        WHERE collection_date >= ?
        UNION ALL
        SELECT 
          'Last 30 Days' as period,
          AVG(fat_percentage) as avgFat,
          AVG(snf_percentage) as avgSNF,
          MIN(fat_percentage) as minFat,
          MAX(fat_percentage) as maxFat,
          MIN(snf_percentage) as minSNF,
          MAX(snf_percentage) as maxSNF
        FROM \`${adminSchema}\`.milk_collections
        WHERE collection_date >= ?
      `, { 
        replacements: [sevenDaysAgoStr, thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Collection trends (daily for last 30 days)
      sequelize.query(`
        SELECT 
          DATE(collection_date) as date,
          COUNT(*) as collections,
          SUM(quantity) as quantity,
          AVG(fat_percentage) as avgFat,
          AVG(snf_percentage) as avgSNF
        FROM \`${adminSchema}\`.milk_collections
        WHERE collection_date >= ?
        GROUP BY DATE(collection_date)
        ORDER BY date ASC
      `, { 
        replacements: [thirtyDaysAgoStr],
        type: QueryTypes.SELECT 
      }),

      // Machine statistics
      sequelize.query(`
        SELECT 
          machine_type,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCount,
          SUM(CASE WHEN statusU = 'online' THEN 1 ELSE 0 END) as onlineCount
        FROM \`${adminSchema}\`.machines
        GROUP BY machine_type
      `, { type: QueryTypes.SELECT }),

      // Section pulse status
      sequelize.query(`
        SELECT 
          pulse_status,
          COUNT(*) as count
        FROM \`${adminSchema}\`.section_pulse
        WHERE pulse_date >= ?
        GROUP BY pulse_status
      `, { 
        replacements: [sevenDaysAgoStr],
        type: QueryTypes.SELECT 
      })
    ]);

    // Calculate growth percentages
    const lastWeekCollections = await sequelize.query(`
      SELECT COUNT(*) as count, SUM(quantity) as quantity
      FROM \`${adminSchema}\`.milk_collections
      WHERE collection_date >= ?
    `, { 
      replacements: [sevenDaysAgoStr],
      type: QueryTypes.SELECT 
    });

    const previousWeekCollections = await sequelize.query(`
      SELECT COUNT(*) as count, SUM(quantity) as quantity
      FROM \`${adminSchema}\`.milk_collections
      WHERE collection_date >= DATE_SUB(?, INTERVAL 7 DAY)
        AND collection_date < ?
    `, { 
      replacements: [sevenDaysAgoStr, sevenDaysAgoStr],
      type: QueryTypes.SELECT 
    });

    const growthData = {
      collections: {
        current: (lastWeekCollections[0] as any)?.count || 0,
        previous: (previousWeekCollections[0] as any)?.count || 0,
      },
      quantity: {
        current: (lastWeekCollections[0] as any)?.quantity || 0,
        previous: (previousWeekCollections[0] as any)?.quantity || 0,
      }
    };

    // Format response
    const analytics = {
      overview: {
        entities: entityCounts[0],
        collections: {
          ...(collectionStats[0] as any),
          totalQuantity: parseFloat((Number((collectionStats[0] as any)?.totalQuantity) || 0).toFixed(2)),
          avgFat: parseFloat((Number((collectionStats[0] as any)?.avgFat) || 0).toFixed(2)),
          avgSNF: parseFloat((Number((collectionStats[0] as any)?.avgSNF) || 0).toFixed(2)),
        },
        growth: {
          collectionsGrowth: growthData.collections.previous > 0 
            ? (((growthData.collections.current - growthData.collections.previous) / growthData.collections.previous) * 100).toFixed(1)
            : '0',
          quantityGrowth: growthData.quantity.previous > 0
            ? (((growthData.quantity.current - growthData.quantity.previous) / growthData.quantity.previous) * 100).toFixed(1)
            : '0',
        }
      },
      topPerformers: {
        societies: topSocieties.map((s: any) => ({
          ...s,
          totalQuantity: parseFloat((Number(s.totalQuantity) || 0).toFixed(2)),
          avgFat: parseFloat((Number(s.avgFat) || 0).toFixed(2)),
          avgSNF: parseFloat((Number(s.avgSNF) || 0).toFixed(2)),
        })),
        machines: topMachines.map((m: any) => ({
          ...m,
          totalQuantity: parseFloat((Number(m.totalQuantity) || 0).toFixed(2)),
        })),
        farmers: topFarmers.map((f: any) => ({
          ...f,
          totalQuantity: parseFloat((Number(f.totalQuantity) || 0).toFixed(2)),
          avgFat: parseFloat((Number(f.avgFat) || 0).toFixed(2)),
          avgSNF: parseFloat((Number(f.avgSNF) || 0).toFixed(2)),
        })),
        bmcs: topBMCs.map((b: any) => ({
          ...b,
          totalQuantity: parseFloat((Number(b.totalQuantity) || 0).toFixed(2)),
        })),
        dairies: topDairies.map((d: any) => ({
          ...d,
          totalQuantity: parseFloat((Number(d.totalQuantity) || 0).toFixed(2)),
        })),
      },
      recentActivity: recentCollections.map((c: any) => ({
        ...c,
        quantity: parseFloat((Number(c.quantity) || 0).toFixed(2)),
        fat: parseFloat((Number(c.fat) || 0).toFixed(2)),
        snf: parseFloat((Number(c.snf) || 0).toFixed(2)),
      })),
      qualityMetrics: qualityMetrics.map((q: any) => ({
        ...q,
        avgFat: parseFloat((Number(q.avgFat) || 0).toFixed(2)),
        avgSNF: parseFloat((Number(q.avgSNF) || 0).toFixed(2)),
        minFat: parseFloat((Number(q.minFat) || 0).toFixed(2)),
        maxFat: parseFloat((Number(q.maxFat) || 0).toFixed(2)),
        minSNF: parseFloat((Number(q.minSNF) || 0).toFixed(2)),
        maxSNF: parseFloat((Number(q.maxSNF) || 0).toFixed(2)),
      })),
      trends: {
        daily: collectionTrends.map((t: any) => ({
          date: t.date,
          collections: parseInt(t.collections) || 0,
          quantity: parseFloat((Number(t.quantity) || 0).toFixed(2)),
          avgFat: parseFloat((Number(t.avgFat) || 0).toFixed(2)),
          avgSNF: parseFloat((Number(t.avgSNF) || 0).toFixed(2)),
        })),
      },
      machines: {
        byType: machineStats,
      },
      sectionPulse: sectionPulseStats,
    };

    return createSuccessResponse(analytics, 'Dashboard analytics fetched successfully');

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return createErrorResponse('Failed to fetch dashboard analytics', 500);
  }
}
