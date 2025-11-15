import { connectDB } from '@/lib/database';
import { UserAttributes } from '@/models/User';

/**
 * Generates a unique dbKey for an admin user
 * Format: 3 letters from name + 4 random digits
 */
export function generateDbKey(fullName: string): string {
  // Extract first 3 letters from name (remove spaces, convert to uppercase)
  const cleanName = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const namePrefix = cleanName.substring(0, 3).padEnd(3, 'X'); // Pad with X if less than 3 letters
  
  // Generate 4 random digits
  const digits = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits
  
  return `${namePrefix}${digits}`;
}

/**
 * Checks if a dbKey already exists in the database
 */
export async function isDbKeyUnique(dbKey: string): Promise<boolean> {
  try {
    await connectDB();
    const { User } = await import('@/models').then(m => m.getModels());
    
    const existingUser = await User.findOne({
      where: { dbKey }
    });
    
    return !existingUser;
  } catch (error) {
    console.error('Error checking dbKey uniqueness:', error);
    return false;
  }
}

/**
 * Generates a unique dbKey by retrying if duplicates are found
 */
export async function generateUniqueDbKey(fullName: string): Promise<string> {
  let dbKey: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    dbKey = generateDbKey(fullName);
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique dbKey after maximum attempts');
    }
  } while (!(await isDbKeyUnique(dbKey)));
  
  return dbKey;
}

/**
 * Creates a new database schema for an admin user
 */
export async function createAdminSchema(adminUser: UserAttributes, dbKey: string): Promise<void> {
  try {
    await connectDB();
    
    // Generate schema name: adminName + dbKey
    const cleanAdminName = adminUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${dbKey.toLowerCase()}`;
    
    console.log(`🏗️ Creating schema: ${schemaName} for admin: ${adminUser.fullName}`);
    
    // Get the database connection
    const { sequelize } = await import('@/models').then(m => m.getModels());
    
    // Create the schema
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS \`${schemaName}\``);
    
    console.log(`✅ Schema created successfully: ${schemaName}`);
    
    // Create tables in the new schema
    // This includes creating admin-specific tables like:
    // - dairy_farms
    // - bmcs  
    // - societies
    // - farmers
    // - milk_collections
    // - machines
    
    await createAdminTables(schemaName);
    
  } catch (error) {
    console.error('❌ Error creating admin schema:', error);
    throw new Error(`Failed to create schema for admin: ${error}`);
  }
}

/**
 * Creates the necessary tables in the admin's schema
 */
