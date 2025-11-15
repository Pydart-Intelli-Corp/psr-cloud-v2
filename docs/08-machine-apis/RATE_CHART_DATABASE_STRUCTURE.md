# Rate Chart Database Structure

## Overview
Complete database schema documentation for the rate chart management system, including machine synchronization support with status tracking and shared data functionality.

---

## Table: `rate_charts`

### Purpose
Master table storing rate chart metadata for each society and milk channel combination. Supports shared data across multiple societies and download status tracking for machine synchronization.

### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS `{schemaName}`.`rate_charts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `shared_chart_id` INT NULL COMMENT 'Reference to master rate chart for shared data',
  `society_id` INT NOT NULL COMMENT 'Reference to societies table',
  `channel` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` VARCHAR(255) NOT NULL COMMENT 'Admin user who uploaded',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'Original CSV file name',
  `record_count` INT NOT NULL DEFAULT 0 COMMENT 'Number of rate records',
  `status` TINYINT(1) DEFAULT 1 COMMENT '1=Active/Ready to download, 0=Downloaded by machine',
  FOREIGN KEY (`society_id`) REFERENCES `{schemaName}`.`societies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_society_channel` (`society_id`, `channel`),
  INDEX `idx_shared_chart_id` (`shared_chart_id`),
  INDEX `idx_society_id` (`society_id`),
  INDEX `idx_channel` (`channel`),
  INDEX `idx_uploaded_at` (`uploaded_at`),
  INDEX `idx_status` (`status`)
);
```

### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key, unique identifier |
| `shared_chart_id` | INT | YES | NULL | Points to master chart ID when data is shared |
| `society_id` | INT | NO | - | Foreign key to societies table |
| `channel` | ENUM | NO | - | Milk type: 'COW', 'BUF', or 'MIX' |
| `uploaded_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | When chart was uploaded |
| `uploaded_by` | VARCHAR(255) | NO | - | Admin user's full name who uploaded |
| `file_name` | VARCHAR(255) | NO | - | Original CSV filename |
| `record_count` | INT | NO | 0 | Number of rate records in chart |
| `status` | TINYINT(1) | YES | 1 | Download status (1=Active, 0=Downloaded) |

### Shared Data Pattern

**Scenario**: Admin uploads one CSV for multiple societies

1. **Master Chart** (First society in selection):
   - `shared_chart_id` = NULL
   - Contains all `rate_chart_data` records
   - Acts as the source of truth

2. **Shared Charts** (Remaining societies):
   - `shared_chart_id` = Master chart's ID
   - No duplicate `rate_chart_data` records
   - Queries join to master's data

**Example**:
```sql
-- Master chart for Society A (society_id=1)
INSERT INTO rate_charts (id, shared_chart_id, society_id, channel, uploaded_by, file_name, record_count, status)
VALUES (101, NULL, 1, 'COW', 'Admin User', 'cow_rates_2025.csv', 450, 1);

-- Shared charts for Society B and C
INSERT INTO rate_charts (id, shared_chart_id, society_id, channel, uploaded_by, file_name, record_count, status)
VALUES 
  (102, 101, 2, 'COW', 'Admin User', 'cow_rates_2025.csv', 450, 1),
  (103, 101, 3, 'COW', 'Admin User', 'cow_rates_2025.csv', 450, 1);
```

### Status Column Behavior

**Purpose**: Track whether rate chart is active/available for machine downloads

| Status | Meaning | Admin Control | Machine Behavior |
|--------|---------|--------------|------------------|
| `1` | Active/Available | Chart is live and available | Machines can download (if not already downloaded) |
| `0` | Inactive/Disabled | Chart is disabled by admin | No machines can download |

**Important**: The status column is controlled by admins only. Machine downloads are tracked per-machine in the `rate_chart_download_history` table.

**State Transitions**:
```
[Upload] → status=1 (Active/Available)
    ↓
