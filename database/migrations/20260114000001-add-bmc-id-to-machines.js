'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get all admin schemas
      const [schemas] = await queryInterface.sequelize.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA 
         WHERE SCHEMA_NAME LIKE '%\\_%' 
         AND SCHEMA_NAME NOT LIKE 'mysql%' 
         AND SCHEMA_NAME NOT LIKE 'information_schema%' 
         AND SCHEMA_NAME NOT LIKE 'performance_schema%'
         AND SCHEMA_NAME NOT LIKE 'sys%'
         AND SCHEMA_NAME != 'psr_v4_main'`,
        { transaction }
      );

      console.log(`Found ${schemas.length} admin schemas to update`);

      for (const schema of schemas) {
        const schemaName = schema.SCHEMA_NAME;
        console.log(`Updating schema: ${schemaName}`);

        // Check if bmc_id column already exists
        const [columns] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = '${schemaName}' 
           AND TABLE_NAME = 'machines' 
           AND COLUMN_NAME = 'bmc_id'`,
          { transaction }
        );

        if (columns.length === 0) {
          // Add bmc_id column
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${schemaName}\`.machines 
             ADD COLUMN bmc_id INT NULL AFTER society_id`,
            { transaction }
          );

          // Add foreign key constraint
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${schemaName}\`.machines 
             ADD CONSTRAINT fk_machines_bmc 
             FOREIGN KEY (bmc_id) REFERENCES \`${schemaName}\`.bmcs(id) 
             ON DELETE SET NULL ON UPDATE CASCADE`,
            { transaction }
          );

          // Add index
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${schemaName}\`.machines 
             ADD INDEX idx_bmc_id (bmc_id)`,
            { transaction }
          );

          console.log(`✅ Added bmc_id column to ${schemaName}.machines`);
        } else {
          console.log(`⏭️  bmc_id column already exists in ${schemaName}.machines`);
        }
      }

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get all admin schemas
      const [schemas] = await queryInterface.sequelize.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA 
         WHERE SCHEMA_NAME LIKE '%\\_%' 
         AND SCHEMA_NAME NOT LIKE 'mysql%' 
         AND SCHEMA_NAME NOT LIKE 'information_schema%' 
         AND SCHEMA_NAME NOT LIKE 'performance_schema%'
         AND SCHEMA_NAME NOT LIKE 'sys%'
         AND SCHEMA_NAME != 'psr_v4_main'`,
        { transaction }
      );

      for (const schema of schemas) {
        const schemaName = schema.SCHEMA_NAME;
        
        // Drop foreign key constraint
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${schemaName}\`.machines 
           DROP FOREIGN KEY fk_machines_bmc`,
          { transaction }
        );

        // Drop index
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${schemaName}\`.machines 
           DROP INDEX idx_bmc_id`,
          { transaction }
        );

        // Drop column
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${schemaName}\`.machines 
           DROP COLUMN bmc_id`,
          { transaction }
        );

        console.log(`✅ Removed bmc_id column from ${schemaName}.machines`);
      }

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
