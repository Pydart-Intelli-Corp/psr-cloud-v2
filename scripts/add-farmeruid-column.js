/**
 * Script to add farmeruid column to all existing farmers tables
 * Run this once to update all admin schemas with farmeruid support
 * 
 * Usage: node scripts/add-farmeruid-column.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || '168.231.121.19',
  user: process.env.DB_USER || 'psr_admin',
  password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
  database: process.env.DB_NAME || 'psr_v4_main',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_HOST?.includes('azure') ? {
    rejectUnauthorized: false
  } : undefined
};

// Console logging utilities
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  step: (msg) => console.log(`\n🔧 ${msg}\n`),
  data: (msg) => console.log(`📊 ${msg}`)
};

async function addFarmeridColumnToFarmers() {
  let connection;
  
  try {
    log.info(`Connecting to database: ${DB_CONFIG.database}`);
    
    // Create connection
    connection = await mysql.createConnection(DB_CONFIG);
    
    log.success('Connected to database successfully');

    // Get all admin schemas
    log.step('Fetching all admin schemas');
    
    const [schemas] = await connection.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE (
        TABLE_SCHEMA LIKE '%\\_db\\_%' OR 
        TABLE_SCHEMA LIKE 'db_%' OR
        TABLE_SCHEMA LIKE '%\\_PSR%' OR
        TABLE_SCHEMA LIKE '%\\_psr%' OR
        TABLE_SCHEMA REGEXP '^[a-zA-Z0-9]+_[A-Z]{3}[0-9]{4}$'
      )
      AND TABLE_SCHEMA != 'information_schema'
      AND TABLE_SCHEMA != 'performance_schema'
      AND TABLE_SCHEMA != 'mysql'
      AND TABLE_SCHEMA != 'sys'
      AND TABLE_SCHEMA != 'psr_v4_main'
      ORDER BY TABLE_SCHEMA
    `);

    const adminSchemas = schemas.map(s => s.TABLE_SCHEMA);
    log.data(`Found ${adminSchemas.length} admin schemas`);

    if (adminSchemas.length === 0) {
      log.warning('No admin schemas found. Nothing to update.');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each schema
    for (const schemaName of adminSchemas) {
      try {
        log.info(`Processing schema: ${schemaName}`);

        // Check if farmers table exists
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers'
        `, [schemaName]);

        if (tables.length === 0) {
          log.warning(`  Farmers table not found in ${schemaName} - skipping`);
          skipCount++;
          continue;
        }

        // Check if farmeruid column already exists
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'farmers' 
          AND COLUMN_NAME = 'farmeruid'
        `, [schemaName]);

        if (columns.length > 0) {
          log.warning(`  farmeruid column already exists in ${schemaName} - skipping`);
          skipCount++;
          continue;
        }

        // Add farmeruid column
        log.info(`  Adding farmeruid column...`);
        
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.\`farmers\` 
          ADD COLUMN \`farmeruid\` VARCHAR(100) UNIQUE NULL COMMENT 'Unique identifier for farmer' AFTER \`farmer_id\`,
          ADD INDEX \`idx_farmeruid\` (\`farmeruid\`)
        `);

        log.success(`  Added farmeruid column to ${schemaName}.farmers`);
        successCount++;

      } catch (error) {
        log.error(`  Failed to process ${schemaName}: ${error.message}`);
        errorCount++;
      }
    }

    // Print summary
    log.step('Migration Summary');
    log.data(`Total schemas: ${adminSchemas.length}`);
    log.success(`Successfully updated: ${successCount}`);
    log.warning(`Skipped (already exist): ${skipCount}`);
    log.error(`Failed: ${errorCount}`);

    if (errorCount === 0) {
      log.success('\n🎉 All schemas processed successfully!');
    } else {
      log.warning(`\n⚠️  ${errorCount} schemas failed. Please review the errors above.`);
    }

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log.info('Database connection closed');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  addFarmeridColumnToFarmers()
    .then(() => {
      console.log('\n✨ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = addFarmeridColumnToFarmers;
