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

    // Check if graph data is requested
    const { searchParams } = new URL(request.url);
    const isGraphData = searchParams.get('graphData') === 'true';

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

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Query for farmer performance metrics (last 30 days)
    const performanceQuery = `
      SELECT 
        f.id,
        f.farmer_id,
        f.name as farmer_name,
        f.society_id,
        s.name as society_name,
        COUNT(mc.id) as total_collections,
        SUM(mc.quantity) as total_quantity,
        AVG(mc.fat_percentage) as avg_fat,
        AVG(mc.snf_percentage) as avg_snf,
        AVG(mc.rate_per_liter) as avg_rate,
        SUM(mc.total_amount) as total_amount
      FROM \`${schemaName}\`.farmers f
      INNER JOIN \`${schemaName}\`.milk_collections mc ON f.farmer_id = mc.farmer_id
      LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
      WHERE mc.collection_date >= ?
        AND f.status = 'active'
      GROUP BY f.id, f.farmer_id, f.name, f.society_id, s.name
      HAVING total_collections > 0
    `;

    const [results] = await sequelize.query(performanceQuery, {
      replacements: [formattedDate]
    });

    const farmers = results as any[];

    // If graph data is requested, return all farmers data
    if (isGraphData) {
      return NextResponse.json({
        success: true,
        farmers: farmers
      });
    }

    if (farmers.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          topCollector: null,
          bestFat: null,
          bestSnf: null,
          topRevenue: null,
          mostActive: null,
          bestQuality: null
        }
      });
    }

    // Find top performers
    const topCollector = [...farmers].sort((a, b) => 
      (parseFloat(b.total_quantity) || 0) - (parseFloat(a.total_quantity) || 0)
    )[0];

    const bestFat = [...farmers].sort((a, b) => 
      (parseFloat(b.avg_fat) || 0) - (parseFloat(a.avg_fat) || 0)
    )[0];

    const bestSnf = [...farmers].sort((a, b) => 
      (parseFloat(b.avg_snf) || 0) - (parseFloat(a.avg_snf) || 0)
    )[0];

    const topRevenue = [...farmers].sort((a, b) => 
      (parseFloat(b.total_amount) || 0) - (parseFloat(a.total_amount) || 0)
    )[0];

    const mostActive = [...farmers].sort((a, b) => 
      parseInt(b.total_collections) - parseInt(a.total_collections)
    )[0];

    const bestQuality = [...farmers].sort((a, b) => 
      (parseFloat(b.avg_rate) || 0) - (parseFloat(a.avg_rate) || 0)
    )[0];

    return NextResponse.json({
      success: true,
      stats: {
        topCollector: topCollector ? {
          farmer: {
            id: topCollector.id,
            farmerId: topCollector.farmer_id,
            farmerName: topCollector.farmer_name,
            societyName: topCollector.society_name
          },
          totalQuantity: parseFloat(topCollector.total_quantity) || 0
        } : null,
        bestFat: bestFat ? {
          farmer: {
            id: bestFat.id,
            farmerId: bestFat.farmer_id,
            farmerName: bestFat.farmer_name,
            societyName: bestFat.society_name
          },
          avgFat: parseFloat(bestFat.avg_fat) || 0
        } : null,
        bestSnf: bestSnf ? {
          farmer: {
            id: bestSnf.id,
            farmerId: bestSnf.farmer_id,
            farmerName: bestSnf.farmer_name,
            societyName: bestSnf.society_name
          },
          avgSnf: parseFloat(bestSnf.avg_snf) || 0
        } : null,
        topRevenue: topRevenue ? {
          farmer: {
            id: topRevenue.id,
            farmerId: topRevenue.farmer_id,
            farmerName: topRevenue.farmer_name,
            societyName: topRevenue.society_name
          },
          totalAmount: parseFloat(topRevenue.total_amount) || 0
        } : null,
        mostActive: mostActive ? {
          farmer: {
            id: mostActive.id,
            farmerId: mostActive.farmer_id,
            farmerName: mostActive.farmer_name,
            societyName: mostActive.society_name
          },
          totalCollections: parseInt(mostActive.total_collections) || 0
        } : null,
        bestQuality: bestQuality ? {
          farmer: {
            id: bestQuality.id,
            farmerId: bestQuality.farmer_id,
            farmerName: bestQuality.farmer_name,
            societyName: bestQuality.society_name
          },
          avgRate: parseFloat(bestQuality.avg_rate) || 0
        } : null
      }
    });

  } catch (error: any) {
    console.error('Error fetching farmer performance stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch performance statistics' },
      { status: 500 }
    );
  }
}
