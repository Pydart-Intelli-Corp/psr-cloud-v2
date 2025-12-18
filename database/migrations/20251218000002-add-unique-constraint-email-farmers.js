'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all active admin users with their dbKey from users table
      const [admins] = await queryInterface.sequelize.query(
        `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL AND status = 'active'`
      );

      console.log(`🔒 Adding UNIQUE constraint to email column in ${admins.length} admin schemas...`);

      // Add unique constraint to email column in each admin schema
      for (const admin of admins) {
        // Generate schema name same way as createAdminSchema function
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        
        try {
          // Check if the unique constraint already exists
          const [constraints] = await queryInterface.sequelize.query(
            `SELECT CONSTRAINT_NAME 
             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'farmers' 
             AND CONSTRAINT_TYPE = 'UNIQUE'
             AND CONSTRAINT_NAME LIKE '%email%'`,
            { replacements: [schemaName] }
          );

          if (constraints.length === 0) {
            // Check for duplicate emails before adding constraint
            const [duplicates] = await queryInterface.sequelize.query(
              `SELECT email, COUNT(*) as count 
               FROM \`${schemaName}\`.\`farmers\` 
               WHERE email IS NOT NULL AND email != ''
               GROUP BY email 
               HAVING COUNT(*) > 1`,
              { replacements: [] }
            );

            if (duplicates.length > 0) {
              console.log(`  ⚠️  Warning: ${duplicates.length} duplicate email(s) found in ${schemaName}.farmers`);
              console.log(`     Duplicates:`, duplicates.map(d => `${d.email} (${d.count} times)`).join(', '));
              console.log(`     Skipping constraint addition. Please resolve duplicates first.`);
              continue;
            }

            // Add unique constraint to email column
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`farmers\` 
               ADD UNIQUE KEY \`unique_email\` (\`email\`)`
            );
            console.log(`  ✅ Added UNIQUE constraint to email in ${schemaName}.farmers`);
          } else {
            console.log(`  ⏭️  UNIQUE constraint already exists on email in ${schemaName}.farmers`);
          }
        } catch (error) {
          console.error(`  ❌ Error adding UNIQUE constraint to ${schemaName}.farmers:`, error.message);
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

      console.log(`🔒 Removing UNIQUE constraint from email column in ${admins.length} admin schemas...`);

      // Remove unique constraint from email column in each admin schema
      for (const admin of admins) {
        // Generate schema name same way as createAdminSchema function
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        
        try {
          // Check if the unique constraint exists
          const [constraints] = await queryInterface.sequelize.query(
            `SELECT CONSTRAINT_NAME 
             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'farmers' 
             AND CONSTRAINT_TYPE = 'UNIQUE'
             AND CONSTRAINT_NAME = 'unique_email'`,
            { replacements: [schemaName] }
          );

          if (constraints.length > 0) {
            // Remove unique constraint from email column
            await queryInterface.sequelize.query(
              `ALTER TABLE \`${schemaName}\`.\`farmers\` 
               DROP INDEX \`unique_email\``
            );
            console.log(`  ✅ Removed UNIQUE constraint from email in ${schemaName}.farmers`);
          } else {
            console.log(`  ⏭️  UNIQUE constraint doesn't exist on email in ${schemaName}.farmers`);
          }
        } catch (error) {
          console.error(`  ❌ Error removing UNIQUE constraint from ${schemaName}.farmers:`, error.message);
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
