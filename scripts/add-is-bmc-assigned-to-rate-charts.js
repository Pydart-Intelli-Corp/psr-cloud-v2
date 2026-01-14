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

async function addIsBmcAssignedColumn() {
  try {
    console.log('🔄 Starting migration: Add is_bmc_assigned to rate_charts tables...\n');

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

      // Check if is_bmc_assigned column already exists
      const [columns] = await sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = '${schemaName}' 
         AND TABLE_NAME = 'rate_charts' 
         AND COLUMN_NAME = 'is_bmc_assigned'`
      );

      if (columns.length === 0) {
        // Add is_bmc_assigned column
        await sequelize.query(
          `ALTER TABLE \`${schemaName}\`.rate_charts 
           ADD COLUMN is_bmc_assigned TINYINT(1) DEFAULT 0 AFTER status`
        );

        console.log(`   ✅ Added is_bmc_assigned column to ${schemaName}.rate_charts`);
        updated++;
      } else {
        console.log(`   ⏭️  is_bmc_assigned column already exists`);
        skipped++;
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Updated: ${updated} schemas`);
    console.log(`   Skipped: ${skipped} schemas (already had is_bmc_assigned)`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addIsBmcAssignedColumn();
