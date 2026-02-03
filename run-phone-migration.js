#!/usr/bin/env node

/**
 * Run Migration: Add phone column to users table
 * Usage: node run-phone-migration.js
 */

const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('./config/database');

async function runMigration() {
  console.log('\n🚀 Starting phone column migration...\n');

  try {
    // Initialize Sequelize
    const sequelize = new Sequelize(
      config.development.database,
      config.development.username,
      config.development.password,
      {
        host: config.development.host,
        dialect: config.development.dialect,
        port: config.development.port,
        dialectOptions: config.development.dialectOptions,
        logging: false
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Load migration
    const migration = require('./database/migrations/20260203000001-add-phone-to-users.js');

    // Run migration
    await migration.up(sequelize.getQueryInterface(), Sequelize);

    console.log('\n✅ Migration completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
