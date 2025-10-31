'use strict';

module.exports = {
  async up(queryInterface) {
    // Add 'maintenance' to the AdminSchemas table status ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE AdminSchemas 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'maintenance') 
      DEFAULT 'active' NOT NULL
    `);
  },

  async down(queryInterface) {
    // Remove 'maintenance' from the AdminSchemas table status ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE AdminSchemas 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended') 
      DEFAULT 'active' NOT NULL
    `);
  }
};