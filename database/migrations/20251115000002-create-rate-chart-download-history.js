'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    console.log('📊 Creating rate_chart_download_history table in all admin schemas...');

    // Get all admin users with dbKey
    const [adminUsers] = await queryInterface.sequelize.query(`
      SELECT id, fullName, dbKey, companyName
      FROM users
      WHERE dbKey IS NOT NULL AND dbKey != ''
    `);

    console.log(`Found ${adminUsers.length} admin(s) with schemas`);

    for (const admin of adminUsers) {
      try {
        // Generate schema name
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

        console.log(`\n🔧 Processing schema: ${schemaName}`);

        // Check if schema exists
        const [schemas] = await queryInterface.sequelize.query(`
          SELECT SCHEMA_NAME 
          FROM INFORMATION_SCHEMA.SCHEMATA
          WHERE SCHEMA_NAME = '${schemaName}'
        `);

        if (schemas.length === 0) {
          console.log(`   ⏭️  Schema does not exist, skipping...`);
          continue;
        }

        // Check if rate_charts table exists
        const [rateChartsTables] = await queryInterface.sequelize.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'rate_charts'
        `);

        if (rateChartsTables.length === 0) {
          console.log(`   ⏭️  rate_charts table does not exist in ${schemaName}, skipping...`);
          continue;
        }

        // Check if table already exists
        const [existingTables] = await queryInterface.sequelize.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'rate_chart_download_history'
        `);

        if (existingTables.length > 0) {
          console.log(`   ✅ rate_chart_download_history table already exists in ${schemaName}`);
          continue;
        }

        // Create rate_chart_download_history table
        await queryInterface.sequelize.query(`
          CREATE TABLE IF NOT EXISTS \`${schemaName}\`.rate_chart_download_history (
            id INT PRIMARY KEY AUTO_INCREMENT,
            rate_chart_id INT NOT NULL COMMENT 'Reference to rate_charts table',
            machine_id INT NOT NULL COMMENT 'Reference to machines table',
            society_id INT NOT NULL COMMENT 'Reference to societies table',
            channel ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
            downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (rate_chart_id) REFERENCES \`${schemaName}\`.rate_charts(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (machine_id) REFERENCES \`${schemaName}\`.machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (society_id) REFERENCES \`${schemaName}\`.societies(id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE KEY unique_machine_chart_channel (machine_id, rate_chart_id, channel),
            INDEX idx_machine_society_channel (machine_id, society_id, channel),
            INDEX idx_rate_chart_id (rate_chart_id),
            INDEX idx_downloaded_at (downloaded_at)
          ) COMMENT='Tracks which machines have downloaded which rate charts'
        `);

        console.log(`   ✅ Created rate_chart_download_history table in ${schemaName}`);

      } catch (error) {
        console.error(`   ❌ Error processing schema for ${admin.fullName}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
  },

  async down(queryInterface) {
    console.log('📊 Removing rate_chart_download_history table from all admin schemas...');

    // Get all admin users with dbKey
    const [adminUsers] = await queryInterface.sequelize.query(`
      SELECT id, fullName, dbKey
      FROM users
      WHERE dbKey IS NOT NULL AND dbKey != ''
    `);

    for (const admin of adminUsers) {
      try {
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

        // Check if table exists
        const [tables] = await queryInterface.sequelize.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'rate_chart_download_history'
        `);

        if (tables.length > 0) {
          await queryInterface.sequelize.query(`
            DROP TABLE IF EXISTS \`${schemaName}\`.rate_chart_download_history
          `);
          console.log(`   ✅ Removed rate_chart_download_history table from ${schemaName}`);
        }
      } catch (error) {
        console.error(`   ❌ Error removing table from ${admin.fullName}:`, error.message);
      }
    }

    console.log('\n✅ Rollback completed!');
  }
};
