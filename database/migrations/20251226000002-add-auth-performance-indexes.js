'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Adding performance indexes for auth operations...');
      
      // Helper function to check if index exists
      const indexExists = async (tableName, indexName) => {
        const [results] = await queryInterface.sequelize.query(
          `SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`,
          { transaction }
        );
        return results.length > 0;
      };
      
      // Helper to safely add index
      const safelyAddIndex = async (table, columns, options) => {
        const exists = await indexExists(table, options.name);
        if (exists) {
          console.log(`⚠️ Index ${options.name} already exists, skipping`);
          return;
        }
        await queryInterface.addIndex(table, columns, { ...options, transaction });
        console.log(`✅ Added index ${options.name}`);
      };
      
      // Check and add email index (UNIQUE) - most important for login
      await safelyAddIndex('users', ['email'], {
        name: 'idx_users_email',
        unique: true
      });
      
      // Add composite index on email + status for filtered queries
      await safelyAddIndex('users', ['email', 'status'], {
        name: 'idx_users_email_status'
      });
      
      // Add index on role for role-based filtering
      await safelyAddIndex('users', ['role'], {
        name: 'idx_users_role'
      });
      
      // Add index on status for status-based filtering
      await safelyAddIndex('users', ['status'], {
        name: 'idx_users_status'
      });
      
      // Add index on dbKey for schema lookups
      await safelyAddIndex('users', ['dbKey'], {
        name: 'idx_users_db_key'
      });
      
      // Add index on passwordResetToken for password reset flows
      await safelyAddIndex('users', ['passwordResetToken'], {
        name: 'idx_users_password_reset_token'
      });
      
      // Add index on emailVerificationToken for email verification
      await safelyAddIndex('users', ['emailVerificationToken'], {
        name: 'idx_users_email_verification_token'
      });
      
      // Add index on parentId for hierarchical queries
      await safelyAddIndex('users', ['parentId'], {
        name: 'idx_users_parent_id'
      });
      
      console.log('✅ Auth performance indexes completed successfully');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding auth performance indexes:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Removing auth performance indexes...');
      
      // Helper to check if index exists before removing
      const indexExists = async (tableName, indexName) => {
        const [results] = await queryInterface.sequelize.query(
          `SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`,
          { transaction }
        );
        return results.length > 0;
      };
      
      const safelyRemoveIndex = async (table, indexName) => {
        const exists = await indexExists(table, indexName);
        if (!exists) {
          console.log(`⚠️ Index ${indexName} doesn't exist, skipping removal`);
          return;
        }
        await queryInterface.removeIndex(table, indexName, { transaction });
        console.log(`✅ Removed index ${indexName}`);
      };
      
      await safelyRemoveIndex('users', 'idx_users_parent_id');
      await safelyRemoveIndex('users', 'idx_users_email_verification_token');
      await safelyRemoveIndex('users', 'idx_users_password_reset_token');
      await safelyRemoveIndex('users', 'idx_users_db_key');
      await safelyRemoveIndex('users', 'idx_users_status');
      await safelyRemoveIndex('users', 'idx_users_role');
      await safelyRemoveIndex('users', 'idx_users_email_status');
      await safelyRemoveIndex('users', 'idx_users_email');
      
      console.log('✅ Auth performance indexes removed successfully');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing auth performance indexes:', error);
      throw error;
    }
  }
};
