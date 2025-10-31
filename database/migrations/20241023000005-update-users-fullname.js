'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if fullName column exists
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.fullName) {
      // Add fullName column
      await queryInterface.addColumn('users', 'fullName', {
        type: Sequelize.STRING(200),
        allowNull: true // Allow null initially for migration
      });
    }

    // Migrate existing data: combine firstName and lastName into fullName
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET fullName = CONCAT(COALESCE(firstName, ''), ' ', COALESCE(lastName, ''))
      WHERE firstName IS NOT NULL OR lastName IS NOT NULL AND (fullName IS NULL OR fullName = '')
    `);

    // Update fullName to not allow null and add validation
    await queryInterface.changeColumn('users', 'fullName', {
      type: Sequelize.STRING(200),
      allowNull: false
    });

    // Remove old columns if they exist (be careful with this in production!)
    if (tableInfo.firstName) {
      await queryInterface.removeColumn('users', 'firstName');
    }
    if (tableInfo.lastName) {
      await queryInterface.removeColumn('users', 'lastName');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back the old columns
    await queryInterface.addColumn('users', 'firstName', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'lastName', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Try to split fullName back into firstName and lastName (best effort)
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET 
        firstName = TRIM(SUBSTRING_INDEX(fullName, ' ', 1)),
        lastName = TRIM(SUBSTRING(fullName, LOCATE(' ', fullName) + 1))
      WHERE fullName IS NOT NULL
    `);

    // Remove fullName column
    await queryInterface.removeColumn('users', 'fullName');

    // Make firstName and lastName non-nullable
    await queryInterface.changeColumn('users', 'firstName', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'lastName', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
  }
};