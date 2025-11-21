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
      console.log(`Creating milk_sales table in ${schema}...`);
      
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`${schema}\`.milk_sales (
          \`id\` INT PRIMARY KEY AUTO_INCREMENT,
          \`count\` VARCHAR(50) NOT NULL,
          \`society_id\` INT NOT NULL,
          \`machine_id\` INT NOT NULL,
          \`sales_date\` DATE,
          \`sales_time\` TIME,
          \`channel\` VARCHAR(50) DEFAULT 'COW',
          \`quantity\` DECIMAL(10,2) DEFAULT 0,
          \`rate_per_liter\` DECIMAL(10,2),
          \`total_amount\` DECIMAL(10,2),
          \`machine_type\` VARCHAR(100),
          \`machine_version\` VARCHAR(50),
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_count\` (\`count\`),
          INDEX \`idx_society_id\` (\`society_id\`),
          INDEX \`idx_machine_id\` (\`machine_id\`),
          INDEX \`idx_sales_date\` (\`sales_date\`),
          INDEX \`idx_sales_time\` (\`sales_time\`),
          INDEX \`idx_channel\` (\`channel\`),
          INDEX \`idx_created_at\` (\`created_at\`),
          UNIQUE KEY \`unique_sales\` (\`count\`, \`society_id\`, \`machine_id\`, \`sales_date\`, \`sales_time\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log(`✅ Created milk_sales table in ${schema}`);
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
      console.log(`Dropping milk_sales table from ${schema}...`);
      
      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS \`${schema}\`.milk_sales
      `);
      
      console.log(`✅ Dropped milk_sales table from ${schema}`);
    }
  }
};
