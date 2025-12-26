import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import path from 'path';

// Database configuration for Azure MySQL
let sequelize: Sequelize | null = null;

const createSequelizeInstance = () => {
    if (!sequelize) {
    // Don't initialize during build time
    if (process.env.NODE_ENV === 'development' || process.env.BUILDING !== 'true') {
      // Determine SSL configuration based on environment
      // Only use SSL if DB_SSL_CA is explicitly set and not empty
      const sslConfig = (process.env.DB_SSL_CA && process.env.DB_SSL_CA.trim() !== '') ? {
        require: true,
        rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
        ca: path.join(process.cwd(), process.env.DB_SSL_CA),
      } : (process.env.NODE_ENV === 'production' && process.env.DB_HOST?.includes('azure')) ? {
        require: true,
        rejectUnauthorized: false,
      } : false;      sequelize = new Sequelize(
      process.env.DB_NAME || 'psr_v4_main',
      process.env.DB_USER || 'psr_admin',
      process.env.DB_PASSWORD || 'Access@404',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        dialectModule: mysql2,
        timezone: '+05:30', // Use Indian Standard Time (IST)
        dialectOptions: {
          ssl: sslConfig,
          connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
        },
        pool: {
          max: parseInt(process.env.DB_POOL_MAX || '10'),
          min: parseInt(process.env.DB_POOL_MIN || '0'),
          acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
          idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '300') * 1000,
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        benchmark: process.env.NODE_ENV === 'development',
      }
    );
    }
  }
  return sequelize;
};

// Test database connection
export const testConnection = async () => {
  try {
    const db = createSequelizeInstance();
    if (!db) {
      console.error('❌ Database not initialized');
      return false;
    }
    await db.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Initialize database
export const initDatabase = async (useMigrations: boolean = false) => {
  try {
    const db = createSequelizeInstance();
    if (!db) {
      console.error('❌ Database not initialized');
      return false;
    }
    
    if (useMigrations) {
      // Use migrations instead of sync for production
      const { migrationRunner } = await import('./migrations');
      await migrationRunner.initializeDatabase();
    } else {
      // Development mode - use sync
      await db.sync({ alter: process.env.NODE_ENV === 'development' });
    }
    
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    return false;
  }
};

// Connect to database
export const connectDB = async () => {
  try {
    const db = createSequelizeInstance();
    if (!db) {
      throw new Error('Database not initialized');
    }
    await db.authenticate();
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Function to create admin-specific schema
export const createAdminSchema = async (adminEmail: string): Promise<string> => {
  try {
    // Generate DB key: db-<first 3 letters of email><3 random numbers>
    const emailPrefix = adminEmail.substring(0, 3).toLowerCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    const dbKey = `db_${emailPrefix}${randomSuffix}`;
    
    // Create new database schema
    const db = createSequelizeInstance();
    if (!db) {
      throw new Error('Database not initialized');
    }
    await db.query(`CREATE DATABASE IF NOT EXISTS \`${dbKey}\``);
    
    console.log(`✅ Created admin schema: ${dbKey}`);
    return dbKey;
  } catch (error) {
    console.error('❌ Failed to create admin schema:', error);
    throw error;
  }
};

// Function to get connection for specific admin schema
export const getAdminConnection = (dbKey: string): Sequelize => {
  // Determine SSL configuration based on environment
  // Only use SSL if DB_SSL_CA is explicitly set and not empty
  const sslConfig = (process.env.DB_SSL_CA && process.env.DB_SSL_CA.trim() !== '') ? {
    require: true,
    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
    ca: path.join(process.cwd(), process.env.DB_SSL_CA),
  } : (process.env.NODE_ENV === 'production' && process.env.DB_HOST?.includes('azure')) ? {
    require: true,
    rejectUnauthorized: false,
  } : false;

  return new Sequelize(
    dbKey,
    process.env.DB_USER || 'psr_admin',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      dialectModule: mysql2,
      dialectOptions: {
        ssl: sslConfig,
        connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
        acquireTimeout: parseInt(process.env.DB_COMMAND_TIMEOUT || '60') * 1000,
        timeout: parseInt(process.env.DB_COMMAND_TIMEOUT || '60') * 1000,
      },
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '30'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10') * 1000,
        idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '180') * 1000,
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
};

export default createSequelizeInstance;