'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Update the status column enum to include pending_approval
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('pending', 'pending_approval', 'active', 'inactive', 'suspended') 
      DEFAULT 'pending'
    `);
  },

  down: async (queryInterface) => {
    // Revert back to original enum values
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('pending', 'active', 'inactive', 'suspended') 
      DEFAULT 'pending'
    `);
  }
};