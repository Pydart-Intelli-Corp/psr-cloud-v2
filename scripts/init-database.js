/**
 * Database Initialization Script
 * Creates all tables from Sequelize models and runs seeders
 * Run this after deploying to production for the first time
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');

console.log('\n🚀 PSR Cloud V2 - Database Initialization\n');
console.log('=' .repeat(60));

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'psr_v4_main',
  process.env.DB_USER || 'psr_admin',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectModule: mysql2,
    timezone: '+05:30',
    logging: false,
    dialectOptions: {
      connectTimeout: 30000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function initializeDatabase() {
  try {
    // Test connection
    console.log('\n📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Connection successful');

    // Create tables
    console.log('\n📊 Creating database tables...');
    
    // Users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(200) NOT NULL,
        role ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer') NOT NULL,
        status ENUM('pending', 'pending_approval', 'active', 'inactive', 'suspended') DEFAULT 'pending_approval',
        dbKey VARCHAR(50) UNIQUE,
        phone VARCHAR(20),
        companyName VARCHAR(255),
        companyPincode VARCHAR(10),
        companyCity VARCHAR(100),
        companyState VARCHAR(100),
        parentId INT,
        isEmailVerified BOOLEAN DEFAULT false,
        emailVerificationToken VARCHAR(255),
        emailVerificationExpires DATETIME,
        passwordResetToken VARCHAR(255),
        passwordResetExpires DATETIME,
        otpCode VARCHAR(10),
        otpExpires DATETIME,
        lastLogin DATETIME,
        loginAttempts INT DEFAULT 0,
        lockUntil DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_uid (uid),
        INDEX idx_users_role (role),
        INDEX idx_users_dbKey (dbKey),
        INDEX idx_users_parentId (parentId),
        INDEX idx_users_status (status),
        FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ users table created');

    // Admin schemas table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS admin_schemas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        adminId INT NOT NULL,
        dbKey VARCHAR(50) UNIQUE NOT NULL,
        schemaName VARCHAR(100) NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admin_schemas_adminId (adminId),
        INDEX idx_admin_schemas_dbKey (dbKey),
        FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ admin_schemas table created');

    // Audit logs table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        action VARCHAR(255) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entityId VARCHAR(100),
        changes JSON,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_userId (userId),
        INDEX idx_audit_action (action),
        INDEX idx_audit_entity (entity),
        INDEX idx_audit_createdAt (createdAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ audit_logs table created');

    // Machines table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machineId VARCHAR(50) UNIQUE NOT NULL,
        adminId INT NOT NULL,
        machineName VARCHAR(255),
        machineType VARCHAR(100),
        location VARCHAR(255),
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        lastSeen DATETIME,
        imageUrl VARCHAR(500),
        isMaster BOOLEAN DEFAULT false,
        bmcId INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_machines_machineId (machineId),
        INDEX idx_machines_adminId (adminId),
        INDEX idx_machines_status (status),
        INDEX idx_machines_bmcId (bmcId),
        FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ machines table created');

    // Machine types table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS machinetype (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machine_type VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        image_url VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_machinetype_type (machine_type),
        INDEX idx_machinetype_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ machinetype table created');

    // Sequelize meta table (for tracking migrations)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sequelize_meta (
        name VARCHAR(255) PRIMARY KEY
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ sequelize_meta table created');

    // Check if super admin exists
    console.log('\n👤 Checking super admin...');
    const [superAdmins] = await sequelize.query(
      "SELECT * FROM users WHERE role = 'super_admin' AND email = 'admin@poornasreeequipments.com'"
    );

    if (superAdmins.length === 0) {
      console.log('   📝 Creating super admin user...');
      
      const hashedPassword = await bcrypt.hash('psr@2025', 12);
      const uid = `PSR_SUPER_${Date.now()}`;
      
      await sequelize.query(`
        INSERT INTO users (
          uid, email, password, fullName, role, status, 
          dbKey, companyName, companyPincode, companyCity, companyState,
          parentId, isEmailVerified, emailVerificationToken, emailVerificationExpires,
          passwordResetToken, passwordResetExpires, otpCode, otpExpires,
          lastLogin, loginAttempts, lockUntil, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          uid,
          'admin@poornasreeequipments.com',
          hashedPassword,
          'Super Administrator',
          'super_admin',
          'active',
          null,
          'Poornasree Equipments Cloud',
          '560001',
          'Bangalore',
          'Karnataka',
          null,
          true,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          0,
          null
        ]
      });
      
      console.log('   ✅ Super admin created successfully');
      console.log('   📧 Email: admin@poornasreeequipments.com');
      console.log('   🔑 Password: psr@2025');
    } else {
      console.log('   ✅ Super admin already exists');
    }

    // Seed machine types
    console.log('\n🔧 Seeding machine types...');
    const [existingTypes] = await sequelize.query('SELECT COUNT(*) as count FROM machinetype');
    
    if (existingTypes[0].count === 0) {
      const machineTypes = [
        'ECOD', 'LSE-V3', 'LSES-V3', 'ECOSV', 'ECOV', 'ECO-SVPWTBQ', 'LSE-SVPWTBQ',
        'ECOD-G', 'ECOD-W', 'LSE-VPWTBQ', 'LSE-SVPTGQ', 'LSE-VPTGQ', 'LSE-PWTBQ',
        'LSE-WTB', 'LSE-SVG', 'LSE-SV', 'LG-SPTGQ', 'LG-SPWTBQ', 'LG-SDPWTBQ',
        'LSEWTB', 'LG-LitePWTBQ', 'LSE-DPWTBQ-12AH', 'LG-SDPWTBQ-12AH', 'DPST-G',
        'DPST-W', 'LG-LitePTGQ', 'LG-LitePTGQ-6AH', 'LG-SDPTGQ', 'LG-LitePWTBQ-6AH',
        'LG-SproPWTBQ-12AH', 'LG-SDPTGQ-12AH', 'LG-SproPTGQ-12AH', 'LSE-SVPWTBQ-12AH'
      ];

      for (const type of machineTypes) {
        await sequelize.query(`
          INSERT INTO machinetype (machine_type, description, is_active, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `, {
          replacements: [type, `Dairy equipment model ${type}`, true]
        });
      }
      
      console.log(`   ✅ Seeded ${machineTypes.length} machine types`);
    } else {
      console.log('   ✅ Machine types already seeded');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   • Database: ' + process.env.DB_NAME);
    console.log('   • Host: ' + process.env.DB_HOST);
    console.log('   • Tables created: 6 (users, admin_schemas, audit_logs, machines, machinetype, sequelize_meta)');
    console.log('   • Super admin: admin@poornasreeequipments.com / psr@2025');
    console.log('\n🌐 Next steps:');
    console.log('   1. Access: http://168.231.121.19');
    console.log('   2. Login with super admin credentials');
    console.log('   3. Create your first admin user\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check .env file exists with correct DB credentials');
    console.error('   2. Verify MySQL is running: systemctl status mysql');
    console.error('   3. Test connection: mysql -u psr_admin -p psr_v4_main');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();
