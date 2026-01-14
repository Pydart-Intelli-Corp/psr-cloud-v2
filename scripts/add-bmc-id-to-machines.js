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

async function addBmcIdColumn() {
  try {
    console.log('🔄 Starting migration: Add bmc_id to machines tables...\n');

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

      // Check if bmc_id column already exists
      const [columns] = await sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = '${schemaName}' 
         AND TABLE_NAME = 'machines' 
         AND COLUMN_NAME = 'bmc_id'`
      );

      if (columns.length === 0) {
        // Add bmc_id column
        await sequelize.query(
          `ALTER TABLE \`${schemaName}\`.machines 
           ADD COLUMN bmc_id INT NULL AFTER society_id`
        );

        // Add foreign key constraint
        try {
          await sequelize.query(
            `ALTER TABLE \`${schemaName}\`.machines 
             ADD CONSTRAINT fk_machines_bmc_${schemaName.replace(/[^a-zA-Z0-9]/g, '_')} 
             FOREIGN KEY (bmc_id) REFERENCES \`${schemaName}\`.bmcs(id) 
             ON DELETE SET NULL ON UPDATE CASCADE`
          );
        } catch (err) {
          console.log(`   ⚠️  Foreign key constraint skipped (may already exist)`);
        }

        // Add index
        try {
          await sequelize.query(
            `ALTER TABLE \`${schemaName}\`.machines 
             ADD INDEX idx_bmc_id (bmc_id)`
          );
        } catch (err) {
          console.log(`   ⚠️  Index skipped (may already exist)`);
        }

        console.log(`   ✅ Added bmc_id column to ${schemaName}.machines`);
        updated++;
      } else {
        console.log(`   ⏭️  bmc_id column already exists`);
        skipped++;
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Updated: ${updated} schemas`);
    console.log(`   Skipped: ${skipped} schemas (already had bmc_id)`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addBmcIdColumn();
