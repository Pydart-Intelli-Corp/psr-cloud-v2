-- Add maintenance status to farmers tables in all admin schemas

-- First, find all admin schemas
SELECT id, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL;

-- For each schema (replace 'SCHEMA_NAME' with actual schema names):
-- ALTER TABLE `SCHEMA_NAME`.farmers 
-- MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
-- DEFAULT 'active' NOT NULL;

-- Example for common schemas (run these individually):
-- ALTER TABLE `manu_man5678`.farmers 
-- MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
-- DEFAULT 'active' NOT NULL;

-- ALTER TABLE `tishnu_tis6517`.farmers 
-- MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_approval', 'maintenance') 
-- DEFAULT 'active' NOT NULL;