const { Sequelize, QueryTypes } = require('sequelize');
const config = require('./config/database.js');

async function updatePulse() {
  const dbConfig = config.development;
  
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    const schemaName = 'tester_tes6572';
    const societyId = 3; // Milma_society
    const collectionDateTime = '2025-12-02 01:00:26';
    
    console.log('Updating pulse for:');
    console.log(`  Schema: ${schemaName}`);
    console.log(`  Society ID: ${societyId}`);
    console.log(`  Collection DateTime: ${collectionDateTime}\n`);

    // Parse collection datetime
    const collectionDate = new Date(collectionDateTime);
    const dateStr = collectionDate.toISOString().split('T')[0];
    
    console.log(`  Date string: ${dateStr}\n`);

    // Check if pulse record exists
    const existingPulse = await sequelize.query(`
      SELECT id, first_collection_time, total_collections, pulse_status
      FROM \`${schemaName}\`.section_pulse
      WHERE society_id = ? AND pulse_date = ?
    `, {
      replacements: [societyId, dateStr],
      type: QueryTypes.SELECT
    });

    console.log('Existing pulse record:');
    console.table(existingPulse);

    if (!existingPulse || existingPulse.length === 0) {
      // Insert new pulse record
      console.log('\n📝 Creating new pulse record...');
      
      await sequelize.query(`
        INSERT INTO \`${schemaName}\`.section_pulse (
          society_id,
          pulse_date,
          first_collection_time,
          last_collection_time,
          pulse_status,
          total_collections,
          inactive_days,
          last_checked
        ) VALUES (?, ?, ?, ?, 'active', 1, 0, NOW())
      `, {
        replacements: [societyId, dateStr, collectionDateTime, collectionDateTime]
      });
      
      console.log('✅ New pulse record created');
    } else {
      // Update existing pulse record
      console.log('\n📝 Updating existing pulse record...');
      
      await sequelize.query(`
        UPDATE \`${schemaName}\`.section_pulse
        SET last_collection_time = ?,
            total_collections = total_collections + 1,
            pulse_status = 'active',
            section_end_time = NULL,
            inactive_days = 0,
            last_checked = NOW()
        WHERE society_id = ? AND pulse_date = ?
      `, {
        replacements: [collectionDateTime, societyId, dateStr]
      });
      
      console.log('✅ Pulse record updated');
    }

    // Check the updated record
    const updatedPulse = await sequelize.query(`
      SELECT * FROM \`${schemaName}\`.section_pulse
      WHERE society_id = ? AND pulse_date = ?
    `, {
      replacements: [societyId, dateStr],
      type: QueryTypes.SELECT
    });

    console.log('\n✅ Updated pulse record:');
    console.table(updatedPulse);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

updatePulse();
