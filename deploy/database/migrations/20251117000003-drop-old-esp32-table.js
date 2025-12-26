'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop old esp32_machine_corrections tables if they exist
    
    // Get all admin schemas
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL"
    );

    console.log(`Found ${adminUsers.length} admin users`);

    // Drop old table from each admin schema
    for (const admin of adminUsers) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`Dropping old esp32_machine_corrections table in schema: ${schemaName}`);
      
      try {
        await queryInterface.sequelize.query(`USE \`${schemaName}\``);
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS esp32_machine_corrections');
        console.log(`✅ Dropped old table in ${schemaName}`);
      } catch (error) {
        console.error(`❌ Error dropping table in ${schemaName}:`, error.message);
      }
    }

    // Switch back to default database
    const defaultDb = process.env.DB_NAME || 'psr_v4_main';
    await queryInterface.sequelize.query(`USE \`${defaultDb}\``);
  },

  async down (queryInterface, Sequelize) {
    // Cannot restore dropped tables - this is a one-way migration
    console.log('⚠️  Cannot restore dropped esp32_machine_corrections tables');
  }
};
