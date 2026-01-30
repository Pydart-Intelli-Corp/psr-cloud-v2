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
 * 
 * PERFORMANCE INDEXES INCLUDED (Dec 26, 2024):
 * - dairy_farms: idx_status
 * - bmcs: idx_bmc_id, idx_dairy_farm_id, idx_status
 * - societies: idx_society_id, idx_bmc_id, idx_status
 * - machines: idx_machine_type, idx_society_id, idx_status, idx_is_master, idx_statusU, idx_statusS, idx_created_at
 * - farmers: idx_farmer_id, idx_society_id, idx_machine_id, idx_status, idx_created_at
 * - milk_collections: idx_farmer_id, idx_society_id, idx_machine_id, idx_collection_date, 
 *                     idx_collection_time, idx_shift_type, idx_channel, idx_created_at,
 *                     idx_society_date (composite: society_id + collection_date)
 * 
 * These indexes optimize:
 * - Status filtering across all entities
 * - Foreign key lookups (society_id, bmc_id, dairy_farm_id, machine_id)
 * - Date-based queries (collection_date, created_at)
 * - Analytics queries (society_date composite index for 30-day aggregations)
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
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_status\` (\`status\`)
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
        \`email\` VARCHAR(255) NOT NULL,
        \`bmc_id\` INT,
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`bmc_id\`) REFERENCES \`${schemaName}\`.\`bmcs\`(\`id\`),
        UNIQUE KEY \`unique_society_email\` (\`email\`),
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
        \`bmc_id\` INT,
        \`location\` VARCHAR(255),
        \`installation_date\` DATE,
        \`operator_name\` VARCHAR(100),
        \`contact_phone\` VARCHAR(15),
        \`status\` ENUM('active', 'inactive', 'maintenance', 'suspended') DEFAULT 'active',
        \`notes\` TEXT,
        \`is_master_machine\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Master machine flag: 1 = master, 0 = normal',
        \`user_password\` VARCHAR(255) COMMENT 'User password for external API access',
        \`supervisor_password\` VARCHAR(255) COMMENT 'Supervisor password for external API access',
        \`statusU\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'User password status: 0 = not set, 1 = set',
        \`statusS\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Supervisor password status: 0 = not set, 1 = set',
        \`image_url\` VARCHAR(500) COMMENT 'URL path to machine image',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (\`bmc_id\`) REFERENCES \`${schemaName}\`.\`bmcs\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        UNIQUE KEY \`unique_machine_per_society\` (\`machine_id\`, \`society_id\`),
        INDEX \`idx_machine_type\` (\`machine_type\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_bmc_id\` (\`bmc_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_is_master\` (\`is_master_machine\`),
        INDEX \`idx_statusU\` (\`statusU\`),
        INDEX \`idx_statusS\` (\`statusS\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,
      
      // Farmers table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`farmers\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`farmer_id\` VARCHAR(50) NOT NULL,
        \`farmeruid\` VARCHAR(100) UNIQUE NULL COMMENT 'Unique identifier for farmer',
        \`rf_id\` VARCHAR(50),
        \`phone\` VARCHAR(20),
        \`email\` VARCHAR(255),
        \`sms_enabled\` ENUM('ON', 'OFF') DEFAULT 'OFF',
        \`email_notifications_enabled\` ENUM('ON', 'OFF') DEFAULT 'ON',
        \`bonus\` DECIMAL(10,2) DEFAULT 0.00,
        \`address\` TEXT,
        \`bank_name\` VARCHAR(100),
        \`bank_account_number\` VARCHAR(50),
        \`ifsc_code\` VARCHAR(15),
        \`upi_id\` VARCHAR(100) COMMENT 'UPI ID for payments',
        \`upi_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable UPI payments',
        \`paytm_phone\` VARCHAR(20) COMMENT 'Paytm registered phone number',
        \`paytm_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable Paytm payments',
        \`preferred_payment_mode\` ENUM('bank', 'upi', 'paytm', 'cash') DEFAULT 'bank' COMMENT 'Preferred payment method',
        \`whatsapp_billing_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Send bills via WhatsApp',
        \`automated_payment_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable automated payments',
        \`last_payment_date\` DATE COMMENT 'Date of last payment received',
        \`last_payment_amount\` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Amount of last payment',
        \`pending_payment_amount\` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Pending payment amount',
        \`status\` ENUM('active', 'inactive', 'suspended', 'maintenance') DEFAULT 'active',
        \`notes\` TEXT,
        \`password\` VARCHAR(255),
        \`otp_code\` VARCHAR(6) COMMENT 'One-time password for farmer login',
        \`otp_expires\` DATETIME COMMENT 'OTP expiration timestamp',
        \`society_id\` INT,
        \`machine_id\` INT,
        \`cattle_count\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.\`machines\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        UNIQUE KEY \`unique_farmer_per_society\` (\`farmer_id\`, \`society_id\`),
        UNIQUE KEY \`unique_rf_id\` (\`rf_id\`),
        UNIQUE KEY \`unique_email\` (\`email\`),
        UNIQUE KEY \`unique_farmeruid\` (\`farmeruid\`),
        INDEX \`idx_farmer_id\` (\`farmer_id\`),
        INDEX \`idx_farmeruid\` (\`farmeruid\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_payment_mode\` (\`preferred_payment_mode\`),
        INDEX \`idx_upi_enabled\` (\`upi_enabled\`),
        INDEX \`idx_paytm_enabled\` (\`paytm_enabled\`)
      )`,
      
      // Milk Collections table (updated for machine collection data)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`milk_collections\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`farmer_id\` VARCHAR(50),
        \`society_id\` INT NULL,
        \`machine_id\` INT,
        \`collection_date\` DATE,
        \`collection_time\` TIME,
        \`shift_type\` ENUM('morning', 'evening'),
        \`farmer_name\` VARCHAR(255) DEFAULT NULL,
        \`channel\` VARCHAR(50) DEFAULT 'COW',
        \`quantity\` DECIMAL(10,2) DEFAULT 0,
        \`fat_percentage\` DECIMAL(5,2),
        \`snf_percentage\` DECIMAL(5,2),
        \`clr_value\` DECIMAL(5,2) DEFAULT 0,
        \`protein_percentage\` DECIMAL(5,2) DEFAULT 0,
        \`lactose_percentage\` DECIMAL(5,2) DEFAULT 0,
        \`salt_percentage\` DECIMAL(5,2) DEFAULT 0,
        \`water_percentage\` DECIMAL(5,2) DEFAULT 0,
        \`temperature\` DECIMAL(5,2) DEFAULT 0,
        \`rate_per_liter\` DECIMAL(10,2),
        \`total_amount\` DECIMAL(10,2),
        \`bonus\` DECIMAL(10,2) DEFAULT 0,
        \`machine_type\` VARCHAR(100),
        \`machine_version\` VARCHAR(50),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_farmer_id\` (\`farmer_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_collection_date\` (\`collection_date\`),
        INDEX \`idx_collection_time\` (\`collection_time\`),
        INDEX \`idx_shift_type\` (\`shift_type\`),
        INDEX \`idx_channel\` (\`channel\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_society_date\` (\`society_id\`, \`collection_date\`),
        UNIQUE KEY \`unique_collection\` (\`farmer_id\`, \`society_id\`, \`machine_id\`, \`collection_date\`, \`collection_time\`, \`shift_type\`)
      )`,

      // Milk Dispatches table (milk dispatch records from machines)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`milk_dispatches\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`dispatch_id\` VARCHAR(50) NOT NULL,
        \`society_id\` INT NULL,
        \`machine_id\` INT NOT NULL,
        \`dispatch_date\` DATE,
        \`dispatch_time\` TIME,
        \`shift_type\` ENUM('morning', 'evening') NOT NULL,
        \`channel\` VARCHAR(50) DEFAULT 'COW',
        \`fat_percentage\` DECIMAL(5,2),
        \`snf_percentage\` DECIMAL(5,2),
        \`clr_value\` DECIMAL(5,2) DEFAULT 0,
        \`quantity\` DECIMAL(10,2) DEFAULT 0,
        \`rate_per_liter\` DECIMAL(10,2),
        \`total_amount\` DECIMAL(10,2),
        \`machine_type\` VARCHAR(100),
        \`machine_version\` VARCHAR(50),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_dispatch_id\` (\`dispatch_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_dispatch_date\` (\`dispatch_date\`),
        INDEX \`idx_dispatch_time\` (\`dispatch_time\`),
        INDEX \`idx_shift_type\` (\`shift_type\`),
        INDEX \`idx_channel\` (\`channel\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        UNIQUE KEY \`unique_dispatch\` (\`dispatch_id\`, \`society_id\`, \`machine_id\`, \`dispatch_date\`, \`dispatch_time\`, \`shift_type\`)
      )`,

      // Milk Sales table (milk sales records from machines)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`milk_sales\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`count\` VARCHAR(50) NOT NULL,
        \`society_id\` INT NULL,
        \`machine_id\` INT NOT NULL,
        \`sales_date\` DATE,
        \`sales_time\` TIME,
        \`shift_type\` VARCHAR(10) DEFAULT 'EV',
        \`channel\` VARCHAR(50) DEFAULT 'COW',
        \`quantity\` DECIMAL(10,2) DEFAULT 0,
        \`rate_per_liter\` DECIMAL(10,2),
        \`total_amount\` DECIMAL(10,2),
        \`machine_type\` VARCHAR(100),
        \`machine_version\` VARCHAR(50),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_count\` (\`count\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_sales_date\` (\`sales_date\`),
        INDEX \`idx_sales_time\` (\`sales_time\`),
        INDEX \`idx_shift_type\` (\`shift_type\`),
        INDEX \`idx_channel\` (\`channel\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        UNIQUE KEY \`unique_sales\` (\`count\`, \`society_id\`, \`machine_id\`, \`sales_date\`, \`sales_time\`)
      )`,

      // Machine Corrections table (Admin-saved corrections)
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

      // Machine Corrections From Machine table (ESP32 device corrections)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machine_corrections_from_machine\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`machine_id\` INT NOT NULL COMMENT 'Machine database ID',
        \`society_id\` INT NOT NULL COMMENT 'Society database ID',
        \`machine_type\` VARCHAR(50) DEFAULT NULL COMMENT 'Machine type',
        \`channel1_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 1',
        \`channel1_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 1',
        \`channel1_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 1',
        \`channel1_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 1',
        \`channel1_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 1',
        \`channel1_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 1',
        \`channel2_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 2',
        \`channel2_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 2',
        \`channel2_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 2',
        \`channel2_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 2',
        \`channel2_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 2',
        \`channel2_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 2',
        \`channel3_fat\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Fat correction for channel 3',
        \`channel3_snf\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SNF correction for channel 3',
        \`channel3_clr\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CLR correction for channel 3',
        \`channel3_temp\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Temperature correction for channel 3',
        \`channel3_water\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Water correction for channel 3',
        \`channel3_protein\` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Protein correction for channel 3',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When correction was received from ESP32',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_machine_society\` (\`machine_id\`, \`society_id\`)
      )`,

      // Rate Charts table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`rate_charts\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`shared_chart_id\` INT NULL COMMENT 'Reference to master rate chart for shared data',
        \`society_id\` INT NULL COMMENT 'Reference to societies table (for society-assigned charts)',
        \`bmc_id\` INT NULL COMMENT 'Reference to bmcs table (for BMC-assigned charts)',
        \`channel\` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
        \`uploaded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`uploaded_by\` VARCHAR(255) NOT NULL COMMENT 'Admin user who uploaded',
        \`file_name\` VARCHAR(255) NOT NULL COMMENT 'Original CSV file name',
        \`record_count\` INT NOT NULL DEFAULT 0 COMMENT 'Number of rate records',
        \`status\` TINYINT(1) DEFAULT 1 COMMENT '1=Active/Ready to download, 0=Downloaded by machine',
        \`is_bmc_assigned\` TINYINT(1) DEFAULT 0 COMMENT '0=Society assigned, 1=BMC assigned',
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`bmc_id\`) REFERENCES \`${schemaName}\`.\`bmcs\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX \`idx_shared_chart_id\` (\`shared_chart_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_bmc_id\` (\`bmc_id\`),
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
        UNIQUE KEY \`unique_machine_chart_channel\` (\`machine_id\`, \`rate_chart_id\`, \`channel\`),
        INDEX \`idx_machine_society_channel\` (\`machine_id\`, \`society_id\`, \`channel\`),
        INDEX \`idx_rate_chart_id\` (\`rate_chart_id\`),
        INDEX \`idx_downloaded_at\` (\`downloaded_at\`)
      )`,

      // Machine Access Requests table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machine_access_requests\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`machine_id\` INT NOT NULL COMMENT 'Reference to machines table',
        \`user_id\` INT NOT NULL COMMENT 'User requesting access (from main users table)',
        \`access_token\` TEXT NOT NULL COMMENT 'JWT token for 15-minute access',
        \`expires_at\` DATETIME NOT NULL COMMENT 'When the access expires',
        \`status\` ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'pending' COMMENT 'Request status: pending=waiting, approved=admin approved (needs user to start), active=timer running, rejected=denied',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When request was created',
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
        FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.\`machines\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY \`unique_machine_user\` (\`machine_id\`, \`user_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_expires\` (\`expires_at\`)
      ) COMMENT='Stores temporary access requests for master machine changes with 15-minute validity'`,

      // Machine Statistics table
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`machine_statistics\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`machine_id\` INT NOT NULL COMMENT 'Reference to machines table',
        \`society_id\` INT NOT NULL COMMENT 'Reference to societies table',
        \`machine_type\` VARCHAR(50) NOT NULL COMMENT 'Machine type',
        \`version\` VARCHAR(20) NOT NULL COMMENT 'Machine version',
        \`total_test\` INT DEFAULT 0 COMMENT 'Total tests (T parameter)',
        \`daily_cleaning\` INT DEFAULT 0 COMMENT 'Daily cleaning count (D parameter)',
        \`weekly_cleaning\` INT DEFAULT 0 COMMENT 'Weekly cleaning count (W parameter)',
        \`cleaning_skip\` INT DEFAULT 0 COMMENT 'Cleaning skip count (S parameter)',
        \`gain\` INT DEFAULT 0 COMMENT 'Gain value (G parameter)',
        \`auto_channel\` VARCHAR(20) DEFAULT NULL COMMENT 'Auto channel status (ENABLE/DISABLE)',
        \`statistics_date\` DATE NOT NULL COMMENT 'Date of statistics',
        \`statistics_time\` TIME NOT NULL COMMENT 'Time of statistics',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`machine_id\`) REFERENCES \`${schemaName}\`.\`machines\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX \`idx_machine_id\` (\`machine_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_statistics_date\` (\`statistics_date\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      )`,

      // Section Pulse table (Tracks section start/end pulse and inactivity)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`section_pulse\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`society_id\` INT NOT NULL,
        \`pulse_date\` DATE NOT NULL,
        \`first_collection_time\` DATETIME DEFAULT NULL COMMENT 'Section start pulse - first collection of the day',
        \`last_collection_time\` DATETIME DEFAULT NULL COMMENT 'Last collection recorded',
        \`section_end_time\` DATETIME DEFAULT NULL COMMENT 'Section end pulse - 60 min after last collection',
        \`pulse_status\` ENUM('not_started', 'active', 'paused', 'ended', 'inactive') DEFAULT 'not_started' COMMENT 'Current pulse status',
        \`total_collections\` INT DEFAULT 0 COMMENT 'Total collections for the day',
        \`total_farmers\` INT DEFAULT 0 COMMENT 'Total registered farmers in society',
        \`present_farmers\` INT DEFAULT 0 COMMENT 'Number of farmers who made collections',
        \`absent_farmers\` INT DEFAULT 0 COMMENT 'Number of farmers who did not make collections',
        \`inactive_days\` INT DEFAULT 0 COMMENT 'Number of consecutive days without pulse',
        \`last_checked\` DATETIME DEFAULT NULL COMMENT 'Last time status was checked/updated',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY \`unique_society_date\` (\`society_id\`, \`pulse_date\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_pulse_date\` (\`pulse_date\`),
        INDEX \`idx_pulse_status\` (\`pulse_status\`),
        INDEX \`idx_last_checked\` (\`last_checked\`)
      )`,

      // Admin Payment Settings table (Stores Paytm API keys and payment configuration per admin)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`admin_payment_settings\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`paytm_merchant_id\` VARCHAR(100) COMMENT 'Paytm Merchant ID',
        \`paytm_merchant_key\` VARCHAR(255) COMMENT 'Paytm Merchant Key (encrypted)',
        \`paytm_website\` VARCHAR(50) DEFAULT 'WEBSTAGING' COMMENT 'Paytm Website (WEBSTAGING/DEFAULT)',
        \`paytm_industry_type\` VARCHAR(50) DEFAULT 'Retail' COMMENT 'Paytm Industry Type',
        \`paytm_channel_id\` VARCHAR(50) DEFAULT 'WEB' COMMENT 'Paytm Channel ID',
        \`paytm_callback_url\` VARCHAR(255) COMMENT 'Paytm payment callback URL',
        \`paytm_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable Paytm payments',
        \`upi_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable UPI payments',
        \`bank_transfer_enabled\` ENUM('YES', 'NO') DEFAULT 'YES' COMMENT 'Enable bank transfers',
        \`cash_payment_enabled\` ENUM('YES', 'NO') DEFAULT 'YES' COMMENT 'Enable cash payments',
        \`whatsapp_notifications\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Send payment notifications via WhatsApp',
        \`whatsapp_api_key\` VARCHAR(500) COMMENT 'WhatsApp API Key (Twilio Account SID)',
        \`whatsapp_api_url\` VARCHAR(500) DEFAULT 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json' COMMENT 'WhatsApp API URL',
        \`whatsapp_from_number\` VARCHAR(50) DEFAULT 'whatsapp:+14155238886' COMMENT 'WhatsApp sender number',
        \`sms_notifications\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Send payment notifications via SMS',
        \`sms_provider\` ENUM('twilio', 'msg91', 'textlocal') DEFAULT 'twilio' COMMENT 'SMS provider',
        \`sms_api_key\` VARCHAR(500) COMMENT 'SMS API Key',
        \`sms_api_secret\` VARCHAR(500) COMMENT 'SMS API Secret (for Twilio)',
        \`sms_api_url\` VARCHAR(500) COMMENT 'SMS API URL',
        \`sms_from_number\` VARCHAR(50) COMMENT 'SMS sender number/ID',
        \`email_notifications\` ENUM('YES', 'NO') DEFAULT 'YES' COMMENT 'Send payment notifications via Email',
        \`auto_payment_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable automated payments',
        \`payment_threshold\` DECIMAL(12,2) DEFAULT 500.00 COMMENT 'Minimum amount for automated payment',
        \`payment_cycle\` ENUM('daily', 'weekly', 'biweekly', 'monthly') DEFAULT 'monthly' COMMENT 'Payment cycle frequency',
        \`payment_day\` INT DEFAULT 1 COMMENT 'Day of month/week for payment (1-31 for monthly, 1-7 for weekly)',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_paytm_enabled\` (\`paytm_enabled\`),
        INDEX \`idx_auto_payment\` (\`auto_payment_enabled\`)
      )`,

      // Payment Transactions table (Complete payment history and transaction records)
      `CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`payment_transactions\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`transaction_id\` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique transaction identifier',
        \`farmer_id\` INT NOT NULL COMMENT 'Farmer receiving payment',
        \`society_id\` INT COMMENT 'Society associated with payment',
        \`payment_method\` ENUM('bank', 'upi', 'paytm', 'cash') NOT NULL COMMENT 'Payment method used',
        \`amount\` DECIMAL(12,2) NOT NULL COMMENT 'Transaction amount',
        \`transaction_status\` ENUM('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled') DEFAULT 'pending' COMMENT 'Transaction status',
        \`payment_date\` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Payment initiation date',
        \`completion_date\` DATETIME COMMENT 'Payment completion date',
        \`reference_number\` VARCHAR(100) COMMENT 'Bank/UPI/Paytm reference number',
        \`paytm_order_id\` VARCHAR(100) COMMENT 'Paytm order ID',
        \`paytm_txn_id\` VARCHAR(100) COMMENT 'Paytm transaction ID',
        \`upi_transaction_id\` VARCHAR(100) COMMENT 'UPI transaction ID',
        \`bank_transaction_id\` VARCHAR(100) COMMENT 'Bank transaction ID',
        \`beneficiary_account\` VARCHAR(50) COMMENT 'Beneficiary bank account number',
        \`beneficiary_ifsc\` VARCHAR(15) COMMENT 'Beneficiary IFSC code',
        \`beneficiary_upi\` VARCHAR(100) COMMENT 'Beneficiary UPI ID',
        \`payment_description\` TEXT COMMENT 'Payment description/notes',
        \`failure_reason\` TEXT COMMENT 'Reason for payment failure',
        \`retry_count\` INT DEFAULT 0 COMMENT 'Number of retry attempts',
        \`is_automated\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Was this an automated payment',
        \`whatsapp_sent\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'WhatsApp notification sent',
        \`sms_sent\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'SMS notification sent',
        \`email_sent\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Email notification sent',
        \`notification_error\` TEXT COMMENT 'Notification delivery errors',
        \`metadata\` JSON COMMENT 'Additional transaction metadata',
        \`created_by\` INT COMMENT 'User who initiated payment',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`farmer_id\`) REFERENCES \`${schemaName}\`.\`farmers\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`society_id\`) REFERENCES \`${schemaName}\`.\`societies\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        INDEX \`idx_transaction_id\` (\`transaction_id\`),
        INDEX \`idx_farmer_id\` (\`farmer_id\`),
        INDEX \`idx_society_id\` (\`society_id\`),
        INDEX \`idx_payment_method\` (\`payment_method\`),
        INDEX \`idx_transaction_status\` (\`transaction_status\`),
        INDEX \`idx_payment_date\` (\`payment_date\`),
        INDEX \`idx_completion_date\` (\`completion_date\`),
        INDEX \`idx_reference_number\` (\`reference_number\`),
        INDEX \`idx_paytm_order_id\` (\`paytm_order_id\`),
        INDEX \`idx_is_automated\` (\`is_automated\`),
        INDEX \`idx_created_at\` (\`created_at\`)
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