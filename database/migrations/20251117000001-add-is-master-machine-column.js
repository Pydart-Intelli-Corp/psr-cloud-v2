'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Get all admin users to update tables in their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Adding is_master_machine column to machines table...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Updating machines table in schema: ${schemaName}`);

      try {
        // Check if column already exists
        const [columns] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'machines' 
            AND COLUMN_NAME = 'is_master_machine'
        `);

        if (columns.length > 0) {
          console.log(`⚠️ Column is_master_machine already exists in ${schemaName}.machines`);
          continue;
        }

        // Add is_master_machine column
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`machines\`
          ADD COLUMN \`is_master_machine\` TINYINT(1) NOT NULL DEFAULT 0
          AFTER \`notes\`
        `);

        console.log(`✅ Added is_master_machine column in ${schemaName}.machines`);

        // Add index on is_master_machine
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`machines\`
          ADD INDEX \`idx_is_master\` (\`is_master_machine\`)
        `);

        console.log(`✅ Added index on is_master_machine in ${schemaName}.machines`);

        // Set first machine per society as master machine
        await queryInterface.sequelize.query(`
          UPDATE \`${schemaName}\`.\`machines\` m
          INNER JOIN (
            SELECT society_id, MIN(id) as first_machine_id
            FROM \`${schemaName}\`.\`machines\`
            GROUP BY society_id
          ) fm ON m.society_id = fm.society_id AND m.id = fm.first_machine_id
          SET m.is_master_machine = 1
        `);

        console.log(`✅ Set first machines as master machines in ${schemaName}`);

      } catch (error) {
        console.error(`❌ Error updating ${schemaName}.machines:`, error.message);
      }
    }

    console.log('✅ Migration completed successfully');
  },

  async down(queryInterface) {
    // Get all admin users to revert tables in their schemas
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin(s). Removing is_master_machine column from machines table...`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`Reverting machines table in schema: ${schemaName}`);

      try {
        // Drop index first
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`machines\`
          DROP INDEX \`idx_is_master\`
        `);

        console.log(`✅ Dropped index idx_is_master in ${schemaName}.machines`);
      } catch (error) {
        console.log(`⚠️ Could not drop index in ${schemaName} (may not exist):`, error.message);
      }

      try {
        // Drop column
        await queryInterface.sequelize.query(`
          ALTER TABLE \`${schemaName}\`.\`machines\`
          DROP COLUMN \`is_master_machine\`
        `);

        console.log(`✅ Dropped is_master_machine column in ${schemaName}.machines`);
      } catch (error) {
        console.error(`❌ Error reverting ${schemaName}.machines:`, error.message);
      }
    }

    console.log('✅ Rollback completed successfully');
  }
};