[Admin Toggles] → status=0 (Inactive) or status=1 (Active)
    ↓
[Machine Downloads] → Record inserted in rate_chart_download_history
    ↓
[Same machine requests again] → "Price chart not found." (already downloaded)
    ↓
[Different machine requests] → Returns data (not yet downloaded by this machine)
```

### Indexes and Performance

1. **`idx_shared_chart_id`**: Fast lookup of shared charts
2. **`idx_society_id`**: Quick filtering by society
3. **`idx_channel`**: Channel-based queries (COW/BUF/MIX)
4. **`idx_uploaded_at`**: Chronological sorting
5. **`idx_status`**: Machine API filtering (status=1)
6. **`unique_society_channel`**: Ensures one active chart per society-channel combination

---

## Table: `rate_chart_download_history`

### Purpose
Tracks which machines have downloaded which rate charts. Enables per-machine download tracking so multiple machines under the same society can independently download charts.

### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS `{schemaName}`.`rate_chart_download_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rate_chart_id` INT NOT NULL COMMENT 'Reference to rate_charts table',
  `machine_id` INT NOT NULL COMMENT 'Reference to machines table',
  `society_id` INT NOT NULL COMMENT 'Reference to societies table',
  `channel` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
  `downloaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rate_chart_id`) REFERENCES `{schemaName}`.`rate_charts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`machine_id`) REFERENCES `{schemaName}`.`machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`society_id`) REFERENCES `{schemaName}`.`societies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_machine_chart` (`machine_id`, `rate_chart_id`),
  INDEX `idx_machine_society_channel` (`machine_id`, `society_id`, `channel`),
  INDEX `idx_rate_chart_id` (`rate_chart_id`),
  INDEX `idx_downloaded_at` (`downloaded_at`)
) COMMENT='Tracks which machines have downloaded which rate charts';
```

### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `rate_chart_id` | INT | NO | - | Foreign key to rate_charts table |
| `machine_id` | INT | NO | - | Foreign key to machines table |
| `society_id` | INT | NO | - | Foreign key to societies table |
| `channel` | ENUM | NO | - | Milk type: 'COW', 'BUF', or 'MIX' |
| `downloaded_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | When machine downloaded the chart |

### Key Features

**Per-Machine Tracking**:
- Each machine independently tracks its downloads
- Machine A downloading doesn't affect Machine B's ability to download
- Prevents duplicate downloads by the same machine

**Unique Constraint**:
- `unique_machine_chart` ensures one record per machine-chart combination
- Prevents duplicate entries if machine calls SavePriceChartUpdationHistory multiple times

**Example Scenario**:
```
Society has 3 machines: M1, M2, M3
Admin uploads rate chart (ID: 101)

Day 1:
- M1 downloads → Record: (chart=101, machine=M1)
- M1 requests again → "Price chart not found." (already downloaded)
- M2 requests → Returns data (not yet downloaded by M2)

Day 2:
- M2 downloads → Record: (chart=101, machine=M2)
- M3 requests → Returns data (not yet downloaded by M3)

Result: All 3 machines can independently download the same chart
```

### Indexes and Performance

1. **`unique_machine_chart`**: Prevents duplicate downloads by same machine
2. **`idx_machine_society_channel`**: Fast lookup for machine's download status
3. **`idx_rate_chart_id`**: Quick queries for chart download statistics
4. **`idx_downloaded_at`**: Chronological analysis and reporting

---

## Table: `rate_chart_data`

### Purpose
Stores the actual rate calculation data (FAT, SNF, CLR → Rate). Linked to `rate_charts` via foreign key. For shared charts, only the master chart has data records.

### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS `{schemaName}`.`rate_chart_data` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rate_chart_id` INT NOT NULL COMMENT 'Reference to rate_charts table',
  `clr` DECIMAL(5,2) NOT NULL COMMENT 'Color/Degree value',
  `fat` DECIMAL(5,2) NOT NULL COMMENT 'Fat percentage',
  `snf` DECIMAL(5,2) NOT NULL COMMENT 'Solids-Not-Fat percentage',
  `rate` DECIMAL(10,2) NOT NULL COMMENT 'Rate per liter',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rate_chart_id`) REFERENCES `{schemaName}`.`rate_charts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_rate_chart_id` (`rate_chart_id`),
  INDEX `idx_clr_fat_snf` (`clr`, `fat`, `snf`)
);
```

### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `rate_chart_id` | INT | NO | - | Foreign key to rate_charts table |
| `clr` | DECIMAL(5,2) | NO | - | Color/Degree reading (e.g., 28.50) |
| `fat` | DECIMAL(5,2) | NO | - | Fat percentage (e.g., 4.50) |
| `snf` | DECIMAL(5,2) | NO | - | Solids-Not-Fat percentage (e.g., 8.75) |
| `rate` | DECIMAL(10,2) | NO | - | Rate per liter in currency (e.g., 45.00) |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | When record was created |

### Data Relationships

**Master Chart Data (shared_chart_id = NULL)**:
```sql
-- Master chart (ID: 101)
SELECT * FROM rate_chart_data WHERE rate_chart_id = 101;
-- Returns 450 records with FAT/SNF/CLR/Rate combinations
```

**Shared Chart Query**:
```sql
-- Shared chart (ID: 102, shared_chart_id = 101)
-- Machine API automatically resolves to master data:
SELECT rcd.* 
FROM rate_chart_data rcd
INNER JOIN rate_charts rc ON rc.id = 102
WHERE rcd.rate_chart_id = COALESCE(rc.shared_chart_id, rc.id);
-- Returns same 450 records as master chart
```

### Indexes and Performance

1. **`idx_rate_chart_id`**: Fast JOIN operations with rate_charts
2. **`idx_clr_fat_snf`**: Composite index for rate lookup queries
   - Optimizes queries like: "Find rate for CLR=28, FAT=4.5, SNF=8.75"

### Cascade Behavior

**When rate_charts record is deleted**:
- All associated `rate_chart_data` records are automatically deleted (`ON DELETE CASCADE`)
- Prevents orphaned data records
- For shared charts, only master deletion triggers data cleanup

---

## Multi-Tenant Architecture

### Schema Naming Convention
```
{cleanAdminName}_{dbKey}
```

**Examples**:
- Admin: "Poornasree Equipments", dbKey: "POO5382"
  - Schema: `poornasreeequipments_poo5382`
  - Tables: `poornasreeequipments_poo5382.rate_charts`, `poornasreeequipments_poo5382.rate_chart_data`

### Auto-Generation on Admin Registration

**File**: `src/lib/adminSchema.ts`

**Function**: `createAdminTables(schemaName)`

When a new admin is approved:
1. Generate unique dbKey (e.g., POO5382)
2. Create schema: `{cleanAdminName}_{dbKey}`
3. Create all tables including `rate_charts` and `rate_chart_data`
4. Add indexes automatically

**Tables Created** (10 total):
1. `dairy_farms` - Dairy storage facilities
2. `bmcs` - Bulk Milk Cooling Centers
3. `societies` - Milk collection societies
4. `farmers` - Individual farmers
5. `machines` - Milk testing machines
6. `milk_collections` - Daily collection records
7. `machine_corrections` - Machine calibration data
8. **`rate_charts`** - Rate chart metadata
9. **`rate_chart_data`** - Rate calculation data
10. `machine_passwords` - Machine authentication

---

## Migration History

### Initial Creation
**Migration**: `20251107073654-create-all-tables.js`
- Created main tables (users, audit_logs, etc.)
- Did NOT include rate_charts initially

### Rate Chart Tables Addition
**Script**: `scripts/add-ratechart-tables.mjs`
- Added `rate_charts` and `rate_chart_data` to existing schemas
- Initial structure without `shared_chart_id` or `status`

