import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing BMC columns...\n');

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

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME LIKE '%tis%'
      AND SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
    `);

    console.log(`📊 Found ${schemas.length} schema(s) to update\n`);

    // Columns to add
    const columnsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)', nullable: true },
      { name: 'email', type: 'VARCHAR(255)', nullable: true },
      { name: 'status', type: "ENUM('active', 'inactive')", default: "'active'" },
      { name: 'monthly_target', type: 'DECIMAL(10,2)', nullable: true }
    ];

    // Process each schema
    for (const schema of schemas) {
      const schemaName = schema.SCHEMA_NAME;
      console.log(`📦 Processing schema: ${schemaName}`);

      try {
        // Check which columns exist
        const [existingColumns] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = '${schemaName}' 
          AND TABLE_NAME = 'bmcs'
        `);

        const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);

        // Add missing columns
        for (const column of columnsToAdd) {
          if (!existingColumnNames.includes(column.name)) {
            console.log(`   ➕ Adding ${column.name} column...`);
            
            let alterQuery = `ALTER TABLE \`${schemaName}\`.\`bmcs\` ADD COLUMN \`${column.name}\` ${column.type}`;
            
            if (column.nullable === false) {
              alterQuery += ' NOT NULL';
            }
            
            if (column.default) {
              alterQuery += ` DEFAULT ${column.default}`;
            }

            await sequelize.query(alterQuery);
            console.log(`   ✅ Column ${column.name} added successfully`);
          } else {
            console.log(`   ℹ️  Column ${column.name} already exists`);
          }
        }

        console.log('');
      } catch (error) {
        console.log(`   ❌ Error processing schema: ${error.message}\n`);
      }
    }

    await sequelize.close();
    console.log('✅ BMC columns update completed!');
    console.log('🎉 Migration script finished successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingColumns();
