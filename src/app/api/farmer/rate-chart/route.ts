import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('societyId');
    const dbKey = searchParams.get('dbKey');

    if (!societyId || !dbKey) {
      return NextResponse.json(
        { success: false, message: 'Society ID and DB Key are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching rate charts for society ${societyId} in schema ${dbKey}`);

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Query all active rate charts for the society (all channels)
    const [results] = await sequelize.query(`
      SELECT 
        id,
        shared_chart_id,
        channel,
        uploaded_at as uploadedAt,
        uploaded_by as uploadedBy,
        file_name as fileName,
        record_count as recordCount,
        status
      FROM \`${dbKey}\`.rate_charts
      WHERE society_id = ?
      ORDER BY channel ASC, uploaded_at DESC
    `, { 
      replacements: [societyId]
    });

    const rateCharts = Array.isArray(results) ? results : (results ? [results] : []);
    
    console.log(`📋 Found ${rateCharts.length} rate chart records for society ${societyId}`);
    if (rateCharts.length > 0) {
      console.log('📋 Rate charts details:', rateCharts.map((c: any) => ({
        id: c.id,
        channel: c.channel,
        sharedChartId: c.shared_chart_id,
        fileName: c.fileName
      })));
    }

    if (rateCharts.length === 0) {
      console.log(`⚠️ No rate charts found for society ${societyId} in schema ${dbKey}`);
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No rate charts found for this society'
      });
    }

    // Fetch rate data for each chart
    const chartsWithData = await Promise.all(
      rateCharts.map(async (chart: any) => {
        // Use the shared_chart_id if it exists, otherwise use the chart's own id
        const dataChartId = chart.shared_chart_id || chart.id;
        
        console.log(`📊 Fetching rate data for chart ${chart.id} (${chart.channel}), using data from chart ${dataChartId}`);
        
        const [rateData] = await sequelize.query(`
          SELECT 
            clr,
            fat,
            snf,
            rate
          FROM \`${dbKey}\`.rate_chart_data
          WHERE rate_chart_id = ?
          ORDER BY fat ASC, snf ASC
        `, {
          replacements: [dataChartId]
        });

        const rateDataArray = Array.isArray(rateData) ? rateData : [];
        console.log(`✅ Retrieved ${rateDataArray.length} rate records for chart ${chart.id}`);
        console.log(`📊 Rate data type: ${typeof rateData}, Is array: ${Array.isArray(rateData)}`);
        if (rateDataArray.length > 0) {
          console.log(`📊 First 3 records:`, rateDataArray.slice(0, 3));
          console.log(`📊 Last 3 records:`, rateDataArray.slice(-3));
        }

        return {
          id: chart.id,
          channel: chart.channel,
          uploadedAt: chart.uploadedAt,
          uploadedBy: chart.uploadedBy,
          fileName: chart.fileName,
          recordCount: chart.recordCount,
          status: chart.status,
          isShared: chart.shared_chart_id !== null,
          rateData: rateDataArray
        };
      })
    );

    console.log(`✅ Retrieved ${chartsWithData.length} rate charts for society ${societyId}`);
    console.log(`📊 Total rate records across all charts: ${chartsWithData.reduce((sum, c) => sum + (c.rateData?.length || 0), 0)}`);

    return NextResponse.json({
      success: true,
      data: chartsWithData
    });

  } catch (error: any) {
    console.error('❌ Error fetching rate chart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch rate chart',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
