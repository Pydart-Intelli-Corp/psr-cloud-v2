'use strict';

/**
 * Migration: Add farmer count columns to section_pulse table
 * 
 * Purpose: Track total, present, and absent farmer counts per section/day
 * to provide better attendance and participation analytics.
 * 
 * Date: 2025-12-17
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Adding farmer count columns to section_pulse table in all admin schemas...');

      // Get all admin schemas that have section_pulse table
      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'section_pulse' 
        AND TABLE_SCHEMA != 'information_schema' 
        AND TABLE_SCHEMA != 'mysql' 
        AND TABLE_SCHEMA != 'performance_schema' 
        AND TABLE_SCHEMA != 'sys'
        AND TABLE_SCHEMA != DATABASE()
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas with section_pulse table`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Adding farmer count columns to schema: ${schemaName}`);

        try {
          // Add total_farmers column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            ADD COLUMN \`total_farmers\` INT DEFAULT 0 COMMENT 'Total registered farmers in society'
            AFTER \`total_collections\`
          `);

          // Add present_farmers column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            ADD COLUMN \`present_farmers\` INT DEFAULT 0 COMMENT 'Number of farmers who made collections'
            AFTER \`total_farmers\`
          `);

          // Add absent_farmers column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            ADD COLUMN \`absent_farmers\` INT DEFAULT 0 COMMENT 'Number of farmers who did not make collections'
            AFTER \`present_farmers\`
          `);

          console.log(`   ✅ Farmer count columns added to ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error adding columns in ${schemaName}:`, schemaError.message);
          // Continue with other schemas even if one fails
        }
      }

      console.log('\n✅ Migration completed successfully');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Removing farmer count columns from section_pulse table in all admin schemas...');

      // Get all admin schemas
      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'section_pulse' 
        AND TABLE_SCHEMA != 'information_schema' 
        AND TABLE_SCHEMA != 'mysql' 
        AND TABLE_SCHEMA != 'performance_schema' 
        AND TABLE_SCHEMA != 'sys'
        AND TABLE_SCHEMA != DATABASE()
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas to revert`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Removing farmer count columns from schema: ${schemaName}`);

        try {
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`section_pulse\`
            DROP COLUMN \`absent_farmers\`,
            DROP COLUMN \`present_farmers\`,
            DROP COLUMN \`total_farmers\`
          `);

          console.log(`   ✅ Farmer count columns removed from ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error removing columns from ${schemaName}:`, schemaError.message);
        }
      }

      console.log('\n✅ Rollback completed');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
