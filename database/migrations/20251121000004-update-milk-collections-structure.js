'use strict';

/**
 * Migration: Update milk_collections table structure
 * 
 * Changes:
 * - Rename shift_number to farmer_name (VARCHAR to store farmer name)
 * - Remove morning_quantity column
 * - Remove evening_quantity column
 * - Remove collection_date column (keep only collection_time)
 * 
 * Date: 2025-11-21
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Starting milk_collections table structure update...');

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

          // Get existing columns
          const [existingColumns] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'milk_collections'
          `);

          const columnNames = existingColumns.map(col => col.COLUMN_NAME);
          console.log(`   📋 Existing columns: ${columnNames.length}`);

          // Rename shift_number to farmer_name
          if (columnNames.includes('shift_number') && !columnNames.includes('farmer_name')) {
            console.log(`   ♻️  Renaming shift_number to farmer_name...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              CHANGE COLUMN \`shift_number\` \`farmer_name\` VARCHAR(255) DEFAULT NULL
            `);
          }

          // Remove morning_quantity column
          if (columnNames.includes('morning_quantity')) {
            console.log(`   🗑️  Removing morning_quantity column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              DROP COLUMN \`morning_quantity\`
            `);
          }

          // Remove evening_quantity column
          if (columnNames.includes('evening_quantity')) {
            console.log(`   🗑️  Removing evening_quantity column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              DROP COLUMN \`evening_quantity\`
            `);
          }

          // Remove collection_date column
          if (columnNames.includes('collection_date')) {
            console.log(`   🗑️  Removing collection_date column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              DROP COLUMN \`collection_date\`
            `);
          }

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
      console.log('🔄 Reverting milk_collections table structure changes...');

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
          // Rename farmer_name back to shift_number
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            CHANGE COLUMN \`farmer_name\` \`shift_number\` INT DEFAULT 1
          `);

          // Add back morning_quantity column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            ADD COLUMN \`morning_quantity\` DECIMAL(10,2) DEFAULT 0 AFTER \`channel\`
          `);

          // Add back evening_quantity column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            ADD COLUMN \`evening_quantity\` DECIMAL(10,2) DEFAULT 0 AFTER \`morning_quantity\`
          `);

          // Add back collection_date column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            ADD COLUMN \`collection_date\` DATE AFTER \`machine_id\`
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
