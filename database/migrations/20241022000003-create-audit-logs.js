'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the action'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)'
      },
      resource: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Resource affected (USER, ADMIN_SCHEMA, etc.)'
      },
      resourceId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'ID of the affected resource'
      },
      oldValues: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Previous values (for updates)'
      },
      newValues: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'New values'
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the user'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string'
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'When the action occurred'
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('AuditLogs', ['userId']);
    await queryInterface.addIndex('AuditLogs', ['action']);
    await queryInterface.addIndex('AuditLogs', ['resource']);
    await queryInterface.addIndex('AuditLogs', ['resourceId']);
    await queryInterface.addIndex('AuditLogs', ['timestamp']);
    await queryInterface.addIndex('AuditLogs', ['ipAddress']);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuditLogs');
  }
};