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

async function listAllSchemas() {
  let connection;

  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!');

    // Get all schemas
    console.log('📋 Listing all schemas...');
    const [schemas] = await connection.execute(`
      SELECT SCHEMA_NAME 
      FROM INFORMATION_SCHEMA.SCHEMATA 
      WHERE SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
      ORDER BY SCHEMA_NAME
    `);

    console.log(`📊 Found ${schemas.length} schemas:`);
    for (const schema of schemas) {
      console.log(`  - ${schema.SCHEMA_NAME}`);
      
      // Check if this schema has a farmers table
      const [tableExists] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'farmers'
      `, [schema.SCHEMA_NAME]);

      if (tableExists[0].count > 0) {
        console.log(`    ✅ Has farmers table`);
        
        // Get the status ENUM for this table
        const [enumInfo] = await connection.execute(`
          SELECT COLUMN_TYPE 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers' AND COLUMN_NAME = 'status'
        `, [schema.SCHEMA_NAME]);
        
        if (enumInfo.length > 0) {
          console.log(`    📝 Status ENUM: ${enumInfo[0].COLUMN_TYPE}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to list schemas:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
}

// Run the listing
listAllSchemas()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });