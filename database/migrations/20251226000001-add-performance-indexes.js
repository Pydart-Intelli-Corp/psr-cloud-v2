'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('ℹ️ Performance indexes for admin schemas will be added when schemas are created.');
    console.log('ℹ️ This migration is for admin-specific tables (dairy_farms, bmcs, societies, etc.)');
    console.log('ℹ️ Run scripts/add-admin-schema-indexes.js to add indexes to all admin schemas.');
    console.log('✅ Main database migration skipped - no changes needed.');
  },

  async down(queryInterface, Sequelize) {
    console.log('ℹ️ No changes to rollback in main database.');
  }
};
