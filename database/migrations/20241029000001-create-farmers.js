'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farmer_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      rf_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      farmer_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '12345678'
      },
      contact_number: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      sms_enabled: {
        type: Sequelize.ENUM('ON', 'OFF'),
        defaultValue: 'OFF',
        allowNull: false
      },
      bonus: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      bank_account_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      ifsc_code: {
        type: Sequelize.STRING(11),
        allowNull: true
      },
      society_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended', 'maintenance'),
        defaultValue: 'active',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('farmers', ['farmer_id']);
    await queryInterface.addIndex('farmers', ['rf_id']);
    await queryInterface.addIndex('farmers', ['society_id']);
    await queryInterface.addIndex('farmers', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('farmers');
  }
};