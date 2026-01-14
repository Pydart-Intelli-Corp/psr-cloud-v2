-- Clean up old BMC-assigned charts that were stored with society_id
-- These should now use bmc_id instead

-- Delete old BMC charts (is_bmc_assigned=1 but using society_id)
DELETE FROM rate_chart_data
WHERE rate_chart_id IN (
  SELECT id FROM rate_charts
  WHERE is_bmc_assigned = 1 AND society_id IS NOT NULL AND bmc_id IS NULL
);

DELETE FROM rate_charts
WHERE is_bmc_assigned = 1 AND society_id IS NOT NULL AND bmc_id IS NULL;

-- Verify cleanup
SELECT 
  COUNT(*) as old_bmc_charts,
  'Old BMC charts (should be 0)' as description
FROM rate_charts
WHERE is_bmc_assigned = 1 AND society_id IS NOT NULL AND bmc_id IS NULL;

SELECT 
  COUNT(*) as new_bmc_charts,
  'New BMC charts (using bmc_id)' as description
FROM rate_charts
WHERE is_bmc_assigned = 1 AND bmc_id IS NOT NULL;
