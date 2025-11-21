'use strict';

/**
 * Migration: Rename milk_collections columns for correct field names
 * 
 * Changes:
 * - animal_type -> channel (COW, BUFFALO channel type)
 * - sample_number -> bonus (bonus value)
 * 
 * Date: 2025-11-21
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Starting milk_collections column rename...');

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

          // Rename animal_type to channel if animal_type exists
          if (columnNames.includes('animal_type') && !columnNames.includes('channel')) {
            console.log(`   ♻️  Renaming animal_type to channel...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              CHANGE COLUMN \`animal_type\` \`channel\` VARCHAR(50) DEFAULT 'COW'
            `);
          }

          // Rename sample_number to bonus if sample_number exists
          if (columnNames.includes('sample_number') && !columnNames.includes('bonus')) {
            console.log(`   ♻️  Renaming sample_number to bonus...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              CHANGE COLUMN \`sample_number\` \`bonus\` DECIMAL(10,2) DEFAULT 0
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
      console.log('🔄 Reverting milk_collections column rename...');

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
          // Rename back channel to animal_type
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            CHANGE COLUMN \`channel\` \`animal_type\` VARCHAR(50) DEFAULT 'COW'
          `);

          // Rename back bonus to sample_number
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            CHANGE COLUMN \`bonus\` \`sample_number\` DECIMAL(10,2) DEFAULT 0
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
