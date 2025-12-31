const mysql = require('mysql2/promise');

async function checkCorrections() {
  const conn = await mysql.createConnection({
    host: '168.231.121.19',
    user: 'psr_admin',
    password: 'PsrAdmin@20252!',
    database: 'psr_v4_main'
  });

  try {
    // Get admin with dbKey ALI2657
    const [admins] = await conn.query(`SELECT id, fullName, dbKey FROM users WHERE dbKey = 'ALI2657'`);
    if (admins.length === 0) {
      console.log('Admin not found');
      return;
    }
    
    const admin = admins[0];
    console.log('Admin:', admin);
    
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    console.log('Schema:', schemaName);
    
    // Get machine M201 in society S-102
    const [machines] = await conn.query(`
      SELECT m.id, m.machine_id, m.society_id, s.society_id as society_identifier
      FROM \`${schemaName}\`.machines m
      JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
      WHERE m.machine_id = 'M201' AND s.society_id = 'S-102'
    `);
    
    if (machines.length === 0) {
      console.log('Machine M201 not found');
      return;
    }
    
    console.log('\nMachine:', machines[0]);
    
    // Check corrections for this machine
    const [corrections] = await conn.query(`
      SELECT * FROM \`${schemaName}\`.machine_corrections 
      WHERE machine_id = ?
      ORDER BY created_at DESC
    `, [machines[0].id]);
    
    console.log('\nCorrections found:', corrections.length);
    console.log(JSON.stringify(corrections, null, 2));
    
  } finally {
    await conn.end();
  }
}

checkCorrections().catch(console.error);
