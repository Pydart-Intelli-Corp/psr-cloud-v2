-- Insert sample data: machine m15, society S1
INSERT INTO `machine_corrections` (
  `machine_id`, `society_id`, `machine_type`,
  `channel1_fat`, `channel1_snf`, `channel1_clr`, `channel1_temp`, `channel1_water`, `channel1_protein`,
  `channel2_fat`, `channel2_snf`, `channel2_clr`, `channel2_temp`, `channel2_water`, `channel2_protein`,
  `channel3_fat`, `channel3_snf`, `channel3_clr`, `channel3_temp`, `channel3_water`, `channel3_protein`,
  `status`, `created_at`, `updated_at`
) VALUES (
  'm15', 'S1', 'LSE-SVWTBQ-12AH',
  0.10, 0.05, 0.02, 0.00, 0.00, 0.03,
  0.15, 0.08, 0.01, 0.00, 0.00, 0.04,
  0.12, 0.06, 0.00, 0.00, 0.00, 0.02,
  1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
);
