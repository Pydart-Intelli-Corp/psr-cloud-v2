/**
 * Migration Script: Add Rate Chart Tables
 * 
 * This script adds rate_charts and rate_chart_data tables to all existing admin schemas
 * 
 * Usage: node scripts/add-ratechart-tables.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('📁 Loading env from:', envPath);
dotenv.config({ path: envPath });

const dbConfig = {
  host: '168.231.121.19',
  port: 3306,
  user: 'psr_admin',
  password: 'PsrAdmin@20252!',
  database: 'psr_v4_main'
};

async function addRateChartTables() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');

    // Get all admin users
    const [adminUsers] = await connection.query(`
      SELECT id, fullName, dbKey, role
      FROM users
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    if (!Array.isArray(adminUsers) || adminUsers.length === 0) {
      console.log('⚠️  No admin users found with dbKey');
      return;
    }

    console.log(`📋 Found ${adminUsers.length} admin user(s)\n`);

    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`\n🔧 Processing schema: ${schemaName}`);
      console.log(`   Admin: ${admin.fullName} (${admin.dbKey})`);

      // Check if schema exists
      const [schemas] = await connection.query(`
        SELECT SCHEMA_NAME 
        FROM INFORMATION_SCHEMA.SCHEMATA 
        WHERE SCHEMA_NAME = ?
      `, [schemaName]);

      if (!Array.isArray(schemas) || schemas.length === 0) {
        console.log(`   ⚠️  Schema does not exist, skipping...`);
        continue;
      }

      // Check if rate_charts table already exists
      const [existingTables] = await connection.query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rate_charts'
      `, [schemaName]);

      if (Array.isArray(existingTables) && existingTables.length > 0) {
        console.log(`   ℹ️  Rate charts tables already exist, skipping...`);
        continue;
      }

      // Create rate_charts table
      console.log(`   📝 Creating rate_charts table...`);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_charts\` (
          \`id\` INT PRIMARY KEY AUTO_INCREMENT,
          \`society_id\` INT NOT NULL COMMENT 'Reference to societies table',
          \`channel\` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
          \`uploaded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`uploaded_by\` VARCHAR(255) NOT NULL COMMENT 'Admin user who uploaded',
          \`file_name\` VARCHAR(255) NOT NULL COMMENT 'Original CSV file name',
          \`record_count\` INT NOT NULL DEFAULT 0 COMMENT 'Number of rate records',
          FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE KEY \`unique_society_channel\` (\`society_id\`, \`channel\`),
          INDEX \`idx_society_id\` (\`society_id\`),
          INDEX \`idx_channel\` (\`channel\`),
          INDEX \`idx_uploaded_at\` (\`uploaded_at\`)
        )
      `);

      // Create rate_chart_data table
      console.log(`   📝 Creating rate_chart_data table...`);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_chart_data\` (
          \`id\` INT PRIMARY KEY AUTO_INCREMENT,
          \`rate_chart_id\` INT NOT NULL COMMENT 'Reference to rate_charts table',
          \`clr\` DECIMAL(5,2) NOT NULL COMMENT 'Color/Degree value',
          \`fat\` DECIMAL(5,2) NOT NULL COMMENT 'Fat percentage',
          \`snf\` DECIMAL(5,2) NOT NULL COMMENT 'Solids-Not-Fat percentage',
          \`rate\` DECIMAL(10,2) NOT NULL COMMENT 'Rate per liter',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (\`rate_chart_id\`) REFERENCES \`${schemaName}\`.\`rate_charts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          INDEX \`idx_rate_chart_id\` (\`rate_chart_id\`),
          INDEX \`idx_clr_fat_snf\` (\`clr\`, \`fat\`, \`snf\`)
        )
      `);

      console.log(`   ✅ Rate chart tables created successfully!`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`✅ Rate chart tables added to ${adminUsers.length} schema(s)`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.sql) {
      console.error('   SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
addRateChartTables();
