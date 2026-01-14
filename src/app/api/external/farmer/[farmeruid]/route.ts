import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmeruid: string }> }
) {
  try {
    const { farmeruid } = await params;
    
    // Extract farmeruid from URL path as fallback
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const farmeruidFromPath = pathSegments[pathSegments.length - 1];
    
    const finalFarmeruid = farmeruid || farmeruidFromPath;
    
    console.log('URL:', request.url);
    console.log('Path segments:', pathSegments);
    console.log('Final farmeruid:', finalFarmeruid);

    if (!finalFarmeruid || finalFarmeruid.trim() === '') {
      return NextResponse.json(
        { error: 'Farmer UID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // Get all admin schemas to search across
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE '%_%' 
      AND TABLE_NAME = 'milk_collections'
      ORDER BY TABLE_SCHEMA
    `);
    
    const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
    
    // Search across all schemas for farmer in collections
    for (const schema of adminSchemas) {
      try {
        // First find farmer details from collections
        const farmerQuery = `
          SELECT DISTINCT
            f.farmer_id,
            f.farmeruid,
            f.name as farmername,
            f.society_id,
            s.name as societyname
          FROM \`${schema}\`.farmers f
          LEFT JOIN \`${schema}\`.societies s ON f.society_id = s.id
          WHERE f.farmeruid = ?
          LIMIT 1
        `;

        const [farmerResult] = await sequelize.query(farmerQuery, { replacements: [finalFarmeruid.trim()] });

        if (farmerResult && (farmerResult as any[]).length > 0) {
          const farmer = (farmerResult as any[])[0];
          
          // Get collection reports for this farmer
          const collectionsQuery = `
            SELECT 
              mc.id,
              mc.farmer_id,
              mc.collection_date,
              mc.collection_time,
              mc.shift_type,
              mc.channel,
              mc.fat_percentage,
              mc.snf_percentage,
              mc.clr_value,
              mc.protein_percentage,
              mc.lactose_percentage,
              mc.salt_percentage,
              mc.water_percentage,
              mc.temperature,
              mc.quantity,
              mc.rate_per_liter,
              mc.total_amount,
              mc.bonus,
              mc.machine_type,
              mc.machine_version,
              mc.created_at
            FROM \`${schema}\`.milk_collections mc
            WHERE mc.farmer_id = ? AND mc.society_id = ?
            ORDER BY mc.collection_date DESC, mc.collection_time DESC
            LIMIT 100
          `;

          const [collections] = await sequelize.query(collectionsQuery, { 
            replacements: [farmer.farmer_id, farmer.society_id] 
          });

          return NextResponse.json({
            success: true,
            data: {
              farmer: {
                farmerid: farmer.farmer_id,
                farmeruid: farmer.farmeruid,
                farmername: farmer.farmername,
                societyid: farmer.society_id,
                societyname: farmer.societyname
              },
              schema: schema,
              collections: collections,
              total_collections: (collections as any[]).length
            }
          });
        }
      } catch (schemaError) {
        console.log(`Schema ${schema} not accessible:`, schemaError);
        continue;
      }
    }

    return NextResponse.json(
      { error: 'Farmer not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching farmer by UID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}