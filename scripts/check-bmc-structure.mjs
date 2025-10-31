import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkBMCStructure() {
  try {
    console.log('🔍 Checking BMC table structure...\n');

    // Create Sequelize instance with SSL configuration
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
            ca: fs.readFileSync(path.join(process.cwd(), process.env.DB_SSL_CA))
          }
        }
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get all admin schemas - query actual schema names
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE (SCHEMA_NAME LIKE '%tis%' OR SCHEMA_NAME LIKE '%psr%')
      AND SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'psr_v4')
    `);

    console.log(`📊 Found ${schemas.length} schema(s)\n`);

    // Check each schema
    for (const schema of schemas) {
      const schemaName = schema.SCHEMA_NAME;
      console.log(`📦 Schema: ${schemaName}`);
      
      try {
        const [columns] = await sequelize.query(`DESCRIBE \`${schemaName}\`.\`bmcs\``);
        
        console.log('   Columns:');
        columns.forEach(col => {
          console.log(`      ${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }

    await sequelize.close();
    console.log('✅ Check completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBMCStructure();
