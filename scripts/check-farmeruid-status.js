/**
 * Script to verify and report on farmeruid column status across all schemas
 * Helps identify which schemas have the column and which don't
 * 
 * Usage: node scripts/check-farmeruid-status.js
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
  step: (msg) => console.log(`\n🔍 ${msg}\n`),
  data: (msg) => console.log(`📊 ${msg}`)
};

async function checkFarmeridStatus() {
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
      log.warning('No admin schemas found.');
      return;
    }

    // Check each schema for farmeruid column
    const schemaStatus = [];
    let withColumn = 0;
    let withoutColumn = 0;
    let noFarmersTable = 0;

    log.step(`Checking farmeruid column status in ${adminSchemas.length} schemas`);

    for (const schemaName of adminSchemas) {
      try {
        // Check if farmers table exists
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers'
        `, [schemaName]);

        if (tables.length === 0) {
          schemaStatus.push({
            schema: schemaName,
            status: 'NO_TABLE',
            message: 'Farmers table not found'
          });
          noFarmersTable++;
          continue;
        }

        // Check if farmeruid column exists
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'farmers' 
          AND COLUMN_NAME = 'farmeruid'
        `, [schemaName]);

        if (columns.length > 0) {
          const col = columns[0];
          schemaStatus.push({
            schema: schemaName,
            status: 'HAS_COLUMN',
            type: col.COLUMN_TYPE,
            nullable: col.IS_NULLABLE === 'YES' ? 'YES' : 'NO',
            key: col.COLUMN_KEY || 'UNI'
          });
          withColumn++;
        } else {
          schemaStatus.push({
            schema: schemaName,
            status: 'MISSING_COLUMN',
            message: 'farmeruid column not found'
          });
          withoutColumn++;
        }

      } catch (error) {
        schemaStatus.push({
          schema: schemaName,
          status: 'ERROR',
          message: error.message
        });
      }
    }

    // Print results
    log.step('Status Report');
    
    console.table(schemaStatus);

    log.step('Summary');
    log.success(`Schemas with farmeruid: ${withColumn}`);
    log.warning(`Schemas without farmeruid: ${withoutColumn}`);
    log.error(`Schemas without farmers table: ${noFarmersTable}`);

    // Check for missing farmeruid entries in tables that have the column
    if (withColumn > 0) {
      log.step('Checking for NULL farmeruid values');
      
      for (const schema of adminSchemas) {
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers'
        `, [schema.schemaName]);

        if (tables.length > 0) {
          const [cols] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers' AND COLUMN_NAME = 'farmeruid'
          `, [schema]);

          if (cols.length > 0) {
            const [rows] = await connection.query(`
              SELECT COUNT(*) as count FROM \`${schema}\`.\`farmers\` WHERE \`farmeruid\` IS NULL
            `);

            if (rows[0].count > 0) {
              log.warning(`  ${schema}: ${rows[0].count} farmers with NULL farmeruid`);
            }
          }
        }
      }
    }

    log.success('\n✨ Status check completed!');

  } catch (error) {
    log.error(`Status check failed: ${error.message}`);
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
  checkFarmeridStatus()
    .then(() => {
      console.log('\n✨ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = checkFarmeridStatus;
