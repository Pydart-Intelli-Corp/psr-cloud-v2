#!/usr/bin/env node

/**
 * Migration Script: Update dairy_farms table structure
 * Adds capacity, status, and monthly_target columns to existing dairy_farms tables
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: {
    ca: readFileSync(join(__dirname, '..', 'DigiCertGlobalRootCA.crt.pem')),
    rejectUnauthorized: false,
    require: true
  },
  multipleStatements: true
};

async function updateDairySchema() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully\n');

    // Get all users with admin role and dbKey
    console.log('📋 Fetching admin users...');
    const [admins] = await connection.execute(
      'SELECT id, fullName, dbKey FROM users WHERE role = ? AND dbKey IS NOT NULL',
      ['admin']
    );

    if (!admins.length) {
      console.log('⚠️  No admin users found with schemas');
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s) with schemas\n`);

    // Update each admin's dairy_farms table
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`📦 Processing schema: ${schemaName}`);

      try {
        // Check if dairy_farms table exists
        const [tables] = await connection.execute(
          `SHOW TABLES FROM \`${schemaName}\` LIKE 'dairy_farms'`
        );

        if (!tables.length) {
          console.log(`   ⚠️  dairy_farms table not found, skipping...`);
          continue;
        }

        // Check existing columns
        const [columns] = await connection.execute(
          `SHOW COLUMNS FROM \`${schemaName}\`.\`dairy_farms\``
        );

        const existingColumns = columns.map(col => col.Field);

        // Add capacity column if not exists
        if (!existingColumns.includes('capacity')) {
          console.log(`   ➕ Adding 'capacity' column...`);
          await connection.execute(
            `ALTER TABLE \`${schemaName}\`.\`dairy_farms\` 
             ADD COLUMN \`capacity\` INT DEFAULT 5000 
             COMMENT 'Storage capacity in liters' 
             AFTER \`email\``
          );
        }

        // Add status column if not exists
        if (!existingColumns.includes('status')) {
          console.log(`   ➕ Adding 'status' column...`);
          await connection.execute(
            `ALTER TABLE \`${schemaName}\`.\`dairy_farms\` 
             ADD COLUMN \`status\` ENUM('active', 'inactive', 'maintenance') 
             DEFAULT 'active' 
             AFTER \`capacity\``
          );
        }

        // Add monthly_target column if not exists
        if (!existingColumns.includes('monthly_target')) {
          console.log(`   ➕ Adding 'monthly_target' column...`);
          await connection.execute(
            `ALTER TABLE \`${schemaName}\`.\`dairy_farms\` 
             ADD COLUMN \`monthly_target\` INT DEFAULT 5000 
             COMMENT 'Monthly production target in liters' 
             AFTER \`status\``
          );
        }

        // Set default values for existing records
        console.log(`   🔄 Updating existing records with default values...`);
        await connection.execute(
          `UPDATE \`${schemaName}\`.\`dairy_farms\` 
           SET capacity = COALESCE(capacity, 5000),
               status = COALESCE(status, 'active'),
               monthly_target = COALESCE(monthly_target, 5000)
           WHERE capacity IS NULL OR status IS NULL OR monthly_target IS NULL`
        );

        console.log(`   ✅ Schema updated successfully\n`);

      } catch (error) {
        console.error(`   ❌ Error updating schema ${schemaName}:`, error.message);
        console.log('');
      }
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
updateDairySchema()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
