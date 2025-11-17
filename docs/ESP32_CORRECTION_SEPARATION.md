# Machine Correction Data Separation (From Machine vs Admin)

## Overview
Separated ESP32 device corrections from admin-saved corrections by using dedicated tables for each purpose.

## Database Structure

### Two Separate Tables

#### 1. `machine_corrections` (Admin Table)
**Purpose**: Stores corrections manually saved by admins through the web interface

**Used By**: 
- `POST /api/user/machine-correction` - Admin saves corrections
- Admin machine correction form

**Data Source**: Admin user input through web UI

**Fields**:
- All 18 correction fields (3 channels × 6 parameters)
- `status` field (0 = inactive, 1 = active)
- Standard timestamps

---

#### 2. `machine_corrections_from_machine` (Device Table)
**Purpose**: Stores corrections automatically sent by ESP32/machine devices

**Used By**: 
- `POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionFromMachine` - ESP32 saves
- `GET /api/user/machine/correction/[machineId]` - Fetch for "From Machine" button

**Data Source**: ESP32 device via external API

**Fields**:
- All 18 correction fields (3 channels × 6 parameters)
- No status field (all records are valid device data)
- Standard timestamps

## Why Separate Tables?

### Problem Before
- Both admin corrections and ESP32 corrections stored in same `machine_corrections` table
- Used `status = 1` flag to identify ESP32 data
- Confusing and prone to data mixing
- Hard to distinguish data sources

### Solution Now
✅ **Clear separation** - Two dedicated tables for two data sources
✅ **No confusion** - Table name indicates data source
✅ **Better queries** - No need for status filters
✅ **Data integrity** - Each table serves its specific purpose
✅ **Easier maintenance** - Changes to one system don't affect the other

## API Endpoints

### ESP32 Device → Save Correction
```
POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionFromMachine
```
**Writes to**: `machine_corrections_from_machine` table
**Behavior**: One record per machine per day (updates if same day)

### Admin → Fetch ESP32 Corrections (From Machine Button)
```
GET /api/user/machine/correction/[machineId]
```
**Reads from**: `machine_corrections_from_machine` table
**Returns**: Latest correction per date (one per day), up to 30 records

### Admin → Save Corrections Manually
```
POST /api/user/machine-correction
```
**Writes to**: `machine_corrections` table
**Behavior**: Admin-saved corrections through web interface

## Migration Details

**Migration File**: `20251117000001-create-esp32-machine-corrections.js`

**Created In**: All 5 admin schemas
- `babumongopi_bab1568`
- `poornasreeequipments_poo5382`
- `tishnu_tis1353`
- `dasha_das2089`
- `laddu_lad6879`

**Indexes**:
- `idx_machine_id` - Fast machine lookups
- `idx_society_id` - Society-based queries
- `idx_created_at` - Date-based filtering
- `idx_machine_society` - Combined lookups

## Data Flow

### ESP32 Device Flow
```
ESP32 Device
    ↓
POST SaveMachineCorrectionFromMachine
    ↓
machine_corrections_from_machine table
    ↓
GET /api/user/machine/correction/[machineId]
    ↓
"From Machine" button displays data
```

### Admin Manual Flow
```
Admin Web UI
    ↓
POST /api/user/machine-correction
    ↓
machine_corrections table
    ↓
Admin correction management page
```

## Key Features

### ESP32 Table Features
- ✅ One record per machine per day
- ✅ Automatic date-based grouping
- ✅ Shows only latest correction per date
- ✅ No status field needed (all valid)
- ✅ Dedicated for device-sourced data

### Query Optimization
- Groups by `DATE(created_at)` to show one per day
- Uses `MAX(created_at)` to get latest on each date
- Joins to filter only most recent records
- Orders DESC to show newest first
- Limits to 30 records for performance

## Benefits

1. **Data Clarity**: Clear distinction between data sources
2. **No Conflicts**: Admin and device corrections never interfere
3. **Better Performance**: No need to filter by status field
4. **Easier Debugging**: Know exactly where data came from
5. **Future Scalability**: Can add device-specific fields without affecting admin table
6. **Cleaner Code**: More intuitive table names and queries

## Testing Checklist

- [ ] ESP32 device sends correction → saves to `machine_corrections_from_machine`
- [ ] "From Machine" button fetches from `machine_corrections_from_machine`
- [ ] Shows one correction per date only
- [ ] Admin saves correction → saves to `machine_corrections`
- [ ] No data mixing between tables
- [ ] Date-based grouping works correctly

## Future Enhancements

Possible future additions to `machine_corrections_from_machine`:
- Device firmware version
- Signal strength at time of save
- Device location/GPS data
- Network quality metrics
- Device battery level (if applicable)

---

**Created**: November 17, 2025
**Migration**: 20251117000001-create-esp32-machine-corrections.js
**Status**: ✅ Deployed to all admin schemas
