const { Sequelize } = require('sequelize');
const config = require('./config/database.js');

async function checkPulseStatus() {
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

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check pulse records for today in tester_tes6572 schema
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Checking pulse records for: ${today}\n`);

    const [pulseRecords] = await sequelize.query(`
      SELECT 
        sp.*,
        s.name as society_name,
        s.society_id as society_code
      FROM tester_tes6572.section_pulse sp
      JOIN tester_tes6572.societies s ON s.id = sp.society_id
      WHERE sp.pulse_date = '${today}'
      ORDER BY sp.society_id
    `);

    if (pulseRecords.length === 0) {
      console.log('❌ No pulse records found for today');
      console.log('\n🔍 Checking recent collections...\n');
      
      const [collections] = await sequelize.query(`
        SELECT 
          society_id,
          collection_date,
          collection_time,
          COUNT(*) as count
        FROM tester_tes6572.milk_collections
        WHERE collection_date = '${today}'
        GROUP BY society_id, collection_date, collection_time
        ORDER BY collection_time DESC
        LIMIT 10
      `);
      
      console.table(collections);
    } else {
      console.log('✅ Found pulse records:\n');
      console.table(pulseRecords.map(p => ({
        ID: p.id,
        Society: p.society_name,
        Code: p.society_code,
        Status: p.pulse_status,
        'First Collection': p.first_collection_time,
        'Last Collection': p.last_collection_time,
        'Total Collections': p.total_collections,
        'Inactive Days': p.inactive_days
      })));
    }

    // Check the specific society (S-103)
    console.log('\n🔍 Checking society S-103 (Milma_society)...\n');
    
    const [society] = await sequelize.query(`
      SELECT * FROM tester_tes6572.societies 
      WHERE society_id = 'S-103' OR name LIKE '%Milma%'
    `);
    
    if (society.length > 0) {
      console.log('Society found:');
      console.table(society.map(s => ({
        ID: s.id,
        Name: s.name,
        Code: s.society_id,
        Status: s.status
      })));
      
      // Check collections for this society today
      const [todayCollections] = await sequelize.query(`
        SELECT 
          collection_date,
          collection_time,
          farmer_code,
          milk_type,
          quantity,
          fat,
          snf
        FROM tester_tes6572.milk_collections
        WHERE society_id = ${society[0].id}
          AND collection_date = '${today}'
        ORDER BY collection_time DESC
      `);
      
      console.log(`\n📊 Collections for ${society[0].name} today:\n`);
      console.table(todayCollections);
    } else {
      console.log('❌ Society S-103 not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkPulseStatus();
