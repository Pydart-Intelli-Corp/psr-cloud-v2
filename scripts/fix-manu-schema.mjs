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

async function fixSpecificSchema() {
  let connection;

  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!');

    // Target the specific problematic schema
    const schemaName = 'manu_man5678';
    
    console.log(`\n🔧 Fixing schema: ${schemaName}`);

    try {
      // Check if farmers table exists in this schema
      const [tableExists] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'farmers'
      `, [schemaName]);

      console.log(`📋 Table exists check: ${tableExists[0].count > 0 ? 'YES' : 'NO'}`);

      if (tableExists[0].count === 0) {
        console.log(`⚠️  Farmers table not found in schema ${schemaName}`);
        return;
      }

      // Get current ENUM values for status column
      const [enumInfo] = await connection.execute(`
        SELECT COLUMN_TYPE 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers' AND COLUMN_NAME = 'status'
      `, [schemaName]);

      if (enumInfo.length === 0) {
        console.log(`⚠️  Status column not found in ${schemaName}.farmers`);
        return;
      }

      const currentEnum = enumInfo[0].COLUMN_TYPE;
      console.log(`📝 Current status ENUM: ${currentEnum}`);

      // Check if 'maintenance' is already in the ENUM
      if (currentEnum && currentEnum.includes("'maintenance'")) {
        console.log(`✅ 'maintenance' status already exists in ${schemaName}`);
        return;
      }

      // Add 'maintenance' to the ENUM
      console.log(`🔄 Adding 'maintenance' status to ${schemaName}.farmers...`);
      
      const alterQuery = `
        ALTER TABLE \`${schemaName}\`.farmers 
        MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
        DEFAULT 'active' NOT NULL
      `;
      
      console.log(`📝 Running query: ${alterQuery}`);
      
      await connection.execute(alterQuery);

      console.log(`✅ Successfully added 'maintenance' status to ${schemaName}.farmers`);

    } catch (schemaError) {
      console.error(`❌ Error processing schema ${schemaName}:`, schemaError.message);
    }

    console.log('\n🎉 Schema fix completed!');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
}

// Run the fix
fixSpecificSchema()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });