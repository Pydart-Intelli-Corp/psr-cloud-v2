/**
 * Diagnose Pulse Issues
 * Check all pulse records and identify problems
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
    logging: false,
    timezone: config.development.timezone,
    dialectOptions: config.development.dialectOptions
  }
);

async function diagnosePulseIssues() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE 'db_%'
      ORDER BY TABLE_SCHEMA
    `);

    if (schemas.length === 0) {
      console.log('⚠️ No admin schemas found (db_*)');
      
      // Check for tester schema
      const [testerSchemas] = await sequelize.query(`
        SELECT DISTINCT TABLE_SCHEMA 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA LIKE 'tester_%'
        ORDER BY TABLE_SCHEMA
      `);
      
      if (testerSchemas.length > 0) {
        console.log(`✅ Found ${testerSchemas.length} tester schema(s):`);
        schemas.push(...testerSchemas);
      }
    }

    console.log(`📊 Checking ${schemas.length} schema(s):\n`);

    for (const schema of schemas) {
      const schemaName = schema.TABLE_SCHEMA;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📂 Schema: ${schemaName}`);
      console.log('='.repeat(80));

      // Check if section_pulse table exists
      const [tableCheck] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = '${schemaName}'
        AND TABLE_NAME = 'section_pulse'
      `);

      if (tableCheck[0].count === 0) {
        console.log('❌ section_pulse table does not exist in this schema');
        continue;
      }

      // Get all pulse records
      const [pulseRecords] = await sequelize.query(`
        SELECT 
          sp.id,
          sp.society_id,
          s.name as society_name,
          s.society_id as society_code,
          sp.pulse_date,
          sp.first_collection_time,
          sp.last_collection_time,
          sp.section_end_time,
          sp.pulse_status,
          sp.total_collections,
          sp.inactive_days,
          sp.last_checked,
          sp.created_at,
          sp.updated_at
        FROM \`${schemaName}\`.section_pulse sp
        LEFT JOIN \`${schemaName}\`.societies s ON sp.society_id = s.id
        ORDER BY sp.pulse_date DESC, sp.society_id
        LIMIT 50
      `);

      if (pulseRecords.length === 0) {
        console.log('⚠️ No pulse records found');
        continue;
      }

      console.log(`\n📋 Found ${pulseRecords.length} pulse record(s):\n`);

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      for (const pulse of pulseRecords) {
        const pulseDate = new Date(pulse.pulse_date).toISOString().split('T')[0];
        const isToday = pulseDate === today;
        const daysDiff = Math.floor((now - new Date(pulse.pulse_date)) / (1000 * 60 * 60 * 24));

        console.log(`\n🔍 Pulse ID: ${pulse.id} | Society: ${pulse.society_name} (${pulse.society_code})`);
        console.log(`   Date: ${pulseDate} ${isToday ? '(TODAY)' : `(${daysDiff} days ago)`}`);
        console.log(`   Status: ${pulse.pulse_status}`);
        console.log(`   First Collection: ${pulse.first_collection_time || 'NULL'}`);
        console.log(`   Last Collection: ${pulse.last_collection_time || 'NULL'}`);
        console.log(`   Section End: ${pulse.section_end_time || 'NULL'}`);
        console.log(`   Total Collections: ${pulse.total_collections}`);
        console.log(`   Inactive Days: ${pulse.inactive_days}`);
        console.log(`   Last Checked: ${pulse.last_checked || 'NULL'}`);

        // Check for issues
        const issues = [];

        // Issue 1: Old dates showing as active
        if (!isToday && pulse.pulse_status === 'active') {
          issues.push(`❌ Old date (${daysDiff} days ago) but status is 'active'`);
        }

        // Issue 2: Section end time is null but status is ended
        if (pulse.pulse_status === 'ended' && !pulse.section_end_time) {
          issues.push('❌ Status is "ended" but section_end_time is NULL');
        }

        // Issue 3: Inactive days is 0 for old inactive records
        if (!isToday && daysDiff > 0 && pulse.inactive_days === 0 && pulse.pulse_status !== 'active') {
          issues.push(`❌ ${daysDiff} days old but inactive_days is 0`);
        }

        // Issue 4: Last collection time check
        if (pulse.last_collection_time) {
          const lastCollTime = new Date(pulse.last_collection_time);
          const minutesSinceLastColl = Math.floor((now - lastCollTime) / (1000 * 60));
          
          if (isToday && minutesSinceLastColl > 60 && pulse.pulse_status === 'active') {
            issues.push(`❌ ${minutesSinceLastColl} minutes since last collection but still "active"`);
          }
          
          if (isToday && minutesSinceLastColl > 5 && minutesSinceLastColl <= 60 && pulse.pulse_status === 'active') {
            issues.push(`⚠️ ${minutesSinceLastColl} minutes since last collection, should be "paused"`);
          }
        }

        // Issue 5: Never checked
        if (!pulse.last_checked) {
          issues.push('⚠️ last_checked is NULL - scheduler may not be running');
        }

        if (issues.length > 0) {
          console.log('\n   ⚠️ ISSUES FOUND:');
          issues.forEach(issue => console.log(`      ${issue}`));
        } else {
          console.log('   ✅ No issues detected');
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('🏁 DIAGNOSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnosePulseIssues();
