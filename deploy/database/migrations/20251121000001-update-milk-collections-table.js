'use strict';

/**
 * Migration: Update milk_collections table for machine collection data
 * 
 * This migration adds fields to support comprehensive milk collection data from machines:
 * - Society and machine references
 * - Collection timing (time, shift type, shift number)
 * - Animal type (COW, BUFFALO, etc.)
 * - Extended test results (CLR, protein, lactose, salt, water, temperature)
 * - Sample tracking (sample number)
 * - Machine metadata (type, version)
 * - Separate morning/evening quantity tracking
 * 
 * Date: 2025-11-21
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Starting milk_collections table update...');

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

          // Add society_id if missing
          if (!columnNames.includes('society_id')) {
            console.log(`   ➕ Adding society_id column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`society_id\` INT AFTER \`farmer_id\`,
              ADD INDEX \`idx_society_id\` (\`society_id\`)
            `);
          }

          // Add machine_id if missing
          if (!columnNames.includes('machine_id')) {
            console.log(`   ➕ Adding machine_id column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`machine_id\` INT AFTER \`society_id\`,
              ADD INDEX \`idx_machine_id\` (\`machine_id\`)
            `);
          }

          // Add collection_time if missing
          if (!columnNames.includes('collection_time')) {
            console.log(`   ➕ Adding collection_time column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`collection_time\` DATETIME AFTER \`collection_date\`,
              ADD INDEX \`idx_collection_time\` (\`collection_time\`)
            `);
          }

          // Add shift_type if missing
          if (!columnNames.includes('shift_type')) {
            console.log(`   ➕ Adding shift_type column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`shift_type\` ENUM('morning', 'evening') AFTER \`collection_time\`,
              ADD INDEX \`idx_shift_type\` (\`shift_type\`)
            `);
          }

          // Add shift_number if missing
          if (!columnNames.includes('shift_number')) {
            console.log(`   ➕ Adding shift_number column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`shift_number\` INT DEFAULT 1 AFTER \`shift_type\`
            `);
          }

          // Add animal_type if missing
          if (!columnNames.includes('animal_type')) {
            console.log(`   ➕ Adding animal_type column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`animal_type\` VARCHAR(50) DEFAULT 'COW' AFTER \`shift_number\`,
              ADD INDEX \`idx_animal_type\` (\`animal_type\`)
            `);
          }

          // Add CLR value if missing
          if (!columnNames.includes('clr_value')) {
            console.log(`   ➕ Adding clr_value column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`clr_value\` DECIMAL(5,2) DEFAULT 0 AFTER \`snf_percentage\`
            `);
          }

          // Add protein_percentage if missing
          if (!columnNames.includes('protein_percentage')) {
            console.log(`   ➕ Adding protein_percentage column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`protein_percentage\` DECIMAL(5,2) DEFAULT 0 AFTER \`clr_value\`
            `);
          }

          // Add lactose_percentage if missing
          if (!columnNames.includes('lactose_percentage')) {
            console.log(`   ➕ Adding lactose_percentage column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`lactose_percentage\` DECIMAL(5,2) DEFAULT 0 AFTER \`protein_percentage\`
            `);
          }

          // Add salt_percentage if missing
          if (!columnNames.includes('salt_percentage')) {
            console.log(`   ➕ Adding salt_percentage column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`salt_percentage\` DECIMAL(5,2) DEFAULT 0 AFTER \`lactose_percentage\`
            `);
          }

          // Add water_percentage if missing
          if (!columnNames.includes('water_percentage')) {
            console.log(`   ➕ Adding water_percentage column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`water_percentage\` DECIMAL(5,2) DEFAULT 0 AFTER \`salt_percentage\`
            `);
          }

          // Add temperature if missing
          if (!columnNames.includes('temperature')) {
            console.log(`   ➕ Adding temperature column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`temperature\` DECIMAL(5,2) DEFAULT 0 AFTER \`water_percentage\`
            `);
          }

          // Add quantity (replacing morning_quantity/evening_quantity approach)
          if (!columnNames.includes('quantity')) {
            console.log(`   ➕ Adding quantity column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`quantity\` DECIMAL(10,2) DEFAULT 0 AFTER \`temperature\`
            `);
          }

          // Add sample_number if missing
          if (!columnNames.includes('sample_number')) {
            console.log(`   ➕ Adding sample_number column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`sample_number\` DECIMAL(10,2) DEFAULT 0 AFTER \`total_amount\`
            `);
          }

          // Add machine_type if missing
          if (!columnNames.includes('machine_type')) {
            console.log(`   ➕ Adding machine_type column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`machine_type\` VARCHAR(100) AFTER \`sample_number\`
            `);
          }

          // Add machine_version if missing
          if (!columnNames.includes('machine_version')) {
            console.log(`   ➕ Adding machine_version column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              ADD COLUMN \`machine_version\` VARCHAR(50) AFTER \`machine_type\`
            `);
          }

          // Drop total_quantity computed column if it exists (will cause issues with new structure)
          if (columnNames.includes('total_quantity')) {
            console.log(`   🗑️  Dropping total_quantity computed column...`);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`milk_collections\`
              DROP COLUMN \`total_quantity\`
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
      console.log('🔄 Reverting milk_collections table changes...');

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
          // Remove added columns
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            DROP COLUMN IF EXISTS \`society_id\`,
            DROP COLUMN IF EXISTS \`machine_id\`,
            DROP COLUMN IF EXISTS \`collection_time\`,
            DROP COLUMN IF EXISTS \`shift_type\`,
            DROP COLUMN IF EXISTS \`shift_number\`,
            DROP COLUMN IF EXISTS \`animal_type\`,
            DROP COLUMN IF EXISTS \`clr_value\`,
            DROP COLUMN IF EXISTS \`protein_percentage\`,
            DROP COLUMN IF EXISTS \`lactose_percentage\`,
            DROP COLUMN IF EXISTS \`salt_percentage\`,
            DROP COLUMN IF EXISTS \`water_percentage\`,
            DROP COLUMN IF EXISTS \`temperature\`,
            DROP COLUMN IF EXISTS \`quantity\`,
            DROP COLUMN IF EXISTS \`sample_number\`,
            DROP COLUMN IF EXISTS \`machine_type\`,
            DROP COLUMN IF EXISTS \`machine_version\`
          `);

          // Recreate total_quantity computed column
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`milk_collections\`
            ADD COLUMN \`total_quantity\` DECIMAL(10,2) AS (\`morning_quantity\` + \`evening_quantity\`) STORED
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
