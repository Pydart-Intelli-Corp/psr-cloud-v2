'use strict';

const { Sequelize } = require('sequelize');

/**
 * Migration: Add Payment Features
 * - Adds payment columns to farmers table
 * - Creates admin_payment_settings table
 * - Creates payment_transactions table
 * 
 * Date: January 28, 2026
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all admin schemas (schemas that are not psr_v4_main, information_schema, mysql, performance_schema, sys)
      const [schemas] = await queryInterface.sequelize.query(`
        SELECT SCHEMA_NAME 
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME NOT IN ('psr_v4_main', 'information_schema', 'mysql', 'performance_schema', 'sys')
        AND SCHEMA_NAME LIKE '%_%'
      `);

      console.log(`\n🔄 Found ${schemas.length} admin schemas to migrate\n`);

      for (const { SCHEMA_NAME: schemaName } of schemas) {
        console.log(`\n📦 Migrating schema: ${schemaName}`);

        try {
          // 1. Add payment columns to farmers table
          console.log(`  ➜ Adding payment columns to farmers table...`);
          
          // Check which columns already exist
          const [columns] = await queryInterface.sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'farmers'
            AND COLUMN_NAME IN ('upi_id', 'upi_enabled', 'paytm_phone', 'paytm_enabled', 
                                'preferred_payment_mode', 'whatsapp_billing_enabled', 
                                'automated_payment_enabled', 'last_payment_date', 
                                'last_payment_amount', 'pending_payment_amount')
          `);
          
          const existingColumns = columns.map(c => c.COLUMN_NAME);
          
          // Add columns that don't exist
          const columnsToAdd = [];
          
          if (!existingColumns.includes('upi_id')) {
            columnsToAdd.push("ADD COLUMN `upi_id` VARCHAR(100) COMMENT 'UPI ID for payments' AFTER `ifsc_code`");
          }
          if (!existingColumns.includes('upi_enabled')) {
            columnsToAdd.push("ADD COLUMN `upi_enabled` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable UPI payments' AFTER `upi_id`");
          }
          if (!existingColumns.includes('paytm_phone')) {
            columnsToAdd.push("ADD COLUMN `paytm_phone` VARCHAR(20) COMMENT 'Paytm registered phone number' AFTER `upi_enabled`");
          }
          if (!existingColumns.includes('paytm_enabled')) {
            columnsToAdd.push("ADD COLUMN `paytm_enabled` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable Paytm payments' AFTER `paytm_phone`");
          }
          if (!existingColumns.includes('preferred_payment_mode')) {
            columnsToAdd.push("ADD COLUMN `preferred_payment_mode` ENUM('bank', 'upi', 'paytm', 'cash') DEFAULT 'bank' COMMENT 'Preferred payment method' AFTER `paytm_enabled`");
          }
          if (!existingColumns.includes('whatsapp_billing_enabled')) {
            columnsToAdd.push("ADD COLUMN `whatsapp_billing_enabled` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Send bills via WhatsApp' AFTER `preferred_payment_mode`");
          }
          if (!existingColumns.includes('automated_payment_enabled')) {
            columnsToAdd.push("ADD COLUMN `automated_payment_enabled` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable automated payments' AFTER `whatsapp_billing_enabled`");
          }
          if (!existingColumns.includes('last_payment_date')) {
            columnsToAdd.push("ADD COLUMN `last_payment_date` DATE COMMENT 'Date of last payment received' AFTER `automated_payment_enabled`");
          }
          if (!existingColumns.includes('last_payment_amount')) {
            columnsToAdd.push("ADD COLUMN `last_payment_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Amount of last payment' AFTER `last_payment_date`");
          }
          if (!existingColumns.includes('pending_payment_amount')) {
            columnsToAdd.push("ADD COLUMN `pending_payment_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Pending payment amount' AFTER `last_payment_amount`");
          }
          
          if (columnsToAdd.length > 0) {
            await queryInterface.sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\`
              ${columnsToAdd.join(',\n              ')}
            `);
            console.log(`    ✓ Added ${columnsToAdd.length} columns`);
          } else {
            console.log(`    ✓ All columns already exist`);
          }

          // 2. Add indexes for payment columns
          console.log(`  ➜ Adding indexes for payment columns...`);
          
          // Check which indexes already exist
          const [indexes] = await queryInterface.sequelize.query(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'farmers'
            AND INDEX_NAME IN ('idx_payment_mode', 'idx_upi_enabled', 'idx_paytm_enabled')
            GROUP BY INDEX_NAME
          `);
          
          const existingIndexes = indexes.map(i => i.INDEX_NAME);
          
          // Add indexes that don't exist
          if (!existingIndexes.includes('idx_payment_mode')) {
            await queryInterface.sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\`
              ADD INDEX \`idx_payment_mode\` (\`preferred_payment_mode\`)
            `);
          }
          if (!existingIndexes.includes('idx_upi_enabled')) {
            await queryInterface.sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\`
              ADD INDEX \`idx_upi_enabled\` (\`upi_enabled\`)
            `);
          }
          if (!existingIndexes.includes('idx_paytm_enabled')) {
            await queryInterface.sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\`
              ADD INDEX \`idx_paytm_enabled\` (\`paytm_enabled\`)
            `);
          }
          
          console.log(`    ✓ Indexes added`);

          // 3. Create admin_payment_settings table
          console.log(`  ➜ Creating admin_payment_settings table...`);
          
          await queryInterface.sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`admin_payment_settings\` (
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
              \`sms_notifications\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Send payment notifications via SMS',
              \`email_notifications\` ENUM('YES', 'NO') DEFAULT 'YES' COMMENT 'Send payment notifications via Email',
              \`auto_payment_enabled\` ENUM('YES', 'NO') DEFAULT 'NO' COMMENT 'Enable automated payments',
              \`payment_threshold\` DECIMAL(12,2) DEFAULT 500.00 COMMENT 'Minimum amount for automated payment',
              \`payment_cycle\` ENUM('daily', 'weekly', 'biweekly', 'monthly') DEFAULT 'monthly' COMMENT 'Payment cycle frequency',
              \`payment_day\` INT DEFAULT 1 COMMENT 'Day of month/week for payment (1-31 for monthly, 1-7 for weekly)',
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX \`idx_paytm_enabled\` (\`paytm_enabled\`),
              INDEX \`idx_auto_payment\` (\`auto_payment_enabled\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);

          // 4. Create payment_transactions table
          console.log(`  ➜ Creating payment_transactions table...`);
          
          await queryInterface.sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`${schemaName}\`.\`payment_transactions\` (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);

          // 5. Insert default payment settings for each admin
          console.log(`  ➜ Inserting default payment settings...`);
          
          await queryInterface.sequelize.query(`
            INSERT INTO \`${schemaName}\`.\`admin_payment_settings\` 
            (\`paytm_enabled\`, \`upi_enabled\`, \`bank_transfer_enabled\`, \`cash_payment_enabled\`, 
             \`whatsapp_notifications\`, \`sms_notifications\`, \`email_notifications\`, 
             \`auto_payment_enabled\`, \`payment_threshold\`, \`payment_cycle\`, \`payment_day\`)
            SELECT 'NO', 'NO', 'YES', 'YES', 'NO', 'NO', 'YES', 'NO', 500.00, 'monthly', 1
            WHERE NOT EXISTS (SELECT 1 FROM \`${schemaName}\`.\`admin_payment_settings\` LIMIT 1)
          `);

          console.log(`  ✅ Schema ${schemaName} migrated successfully`);

        } catch (schemaError) {
          console.error(`  ❌ Error migrating schema ${schemaName}:`, schemaError.message);
          // Continue with next schema instead of failing entire migration
        }
      }

      console.log(`\n✅ Payment features migration completed for all schemas\n`);

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Get all admin schemas
      const [schemas] = await queryInterface.sequelize.query(`
        SELECT SCHEMA_NAME 
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME NOT IN ('psr_v4_main', 'information_schema', 'mysql', 'performance_schema', 'sys')
        AND SCHEMA_NAME LIKE '%_%'
      `);

      console.log(`\n🔄 Rolling back ${schemas.length} admin schemas\n`);

      for (const { SCHEMA_NAME: schemaName } of schemas) {
        console.log(`\n📦 Rolling back schema: ${schemaName}`);

        try {
          // Drop payment_transactions table
          await queryInterface.sequelize.query(`
            DROP TABLE IF EXISTS \`${schemaName}\`.\`payment_transactions\`
          `);

          // Drop admin_payment_settings table
          await queryInterface.sequelize.query(`
            DROP TABLE IF EXISTS \`${schemaName}\`.\`admin_payment_settings\`
          `);

          // Remove payment columns from farmers table
          const [farmerColumns] = await queryInterface.sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'farmers'
            AND COLUMN_NAME IN ('upi_id', 'upi_enabled', 'paytm_phone', 'paytm_enabled', 
                                'preferred_payment_mode', 'whatsapp_billing_enabled', 
                                'automated_payment_enabled', 'last_payment_date', 
                                'last_payment_amount', 'pending_payment_amount')
          `);
          
          const columnsToRemove = farmerColumns.map(c => c.COLUMN_NAME);
          
          if (columnsToRemove.length > 0) {
            const dropStatements = columnsToRemove.map(col => `DROP COLUMN \`${col}\``);
            await queryInterface.sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\`
              ${dropStatements.join(',\n              ')}
            `);
          }

          console.log(`  ✅ Schema ${schemaName} rolled back successfully`);

        } catch (schemaError) {
          console.error(`  ❌ Error rolling back schema ${schemaName}:`, schemaError.message);
        }
      }

      console.log(`\n✅ Rollback completed for all schemas\n`);

    } catch (error) {
      console.error('\n❌ Rollback failed:', error);
      throw error;
    }
  }
};
