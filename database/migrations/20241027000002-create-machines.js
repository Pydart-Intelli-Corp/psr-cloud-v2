'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('machinetype', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      machine_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Machine type/model identifier'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Optional description of the machine type'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this machine type is active'
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

    // Add indexes
    await queryInterface.addIndex('machinetype', {
      unique: true,
      fields: ['machine_type'],
      name: 'idx_machinetype_machine_type_unique'
    });

    await queryInterface.addIndex('machinetype', {
      fields: ['is_active'],
      name: 'idx_machinetype_is_active'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('machinetype');
  }
};