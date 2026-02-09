// Database diagnostic script
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('\n🔍 PSR Cloud V2 - Database Diagnostic\n');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('\n📋 Environment Configuration:');
  console.log(`   DB_HOST: ${process.env.DB_HOST || '❌ NOT SET'}`);
  console.log(`   DB_PORT: ${process.env.DB_PORT || '❌ NOT SET'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || '❌ NOT SET'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || '❌ NOT SET'}`);
  
  try {
    // Test connection
    console.log('\n🔌 Testing Database Connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'psr_v4_main',
    });
    
    console.log('   ✅ Connection successful!');
    
    // Check database exists
    console.log('\n📊 Checking Database...');
    const [databases] = await connection.execute(
      'SHOW DATABASES LIKE ?',
      [process.env.DB_NAME || 'psr_v4_main']
    );
    
    if (databases.length > 0) {
      console.log(`   ✅ Database '${process.env.DB_NAME}' exists`);
    } else {
      console.log(`   ❌ Database '${process.env.DB_NAME}' NOT FOUND`);
      await connection.end();
      return;
    }
    
    // Check tables
    console.log('\n📑 Checking Tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found - database is empty');
      console.log('\n💡 Solution: Run the following to create tables:');
      console.log('   cd /var/www/psr-v4');
      console.log('   node -e "require(\'./src/lib/database.ts\').initDatabase()"');
    } else {
      console.log(`   ✅ Found ${tables.length} tables:`);
      
      const requiredTables = [
        'users',
        'admin_schemas',
        'audit_logs',
        'machines'
      ];
      
      const tableNames = tables.map(t => Object.values(t)[0].toLowerCase());
      
      requiredTables.forEach(table => {
        if (tableNames.includes(table)) {
          console.log(`      ✅ ${table}`);
        } else {
          console.log(`      ❌ ${table} (MISSING)`);
        }
      });
      
      // Show all tables
      if (tables.length > requiredTables.length) {
        console.log('\n   📋 All tables:');
        tableNames.forEach(table => {
          if (!requiredTables.includes(table)) {
            console.log(`      • ${table}`);
          }
        });
      }
      
      // Check user permissions
      console.log('\n🔑 Checking User Permissions...');
      const [grants] = await connection.execute(
        `SHOW GRANTS FOR '${process.env.DB_USER}'@'localhost'`
      );
      
      console.log('   Current grants:');
      grants.forEach(grant => {
        console.log(`      ${Object.values(grant)[0]}`);
      });
    }
    
    // Test a simple query
    console.log('\n🧪 Testing Query Execution...');
    const [result] = await connection.execute('SELECT 1 + 1 AS result');
    console.log(`   ✅ Query successful: 1 + 1 = ${result[0].result}`);
    
    await connection.end();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database diagnostic complete!\n');
    
  } catch (error) {
    console.error('\n❌ Database Error:', error.message);
    console.error('\n💡 Common solutions:');
    console.error('   1. Check .env file exists and has correct values');
    console.error('   2. Verify MySQL is running: systemctl status mysql');
    console.error('   3. Check user/password: mysql -u psr_admin -p psr_v4_main');
    console.error('   4. Verify user has privileges: SHOW GRANTS FOR \'psr_admin\'@\'localhost\';');
    process.exit(1);
  }
}

checkDatabase();
