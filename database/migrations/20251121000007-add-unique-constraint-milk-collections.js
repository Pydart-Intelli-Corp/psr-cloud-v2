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
      console.log(`Adding unique constraint to ${schema}.milk_collections...`);
      
      // Add unique constraint on farmer_id, society_id, machine_id, collection_date, collection_time, shift_type
      await queryInterface.sequelize.query(`
        ALTER TABLE \`${schema}\`.milk_collections
        ADD UNIQUE KEY \`unique_collection\` (\`farmer_id\`, \`society_id\`, \`machine_id\`, \`collection_date\`, \`collection_time\`, \`shift_type\`)
      `);
      
      console.log(`✅ Added unique constraint to ${schema}.milk_collections`);
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
      console.log(`Removing unique constraint from ${schema}.milk_collections...`);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE \`${schema}\`.milk_collections
        DROP KEY \`unique_collection\`
      `);
      
      console.log(`✅ Removed unique constraint from ${schema}.milk_collections`);
    }
  }
};
