const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'psr-v4-server.mysql.database.azure.com',
    user: 'psradmin',
    password: 'Psr@2025',
    database: 'POO5382',
    ssl: { rejectUnauthorized: false }
  });

  console.log('=== MACHINES TABLE ===');
  const [machines] = await conn.query(
    'SELECT id, machine_id, society_id, status FROM poornasreeequipments_poo5382.machines LIMIT 10'
  );
  console.log(JSON.stringify(machines, null, 2));

  console.log('\n=== MACHINE CORRECTIONS ===');
  const [corrections] = await conn.query(
    'SELECT id, machine_id, society_id, status FROM poornasreeequipments_poo5382.machine_corrections WHERE status = 1'
  );
  console.log(JSON.stringify(corrections, null, 2));

  await conn.end();
})().catch(console.error);
