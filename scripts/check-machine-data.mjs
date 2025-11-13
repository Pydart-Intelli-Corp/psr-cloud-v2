import mysql from 'mysql2/promise';

async function checkMachineData() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '168.231.121.19',
      port: 3306,
      user: 'psr_admin',
      password: 'PsrAdmin@20252!',
      database: 'psr_v4_main'
    });

    console.log('✅ Connected to database\n');

    const schemaName = 'poornasreeequipments_poo5382';

    console.log(`📊 Checking ${schemaName}...\n`);

    // Check machines
    console.log('=== MACHINES TABLE ===');
    const [machines] = await connection.query(`
      SELECT id, machine_id, machine_type, society_id, status 
      FROM \`${schemaName}\`.machines 
      WHERE society_id = 1
      LIMIT 10
    `);
    console.log(JSON.stringify(machines, null, 2));

    console.log('\n=== MACHINE CORRECTIONS ===');
    const [corrections] = await connection.query(`
      SELECT id, machine_id, society_id, machine_type, status, created_at 
      FROM \`${schemaName}\`.machine_corrections 
      WHERE society_id = 1 AND status = 1
    `);
    console.log(JSON.stringify(corrections, null, 2));

    await connection.end();
    console.log('\n✅ Done');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMachineData();
