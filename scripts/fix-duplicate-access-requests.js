/**
 * Migration script to fix duplicate access requests issue
 * 
 * Problem: Multiple access requests can exist for same machine_id + user_id
 * causing expired requests to be shown when checking status
 * 
 * Solution:
 * 1. Delete duplicate/old access requests, keeping only the latest
 * 2. Add UNIQUE constraint on (machine_id, user_id)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDuplicateAccessRequests() {
  let mainConnection;
  
  try {
    console.log('🔧 Starting fix for duplicate access requests...\n');

    // Connect to main database
    mainConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✅ Connected to main database');

    // Get all admin schemas
    const [admins] = await mainConnection.query(
      'SELECT fullName, dbKey FROM users WHERE role = ?',
      ['admin']
    );

    if (!admins || admins.length === 0) {
      console.log('⚠️  No admin users found');
      return;
    }

    console.log(`📊 Found ${admins.length} admin(s)\n`);

    let totalFixed = 0;
    let totalSchemas = 0;

    // Process each admin schema
    for (const admin of admins) {
      const cleanName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanName}_${admin.dbKey.toLowerCase()}`;

      try {
        console.log(`\n📁 Processing schema: ${schemaName}`);
        
        // Check if schema exists
        const [schemas] = await mainConnection.query(
          'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
          [schemaName]
        );

        if (!schemas || schemas.length === 0) {
          console.log(`   ⏭️  Schema doesn't exist, skipping...`);
          continue;
        }

        // Check if table exists
        const [tables] = await mainConnection.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'machine_access_requests'`,
          [schemaName]
        );

        if (!tables || tables.length === 0) {
          console.log(`   ⏭️  Table doesn't exist, skipping...`);
          continue;
        }

        totalSchemas++;

        // Find duplicates
        const [duplicates] = await mainConnection.query(
          `SELECT machine_id, user_id, COUNT(*) as count
           FROM \`${schemaName}\`.machine_access_requests
           GROUP BY machine_id, user_id
           HAVING count > 1`
        );

        if (duplicates && duplicates.length > 0) {
          console.log(`   🔍 Found ${duplicates.length} duplicate group(s)`);

          for (const dup of duplicates) {
            // Get all requests for this machine_id + user_id
            const [requests] = await mainConnection.query(
              `SELECT id, status, created_at, updated_at, expires_at
               FROM \`${schemaName}\`.machine_access_requests
               WHERE machine_id = ? AND user_id = ?
               ORDER BY updated_at DESC, created_at DESC`,
              [dup.machine_id, dup.user_id]
            );

            // Keep the latest one (first in the array)
            const keepId = requests[0].id;
            const deleteIds = requests.slice(1).map(r => r.id);

            console.log(`      Machine ${dup.machine_id}, User ${dup.user_id}:`);
            console.log(`         Keeping request ID: ${keepId} (${requests[0].status})`);
            console.log(`         Deleting ${deleteIds.length} old request(s): ${deleteIds.join(', ')}`);

            // Delete old requests
            if (deleteIds.length > 0) {
              await mainConnection.query(
                `DELETE FROM \`${schemaName}\`.machine_access_requests
                 WHERE id IN (${deleteIds.join(',')})` 
              );
              totalFixed += deleteIds.length;
            }
          }
        } else {
          console.log(`   ✅ No duplicates found`);
        }

        // Check if UNIQUE constraint already exists
        const [constraints] = await mainConnection.query(
          `SELECT CONSTRAINT_NAME 
           FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
           WHERE TABLE_SCHEMA = ? 
           AND TABLE_NAME = 'machine_access_requests'
           AND CONSTRAINT_TYPE = 'UNIQUE'
           AND CONSTRAINT_NAME = 'unique_machine_user'`,
          [schemaName]
        );

        if (!constraints || constraints.length === 0) {
          console.log(`   🔨 Adding UNIQUE constraint...`);
          
          try {
            await mainConnection.query(
              `ALTER TABLE \`${schemaName}\`.machine_access_requests
               ADD UNIQUE KEY unique_machine_user (machine_id, user_id)`
            );
            console.log(`   ✅ UNIQUE constraint added successfully`);
          } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
              console.log(`   ⚠️  Constraint already exists (different name)`);
            } else {
              throw err;
            }
          }
        } else {
          console.log(`   ✅ UNIQUE constraint already exists`);
        }

      } catch (schemaError) {
        console.error(`   ❌ Error processing schema ${schemaName}:`, schemaError.message);
      }
    }

    console.log(`\n\n✅ Migration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Schemas processed: ${totalSchemas}`);
    console.log(`   - Duplicate requests deleted: ${totalFixed}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  } finally {
    if (mainConnection) {
      await mainConnection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
fixDuplicateAccessRequests()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
