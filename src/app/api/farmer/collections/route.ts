import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const dbKey = searchParams.get('dbKey');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!farmerId || !dbKey) {
      return NextResponse.json(
        { success: false, message: 'Farmer ID and DB Key are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching collections for farmer ${farmerId} in schema ${dbKey}`);
    if (dateFrom && dateTo) {
      console.log(`📅 Date range filter: ${dateFrom} to ${dateTo}`);
    }

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Build query with optional date filtering
    let whereClause = `WHERE farmer_id = ?`;
    const replacements: any[] = [farmerId];

    if (dateFrom && dateTo) {
      whereClause += ` AND collection_date BETWEEN ? AND ?`;
      replacements.push(dateFrom, dateTo);
    }

    // Query farmer's collection records
    const [results] = await sequelize.query(`
      SELECT 
        id,
        collection_date as collectionDate,
        collection_time as collectionTime,
        shift_type as shiftType,
        channel,
        quantity,
        fat_percentage as fatPercentage,
        snf_percentage as snfPercentage,
        clr_value as clrValue,
        rate_per_liter as ratePerLiter,
        total_amount as totalAmount,
        bonus,
        created_at as createdAt
      FROM \`${dbKey}\`.milk_collections
      ${whereClause}
      ORDER BY collection_date DESC, collection_time DESC
      LIMIT 500
    `, { 
      replacements
    });

    console.log('📊 Collections results type:', typeof results, 'Is array:', Array.isArray(results));
    const collections = Array.isArray(results) ? results : [];
    console.log(`✅ Retrieved ${collections.length} collection records for farmer ${farmerId}`);
    
    if (collections.length > 0) {
      const firstCollection = collections[0] as any;
      console.log('📊 Sample collection (first record):', {
        date: firstCollection.collectionDate,
        quantity: firstCollection.quantity,
        fat: firstCollection.fatPercentage,
        snf: firstCollection.snfPercentage,
        amount: firstCollection.totalAmount
      });
    }

    return NextResponse.json({
      success: true,
      data: collections,
      count: collections.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching farmer collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch collection records',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
