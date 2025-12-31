const mysql = require('mysql2/promise');

async function addAccessRequestsTable() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    console.log('✓ Connected to database');
    
    // Get all admins
    const [adminRows] = await connection.query(
      "SELECT fullName, dbKey FROM psr_v4_main.users WHERE role='admin'"
    );
    
    if (!adminRows || adminRows.length === 0) {
      console.error('❌ No admin user found');
      return;
    }

    console.log(`📊 Found ${adminRows.length} admin(s)`);
    
    for (const admin of adminRows) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      console.log(`\n📝 Creating table for schema: ${schemaName}`);
      
      // Switch to admin schema
      await connection.query(`USE \`${schemaName}\``);
      
      // Create table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS machine_access_requests (
          id INT PRIMARY KEY AUTO_INCREMENT,
          machine_id INT NOT NULL,
          user_id INT NOT NULL,
          access_token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_machine_user (machine_id, user_id),
          INDEX idx_status (status),
          INDEX idx_expires (expires_at),
          
          FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Add comment
      await connection.query(`
        ALTER TABLE machine_access_requests 
        COMMENT = 'Stores temporary access requests for master machine changes with 15-minute validity'
      `);
      
      console.log(`✅ Table created successfully in ${schemaName}`);
    }
    
    console.log('\n✅ All tables created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

addAccessRequestsTable();
