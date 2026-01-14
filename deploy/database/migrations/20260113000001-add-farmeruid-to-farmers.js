'use strict';

/**
 * Migration: Add farmeruid column to farmers table
 * 
 * Purpose: Add a unique identifier column for farmers across all admin schemas
 * 
 * Date: 2026-01-13
 * 
 * This is a production deployment migration that will be run during deployment
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all active admin users with their dbKey from users table
      const [admins] = await queryInterface.sequelize.query(
        `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL AND status = 'active'`
      );

      console.log(`🔧 Adding farmeruid column to farmers table in ${admins.length} admin schemas...`);

      // Add farmeruid column to farmers table in each admin schema
      for (const admin of admins) {
        // Generate schema name same way as createAdminSchema function
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        
        try {
          // Check if the column already exists
          const [columns] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'farmers' 
             AND COLUMN_NAME = 'farmeruid'`,
            { replacements: [schemaName] }
          );

          if (columns.length === 0) {
            // Column doesn't exist, add it
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`farmers\` 
               ADD COLUMN \`farmeruid\` VARCHAR(100) UNIQUE NULL AFTER \`farmer_id\`,
               ADD INDEX \`idx_farmeruid\` (\`farmeruid\`)`
            );
            console.log(`  ✅ Added farmeruid column to ${schemaName}.farmers`);
          } else {
            console.log(`  ⏭️  farmeruid column already exists in ${schemaName}.farmers`);
          }
        } catch (error) {
          console.error(`  ❌ Error adding farmeruid column to ${schemaName}.farmers:`, error.message);
          // Continue with other schemas even if one fails
        }
      }

      console.log(`✅ Migration completed successfully!`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Get all active admin users with their dbKey from users table
      const [admins] = await queryInterface.sequelize.query(
        `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
      );

      console.log(`📧 Removing farmeruid column from farmers table in ${admins.length} admin schemas...`);

      // Remove farmeruid column from farmers table in each admin schema
      for (const admin of admins) {
        // Generate schema name same way as createAdminSchema function
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        
        try {
          // Check if the column exists
          const [columns] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'farmers' 
             AND COLUMN_NAME = 'farmeruid'`,
            { replacements: [schemaName] }
          );

          if (columns.length > 0) {
            // Column exists, remove it
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`farmers\` 
               DROP INDEX \`idx_farmeruid\`,
               DROP COLUMN \`farmeruid\``
            );
            console.log(`  ✅ Removed farmeruid column from ${schemaName}.farmers`);
          } else {
            console.log(`  ⏭️  farmeruid column doesn't exist in ${schemaName}.farmers`);
          }
        } catch (error) {
          console.error(`  ❌ Error removing farmeruid column from ${schemaName}.farmers:`, error.message);
          // Continue with other schemas even if one fails
        }
      }

      console.log(`✅ Rollback completed successfully!`);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
