'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Get all admin users to update tables in their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Updating rate_chart_download_history unique key...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Updating rate_chart_download_history in schema: ${schemaName}`);

      try {
        // Drop old unique key
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`rate_chart_download_history\`
          DROP INDEX \`unique_machine_chart\`
        `);

        console.log(`✅ Dropped old unique key in ${schemaName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop old unique key in ${schemaName} (may not exist):`, error.message);
      }

      try {
        // Add new unique key with channel
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`rate_chart_download_history\`
          ADD UNIQUE KEY \`unique_machine_chart_channel\` (\`machine_id\`, \`rate_chart_id\`, \`channel\`)
        `);

        console.log(`✅ Added new unique key with channel in ${schemaName}`);
      } catch (error) {
        console.log(`⚠️ Could not add new unique key in ${schemaName}:`, error.message);
      }
    }

    console.log('✅ Migration completed successfully');
  },

  async down(queryInterface) {
    // Get all admin users to revert tables in their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Reverting rate_chart_download_history unique key...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Reverting rate_chart_download_history in schema: ${schemaName}`);

      try {
        // Drop new unique key
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`rate_chart_download_history\`
          DROP INDEX \`unique_machine_chart_channel\`
        `);

        console.log(`✅ Dropped new unique key in ${schemaName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop new unique key in ${schemaName}:`, error.message);
      }

      try {
        // Restore old unique key
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`rate_chart_download_history\`
          ADD UNIQUE KEY \`unique_machine_chart\` (\`machine_id\`, \`rate_chart_id\`)
        `);

        console.log(`✅ Restored old unique key in ${schemaName}`);
      } catch (error) {
        console.log(`⚠️ Could not restore old unique key in ${schemaName}:`, error.message);
      }
    }

    console.log('✅ Rollback completed successfully');
  }
};
