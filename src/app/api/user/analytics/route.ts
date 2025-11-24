import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
  dbKey?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey and fullName
    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      console.error('Admin not found or missing dbKey:', decoded.id);
      return NextResponse.json({ error: 'Admin schema not found' }, { status: 404 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    console.log('Fetching analytics for schema:', schemaName);

    // Get date range from query params (default last 30 days)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // 1. Daily trends for collections
    const dailyCollectionQuery = `
      SELECT 
        DATE(mc.collection_date) as date,
        COUNT(*) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr,
        SUM(mc.quantity * mc.protein_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_protein,
        SUM(mc.quantity * mc.lactose_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_lactose
      FROM \`${schemaName}\`.milk_collections mc
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY DATE(mc.collection_date)
      ORDER BY DATE(mc.collection_date) ASC
    `;

    // 2. Daily trends for dispatches
    const dailyDispatchQuery = `
      SELECT 
        DATE(md.dispatch_date) as date,
        COUNT(*) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount,
        AVG(md.rate_per_liter) as avg_rate,
        SUM(md.quantity * md.fat_percentage) / NULLIF(SUM(md.quantity), 0) as weighted_fat,
        SUM(md.quantity * md.snf_percentage) / NULLIF(SUM(md.quantity), 0) as weighted_snf,
        SUM(md.quantity * md.clr_value) / NULLIF(SUM(md.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_dispatches md
      WHERE md.dispatch_date >= '${startDateStr}'
      GROUP BY DATE(md.dispatch_date)
      ORDER BY DATE(md.dispatch_date) ASC
    `;

    // 3. Daily trends for sales
    const dailySalesQuery = `
      SELECT 
        DATE(ms.sales_date) as date,
        COUNT(*) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      WHERE ms.sales_date >= '${startDateStr}'
      GROUP BY DATE(ms.sales_date)
      ORDER BY DATE(ms.sales_date) ASC
    `;

    // 4. Dairy-wise breakdown (collections)
    const dairyBreakdownQuery = `
      SELECT 
        COALESCE(df.name, 'Unknown') as dairy_name,
        COUNT(DISTINCT mc.id) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY df.name
      ORDER BY total_quantity DESC
    `;

    // 5. BMC-wise breakdown (collections)
    const bmcBreakdownQuery = `
      SELECT 
        COALESCE(b.name, 'Unknown') as bmc_name,
        COUNT(DISTINCT mc.id) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY b.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    // 6. Society-wise breakdown (collections)
    const societyBreakdownQuery = `
      SELECT 
        COALESCE(s.name, 'Unknown') as society_name,
        COUNT(DISTINCT mc.id) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY s.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    // 7. Machine-wise breakdown (collections)
    const machineBreakdownQuery = `
      SELECT 
        COALESCE(m.machine_id, mc.machine_id, 'Unknown') as machine_id,
        mc.machine_type,
        COUNT(DISTINCT mc.id) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY COALESCE(m.machine_id, mc.machine_id), mc.machine_type
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    // 8. Shift-wise breakdown (collections)
    const shiftBreakdownQuery = `
      SELECT 
        CASE 
          WHEN mc.shift_type IN ('MR', 'MX', 'morning') THEN 'Morning'
          WHEN mc.shift_type IN ('EV', 'EX', 'evening') THEN 'Evening'
          ELSE mc.shift_type
        END as shift,
        COUNT(*) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY shift
    `;

    // 9. Channel-wise breakdown (collections)
    const channelBreakdownQuery = `
      SELECT 
        CASE 
          WHEN UPPER(mc.channel) IN ('CH1', 'COW') THEN 'COW'
          WHEN UPPER(mc.channel) IN ('CH2', 'BUFFALO') THEN 'BUFFALO'
          WHEN UPPER(mc.channel) IN ('CH3', 'MIXED') THEN 'MIXED'
          ELSE UPPER(mc.channel)
        END as channel,
        COUNT(*) as total_collections,
        SUM(mc.quantity) as total_quantity,
        SUM(mc.total_amount) as total_amount,
        SUM(mc.quantity * mc.fat_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_fat,
        SUM(mc.quantity * mc.snf_percentage) / NULLIF(SUM(mc.quantity), 0) as weighted_snf,
        SUM(mc.quantity * mc.clr_value) / NULLIF(SUM(mc.quantity), 0) as weighted_clr
      FROM \`${schemaName}\`.milk_collections mc
      WHERE mc.collection_date >= '${startDateStr}'
      GROUP BY channel
    `;

    // Execute all queries in parallel with error handling
    const executeQuery = async (query: string, name: string) => {
      try {
        const [results] = await sequelize.query(query);
        return results;
      } catch (error) {
        console.error(`Error executing ${name} query:`, error);
        return [];
      }
    };

    const [
      dailyCollections,
      dailyDispatches,
      dailySales,
      dairyBreakdown,
      bmcBreakdown,
      societyBreakdown,
      machineBreakdown,
      shiftBreakdown,
      channelBreakdown
    ] = await Promise.all([
      executeQuery(dailyCollectionQuery, 'dailyCollection'),
      executeQuery(dailyDispatchQuery, 'dailyDispatch'),
      executeQuery(dailySalesQuery, 'dailySales'),
      executeQuery(dairyBreakdownQuery, 'dairyBreakdown'),
      executeQuery(bmcBreakdownQuery, 'bmcBreakdown'),
      executeQuery(societyBreakdownQuery, 'societyBreakdown'),
      executeQuery(machineBreakdownQuery, 'machineBreakdown'),
      executeQuery(shiftBreakdownQuery, 'shiftBreakdown'),
      executeQuery(channelBreakdownQuery, 'channelBreakdown')
    ]);

    return NextResponse.json({
      dailyCollections,
      dailyDispatches,
      dailySales,
      dairyBreakdown,
      bmcBreakdown,
      societyBreakdown,
      machineBreakdown,
      shiftBreakdown,
      channelBreakdown
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
