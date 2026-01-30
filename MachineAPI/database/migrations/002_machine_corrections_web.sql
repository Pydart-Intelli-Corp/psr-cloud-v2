-- Machine Corrections Web Table
-- This table stores correction values entered from the web application
-- Status field: 1 = active, 0 = inactive (only one active record per machine)

CREATE TABLE IF NOT EXISTS `machine_corrections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_id` varchar(50) NOT NULL,
  `society_id` varchar(50) NOT NULL,
  `machine_type` varchar(100) DEFAULT NULL,
  `channel1_fat` decimal(10,2) DEFAULT NULL,
  `channel1_snf` decimal(10,2) DEFAULT NULL,
  `channel1_clr` decimal(10,2) DEFAULT NULL,
  `channel1_temp` decimal(10,2) DEFAULT NULL,
  `channel1_water` decimal(10,2) DEFAULT NULL,
  `channel1_protein` decimal(10,2) DEFAULT NULL,
  `channel2_fat` decimal(10,2) DEFAULT NULL,
  `channel2_snf` decimal(10,2) DEFAULT NULL,
  `channel2_clr` decimal(10,2) DEFAULT NULL,
  `channel2_temp` decimal(10,2) DEFAULT NULL,
  `channel2_water` decimal(10,2) DEFAULT NULL,
  `channel2_protein` decimal(10,2) DEFAULT NULL,
  `channel3_fat` decimal(10,2) DEFAULT NULL,
  `channel3_snf` decimal(10,2) DEFAULT NULL,
  `channel3_clr` decimal(10,2) DEFAULT NULL,
  `channel3_temp` decimal(10,2) DEFAULT NULL,
  `channel3_water` decimal(10,2) DEFAULT NULL,
  `channel3_protein` decimal(10,2) DEFAULT NULL,
  `status` int NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_machine_id` (`machine_id`),
  KEY `idx_society_id` (`society_id`),
  KEY `idx_status` (`status`),
  KEY `idx_machine_status` (`machine_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
