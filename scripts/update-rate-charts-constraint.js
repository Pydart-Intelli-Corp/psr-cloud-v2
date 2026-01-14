const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'psr_v4_main',
  process.env.DB_USER || 'psr_admin',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function updateRateChartsConstraint() {
  try {
    console.log('🔄 Starting migration: Update rate_charts unique constraint...\n');

    // Get all admin schemas
    const [schemas] = await sequelize.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA 
       WHERE SCHEMA_NAME LIKE '%\\_%' 
       AND SCHEMA_NAME NOT LIKE 'mysql%' 
       AND SCHEMA_NAME NOT LIKE 'information_schema%' 
       AND SCHEMA_NAME NOT LIKE 'performance_schema%'
       AND SCHEMA_NAME NOT LIKE 'sys%'
       AND SCHEMA_NAME != 'psr_v4_main'`
    );

    console.log(`📊 Found ${schemas.length} admin schemas to update\n`);

    let updated = 0;
    let skipped = 0;

    for (const schema of schemas) {
      const schemaName = schema.SCHEMA_NAME;
      console.log(`🔧 Processing schema: ${schemaName}`);

      try {
        // Drop old unique constraint
        await sequelize.query(
          `ALTER TABLE \`${schemaName}\`.rate_charts 
           DROP INDEX unique_society_channel`
        );
        console.log(`   ✅ Dropped old unique_society_channel constraint`);

        // Add new unique constraint including is_bmc_assigned
        await sequelize.query(
          `ALTER TABLE \`${schemaName}\`.rate_charts 
           ADD UNIQUE KEY unique_society_channel_assignment (society_id, channel, is_bmc_assigned)`
        );
        console.log(`   ✅ Added new unique_society_channel_assignment constraint`);
        updated++;
      } catch (err) {
        console.log(`   ⚠️  Schema ${schemaName} skipped: ${err.message}`);
        skipped++;
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Updated: ${updated} schemas`);
    console.log(`   Skipped: ${skipped} schemas`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

updateRateChartsConstraint();
