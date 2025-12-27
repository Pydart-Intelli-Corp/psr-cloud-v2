/**
 * PSR Cloud V2 - Database Backup Script
 * 
 * This script creates a complete backup of the PSR Cloud V2 database:
 * 1. Backs up the main database structure and data
 * 2. Backs up all admin schemas and their data
 * 3. Creates timestamped backup files
 * 4. Provides restore instructions
 * 
 * Usage: node scripts/backup-database.js
 */

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || '168.231.121.19',
  user: process.env.DB_USER || 'psr_admin',
  password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
  database: process.env.DB_NAME || 'psr_v4_main',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Console logging utilities
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  step: (msg) => console.log(`\n🔄 ${msg}\n`)
};

/**
 * Create backup directory if it doesn't exist
 */
async function createBackupDirectory() {
  const backupDir = path.join(process.cwd(), 'backups');
  
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
    log.success(`Created backup directory: ${backupDir}`);
  }
  
  return backupDir;
}

/**
 * Get timestamp for backup files
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .substring(0, 19);
}

/**
 * Export table structure as SQL
 */
async function getTableCreateStatement(connection, database, table) {
  try {
    const [result] = await connection.query(`SHOW CREATE TABLE \`${database}\`.\`${table}\``);
    return result[0]['Create Table'];
  } catch (error) {
    log.error(`Failed to get create statement for ${table}: ${error.message}`);
    return null;
  }
}

/**
 * Export table data as SQL INSERT statements
 */
async function getTableData(connection, database, table) {
  try {
    const [rows] = await connection.query(`SELECT * FROM \`${database}\`.\`${table}\``);
    
    if (rows.length === 0) {
      return '';
    }

    // Get column names
    const [columns] = await connection.query(`SHOW COLUMNS FROM \`${database}\`.\`${table}\``);
    const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
    
    let insertStatements = [];
    
    // Process rows in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const values = batch.map(row => {
        const rowValues = Object.values(row).map(value => {
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "\\'").replace(/\\/g, "\\\\")}'`;
          if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof value === 'boolean') return value ? 1 : 0;
          return value;
        }).join(', ');
        return `(${rowValues})`;
      }).join(',\n  ');
      
      insertStatements.push(`INSERT INTO \`${table}\` (${columnNames}) VALUES\n  ${values};`);
    }
    
    return insertStatements.join('\n\n');
  } catch (error) {
    log.error(`Failed to get data for ${table}: ${error.message}`);
    return '';
  }
}

/**
 * Create SQL backup using pure Node.js
 */
async function createSQLBackup(connection, database, outputFile) {
  try {
    log.info(`Creating backup: ${path.basename(outputFile)}`);
    
    let sqlContent = [];
    
    // Add header
    sqlContent.push('-- PSR Cloud V2 Database Backup');
    sqlContent.push(`-- Generated on: ${new Date().toISOString()}`);
    sqlContent.push(`-- Database: ${database}`);
    sqlContent.push('-- Host: ' + DB_CONFIG.host);
    sqlContent.push('');
    sqlContent.push('SET FOREIGN_KEY_CHECKS=0;');
    sqlContent.push('SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";');
    sqlContent.push('SET time_zone = "+00:00";');
    sqlContent.push('');
    
    // Get all tables
    const [tables] = await connection.query(`SHOW TABLES FROM \`${database}\``);
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    log.info(`Found ${tableNames.length} tables to backup`);
    
    // Export each table
    for (const table of tableNames) {
      log.info(`  Backing up table: ${table}`);
      
      // Add drop table statement
      sqlContent.push(`-- Table structure for table \`${table}\``);
      sqlContent.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      
      // Add create table statement
      const createStatement = await getTableCreateStatement(connection, database, table);
      if (createStatement) {
        sqlContent.push(createStatement + ';');
        sqlContent.push('');
        
        // Add table data
        const tableData = await getTableData(connection, database, table);
        if (tableData) {
          sqlContent.push(`-- Data for table \`${table}\``);
          sqlContent.push(tableData);
          sqlContent.push('');
        }
      }
    }
    
    // Add footer
    sqlContent.push('SET FOREIGN_KEY_CHECKS=1;');
    sqlContent.push('-- End of backup');
    
    // Write to file
    await fs.writeFile(outputFile, sqlContent.join('\n'));
    
    log.success(`Backup completed: ${path.basename(outputFile)}`);
    return outputFile;
  } catch (error) {
    log.error(`Backup failed for ${outputFile}: ${error.message}`);
    throw error;
  }
}

