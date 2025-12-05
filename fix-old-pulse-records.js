/**
 * One-time fix for old pulse records
 * Ends all active/paused sections from previous days
 */

const { Sequelize, QueryTypes } = require('sequelize');
const config = require('./config/database.js');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port,
    dialect: config.development.dialect,
    logging: console.log,
    timezone: config.development.timezone,
    dialectOptions: config.development.dialectOptions
  }
);

async function fixOldPulseRecords() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get all schemas
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%'
      ORDER BY TABLE_SCHEMA
    `);

    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Today's date: ${today}\n`);
    console.log(`🔧 Fixing old pulse records in ${schemas.length} schema(s)...\n`);

    let totalFixed = 0;

    for (const schema of schemas) {
      const schemaName = schema.TABLE_SCHEMA;
      console.log(`\n📂 Processing: ${schemaName}`);

      // Check if section_pulse table exists
      const [tableCheck] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = '${schemaName}'
        AND TABLE_NAME = 'section_pulse'
      `);

      if (tableCheck[0].count === 0) {
        console.log('   ⚠️ section_pulse table does not exist, skipping...');
        continue;
      }

      // Find old active/paused sections
      const oldPulses = await sequelize.query(`
        SELECT id, society_id, pulse_date, last_collection_time, pulse_status
        FROM \`${schemaName}\`.section_pulse
        WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) < ?
        AND section_end_time IS NULL
      `, {
        replacements: [today],
        type: QueryTypes.SELECT
      });

      if (!oldPulses || oldPulses.length === 0) {
        console.log('   ✅ No old active/paused sections found');
        continue;
      }

      console.log(`   🔍 Found ${oldPulses.length} old section(s) to fix`);

      for (const pulse of oldPulses) {
        const sectionEndTime = pulse.last_collection_time ? 
          new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000) : null;

        await sequelize.query(`
          UPDATE \`${schemaName}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = NOW(),
            updated_at = NOW()
          WHERE id = ?
        `, {
          replacements: [sectionEndTime, pulse.id]
        });

        console.log(`      ✅ Fixed pulse ID ${pulse.id} (society ${pulse.society_id}, date ${pulse.pulse_date})`);
        totalFixed++;
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`🎉 FIX COMPLETE - Updated ${totalFixed} old pulse record(s)`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixOldPulseRecords();
