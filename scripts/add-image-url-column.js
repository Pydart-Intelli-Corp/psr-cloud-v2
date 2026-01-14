/**
 * Add image_url column to machinetype table
 * This adds support for machine images in the system
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addImageUrlColumn() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: process.env.DB_NAME || 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to database');

    // Check if image_url column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'psr_v4_main' 
      AND TABLE_NAME = 'machinetype' 
      AND COLUMN_NAME = 'image_url'
    `);

    if (columns.length > 0) {
      console.log('✅ Column image_url already exists in machinetype table');
      return;
    }

    // Add the column
    console.log('ℹ️  Adding image_url column to machinetype table...');
    await connection.query(`
      ALTER TABLE \`psr_v4_main\`.\`machinetype\` 
      ADD COLUMN \`image_url\` VARCHAR(500) 
      COMMENT 'URL path to machine image' 
      AFTER \`is_active\`
    `);

    console.log('✅ Column image_url added successfully');

    // Create index on image_url if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`psr_v4_main\`.\`machinetype\` 
        ADD INDEX \`idx_image_url\` (\`image_url\`)
      `);
      console.log('✅ Index idx_image_url created');
    } catch (indexError) {
      if (indexError.message.includes('Duplicate key name')) {
        console.log('ℹ️  Index idx_image_url already exists');
      } else {
        throw indexError;
      }
    }

    console.log('\n✨ image_url column addition completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('ℹ️  Database connection closed');
    }
  }
}

if (require.main === module) {
  addImageUrlColumn();
}

module.exports = { addImageUrlColumn };
