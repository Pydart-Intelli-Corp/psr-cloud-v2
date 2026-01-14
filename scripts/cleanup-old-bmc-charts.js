/**
 * Clean up old BMC-assigned charts that were stored with society_id
 * These should now use bmc_id instead
 * 
 * Usage: node scripts/cleanup-old-bmc-charts.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupOldBmcCharts() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '168.231.121.19',
      user: 'psr_admin',
      password: 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: 3306,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to database');

    const [schemas] = await connection.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'psr_v4_main')
      AND TABLE_NAME = 'rate_charts'
      ORDER BY TABLE_SCHEMA
    `);

    console.log(`\n📊 Found ${schemas.length} admin schemas\n`);

    for (const { TABLE_SCHEMA: schemaName } of schemas) {
      console.log(`\n🔧 Processing schema: ${schemaName}`);
      
      try {
        // Delete old BMC chart data
        await connection.query(`
          DELETE FROM \`${schemaName}\`.rate_chart_data
          WHERE rate_chart_id IN (
            SELECT id FROM \`${schemaName}\`.rate_charts
            WHERE is_bmc_assigned = 1 AND society_id IS NOT NULL AND bmc_id IS NULL
          )
        `);

        // Delete old BMC charts
        const [result] = await connection.query(`
          DELETE FROM \`${schemaName}\`.rate_charts
          WHERE is_bmc_assigned = 1 AND society_id IS NOT NULL AND bmc_id IS NULL
        `);

        console.log(`  ✅ Cleaned ${result.affectedRows} old BMC charts`);
      } catch (error) {
        console.error(`  ❌ Error processing schema ${schemaName}: ${error.message}`);
      }
    }

    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupOldBmcCharts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
