/**
 * Section Pulse Scheduler
 * 
 * This script sets up periodic checks for section pulse tracking:
 * 1. Check section pause (5 min) and end (60 min) every 2 minutes
 * 2. Check inactivity daily at midnight (tracks multi-day inactive societies)
 * 
 * Usage:
 *   node pulse-scheduler.js
 * 
 * Or use PM2:
 *   pm2 start pulse-scheduler.js --name "pulse-scheduler"
 */

const cron = require('node-cron');
const { Sequelize, QueryTypes } = require('sequelize');
const config = require('./config/database.js');

// Import SectionPulseTracker methods inline since it's TypeScript
const SectionPulseTracker = {
  async updatePulseOnCollection(sequelize, schemaName, societyId, collectionDateTime) {
    // This is called from the API route, not needed here
    throw new Error('updatePulseOnCollection should be called from API route');
  },

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
            last_checked = NOW()
        WHERE id = ?
      `, {
        replacements: [sectionEndTime, pulse.id]
      });
      
      endedCount++;
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
          SELECT inactive_days FROM \`${schemaName}\`.section_pulse
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
          INSERT INTO \`${schemaName}\`.section_pulse
          (society_id, pulse_date, pulse_status, inactive_days, last_checked)
          VALUES (?, ?, 'inactive', ?, NOW())
        `, {
          replacements: [society.id, today, inactiveDays]
        });

        inactiveCount++;
      }
    }

    return inactiveCount;
  }
};

// Database connection
const dbConfig = config.development;
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false
  }
);

/**
 * Get all admin schemas
 */
async function getAllAdminSchemas() {
  try {
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES
      WHERE TABLE_NAME = 'farmers'
      AND TABLE_SCHEMA != 'information_schema'
      AND TABLE_SCHEMA != 'mysql'
      AND TABLE_SCHEMA != 'performance_schema'
      AND TABLE_SCHEMA != 'sys'
      AND TABLE_SCHEMA != DATABASE()
    `);
    
    return schemas.map(s => s.TABLE_SCHEMA);
  } catch (error) {
    console.error('❌ Error getting admin schemas:', error.message);
    return [];
  }
}

/**
 * Run section pause and end check for all admin schemas
 */
async function runSectionEndCheck() {
  const startTime = Date.now();
  console.log(`\n⏰ [${new Date().toISOString()}] Running section pause/end check...`);
  
  try {
    const schemas = await getAllAdminSchemas();
    console.log(`   Found ${schemas.length} admin schemas`);
    
    for (const schema of schemas) {
      try {
        const { oldEndedCount, pausedCount, endedCount } = await SectionPulseTracker.checkSectionPauseAndEnd(sequelize, schema);
        console.log(`   ✅ ${schema} - ${oldEndedCount} old ended, ${pausedCount} paused, ${endedCount} ended`);
      } catch (error) {
        console.error(`   ❌ ${schema}: ${error.message}`);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ Section pause/end check completed in ${duration}ms`);
  } catch (error) {
    console.error(`   ❌ Section pause/end check failed:`, error.message);
  }
}

/**
 * Run inactivity check for all admin schemas
 */
async function runInactivityCheck() {
  const startTime = Date.now();
  console.log(`\n⏰ [${new Date().toISOString()}] Running inactivity check...`);
  
  try {
    const schemas = await getAllAdminSchemas();
    console.log(`   Found ${schemas.length} admin schemas`);
    
    for (const schema of schemas) {
      try {
        const inactiveCount = await SectionPulseTracker.checkInactivity(sequelize, schema);
        console.log(`   ✅ ${schema} - ${inactiveCount} inactive societie(s)`);
      } catch (error) {
        console.error(`   ❌ ${schema}: ${error.message}`);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ Inactivity check completed in ${duration}ms`);
  } catch (error) {
    console.error(`   ❌ Inactivity check failed:`, error.message);
  }
}

/**
 * Start the scheduler
 */
async function startScheduler() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Schedule section pause and end check every 2 minutes
    cron.schedule('*/2 * * * *', () => {
      runSectionEndCheck();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust to your timezone
    });
    
    // Schedule inactivity check daily at midnight
    cron.schedule('0 0 * * *', () => {
      runInactivityCheck();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust to your timezone
    });
    
    console.log('✅ Pulse scheduler started');
    console.log('   - Section pause/end check: Every 2 minutes');
    console.log('   - Inactivity check: Daily at midnight');
    console.log('\n📊 Waiting for scheduled tasks...\n');
    
    // Run initial checks
    console.log('🚀 Running initial checks...');
    await runSectionEndCheck();
    await runInactivityCheck();
    
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down pulse scheduler...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down pulse scheduler...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Start the scheduler
startScheduler();
