'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin_schemas table to track dynamic schemas
    await queryInterface.createTable('AdminSchemas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to admin user'
      },
      schemaKey: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique schema identifier'
      },
      schemaName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Human readable schema name'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Schema status'
      },
      configuration: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Schema specific configuration'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('AdminSchemas', ['adminId']);
    await queryInterface.addIndex('AdminSchemas', ['schemaKey']);
    await queryInterface.addIndex('AdminSchemas', ['status']);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AdminSchemas');
  }
};