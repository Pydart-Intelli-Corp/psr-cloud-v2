import mysql from 'mysql2/promise';

async function addMachineTypeColumn() {
  let connection;
  
  try {
    // Connect to database - VPS MySQL
    connection = await mysql.createConnection({
      host: '168.231.121.19',
      port: 3306,
      user: 'psr_admin',
      password: 'PsrAdmin@20252!',
      database: 'psr_v4_main'
    });

    console.log('✅ Connected to database');

    // Get all admin users with dbKey
    const [admins] = await connection.query(`
      SELECT id, fullName, dbKey 
      FROM users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    console.log(`📊 Found ${admins.length} admin users`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`\n🔄 Processing schema: ${schemaName}`);

      try {
        // Check if machine_corrections table exists
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'machine_corrections'
        `, [schemaName]);

        if (tables.length === 0) {
          console.log(`  ⚠️  Table machine_corrections does not exist in ${schemaName}`);
          continue;
        }

        // Check if machine_type column already exists
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'machine_corrections' AND COLUMN_NAME = 'machine_type'
        `, [schemaName]);

        if (columns.length > 0) {
          console.log(`  ℹ️  Column machine_type already exists in ${schemaName}.machine_corrections`);
          continue;
        }

        // Add machine_type column
        await connection.query(`
          ALTER TABLE \`${schemaName}\`.\`machine_corrections\`
          ADD COLUMN \`machine_type\` VARCHAR(100) COMMENT 'Machine type/model for reference' AFTER \`society_id\`,
          ADD INDEX \`idx_machine_type\` (\`machine_type\`)
        `);

        console.log(`  ✅ Added machine_type column to ${schemaName}.machine_corrections`);

        // Update existing records with machine_type from machines table
        await connection.query(`
          UPDATE \`${schemaName}\`.\`machine_corrections\` mc
          INNER JOIN \`${schemaName}\`.\`machines\` m ON mc.machine_id = m.id
          SET mc.machine_type = m.machine_type
          WHERE mc.machine_type IS NULL
        `);

        console.log(`  ✅ Updated existing correction records with machine_type`);

      } catch (schemaError) {
        console.error(`  ❌ Error processing schema ${schemaName}:`, schemaError.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
addMachineTypeColumn();
