'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // This migration renames esp32_machine_corrections to machine_corrections_from_machine
    
    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    console.log(`Found ${adminUsers.length} admin users`);

    // Rename table in each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Renaming table in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        
        // Check if old table exists
        const [tables] = await queryInterface.sequelize.query(
          "SHOW TABLES LIKE 'esp32_machine_corrections'"
        );
        
        if (tables.length > 0) {
          // Rename the table
          await queryInterface.sequelize.query(
            'RENAME TABLE esp32_machine_corrections TO machine_corrections_from_machine'
          );
          console.log(`✅ Renamed table in ${schemaName}`);
        } else {
          console.log(`⚠️  Table esp32_machine_corrections not found in ${schemaName}`);
        }
      } catch (error) {
        console.error(`❌ Error renaming table in ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
  },

  async down (queryInterface, Sequelize) {
    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    // Rename table back in each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Reverting table rename in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        
        // Check if new table exists
        const [tables] = await queryInterface.sequelize.query(
          "SHOW TABLES LIKE 'machine_corrections_from_machine'"
        );
        
        if (tables.length > 0) {
          // Rename back
          await queryInterface.sequelize.query(
            'RENAME TABLE machine_corrections_from_machine TO esp32_machine_corrections'
          );
          console.log(`✅ Reverted table rename in ${schemaName}`);
        }
      } catch (error) {
        console.error(`❌ Error reverting table rename in ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
  }
};
