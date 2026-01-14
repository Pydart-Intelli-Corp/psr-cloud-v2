const mysql = require('mysql2/promise');

async function createTestCorrection() {
  const conn = await mysql.createConnection({
    host: '168.231.121.19',
    user: 'psr_admin',
    password: 'PsrAdmin@20252!',
    database: 'psr_v4_main'
  });

  try {
    const schemaName = 'ali_ali2657';
    
    // Insert a test correction with status=1 (pending)
    const [result] = await conn.query(`
      INSERT INTO \`${schemaName}\`.machine_corrections 
      (machine_id, society_id, machine_type, 
       channel1_fat, channel1_snf, channel2_fat, 
       status, created_at, updated_at)
      VALUES (2, 3, 'LSE-SVPWTBQ-12AH', 0.25, 0.15, 0.30, 1, NOW(), NOW())
    `);
    
    console.log('✅ Test correction created with ID:', result.insertId);
    console.log('✅ Status: 1 (pending)');
    console.log('✅ Machine ID: 2 (M201)');
    console.log('\n📱 Now refresh the Flutter app to see the correction badge!');
    
  } finally {
    await conn.end();
  }
}

createTestCorrection().catch(console.error);
