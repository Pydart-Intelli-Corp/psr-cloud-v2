-- ============================================================================
-- PSR Machine API - Complete Database Schema
-- Date: 2026-01-29
-- Description: Full database schema with all tables for MachineAPI
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS psr_machine_api;
USE psr_machine_api;

-- ============================================================================
-- Drop existing tables (in reverse dependency order)
-- ============================================================================
DROP TABLE IF EXISTS machine_password_logs;
DROP TABLE IF EXISTS machine_statistics;
DROP TABLE IF EXISTS machine_updates;
DROP TABLE IF EXISTS rate_charts;
DROP TABLE IF EXISTS machine_corrections;
DROP TABLE IF EXISTS milk_sales;
DROP TABLE IF EXISTS milk_dispatches;
DROP TABLE IF EXISTS milk_collections;
DROP TABLE IF EXISTS farmers;
DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS societies;

-- ============================================================================
-- 1. Societies Table
-- ============================================================================
CREATE TABLE societies (
    Id INT NOT NULL AUTO_INCREMENT,
    SocietyId VARCHAR(50) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Address TEXT NULL,
    Phone VARCHAR(20) NULL,
    Email VARCHAR(100) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    BmcId INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    UNIQUE INDEX idx_society_id (SocietyId),
    INDEX idx_name (Name),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Machines Table
-- ============================================================================
CREATE TABLE machines (
    Id INT NOT NULL AUTO_INCREMENT,
    MachineId VARCHAR(50) NOT NULL,
    MachineName VARCHAR(255) NULL,
    MachineType VARCHAR(100) NULL,
    MachineModel VARCHAR(100) NULL,
    SocietyId INT NOT NULL,
    BmcId INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    IsMasterMachine BOOLEAN NOT NULL DEFAULT FALSE,
    LastSyncDate DATETIME NULL,
    InstallationDate DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_machine_id (MachineId),
    INDEX idx_machine_type (MachineType),
    INDEX idx_society_id (SocietyId),
    INDEX idx_status (Status),
    INDEX idx_is_master (IsMasterMachine),
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. Farmers Table
-- ============================================================================
CREATE TABLE farmers (
    Id INT NOT NULL AUTO_INCREMENT,
    FarmerId VARCHAR(50) NOT NULL,
    RfId VARCHAR(50) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NULL,
    SmsEnabled VARCHAR(10) NOT NULL DEFAULT 'OFF',
    Bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    SocietyId INT NOT NULL,
    MachineId INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_farmer_id (FarmerId),
    INDEX idx_rf_id (RfId),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_status (Status),
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. Milk Collections Table
-- ============================================================================
CREATE TABLE milk_collections (
    Id INT NOT NULL AUTO_INCREMENT,
    CollectionId VARCHAR(50) NULL,
    FarmerId VARCHAR(50) NOT NULL,
    SocietyId INT NOT NULL,
    MachineId INT NOT NULL,
    BmcId INT NULL,
    CollectionDate DATE NOT NULL,
    CollectionTime TIME NULL,
    ShiftType VARCHAR(20) NOT NULL,
    Quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    Fat DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Snf DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Clr DECIMAL(5,2) NULL,
    Temperature DECIMAL(5,2) NULL,
    Amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_farmer_id (FarmerId),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_collection_date (CollectionDate),
    INDEX idx_shift_type (ShiftType),
    INDEX idx_society_date (SocietyId, CollectionDate),
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT,
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. Milk Dispatches Table
-- ============================================================================
CREATE TABLE milk_dispatches (
    Id INT NOT NULL AUTO_INCREMENT,
    DispatchId VARCHAR(50) NOT NULL,
    SocietyId INT NOT NULL,
    MachineId INT NOT NULL,
    BmcId INT NULL,
    DispatchDate DATE NOT NULL,
    DispatchTime TIME NULL,
    ShiftType VARCHAR(20) NOT NULL,
    Quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    Fat DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Snf DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Clr DECIMAL(5,2) NULL,
    Temperature DECIMAL(5,2) NULL,
    VehicleNumber VARCHAR(50) NULL,
    DriverName VARCHAR(255) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_dispatch_id (DispatchId),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_dispatch_date (DispatchDate),
    INDEX idx_shift_type (ShiftType),
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT,
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. Milk Sales Table
-- ============================================================================
CREATE TABLE milk_sales (
    Id INT NOT NULL AUTO_INCREMENT,
    Count INT NOT NULL,
    SocietyId INT NOT NULL,
    MachineId INT NOT NULL,
    BmcId INT NULL,
    SalesDate DATE NOT NULL,
    SalesTime TIME NULL,
    Quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    Fat DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Snf DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CustomerName VARCHAR(255) NULL,
    CustomerPhone VARCHAR(20) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_count (Count),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_sales_date (SalesDate),
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT,
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. Machine Corrections Table
-- ============================================================================
CREATE TABLE machine_corrections (
    Id INT NOT NULL AUTO_INCREMENT,
    CollectionId INT NOT NULL,
    MachineId INT NOT NULL,
    SocietyId INT NOT NULL,
    BmcId INT NULL,
    CorrectionType VARCHAR(50) NOT NULL,
    CorrectionDate DATE NOT NULL,
    CorrectionTime TIME NULL,
    OriginalQuantity DECIMAL(10,3) NULL,
    CorrectedQuantity DECIMAL(10,3) NULL,
    OriginalFat DECIMAL(5,2) NULL,
    CorrectedFat DECIMAL(5,2) NULL,
    OriginalSnf DECIMAL(5,2) NULL,
    CorrectedSnf DECIMAL(5,2) NULL,
    OriginalAmount DECIMAL(10,2) NULL,
    CorrectedAmount DECIMAL(10,2) NULL,
    Reason TEXT NULL,
    CorrectedBy VARCHAR(255) NULL,
    IsApproved BOOLEAN NOT NULL DEFAULT FALSE,
    ApprovedBy VARCHAR(255) NULL,
    ApprovedAt DATETIME NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_collection_id (CollectionId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_society_id (SocietyId),
    INDEX idx_correction_date (CorrectionDate),
    INDEX idx_is_approved (IsApproved),
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT,
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT,
    FOREIGN KEY (CollectionId) REFERENCES milk_collections(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. Rate Charts Table
-- ============================================================================
CREATE TABLE rate_charts (
    Id INT NOT NULL AUTO_INCREMENT,
    SocietyId INT NULL,
    BmcId INT NULL,
    Channel VARCHAR(50) NOT NULL,
    FatMin DECIMAL(5,2) NOT NULL,
    FatMax DECIMAL(5,2) NOT NULL,
    SnfMin DECIMAL(5,2) NOT NULL,
    SnfMax DECIMAL(5,2) NOT NULL,
    Rate DECIMAL(10,2) NOT NULL,
    ValidFrom DATE NOT NULL,
    ValidTo DATE NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_society_id (SocietyId),
    INDEX idx_bmc_id (BmcId),
    INDEX idx_channel (Channel),
    INDEX idx_valid_from (ValidFrom),
    INDEX idx_valid_to (ValidTo),
    INDEX idx_is_active (IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. Machine Password Logs Table
-- ============================================================================
CREATE TABLE machine_password_logs (
    Id INT NOT NULL AUTO_INCREMENT,
    MachineId INT NOT NULL,
    PasswordType VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(500) NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    ExpiresAt DATETIME NULL,
    CreatedBy VARCHAR(255) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_machine_id (MachineId),
    INDEX idx_password_type (PasswordType),
    INDEX idx_created_at (CreatedAt),
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. Machine Statistics Table
-- ============================================================================
CREATE TABLE machine_statistics (
    Id INT NOT NULL AUTO_INCREMENT,
    SocietyId INT NOT NULL,
    MachineId INT NOT NULL,
    TotalTest INT NOT NULL DEFAULT 0,
    DailyCleaning INT NOT NULL DEFAULT 0,
    WeeklyCleaning INT NOT NULL DEFAULT 0,
    CleaningSkip INT NOT NULL DEFAULT 0,
    Gain INT NOT NULL DEFAULT 0,
    AutoChannel VARCHAR(20) NOT NULL DEFAULT 'DISABLE',
    StatisticsDate VARCHAR(20) NOT NULL,
    StatisticsTime VARCHAR(20) NOT NULL,
    RecordedAt DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_recorded_at (RecordedAt),
    INDEX idx_statistics_date (StatisticsDate),
    INDEX idx_machine_recorded (MachineId, RecordedAt),
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT,
    FOREIGN KEY (MachineId) REFERENCES machines(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. Machine Updates Table
-- ============================================================================
CREATE TABLE machine_updates (
    Id INT NOT NULL AUTO_INCREMENT,
    SocietyId INT NOT NULL,
    MachineId INT NULL,
    MachineType VARCHAR(100) NOT NULL,
    CurrentVersion VARCHAR(50) NOT NULL,
    AvailableVersion VARCHAR(50) NULL,
    UpdateStatus VARCHAR(50) NOT NULL DEFAULT 'No update',
    LastChecked DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Id),
    INDEX idx_society_id (SocietyId),
    INDEX idx_machine_id (MachineId),
    INDEX idx_machine_type (MachineType),
    INDEX idx_update_status (UpdateStatus),
    INDEX idx_last_checked (LastChecked),
    FOREIGN KEY (SocietyId) REFERENCES societies(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Insert Sample Data
-- ============================================================================

-- Sample Societies
INSERT INTO societies (SocietyId, Name, Address, Phone, Email, Status) VALUES
('S-1', 'Primary Dairy Cooperative', '123 Main Street', '1234567890', 'primary@dairy.com', 'active'),
('S-2', 'Central Milk Society', '456 Oak Avenue', '0987654321', 'central@milk.com', 'active');

-- Sample Machines
INSERT INTO machines (MachineId, MachineName, MachineType, MachineModel, SocietyId, Status, IsMasterMachine) VALUES
('M1', 'Machine One', 'ECOD', 'LE2.00', 1, 'active', TRUE),
('M2', 'Machine Two', 'ECOD', 'LE2.00', 1, 'active', FALSE),
('W', 'West Wing Machine', 'dpst-w', 'LE3.36', 2, 'active', TRUE);

-- Sample Farmers
INSERT INTO farmers (FarmerId, RfId, Name, Phone, SmsEnabled, Bonus, SocietyId, MachineId, Status) VALUES
('F001', 'RF001', 'Rajesh Kumar', '9876543210', 'ON', 50.00, 1, 1, 'active'),
('F002', 'RF002', 'Priya Sharma', '9876543211', 'ON', 75.00, 1, 1, 'active'),
('F003', 'RF003', 'Amit Patel', '9876543212', 'OFF', 25.00, 1, 2, 'active'),
('F004', 'RF004', 'Sunita Devi', '9876543213', 'ON', 100.00, 2, 3, 'active');

-- Sample Rate Charts
INSERT INTO rate_charts (SocietyId, Channel, FatMin, FatMax, SnfMin, SnfMax, Rate, ValidFrom, IsActive) VALUES
(1, 'COW', 3.0, 4.0, 8.0, 9.0, 35.00, '2026-01-01', TRUE),
(1, 'COW', 4.0, 5.0, 8.0, 9.0, 40.00, '2026-01-01', TRUE),
(1, 'BUFFALO', 6.0, 7.0, 9.0, 10.0, 50.00, '2026-01-01', TRUE),
(2, 'COW', 3.0, 4.0, 8.0, 9.0, 36.00, '2026-01-01', TRUE);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Database: psr_machine_api
-- Tables Created: 11
-- - societies, machines, farmers
-- - milk_collections, milk_dispatches, milk_sales
-- - machine_corrections, rate_charts, machine_password_logs
-- - machine_statistics, machine_updates
-- Sample Data: Inserted for testing
-- ============================================================================
