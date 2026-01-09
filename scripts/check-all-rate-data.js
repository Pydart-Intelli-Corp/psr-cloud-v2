const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('psr_v4_main', 'tester', 'Tester@123', {
  host: 'psr-v4.mysql.database.azure.com',
  port: 3306,
  dialect: 'mysql',
  dialectOptions: {
    ssl: { rejectUnauthorized: true }
  },
  logging: false
});

async function checkAllRateData() {
  try {
    console.log('🔍 Checking ALL rate charts in ali_ali2657...\n');

    // Get all rate charts
    const [allCharts] = await sequelize.query(`
      SELECT 
        rc.id,
        rc.society_id,
        s.name as society_name,
        rc.channel,
        rc.shared_chart_id,
        rc.file_name,
        rc.record_count
      FROM ali_ali2657.rate_charts rc
      LEFT JOIN ali_ali2657.societies s ON rc.society_id = s.id
      ORDER BY rc.id
    `);

    console.log(`📊 Found ${allCharts.length} total rate chart(s):\n`);
    
    for (const chart of allCharts) {
      console.log(`Chart ID ${chart.id}:`);
      console.log(`  Society: ${chart.society_name} (ID: ${chart.society_id})`);
      console.log(`  Channel: ${chart.channel}`);
      console.log(`  Shared Chart ID: ${chart.shared_chart_id || 'None (Master)'}`);
      console.log(`  File: ${chart.file_name}`);
      console.log(`  Record Count: ${chart.record_count}`);
      
      // Check actual data count
      const dataChartId = chart.shared_chart_id || chart.id;
      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) as actual_count
        FROM ali_ali2657.rate_chart_data
        WHERE rate_chart_id = ?
      `, { replacements: [dataChartId] });
      
      console.log(`  Actual Data Rows: ${countResult[0].actual_count}`);
      console.log('');
    }

    // Check if there are orphaned data rows
    const [orphaned] = await sequelize.query(`
      SELECT rate_chart_id, COUNT(*) as count
      FROM ali_ali2657.rate_chart_data
      GROUP BY rate_chart_id
    `);

    console.log('\n📋 Data distribution by chart ID:');
    orphaned.forEach(o => {
      console.log(`  Chart ID ${o.rate_chart_id}: ${o.count} rows`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAllRateData();
