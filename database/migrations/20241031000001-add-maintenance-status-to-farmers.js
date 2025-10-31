'use strict';

module.exports = {
  async up(queryInterface) {
    // Get all users with role 'admin' and their dbKey
    const [admins] = await queryInterface.sequelize.query(
      "SELECT id, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    for (const admin of admins) {
      const schemaName = admin.dbKey;
      
      try {
        // Check if farmers table exists in this schema
        const [tableExists] = await queryInterface.sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = '${schemaName}' AND table_name = 'farmers'
        `);

        if (tableExists[0].count > 0) {
          console.log(`Adding maintenance status to ${schemaName}.farmers`);
          
          // Add 'maintenance' to the status ENUM
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.farmers 
            MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
            DEFAULT 'active' NOT NULL
          `);
        } else {
          console.log(`Farmers table not found in schema ${schemaName}, skipping...`);
        }
      } catch (error) {
        console.error(`Error updating ${schemaName}.farmers:`, error.message);
        // Continue with other schemas even if one fails
      }
    }
  },

  async down(queryInterface) {
    // Get all users with role 'admin' and their dbKey
    const [admins] = await queryInterface.sequelize.query(
      "SELECT id, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    for (const admin of admins) {
      const schemaName = admin.dbKey;
      
      try {
        // Check if farmers table exists in this schema
        const [tableExists] = await queryInterface.sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = '${schemaName}' AND table_name = 'farmers'
        `);

        if (tableExists[0].count > 0) {
          console.log(`Removing maintenance status from ${schemaName}.farmers`);
          
          // Remove 'maintenance' from the status ENUM
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.farmers 
            MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval') 
            DEFAULT 'active' NOT NULL
          `);
        }
      } catch (error) {
        console.error(`Error reverting ${schemaName}.farmers:`, error.message);
      }
    }
  }
};