const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '168.231.121.19',
    user: 'psr_admin',
    password: 'PsrAdmin@20252!',
    database: 'tester_tes6572',
    timezone: '+05:30'
  });

  const societyId = 2;
  const collectionDateTime = '2025-12-02 13:20:26';
  const datePart = '2025-12-02';

  console.log('Updating pulse for society', societyId, 'at', collectionDateTime);

  await conn.execute(`
    UPDATE section_pulse 
    SET 
      first_collection_time = ?,
      last_collection_time = ?,
      pulse_status = 'active',
      total_collections = 1,
      inactive_days = 0,
      section_end_time = NULL,
      last_checked = NOW()
    WHERE society_id = ? AND DATE(pulse_date) = ?
  `, [collectionDateTime, collectionDateTime, societyId, datePart]);

  console.log('✅ Pulse updated!');

  const [result] = await conn.execute(
    'SELECT * FROM section_pulse WHERE society_id = ? AND DATE(pulse_date) = ?',
    [societyId, datePart]
  );

  console.log('Updated pulse:', JSON.stringify(result, null, 2));

  await conn.end();
})();
