const { Sequelize } = require('sequelize');
const SectionPulseTracker = require('./src/lib/sectionPulseTracker').default;

const sequelize = new Sequelize('tester_tes6572', 'psr_admin', 'PsrAdmin@20252!', {
  host: '168.231.121.19',
  dialect: 'mysql',
  logging: console.log
});

async function updatePulse() {
  try {
    console.log('\n🔧 Manually updating pulse for S-101 collection at 2025-12-02 13:00:26...\n');
    
    const schemaName = 'tester_tes6572';
    const societyId = 1; // Amul_society (S-101)
    const collectionDateTime = '2025-12-02 13:00:26';
    
    await SectionPulseTracker.updatePulseOnCollection(
      sequelize,
      schemaName,
      societyId,
      collectionDateTime
    );
    
    console.log('\n✅ Pulse update complete!\n');
    
    // Check the result
    const [pulse] = await sequelize.query(`
      SELECT * 
      FROM section_pulse 
      WHERE society_id = 1 AND pulse_date = '2025-12-02'
    `);
    
    console.log('Updated Pulse Record:');
    console.table(pulse);
    
    await sequelize.close();
  } catch (error) {
    console.error('\n❌ Error updating pulse:', error);
    console.error('Stack:', error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

updatePulse();
