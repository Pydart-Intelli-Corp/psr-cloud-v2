const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tester_tes6572', 'psr_admin', 'PsrAdmin@20252!', {
  host: '168.231.121.19',
  dialect: 'mysql',
  logging: false
});

async function checkS101Pulse() {
  try {
    // Get society info
    const [societies] = await sequelize.query(`
      SELECT id, society_id, name 
      FROM societies 
      WHERE society_id = 'S-101' 
      LIMIT 1
    `);
    
    console.log('Society Info:');
    console.table(societies);
    
    if (societies.length === 0) {
      console.log('Society S-101 not found!');
      await sequelize.close();
      return;
    }
    
    const societyId = societies[0].id;
    
    // Get recent collections
    const [collections] = await sequelize.query(`
      SELECT id, collection_date, collection_time, shift_type 
      FROM milk_collections 
      WHERE society_id = ? 
      ORDER BY collection_date DESC, collection_time DESC 
      LIMIT 5
    `, { replacements: [societyId] });
    
    console.log('\nRecent Collections:');
    console.table(collections);
    
    // Get pulse records
    const [pulse] = await sequelize.query(`
      SELECT * 
      FROM section_pulse 
      WHERE society_id = ? 
      ORDER BY pulse_date DESC 
      LIMIT 3
    `, { replacements: [societyId] });
    
    console.log('\nPulse Records:');
    console.table(pulse);
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

checkS101Pulse();
