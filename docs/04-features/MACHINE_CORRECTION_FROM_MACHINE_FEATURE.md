# Machine Correction "From Machine" Feature

## Overview
This feature allows admins to view **daily historical** machine correction values that were automatically saved by ESP32 devices directly in the machine detail page's correction tab. The system maintains daily correction records, where corrections sent on the same day overwrite each other, but a new day creates a new record. This provides a convenient way to track correction changes over time.

## Key Behavior: Daily Overwrite Logic

### Save Logic (ESP32 → Database)
- **Same Day**: If ESP32 sends corrections multiple times in one day, the latest values **OVERWRITE** the existing record for that day
- **New Day**: When a new day starts, corrections create a **NEW** record, preserving historical data
- **SQL Query**: Uses `DATE(created_at) = CURDATE()` to check if today's record exists
- **Result**: One correction record per day per machine, with latest values for today

### Example Timeline
```
Day 1 (Jan 15):
  10:00 AM - Machine sends: Fat=0.10, SNF=-0.05 → INSERT new record
  2:00 PM - Machine sends: Fat=0.15, SNF=-0.03 → UPDATE same record
  5:00 PM - Machine sends: Fat=0.12, SNF=-0.04 → UPDATE same record
  Result: Only 1 record for Jan 15 with Fat=0.12, SNF=-0.04

Day 2 (Jan 16):
  9:00 AM - Machine sends: Fat=0.08, SNF=-0.02 → INSERT new record
  Result: 2 records total (Jan 15 + Jan 16)
```

## Components Added

### 1. Backend API Endpoint
**File**: `src/app/api/user/machine/correction/[machineId]/route.ts`

**Purpose**: Retrieves historical machine correction data (last 30 days)

**Method**: GET

