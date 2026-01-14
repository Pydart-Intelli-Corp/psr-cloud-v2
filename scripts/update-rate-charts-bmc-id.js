/**
 * Add bmc_id column to rate_charts table in ALL admin schemas
 * This allows BMC-assigned charts to be independent of societies
 * 
 * Usage: node scripts/update-rate-charts-bmc-id.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateRateChartsBmcId() {
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

    // Get all admin schemas
    const [schemas] = await connection.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'psr_v4_main')
      AND TABLE_NAME = 'rate_charts'
      ORDER BY TABLE_SCHEMA
    `);

    console.log(`\n📊 Found ${schemas.length} admin schemas with rate_charts table\n`);

    for (const { TABLE_SCHEMA: schemaName } of schemas) {
      console.log(`\n🔧 Processing schema: ${schemaName}`);
      
      try {
        // Check if bmc_id column already exists
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'rate_charts' 
          AND COLUMN_NAME = 'bmc_id'
        `, [schemaName]);

        if (columns.length > 0) {
          console.log(`  ℹ️  Column bmc_id already exists, skipping`);
          continue;
        }

        // Step 1: Make society_id nullable
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.rate_charts 
          MODIFY COLUMN society_id INT NULL COMMENT 'Reference to societies table (for society-assigned charts)'
        `);
        console.log(`  ✅ Made society_id nullable`);

        // Step 2: Add bmc_id column
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.rate_charts 
          ADD COLUMN bmc_id INT NULL COMMENT 'Reference to bmcs table (for BMC-assigned charts)' AFTER society_id
        `);
        console.log(`  ✅ Added bmc_id column`);

        // Step 3: Add foreign key constraint
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.rate_charts 
          ADD CONSTRAINT fk_rate_charts_bmc 
          FOREIGN KEY (bmc_id) REFERENCES \`${schemaName}\`.bmcs(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log(`  ✅ Added foreign key constraint`);

        // Step 4: Add index
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.rate_charts 
          ADD INDEX idx_bmc_id (bmc_id)
        `);
        console.log(`  ✅ Added index on bmc_id`);

        // Step 5: Drop old unique constraint if exists
        try {
          await connection.query(`
            ALTER TABLE \`${schemaName}\`.rate_charts 
            DROP INDEX unique_society_channel_assignment
          `);
          console.log(`  ✅ Dropped old unique constraint`);
        } catch (error) {
          console.log(`  ℹ️  Unique constraint not found or already dropped`);
        }

        console.log(`  ✅ Schema ${schemaName} updated successfully`);
      } catch (error) {
        console.error(`  ❌ Error processing schema ${schemaName}: ${error.message}`);
      }
    }

    console.log('\n✅ All admin schemas processed!');
    console.log('\n📈 BMC-assigned rate charts can now be stored independently of societies.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateRateChartsBmcId()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
