/**
 * PSR Cloud V2 - Complete Database Reset Script
 * 
 * This script performs a COMPLETE database reset for a fresh start:
 * 1. Drops all admin schemas and their data
 * 2. Clears all main database tables
 * 3. Recreates the super admin user
 * 4. Seeds default machine types
 * 5. Resets the system to initial state
 * 
 * ⚠️  WARNING: This is DESTRUCTIVE and IRREVERSIBLE
 * ⚠️  All data will be permanently lost
 * 
 * Usage: node scripts/reset-database.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
  step: (msg) => console.log(`\n🔄 ${msg}\n`)
};

/**
 * Get all admin schemas from the database
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
 * Drop all admin schemas and their data
 */
async function dropAdminSchemas(connection) {
  log.step('STEP 1: Dropping all admin schemas');
  
  const schemas = await getAllAdminSchemas(connection);
  log.info(`Found ${schemas.length} admin schemas`);

  if (schemas.length === 0) {
    log.info('No admin schemas found to drop');
    return;
  }

  // Disable foreign key checks to avoid dependency issues
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const schema of schemas) {
    try {
      log.info(`Dropping schema: ${schema}`);
      await connection.query(`DROP SCHEMA IF EXISTS \`${schema}\``);
      log.success(`Dropped schema: ${schema}`);
    } catch (error) {
      log.error(`Failed to drop schema ${schema}: ${error.message}`);
    }
  }

  // Re-enable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  log.success(`Dropped ${schemas.length} admin schemas`);
}

/**
 * Get all tables in the main database
 */
async function getMainDatabaseTables(connection) {
  try {
    const [tables] = await connection.query(`SHOW TABLES FROM \`${DB_CONFIG.database}\``);
    return tables.map(t => Object.values(t)[0]);
  } catch (error) {
    log.error(`Failed to get main database tables: ${error.message}`);
    return [];
  }
}

/**
 * Clear all main database tables and remove admin infrastructure
 */
async function clearMainDatabaseTables(connection) {
  log.step('STEP 2: Clearing all main database tables and admin infrastructure');

  const tables = await getMainDatabaseTables(connection);
  log.info(`Found ${tables.length} tables in main database`);

  if (tables.length === 0) {
    log.info('No tables found in main database');
    return;
  }

  // Disable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  // First, completely remove admin-related tables
  const adminTables = ['admin_schemas', 'section_pulse', 'rate_charts', 'rate_chart_download_history'];
  
  for (const table of adminTables) {
    try {
      log.info(`Dropping admin table: ${table}`);
      await connection.query(`DROP TABLE IF EXISTS \`${DB_CONFIG.database}\`.\`${table}\``);
      log.success(`Dropped admin table: ${table}`);
    } catch (error) {
      log.warning(`Could not drop admin table ${table}: ${error.message}`);
    }
  }

  // Clear data from remaining core tables
  const coreTables = tables.filter(table => !adminTables.includes(table));
  
  for (const table of coreTables) {
    try {
      log.info(`Clearing table: ${table}`);
      await connection.query(`TRUNCATE TABLE \`${DB_CONFIG.database}\`.\`${table}\``);
      log.success(`Cleared table: ${table}`);
    } catch (error) {
      // If TRUNCATE fails (e.g., foreign key constraints), try DELETE
      try {
        log.warning(`TRUNCATE failed for ${table}, trying DELETE`);
        await connection.query(`DELETE FROM \`${DB_CONFIG.database}\`.\`${table}\``);
        log.success(`Cleared table with DELETE: ${table}`);
      } catch (deleteError) {
        log.error(`Failed to clear table ${table}: ${deleteError.message}`);
      }
    }
  }

  // Re-enable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  log.success(`Cleared/dropped ${tables.length} tables and removed all admin infrastructure`);
}

/**
 * Create super admin user
 */
async function createSuperAdmin(connection) {
  log.step('STEP 3: Creating Super Admin user');

  try {
    // Hash the super admin password
    const hashedPassword = await bcrypt.hash('psr@2025', 12);
    
    // Generate unique UID for super admin
    const uid = `PSR_SUPER_${Date.now()}`;

    await connection.query(`
      INSERT INTO users (
        uid, email, password, fullName, role, status, dbKey, 
        companyName, companyPincode, companyCity, companyState, 
        parentId, isEmailVerified, emailVerificationToken, 
        emailVerificationExpires, passwordResetToken, 
        passwordResetExpires, otpCode, otpExpires, lastLogin, 
        loginAttempts, lockUntil, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      uid,
      'admin@poornasreeequipments.com',
      hashedPassword,
      'Super Administrator',
      'super_admin',
      'active',
      null,
      'Poornasree Equipments Cloud',
      '560001',
      'Bangalore',
      'Karnataka',
      null,
      true,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null
    ]);

    log.success('Super Admin user created successfully');
    log.info('Email: admin@poornasreeequipments.com');
    log.info('Password: psr@2025');
  } catch (error) {
    log.error(`Failed to create Super Admin: ${error.message}`);
    throw error;
  }
}

/**
 * Create required tables if they don't exist
 */
async function createRequiredTables(connection) {
  log.step('Creating core system tables');

  const tables = [
    {
      name: 'machine_types',
      sql: `CREATE TABLE IF NOT EXISTS machine_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        specifications JSON,
        image_url VARCHAR(500) COMMENT 'URL path to machine image',
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name),
        INDEX idx_category (category),
        INDEX idx_isActive (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    }
    // Note: Deliberately NOT creating admin_schemas, section_pulse, rate_charts 
    // as they are part of admin infrastructure that should remain removed
  ];

  for (const table of tables) {
    try {
      log.info(`Creating table: ${table.name}`);
      await connection.query(table.sql);
      log.success(`Table ${table.name} created successfully`);
    } catch (error) {
      log.error(`Failed to create table ${table.name}: ${error.message}`);
    }
  }

  log.success('Core system tables creation completed');
}
/**
 * Seed default machine types
 */
