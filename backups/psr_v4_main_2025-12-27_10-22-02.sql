-- PSR Cloud V2 Database Backup
-- Generated on: 2025-12-27T10:22:02.971Z
-- Database: psr_v4_main
-- Host: 168.231.121.19

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Table structure for table `admin_schemas`
DROP TABLE IF EXISTS `admin_schemas`;
CREATE TABLE `admin_schemas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminId` int NOT NULL COMMENT 'Reference to admin user',
  `schemaKey` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique schema identifier',
  `schemaName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Human readable schema name',
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT 'Schema status',
  `configuration` json DEFAULT NULL COMMENT 'Schema specific configuration',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schemaKey` (`schemaKey`),
  KEY `admin_schemas_admin_id` (`adminId`),
  KEY `admin_schemas_schema_key` (`schemaKey`),
  KEY `admin_schemas_status` (`status`),
  CONSTRAINT `admin_schemas_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `audit_logs`
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL COMMENT 'User who performed the action',
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)',
  `resource` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Resource affected (USER, ADMIN_SCHEMA, etc.)',
  `resourceId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID of the affected resource',
  `oldValues` json DEFAULT NULL COMMENT 'Previous values (for updates)',
  `newValues` json DEFAULT NULL COMMENT 'New values',
  `ipAddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address of the user',
  `userAgent` text COLLATE utf8mb4_unicode_ci COMMENT 'User agent string',
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action occurred',
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id` (`userId`),
  KEY `audit_logs_action` (`action`),
  KEY `audit_logs_resource` (`resource`),
  KEY `audit_logs_resource_id` (`resourceId`),
  KEY `audit_logs_timestamp` (`timestamp`),
  KEY `audit_logs_ip_address` (`ipAddress`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `machinetype`
DROP TABLE IF EXISTS `machinetype`;
CREATE TABLE `machinetype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of milk testing machine',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description of the machine type',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this machine type is active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `machine_type` (`machine_type`),
  KEY `idx_machine_type` (`machine_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `machinetype`
INSERT INTO `machinetype` (`id`, `machine_type`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
  (1, 'Lactoscan', 'Lactoscan Milk Analyzer - Automatic milk testing equipment', 1, '2025-11-07 02:22:53', '2025-11-07 02:22:53'),
  (2, 'Milkotester', 'Milkotester - Ultrasonic milk analyzer', 1, '2025-11-07 02:22:53', '2025-11-07 02:22:53'),
  (3, 'Ekomilk', 'Ekomilk Analyzer - Multi-parameter milk testing device', 1, '2025-11-07 02:22:53', '2025-11-07 02:22:53'),
  (4, 'Foss MilkoScan', 'Foss MilkoScan - Advanced milk composition analyzer', 1, '2025-11-07 02:22:53', '2025-11-07 02:22:53'),
  (6, 'Manual Testing', 'Manual milk testing using traditional methods', 1, '2025-11-07 02:22:53', '2025-11-07 02:22:53'),
  (7, 'ECOD', 'Imported from CSV', 1, '2025-11-07 02:24:20', '2025-11-07 02:24:20'),
  (8, 'LSE-V3', 'Imported from CSV', 1, '2025-11-07 02:24:20', '2025-11-07 02:24:20'),
  (9, 'LSES-V3', 'Imported from CSV', 1, '2025-11-07 02:24:20', '2025-11-07 02:24:20'),
  (10, 'ECOSV', 'Imported from CSV', 1, '2025-11-07 02:24:20', '2025-11-07 02:24:20'),
  (11, 'ECOV', 'Imported from CSV', 1, '2025-11-07 02:24:20', '2025-11-07 02:24:20'),
  (12, 'ECO-SVPWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (13, 'LSE-SVPWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (14, 'ECOD-G', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (15, 'ECOD-W', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (16, 'LSE-VPWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (17, 'LSE-SVPTGQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (18, 'LSE-VPTGQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (19, 'LSE-PWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (20, 'LSE-WTB', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (21, 'LSE-SVG', 'Imported from CSV', 1, '2025-11-07 02:24:21', '2025-11-07 02:24:21'),
  (22, 'LSE-SV', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (23, 'LG-SPTGQ', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (24, 'LG-SPWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (25, 'LG-SDPWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (26, 'LSEWTB', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (27, 'LG-LitePWTBQ', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (28, 'LSE-DPWTBQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (29, 'LG-SDPWTBQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (30, 'DPST-G', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (31, 'DPST-W', 'Imported from CSV', 1, '2025-11-07 02:24:22', '2025-11-07 02:24:22'),
  (32, 'LG-LitePTGQ', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (33, 'LG-LitePTGQ-6AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (34, 'LG-SDPTGQ', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (35, 'LG-LitePWTBQ-6AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (36, 'LG-SproPWTBQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (37, 'LG-SDPTGQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (38, 'LG-SproPTGQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (39, 'LSE-SVPWTBQ-12AH', 'Imported from CSV', 1, '2025-11-07 02:24:23', '2025-11-07 02:24:23'),
  (40, 'LSE-SVWTBQ-12AH', '', 1, '2025-11-15 00:38:27', '2025-11-15 00:38:27');

-- Table structure for table `otps`
DROP TABLE IF EXISTS `otps`;
CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email address for OTP',
  `otpCode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'OTP code',
  `purpose` enum('email_verification','password_reset','login') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Purpose of the OTP',
  `expiresAt` datetime NOT NULL COMMENT 'OTP expiry timestamp',
  `isUsed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether OTP has been used',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `otps_email` (`email`),
  KEY `otps_otp_code` (`otpCode`),
  KEY `otps_expires_at` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `sequelize_meta`
DROP TABLE IF EXISTS `sequelize_meta`;
CREATE TABLE `sequelize_meta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- Data for table `sequelize_meta`
INSERT INTO `sequelize_meta` (`name`) VALUES
  ('20251107073654-create-all-tables.js'),
  ('20251115000001-add-status-to-rate-charts.js'),
  ('20251115000001-create-machine-statistics-table.js'),
  ('20251115000002-create-rate-chart-download-history.js'),
  ('20251115000003-update-download-history-unique-key.js'),
  ('20251117000001-add-is-master-machine-column.js'),
  ('20251117000001-create-esp32-machine-corrections.js'),
  ('20251117000002-rename-esp32-corrections-table.js'),
  ('20251117000003-drop-old-esp32-table.js'),
  ('20251117000004-copy-esp32-corrections-data.js'),
  ('20251121000001-update-milk-collections-table.js'),
  ('20251121000002-rename-milk-collections-columns.js'),
  ('20251121000003-update-milk-collections-farmer-id-type.js'),
  ('20251121000004-update-milk-collections-structure.js'),
  ('20251121000005-change-collection-time-to-time.js'),
  ('20251121000006-add-collection-date.js'),
  ('20251121000007-add-unique-constraint-milk-collections.js'),
  ('20251121000008-create-milk-dispatches-table.js'),
  ('20251121000009-create-milk-sales-table.js'),
  ('20251124000001-add-shift-type-to-milk-sales.js'),
  ('20251202000001-create-section-pulse-table.js'),
  ('20251205000001-add-paused-status-to-section-pulse.js'),
  ('20251217000001-add-farmer-counts-to-section-pulse.js'),
  ('20251218000001-add-email-to-farmers.js'),
  ('20251218000002-add-unique-constraint-email-farmers.js'),
  ('20251218000003-add-email-notifications-to-farmers.js'),
  ('20251219000001-add-email-to-societies.js'),
  ('20251219000002-add-unique-constraint-email-societies.js'),
  ('20251226000001-add-performance-indexes.js'),
  ('20251226000002-add-auth-performance-indexes.js');

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier for the user',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User email address',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hashed password',
  `fullName` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User full name',
  `role` enum('super_admin','admin','dairy','bmc','society','farmer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'farmer' COMMENT 'User role in hierarchy',
  `status` enum('pending','pending_approval','active','inactive','suspended','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_approval',
  `dbKey` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Database key for admin users (their dedicated schema)',
  `companyName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Company or organization name',
  `companyPincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Company pincode',
  `companyCity` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Company city',
  `companyState` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Company state',
  `parentId` int DEFAULT NULL COMMENT 'Reference to parent user in hierarchy',
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Email verification status',
  `emailVerificationToken` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'OTP for email verification',
  `emailVerificationExpires` datetime DEFAULT NULL COMMENT 'Email verification token expiry',
  `passwordResetToken` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Password reset token',
  `passwordResetExpires` datetime DEFAULT NULL COMMENT 'Password reset token expiry',
  `otpCode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'General purpose OTP code',
  `otpExpires` datetime DEFAULT NULL COMMENT 'OTP expiry timestamp',
  `lastLogin` datetime DEFAULT NULL COMMENT 'Last login timestamp',
  `loginAttempts` int NOT NULL DEFAULT '0' COMMENT 'Number of failed login attempts',
  `lockUntil` datetime DEFAULT NULL COMMENT 'Account lock expiry timestamp',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `users_email` (`email`),
  KEY `users_uid` (`uid`),
  KEY `users_role` (`role`),
  KEY `users_status` (`status`),
  KEY `users_parent_id` (`parentId`),
  KEY `users_is_email_verified` (`isEmailVerified`),
  KEY `users_email_verification_token` (`emailVerificationToken`),
  KEY `users_password_reset_token` (`passwordResetToken`),
  KEY `users_created_at` (`createdAt`),
  KEY `idx_users_email_status` (`email`,`status`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_db_key` (`dbKey`),
  KEY `idx_users_password_reset_token` (`passwordResetToken`),
  KEY `idx_users_email_verification_token` (`emailVerificationToken`),
  KEY `idx_users_parent_id` (`parentId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `users`
INSERT INTO `users` (`id`, `uid`, `email`, `password`, `fullName`, `role`, `status`, `dbKey`, `companyName`, `companyPincode`, `companyCity`, `companyState`, `parentId`, `isEmailVerified`, `emailVerificationToken`, `emailVerificationExpires`, `passwordResetToken`, `passwordResetExpires`, `otpCode`, `otpExpires`, `lastLogin`, `loginAttempts`, `lockUntil`, `createdAt`, `updatedAt`) VALUES
  (1, 'PSR_SUPER_1762501093719', 'admin@poornasreeequipments.com', '$2b$12$wtg7qhjaf1JQcj6tB6m8EeUhEQHUjjrA5j3ds//dPsgON2r.EJ9wC', 'Super Administrator', 'super_admin', 'active', NULL, 'Poornasree Equipments Cloud', '560001', 'Bangalore', 'Karnataka', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-11-07 02:08:13', '2025-11-07 02:08:13'),
  (2, 'PSR_1762501496853_v455xv2bp', 'tishnu.engineer.at.poornasree.eqp@gmail.com', '$2b$12$tB234y/lMI/HZ9gU.eqUs.pjp912If.8Qt/CqWfoF6N2jHb9mw6ky', 'Babumon Gopi', 'admin', 'active', 'BAB1568', 'Poornasree Equipments', '682304', 'Maradu', 'Kerala', NULL, 1, '372729', '2025-11-07 02:24:56', NULL, NULL, '372729', '2025-11-07 02:24:56', '2025-11-07 04:07:26', 0, NULL, '2025-11-07 02:14:56', '2025-11-07 04:07:26'),
  (3, 'PSR_1762834299666_8wtjxs8g5', 'offical.tishnu@gmail.com', '$2b$12$3qxzAUu7eiP7uKOf66aGwuYT/2iFhBA/T0XXy/S0e5W5od/1eAaPe', 'Tishnu', 'admin', 'pending', NULL, 'Poornasree', '685561', 'Adimali', 'Kerala', NULL, 0, '161297', '2025-11-10 22:51:39', NULL, NULL, '161297', '2025-11-10 22:51:39', NULL, 0, NULL, '2025-11-10 22:41:39', '2025-11-10 22:41:39'),
  (4, 'PSR_1762834436371_67rdgjymn', 'tech.poornasree@gmail.com', '$2b$12$mYp2oYYf8ncXn1X4I2918u0crvT/jIpJKXzOkFv7cE/t45AcDiCkS', 'Poornasree Equipments', 'admin', 'active', 'POO5382', 'Poornasree Equipments', '682304', 'Maradu', 'Kerala', NULL, 1, '976341', '2025-11-10 22:53:56', NULL, NULL, '976341', '2025-11-10 22:53:56', '2025-11-21 01:39:28', 0, NULL, '2025-11-10 22:43:56', '2025-11-21 01:39:28'),
  (6, 'PSR_1762921993685_bo0ox0cj0', 'abcdqrst404@gmail.com', '$2b$12$HmqNXkO82x5fSS3jicWcW.voYA7WGKF7MBWC3JJ0X4CAgyRgtm0Re', 'Tishnu', 'admin', 'active', 'TIS1353', 'psr', '685561', 'Adimali', 'Kerala', NULL, 1, '142035', '2025-11-15 01:02:08', 'f509cd3ea10bd4b8bd54cee0228a68e7fa83e69499c56d94ec0e1a818abbc0c7', '2025-11-15 02:25:06', '142035', '2025-11-15 01:02:08', '2025-12-26 09:55:05', 0, NULL, '2025-11-11 23:03:13', '2025-12-26 09:55:05'),
  (7, 'PSR_1762923989771_bd1g9chlm', 'official4tishnu@gmail.com', '$2b$12$T/BTQImTDE3IqoZajUYIUeRDCEukhBS1YPGRLornKGcEiruxRX.M6', 'dfsf', 'admin', 'active', 'DFS7975', 'sfds', '685562', 'Kallarkutty', 'Kerala', NULL, 1, '356836', '2025-12-19 11:37:53', NULL, NULL, '356836', '2025-12-19 11:37:53', '2025-12-19 11:30:02', 0, NULL, '2025-11-11 23:36:29', '2025-12-19 11:30:02'),
  (9, 'PSR_1762929841738_6g24h5pgl', 'babutn1977@gmail.com', '$2b$12$1A9vRn4FxzRt0UeWpGBioueVsYScAfIL84UMoAEXJT6VEaudpQXoi', 'Dasha', 'admin', 'active', 'DAS2089', 'psr company', '625521', 'Kamayakoundanpatti', 'Tamil Nadu', NULL, 1, '412781', '2025-11-12 01:24:01', NULL, NULL, '412781', '2025-11-12 01:24:01', '2025-11-12 01:17:50', 0, NULL, '2025-11-12 01:14:01', '2025-11-12 01:17:50'),
  (10, 'PSR_1763185517794_s7uwqadwg', 'iotlab03@gmail.com', '$2b$12$2.Rg.N7on9te9bf0nKlScupCDS.wuVb7HGzvyfW.wxbN8OS4j95pO', 'laddu', 'admin', 'active', 'LAD6879', 'psr', '625521', 'Kamayakoundanpatti', 'Tamil Nadu', NULL, 1, '896642', '2025-11-15 00:25:17', NULL, NULL, '896642', '2025-11-15 00:25:17', '2025-11-15 00:27:13', 0, NULL, '2025-11-15 00:15:17', '2025-11-15 00:27:13'),
  (11, 'PSR_1763983216559_rxmo9di7e', 'bugstester404@gmail.com', '$2b$12$YHLPjofSmcBRhZKHMdSOS.ova07Wcx1wwFDLRHTmRmR6XoVsYjcs6', 'tester', 'admin', 'active', 'TES6572', 'abcd company', '625521', 'Kamayakoundanpatti', 'Tamil Nadu', NULL, 1, '125750', '2025-11-24 06:00:16', NULL, NULL, '125750', '2025-11-24 06:00:16', '2025-12-27 08:48:48', 0, NULL, '2025-11-24 05:50:16', '2025-12-27 08:48:48'),
  (12, 'PSR_1765609566786_7wydygevt', 'bugstester1@gmail.com', '$2b$12$YU63Y26UXKX0iV31IiVB5.7Fl8LjNgMWBOsYldu6LPgUwXEl4/RPa', 'Tester1', 'admin', 'active', 'TES9537', 'Psr Equipments', '625521', 'Kamayakoundanpatti', 'Tamil Nadu', NULL, 1, '464452', '2025-12-13 07:16:06', NULL, NULL, '464452', '2025-12-13 07:16:06', '2025-12-16 10:11:23', 0, NULL, '2025-12-13 07:06:06', '2025-12-16 10:11:23'),
  (14, 'PSR_1766743369908_72fsoil8c', 'solutions.pydart@gmail.com', '$2b$12$VdydqScVfPkzDv.5MvPV..4wyTburYW032Tkx9mTT2zSJAkXwozse', 'qw', 'admin', 'active', 'QWX7741', 'das', '682021', 'Thrikkakara', 'Kerala', NULL, 1, '153954', '2025-12-26 10:12:49', NULL, NULL, '153954', '2025-12-26 10:12:49', NULL, 0, NULL, '2025-12-26 10:02:49', '2025-12-26 10:03:47'),
  (15, 'PSR_1766743978972_n3791x0je', 'desha271904@gmail.com', '$2b$12$cYsciFrS7VaHEW9y9XBxPeTO1FhVBczx561x.GHM8VNiJ2WOrbl96', 'Desha', 'admin', 'active', 'DES8974', 'Threepoints', '625521', 'Kamayakoundanpatti', 'Tamil Nadu', NULL, 1, '712169', '2025-12-27 09:32:32', NULL, NULL, '712169', '2025-12-27 09:32:32', '2025-12-27 09:24:26', 0, NULL, '2025-12-26 10:12:58', '2025-12-27 09:24:26');

SET FOREIGN_KEY_CHECKS=1;
-- End of backup