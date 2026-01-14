-- Add bmc_id column to rate_charts table for direct BMC assignments
-- This allows BMC charts to be independent of societies

ALTER TABLE rate_charts 
ADD COLUMN bmc_id INT NULL AFTER society_id,
ADD INDEX idx_bmc_id (bmc_id),
ADD CONSTRAINT fk_rate_charts_bmc 
  FOREIGN KEY (bmc_id) REFERENCES bmcs(id) 
  ON DELETE CASCADE;

-- Note: Either society_id OR bmc_id should be set, not both
-- society_id is for society-assigned charts
-- bmc_id is for BMC-assigned charts (when is_bmc_assigned = 1)
