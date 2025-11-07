import { Sequelize, QueryTypes } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function listAdminSchemas() {
  // Create Sequelize instance
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'psr_v4_c',
    process.env.DB_USER || 'psrcloud',
    process.env.DB_PASSWORD || 'Access@LRC2404',
    {
      host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      dialectModule: mysql2,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        connectTimeout: 30000,
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: false
    }
  );

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');
    
    console.log('🔍 Searching for admin schemas...\n');

    // Get all databases that start with 'admin_'
    const schemas = await sequelize.query(
      `SELECT SCHEMA_NAME 
       FROM INFORMATION_SCHEMA.SCHEMATA 
       WHERE SCHEMA_NAME LIKE 'admin_%'
       ORDER BY SCHEMA_NAME`,
      { type: QueryTypes.SELECT }
    );

    if (!schemas || schemas.length === 0) {
      console.log('⚠️  No admin schemas found.');
      console.log('\nAdmin schemas should have names like:');
      console.log('  - admin_john_psr2024');
      console.log('  - admin_test_db');
      console.log('  - admin_company_key');
      return;
    }

    console.log(`📋 Found ${schemas.length} admin schema(s):\n`);
    console.log('='.repeat(60));
    
    schemas.forEach((schema, index) => {
      console.log(`${index + 1}. ${schema.SCHEMA_NAME}`);
    });
    
    console.log('='.repeat(60));
    console.log('\n📝 To create the machine_corrections table, run:');
    console.log('\nnode scripts/create-machine-corrections-for-schema.mjs <schema_name>\n');
    console.log('Example:');
    console.log(`node scripts/create-machine-corrections-for-schema.mjs ${schemas[0].SCHEMA_NAME}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run
listAdminSchemas()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
