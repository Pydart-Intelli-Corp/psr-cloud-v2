'use strict';

/**
 * Migration: Add 'paused' status to section_pulse.pulse_status enum
 * 
 * This migration adds a new 'paused' status to track when a section
 * has been inactive for 5 minutes but not yet ended (60 minutes)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔄 Adding "paused" status to pulse_status enum in all admin schemas...');

      // Get all admin schemas
      const [adminSchemas] = await queryInterface.sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA LIKE 'db_%'
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas to update`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Updating pulse_status enum in schema: ${schemaName}`);

        try {
          // Check if section_pulse table exists
          const [tableExists] = await queryInterface.sequelize.query(`
            SELECT COUNT(*) as count
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = '${schemaName}'
            AND TABLE_NAME = 'section_pulse'
          `);

          if (tableExists[0].count === 0) {
            console.log(`   ⚠️ section_pulse table not found in ${schemaName}, skipping...`);
            continue;
          }

          // Modify the enum to add 'paused' status
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            MODIFY COLUMN \`pulse_status\` 
            ENUM('not_started', 'active', 'paused', 'ended', 'inactive') 
            DEFAULT 'not_started' 
            COMMENT 'Current pulse status'
          `);

          console.log(`   ✅ pulse_status enum updated in ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error updating enum in ${schemaName}:`, schemaError.message);
          // Continue with other schemas even if one fails
        }
      }

      console.log('\n✅ Migration completed successfully');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 Removing "paused" status from pulse_status enum in all admin schemas...');

      // Get all admin schemas
      const [adminSchemas] = await queryInterface.sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA LIKE 'db_%'
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas to rollback`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Rolling back pulse_status enum in schema: ${schemaName}`);

        try {
          // Check if section_pulse table exists
          const [tableExists] = await queryInterface.sequelize.query(`
            SELECT COUNT(*) as count
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = '${schemaName}'
            AND TABLE_NAME = 'section_pulse'
          `);

          if (tableExists[0].count === 0) {
            console.log(`   ⚠️ section_pulse table not found in ${schemaName}, skipping...`);
            continue;
          }

          // First, update any 'paused' statuses to 'active' before removing the enum value
          await queryInterface.sequelize.query(`
            UPDATE \`${schemaName}\`.\`section_pulse\`
            SET \`pulse_status\` = 'active'
            WHERE \`pulse_status\` = 'paused'
          `);

          // Modify the enum to remove 'paused' status
          await queryInterface.sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            MODIFY COLUMN \`pulse_status\` 
            ENUM('not_started', 'active', 'ended', 'inactive') 
            DEFAULT 'not_started' 
            COMMENT 'Current pulse status'
          `);

          console.log(`   ✅ pulse_status enum rolled back in ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error rolling back enum in ${schemaName}:`, schemaError.message);
          // Continue with other schemas even if one fails
        }
      }

      console.log('\n✅ Rollback completed successfully');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
