'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Get all admin users to create tables in their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Creating machine_statistics tables...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Creating machine_statistics table in schema: ${schemaName}`);

      // Create machine_statistics table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machine_statistics\` (
          \`id\` INT PRIMARY KEY AUTO_INCREMENT,
          \`machine_id\` INT NOT NULL,
          \`society_id\` INT NOT NULL,
          \`machine_type\` VARCHAR(50),
          \`version\` VARCHAR(20),
          \`total_test\` INT DEFAULT 0 COMMENT 'Total number of tests performed (T parameter)',
          \`daily_cleaning\` INT DEFAULT 0 COMMENT 'Daily cleaning count (D parameter)',
          \`weekly_cleaning\` INT DEFAULT 0 COMMENT 'Weekly cleaning count (W parameter)',
          \`cleaning_skip\` INT DEFAULT 0 COMMENT 'Number of cleanings skipped (S parameter)',
          \`gain\` INT DEFAULT 0 COMMENT 'Gain value (G parameter)',
          \`auto_channel\` VARCHAR(20) COMMENT 'Auto channel status (ENABLE/DISABLE)',
          \`statistics_date\` DATE NOT NULL COMMENT 'Date when statistics were recorded',
          \`statistics_time\` TIME NOT NULL COMMENT 'Time when statistics were recorded',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.machines(\`id\`) ON DELETE CASCADE,
          FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.societies(\`id\`) ON DELETE CASCADE,
          INDEX idx_machine_id (\`machine_id\`),
          INDEX idx_society_id (\`society_id\`),
          INDEX idx_statistics_date (\`statistics_date\`),
          INDEX idx_created_at (\`created_at\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        COMMENT='Stores machine operational statistics including test counts, cleaning data, and performance metrics'
      `);

      console.log(`✅ Created machine_statistics table in ${schemaName}`);
    }

    console.log('✅ Migration completed successfully');
  },

  async down(queryInterface) {
    // Get all admin users to drop tables from their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Dropping machine_statistics tables...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Dropping machine_statistics table from schema: ${schemaName}`);

      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS \`${schemaName}\`.\`machine_statistics\`
      `);

      console.log(`✅ Dropped machine_statistics table from ${schemaName}`);
    }

    console.log('✅ Rollback completed successfully');
  }
};
