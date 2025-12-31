-- Machine Access Requests Table
-- This table stores temporary access requests for master machine changes
-- Each request is valid for 15 minutes

CREATE TABLE IF NOT EXISTS machine_access_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  user_id INT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_machine_user (machine_id, user_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at),
  
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE machine_access_requests 
  COMMENT = 'Stores temporary access requests for master machine changes with 15-minute validity';
