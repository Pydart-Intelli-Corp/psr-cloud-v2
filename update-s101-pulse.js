const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tester_tes6572', 'psr_admin', 'PsrAdmin@20252!', {
  host: '168.231.121.19',
  dialect: 'mysql',
  logging: false
});

async function updatePulseManually() {
  try {
    console.log('\n🔧 Manually updating pulse for S-101...\n');
    
    const societyId = 1;
    const collectionDateTime = '2025-12-02 13:00:26';
    
    // Extract date directly (IST format)
    const dateStr = collectionDateTime.split(' ')[0]; // "2025-12-02"
    const [datePart, timePart] = collectionDateTime.split(' ');
    const collectionDate = new Date(`${datePart}T${timePart}+05:30`);
    
    console.log(`📍 Updating pulse for society ${societyId} on ${dateStr}`);
    console.log(`   Collection datetime: ${collectionDateTime}`);
    console.log(`   Parsed as IST: ${collectionDate.toISOString()}`);
    
    // Check if pulse record exists for today
    const [existingPulse] = await sequelize.query(`
      SELECT id, first_collection_time, total_collections
      FROM section_pulse
      WHERE society_id = ? AND pulse_date = ?
      LIMIT 1
    `, {
      replacements: [societyId, dateStr]
    });
    
    console.log(`\nExisting pulse record:`, existingPulse);
    
    if (existingPulse.length > 0) {
      // Update existing pulse
      const pulse = existingPulse[0];
      const isFirstCollection = !pulse.first_collection_time;
      
      if (isFirstCollection) {
        // First collection of the day
        await sequelize.query(`
          UPDATE section_pulse
          SET first_collection_time = ?,
              last_collection_time = ?,
              pulse_status = 'active',
              total_collections = 1,
              inactive_days = 0,
              last_checked = NOW(),
              updated_at = NOW()
          WHERE id = ?
        `, {
          replacements: [collectionDateTime, collectionDateTime, pulse.id]
        });
        console.log(`\n✅ Updated pulse as FIRST collection`);
      } else {
        // Subsequent collection
        await sequelize.query(`
          UPDATE section_pulse
          SET last_collection_time = ?,
              pulse_status = 'active',
              total_collections = total_collections + 1,
              inactive_days = 0,
              last_checked = NOW(),
              updated_at = NOW()
          WHERE id = ?
        `, {
          replacements: [collectionDateTime, pulse.id]
        });
        console.log(`\n✅ Updated pulse as subsequent collection`);
      }
    } else {
      // Create new pulse record
      await sequelize.query(`
        INSERT INTO section_pulse (
          society_id, pulse_date, first_collection_time, last_collection_time,
          pulse_status, total_collections, inactive_days, last_checked,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', 1, 0, NOW(), NOW(), NOW())
      `, {
        replacements: [societyId, dateStr, collectionDateTime, collectionDateTime]
      });
      console.log(`\n✅ Created new pulse record`);
    }
    
    // Show the result
    const [result] = await sequelize.query(`
      SELECT * 
      FROM section_pulse 
      WHERE society_id = ? AND pulse_date = ?
    `, {
      replacements: [societyId, dateStr]
    });
    
    console.log('\nFinal Pulse Record:');
    console.table(result);
    
    await sequelize.close();
  } catch (error) {
    console.error('\n❌ Error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

updatePulseManually();
