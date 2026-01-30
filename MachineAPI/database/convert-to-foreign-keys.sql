-- Convert machine_corrections to use foreign keys
-- Step 1: Delete existing data (has string values)
TRUNCATE TABLE machine_corrections;

-- Step 2: Alter columns to int
ALTER TABLE machine_corrections MODIFY COLUMN machine_id INT NOT NULL;
ALTER TABLE machine_corrections MODIFY COLUMN society_id INT NOT NULL;

-- Step 3: Add foreign key constraints (optional)
-- ALTER TABLE machine_corrections ADD CONSTRAINT fk_machine FOREIGN KEY (machine_id) REFERENCES machines(Id);
-- ALTER TABLE machine_corrections ADD CONSTRAINT fk_society FOREIGN KEY (society_id) REFERENCES societies(Id);
