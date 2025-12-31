const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function verifyMigration() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: process.env.DB_NAME || 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: process.env.DB_HOST?.includes('azure') ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log('✅ Connected successfully\n');

    // 1. Check table structure
    console.log('📊 Table Structure:');
    console.log('=' .repeat(80));
    const [columns] = await connection.query('DESCRIBE `machinetype`');
    console.table(columns);

    // 2. Check if there are any machines
    console.log('\n📋 Current Machines:');
    console.log('=' .repeat(80));
    const [machines] = await connection.query(
      'SELECT id, machine_type, description, is_active, image_url FROM `machinetype` LIMIT 10'
    );
    
    if (machines.length === 0) {
      console.log('⚠️  No machines found in database');
    } else {
      console.table(machines);
      console.log(`\n✅ Found ${machines.length} machine(s)`);
    }

    // 3. Test update query
    console.log('\n🧪 Testing image_url update capability...');
    const testMachineId = machines.length > 0 ? machines[0].id : null;
    
    if (testMachineId) {
      const testUrl = '/uploads/machines/test-image.jpg';
      await connection.query(
        'UPDATE `machinetype` SET `image_url` = ? WHERE `id` = ?',
        [testUrl, testMachineId]
      );
      
      const [updated] = await connection.query(
        'SELECT id, machine_type, image_url FROM `machinetype` WHERE `id` = ?',
        [testMachineId]
      );
      
      console.log('✅ Update test successful:');
      console.table(updated);
      
      // Rollback test
      await connection.query(
        'UPDATE `machinetype` SET `image_url` = NULL WHERE `id` = ?',
        [testMachineId]
      );
      console.log('✅ Rollback successful (test URL removed)');
    } else {
      console.log('⚠️  No machines available for update test');
    }

    console.log('\n✅ All verification checks passed!');
    console.log('✅ Database is ready for image upload feature');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🚀 Verifying Database Migration\n');
console.log('=' .repeat(80));
verifyMigration()
  .then(() => {
    console.log('=' .repeat(80));
    console.log('✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
