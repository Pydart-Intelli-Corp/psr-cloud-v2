const mysql = require('mysql2/promise');

async function checkIndexes() {
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
    const [indexes] = await connection.execute('SHOW INDEX FROM users');
    console.log('Existing indexes on users table:');
    const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
    uniqueIndexes.forEach(name => {
      const columns = indexes.filter(idx => idx.Key_name === name).map(idx => idx.Column_name);
      console.log(`- ${name}: ${columns.join(', ')}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkIndexes();
