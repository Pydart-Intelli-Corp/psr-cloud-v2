const { Sequelize } = require('sequelize');
const config = require('./config/database.js');

async function verifyPulseTable() {
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

    // Check section_pulse table in tester_tes6572 schema
    const [columns] = await sequelize.query(`
      SHOW FULL COLUMNS FROM tester_tes6572.section_pulse
    `);

    console.log('📊 Section Pulse Table Structure:\n');
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default,
      Comment: col.Comment
    })));

    // Check indexes
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM tester_tes6572.section_pulse
    `);

    console.log('\n📑 Indexes:\n');
    const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
    uniqueIndexes.forEach(indexName => {
      const indexCols = indexes.filter(i => i.Key_name === indexName);
      console.log(`  ${indexName}:`, indexCols.map(i => i.Column_name).join(', '));
    });

    // Test insert
    console.log('\n🧪 Testing pulse record insertion...');
    
    await sequelize.query(`
      INSERT INTO tester_tes6572.section_pulse 
      (society_id, pulse_date, first_collection_time, last_collection_time, pulse_status, total_collections)
      VALUES (1, CURDATE(), NOW(), NOW(), 'active', 1)
      ON DUPLICATE KEY UPDATE 
        last_collection_time = NOW(),
        total_collections = total_collections + 1
    `);

    const [testRecord] = await sequelize.query(`
      SELECT * FROM tester_tes6572.section_pulse 
      WHERE pulse_date = CURDATE() AND society_id = 1
    `);

    if (testRecord.length > 0) {
      console.log('✅ Test record created/updated successfully');
      console.log('\nTest Record:');
      console.table(testRecord);

      // Clean up test record
      await sequelize.query(`
        DELETE FROM tester_tes6572.section_pulse 
        WHERE pulse_date = CURDATE() AND society_id = 1
      `);
      console.log('\n🧹 Test record cleaned up');
    }

    console.log('\n✅ Section Pulse table verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyPulseTable();
