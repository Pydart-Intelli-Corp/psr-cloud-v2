const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('psr_v4_main', 'tester', 'Tester@123', {
  host: 'psr-v4.mysql.database.azure.com',
  port: 3306,
  dialect: 'mysql',
  dialectOptions: {
    ssl: { rejectUnauthorized: true }
  },
  logging: console.log
});

async function checkRateCharts() {
  try {
    console.log('🔍 Checking rate charts for society 2...\n');

    // Check rate_charts table
    const [charts] = await sequelize.query(`
      SELECT 
        id,
        society_id,
        channel,
        shared_chart_id,
        file_name,
        record_count,
        uploaded_at
      FROM ali_ali2657.rate_charts
      WHERE society_id = 2
    `);

    console.log(`📊 Found ${charts.length} rate chart(s) for society 2:`);
    charts.forEach(chart => {
      console.log(`  - Chart ID: ${chart.id}, Channel: ${chart.channel}, Shared: ${chart.shared_chart_id || 'No'}, Records: ${chart.record_count}, File: ${chart.file_name}`);
    });

    console.log('\n');

    // Check rate_chart_data for each chart
    for (const chart of charts) {
      const dataChartId = chart.shared_chart_id || chart.id;
      
      console.log(`📋 Checking rate data for chart ${chart.id} (using data from chart ${dataChartId})...`);
      
      const [rateData] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM ali_ali2657.rate_chart_data
        WHERE rate_chart_id = ?
      `, { replacements: [dataChartId] });

      console.log(`  ✅ Found ${rateData[0].count} rate records in rate_chart_data table`);

      // Get first 5 records as sample
      const [sample] = await sequelize.query(`
        SELECT fat, snf, clr, rate
        FROM ali_ali2657.rate_chart_data
        WHERE rate_chart_id = ?
        ORDER BY fat ASC, snf ASC
        LIMIT 5
      `, { replacements: [dataChartId] });

      console.log(`  Sample records (first 5):`);
      sample.forEach((r, i) => {
        console.log(`    ${i+1}. FAT: ${r.fat}, SNF: ${r.snf}, CLR: ${r.clr}, Rate: ₹${r.rate}`);
      });
      console.log('\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkRateCharts();