/**
 * Get all admin schemas
 */
async function getAllAdminSchemas() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    const [schemas] = await connection.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE (
        TABLE_SCHEMA LIKE '%\\_db\\_%' OR 
        TABLE_SCHEMA LIKE 'db_%' OR
        TABLE_SCHEMA LIKE '%\\_PSR%' OR
        TABLE_SCHEMA LIKE '%\\_psr%' OR
        TABLE_SCHEMA REGEXP '^[a-zA-Z0-9]+_[A-Z]{3}[0-9]{4}$'
      )
      AND TABLE_SCHEMA != 'information_schema'
      AND TABLE_SCHEMA != 'performance_schema'
      AND TABLE_SCHEMA != 'mysql'
      AND TABLE_SCHEMA != 'sys'
      ORDER BY TABLE_SCHEMA
    `);

    return schemas.map(s => s.TABLE_SCHEMA);
  } catch (error) {
    log.error(`Failed to get admin schemas: ${error.message}`);
    return [];
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Backup main database
 */
async function backupMainDatabase(backupDir, timestamp) {
  log.step('Backing up main database');
  
  const outputFile = path.join(backupDir, `psr_v4_main_${timestamp}.sql`);
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    await createSQLBackup(connection, DB_CONFIG.database, outputFile);
    
    // Get file size
    const stats = await fs.stat(outputFile);
    log.info(`Main database backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    return outputFile;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Backup all admin schemas
 */
async function backupAdminSchemas(backupDir, timestamp) {
  log.step('Backing up admin schemas');
  
  const schemas = await getAllAdminSchemas();
  log.info(`Found ${schemas.length} admin schemas to backup`);
  
  if (schemas.length === 0) {
    log.info('No admin schemas found to backup');
    return [];
  }
  
  const backupFiles = [];
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    for (const schema of schemas) {
      const outputFile = path.join(backupDir, `admin_schema_${schema}_${timestamp}.sql`);
      
      try {
        await createSQLBackup(connection, schema, outputFile);
        backupFiles.push(outputFile);
      } catch (error) {
        log.error(`Failed to backup schema ${schema}: ${error.message}`);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  log.success(`Backed up ${backupFiles.length} admin schemas`);
  return backupFiles;
}

/**
 * Create restore instructions
 */
async function createRestoreInstructions(backupDir, timestamp, mainBackupFile, adminBackupFiles) {
  const instructionsFile = path.join(backupDir, `restore_instructions_${timestamp}.md`);
  
  const instructions = `# PSR Cloud V2 Database Restore Instructions

## Backup Information
- **Date Created**: ${new Date().toLocaleString()}
- **Main Database**: ${path.basename(mainBackupFile)}
- **Admin Schemas**: ${adminBackupFiles.length} schemas backed up

## Prerequisites
- MySQL server running
- Database user with appropriate privileges
- Access to backup files

## Restore Steps

### 1. Restore Main Database
\`\`\`bash
# Create the main database if it doesn't exist
mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p -e "CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database};"

# Restore the main database
mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p ${DB_CONFIG.database} < "${path.basename(mainBackupFile)}"
\`\`\`

### Alternative: Direct SQL file execution
\`\`\`bash
# If you have mysql client installed, use the above commands
# If not, you can import the SQL file using your preferred MySQL client or phpMyAdmin
\`\`\`

### 2. Restore Admin Schemas
${adminBackupFiles.map(file => {
  const schema = path.basename(file).match(/admin_schema_(.+)_\\d{4}-\\d{2}-\\d{2}/)?.[1] || 'unknown';
  return `\`\`\`bash
# Restore schema: ${schema}
mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p < "${path.basename(file)}"
\`\`\``;
}).join('\n\n')}

