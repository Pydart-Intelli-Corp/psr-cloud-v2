'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove companyPhone column
    await queryInterface.removeColumn('Users', 'companyPhone');
    
    // Rename companyAddress to a temporary name first
    await queryInterface.renameColumn('Users', 'companyAddress', 'companyAddress_old');
    
    // Add new company address fields
    await queryInterface.addColumn('Users', 'companyPincode', {
      type: Sequelize.STRING(10),
      allowNull: true,
      after: 'companyName'
    });
    
    await queryInterface.addColumn('Users', 'companyCity', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'companyPincode'
    });
    
    await queryInterface.addColumn('Users', 'companyState', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'companyCity'
    });
    
    // Remove old companyAddress column
    await queryInterface.removeColumn('Users', 'companyAddress_old');
  },

  async down(queryInterface, Sequelize) {
    // Remove new company fields
    await queryInterface.removeColumn('Users', 'companyPincode');
    await queryInterface.removeColumn('Users', 'companyCity');
    await queryInterface.removeColumn('Users', 'companyState');
    
    // Add back old companyAddress field
    await queryInterface.addColumn('Users', 'companyAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'companyName'
    });
    
    // Add back companyPhone field
    await queryInterface.addColumn('Users', 'companyPhone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'companyAddress'
    });
  }
};