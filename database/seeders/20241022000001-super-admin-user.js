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

    await queryInterface.bulkInsert('Users', [
      {
        uid: uid,
        email: 'admin@poornasreeequipments.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Administrator',
        role: 'super_admin',
        status: 'active',
        dbKey: null,
        companyName: 'Poornasree Equipments Cloud',
        companyAddress: 'Headquarters, Main Office',
        companyPhone: '+91-9876543210',
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
    await queryInterface.bulkDelete('Users', {
      email: 'admin@poornasreeequipments.com'
    }, {});
  }
};