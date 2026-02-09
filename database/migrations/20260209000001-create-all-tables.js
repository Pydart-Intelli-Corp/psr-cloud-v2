'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
        allowNull: false,
        defaultValue: 'farmer'
      },
      status: {
        type: Sequelize.ENUM('pending', 'pending_approval', 'active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'pending_approval'
      },
      dbKey: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      companyPincode: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      companyCity: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      companyState: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailVerificationToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      otpCode: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      otpExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lockUntil: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes for users table
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['uid'], { name: 'idx_users_uid' });
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
    await queryInterface.addIndex('users', ['dbKey'], { name: 'idx_users_dbKey' });
    await queryInterface.addIndex('users', ['parentId'], { name: 'idx_users_parentId' });
    await queryInterface.addIndex('users', ['status'], { name: 'idx_users_status' });

    // Create admin_schemas table
    await queryInterface.createTable('admin_schemas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      dbKey: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      schemaName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add indexes for admin_schemas table
    await queryInterface.addIndex('admin_schemas', ['adminId'], { name: 'idx_admin_schemas_adminId' });
    await queryInterface.addIndex('admin_schemas', ['dbKey'], { name: 'idx_admin_schemas_dbKey' });

    // Create audit_logs table
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      entity: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entityId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for audit_logs table
    await queryInterface.addIndex('audit_logs', ['userId'], { name: 'idx_audit_userId' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'idx_audit_action' });
    await queryInterface.addIndex('audit_logs', ['entity'], { name: 'idx_audit_entity' });
    await queryInterface.addIndex('audit_logs', ['createdAt'], { name: 'idx_audit_createdAt' });

    // Create machines table
    await queryInterface.createTable('machines', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      machineId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      machineName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      machineType: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active'
      },
      lastSeen: {
        type: Sequelize.DATE,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      isMaster: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      bmcId: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    // Add indexes for machines table
    await queryInterface.addIndex('machines', ['machineId'], { name: 'idx_machines_machineId' });
    await queryInterface.addIndex('machines', ['adminId'], { name: 'idx_machines_adminId' });
    await queryInterface.addIndex('machines', ['status'], { name: 'idx_machines_status' });
    await queryInterface.addIndex('machines', ['bmcId'], { name: 'idx_machines_bmcId' });

    // Create machinetype table
    await queryInterface.createTable('machinetype', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      machine_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for machinetype table
    await queryInterface.addIndex('machinetype', ['machine_type'], { name: 'idx_machinetype_type', unique: true });
    await queryInterface.addIndex('machinetype', ['is_active'], { name: 'idx_machinetype_active' });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('machinetype');
    await queryInterface.dropTable('machines');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('admin_schemas');
    await queryInterface.dropTable('users');
  }
};
