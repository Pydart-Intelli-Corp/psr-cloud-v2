import mysql from 'mysql2/promise';
import 'dotenv/config';

const VPS_CONFIG = {
  host: process.env.DB_HOST || '168.231.121.19',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'psr_admin',
  password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
  ssl: {
    rejectUnauthorized: false
  }
};

async function addSharedChartIdColumn() {
  let connection;

  try {
    console.log('🔌 Connecting to VPS MySQL database...');
    connection = await mysql.createConnection(VPS_CONFIG);
    console.log('✅ Connected to VPS MySQL database');

    // Get all admin schemas
    const [databases] = await connection.query('SHOW DATABASES');
    const adminSchemas = databases
      .map(db => db.Database)
      .filter(name => name.includes('_') && !name.startsWith('information_schema') && !name.startsWith('mysql') && !name.startsWith('performance_schema') && !name.startsWith('sys') && !name.startsWith('psr_v4'));

    console.log(`\n📊 Found ${adminSchemas.length} admin schemas`);

    for (const schema of adminSchemas) {
      try {
        console.log(`\n🔄 Processing schema: ${schema}`);

        // Check if rate_charts table exists
        const [tables] = await connection.query(
          `SELECT TABLE_NAME FROM information_schema.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rate_charts'`,
          [schema]
        );

        if (tables.length === 0) {
          console.log(`  ⚠️  Skipping - rate_charts table doesn't exist`);
          continue;
        }

        // Check if shared_chart_id column already exists
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rate_charts' AND COLUMN_NAME = 'shared_chart_id'`,
          [schema]
        );

        if (columns.length > 0) {
          console.log(`  ✓ shared_chart_id column already exists`);
          continue;
        }

        // Add shared_chart_id column
        await connection.query(`
          ALTER TABLE ${schema}.rate_charts 
          ADD COLUMN shared_chart_id INT NULL COMMENT 'Reference to master chart ID for shared charts',
          ADD INDEX idx_shared_chart_id (shared_chart_id)
        `);

        console.log(`  ✅ Added shared_chart_id column with index`);

      } catch (error) {
        console.error(`  ❌ Error processing ${schema}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

addSharedChartIdColumn();
