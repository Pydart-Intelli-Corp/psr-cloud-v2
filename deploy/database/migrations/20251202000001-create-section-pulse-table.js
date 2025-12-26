'use strict';

/**
 * Migration: Create section_pulse table
 * 
 * Purpose: Track first and last milk collection times per society per day
 * to monitor section start/end pulse and detect inactivity periods.
 * 
 * Features:
 * - Tracks first collection (section start pulse) timestamp
 * - Tracks last collection (section end pulse) timestamp
 * - Monitors 60-minute inactivity to mark section end
 * - Tracks multi-day inactivity periods
 * - Per-society, per-date tracking
 * 
 * Date: 2025-12-02
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    try {
      console.log('🔄 Creating section_pulse table in all admin schemas...');

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
        console.log(`\n📝 Creating section_pulse table in schema: ${schemaName}`);

        try {
          // Create section_pulse table
          await sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`section_pulse\` (
              \`id\` INT PRIMARY KEY AUTO_INCREMENT,
              \`society_id\` INT NOT NULL,
              \`pulse_date\` DATE NOT NULL,
              \`first_collection_time\` DATETIME DEFAULT NULL COMMENT 'Section start pulse - first collection of the day',
              \`last_collection_time\` DATETIME DEFAULT NULL COMMENT 'Last collection recorded',
              \`section_end_time\` DATETIME DEFAULT NULL COMMENT 'Section end pulse - 60 min after last collection',
              \`pulse_status\` ENUM('not_started', 'active', 'ended', 'inactive') DEFAULT 'not_started' COMMENT 'Current pulse status',
              \`total_collections\` INT DEFAULT 0 COMMENT 'Total collections for the day',
              \`inactive_days\` INT DEFAULT 0 COMMENT 'Number of consecutive days without pulse',
              \`last_checked\` DATETIME DEFAULT NULL COMMENT 'Last time status was checked/updated',
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
              UNIQUE KEY \`unique_society_date\` (\`society_id\`, \`pulse_date\`),
              INDEX \`idx_society_id\` (\`society_id\`),
              INDEX \`idx_pulse_date\` (\`pulse_date\`),
              INDEX \`idx_pulse_status\` (\`pulse_status\`),
              INDEX \`idx_last_checked\` (\`last_checked\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
            COMMENT='Tracks section start/end pulse and inactivity periods per society'
          `);

          console.log(`   ✅ section_pulse table created in ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error creating section_pulse table in ${schemaName}:`, schemaError.message);
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
      console.log('🔄 Dropping section_pulse table from all admin schemas...');

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
        console.log(`\n📝 Dropping section_pulse table from schema: ${schemaName}`);

        try {
          await sequelize.query(`
            DROP TABLE IF EXISTS \`${schemaName}\`.\`section_pulse\`
          `);

          console.log(`   ✅ section_pulse table dropped from ${schemaName}`);

        } catch (schemaError) {
          console.error(`   ❌ Error dropping section_pulse table from ${schemaName}:`, schemaError.message);
        }
      }

      console.log('\n✅ Rollback completed');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
