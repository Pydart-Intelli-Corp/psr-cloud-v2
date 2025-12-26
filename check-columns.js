const mysql = require('mysql2/promise');

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: '168.231.121.19',
    user: 'psr_admin',
    password: 'PsrAdmin@20252!',
    database: 'psr_v4_main',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const [columns] = await connection.execute('SHOW COLUMNS FROM users');
    console.log('Columns in users table:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkColumns();
