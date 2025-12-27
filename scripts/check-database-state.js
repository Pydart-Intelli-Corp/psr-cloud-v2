/**
 * PSR Cloud V2 - Database State Checker
 * 
 * This script analyzes the current database state and provides a comprehensive report:
 * 1. Checks main database tables and record counts
 * 2. Lists all admin schemas and their data
 * 3. Provides statistics about users, farmers, collections
 * 4. Identifies potential issues before reset
 * 
 * Usage: node scripts/check-database-state.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || '168.231.121.19',
  user: process.env.DB_USER || 'psr_admin',
  password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
  database: process.env.DB_NAME || 'psr_v4_main',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: {
    rejectUnauthorized: false
  }
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

/**
 * Get all admin schemas
 */
async function getAllAdminSchemas(connection) {
  try {
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
      ORDER BY TABLE_SCHEMA
    `);

    return schemas.map(s => s.TABLE_SCHEMA);
  } catch (error) {
    log.error(`Failed to get admin schemas: ${error.message}`);
    return [];
  }
}

/**
 * Check main database state
 */
async function checkMainDatabase(connection) {
  log.step('Checking Main Database State');

  try {
    // Get all tables in main database
    const [tables] = await connection.query(`SHOW TABLES FROM \`${DB_CONFIG.database}\``);
    log.data(`Total tables in main database: ${tables.length}`);

    // Check key tables and their record counts
    const keyTables = ['users', 'admin_schemas', 'machine_types', 'section_pulse', 'rate_charts'];
    
    for (const table of keyTables) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${DB_CONFIG.database}\`.\`${table}\``);
        log.data(`${table}: ${result[0].count} records`);
      } catch (error) {
        log.warning(`Table ${table} not found or inaccessible`);
      }
    }

    // Get user statistics
    try {
      const [userStats] = await connection.query(`
        SELECT 
          role,
          status,
          COUNT(*) as count
        FROM \`${DB_CONFIG.database}\`.\`users\`
        GROUP BY role, status
        ORDER BY role, status
      `);

      log.data('User Statistics:');
      for (const stat of userStats) {
        log.data(`  ${stat.role} (${stat.status}): ${stat.count}`);
      }
    } catch (error) {
      log.warning('Could not get user statistics');
    }

    // Check for super admin
    try {
      const [superAdmin] = await connection.query(`
        SELECT email, fullName, status, createdAt 
        FROM \`${DB_CONFIG.database}\`.\`users\` 
        WHERE role = 'super_admin'
      `);

      if (superAdmin.length > 0) {
        log.data('Super Admin Status:');
        for (const admin of superAdmin) {
          log.data(`  Email: ${admin.email}`);
          log.data(`  Name: ${admin.fullName}`);
          log.data(`  Status: ${admin.status}`);
          log.data(`  Created: ${admin.createdAt}`);
        }
      } else {
        log.warning('No Super Admin found in database');
      }
    } catch (error) {
      log.error('Could not check Super Admin status');
    }

    log.success('Main database check completed');
  } catch (error) {
    log.error(`Main database check failed: ${error.message}`);
  }
}

/**
 * Check admin schemas
 */
async function checkAdminSchemas(connection) {
  log.step('Checking Admin Schemas');

  const schemas = await getAllAdminSchemas(connection);
  log.data(`Total admin schemas: ${schemas.length}`);

  if (schemas.length === 0) {
    log.info('No admin schemas found');
    return;
  }

  let totalRecords = 0;
  const schemaStats = [];

  for (const schema of schemas) {
    try {
      log.data(`\nAnalyzing schema: ${schema}`);

      const tables = ['dairy_farms', 'bmcs', 'societies', 'farmers', 'machines', 'milk_collections', 'milk_dispatches', 'milk_sales'];
      const schemaData = { name: schema, tables: {} };

      for (const table of tables) {
        try {
          const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${schema}\`.\`${table}\``);
          const count = result[0].count;
          schemaData.tables[table] = count;
          totalRecords += count;
          log.data(`  ${table}: ${count} records`);
        } catch (error) {
          schemaData.tables[table] = 'N/A';
          log.data(`  ${table}: Table not found`);
        }
      }

      // Get recent activity
      try {
        const [recentActivity] = await connection.query(`
          SELECT MAX(created_at) as last_activity 
          FROM \`${schema}\`.\`milk_collections\`
        `);
        
        if (recentActivity[0].last_activity) {
          log.data(`  Last collection activity: ${recentActivity[0].last_activity}`);
        } else {
          log.data(`  Last collection activity: No activity`);
        }
      } catch (error) {
        log.data(`  Last collection activity: Unable to determine`);
      }

      schemaStats.push(schemaData);
    } catch (error) {
      log.error(`Error analyzing schema ${schema}: ${error.message}`);
    }
  }

  log.data(`\nTotal records across all admin schemas: ${totalRecords.toLocaleString()}`);
  log.success('Admin schemas check completed');

  return schemaStats;
}

/**
 * Check data integrity
 */
