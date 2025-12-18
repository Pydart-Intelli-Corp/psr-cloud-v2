import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if graph data is requested and which metric
    const { searchParams } = new URL(request.url);
    const isGraphData = searchParams.get('graphData') === 'true';
    const metric = searchParams.get('metric') || 'quantity';

    // Get database connection
    await connectDB();
    
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's schema
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin not found or database not configured' }, { status: 404 });
    }

    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    console.log('🔍 Machine Performance API - Schema:', schemaName);

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    if (isGraphData) {
      // Return detailed data for graphs based on metric
      let query = '';
      let dateParam = formattedDate;
      
      switch(metric) {
        case 'quantity':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              SUM(mc.quantity) as value
            FROM \`${schemaName}\`.milk_collections mc
            JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE mc.collection_date >= ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          break;
        case 'tests':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              SUM(ms.total_test) as value
            FROM \`${schemaName}\`.machine_statistics ms
            JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE ms.statistics_date >= ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          break;
        case 'cleaning':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              SUM(ms.daily_cleaning + ms.weekly_cleaning) as value
            FROM \`${schemaName}\`.machine_statistics ms
            JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE ms.statistics_date >= ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          break;
        case 'skip':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              SUM(ms.cleaning_skip) as value
            FROM \`${schemaName}\`.machine_statistics ms
            JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE ms.statistics_date >= ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          break;
        case 'today':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              COUNT(mc.id) as value
            FROM \`${schemaName}\`.milk_collections mc
            JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE mc.collection_date = ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          dateParam = today;
          break;
        case 'uptime':
          query = `
            SELECT 
              m.id,
              m.machine_id as machineId,
              m.machine_type as machineType,
              s.name as societyName,
              COUNT(DISTINCT mc.collection_date) as value
            FROM \`${schemaName}\`.milk_collections mc
            JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
            LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
            WHERE mc.collection_date >= ?
            GROUP BY m.id, m.machine_id, m.machine_type, s.name
            ORDER BY value DESC
            LIMIT 20
          `;
          break;
      }

      const machines = await sequelize.query(query, {
        replacements: [dateParam]
      });

      // Format data for graph
      const machineData = machines[0] as any[];
      const formattedData = Array.isArray(machineData) ? machineData.map((machine: any, index: number) => ({
        machine: {
          machineId: machine.machineId,
          machineType: machine.machineType,
          societyName: machine.societyName
        },
        value: parseFloat(machine.value) || 0,
        label: `${index + 1}. ${machine.machineId}`
      })) : [];

      return NextResponse.json(formattedData);
    } else {
      // Return summary stats
      
      // Top Collector by quantity
      const topCollectorResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          SUM(mc.quantity) as total_quantity
        FROM \`${schemaName}\`.milk_collections mc
        JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE mc.collection_date >= ?
        GROUP BY m.id
        ORDER BY total_quantity DESC
        LIMIT 1
      `, {
        replacements: [formattedDate]
      });

      // Most Tests from machine statistics
      const mostTestsResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          SUM(ms.total_test) as total_tests
        FROM \`${schemaName}\`.machine_statistics ms
        JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE ms.statistics_date >= ?
        GROUP BY m.id
        ORDER BY total_tests DESC
        LIMIT 1
      `, {
        replacements: [formattedDate]
      });

      // Best Cleaning record
      const bestCleaningResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          SUM(ms.daily_cleaning + ms.weekly_cleaning) as total_cleanings
        FROM \`${schemaName}\`.machine_statistics ms
        JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE ms.statistics_date >= ?
        GROUP BY m.id
        ORDER BY total_cleanings DESC
        LIMIT 1
      `, {
        replacements: [formattedDate]
      });

      // Most Cleaning Skip
      const mostCleaningSkipResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          SUM(ms.cleaning_skip) as total_skips
        FROM \`${schemaName}\`.machine_statistics ms
        JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE ms.statistics_date >= ?
        GROUP BY m.id
        ORDER BY total_skips DESC
        LIMIT 1
      `, {
        replacements: [formattedDate]
      });

      // Active Today
      const activeTodayResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          COUNT(mc.id) as collections_today
        FROM \`${schemaName}\`.milk_collections mc
        JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE mc.collection_date = ?
        GROUP BY m.id
        ORDER BY collections_today DESC
        LIMIT 1
      `, {
        replacements: [today]
      });

      // Highest Uptime (days with collections)
      const highestUptimeResult = await sequelize.query(`
        SELECT 
          m.id,
          m.machine_id as machineId,
          m.machine_type as machineType,
          s.name as societyName,
          COUNT(DISTINCT mc.collection_date) as active_days
        FROM \`${schemaName}\`.milk_collections mc
        JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE mc.collection_date >= ?
        GROUP BY m.id
        ORDER BY active_days DESC
        LIMIT 1
      `, {
        replacements: [formattedDate]
      });

      const topCollectorData = topCollectorResult[0] as any[];
      const mostTestsData = mostTestsResult[0] as any[];
      const bestCleaningData = bestCleaningResult[0] as any[];
      const mostCleaningSkipData = mostCleaningSkipResult[0] as any[];
      const activeTodayData = activeTodayResult[0] as any[];
      const highestUptimeData = highestUptimeResult[0] as any[];
      
      console.log('📊 Machine Performance Results:');
      console.log('  - Top Collector:', topCollectorData?.length || 0, 'records');
      console.log('  - Most Tests:', mostTestsData?.length || 0, 'records');
      console.log('  - Best Cleaning:', bestCleaningData?.length || 0, 'records');
      console.log('  - Most Cleaning Skip:', mostCleaningSkipData?.length || 0, 'records');
      console.log('  - Active Today:', activeTodayData?.length || 0, 'records');
      console.log('  - Highest Uptime:', highestUptimeData?.length || 0, 'records');

      const stats = {
        topCollector: topCollectorData && topCollectorData.length > 0 ? {
          machine: topCollectorData[0],
          totalQuantity: parseFloat((topCollectorData[0] as any).total_quantity) || 0
        } : null,
        mostTests: mostTestsData && mostTestsData.length > 0 ? {
          machine: mostTestsData[0],
          totalTests: parseInt((mostTestsData[0] as any).total_tests) || 0
        } : null,
        bestCleaning: bestCleaningData && bestCleaningData.length > 0 ? {
          machine: bestCleaningData[0],
          totalCleanings: parseInt((bestCleaningData[0] as any).total_cleanings) || 0
        } : null,
        mostCleaningSkip: mostCleaningSkipData && mostCleaningSkipData.length > 0 ? {
          machine: mostCleaningSkipData[0],
          totalSkips: parseInt((mostCleaningSkipData[0] as any).total_skips) || 0
        } : null,
        activeToday: activeTodayData && activeTodayData.length > 0 ? {
          machine: activeTodayData[0],
          collectionsToday: parseInt((activeTodayData[0] as any).collections_today) || 0
        } : null,
        highestUptime: highestUptimeData && highestUptimeData.length > 0 ? {
          machine: highestUptimeData[0],
          activeDays: parseInt((highestUptimeData[0] as any).active_days) || 0
        } : null
      };

      return NextResponse.json(stats);
    }
  } catch (error: any) {
    console.error('Error fetching machine performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machine performance data', details: error.message },
      { status: 500 }
    );
  }
}