async function seedMachineTypes(connection) {
  log.step('STEP 4: Seeding default machine types');

  // First ensure machine_types table exists
  await createRequiredTables(connection);

  const machineTypes = [
    {
      name: 'Milk Analyzer Pro',
      description: 'Professional milk composition analyzer with fat, protein, and SNF testing capabilities',
      category: 'analyzer',
      specifications: JSON.stringify({
        accuracy: '±0.1%',
        sampleVolume: '25ml',
        testingTime: '90 seconds',
        parameters: ['Fat', 'Protein', 'SNF', 'Density']
      }),
      isActive: true
    },
    {
      name: 'Ultrasonic Milk Analyzer',
      description: 'Advanced ultrasonic milk analyzer for comprehensive milk quality assessment',
      category: 'analyzer',
      specifications: JSON.stringify({
        technology: 'Ultrasonic',
        accuracy: '±0.05%',
        sampleVolume: '20ml',
        testingTime: '60 seconds',
        parameters: ['Fat', 'Protein', 'Lactose', 'SNF', 'Density', 'Water']
      }),
      isActive: true
    },
    {
      name: 'Portable Milk Tester',
      description: 'Compact portable device for on-field milk quality testing',
      category: 'portable',
      specifications: JSON.stringify({
        portability: 'Battery operated',
        weight: '2.5kg',
        accuracy: '±0.2%',
        sampleVolume: '30ml',
        testingTime: '120 seconds'
      }),
      isActive: true
    }
  ];

  try {
    for (const machineType of machineTypes) {
      await connection.query(`
        INSERT INTO machine_types (
          name, description, category, specifications, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        machineType.name,
        machineType.description,
        machineType.category,
        machineType.specifications,
        machineType.isActive
      ]);
      
      log.success(`Added machine type: ${machineType.name}`);
    }

    log.success(`Seeded ${machineTypes.length} default machine types`);
  } catch (error) {
    log.error(`Failed to seed machine types: ${error.message}`);
    throw error;
  }
}

/**
 * Verify reset completion
 */
async function verifyReset(connection) {
  log.step('STEP 5: Verifying complete reset');

  try {
    // Check admin schemas are gone
    const schemas = await getAllAdminSchemas(connection);
    log.info(`Remaining admin schemas: ${schemas.length}`);

    // Check that admin infrastructure tables are removed
    const removedTables = ['admin_schemas', 'section_pulse', 'rate_charts', 'rate_chart_download_history'];
    for (const table of removedTables) {
      try {
        await connection.query(`SELECT 1 FROM ${table} LIMIT 1`);
        log.warning(`Admin table ${table} still exists`);
      } catch (error) {
        log.success(`Admin table ${table} properly removed`);
      }
    }

    // Check main tables
    try {
      const [userCount] = await connection.query(`SELECT COUNT(*) as count FROM users`);
      log.info(`Users in database: ${userCount[0].count}`);
    } catch (error) {
      log.warning('Users table not accessible');
    }

    try {
      const [machineTypeCount] = await connection.query(`SELECT COUNT(*) as count FROM machine_types`);
      log.info(`Machine types in database: ${machineTypeCount[0].count}`);
    } catch (error) {
      log.warning('Machine types table not accessible');
    }

    // Check super admin
    try {
      const [superAdmin] = await connection.query(`
        SELECT email, role, status FROM users WHERE role = 'super_admin' LIMIT 1
      `);

      if (superAdmin.length > 0) {
        log.success('Super Admin verified successfully');
        log.info(`Super Admin email: ${superAdmin[0].email}`);
        log.info(`Super Admin status: ${superAdmin[0].status}`);
      } else {
        log.error('Super Admin not found after reset');
      }
    } catch (error) {
      log.error('Could not verify Super Admin');
    }

    log.success('Complete database reset verification completed');
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
  }
}

/**
 * Main reset function
 */
async function resetDatabase() {
  let connection;

  try {
    log.step('🚀 Starting PSR Cloud V2 Database Reset');
    log.warning('This will permanently delete ALL data from the database');
    log.warning('Press Ctrl+C within 10 seconds to cancel...');
    
    // 10-second countdown
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r⏳ Countdown: ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n');

    log.info('Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    log.success('Database connection established');

    // Execute reset steps
    await dropAdminSchemas(connection);
    await clearMainDatabaseTables(connection);
    await createSuperAdmin(connection);
    await seedMachineTypes(connection);
    await verifyReset(connection);

    log.step('✨ Complete database reset completed successfully!');
    log.success('System is now in fresh state with all admin infrastructure removed');
    log.info('You can now login with:');
    log.info('📧 Email: admin@poornasreeequipments.com');
    log.info('🔑 Password: psr@2025');
    log.warning('Note: Admin schema infrastructure has been completely removed');
    log.warning('New admin registrations will recreate necessary tables automatically');

  } catch (error) {
    log.error(`Database reset failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log.info('Database connection closed');
    }
  }
}

/**
 * Handle process termination
 */
process.on('SIGINT', () => {
  log.warning('\nDatabase reset cancelled by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.warning('\nDatabase reset terminated');
  process.exit(0);
});

// Run the reset
if (require.main === module) {
  resetDatabase().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { resetDatabase };