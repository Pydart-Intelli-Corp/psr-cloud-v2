-- PSR Machine API Test Database Setup
-- Date: 2026-01-28
-- Society: S2 (dpst-w model with machines M1, M2)

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS psr_machine_api;
USE psr_machine_api;

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS Dispatches;
DROP TABLE IF EXISTS Sales;
DROP TABLE IF EXISTS Corrections;
DROP TABLE IF EXISTS RateCharts;
DROP TABLE IF EXISTS Passwords;
DROP TABLE IF EXISTS Collections;
DROP TABLE IF EXISTS Machines;
DROP TABLE IF EXISTS Societies;

-- Create Societies table
CREATE TABLE IF NOT EXISTS Societies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) UNIQUE NOT NULL,
    society_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    psr_code VARCHAR(500),
    machine_model VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_society_id (society_id),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Machines table
CREATE TABLE IF NOT EXISTS Machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    machine_model VARCHAR(100),
    machine_type VARCHAR(50),
    psr_code VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_society_machine (society_id, machine_id),
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_machine_id (machine_id),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Collections table
CREATE TABLE IF NOT EXISTS Collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    farmer_id VARCHAR(50),
    farmer_name VARCHAR(255),
    collection_date DATE NOT NULL,
    collection_time TIME NOT NULL,
    shift VARCHAR(10),
    quantity DECIMAL(10,2) DEFAULT 0.00,
    fat DECIMAL(5,2) DEFAULT 0.00,
    snf DECIMAL(5,2) DEFAULT 0.00,
    clr DECIMAL(5,2) DEFAULT 0.00,
    protein DECIMAL(5,2) DEFAULT 0.00,
    lactose DECIMAL(5,2) DEFAULT 0.00,
    salt DECIMAL(5,2) DEFAULT 0.00,
    water DECIMAL(5,2) DEFAULT 0.00,
    temperature DECIMAL(5,2) DEFAULT 0.00,
    rate DECIMAL(10,2) DEFAULT 0.00,
    amount DECIMAL(10,2) DEFAULT 0.00,
    psr_code VARCHAR(500),
    synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_collection_date (collection_date),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_machine_id (machine_id),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Dispatches table
CREATE TABLE IF NOT EXISTS Dispatches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    dispatch_date DATE NOT NULL,
    shift VARCHAR(10),
    total_quantity DECIMAL(10,2) DEFAULT 0.00,
    avg_fat DECIMAL(5,2) DEFAULT 0.00,
    avg_snf DECIMAL(5,2) DEFAULT 0.00,
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(255),
    notes TEXT,
    psr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_dispatch_date (dispatch_date),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Sales table
CREATE TABLE IF NOT EXISTS Sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    sale_date DATE NOT NULL,
    customer_name VARCHAR(255),
    product_type VARCHAR(100),
    quantity DECIMAL(10,2) DEFAULT 0.00,
    rate DECIMAL(10,2) DEFAULT 0.00,
    amount DECIMAL(10,2) DEFAULT 0.00,
    payment_mode VARCHAR(50),
    notes TEXT,
    psr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_sale_date (sale_date),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Corrections table
CREATE TABLE IF NOT EXISTS Corrections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    collection_id INT,
    correction_type VARCHAR(50),
    original_value DECIMAL(10,2),
    corrected_value DECIMAL(10,2),
    reason TEXT,
    corrected_by VARCHAR(255),
    correction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    psr_code VARCHAR(500),
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES Collections(id) ON DELETE SET NULL,
    INDEX idx_correction_date (correction_date),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create RateCharts table
CREATE TABLE IF NOT EXISTS RateCharts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    effective_date DATE NOT NULL,
    fat_min DECIMAL(5,2),
    fat_max DECIMAL(5,2),
    snf_min DECIMAL(5,2),
    snf_max DECIMAL(5,2),
    rate DECIMAL(10,2) NOT NULL,
    milk_type VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    psr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_effective_date (effective_date),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Passwords table (for machine authentication)
CREATE TABLE IF NOT EXISTS Passwords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_type VARCHAR(50) DEFAULT 'machine',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    psr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES Societies(society_id) ON DELETE CASCADE,
    INDEX idx_machine_id (machine_id),
    INDEX idx_psr_code (psr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert test data for Society S2
INSERT INTO Societies (society_id, society_name, contact_person, phone, email, address, psr_code, machine_model, is_active)
VALUES (
    'S2',
    'Test Dairy Society',
    'Admin User',
    '9876543210',
    'admin@testdairy.com',
    'Test Address, City, State',
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ==',
    'dpst-w',
    TRUE
);

-- Insert test machines M1 and M2
INSERT INTO Machines (society_id, machine_id, machine_model, machine_type, psr_code, status)
VALUES 
(
    'S2',
    'M1',
    'dpst-w',
    'DPST-W',
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ==',
    'active'
),
(
    'S2',
    'M2',
    'dpst-w',
    'DPST-W',
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ==',
    'active'
);

-- Insert sample collections for testing
INSERT INTO Collections (
    society_id, machine_id, farmer_id, farmer_name, 
    collection_date, collection_time, shift,
    quantity, fat, snf, clr, protein, lactose, 
    rate, amount, psr_code
)
VALUES 
(
    'S2', 'M1', 'F001', 'Test Farmer 1',
    CURDATE(), '06:30:00', 'Morning',
    10.50, 4.5, 8.5, 26.5, 3.2, 4.8,
    35.00, 367.50,
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ=='
),
(
    'S2', 'M2', 'F002', 'Test Farmer 2',
    CURDATE(), '06:45:00', 'Morning',
    8.75, 4.2, 8.7, 27.0, 3.3, 4.9,
    34.00, 297.50,
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ=='
),
(
    'S2', 'M1', 'F003', 'Test Farmer 3',
    CURDATE(), '18:30:00', 'Evening',
    12.00, 4.8, 8.8, 27.5, 3.4, 5.0,
    38.00, 456.00,
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ=='
);

-- Insert sample rate chart
INSERT INTO RateCharts (
    society_id, machine_id, effective_date,
    fat_min, fat_max, snf_min, snf_max,
    rate, milk_type, is_active, psr_code
)
VALUES 
(
    'S2', 'M1', CURDATE(),
    3.0, 5.0, 8.0, 9.0,
    35.00, 'Cow', TRUE,
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ=='
),
(
    'S2', 'M2', CURDATE(),
    3.0, 5.0, 8.0, 9.0,
    35.00, 'Cow', TRUE,
    'PSR-8194-eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ=='
);

-- Display summary
SELECT '✅ Database setup complete!' AS Status;
SELECT COUNT(*) AS Societies FROM Societies;
SELECT COUNT(*) AS Machines FROM Machines;
SELECT COUNT(*) AS Collections FROM Collections;
SELECT COUNT(*) AS RateCharts FROM RateCharts;

-- Display PSR Code info
SELECT 
    society_id,
    society_name,
    machine_model,
    LEFT(psr_code, 50) AS psr_code_preview,
    is_active
FROM Societies;

SELECT 
    machine_id,
    machine_model,
    machine_type,
    status,
    LEFT(psr_code, 50) AS psr_code_preview
FROM Machines;
