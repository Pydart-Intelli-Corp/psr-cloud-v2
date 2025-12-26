/**
 * Add performance indexes to ALL admin schemas
 * Run this script after creating admin users to optimize queries
 * 
 * Usage: node scripts/add-admin-schema-indexes.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAdminSchemaIndexes() {
  let connection;
  
  try {
    // Connect to main database
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
      WHERE (TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE '%\\_db\\_%') 
      AND TABLE_NAME = 'dairy_farms'
      ORDER BY TABLE_SCHEMA
    `);

    console.log(`\n📊 Found ${schemas.length} admin schemas\n`);

    for (const { TABLE_SCHEMA: schemaName } of schemas) {
      console.log(`\n🔧 Processing schema: ${schemaName}`);
      
      try {
        // Check if indexes already exist to avoid errors
        const indexes = [
          { table: 'dairy_farms', column: 'status', name: 'idx_dairy_farms_status' },
          { table: 'bmcs', column: 'dairy_farm_id', name: 'idx_bmcs_dairy_farm_id' },
          { table: 'bmcs', column: 'status', name: 'idx_bmcs_status' },
          { table: 'societies', column: 'bmc_id', name: 'idx_societies_bmc_id' },
          { table: 'societies', column: 'status', name: 'idx_societies_status' },
          { table: 'farmers', column: 'society_id', name: 'idx_farmers_society_id' },
          { table: 'farmers', column: 'status', name: 'idx_farmers_status' },
          { table: 'milk_collections', columns: ['society_id', 'collection_date'], name: 'idx_milk_collections_society_date' },
          { table: 'milk_collections', column: 'collection_date', name: 'idx_milk_collections_date' },
          { table: 'milk_collections', column: 'farmer_id', name: 'idx_milk_collections_farmer_id' },
          { table: 'machines', column: 'society_id', name: 'idx_machines_society_id' },
          { table: 'machines', column: 'status', name: 'idx_machines_status' }
        ];

        for (const index of indexes) {
          try {
            // Check if table exists
            const [tables] = await connection.query(
              `SHOW TABLES FROM \`${schemaName}\` LIKE '${index.table}'`
            );
            
            if (tables.length === 0) {
              console.log(`  ⚠️  Table ${index.table} not found, skipping`);
              continue;
            }

            // Check if index exists
            const [existingIndexes] = await connection.query(
              `SHOW INDEX FROM \`${schemaName}\`.\`${index.table}\` WHERE Key_name = '${index.name}'`
            );

            if (existingIndexes.length > 0) {
              console.log(`  ℹ️  Index ${index.name} already exists on ${index.table}`);
              continue;
            }

            // Add index
            const columns = index.columns ? index.columns.join('`, `') : index.column;
            await connection.query(
              `ALTER TABLE \`${schemaName}\`.\`${index.table}\` ADD INDEX \`${index.name}\` (\`${columns}\`)`
            );
            
            console.log(`  ✅ Added index ${index.name} on ${index.table}`);
          } catch (error) {
            console.error(`  ❌ Error adding index ${index.name}: ${error.message}`);
          }
        }

        console.log(`  ✅ Schema ${schemaName} completed`);
      } catch (error) {
        console.error(`  ❌ Error processing schema ${schemaName}: ${error.message}`);
      }
    }

    console.log('\n✅ All admin schemas processed!');
    console.log('\n📈 Performance indexes have been added to optimize queries.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
addAdminSchemaIndexes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
