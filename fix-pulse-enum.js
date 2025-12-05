const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

async function fixPulseEnum() {
  const sequelize = new Sequelize('tester_tes6572', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('🔧 Adding \'paused\' to pulse_status ENUM...');
    
    await sequelize.query(`
      ALTER TABLE section_pulse 
      MODIFY COLUMN pulse_status 
      ENUM('not_started', 'active', 'paused', 'ended', 'inactive') 
      NOT NULL DEFAULT 'not_started'
    `);
    
    console.log('✅ Migration applied successfully to tester_tes6572');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixPulseEnum();
