import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
  user: process.env.DB_USER || 'psrcloud',
  password: process.env.DB_PASSWORD || 'Access@LRC2404',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'psr_v4_c',
  ssl: {
    rejectUnauthorized: false
  }
};

async function createMachinesTable() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully\n');

    // Get all admin users with dbKey
    console.log('📋 Fetching admin users...');
    const [admins] = await connection.execute(
      'SELECT id, fullName, dbKey FROM users WHERE role = ? AND dbKey IS NOT NULL',
      ['admin']
    );

    if (!admins.length) {
      console.log('⚠️  No admin users found with schemas');
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s) with schemas\n`);

    // Create machines table for each admin schema
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`\n📦 Processing schema: ${schemaName}`);
      console.log(`   Admin: ${admin.fullName} (ID: ${admin.id})`);

      try {
        // Check if machines table already exists
        const [tables] = await connection.execute(
          `SHOW TABLES FROM \`${schemaName}\` LIKE 'machines'`
        );

        if (tables && tables.length > 0) {
          console.log(`   ✓ machines table already exists, skipping...`);
          continue;
        }

        // Create machines table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machines\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`machine_id\` VARCHAR(50) NOT NULL UNIQUE,
            \`machine_type\` VARCHAR(100) NOT NULL,
            \`society_id\` INT NULL,
            \`location\` VARCHAR(255) NULL,
            \`installation_date\` DATE NULL,
            \`operator_name\` VARCHAR(100) NULL,
            \`contact_phone\` VARCHAR(15) NULL,
            \`status\` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
            \`notes\` TEXT NULL,
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            INDEX \`idx_machine_type\` (\`machine_type\`),
            INDEX \`idx_society_id\` (\`society_id\`),
            INDEX \`idx_status\` (\`status\`),
            INDEX \`idx_created_at\` (\`created_at\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log(`   ✅ machines table created successfully`);
        
        // Verify table creation
        const [verifyTables] = await connection.execute(
          `SHOW TABLES FROM \`${schemaName}\` LIKE 'machines'`
        );
        
        if (verifyTables && verifyTables.length > 0) {
          console.log(`   ✅ Verified: machines table exists`);
          
          // Show table structure
          const [columns] = await connection.execute(
            `DESCRIBE \`${schemaName}\`.\`machines\``
          );
          console.log(`   📋 Table has ${columns.length} columns`);
        }

      } catch (schemaError) {
        console.error(`   ❌ Error processing schema ${schemaName}:`, schemaError.message);
      }
    }

    console.log('\n🎉 Machines table creation completed!');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the function
console.log('🚀 Starting machines table creation in admin schemas...\n');
createMachinesTable().catch(console.error);