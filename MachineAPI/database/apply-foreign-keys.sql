-- Safe conversion: Truncate and alter machine_corrections table
TRUNCATE TABLE machine_corrections;
ALTER TABLE machine_corrections MODIFY COLUMN machine_id INT NOT NULL;
ALTER TABLE machine_corrections MODIFY COLUMN society_id INT NOT NULL;
ALTER TABLE machine_corrections DROP INDEX IF EXISTS idx_machine_status;
CREATE INDEX idx_machine_status ON machine_corrections(machine_id, status);
