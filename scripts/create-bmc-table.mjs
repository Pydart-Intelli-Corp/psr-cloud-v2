#!/usr/bin/env node

/**
 * Migration Script: Create bmcs table in all admin schemas
 * Adds the bmcs table structure to each admin's database schema
 */

import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'poornasree_cloud',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // For Azure MySQL
        ca: process.env.DB_SSL_CA ? fs.readFileSync(path.join(process.cwd(), process.env.DB_SSL_CA)) : undefined,
      },
      connectTimeout: 30000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 300000,
    }
  }
);

async function createBMCTable() {
  try {
    console.log('🚀 Starting BMC table creation in admin schemas...\n');

    // Get all admin users with dbKey
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM Users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    if (!admins || admins.length === 0) {
      console.log('⚠️  No admin users found with dbKey');
      return;
    }

    console.log(`📊 Found ${admins.length} admin schema(s) to update\n`);

    // Update each admin's schema
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`\n📦 Processing schema: ${schemaName}`);
      console.log(`   Admin: ${admin.fullName} (ID: ${admin.id})`);

      try {
        // Check if bmcs table already exists
        const [tables] = await sequelize.query(
          `SHOW TABLES FROM \`${schemaName}\` LIKE 'bmcs'`
        );

        if (tables && tables.length > 0) {
          console.log(`   ✓ bmcs table already exists, skipping...`);
          continue;
        }

        // Create bmcs table
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`bmcs\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`name\` VARCHAR(255) NOT NULL,
            \`bmc_id\` VARCHAR(100) NOT NULL,
            \`password\` VARCHAR(255) NOT NULL,
            \`dairy_farm_id\` INT NULL,
            \`capacity\` INT NULL COMMENT 'Capacity in liters',
            \`monthly_target\` INT NULL COMMENT 'Monthly target in liters',
            \`location\` VARCHAR(255) NULL,
            \`contactPerson\` VARCHAR(255) NULL,
            \`phone\` VARCHAR(50) NULL,
            \`email\` VARCHAR(255) NULL,
            \`status\` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`idx_bmcs_bmc_id\` (\`bmc_id\`),
            KEY \`idx_bmcs_dairy_farm_id\` (\`dairy_farm_id\`),
            KEY \`idx_bmcs_status\` (\`status\`),
            CONSTRAINT \`fk_bmcs_dairy_farm\` 
              FOREIGN KEY (\`dairy_farm_id\`) 
              REFERENCES \`${schemaName}\`.\`dairy_farms\` (\`id\`) 
              ON DELETE SET NULL 
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log(`   ✅ Successfully created bmcs table`);

      } catch (schemaError) {
        console.error(`   ❌ Error updating schema ${schemaName}:`, schemaError.message);
        // Continue with next schema even if this one fails
      }
    }

    console.log('\n✅ BMC table creation completed!\n');

  } catch (error) {
    console.error('❌ Error during BMC table creation:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
createBMCTable()
  .then(() => {
    console.log('🎉 Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
