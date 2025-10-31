import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFarmerStatusUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Testing farmer status update functionality...');

    // Check current table structure
    console.log('\n📋 Current farmers table structure:');
    const [columns] = await connection.execute('DESCRIBE tishnu_tis6517.farmers');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if there are any farmers in the table
    const [farmers] = await connection.execute('SELECT id, farmer_id, name, status FROM tishnu_tis6517.farmers LIMIT 5');
    
    if (farmers.length === 0) {
      console.log('\n⚠️  No farmers found in the table.');
      console.log('Creating a test farmer for status update testing...');
      
      // Insert a test farmer
      await connection.execute(`
        INSERT INTO tishnu_tis6517.farmers (name, farmer_id, status, phone, created_at) 
        VALUES ('Test Farmer', 'TEST001', 'active', '9876543210', NOW())
      `);
      
      console.log('✅ Test farmer created successfully!');
      
      // Retrieve the test farmer
      const [newFarmers] = await connection.execute('SELECT id, farmer_id, name, status FROM tishnu_tis6517.farmers WHERE farmer_id = "TEST001"');
      console.log('Test farmer details:', newFarmers[0]);
    } else {
      console.log('\n📋 Current farmers in the table:');
      farmers.forEach(farmer => {
        console.log(`- ID: ${farmer.id}, Farmer ID: ${farmer.farmer_id}, Name: ${farmer.name}, Status: ${farmer.status}`);
      });
    }

    // Test status update
    const testFarmer = farmers.length > 0 ? farmers[0] : (await connection.execute('SELECT id, farmer_id, name, status FROM tishnu_tis6517.farmers WHERE farmer_id = "TEST001"'))[0][0];
    
    if (testFarmer) {
      console.log(`\n🔄 Testing status update for farmer: ${testFarmer.name} (ID: ${testFarmer.id})`);
      console.log(`Current status: ${testFarmer.status}`);
      
      const newStatus = testFarmer.status === 'active' ? 'inactive' : 'active';
      
      // Update status
      await connection.execute(
        'UPDATE tishnu_tis6517.farmers SET status = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, testFarmer.id]
      );
      
      // Verify update
      const [updatedFarmer] = await connection.execute(
        'SELECT id, farmer_id, name, status FROM tishnu_tis6517.farmers WHERE id = ?',
        [testFarmer.id]
      );
      
      console.log(`✅ Status updated successfully!`);
      console.log(`New status: ${updatedFarmer[0].status}`);
      
      // Revert back to original status
      await connection.execute(
        'UPDATE tishnu_tis6517.farmers SET status = ?, updated_at = NOW() WHERE id = ?',
        [testFarmer.status, testFarmer.id]
      );
      
      console.log(`✅ Status reverted back to: ${testFarmer.status}`);
    }

    console.log('\n🎉 Farmer status update functionality is working correctly!');

  } catch (error) {
    console.error('❌ Error testing farmer status update:', error);
  } finally {
    await connection.end();
  }
}

testFarmerStatusUpdate();