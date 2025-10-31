import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'psrcloud',
  password: process.env.DB_PASSWORD || 'Access@LRC2404',
  database: process.env.DB_NAME || 'psr_v4_c',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

async function updateAdminFarmerTables() {
  let connection;

  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);

    // First, get all admin schemas
    console.log('📋 Fetching admin schemas...');
    const [adminRows] = await connection.execute(
      'SELECT id, fullName, dbKey FROM users WHERE role = ? AND dbKey IS NOT NULL',
      ['admin']
    );

    console.log(`📊 Found ${adminRows.length} admin schemas to update`);

    for (const admin of adminRows) {
      const schemaName = admin.dbKey;
      
      console.log(`\n🔧 Processing schema: ${schemaName} (Admin: ${admin.fullName})`);

      try {
        // Check if schema exists
        const [schemaExists] = await connection.execute(`
          SELECT SCHEMA_NAME 
          FROM INFORMATION_SCHEMA.SCHEMATA 
          WHERE SCHEMA_NAME = ?
        `, [schemaName]);

        if (schemaExists.length === 0) {
          console.log(`⚠️  Schema ${schemaName} does not exist, skipping...`);
          continue;
        }

        // Check if farmers table exists in this schema
        const [tableExists] = await connection.execute(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = 'farmers'
        `, [schemaName]);

        if (tableExists[0].count === 0) {
          console.log(`⚠️  Farmers table not found in schema ${schemaName}, skipping...`);
          continue;
        }

        // Get current ENUM values for status column
        const [enumInfo] = await connection.execute(`
          SELECT COLUMN_TYPE 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers' AND COLUMN_NAME = 'status'
        `, [schemaName]);

        if (enumInfo.length === 0) {
          console.log(`⚠️  Status column not found in ${schemaName}.farmers, skipping...`);
          continue;
        }

        const currentEnum = enumInfo[0].COLUMN_TYPE;
        console.log(`📝 Current status ENUM: ${currentEnum}`);

        // Check if 'maintenance' is already in the ENUM
        if (currentEnum && currentEnum.includes("'maintenance'")) {
          console.log(`✅ 'maintenance' status already exists in ${schemaName}`);
          continue;
        }

        // Add 'maintenance' to the ENUM
        console.log(`🔄 Adding 'maintenance' status to ${schemaName}.farmers...`);
        
        // Alter the table to update the ENUM
        await connection.execute(`
          ALTER TABLE \`${schemaName}\`.farmers 
          MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
          DEFAULT 'active' NOT NULL
        `);

        console.log(`✅ Successfully added 'maintenance' status to ${schemaName}.farmers`);

      } catch (schemaError) {
        console.error(`❌ Error processing schema ${schemaName}:`, schemaError.message);
      }
    }

    console.log('\n🎉 Admin schema update completed successfully!');

  } catch (error) {
    console.error('❌ Admin schema update failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
}

// Run the update
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAdminFarmerTables()
    .then(() => {
      console.log('\n✨ All done! The "maintenance" status has been added to all admin farmer tables.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin schema update failed:', error);
      process.exit(1);
    });
}

export default updateAdminFarmerTables;