### Shared Data Support
**Migration**: `scripts/add-shared-chart-id-column-fixed.mjs`
- Added `shared_chart_id` column to `rate_charts`
- Added index: `idx_shared_chart_id`
- Enabled single-source-of-truth data sharing

### Status Column Addition
**Migration**: `20251115000001-add-status-to-rate-charts.js`
- Added `status` TINYINT(1) DEFAULT 1 to `rate_charts`
- Updated all existing records to `status = 1`
- Added index: `idx_status`
- Enabled machine download tracking

### Admin Schema Auto-Generation Update
**File**: `src/lib/adminSchema.ts` (Current)
- Updated `rate_charts` table definition to include:
  - `shared_chart_id` INT NULL (after id)
  - `status` TINYINT(1) DEFAULT 1 (after record_count)
  - Indexes: `idx_shared_chart_id`, `idx_status`

**Result**: New admin registrations automatically get complete rate_charts structure

---

## API Integration

### Web APIs (Admin Portal)

**Base Path**: `/api/user/ratechart`

| Endpoint | Method | Purpose | Status Update |
|----------|--------|---------|---------------|
| `/upload` | POST | Upload CSV rate chart | Sets `status=1` on new charts |
| `/assign` | POST | Assign chart to societies | Sets `status=1` on shared charts |
| `/` | GET | List all rate charts | Filters by admin's schema |
| `/[id]` | DELETE | Delete rate chart | Cascades to rate_chart_data |

### Machine APIs (ESP32/External)

**Base Path**: `/api/[db-key]/PriceChartUpdation`

| Endpoint | Method | Purpose | Status Behavior |
|----------|--------|---------|-----------------|
| `GetLatestPriceChart` | GET/POST | Download rate data with pagination | Only returns charts with `status=1` |
| `SavePriceChartUpdationHistory` | GET/POST | Confirm download | Sets `status=0` for society+channel |

**InputString Formats**:
- **GetLatestPriceChart**: `societyId\|machineType\|version\|machineId\|channel\|pageNumber`
  - Example: `bmc_301\|DPST-W\|LE2.00\|Mm401\|COW\|C00001`
- **SavePriceChartUpdationHistory**: `societyId\|machineType\|version\|machineId\|channel`
  - Example: `bmc_301\|DPST-W\|LE2.00\|Mm401\|COW`

---

## Data Flow Examples

### Upload for Multiple Societies

**Admin Action**: Upload `cow_rates.csv` for Societies A, B, C

```sql
-- Step 1: Create master chart (Society A)
INSERT INTO rate_charts (id, shared_chart_id, society_id, channel, uploaded_by, file_name, record_count, status)
VALUES (101, NULL, 1, 'COW', 'Admin', 'cow_rates.csv', 450, 1);

-- Step 2: Insert 450 rate_chart_data records (master only)
INSERT INTO rate_chart_data (rate_chart_id, clr, fat, snf, rate)
VALUES 
  (101, 28.00, 3.50, 8.00, 42.50),
  (101, 28.00, 3.50, 8.25, 43.00),
  -- ... 448 more records
  (101, 32.00, 6.00, 9.50, 68.00);

-- Step 3: Create shared charts (Societies B, C)
INSERT INTO rate_charts (id, shared_chart_id, society_id, channel, uploaded_by, file_name, record_count, status)
VALUES 
  (102, 101, 2, 'COW', 'Admin', 'cow_rates.csv', 450, 1),
  (103, 101, 3, 'COW', 'Admin', 'cow_rates.csv', 450, 1);
```

**Data Savings**:
- Without sharing: 450 × 3 = 1,350 records in `rate_chart_data`
- With sharing: 450 records (67% reduction)

### Machine Download Lifecycle

**Society A has 3 machines downloading Rate Chart**:

