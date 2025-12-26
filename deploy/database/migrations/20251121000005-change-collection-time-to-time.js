'use strict';

/**
 * Migration: Change collection_time from DATETIME to TIME
 * 
 * Changes collection_time column type from DATETIME to TIME 
 * since we only need to store the time portion.
 * 
 * Date: 2025-11-21
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Starting collection_time column type update...');

      // Get all admin schemas
      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'farmers' 
        AND TABLE_SCHEMA != 'information_schema' 
        AND TABLE_SCHEMA != 'mysql' 
        AND TABLE_SCHEMA != 'performance_schema' 
        AND TABLE_SCHEMA != 'sys'
        AND TABLE_SCHEMA != DATABASE()
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas to update`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Updating schema: ${schemaName}`);

        try {
          // Check if milk_collections table exists
          const [tableExists] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'milk_collections'
          `);

          if (!tableExists[0] || tableExists[0].count === 0) {
            console.log(`   ⚠️  milk_collections table does not exist in ${schemaName}, skipping...`);
            continue;
          }

          // Change collection_time to TIME type
          console.log(`   🔄 Converting collection_time to TIME...`);
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            MODIFY COLUMN \`collection_time\` TIME
          `);

          console.log(`   ✅ Schema ${schemaName} updated successfully`);

        } catch (schemaError) {
          console.error(`   ❌ Error updating schema ${schemaName}:`, schemaError.message);
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
      console.log('🔄 Reverting collection_time column type...');

      // Get all admin schemas
      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME = 'farmers' 
        AND TABLE_SCHEMA != 'information_schema' 
        AND TABLE_SCHEMA != 'mysql' 
        AND TABLE_SCHEMA != 'performance_schema' 
        AND TABLE_SCHEMA != 'sys'
        AND TABLE_SCHEMA != DATABASE()
      `);

      console.log(`📊 Found ${adminSchemas.length} admin schemas to revert`);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Reverting schema: ${schemaName}`);

        try {
          // Change collection_time back to DATETIME
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            MODIFY COLUMN \`collection_time\` DATETIME
          `);

          console.log(`   ✅ Schema ${schemaName} reverted successfully`);

        } catch (schemaError) {
          console.error(`   ❌ Error reverting schema ${schemaName}:`, schemaError.message);
        }
      }

      console.log('\n✅ Rollback completed');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
