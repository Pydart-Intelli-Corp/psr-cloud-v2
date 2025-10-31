'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove companyPhone column
    await queryInterface.removeColumn('users', 'companyPhone');
    
    // Rename companyAddress to a temporary name first
    await queryInterface.renameColumn('users', 'companyAddress', 'companyAddress_old');
    
    // Add new company address fields
    await queryInterface.addColumn('users', 'companyPincode', {
      type: Sequelize.STRING(10),
      allowNull: true,
      after: 'companyName'
    });
    
    await queryInterface.addColumn('users', 'companyCity', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'companyPincode'
    });
    
    await queryInterface.addColumn('users', 'companyState', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'companyCity'
    });
    
    // Remove old companyAddress column
    await queryInterface.removeColumn('users', 'companyAddress_old');
  },

  async down(queryInterface, Sequelize) {
    // Remove new company fields
    await queryInterface.removeColumn('users', 'companyPincode');
    await queryInterface.removeColumn('users', 'companyCity');
    await queryInterface.removeColumn('users', 'companyState');
    
    // Add back old companyAddress field
    await queryInterface.addColumn('users', 'companyAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'companyName'
    });
    
    // Add back companyPhone field
    await queryInterface.addColumn('users', 'companyPhone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'companyAddress'
    });
  }
};