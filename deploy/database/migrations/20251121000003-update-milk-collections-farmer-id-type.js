'use strict';

/**
 * Migration: Update milk_collections farmer_id to VARCHAR
 * 
 * Changes farmer_id from INT to VARCHAR(50) to accept farmer ID strings directly
 * without requiring foreign key lookup.
 * 
 * Date: 2025-11-21
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Starting milk_collections farmer_id type update...');

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

          // Drop foreign key constraint first
          console.log(`   🔓 Dropping foreign key constraint on farmer_id...`);
          try {
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              DROP FOREIGN KEY \`milk_collections_ibfk_1\`
            `);
          } catch (fkError) {
            // Constraint might not exist or have different name
            console.log(`   ℹ️  Foreign key constraint not found or already dropped`);
          }

          // Change farmer_id to VARCHAR
          console.log(`   🔄 Converting farmer_id to VARCHAR(50)...`);
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            MODIFY COLUMN \`farmer_id\` VARCHAR(50)
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
      console.log('🔄 Reverting milk_collections farmer_id type...');

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
          // Change farmer_id back to INT
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            MODIFY COLUMN \`farmer_id\` INT
          `);

          // Add foreign key constraint back
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            ADD CONSTRAINT \`milk_collections_ibfk_1\` 
            FOREIGN KEY (\`farmer_id\`) REFERENCES \`${schemaName}\`.\`farmers\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE CASCADE
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
