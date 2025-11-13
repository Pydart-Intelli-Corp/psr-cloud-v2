# Rate Chart Shared Data Implementation

## Overview
Implemented truly shared rate chart data across multiple societies - upload CSV once and all selected societies reference the same `rate_chart_data` records.

## Schema Changes

### Added Column: `shared_chart_id`
```sql
ALTER TABLE rate_charts
ADD COLUMN shared_chart_id INT NULL COMMENT 'Reference to master rate chart for shared data' AFTER id,
ADD INDEX idx_shared_chart_id (shared_chart_id);
```

**Migration Script**: `scripts/add-shared-chart-id-column-fixed.mjs`

## How It Works

### Before (Duplicated Data)
When uploading to 2 societies with 7000 rows:
- `rate_charts`: 2 records (one per society) ✓
- `rate_chart_data`: 14,000 rows (7000 × 2 duplicates) ✗

### After (Shared Data)
When uploading to 2 societies with 7000 rows:
- `rate_charts`: 2 records
  - Society 1: `id=21, shared_chart_id=NULL` (master)
  - Society 2: `id=22, shared_chart_id=21` (references master)
- `rate_chart_data`: 7,000 rows (linked to master chart ID 21 only) ✓

## Implementation Flow

### 1. Frontend (No Changes)
- `RateChartUploadModal.tsx` - Already sends multiple society IDs in single API call
- User selects 2+ societies → sends `societyIds: "2,1"` to API

### 2. Backend Changes (`src/app/api/user/ratechart/upload/route.ts`)

#### Step 1: Delete Existing Charts
```typescript
DELETE FROM rate_chart_data WHERE rate_chart_id IN (...)
DELETE FROM rate_charts WHERE society_id IN (2,1) AND channel = 'COW'
```

#### Step 2: Insert rate_charts for All Societies
```typescript
INSERT INTO rate_charts (society_id, channel, ...)
VALUES (2, 'COW', ...), (1, 'COW', ...)
// Creates 2 records, one per society
```

#### Step 3: Get Master Chart ID (First Society)
```typescript
SELECT id FROM rate_charts
WHERE society_id = 2 AND channel = 'COW'
ORDER BY id DESC LIMIT 1
// Returns masterChartId = 21
```

#### Step 4: Insert Rate Data ONCE for Master Chart
```typescript
INSERT INTO rate_chart_data (rate_chart_id, clr, fat, snf, rate)
VALUES 
  (21, 7, 3.0, 3.0, 15.00),
  (21, 8, 3.0, 3.1, 15.25),
  ... // 7000 rows total, ALL linked to masterChartId = 21
```

#### Step 5: Update Other Societies to Reference Master
```typescript
UPDATE rate_charts
SET shared_chart_id = 21
WHERE society_id IN (1) AND channel = 'COW'
// Society 2's chart now points to Society 1's chart
```

## Data Retrieval

### When Fetching Rate Chart for a Society
```sql
SELECT 
  rc.id,
  rc.society_id,
  rc.channel,
  COALESCE(rc.shared_chart_id, rc.id) AS effective_chart_id
FROM rate_charts rc
WHERE rc.society_id = ? AND rc.channel = ?
```

### When Fetching Rate Data
```sql
-- For Society 1 (master)
SELECT * FROM rate_chart_data 
WHERE rate_chart_id = 21

-- For Society 2 (shared)
SELECT * FROM rate_chart_data 
WHERE rate_chart_id = (
  SELECT COALESCE(shared_chart_id, id)
  FROM rate_charts
  WHERE society_id = 2 AND channel = 'COW'
)
-- Returns shared_chart_id = 21, so same data as Society 1
```

## Benefits

### 1. Storage Efficiency
- **Before**: 2 societies × 7000 rows = 14,000 total rows
- **After**: 1 × 7000 rows = 7,000 total rows
- **Savings**: 50% reduction for 2 societies, scales better with more societies

### 2. Performance
- CSV parsed ONCE ✓
- Data inserted ONCE ✓
- Single UPDATE instead of multiple INSERT...SELECT loops ✓
- Faster upload for large CSV files

### 3. Data Consistency
- One source of truth - all societies see identical rate data
- Update master chart → all societies automatically get updated data
- Delete master chart → CASCADE deletes shared data (by FK constraint)

### 4. Flexibility
- Each society can still have unique rate_charts metadata (uploaded_by, file_name, etc.)
- Society can switch to independent chart by setting `shared_chart_id = NULL` and copying data
- Easy to identify master charts: `WHERE shared_chart_id IS NULL`
- Easy to identify shared charts: `WHERE shared_chart_id IS NOT NULL`

## Testing Checklist

- [x] Migration script adds `shared_chart_id` column
- [ ] Upload CSV to 2 societies - verify only 7000 rate_chart_data rows created
- [ ] Check Society 1's `rate_charts.shared_chart_id` = NULL
- [ ] Check Society 2's `rate_charts.shared_chart_id` = Society 1's chart ID
- [ ] View rate chart for Society 1 - displays correctly
- [ ] View rate chart for Society 2 - displays same data as Society 1
- [ ] Delete Society 1's chart - verify Society 2's chart remains but data is deleted (FK CASCADE)
- [ ] Upload CSV to 5 societies - verify only 7000 rate_chart_data rows created

## Files Modified

1. **`scripts/add-shared-chart-id-column-fixed.mjs`** (NEW)
   - Migration script to add `shared_chart_id` column
   - Adds index for performance

2. **`src/app/api/user/ratechart/upload/route.ts`** (MODIFIED)
   - Lines 165-210: Changed from duplicating data to sharing data
   - Removed nested loop that copied data N times
   - Added UPDATE to set `shared_chart_id` for non-master charts

## Migration Instructions

### For Existing Deployments
```bash
# Run migration script
node scripts/add-shared-chart-id-column-fixed.mjs

# Output:
# ✅ Updated 1 schema(s)
# Column 'shared_chart_id' added to rate_charts table
```

### For New Deployments
Update `scripts/add-ratechart-tables.mjs` to include `shared_chart_id` in initial schema creation.

## Future Enhancements

### 1. API to Unlink Shared Chart
```typescript
// POST /api/user/ratechart/:id/unlink
// Copies master data to society's own chart, sets shared_chart_id = NULL
```

### 2. UI Indicator for Shared Charts
```typescript
// Show badge: "Shared from Society ABC" in rate chart list
{chart.shared_chart_id && (
  <Chip label="Shared Chart" size="small" color="info" />
)}
```

### 3. Bulk Share Existing Charts
```typescript
// POST /api/user/ratechart/:id/share
// Body: { societyIds: [2, 3, 4] }
// Creates rate_charts records for societies 2, 3, 4 pointing to chart :id
```

## Notes

- **FK Constraint**: `rate_chart_data.rate_chart_id` still references `rate_charts.id` (CASCADE DELETE)
- **Delete Behavior**: Deleting master chart deletes all shared data (expected behavior)
- **Update Behavior**: Currently no UPDATE API - if needed, update rate_chart_data for master chart ID
- **Schema Pattern**: Works with pattern `{companyname}_poo{dbKey}` (e.g., `poornasreeequipments_poo5382`)
