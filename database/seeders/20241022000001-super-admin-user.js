'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async up(queryInterface, Sequelize) {
    // Hash the super admin password
    const hashedPassword = await bcrypt.hash('psr@2025', 12);
    
    // Generate unique UID for super admin
    const uid = `PSR_SUPER_${Date.now()}`;

    await queryInterface.bulkInsert('users', [
      {
        uid: uid,
        email: 'admin@poornasreeequipments.com',
        password: hashedPassword,
        fullName: 'Super Administrator',
        role: 'super_admin',
        status: 'active',
        dbKey: null,
        companyName: 'Poornasree Equipments Cloud',
        companyPincode: '560001',
        companyCity: 'Bangalore',
        companyState: 'Karnataka',
        parentId: null,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        otpCode: null,
        otpExpires: null,
        lastLogin: null,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@poornasreeequipments.com'
    }, {});
  }
};