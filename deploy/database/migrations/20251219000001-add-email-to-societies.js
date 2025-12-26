'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all active admin users with their dbKey from users table
      const [admins] = await queryInterface.sequelize.query(
        `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL AND status = 'active'`
      );

      console.log(`📧 Adding email column to societies table in ${admins.length} admin schemas...`);

      // Add email column to societies table in each admin schema
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
             AND TABLE_NAME = 'societies' 
             AND COLUMN_NAME = 'email'`,
            { replacements: [schemaName] }
          );

          if (columns.length === 0) {
            // Column doesn't exist, add it
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`societies\` 
               ADD COLUMN \`email\` VARCHAR(255) NOT NULL AFTER \`contact_phone\``
            );
            console.log(`  ✅ Added email column to ${schemaName}.societies`);
          } else {
            console.log(`  ⏭️  Email column already exists in ${schemaName}.societies`);
          }
        } catch (error) {
          console.error(`  ❌ Error adding email column to ${schemaName}.societies:`, error.message);
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

      console.log(`📧 Removing email column from societies table in ${admins.length} admin schemas...`);

      // Remove email column from societies table in each admin schema
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
             AND TABLE_NAME = 'societies' 
             AND COLUMN_NAME = 'email'`,
            { replacements: [schemaName] }
          );

          if (columns.length > 0) {
            // Column exists, remove it
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`societies\` 
               DROP COLUMN \`email\``
            );
            console.log(`  ✅ Removed email column from ${schemaName}.societies`);
          } else {
            console.log(`  ⏭️  Email column doesn't exist in ${schemaName}.societies`);
          }
        } catch (error) {
          console.error(`  ❌ Error removing email column from ${schemaName}.societies:`, error.message);
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