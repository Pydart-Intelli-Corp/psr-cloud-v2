'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Copy existing ESP32 corrections (status=1) from machine_corrections to machine_corrections_from_machine
    
    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    console.log(`Found ${adminUsers.length} admin users`);

    // Copy data in each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Copying ESP32 correction data in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        
        // Check if both tables exist
        const [oldTable] = await queryInterface.sequelize.query(
          "SHOW TABLES LIKE 'machine_corrections'"
        );
        const [newTable] = await queryInterface.sequelize.query(
          "SHOW TABLES LIKE 'machine_corrections_from_machine'"
        );
        
        if (oldTable.length > 0 && newTable.length > 0) {
          // Copy ESP32 corrections (status=1) to new table
          const [result] = await queryInterface.sequelize.query(`
            INSERT INTO machine_corrections_from_machine 
            (machine_id, society_id, machine_type,
             channel1_fat, channel1_snf, channel1_clr, channel1_temp, channel1_water, channel1_protein,
             channel2_fat, channel2_snf, channel2_clr, channel2_temp, channel2_water, channel2_protein,
             channel3_fat, channel3_snf, channel3_clr, channel3_temp, channel3_water, channel3_protein,
             created_at, updated_at)
            SELECT 
             machine_id, society_id, machine_type,
             channel1_fat, channel1_snf, channel1_clr, channel1_temp, channel1_water, channel1_protein,
             channel2_fat, channel2_snf, channel2_clr, channel2_temp, channel2_water, channel2_protein,
             channel3_fat, channel3_snf, channel3_clr, channel3_temp, channel3_water, channel3_protein,
             created_at, updated_at
            FROM machine_corrections
            WHERE status = 1
          `);
          
          console.log(`✅ Copied ${result.affectedRows || 0} ESP32 correction records in ${schemaName}`);
        } else {
          console.log(`⚠️ One or both tables not found in ${schemaName}`);
        }
      } catch (error) {
        console.error(`❌ Error copying data in ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
    
    console.log('✅ ESP32 correction data migration completed');
  },

  async down (queryInterface, Sequelize) {
    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    // Clear copied data from each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Clearing copied ESP32 correction data in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        await queryInterface.sequelize.query('DELETE FROM machine_corrections_from_machine WHERE 1=1');
        console.log(`✅ Cleared data in ${schemaName}`);
      } catch (error) {
        console.error(`❌ Error clearing data in ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
  }
};
