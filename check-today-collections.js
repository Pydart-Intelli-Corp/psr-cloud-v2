const { Sequelize } = require('sequelize');
const config = require('./config/database.js');

(async () => {
  const seq = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
      host: config.development.host,
      port: config.development.port,
      dialect: config.development.dialect,
      logging: false
    }
  );

  const [collections] = await seq.query(`
    SELECT * FROM tester_tes6572.milk_collections 
    WHERE society_id = 3 
      AND collection_date = '2025-12-02' 
    ORDER BY id DESC 
    LIMIT 5
  `);

  console.log('Recent collections for Milma_society (society_id=3):');
  console.table(collections);

  const [pulse] = await seq.query(`
    SELECT * FROM tester_tes6572.section_pulse 
    WHERE society_id = 3 
      AND pulse_date = '2025-12-02'
  `);

  console.log('\nPulse status:');
  console.table(pulse);

  await seq.close();
})();
