// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

module.exports = {
  development: {
    username: process.env.DB_USER || 'psrcloud',
    password: process.env.DB_PASSWORD || 'Access@LRC2404',
    database: process.env.DB_NAME || 'psr_v4_c',
    host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // For development - set to true in production with proper CA
        ca: process.env.DB_SSL_CA ? path.join(process.cwd(), process.env.DB_SSL_CA) : undefined,
      },
      connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
      idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '300') * 1000,
    },
    logging: console.log,
    migrationStorageTableName: 'sequelize_meta'
  },
  test: {
    username: process.env.DB_USER || 'psrcloud',
    password: process.env.DB_PASSWORD || 'Access@LRC2404',
    database: process.env.DB_NAME_TEST || 'psr_v4_c_test',
    host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
      },
    },
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA ? path.join(process.cwd(), process.env.DB_SSL_CA) : undefined,
      },
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '15'),
      min: parseInt(process.env.DB_POOL_MIN || '1'),
      acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
      idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '300') * 1000,
    },
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  }
};