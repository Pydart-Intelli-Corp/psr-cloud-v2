'use strict';

/**
 * Migration: Allow NULL society_id for BMC records
 * 
 * Changes:
 * - Modify society_id in milk_collections to allow NULL (for BMC collections)
 * - Modify society_id in milk_dispatches to allow NULL (for BMC dispatches)
 * 
 * Date: 2026-01-14
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Allowing NULL society_id for BMC records...');

      // Get all admin schemas
      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME IN ('milk_collections', 'milk_dispatches', 'milk_sales')
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
          // Update milk_collections table
          const [collectionsExists] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'milk_collections'
          `);

          if (collectionsExists[0] && collectionsExists[0].count > 0) {
            console.log(`   ♻️  Modifying society_id in milk_collections...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              MODIFY COLUMN \`society_id\` INT NULL
            `);
            console.log(`   ✅ milk_collections updated`);
          }

          // Update milk_dispatches table
          const [dispatchesExists] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'milk_dispatches'
          `);

          if (dispatchesExists[0] && dispatchesExists[0].count > 0) {
            console.log(`   ♻️  Modifying society_id in milk_dispatches...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_dispatches\`
              MODIFY COLUMN \`society_id\` INT NULL
            `);
            console.log(`   ✅ milk_dispatches updated`);
          }

          // Update milk_sales table
          const [salesExists] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'milk_sales'
          `);

          if (salesExists[0] && salesExists[0].count > 0) {
            console.log(`   ♻️  Modifying society_id in milk_sales...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_sales\`
              MODIFY COLUMN \`society_id\` INT NULL
            `);
            console.log(`   ✅ milk_sales updated`);
          }

          console.log(`   ✅ Schema ${schemaName} updated successfully`);

        } catch (schemaError) {
          console.error(`   ❌ Error updating schema ${schemaName}:`, schemaError.message);
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
      console.log('🔄 Reverting society_id to NOT NULL...');

      const [adminSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_NAME IN ('milk_collections', 'milk_dispatches', 'milk_sales')
        AND TABLE_SCHEMA != 'information_schema' 
        AND TABLE_SCHEMA != 'mysql' 
        AND TABLE_SCHEMA != 'performance_schema' 
        AND TABLE_SCHEMA != 'sys'
        AND TABLE_SCHEMA != DATABASE()
      `);

      for (const schema of adminSchemas) {
        const schemaName = schema.TABLE_SCHEMA;
        console.log(`\n📝 Reverting schema: ${schemaName}`);

        try {
          // Revert milk_collections
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            MODIFY COLUMN \`society_id\` INT NOT NULL
          `);

          // Revert milk_dispatches
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_dispatches\`
            MODIFY COLUMN \`society_id\` INT NOT NULL
          `);

          // Revert milk_sales
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_sales\`
            MODIFY COLUMN \`society_id\` INT NOT NULL
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
