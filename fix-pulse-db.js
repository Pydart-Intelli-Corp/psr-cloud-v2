const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tester_tes6572', 'psr_admin', 'PsrAdmin@20252!', {
  host: '168.231.121.19',
  dialect: 'mysql',
  logging: false
});

async function fixPulseRecords() {
  try {
    console.log('Fixing pulse records for society 3...\n');

    // Update the correct date (2025-12-02) to active status
    await sequelize.query(`
      UPDATE section_pulse 
      SET first_collection_time = '2025-12-02 01:00:26',
          last_collection_time = '2025-12-02 01:00:26',
          pulse_status = 'active',
          total_collections = 1,
          inactive_days = 0,
          last_checked = NOW()
      WHERE society_id = 3 AND pulse_date = '2025-12-02'
    `);
    console.log('✅ Updated pulse record for 2025-12-02 to active');

    // Delete the wrong dated record
    await sequelize.query(`
      DELETE FROM section_pulse 
      WHERE society_id = 3 AND pulse_date = '2025-12-01' AND id = 5
    `);
    console.log('✅ Deleted wrong pulse record for 2025-12-01\n');

    // Show updated records
    const [result] = await sequelize.query(`
      SELECT id, society_id, pulse_date, pulse_status, 
             first_collection_time, last_collection_time, total_collections
      FROM section_pulse 
      WHERE society_id = 3 
      ORDER BY pulse_date DESC 
      LIMIT 3
    `);
    
    console.log('Updated pulse records for society 3:');
    console.table(result);

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

fixPulseRecords();
