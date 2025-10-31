#!/usr/bin/env node

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

async function updateAllAdminSchemas() {
  let connection;
  
  try {
    console.log('🚀 Starting machine_id column addition to farmer tables in all admin schemas...');

    // Connect to database
    connection = await mysql.createConnection(dbConfig);

    // Get all admin schemas
    const [schemas] = await connection.execute(`
      SELECT DISTINCT TABLE_SCHEMA as schema_name
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE '%_%' 
      AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
      AND TABLE_NAME = 'farmers'
    `);

    console.log(`📋 Found ${schemas.length} admin schemas with farmer tables`);

    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      console.log(`\n🏗️ Processing schema: ${schemaName}`);

      try {
        // Check if machine_id column already exists
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = '${schemaName}' 
          AND TABLE_NAME = 'farmers' 
          AND COLUMN_NAME = 'machine_id'
        `);

        if (columns.length > 0) {
          console.log(`   ✅ machine_id column already exists in ${schemaName}.farmers`);
          continue;
        }

        // Check if machines table exists in this schema
        const [machinesTable] = await connection.execute(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = '${schemaName}' 
          AND TABLE_NAME = 'machines'
        `);

        if (machinesTable.length === 0) {
          console.log(`   ⚠️ machines table not found in ${schemaName}, skipping...`);
          continue;
        }

        // Add machine_id column to farmers table
        await connection.execute(`
          ALTER TABLE \`${schemaName}\`.farmers 
          ADD COLUMN machine_id INT NULL 
          COMMENT 'Reference to assigned machine'
        `);

        // Add foreign key constraint
        try {
          await connection.execute(`
            ALTER TABLE \`${schemaName}\`.farmers 
            ADD CONSTRAINT fk_${schemaName}_farmers_machine_id 
            FOREIGN KEY (machine_id) REFERENCES \`${schemaName}\`.machines(id) 
            ON UPDATE SET NULL ON DELETE SET NULL
          `);
        } catch (fkError) {
          console.log(`   ⚠️ Could not add foreign key constraint for ${schemaName}: ${fkError.message}`);
        }

        // Add index for better performance
        await connection.execute(`
          CREATE INDEX idx_${schemaName}_farmers_machine_id 
          ON \`${schemaName}\`.farmers(machine_id)
        `);

        console.log(`   ✅ Successfully added machine_id column to ${schemaName}.farmers`);

      } catch (error) {
        console.error(`   ❌ Error processing ${schemaName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Completed updating all admin schemas!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

// Run the migration
updateAllAdminSchemas();