-- Update existing admin schemas to add bmc_id column to rate_charts table
-- Run this for each admin schema: Replace 'schemaname' with actual schema name

-- Step 1: Make society_id nullable
ALTER TABLE rate_charts MODIFY COLUMN society_id INT NULL COMMENT 'Reference to societies table (for society-assigned charts)';

-- Step 2: Add bmc_id column
ALTER TABLE rate_charts ADD COLUMN bmc_id INT NULL COMMENT 'Reference to bmcs table (for BMC-assigned charts)' AFTER society_id;

-- Step 3: Add foreign key constraint
ALTER TABLE rate_charts ADD CONSTRAINT fk_rate_charts_bmc FOREIGN KEY (bmc_id) REFERENCES bmcs(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Add index
ALTER TABLE rate_charts ADD INDEX idx_bmc_id (bmc_id);

-- Step 5: Drop the old unique constraint
ALTER TABLE rate_charts DROP INDEX unique_society_channel_assignment;

-- Verify changes
DESCRIBE rate_charts;
