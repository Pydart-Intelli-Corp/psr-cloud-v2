'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bmcs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bmcId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dairyFarmId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Reference to dairy farm ID'
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Capacity in liters'
      },
      monthlyTarget: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Monthly target in liters'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contactPerson: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
        defaultValue: 'active',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('bmcs', ['bmcId'], {
      name: 'idx_bmcs_bmcId',
      unique: true
    });

    await queryInterface.addIndex('bmcs', ['dairyFarmId'], {
      name: 'idx_bmcs_dairyFarmId'
    });

    await queryInterface.addIndex('bmcs', ['status'], {
      name: 'idx_bmcs_status'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('bmcs');
  }
};
