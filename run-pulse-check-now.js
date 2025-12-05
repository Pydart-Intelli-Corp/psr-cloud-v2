/**
 * Manually run pulse check once
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

// Import from pulse-scheduler
const SectionPulseTracker = {
  async checkSectionPauseAndEnd(sequelize, schemaName) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1. End all active/paused sections from previous days
    const oldPulses = await sequelize.query(`
      SELECT id, society_id, pulse_date, last_collection_time
      FROM \`${schemaName}\`.section_pulse
      WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) < ?
        AND section_end_time IS NULL
    `, {
      replacements: [today],
      type: QueryTypes.SELECT
    });

    let oldEndedCount = 0;
    for (const pulse of oldPulses) {
      const sectionEndTime = pulse.last_collection_time ? 
        new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000) : null;
      
      await sequelize.query(`
        UPDATE \`${schemaName}\`.section_pulse
        SET section_end_time = ?,
            pulse_status = 'ended',
            last_checked = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, {
        replacements: [sectionEndTime, pulse.id]
      });
      oldEndedCount++;
    }

    // 2. Check for sections to pause (5 minutes inactive, currently active, TODAY only)
    const activePulses = await sequelize.query(`
      SELECT id, society_id, pulse_date, last_collection_time
      FROM \`${schemaName}\`.section_pulse
      WHERE pulse_status = 'active'
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND last_collection_time > ?
    `, {
      replacements: [today, fiveMinutesAgo, sixtyMinutesAgo],
      type: QueryTypes.SELECT
    });

    let pausedCount = 0;
    for (const pulse of activePulses) {
      await sequelize.query(`
        UPDATE \`${schemaName}\`.section_pulse
        SET pulse_status = 'paused',
            last_checked = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, {
        replacements: [pulse.id]
      });
      pausedCount++;
      console.log(`   ⏸️ Paused pulse ID ${pulse.id} (society ${pulse.society_id})`);
    }

    // 3. Check for sections to end (60 minutes inactive, currently active or paused, TODAY only)
    const inactivePulses = await sequelize.query(`
      SELECT id, society_id, pulse_date, last_collection_time
      FROM \`${schemaName}\`.section_pulse
      WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND section_end_time IS NULL
    `, {
      replacements: [today, sixtyMinutesAgo],
      type: QueryTypes.SELECT
    });

    let endedCount = 0;
    for (const pulse of inactivePulses) {
      const sectionEndTime = new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000);
      
      await sequelize.query(`
        UPDATE \`${schemaName}\`.section_pulse
        SET section_end_time = ?,
            pulse_status = 'ended',
            last_checked = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, {
        replacements: [sectionEndTime, pulse.id]
      });
      
      endedCount++;
      console.log(`   🔴 Ended pulse ID ${pulse.id} (society ${pulse.society_id})`);
    }

    return { oldEndedCount, pausedCount, endedCount };
  },

  async checkInactivity(sequelize, schemaName) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activeSocieties = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.societies WHERE status = 'active'
    `, { type: QueryTypes.SELECT });

    let inactiveCount = 0;
    for (const society of activeSocieties) {
      const todayPulse = await sequelize.query(`
        SELECT id FROM \`${schemaName}\`.section_pulse
        WHERE society_id = ? AND pulse_date = ?
      `, {
        replacements: [society.id, today],
        type: QueryTypes.SELECT
      });

      if (!todayPulse || todayPulse.length === 0) {
        const yesterdayPulse = await sequelize.query(`
          SELECT inactive_days, pulse_status
          FROM \`${schemaName}\`.section_pulse
          WHERE society_id = ? AND pulse_date = ?
        `, {
          replacements: [society.id, yesterday],
          type: QueryTypes.SELECT
        });

        let inactiveDays = 1;
        if (yesterdayPulse && yesterdayPulse.length > 0) {
          inactiveDays = (yesterdayPulse[0].inactive_days || 0) + 1;
        }

        await sequelize.query(`
          INSERT INTO \`${schemaName}\`.section_pulse (
            society_id,
            pulse_date,
            pulse_status,
            inactive_days,
            last_checked,
            created_at,
            updated_at
          ) VALUES (?, ?, 'inactive', ?, NOW(), NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            pulse_status = 'inactive',
            inactive_days = ?,
            last_checked = NOW(),
            updated_at = NOW()
        `, {
          replacements: [society.id, today, inactiveDays, inactiveDays]
        });

        inactiveCount++;
        console.log(`   ⚪ Society ${society.id} - ${inactiveDays} day(s) inactive`);
      }
    }

    return inactiveCount;
  }
};

async function runChecks() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%'
    `);

    console.log(`📊 Running checks on ${schemas.length} schema(s)...\n`);

    for (const schema of schemas) {
      const schemaName = schema.TABLE_SCHEMA;
      console.log(`\n📂 ${schemaName}`);
      
      // Run pause/end check
      const { oldEndedCount, pausedCount, endedCount } = await SectionPulseTracker.checkSectionPauseAndEnd(sequelize, schemaName);
      console.log(`   ✅ Pause/End check: ${oldEndedCount} old ended, ${pausedCount} paused, ${endedCount} ended`);
      
      // Run inactivity check
      const inactiveCount = await SectionPulseTracker.checkInactivity(sequelize, schemaName);
      console.log(`   ✅ Inactivity check: ${inactiveCount} inactive societies`);
    }

    console.log('\n✅ All checks completed\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

runChecks();
