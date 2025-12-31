const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAccessRequestsStatus() {
  let mainConnection;

  try {
    console.log('🔧 Updating machine_access_requests table to add "active" status...\n');

    // Connect to main database
    mainConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✓ Connected to database\n');

    // Get all admin users
    const [admins] = await mainConnection.query(
      'SELECT id, fullName, dbKey FROM users WHERE role = ?',
      ['admin']
    );

    console.log(`📊 Found ${admins.length} admin(s)\n`);

    // Update each admin schema
    for (const admin of admins) {
      if (!admin.dbKey) {
        console.log(`⚠️  Skipping ${admin.fullName} - no dbKey`);
        continue;
      }

      const cleanName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanName}_${admin.dbKey.toLowerCase()}`;

      console.log(`📝 Updating schema: ${schemaName}`);

      try {
        // Check if table exists
        const [tables] = await mainConnection.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'machine_access_requests'`,
          [schemaName]
        );

        if (tables.length === 0) {
          console.log(`   ⚠️  Table doesn't exist in ${schemaName}, skipping`);
          continue;
        }

        // Modify the status column to add 'active' value
        await mainConnection.query(
          `ALTER TABLE \`${schemaName}\`.machine_access_requests 
           MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'pending' 
           COMMENT 'Request status: pending=waiting, approved=admin approved (needs user to start), active=timer running, rejected=denied'`
        );

        console.log(`   ✅ Status column updated successfully in ${schemaName}\n`);
      } catch (err) {
        console.error(`   ❌ Error updating ${schemaName}:`, err.message);
      }
    }

    await mainConnection.end();
    console.log('✅ All schemas updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateAccessRequestsStatus();