```sql
-- Admin uploads chart for Society A (society_id=1)
INSERT INTO rate_charts (id, shared_chart_id, society_id, channel, uploaded_by, file_name, record_count, status)
VALUES (101, NULL, 1, 'COW', 'Admin', 'cow_rates.csv', 450, 1);

-- Machine M1 (machine_id=5) calls GetLatestPriceChart
SELECT rc.* 
FROM rate_charts rc
LEFT JOIN rate_chart_download_history dh 
  ON dh.rate_chart_id = rc.id AND dh.machine_id = 5
WHERE rc.society_id = 1 AND rc.channel = 'COW' AND rc.status = 1 AND dh.id IS NULL;
-- Returns: Chart 101 (M1 hasn't downloaded yet)

-- Machine M1 downloads all pages and calls SavePriceChartUpdationHistory
INSERT INTO rate_chart_download_history (rate_chart_id, machine_id, society_id, channel)
VALUES (101, 5, 1, 'COW');

-- Machine M1 requests again
SELECT rc.* 
FROM rate_charts rc
LEFT JOIN rate_chart_download_history dh 
  ON dh.rate_chart_id = rc.id AND dh.machine_id = 5
WHERE rc.society_id = 1 AND rc.channel = 'COW' AND rc.status = 1 AND dh.id IS NULL;
-- Returns: 0 records → "Price chart not found." (M1 already downloaded)

-- Machine M2 (machine_id=6) requests
SELECT rc.* 
FROM rate_charts rc
LEFT JOIN rate_chart_download_history dh 
  ON dh.rate_chart_id = rc.id AND dh.machine_id = 6
WHERE rc.society_id = 1 AND rc.channel = 'COW' AND rc.status = 1 AND dh.id IS NULL;
-- Returns: Chart 101 (M2 hasn't downloaded yet)

-- Machine M2 downloads
INSERT INTO rate_chart_download_history (rate_chart_id, machine_id, society_id, channel)
VALUES (101, 6, 1, 'COW');

-- Machine M3 (machine_id=7) can still download independently
-- Each machine tracks its own download history
```

### Query Patterns for Shared Data

**Admin viewing rate chart data**:
```sql
-- Always resolve to master data
SELECT rcd.* 
FROM rate_chart_data rcd
WHERE rcd.rate_chart_id = COALESCE(
  (SELECT shared_chart_id FROM rate_charts WHERE id = 102), 
  102
)
ORDER BY clr, fat, snf;
```

**Machine API optimization**:
```typescript
// GetLatestPriceChart logic
const rateChartIdToQuery = rateChart.shared_chart_id || rateChart.id;
const query = `
  SELECT fat, snf, clr, rate
  FROM rate_chart_data
  WHERE rate_chart_id = ?
  ORDER BY CAST(fat AS DECIMAL) ASC, CAST(snf AS DECIMAL) ASC
  LIMIT 10 OFFSET ?
`;
```

---

## Best Practices

### For Developers

1. **Always check shared_chart_id**:
   ```sql
   COALESCE(rc.shared_chart_id, rc.id)
   ```

2. **Filter by status for machine APIs**:
   ```sql
   WHERE rc.status = 1  -- Only active charts
   ```

3. **Use indexes for performance**:
   - Filter by `society_id` + `channel` (covers unique key)
   - Order by `clr`, `fat`, `snf` (uses composite index)

4. **Handle cascading deletes**:
   - Deleting master chart removes all data
   - Shared charts become orphaned (handle in UI)

### For Database Administrators

1. **Monitor shared charts**:
   ```sql
   SELECT COUNT(*) as shared_count, shared_chart_id
   FROM rate_charts
   WHERE shared_chart_id IS NOT NULL
   GROUP BY shared_chart_id;
   ```

2. **Check orphaned data**:
   ```sql
   SELECT * FROM rate_chart_data rcd
   LEFT JOIN rate_charts rc ON rc.id = rcd.rate_chart_id
   WHERE rc.id IS NULL;
   ```