async function createAdminTables(schemaName: string): Promise<void> {
  try {
    const { sequelize } = await import('@/models').then(m => m.getModels());
    
    // Example table creation - customize based on your needs
    const tables = [
      // Dairy Farms table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`dairy_farms\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`dairy_id\` VARCHAR(50) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255),
        \`contact_person\` VARCHAR(255),
        \`phone\` VARCHAR(20),
        \`email\` VARCHAR(255),
        \`capacity\` INT DEFAULT 5000 COMMENT 'Storage capacity in liters',
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`monthly_target\` INT DEFAULT 5000 COMMENT 'Monthly production target in liters',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // BMCs (Bulk Milk Cooling Centers) table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`bmcs\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`bmc_id\` VARCHAR(50) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255),
        \`contactPerson\` VARCHAR(255),
        \`phone\` VARCHAR(20),
        \`email\` VARCHAR(255),
        \`capacity\` INT DEFAULT 10000 COMMENT 'Storage capacity in liters',
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`monthly_target\` DECIMAL(10,2) DEFAULT 10000 COMMENT 'Monthly collection target in liters',
        \`dairy_farm_id\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`dairy_farm_id\`) REFERENCES \`${schemaName}\`.\`dairy_farms\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        INDEX \`idx_bmc_id\` (\`bmc_id\`),
        INDEX \`idx_dairy_farm_id\` (\`dairy_farm_id\`),
        INDEX \`idx_status\` (\`status\`)
      )`,
      
      // Societies table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`societies\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`society_id\` VARCHAR(50) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255),
        \`president_name\` VARCHAR(255),
        \`contact_phone\` VARCHAR(20),
        \`bmc_id\` INT,
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`bmc_id\`) REFERENCES \`${schemaName}\`.\`bmcs\`(\`id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_bmc_id\` (\`bmc_id\`),
        INDEX \`idx_status\` (\`status\`)
      )`,
      
      // Machines table (MUST be created before farmers table due to FK constraint)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machines\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`machine_id\` VARCHAR(50) NOT NULL,
        \`machine_type\` VARCHAR(100) NOT NULL,
        \`society_id\` INT,
        \`location\` VARCHAR(255),
        \`installation_date\` DATE,
        \`operator_name\` VARCHAR(100),
        \`contact_phone\` VARCHAR(15),
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`notes\` TEXT,
        \`user_password\` VARCHAR(255) COMMENT 'User password for external API access',
        \`supervisor_password\` VARCHAR(255) COMMENT 'Supervisor password for external API access',
        \`statusU\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'User password status: 0 = not set, 1 = set',
        \`statusS\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Supervisor password status: 0 = not set, 1 = set',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        UNIQUE KEY \`unique_machine_per_society\` (\`machine_id\`, \`society_id\`),
        INDEX \`idx_machine_type\` (\`machine_type\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_statusU\` (\`statusU\`),
        INDEX \`idx_statusS\` (\`statusS\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,
      
      // Farmers table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`farmers\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`farmer_id\` VARCHAR(50) NOT NULL,
        \`rf_id\` VARCHAR(50),
        \`phone\` VARCHAR(20),
        \`sms_enabled\` ENUM('ON', 'OFF') DEFAULT 'OFF',
        \`bonus\` DECIMAL(10,2) DEFAULT 0.00,
        \`address\` TEXT,
        \`bank_name\` VARCHAR(100),
        \`bank_account_number\` VARCHAR(50),
        \`ifsc_code\` VARCHAR(15),
        \`status\` ENUM('active', 'inactive', 'suspended', 'maintenance') DEFAULT 'active',
        \`notes\` TEXT,
        \`password\` VARCHAR(255),
        \`society_id\` INT,
        \`machine_id\` INT,
        \`cattle_count\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.\`machines\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        UNIQUE KEY \`unique_farmer_per_society\` (\`farmer_id\`, \`society_id\`),
        UNIQUE KEY \`unique_rf_id\` (\`rf_id\`),
        INDEX \`idx_farmer_id\` (\`farmer_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,
      
      // Milk Collections table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`milk_collections\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`farmer_id\` INT,
        \`collection_date\` DATE,
        \`morning_quantity\` DECIMAL(10,2) DEFAULT 0,
        \`evening_quantity\` DECIMAL(10,2) DEFAULT 0,
        \`total_quantity\` DECIMAL(10,2) AS (\`morning_quantity\` + \`evening_quantity\`) STORED,
        \`fat_percentage\` DECIMAL(5,2),
        \`snf_percentage\` DECIMAL(5,2),
        \`rate_per_liter\` DECIMAL(10,2),
        \`total_amount\` DECIMAL(10,2),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`farmer_id\`) REFERENCES \`${schemaName}\`.\`farmers\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX \`idx_farmer_id\` (\`farmer_id\`),
        INDEX \`idx_collection_date\` (\`collection_date\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,

      // Machine Corrections table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machine_corrections\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`machine_id\` INT NOT NULL COMMENT 'Reference to machines table',
        \`society_id\` INT NOT NULL COMMENT 'Reference to societies table',
        \`machine_type\` VARCHAR(100) COMMENT 'Machine type/model for reference',
        \`channel1_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 Fat value',
        \`channel1_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 SNF (Solid Not Fat) value',
        \`channel1_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 CLR value',
        \`channel1_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 Temperature',
        \`channel1_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 Water content',
        \`channel1_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 1 Protein value',
        \`channel2_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 Fat value',
        \`channel2_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 SNF (Solid Not Fat) value',
        \`channel2_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 CLR value',
        \`channel2_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 Temperature',
        \`channel2_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 Water content',
        \`channel2_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 2 Protein value',
        \`channel3_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 Fat value',
        \`channel3_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 SNF (Solid Not Fat) value',
        \`channel3_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 CLR value',
        \`channel3_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 Temperature',
        \`channel3_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 Water content',
        \`channel3_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Channel 3 Protein value',
        \`status\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Status: 1 = Active/Current, 0 = Inactive/Old',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_type\` (\`machine_type\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,

      // Rate Charts table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_charts\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`shared_chart_id\` INT NULL COMMENT 'Reference to master rate chart for shared data',
        \`society_id\` INT NOT NULL COMMENT 'Reference to societies table',
        \`channel\` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
        \`uploaded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`uploaded_by\` VARCHAR(255) NOT NULL COMMENT 'Admin user who uploaded',
        \`file_name\` VARCHAR(255) NOT NULL COMMENT 'Original CSV file name',
        \`record_count\` INT NOT NULL DEFAULT 0 COMMENT 'Number of rate records',
        \`status\` TINYINT(1) DEFAULT 1 COMMENT '1=Active/Ready to download, 0=Downloaded by machine',
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY \`unique_society_channel\` (\`society_id\`, \`channel\`),
        INDEX \`idx_shared_chart_id\` (\`shared_chart_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_channel\` (\`channel\`),
        INDEX \`idx_uploaded_at\` (\`uploaded_at\`),
        INDEX \`idx_status\` (\`status\`)
      )`,

      // Rate Chart Data table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_chart_data\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`rate_chart_id\` INT NOT NULL COMMENT 'Reference to rate_charts table',
        \`clr\` DECIMAL(5,2) NOT NULL COMMENT 'Color/Degree value',
        \`fat\` DECIMAL(5,2) NOT NULL COMMENT 'Fat percentage',
        \`snf\` DECIMAL(5,2) NOT NULL COMMENT 'Solids-Not-Fat percentage',
        \`rate\` DECIMAL(10,2) NOT NULL COMMENT 'Rate per liter',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`rate_chart_id\`) REFERENCES \`${schemaName}\`.\`rate_charts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX \`idx_rate_chart_id\` (\`rate_chart_id\`),
        INDEX \`idx_clr_fat_snf\` (\`clr\`, \`fat\`, \`snf\`)
      )`,

      // Rate Chart Download History table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_chart_download_history\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`rate_chart_id\` INT NOT NULL COMMENT 'Reference to rate_charts table',
        \`machine_id\` INT NOT NULL COMMENT 'Reference to machines table',
        \`society_id\` INT NOT NULL COMMENT 'Reference to societies table',
        \`channel\` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
        \`downloaded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`rate_chart_id\`) REFERENCES \`${schemaName}\`.\`rate_charts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.\`machines\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY \`unique_machine_chart\` (\`machine_id\`, \`rate_chart_id\`),
        INDEX \`idx_machine_society_channel\` (\`machine_id\`, \`society_id\`, \`channel\`),
        INDEX \`idx_rate_chart_id\` (\`rate_chart_id\`),
        INDEX \`idx_downloaded_at\` (\`downloaded_at\`)
      )`
    ];
    
    // Execute table creation queries
    for (const tableQuery of tables) {
      await sequelize.query(tableQuery);
    }
    
    console.log(`✅ Admin tables created successfully in schema: ${schemaName}`);
    
  } catch (error) {
    console.error('❌ Error creating admin tables:', error);
    throw error;
  }
}

