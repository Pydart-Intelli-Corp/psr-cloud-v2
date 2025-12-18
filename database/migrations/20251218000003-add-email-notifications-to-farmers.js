'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding email_notifications_enabled column to farmers tables...');
    
    try {
      // Get all admin schemas
      const [schemas] = await queryInterface.sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'farmers' 
        AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'psr_v4_main')
      `);

      console.log(`📊 Found ${schemas.length} admin schemas with farmers table`);

      for (const schema of schemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n🔧 Processing schema: ${schemaName}`);

        try {
          // Check if column already exists
          const [columns] = await queryInterface.sequelize.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'farmers' 
            AND COLUMN_NAME = 'email_notifications_enabled'
          `);

          if (columns.length > 0) {
            console.log(`  ⏭️  Column already exists in ${schemaName}, skipping...`);
            continue;
          }

          // Add email_notifications_enabled column (default ON)
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`farmers\`
            ADD COLUMN \`email_notifications_enabled\` ENUM('ON', 'OFF') DEFAULT 'ON' AFTER \`sms_enabled\`
          `);

          console.log(`  ✅ Successfully added email_notifications_enabled column to ${schemaName}.farmers`);
        } catch (error) {
          console.error(`  ❌ Error processing schema ${schemaName}:`, error.message);
        }
      }

      console.log('\n✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing email_notifications_enabled column from farmers tables...');
    
    try {
      // Get all admin schemas
      const [schemas] = await queryInterface.sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'farmers' 
        AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'psr_v4_main')
      `);

      for (const schema of schemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n🔧 Processing schema: ${schemaName}`);

        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`farmers\`
            DROP COLUMN IF EXISTS \`email_notifications_enabled\`
          `);

          console.log(`  ✅ Successfully removed column from ${schemaName}.farmers`);
        } catch (error) {
          console.error(`  ❌ Error processing schema ${schemaName}:`, error.message);
        }
      }

      console.log('\n✅ Rollback completed successfully!');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
