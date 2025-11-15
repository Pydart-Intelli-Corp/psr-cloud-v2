'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    console.log('📊 Adding status column to rate_charts tables in all admin schemas...');
    
    // Get the main database connection
    const sequelize = queryInterface.sequelize;
    
    // Get all admin users with dbKey
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey, companyName 
      FROM users 
      WHERE dbKey IS NOT NULL AND dbKey != ''
    `);
    
    console.log(`Found ${admins.length} admin(s) with schemas`);
    
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      try {
        // Check if schema exists
        const [schemaExists] = await sequelize.query(`
          SELECT SCHEMA_NAME 
          FROM INFORMATION_SCHEMA.SCHEMATA 
          WHERE SCHEMA_NAME = '${schemaName}'
        `);
        
        if (schemaExists.length === 0) {
          console.log(`⏭️  Schema ${schemaName} does not exist, skipping...`);
          continue;
        }
        
        // Check if rate_charts table exists
        const [tableExists] = await sequelize.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'rate_charts'
        `);
        
        if (tableExists.length === 0) {
          console.log(`⏭️  rate_charts table does not exist in ${schemaName}, skipping...`);
          continue;
        }
        
        // Check if status column already exists
        const [columnExists] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'rate_charts' 
            AND COLUMN_NAME = 'status'
        `);
        
        if (columnExists.length > 0) {
          console.log(`✅ Status column already exists in ${schemaName}.rate_charts`);
          continue;
        }
        
        // Add status column
        await sequelize.query(`
          ALTER TABLE \`${schemaName}\`.rate_charts
          ADD COLUMN status TINYINT(1) DEFAULT 1 COMMENT '1=Active/Ready to download, 0=Downloaded by machine'
          AFTER record_count
        `);
        
        console.log(`✅ Added status column to ${schemaName}.rate_charts`);
        
        // Update existing records to have status = 1 (active)
        await sequelize.query(`
          UPDATE \`${schemaName}\`.rate_charts
          SET status = 1
          WHERE status IS NULL
        `);
        
        console.log(`✅ Updated existing records in ${schemaName}.rate_charts to status = 1`);
        
      } catch (error) {
        console.error(`❌ Error processing schema ${schemaName}:`, error.message);
      }
    }
    
    console.log('✅ Migration completed successfully!');
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    
    console.log('📊 Removing status column from rate_charts tables...');
    
    // Get all admin users with dbKey
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM users 
      WHERE dbKey IS NOT NULL AND dbKey != ''
    `);
    
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      try {
        // Check if column exists before dropping
        const [columnExists] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'rate_charts' 
            AND COLUMN_NAME = 'status'
        `);
        
        if (columnExists.length > 0) {
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.rate_charts
            DROP COLUMN status
          `);
          
          console.log(`✅ Removed status column from ${schemaName}.rate_charts`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing schema ${schemaName}:`, error.message);
      }
    }
    
    console.log('✅ Rollback completed successfully!');
  }
};