### 3. Verify Restore
\`\`\`bash
# Check if main database is restored
mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p -e "USE ${DB_CONFIG.database}; SHOW TABLES;"

# Check admin schemas
mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p -e "SHOW DATABASES LIKE '%_db_%';"
\`\`\`

## Backup Files
- **Main Database**: \`${path.basename(mainBackupFile)}\`
${adminBackupFiles.map(file => `- **Admin Schema**: \`${path.basename(file)}\``).join('\n')}

## Important Notes
1. **MySQL Client**: These backups are created using pure Node.js and don't require mysqldump
2. **Import Methods**: You can import using mysql command line, phpMyAdmin, or any MySQL client
3. **File Format**: Standard SQL format compatible with all MySQL tools
4. **Windows Compatibility**: This backup method works on all operating systems
5. **Large Files**: For large databases, consider importing in chunks or using specialized tools
6. **Permissions**: Ensure the target MySQL server has the same or newer version
7. **Schema Recreation**: Admin schemas will be recreated exactly as they were
8. **Data Integrity**: All foreign key relationships are preserved

## Support
For any issues with restoration, contact the development team.
`;

  await fs.writeFile(instructionsFile, instructions);
  log.success(`Created restore instructions: ${path.basename(instructionsFile)}`);
  
  return instructionsFile;
}

/**
 * Create backup summary
 */
async function createBackupSummary(backupDir, timestamp, files) {
  let totalSize = 0;
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      totalSize += stats.size;
    } catch (error) {
      log.warning(`Could not get size for ${file}`);
    }
  }
  
  const summaryFile = path.join(backupDir, `backup_summary_${timestamp}.txt`);
  
  const summary = `PSR Cloud V2 Database Backup Summary
=====================================

Backup Date: ${new Date().toLocaleString()}
Total Files: ${files.length}
Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB

Files:
${files.map(file => `- ${path.basename(file)}`).join('\n')}

Database Configuration:
- Host: ${DB_CONFIG.host}
- Port: ${DB_CONFIG.port}
- Database: ${DB_CONFIG.database}
- User: ${DB_CONFIG.user}

Backup Location: ${backupDir}
`;

  await fs.writeFile(summaryFile, summary);
  log.success(`Created backup summary: ${path.basename(summaryFile)}`);
  
  return summaryFile;
}

/**
 * Main backup function
 */
async function backupDatabase() {
  try {
    log.step('🚀 Starting PSR Cloud V2 Database Backup');
    
    const timestamp = getTimestamp();
    const backupDir = await createBackupDirectory();
    
    log.info(`Backup timestamp: ${timestamp}`);
    log.info(`Backup directory: ${backupDir}`);
    
    // Backup main database
    const mainBackupFile = await backupMainDatabase(backupDir, timestamp);
    
    // Backup admin schemas
    const adminBackupFiles = await backupAdminSchemas(backupDir, timestamp);
    
    // Create documentation
    const allFiles = [mainBackupFile, ...adminBackupFiles];
    await createRestoreInstructions(backupDir, timestamp, mainBackupFile, adminBackupFiles);
    await createBackupSummary(backupDir, timestamp, allFiles);
    
    log.step('✨ Database backup completed successfully!');
    log.success(`Backup location: ${backupDir}`);
    log.info(`Main database backup: ${path.basename(mainBackupFile)}`);
    log.info(`Admin schemas backed up: ${adminBackupFiles.length}`);
    
    // Calculate total backup size
    let totalSize = 0;
    for (const file of allFiles) {
      try {
        const stats = await fs.stat(file);
        totalSize += stats.size;
      } catch (error) {
        // Ignore missing files
      }
    }
    
    log.info(`Total backup size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    log.error(`Database backup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the backup
if (require.main === module) {
  backupDatabase().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { backupDatabase };