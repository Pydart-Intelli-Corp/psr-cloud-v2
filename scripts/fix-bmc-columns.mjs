#!/usr/bin/env node

/**
 * Migration Script: Fix BMC table column names
 * Updates contact_person to contactPerson to match camelCase naming
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

async function fixBMCColumns() {
  try {
    console.log('🚀 Starting BMC column fix in admin schemas...\n');

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
        // Check if bmcs table exists
        const [tables] = await sequelize.query(
          `SHOW TABLES FROM \`${schemaName}\` LIKE 'bmcs'`
        );

        if (!tables || tables.length === 0) {
          console.log(`   ⚠️  bmcs table not found, skipping...`);
          continue;
        }

        // Get current columns
        const [columns] = await sequelize.query(
          `SHOW COLUMNS FROM \`${schemaName}\`.\`bmcs\``
        );

        const columnNames = columns.map(col => col.Field);

        // Check if we have the old column name
        if (columnNames.includes('contact_person')) {
          console.log(`   🔧 Renaming contact_person to contactPerson...`);
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`bmcs\` 
            CHANGE COLUMN \`contact_person\` \`contactPerson\` VARCHAR(255) NULL
          `);
          console.log(`   ✅ Column renamed successfully`);
        } else if (columnNames.includes('contactPerson')) {
          console.log(`   ✓ Column already uses correct name (contactPerson)`);
        } else {
          console.log(`   ➕ Adding contactPerson column...`);
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`bmcs\` 
            ADD COLUMN \`contactPerson\` VARCHAR(255) NULL AFTER \`location\`
          `);
          console.log(`   ✅ Column added successfully`);
        }

      } catch (schemaError) {
        console.error(`   ❌ Error updating schema ${schemaName}:`, schemaError.message);
        // Continue with next schema even if this one fails
      }
    }

    console.log('\n✅ BMC column fix completed!\n');

  } catch (error) {
    console.error('❌ Error during BMC column fix:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
fixBMCColumns()
  .then(() => {
    console.log('🎉 Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
