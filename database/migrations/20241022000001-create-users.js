'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        validate: {
          isEmail: true
        },
        comment: 'User email address'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hashed password'
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User first name'
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User last name'
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
        allowNull: false,
        defaultValue: 'farmer',
        comment: 'User role in hierarchy'
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'pending',
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
      companyAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Company address'
      },
      companyPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Company phone number'
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Add indexes for better performance
    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['uid']);
    await queryInterface.addIndex('Users', ['role']);
    await queryInterface.addIndex('Users', ['status']);
    await queryInterface.addIndex('Users', ['parentId']);
    await queryInterface.addIndex('Users', ['isEmailVerified']);
    await queryInterface.addIndex('Users', ['emailVerificationToken']);
    await queryInterface.addIndex('Users', ['passwordResetToken']);
    await queryInterface.addIndex('Users', ['createdAt']);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};