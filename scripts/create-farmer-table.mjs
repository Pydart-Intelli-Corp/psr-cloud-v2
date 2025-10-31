import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config({ path: '.env.local' });

async function createFarmerTable() {
  let connection;
  
  try {
    console.log('🚀 Creating farmer table in admin schemas...');
    
    // Create direct MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'psr_v4_c',
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to MySQL database');

    // Get all admin users
    const [admins] = await connection.execute(`
      SELECT id, fullName, dbKey 
      FROM users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    console.log(`📋 Found ${admins.length} admin users`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`🔧 Creating farmers table in schema: ${schemaName}`);

      // Check if schema exists
      const [schemas] = await connection.execute(`
        SELECT SCHEMA_NAME 
        FROM INFORMATION_SCHEMA.SCHEMATA 
        WHERE SCHEMA_NAME = ?
      `, [schemaName]);

      if (schemas.length === 0) {
        console.log(`⚠️ Schema ${schemaName} does not exist, skipping...`);
        continue;
      }

      // Check if societies table exists in the schema
      const [societiesTables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'societies'
      `, [schemaName]);

      if (societiesTables.length === 0) {
        console.log(`⚠️ Societies table does not exist in ${schemaName}, creating farmers table without foreign key constraint...`);
      }

      // Check if farmers table already exists
      const [existingTables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers'
      `, [schemaName]);

      if (existingTables.length > 0) {
        console.log(`✅ Farmers table already exists in schema: ${schemaName}`);
        continue;
      }

      // Create farmers table
      let createTableQuery;
      
      if (societiesTables.length > 0) {
        // With foreign key constraint
        createTableQuery = `
          CREATE TABLE \`${schemaName}\`.farmers (
            id INTEGER NOT NULL AUTO_INCREMENT,
            farmer_id VARCHAR(50) NOT NULL UNIQUE,
            rf_id VARCHAR(50) UNIQUE,
            farmer_name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL DEFAULT '12345678',
            contact_number VARCHAR(15),
            sms_enabled ENUM('ON', 'OFF') NOT NULL DEFAULT 'OFF',
            bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
            address TEXT,
            bank_name VARCHAR(255),
            bank_account_number VARCHAR(50),
            ifsc_code VARCHAR(11),
            society_id INTEGER,
            status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (society_id) REFERENCES \`${schemaName}\`.societies(id) ON DELETE SET NULL ON UPDATE CASCADE
          ) ENGINE=InnoDB;
        `;
      } else {
        // Without foreign key constraint
        createTableQuery = `
          CREATE TABLE \`${schemaName}\`.farmers (
            id INTEGER NOT NULL AUTO_INCREMENT,
            farmer_id VARCHAR(50) NOT NULL UNIQUE,
            rf_id VARCHAR(50) UNIQUE,
            farmer_name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL DEFAULT '12345678',
            contact_number VARCHAR(15),
            sms_enabled ENUM('ON', 'OFF') NOT NULL DEFAULT 'OFF',
            bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
            address TEXT,
            bank_name VARCHAR(255),
            bank_account_number VARCHAR(50),
            ifsc_code VARCHAR(11),
            society_id INTEGER,
            status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB;
        `;
      }

      await connection.execute(createTableQuery);
      console.log(`✅ Farmers table created successfully in schema: ${schemaName}`);
    }

    console.log('🎉 Farmer table creation completed!');

  } catch (error) {
    console.error('❌ Error creating farmer table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

createFarmerTable();