3. **Track download status**:
   ```sql
   SELECT 
     COUNT(CASE WHEN status = 1 THEN 1 END) as active_charts,
     COUNT(CASE WHEN status = 0 THEN 1 END) as downloaded_charts
   FROM rate_charts;
   ```

---

## Testing Queries

### Verify Shared Data Structure
```sql
-- Find all chart groups
SELECT 
  COALESCE(shared_chart_id, id) as master_id,
  COUNT(*) as society_count,
  GROUP_CONCAT(society_id) as societies
FROM rate_charts
WHERE channel = 'COW'
GROUP BY COALESCE(shared_chart_id, id);
```

### Check Status Distribution
```sql
SELECT 
  channel,
  status,
  COUNT(*) as chart_count
FROM rate_charts
GROUP BY channel, status;
```

### Pagination Test
```sql
-- Simulate machine pagination
SET @chart_id = 101;
SET @page_size = 10;
SET @page_number = 1;
SET @offset = (@page_number - 1) * @page_size;

SELECT fat, snf, clr, rate
FROM rate_chart_data
WHERE rate_chart_id = @chart_id
ORDER BY CAST(fat AS DECIMAL) ASC, CAST(snf AS DECIMAL) ASC
LIMIT @page_size OFFSET @offset;
```

---

## Performance Considerations

### Index Usage

**Query**: `GetLatestPriceChart` endpoint
```sql
EXPLAIN SELECT rc.id, rc.shared_chart_id, rc.uploaded_at, rc.status
FROM rate_charts rc
WHERE rc.society_id = 1 AND rc.channel = 'COW' AND rc.status = 1
ORDER BY rc.uploaded_at DESC
LIMIT 1;
```

**Expected Plan**:
- Uses: `unique_society_channel` index (society_id, channel)
- Filter: `idx_status` index (status)
- Rows scanned: 1

### Data Volume Estimates

**Assumptions**:
- 100 societies per admin
- 3 channels per society (COW, BUF, MIX)
- 450 records per rate chart
- 10 admins

**Without Sharing**:
- `rate_charts`: 100 × 3 × 10 = 3,000 rows
- `rate_chart_data`: 3,000 × 450 = 1,350,000 rows

**With Sharing** (10 societies per chart):
- `rate_charts`: 3,000 rows (same)
- `rate_chart_data`: (3,000 / 10) × 450 = 135,000 rows (90% reduction)

---

## Troubleshooting

### Issue: "Price chart not found" for active chart

**Cause**: Status may be set to 0

**Check**:
```sql
SELECT * FROM rate_charts
WHERE society_id = ? AND channel = ?;
-- Check status column
```

**Fix**:
```sql
UPDATE rate_charts
SET status = 1
WHERE society_id = ? AND channel = ?;
```

### Issue: Shared chart returns no data

**Cause**: Master chart was deleted or shared_chart_id is invalid

**Check**:
```sql
SELECT 
  rc.id,
  rc.shared_chart_id,
  master.id as master_exists
FROM rate_charts rc
LEFT JOIN rate_charts master ON master.id = rc.shared_chart_id
WHERE rc.id = ?;
```

**Fix**: Reassign or delete orphaned shared charts

### Issue: Duplicate data across societies

**Cause**: Old migration without shared_chart_id

**Check**:
```sql
SELECT COUNT(*) as duplicate_count
FROM rate_chart_data rcd
INNER JOIN rate_charts rc ON rc.id = rcd.rate_chart_id
WHERE rc.shared_chart_id IS NOT NULL;
-- Should be 0
```

**Fix**: Run consolidation script to merge duplicate data

---

## References

- **Admin Schema Creation**: `src/lib/adminSchema.ts`
- **Machine API Endpoints**: `src/app/api/[db-key]/PriceChartUpdation/`
- **Web API Endpoints**: `src/app/api/user/ratechart/`
- **Migration Scripts**: `database/migrations/` and `scripts/`
- **API Documentation**: `docs/08-machine-apis/DB_KEY_API_STRUCTURE.md`