async function checkDataIntegrity(connection) {
  log.step('Checking Data Integrity');

  try {
    // Check if admin_schemas table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_schemas'
    `, [DB_CONFIG.database]);

    if (tables.length === 0) {
      log.success('Admin infrastructure completely removed - no admin_schemas table found');
      log.info('This is expected after complete reset - admin infrastructure will be recreated when needed');
      return;
    }

    // Check for orphaned records in main database
    const [orphanedSchemas] = await connection.query(`
      SELECT 
        s.schemaName,
        s.schemaKey,
        u.email,
        u.fullName,
        u.status
      FROM \`${DB_CONFIG.database}\`.\`admin_schemas\` s
      LEFT JOIN \`${DB_CONFIG.database}\`.\`users\` u ON s.adminId = u.id
      WHERE u.id IS NULL
    `);

    if (orphanedSchemas.length > 0) {
      log.warning(`Found ${orphanedSchemas.length} orphaned admin schemas without corresponding users`);
      for (const schema of orphanedSchemas) {
        log.warning(`  Schema: ${schema.schemaName} (${schema.schemaKey})`);
      }
    } else {
      log.success('No orphaned admin schemas found');
    }

    // Check for users without schemas
    const [usersWithoutSchemas] = await connection.query(`
      SELECT 
        u.email,
        u.fullName,
        u.role,
        u.dbKey
      FROM \`${DB_CONFIG.database}\`.\`users\` u
      LEFT JOIN \`${DB_CONFIG.database}\`.\`admin_schemas\` s ON u.id = s.adminId
      WHERE u.role = 'admin' AND s.id IS NULL
    `);

    if (usersWithoutSchemas.length > 0) {
      log.warning(`Found ${usersWithoutSchemas.length} admin users without corresponding schemas`);
      for (const user of usersWithoutSchemas) {
        log.warning(`  User: ${user.email} (${user.fullName}) - dbKey: ${user.dbKey}`);
      }
    } else {
      log.success('All admin users have corresponding schemas');
    }

  } catch (error) {
    log.error(`Data integrity check failed: ${error.message}`);
  }
}

/**
 * Estimate backup size
 */
async function estimateBackupSize(connection) {
  log.step('Estimating Backup Size');

  try {
    // Get main database size
    const [mainDbSize] = await connection.query(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [DB_CONFIG.database]);

    log.data(`Main database size: ~${mainDbSize[0].size_mb || 0} MB`);

    // Get admin schemas sizes
    const schemas = await getAllAdminSchemas(connection);
    let totalAdminSize = 0;

    for (const schema of schemas) {
      try {
        const [schemaSize] = await connection.query(`
          SELECT 
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
          FROM information_schema.tables 
          WHERE table_schema = ?
        `, [schema]);

        const sizeMb = schemaSize[0].size_mb || 0;
        totalAdminSize += sizeMb;
        log.data(`${schema}: ~${sizeMb} MB`);
      } catch (error) {
        log.warning(`Could not estimate size for schema ${schema}`);
      }
    }

    const totalSize = (mainDbSize[0].size_mb || 0) + totalAdminSize;
    log.data(`Total estimated backup size: ~${totalSize.toFixed(2)} MB`);

  } catch (error) {
    log.error(`Backup size estimation failed: ${error.message}`);
  }
}

/**
 * Generate reset impact summary
 */
function generateResetSummary(schemaStats) {
  log.step('Reset Impact Summary');

  log.warning('⚠️  RESET WILL PERMANENTLY DELETE:');
  
  // Count total data
  let totalUsers = 0;
  let totalFarmers = 0;
  let totalCollections = 0;
  let totalSocieties = 0;
  let totalMachines = 0;

  if (schemaStats) {
    for (const schema of schemaStats) {
      if (typeof schema.tables.farmers === 'number') totalFarmers += schema.tables.farmers;
      if (typeof schema.tables.milk_collections === 'number') totalCollections += schema.tables.milk_collections;
      if (typeof schema.tables.societies === 'number') totalSocieties += schema.tables.societies;
      if (typeof schema.tables.machines === 'number') totalMachines += schema.tables.machines;
    }
  }

  log.warning(`  📊 ${schemaStats?.length || 0} Admin Schemas`);
  log.warning(`  👥 ${totalFarmers.toLocaleString()} Farmers`);
  log.warning(`  🏭 ${totalSocieties.toLocaleString()} Societies`);
  log.warning(`  🤖 ${totalMachines.toLocaleString()} Machines`);
  log.warning(`  🥛 ${totalCollections.toLocaleString()} Milk Collection Records`);
  log.warning(`  📈 All Reports and Analytics Data`);

  log.info('\n✅ RESET WILL PRESERVE:');
  log.info('  🏗️  Database Structure (Tables & Schemas)');
  log.info('  📋 Migration History');
  log.info('  👤 Super Admin Account (recreated)');
  log.info('  🔧 Machine Type Definitions (reseeded)');

  log.warning('\n🚨 CRITICAL WARNINGS:');
  log.warning('  1. This operation is IRREVERSIBLE');
  log.warning('  2. ALL business data will be permanently lost');
  log.warning('  3. You will need to recreate all admin users');
  log.warning('  4. All farmers will need to re-register');
  log.warning('  5. Historical collection data cannot be recovered');

  log.info('\n💡 RECOMMENDATIONS:');
  log.info('  1. Create a complete backup before reset: npm run db:backup');
  log.info('  2. Export important reports and data manually');
  log.info('  3. Notify all users about the reset schedule');
  log.info('  4. Verify backup integrity before proceeding');
  log.info('  5. Have admin user registration ready for post-reset');
}

/**
 * Main check function
 */
async function checkDatabaseState() {
  let connection;

  try {
    log.step('🔍 PSR Cloud V2 Database State Analysis');
    log.info(`Target Database: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
    log.info('Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    log.success('Database connection established');

    // Perform all checks
    await checkMainDatabase(connection);
    const schemaStats = await checkAdminSchemas(connection);
    await checkDataIntegrity(connection);
    await estimateBackupSize(connection);
    
    // Generate impact summary
    generateResetSummary(schemaStats);

    log.step('✨ Database state analysis completed!');
    log.info('Review the above information carefully before proceeding with any reset operations.');

  } catch (error) {
    log.error(`Database state check failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log.info('Database connection closed');
    }
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseState().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { checkDatabaseState };