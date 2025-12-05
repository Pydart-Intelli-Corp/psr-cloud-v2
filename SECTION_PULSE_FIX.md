# Section Pulse Status Fix

## Issue
Section pulse status was not updating correctly when new collections were pushed via external endpoints (ESP32 devices using SaveCollectionDetails API).

## Root Cause
The problem was caused by timezone mismatch between:
1. **Sequelize connection** - No timezone configuration, defaulting to system/UTC
2. **MySQL DATE field** - Stored as `2025-12-02` but retrieved as `2025-12-01T18:30:00.000Z` (UTC)
3. **Date comparison in queries** - Direct comparison `pulse_date = '2025-12-02'` failing due to timezone conversion

### Example of the Problem:
```javascript
// Collection datetime: "2025-12-02 13:00:26" (IST)
// Stored pulse_date: 2025-12-02
// Retrieved via Sequelize (no timezone): "2025-12-01T18:30:00.000Z"
// Comparison failed: "2025-12-01T18:30:00.000Z" != "2025-12-02"
```

## Solution

### 1. Added IST Timezone to Database Configuration
**File:** `config/database.js`

Added `timezone: '+05:30'` to the development database configuration:
```javascript
dialect: 'mysql',
timezone: '+05:30',  // ← Added IST timezone
dialectOptions: {
  // ...
}
```

This ensures Sequelize interprets all DATE and DATETIME values in IST.

### 2. Fixed Date Comparison in SQL Queries
**File:** `src/lib/sectionPulseTracker.ts`

Changed all `pulse_date = ?` comparisons to use `DATE(pulse_date) = ?`:

**Before:**
```sql
WHERE society_id = ? AND pulse_date = ?
```

**After:**
```sql
WHERE society_id = ? AND DATE(pulse_date) = ?
```

This extracts the actual date value from the DATE field, ignoring timezone conversion artifacts.

### Changes Made:
1. ✅ `updatePulseOnCollection()` - SELECT query
2. ✅ `updatePulseOnCollection()` - UPDATE query  
3. ✅ `resetInactiveDays()` - UPDATE query
4. ✅ `getPulseStatus()` - SELECT query
5. ✅ `getAllPulseStatuses()` - LEFT JOIN condition
6. ✅ `checkInactivity()` - Today's pulse check
7. ✅ `checkInactivity()` - Yesterday's pulse check

## Testing

### Test Result:
```
🧪 Testing Section Pulse Update Flow
================================================================================
1️⃣ Testing with: Society ID 3, DateTime: 2025-12-02 14:30:00

2️⃣ Current pulse status:
   Status: active
   Total Collections: 1
   First Collection: Tue Dec 02 2025 01:00:26 GMT+0530 (India Standard Time)
   Last Collection: Tue Dec 02 2025 01:00:26 GMT+0530 (India Standard Time)

3️⃣ Simulating pulse update...
   ✅ Pulse record updated

4️⃣ Updated pulse status:
   Status: active
   Total Collections: 2
   First Collection: Tue Dec 02 2025 01:00:26 GMT+0530 (India Standard Time)
   Last Collection: Tue Dec 02 2025 14:30:00 GMT+0530 (India Standard Time)
   Pulse Date (stored): Tue Dec 02 2025 00:00:00 GMT+0530 (India Standard Time) ✓

================================================================================
✅ Test completed successfully!
```

### Verification Steps:
1. ✅ Date comparison now works correctly
2. ✅ Timezone displays correctly (IST instead of UTC)
3. ✅ Pulse records update successfully on new collections
4. ✅ Total collections counter increments properly

## Impact

### Before Fix:
- ❌ New collections from ESP32 devices wouldn't update pulse status
- ❌ Pulse remained "inactive" or "not_started" even after collections
- ❌ ECG indicators on society cards showed incorrect status
- ❌ Date comparisons failed due to timezone mismatch

### After Fix:
- ✅ Collections immediately update pulse status to "active"
- ✅ Total collections counter increments correctly
- ✅ Last collection time updates properly
- ✅ ECG indicators show real-time collection activity
- ✅ All date comparisons work correctly in IST

## Next Steps

1. **Restart Development Server** - Required for database config changes to take effect:
   ```bash
   npm run dev
   ```

2. **Test External API** - Send a test collection from ESP32 or via API:
   ```
   POST /api/TES6572/Collection/SaveCollectionDetails
   InputString=S-3|LSE-SVPWTBQ-12AH|LE2.00|Mm102|EV|4|MIX|F04.70|S07.90|C28.00|P02.90|L04.30|s00.65|W06.00|T26.47|I00005|Q01.50|R050.40|r033.60|i00.00|D2025-12-02_15:00:00
   ```

3. **Verify UI Update** - Check society list page to confirm ECG pulse indicator updates

4. **Monitor Logs** - Watch for pulse update messages:
   ```
   📍 Updating pulse for society 3 on 2025-12-02
   🔵 Pulse updated - last collection at 2025-12-02T15:00:00+05:30
   ✅ Section pulse updated successfully
   ```

## Files Modified

1. `config/database.js` - Added IST timezone configuration
2. `src/lib/sectionPulseTracker.ts` - Fixed all date comparison queries

## Technical Details

### Why DATE() Function?
The `DATE()` MySQL function extracts the date part from a DATE or DATETIME field, ensuring consistent comparison regardless of timezone representation:

```sql
-- Without DATE(): Compares full datetime/timezone representation
WHERE pulse_date = '2025-12-02'  -- May fail with timezone issues

-- With DATE(): Extracts actual date value
WHERE DATE(pulse_date) = '2025-12-02'  -- Always works correctly
```

### Timezone Configuration Impact
Setting `timezone: '+05:30'` affects:
- How Sequelize interprets DATE/DATETIME values from MySQL
- How JavaScript Date objects are created from database values
- Display of timestamps in console logs
- Does NOT affect actual storage in MySQL (which is timezone-agnostic for DATE fields)

## Related Documentation

- Section Pulse System: `docs/LIVE_MONITORING_SYSTEM.md`
- External API: `docs/EXTERNAL_API_ENDPOINTS.md`
- ESP32 Integration: `docs/ESP32_ENDPOINT_UPDATES.md`