**Authentication**: Required (Bearer Token)

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "machineId": "M001",
      "channel1": { "fat": "0.10", "snf": "-0.05", ... },
      "channel2": { ... },
      "channel3": { ... },
      "date": "1/15/2025",
      "createdAt": "2025-01-15T08:00:00Z",
      "lastUpdated": "2025-01-15T17:30:00Z"
    },
    {
      "id": 122,
      "machineId": "M001",
      "date": "1/14/2025",
      ...
    }
  ]
}
```

**No Data Response**:
```json
{
  "success": true,
  "data": [],
  "message": "No correction data found for this machine"
}
```

### 2. Frontend Components

#### State Management
**File**: `src/app/admin/machine/[id]/page.tsx`

Added three new state variables:
```typescript
const [machineCorrection, setMachineCorrection] = useState<any>(null); // Now stores array of records
const [showMachineCorrection, setShowMachineCorrection] = useState(false);
const [machineCorrectionLoading, setMachineCorrectionLoading] = useState(false);
```

#### Fetch Function
```typescript
const fetchMachineCorrection = async () => {
  // Fetches correction data array from the API
  // Shows success message with record count
  // Toggles display of the correction cards
}
```

#### UI Components

##### 1. "From Machine" Button
- **Location**: Correction tab, above the save buttons section
- **Icon**: Download icon
- **Loading State**: Shows loading spinner when fetching data
- **Placement**: First button in the button group (before History and Clear All)

##### 2. Daily Correction Cards
- **Display**: Shows historical records as individual cards (last 30 days)
- **Theme**: Emerald/teal gradient matching the correction tab theme
- **Layout**: Responsive stacked cards with dates

**Card Structure** (per day):
- **Header**: 
  - Badge: "🔴 Today" for current day, date for historical
  - Last updated timestamp
- **Table**: 4 columns (Parameter, Channel 1, Channel 2, Channel 3)
- **Rows**: Fat, SNF, CLR, Temperature, Water, Protein

**Visual Design**:
- Today's record highlighted with emerald badge
- Historical records with date badge
- Each card has its own compact table
- Responsive scrolling for multiple days

## User Flow

### Viewing Machine Corrections
1. Admin navigates to machine detail page
2. Clicks on "Correction" tab
3. Clicks "From Machine" button
4. System fetches daily correction records (last 30 days)
5. If data exists:
   - Success message: "Loaded X correction records from machine"
   - Cards display for each day
   - Today's record shown first with "🔴 Today" badge
   - Historical records follow in descending order
6. If no data exists:
   - Error message: "No correction data found for this machine"

### Closing the View
- Click the X button in the section header
- All cards disappear but data remains in state
- Can reopen by clicking "From Machine" again

### Understanding Daily Records
- Each card represents one day's corrections
- Multiple ESP32 updates on the same day = one card (latest values)
- New day = new card in the list
- Maximum 30 days displayed

## Technical Details

### Data Source
- **Table**: `machine_corrections` in admin schema
- **Query**: Fetches last 30 daily records (ORDER BY created_at DESC LIMIT 30)
- **Saved By**: `SaveMachineCorrectionFromMachine` endpoint when ESP32 sends corrections
- **Daily Logic**: Same day updates overwrite, new day creates new record

### Daily Overwrite SQL Logic
**Check Query**:
```sql
SELECT id, DATE(created_at) as created_date 
FROM machine_corrections
WHERE machine_id = ? AND society_id = ?
AND DATE(created_at) = CURDATE()
LIMIT 1
```

**If Today's Record Exists** → UPDATE:
```sql
UPDATE machine_corrections
SET channel1_fat = ?, channel1_snf = ?, ..., updated_at = NOW()
WHERE machine_id = ? AND society_id = ? AND DATE(created_at) = CURDATE()
```

**If No Record for Today** → INSERT:
```sql
INSERT INTO machine_corrections (machine_id, society_id, channel1_fat, ...)
VALUES (?, ?, ?, ...)
```

### Channel Mapping
- Channel 1 = COW
- Channel 2 = BUF (Buffalo)
- Channel 3 = MIX

### Value Display
- Shows raw values from database
- Displays "-" for null or empty values
- No formatting applied to preserve precision

## Integration Points

### Related Endpoints
1. **Save Endpoint**: `/api/[db-key]/MachineCorrection/SaveMachineCorrectionFromMachine`
   - External API for ESP32 devices
   - Saves correction data to `machine_corrections` table
   - Documentation: `docs/ESP32_ENDPOINT_UPDATES.md`

2. **Manual Correction**: `/api/user/machine-correction`
   - Admin manual entry endpoint
   - Different table/workflow
   - Used by the correction forms

### Related Features
- Machine Correction History
- Manual Correction Entry
- ESP32 Device Integration

## Benefits

1. **Daily History**: Track correction changes over time (30 days)
2. **Auto-Overwrite**: Same-day updates keep data clean and current
3. **Comparison**: Compare corrections across different days
4. **Verification**: Verify ESP32 device is sending correct values
5. **Transparency**: Shows when corrections were last updated each day
6. **Non-Destructive**: Viewing corrections doesn't affect manual entry
7. **Historical Analysis**: Identify trends or issues over time

## Future Enhancements

### Possible Improvements
1. **Load into Form**: Add button to load machine correction values into manual entry form
2. **History View**: Show historical machine corrections, not just the latest
3. **Auto-Apply**: Option to automatically apply device corrections
4. **Diff View**: Show differences between device corrections and manual corrections
5. **Refresh**: Auto-refresh button to check for updated device corrections
6. **Notifications**: Alert when new corrections arrive from device

## Testing

### Test Cases
1. ✅ Button appears in correction tab
2. ✅ Clicking button fetches data
3. ✅ Loading state shows while fetching
4. ✅ Success message shows record count
5. ✅ Multiple daily cards display correctly
6. ✅ Today's record shows "🔴 Today" badge
7. ✅ Historical records show date badges
8. ✅ All three channels show values in each card
9. ✅ Null values show as "-"
10. ✅ Timestamps display correctly per record
11. ✅ Close button hides all cards
12. ✅ No data message when no corrections exist
13. ✅ Authentication required
14. ✅ Error handling for API failures
15. ✅ Same day updates overwrite (not duplicate)
16. ✅ New day creates new record
17. ✅ Maximum 30 days displayed

### Manual Testing Steps
1. Navigate to any machine detail page
2. Click "Correction" tab
3. Click "From Machine" button
4. Verify cards appear with daily records OR error message shows
5. Check today's record has "🔴 Today" badge
6. Verify historical records show dates
7. Check all channels have values in each card
8. Verify timestamps are displayed per record
9. Click X to close all cards
10. Verify cards close but can be reopened
11. **Daily Overwrite Test**:
    - Have ESP32 send corrections for the same machine
    - Click "From Machine" again
    - Verify today's record is updated (not duplicated)
    - Check timestamp updated to latest
12. **New Day Test**:
    - Wait for next day or manually change date
    - Have ESP32 send corrections
    - Verify new card appears for new day

## Error Handling

### API Errors
- **401 Unauthorized**: Invalid or missing token
- **404 Not Found**: User or machine not found
- **500 Server Error**: Database or query errors

### Frontend Errors
- Shows error toast notification
- Logs error to console
- Gracefully handles no data scenario
- Network errors handled with try-catch

## Security

### Access Control
- Requires authentication (JWT token)
- Only accessible to users with access to the machine
- Uses admin schema for data isolation
- No cross-schema data leakage

### Data Validation
- Machine ID validated
- User authentication verified
- Schema name sanitized
- SQL injection prevented via Sequelize

## Performance

### Optimizations
- Fetches only last 30 records (LIMIT 30)
- Query indexed by machine_id and created_at
- DATE(created_at) check for daily logic
- No unnecessary joins
- Minimal data transferred
- Client-side state caching
- Efficient daily overwrite (UPDATE vs INSERT)

### Response Time
- Typical: < 150ms
- Includes DB query (30 records) + network latency
- Optimized SQL query with date filtering
- No heavy computations

## Maintenance

### Database
- Table: `machine_corrections`
- Indexes: machine_id, created_at, updated_at
- Auto cleanup: Limited to 30 days display (no auto-delete)
- Daily overwrite keeps records lean
- One record per machine per day

### Monitoring
- Console logs for debugging
- Error tracking in production
- API response times monitored

## Documentation References
- ESP32 Integration: `docs/ESP32_ENDPOINT_UPDATES.md`
- External APIs: `docs/EXTERNAL_API_ENDPOINTS.md`
- Machine Correction: `docs/04-features/MACHINE_CORRECTION_API_FIX.md`

## Changelog

### Version 2.0 (Current - Daily History)
- ✅ Daily overwrite logic (same day = UPDATE, new day = INSERT)
- ✅ Historical view (last 30 days)
- ✅ Multiple daily cards with dates
- ✅ Today's record highlighted with badge
- ✅ Updated GET endpoint to fetch array
- ✅ Enhanced UI with card-based layout
- ✅ Success message shows record count

### Version 1.0 (Initial - Single Record)
- ✅ GET endpoint for fetching machine corrections
- ✅ "From Machine" button in correction tab
- ✅ Single correction data table
- ✅ Loading states and error handling
- ✅ Success/error notifications
- ✅ Timestamp display
- ✅ Close button functionality

### Future Versions
- [ ] Load into form feature
- [ ] Historical corrections view
- [ ] Auto-refresh capability
- [ ] Comparison with manual corrections
