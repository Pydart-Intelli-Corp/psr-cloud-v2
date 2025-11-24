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
      console.log(`Adding shift_type column to milk_sales table in ${schema}...`);
      
      // Check if column already exists
      const [results] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${schema}' 
        AND TABLE_NAME = 'milk_sales' 
        AND COLUMN_NAME = 'shift_type'
      `);

      if (results[0].count === 0) {
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schema}\`.milk_sales 
          ADD COLUMN \`shift_type\` VARCHAR(10) DEFAULT 'EV' AFTER \`sales_time\`
        `);
        
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schema}\`.milk_sales 
          ADD INDEX \`idx_shift_type\` (\`shift_type\`)
        `);
        
        console.log(`✅ Added shift_type column to milk_sales table in ${schema}`);
      } else {
        console.log(`ℹ️  shift_type column already exists in ${schema}.milk_sales`);
      }
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
      console.log(`Removing shift_type column from milk_sales table in ${schema}...`);
      
      // Check if column exists before dropping
      const [results] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${schema}' 
        AND TABLE_NAME = 'milk_sales' 
        AND COLUMN_NAME = 'shift_type'
      `);

      if (results[0].count > 0) {
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schema}\`.milk_sales 
          DROP INDEX \`idx_shift_type\`
        `);
        
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schema}\`.milk_sales 
          DROP COLUMN \`shift_type\`
        `);
        
        console.log(`✅ Removed shift_type column from milk_sales table in ${schema}`);
      } else {
        console.log(`ℹ️  shift_type column does not exist in ${schema}.milk_sales`);
      }
    }
  }
};
