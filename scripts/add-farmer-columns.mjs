import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addFarmerColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Adding missing columns to farmers table...');

    // First, check current table structure
    const [currentColumns] = await connection.execute('DESCRIBE tishnu_tis6517.farmers');
    console.log('Current columns:');
    currentColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    // Add missing columns if they don't exist
    const columnsToAdd = [
      'sms_enabled ENUM(\'ON\', \'OFF\') DEFAULT \'OFF\' AFTER phone',
      'bonus DECIMAL(10,2) DEFAULT 0.00 AFTER sms_enabled',
      'bank_name VARCHAR(100) NULL AFTER address',
      'bank_account_number VARCHAR(50) NULL AFTER bank_name',
      'ifsc_code VARCHAR(15) NULL AFTER bank_account_number',
      'status ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\' AFTER ifsc_code',
      'notes TEXT NULL AFTER status',
      'password VARCHAR(255) NULL AFTER notes'
    ];

    for (const columnDef of columnsToAdd) {
      const columnName = columnDef.split(' ')[0];
      
      // Check if column already exists
      const columnExists = currentColumns.some(col => col.Field === columnName);
      
      if (!columnExists) {
        try {
          const alterQuery = `ALTER TABLE tishnu_tis6517.farmers ADD COLUMN ${columnDef}`;
          await connection.execute(alterQuery);
          console.log(`✅ Added column: ${columnName}`);
        } catch (error) {
          console.error(`❌ Error adding column ${columnName}:`, error.message);
        }
      } else {
        console.log(`ℹ️  Column ${columnName} already exists`);
      }
    }

    // Check final structure
    console.log('\n📋 Final table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE tishnu_tis6517.farmers');
    finalColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });

    console.log('\n✅ Farmers table structure updated successfully!');

  } catch (error) {
    console.error('❌ Error updating farmers table:', error);
  } finally {
    await connection.end();
  }
}

addFarmerColumns();