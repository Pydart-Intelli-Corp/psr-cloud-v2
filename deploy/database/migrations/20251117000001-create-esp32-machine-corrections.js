'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // This migration creates a new table for ESP32 machine corrections (from device)
    // Separate from admin-saved corrections in machine_corrections table
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS machine_corrections_from_machine (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machine_id INT NOT NULL COMMENT 'Machine database ID',
        society_id INT NOT NULL COMMENT 'Society database ID',
        machine_type VARCHAR(50) DEFAULT NULL COMMENT 'Machine type',
        
        -- Channel 1 (COW) corrections
        channel1_fat DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 1',
        channel1_snf DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 1',
        channel1_clr DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 1',
        channel1_temp DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 1',
        channel1_water DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 1',
        channel1_protein DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 1',
        
        -- Channel 2 (BUF) corrections
        channel2_fat DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 2',
        channel2_snf DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 2',
        channel2_clr DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 2',
        channel2_temp DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 2',
        channel2_water DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 2',
        channel2_protein DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 2',
        
        -- Channel 3 (MIX) corrections
        channel3_fat DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 3',
        channel3_snf DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 3',
        channel3_clr DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 3',
        channel3_temp DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 3',
        channel3_water DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 3',
        channel3_protein DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 3',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When correction was received from ESP32',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
        
        INDEX idx_machine_id (machine_id),
        INDEX idx_society_id (society_id),
        INDEX idx_created_at (created_at),
        INDEX idx_machine_society (machine_id, society_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
        COMMENT='Machine corrections from device - saved via SaveMachineCorrectionFromMachine endpoint';
    `;

    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    console.log(`Found ${adminUsers.length} admin users`);

    // Create table in each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Creating machine_corrections_from_machine table in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        await queryInterface.sequelize.query(createTableSQL);
        console.log(`✅ Created machine_corrections_from_machine in ${schemaName}`);
      } catch (error) {
        console.error(`❌ Error creating table in ${schemaName}:`, error.message);
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

    // Drop table from each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Dropping machine_corrections_from_machine from schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS machine_corrections_from_machine');
        console.log(`✅ Dropped machine_corrections_from_machine from ${schemaName}`);
      } catch (error) {
        console.error(`❌ Error dropping table from ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
  }
};
