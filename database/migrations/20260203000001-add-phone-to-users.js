'use strict';

/**
 * Migration: Add phone column to users table
 * Date: February 3, 2026
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('\n🔄 Adding phone column to users table in psr_v4_main schema\n');

      // Check if column already exists in psr_v4_main.users
      const [columns] = await queryInterface.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'psr_v4_main' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'phone'
      `);

      if (columns.length === 0) {
        // Add phone column to users table
        await queryInterface.addColumn('users', 'phone', {
          type: Sequelize.STRING(20),
          allowNull: true,
          after: 'dbKey'
        });
        console.log('✅ Added phone column to psr_v4_main.users table');
      } else {
        console.log('⚠️  phone column already exists in psr_v4_main.users table');
      }

      console.log('\n✅ Migration completed successfully\n');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('\n🔄 Removing phone column from users table\n');

      // Check if column exists before removing
      const [columns] = await queryInterface.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'psr_v4_main' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'phone'
      `);

      if (columns.length > 0) {
        await queryInterface.removeColumn('users', 'phone');
        console.log('✅ Removed phone column from psr_v4_main.users table');
      } else {
        console.log('⚠️  phone column does not exist in psr_v4_main.users table');
      }

      console.log('\n✅ Rollback completed successfully\n');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
