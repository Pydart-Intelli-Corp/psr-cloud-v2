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
    const fromDateParam = searchParams.get('from');
    const toDateParam = searchParams.get('to');
    const days = parseInt(searchParams.get('days') || '30');
    
    // Get filter params - matching report management pattern
    const dairyFilter = searchParams.get('dairy')?.split(',').filter(Boolean) || [];
    const bmcFilter = searchParams.get('bmc')?.split(',').filter(Boolean) || [];
    const societyFilter = searchParams.get('society')?.split(',').filter(Boolean) || [];
    const machineFilter = searchParams.get('machine')?.split(',').filter(Boolean) || [];
    const farmerFilter = searchParams.get('farmer')?.split(',').filter(Boolean) || [];
    const channelFilter = searchParams.get('channel');
    const shiftFilter = searchParams.get('shift');
    
    console.log('🔍 Filters:', { dairyFilter, bmcFilter, societyFilter, machineFilter, farmerFilter, channelFilter, shiftFilter });
    
    let dateCondition = '';
    if (fromDateParam && toDateParam) {
      // Custom date range
      dateCondition = `WHERE mc.collection_date >= '${fromDateParam}' AND mc.collection_date <= '${toDateParam}'`;
      console.log(`📅 Using custom date range: ${fromDateParam} to ${toDateParam}`);
    } else if (days > 0) {
      // Preset days range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      dateCondition = `WHERE mc.collection_date >= '${startDateStr}'`;
      console.log(`📅 Using preset range: Last ${days} days (from ${startDateStr})`);
    } else {
      // No date filter - get all data
      dateCondition = '';
      console.log(`📅 Fetching ALL data (no date filter)`);
    }

    // Build filter conditions - matching report management pattern
    const filterConditions: string[] = [];
    
    // Dairy filter
    if (dairyFilter.length > 0) {
      filterConditions.push(`df.id IN (${dairyFilter.join(',')})`);
    }
    
    // BMC filter
    if (bmcFilter.length > 0) {
      filterConditions.push(`b.id IN (${bmcFilter.join(',')})`);
    }
    
    // Society filter
    if (societyFilter.length > 0) {
      filterConditions.push(`s.id IN (${societyFilter.join(',')})`);
    }
    
    // Machine filter - convert IDs to machine_id strings
    if (machineFilter.length > 0) {
      const machineIds = machineFilter.map(id => `'${id}'`).join(',');
      filterConditions.push(`m.machine_id IN (${machineIds})`);
    }
    
    // Farmer filter
    if (farmerFilter.length > 0) {
      const farmerIds = farmerFilter.map(id => `'${id}'`).join(',');
      filterConditions.push(`mc.farmer_id IN (${farmerIds})`);
    }
    
    // Channel filter
    if (channelFilter && channelFilter !== 'all') {
      const channelMapping: { [key: string]: string[] } = {
        'COW': ['COW', 'cow', 'ch1', 'CH1'],
        'BUFFALO': ['BUFFALO', 'buffalo', 'BUF', 'ch2', 'CH2'],
        'MIXED': ['MIXED', 'mixed', 'MIX', 'ch3', 'CH3']
      };
      const channelValues = channelMapping[channelFilter] || [channelFilter];
      const channelConditions = channelValues.map(v => `'${v}'`).join(',');
      filterConditions.push(`mc.channel IN (${channelConditions})`);
    }
    
    // Shift filter
    if (shiftFilter && shiftFilter !== 'all') {
      if (shiftFilter === 'morning') {
        filterConditions.push(`mc.shift_type IN ('MR', 'MX', 'morning')`);
      } else if (shiftFilter === 'evening') {
        filterConditions.push(`mc.shift_type IN ('EV', 'EX', 'evening')`);
      } else {
        filterConditions.push(`mc.shift_type = '${shiftFilter}'`);
      }
    }

    // Combine date and filter conditions
    const whereClause = dateCondition 
      ? filterConditions.length > 0 
        ? `${dateCondition} AND ${filterConditions.join(' AND ')}`
        : dateCondition
      : filterConditions.length > 0
        ? `WHERE ${filterConditions.join(' AND ')}`
        : '';

    console.log('📋 WHERE clause:', whereClause);

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
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
      GROUP BY DATE(mc.collection_date)
      ORDER BY DATE(mc.collection_date) ASC
    `;

    // 2. Daily trends for dispatches - matching filter pattern
    const dispatchWhereClause = whereClause
      .replace(/mc\./g, 'md.')
      .replace(/m\.machine_id/g, 'dm.machine_id')
      .replace(/collection_date/g, 'dispatch_date')
      .replace(/mc\.farmer_id/g, 'md.society_id'); // For dispatches, farmer filter becomes society filter
    
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
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY DATE(md.dispatch_date)
      ORDER BY DATE(md.dispatch_date) ASC
    `;

    // 3. Daily trends for sales - matching filter pattern
    const salesWhereClause = whereClause
      .replace(/mc\./g, 'ms.')
      .replace(/m\.machine_id/g, 'sm.machine_id')
      .replace(/collection_date/g, 'sales_date')
      .replace(/mc\.farmer_id/g, 'ms.customer_id'); // For sales, farmer filter becomes customer filter
    
    const dailySalesQuery = `
      SELECT 
        DATE(ms.sales_date) as date,
        COUNT(*) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
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
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
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
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
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
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
      GROUP BY s.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    // 7. Machine-wise breakdown (collections)
    const machineBreakdownQuery = `
      SELECT 
        m.machine_id as machine_id,
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
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
      GROUP BY m.machine_id, mc.machine_type
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
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
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
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${whereClause}
      GROUP BY channel
    `;

    // 10-14. Breakdown queries for DISPATCHES (same structure as collections)
    const dairyDispatchBreakdownQuery = `
      SELECT 
        COALESCE(df.name, 'Unknown') as dairy_name,
        COUNT(DISTINCT md.id) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount,
        AVG(md.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY df.name
      ORDER BY total_quantity DESC
    `;

    const bmcDispatchBreakdownQuery = `
      SELECT 
        COALESCE(b.name, 'Unknown') as bmc_name,
        COUNT(DISTINCT md.id) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount,
        AVG(md.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY b.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const societyDispatchBreakdownQuery = `
      SELECT 
        COALESCE(s.name, 'Unknown') as society_name,
        COUNT(DISTINCT md.id) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount,
        AVG(md.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY s.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const machineDispatchBreakdownQuery = `
      SELECT 
        dm.machine_id as machine_id,
        md.machine_type,
        COUNT(DISTINCT md.id) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount,
        AVG(md.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY dm.machine_id, md.machine_type
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const channelDispatchBreakdownQuery = `
      SELECT 
        CASE 
          WHEN UPPER(md.channel) IN ('CH1', 'COW') THEN 'COW'
          WHEN UPPER(md.channel) IN ('CH2', 'BUFFALO') THEN 'BUFFALO'
          WHEN UPPER(md.channel) IN ('CH3', 'MIXED') THEN 'MIXED'
          ELSE UPPER(md.channel)
        END as channel,
        COUNT(*) as total_dispatches,
        SUM(md.quantity) as total_quantity,
        SUM(md.total_amount) as total_amount
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.machines dm ON md.machine_id = dm.id
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${dispatchWhereClause}
      GROUP BY channel
    `;

    // 15-19. Breakdown queries for SALES (same structure as collections)
    const dairySalesBreakdownQuery = `
      SELECT 
        COALESCE(df.name, 'Unknown') as dairy_name,
        COUNT(DISTINCT ms.id) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
      GROUP BY df.name
      ORDER BY total_quantity DESC
    `;

    const bmcSalesBreakdownQuery = `
      SELECT 
        COALESCE(b.name, 'Unknown') as bmc_name,
        COUNT(DISTINCT ms.id) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
      GROUP BY b.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const societySalesBreakdownQuery = `
      SELECT 
        COALESCE(s.name, 'Unknown') as society_name,
        COUNT(DISTINCT ms.id) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
      GROUP BY s.name
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const machineSalesBreakdownQuery = `
      SELECT 
        sm.machine_id as machine_id,
        ms.machine_type,
        COUNT(DISTINCT ms.id) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount,
        AVG(ms.rate_per_liter) as avg_rate
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
      GROUP BY sm.machine_id, ms.machine_type
      ORDER BY total_quantity DESC
      LIMIT 20
    `;

    const channelSalesBreakdownQuery = `
      SELECT 
        CASE 
          WHEN UPPER(ms.channel) IN ('CH1', 'COW') THEN 'COW'
          WHEN UPPER(ms.channel) IN ('CH2', 'BUFFALO') THEN 'BUFFALO'
          WHEN UPPER(ms.channel) IN ('CH3', 'MIXED') THEN 'MIXED'
          ELSE UPPER(ms.channel)
        END as channel,
        COUNT(*) as total_sales,
        SUM(ms.quantity) as total_quantity,
        SUM(ms.total_amount) as total_amount
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines sm ON ms.machine_id = sm.id
      LEFT JOIN \`${schemaName}\`.societies s ON ms.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      ${salesWhereClause}
      GROUP BY channel
    `;

    // First, check what dates exist in the database
    const dateCheckQuery = `
      SELECT 
        MIN(DATE(collection_date)) as earliest_date,
        MAX(DATE(collection_date)) as latest_date,
        COUNT(*) as total_records
      FROM \`${schemaName}\`.milk_collections
    `;
    
    const [dateCheck] = await sequelize.query(dateCheckQuery);
    console.log(`🗄️  Database contains ${(dateCheck as any[])[0]?.total_records || 0} collection records`);
    console.log(`📆 Date range in DB: ${(dateCheck as any[])[0]?.earliest_date || 'N/A'} to ${(dateCheck as any[])[0]?.latest_date || 'N/A'}`);

    // Execute all queries in parallel with error handling
    const executeQuery = async (query: string, name: string) => {
      try {
        const [results] = await sequelize.query(query);
        console.log(`✅ ${name}: ${(results as any[]).length} records`);
        return results;
      } catch (error) {
        console.error(`❌ Error executing ${name} query:`, error);
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
      channelBreakdown,
      dairyDispatchBreakdown,
      bmcDispatchBreakdown,
      societyDispatchBreakdown,
      machineDispatchBreakdown,
      channelDispatchBreakdown,
      dairySalesBreakdown,
      bmcSalesBreakdown,
      societySalesBreakdown,
      machineSalesBreakdown,
      channelSalesBreakdown
    ] = await Promise.all([
      executeQuery(dailyCollectionQuery, 'dailyCollection'),
      executeQuery(dailyDispatchQuery, 'dailyDispatch'),
      executeQuery(dailySalesQuery, 'dailySales'),
      executeQuery(dairyBreakdownQuery, 'dairyBreakdown'),
      executeQuery(bmcBreakdownQuery, 'bmcBreakdown'),
      executeQuery(societyBreakdownQuery, 'societyBreakdown'),
      executeQuery(machineBreakdownQuery, 'machineBreakdown'),
      executeQuery(shiftBreakdownQuery, 'shiftBreakdown'),
      executeQuery(channelBreakdownQuery, 'channelBreakdown'),
      executeQuery(dairyDispatchBreakdownQuery, 'dairyDispatchBreakdown'),
      executeQuery(bmcDispatchBreakdownQuery, 'bmcDispatchBreakdown'),
      executeQuery(societyDispatchBreakdownQuery, 'societyDispatchBreakdown'),
      executeQuery(machineDispatchBreakdownQuery, 'machineDispatchBreakdown'),
      executeQuery(channelDispatchBreakdownQuery, 'channelDispatchBreakdown'),
      executeQuery(dairySalesBreakdownQuery, 'dairySalesBreakdown'),
      executeQuery(bmcSalesBreakdownQuery, 'bmcSalesBreakdown'),
      executeQuery(societySalesBreakdownQuery, 'societySalesBreakdown'),
      executeQuery(machineSalesBreakdownQuery, 'machineSalesBreakdown'),
      executeQuery(channelSalesBreakdownQuery, 'channelSalesBreakdown')
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
      channelBreakdown,
      dairyDispatchBreakdown,
      bmcDispatchBreakdown,
      societyDispatchBreakdown,
      machineDispatchBreakdown,
      channelDispatchBreakdown,
      dairySalesBreakdown,
      bmcSalesBreakdown,
      societySalesBreakdown,
      machineSalesBreakdown,
      channelSalesBreakdown
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
