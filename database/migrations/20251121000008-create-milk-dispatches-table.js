'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminSchemas = [
      'poornasreeequipments_poo5382',
      'babumongopi_bab1568',
      'tishnu_tis1353',
      'laddu_lad6879',
      'dasha_das2089',
      'desha_des2613'
    ];

    for (const schema of adminSchemas) {
      console.log(`Creating milk_dispatches table in ${schema}...`);
      
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`${schema}\`.milk_dispatches (
          \`id\` INT PRIMARY KEY AUTO_INCREMENT,
          \`dispatch_id\` VARCHAR(50) NOT NULL,
          \`society_id\` INT NOT NULL,
          \`machine_id\` INT NOT NULL,
          \`dispatch_date\` DATE,
          \`dispatch_time\` TIME,
          \`shift_type\` ENUM('morning', 'evening') NOT NULL,
          \`channel\` VARCHAR(50) DEFAULT 'COW',
          \`fat_percentage\` DECIMAL(5,2),
          \`snf_percentage\` DECIMAL(5,2),
          \`clr_value\` DECIMAL(5,2) DEFAULT 0,
          \`quantity\` DECIMAL(10,2) DEFAULT 0,
          \`rate_per_liter\` DECIMAL(10,2),
          \`total_amount\` DECIMAL(10,2),
          \`machine_type\` VARCHAR(100),
          \`machine_version\` VARCHAR(50),
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_dispatch_id\` (\`dispatch_id\`),
          INDEX \`idx_society_id\` (\`society_id\`),
          INDEX \`idx_machine_id\` (\`machine_id\`),
          INDEX \`idx_dispatch_date\` (\`dispatch_date\`),
          INDEX \`idx_dispatch_time\` (\`dispatch_time\`),
          INDEX \`idx_shift_type\` (\`shift_type\`),
          INDEX \`idx_channel\` (\`channel\`),
          INDEX \`idx_created_at\` (\`created_at\`),
          UNIQUE KEY \`unique_dispatch\` (\`dispatch_id\`, \`society_id\`, \`machine_id\`, \`dispatch_date\`, \`dispatch_time\`, \`shift_type\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log(`✅ Created milk_dispatches table in ${schema}`);
    }
  },

  async down(queryInterface, Sequelize) {
    const adminSchemas = [
      'poornasreeequipments_poo5382',
      'babumongopi_bab1568',
      'tishnu_tis1353',
      'laddu_lad6879',
      'dasha_das2089',
      'desha_des2613'
    ];

    for (const schema of adminSchemas) {
      console.log(`Dropping milk_dispatches table from ${schema}...`);
      
      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS \`${schema}\`.milk_dispatches
      `);
      
      console.log(`✅ Dropped milk_dispatches table from ${schema}`);
    }
  }
};
