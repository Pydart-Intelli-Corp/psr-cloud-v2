'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
        unique: true,
        comment: 'Unique identifier for the user'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'User email address'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hashed password'
      },
      fullName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'User full name'
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
        allowNull: false,
        defaultValue: 'farmer',
        comment: 'User role in hierarchy'
      },
      status: {
        type: Sequelize.ENUM('pending_approval', 'active', 'inactive', 'suspended', 'rejected'),
        allowNull: false,
        defaultValue: 'pending_approval',
        comment: 'User account status'
      },
      dbKey: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Database key for admin users (their dedicated schema)'
      },
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Company or organization name'
      },
      companyPincode: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Company pincode'
      },
      companyCity: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Company city'
      },
      companyState: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Company state'
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Reference to parent user in hierarchy'
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Email verification status'
      },
      emailVerificationToken: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'OTP for email verification'
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Email verification token expiry'
      },
      passwordResetToken: {
        type: Sequelize.STRING(64),
        allowNull: true,
        comment: 'Password reset token'
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Password reset token expiry'
      },
      otpCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'General purpose OTP code'
      },
      otpExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'OTP expiry timestamp'
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of failed login attempts'
      },
      lockUntil: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Account lock expiry timestamp'
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

    // Add indexes
    await queryInterface.addIndex('users', ['email'], { name: 'users_email' });
    await queryInterface.addIndex('users', ['uid'], { name: 'users_uid' });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role' });
    await queryInterface.addIndex('users', ['status'], { name: 'users_status' });
    await queryInterface.addIndex('users', ['parentId'], { name: 'users_parent_id' });
    await queryInterface.addIndex('users', ['isEmailVerified'], { name: 'users_is_email_verified' });
    await queryInterface.addIndex('users', ['emailVerificationToken'], { name: 'users_email_verification_token' });
    await queryInterface.addIndex('users', ['passwordResetToken'], { name: 'users_password_reset_token' });
    await queryInterface.addIndex('users', ['createdAt'], { name: 'users_created_at' });

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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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

    await queryInterface.addIndex('admin_schemas', ['adminId'], { name: 'admin_schemas_admin_id' });
    await queryInterface.addIndex('admin_schemas', ['schemaKey'], { name: 'admin_schemas_schema_key' });
    await queryInterface.addIndex('admin_schemas', ['status'], { name: 'admin_schemas_status' });

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
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'When the action occurred'
      }
    });

    await queryInterface.addIndex('audit_logs', ['userId'], { name: 'audit_logs_user_id' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'audit_logs_action' });
    await queryInterface.addIndex('audit_logs', ['resource'], { name: 'audit_logs_resource' });
    await queryInterface.addIndex('audit_logs', ['resourceId'], { name: 'audit_logs_resource_id' });
    await queryInterface.addIndex('audit_logs', ['timestamp'], { name: 'audit_logs_timestamp' });
    await queryInterface.addIndex('audit_logs', ['ipAddress'], { name: 'audit_logs_ip_address' });

    // Create otps table
    await queryInterface.createTable('otps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email address for OTP'
      },
      otpCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'OTP code'
      },
      purpose: {
        type: Sequelize.ENUM('email_verification', 'password_reset', 'login'),
        allowNull: false,
        comment: 'Purpose of the OTP'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'OTP expiry timestamp'
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether OTP has been used'
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

    await queryInterface.addIndex('otps', ['email'], { name: 'otps_email' });
    await queryInterface.addIndex('otps', ['otpCode'], { name: 'otps_otp_code' });
    await queryInterface.addIndex('otps', ['expiresAt'], { name: 'otps_expires_at' });

    // Create machinetype table
    await queryInterface.createTable('machinetype', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      machineType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        field: 'machine_type',
        comment: 'Type of milk testing machine'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of the machine type'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether this machine type is active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    await queryInterface.addIndex('machinetype', ['machine_type'], { name: 'idx_machine_type' });
    await queryInterface.addIndex('machinetype', ['is_active'], { name: 'idx_is_active' });

    // Insert default machine types
    await queryInterface.bulkInsert('machinetype', [
      {
        machine_type: 'Lactoscan',
        description: 'Lactoscan Milk Analyzer - Automatic milk testing equipment',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        machine_type: 'Milkotester',
        description: 'Milkotester - Ultrasonic milk analyzer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        machine_type: 'Ekomilk',
        description: 'Ekomilk Analyzer - Multi-parameter milk testing device',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        machine_type: 'Foss MilkoScan',
        description: 'Foss MilkoScan - Advanced milk composition analyzer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        machine_type: 'Bentley',
        description: 'Bentley Instruments - Laboratory milk analyzer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        machine_type: 'Manual Testing',
        description: 'Manual milk testing using traditional methods',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('machinetype');
    await queryInterface.dropTable('otps');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('admin_schemas');
    await queryInterface.dropTable('users');
  }
};