/**
 * Updates existing admin schemas with the new farmers table structure
 */
export async function updateAdminSchemasWithFarmersTable(): Promise<void> {
  try {
    await connectDB();
    const { sequelize, User } = await import('@/models').then(m => m.getModels());

    // Get all admin users
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'fullName', 'dbKey']
    });

    console.log(`🔄 Updating ${admins.length} admin schemas with new farmers table structure...`);

    for (const admin of admins) {
      if (!admin.dbKey) {
        console.log(`⚠️ Skipping admin ${admin.fullName} - no dbKey`);
        continue;
      }

      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`🔧 Updating farmers table in schema: ${schemaName}`);

      // Check if schema exists
      const [schemas] = await sequelize.query(`
        SELECT SCHEMA_NAME 
        FROM INFORMATION_SCHEMA.SCHEMATA 
        WHERE SCHEMA_NAME = '${schemaName}'
      `);

      if (schemas.length === 0) {
        console.log(`⚠️ Schema ${schemaName} does not exist, skipping...`);
        continue;
      }

      // Check if old farmers table exists
      const [existingTables] = await sequelize.query(`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'farmers'
      `);

      if (existingTables.length === 0) {
        // No farmers table exists, create new one
        console.log(`📝 Creating new farmers table in schema: ${schemaName}`);
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`farmers\` (
            \`id\` INT PRIMARY KEY AUTO_INCREMENT,
            \`name\` VARCHAR(255) NOT NULL,
            \`farmer_id\` VARCHAR(50) NOT NULL,
            \`rf_id\` VARCHAR(50),
            \`phone\` VARCHAR(20),
            \`sms_enabled\` ENUM('ON', 'OFF') DEFAULT 'OFF',
            \`bonus\` DECIMAL(10,2) DEFAULT 0.00,
            \`address\` TEXT,
            \`bank_name\` VARCHAR(100),
            \`bank_account_number\` VARCHAR(50),
            \`ifsc_code\` VARCHAR(15),
            \`status\` ENUM('active', 'inactive', 'suspended', 'maintenance') DEFAULT 'active',
            \`notes\` TEXT,
            \`password\` VARCHAR(255),
            \`society_id\` INT,
            \`cattle_count\` INT,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
            UNIQUE KEY \`unique_farmer_per_society\` (\`farmer_id\`, \`society_id\`),
            UNIQUE KEY \`unique_rf_id\` (\`rf_id\`),
            INDEX \`idx_farmer_id\` (\`farmer_id\`),
            INDEX \`idx_society_id\` (\`society_id\`),
            INDEX \`idx_status\` (\`status\`),
            INDEX \`idx_created_at\` (\`created_at\`)
          )
        `);
      } else {
        // Check if table has new structure
        const columns = existingTables as Array<{ COLUMN_NAME: string }>;
        const hasPassword = columns.some(col => col.COLUMN_NAME === 'password');
        const hasRfId = columns.some(col => col.COLUMN_NAME === 'rf_id');
        
        if (!hasPassword || !hasRfId) {
          console.log(`🔄 Migrating existing farmers table in schema: ${schemaName}`);
          
          // Backup existing data
          const [existingData] = await sequelize.query(`
            SELECT * FROM \`${schemaName}\`.\`farmers\`
          `);
          
          // Drop and recreate table with new structure
          await sequelize.query(`DROP TABLE \`${schemaName}\`.\`farmers\``);
          
          await sequelize.query(`
            CREATE TABLE \`${schemaName}\`.\`farmers\` (
              \`id\` INT PRIMARY KEY AUTO_INCREMENT,
              \`name\` VARCHAR(255) NOT NULL,
              \`farmer_id\` VARCHAR(50) NOT NULL,
              \`rf_id\` VARCHAR(50),
              \`phone\` VARCHAR(20),
              \`sms_enabled\` ENUM('ON', 'OFF') DEFAULT 'OFF',
              \`bonus\` DECIMAL(10,2) DEFAULT 0.00,
              \`address\` TEXT,
              \`bank_name\` VARCHAR(100),
              \`bank_account_number\` VARCHAR(50),
              \`ifsc_code\` VARCHAR(15),
              \`status\` ENUM('active', 'inactive', 'suspended', 'maintenance') DEFAULT 'active',
              \`notes\` TEXT,
              \`password\` VARCHAR(255),
              \`society_id\` INT,
              \`cattle_count\` INT,
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
              UNIQUE KEY \`unique_farmer_per_society\` (\`farmer_id\`, \`society_id\`),
              UNIQUE KEY \`unique_rf_id\` (\`rf_id\`),
              INDEX \`idx_farmer_id\` (\`farmer_id\`),
              INDEX \`idx_society_id\` (\`society_id\`),
              INDEX \`idx_status\` (\`status\`),
              INDEX \`idx_created_at\` (\`created_at\`)
            )
          `);
          
          // Restore data with mapping to new structure
          for (const row of existingData as Array<Record<string, unknown>>) {
            await sequelize.query(`
              INSERT INTO \`${schemaName}\`.\`farmers\` 
              (\`farmer_id\`, \`name\`, \`phone\`, \`address\`, \`society_id\`, \`status\`, \`created_at\`)
              VALUES (?, ?, ?, ?, ?, 'active', ?)
            `, {
              replacements: [
                row.farmer_id || `FARMER_${row.id}`,
                row.name || row.farmer_name || 'Unknown Farmer',
                row.phone || row.contact_number,
                row.address,
                row.society_id,
                row.created_at
              ]
            });
          }
        }
      }

      console.log(`✅ Farmers table updated successfully in schema: ${schemaName}`);
    }

    console.log('🎉 All admin schemas updated with new farmers table structure!');

  } catch (error) {
    console.error('❌ Error updating admin schemas:', error);
    throw error;
  }
}