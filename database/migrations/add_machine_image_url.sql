-- Add image_url column to machinetype table
-- Run this SQL in your MySQL database

ALTER TABLE `machinetype` 
ADD COLUMN `image_url` VARCHAR(500) NULL 
COMMENT 'URL path to machine image' 
AFTER `is_active`;

-- Verify the column was added
DESCRIBE `machinetype`;
