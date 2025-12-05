# Section Pulse Feature - Implementation Complete

## Overview
The Section Pulse feature tracks milk collection activity for each society, monitoring the first and last collections of each day, detecting section end after 60 minutes of inactivity, and tracking multi-day inactivity periods.

## Architecture

### Database Schema

**Table: `section_pulse`**
- Created in all admin schemas via migration `20251202000001-create-section-pulse-table.js`
- Updated in `src/lib/adminSchema.ts` for new admin creation

**Columns:**
- `id` - Primary key
- `society_id` - Foreign key to societies table
- `pulse_date` - DATE (tracking date)
- `first_collection_time` - DATETIME (section start pulse)
- `last_collection_time` - DATETIME (last collection recorded)
- `section_end_time` - DATETIME (60 min after last collection)
- `pulse_status` - ENUM('not_started', 'active', 'ended', 'inactive')
- `total_collections` - INT (collections count for the day)
- `inactive_days` - INT (consecutive days without pulse)
- `last_checked` - DATETIME (last status check timestamp)

**Indexes:**
- Unique constraint on (society_id, pulse_date)
- Indexes on society_id, pulse_date, pulse_status, last_checked

## Backend Components

### 1. Pulse Tracking Utility (`src/lib/sectionPulseTracker.ts`)

**Class: `SectionPulseTracker`**

**Methods:**

**`updatePulseOnCollection(sequelize, schemaName, societyId, collectionDateTime)`**
- Called automatically when milk collection is saved
- Creates or updates pulse record for the day
- Records first collection time (section start pulse)
- Updates last collection time
- Increments total collections counter
- Resets inactive days to 0

**`checkSectionEnd(sequelize, schemaName)`**
- Should be called periodically (every 10-15 minutes via cron/scheduler)
- Finds active pulses where last collection was > 60 minutes ago
- Marks section as 'ended' and records section_end_time

**`checkInactivity(sequelize, schemaName)`**
- Should be called daily (midnight via cron/scheduler)
- Checks societies without collections
- Increments inactive_days counter
- Creates pulse records with 'inactive' status

**`getPulseStatus(sequelize, schemaName, societyId, date?)`**
- Retrieves pulse status for a specific society
- Returns PulseUpdateResult object
- Defaults to current date if not specified

**`getAllPulseStatuses(sequelize, schemaName, date?)`**
- Retrieves pulse status for all active societies
- Returns array of PulseUpdateResult with society names
- Includes societies with no pulse record (status: 'not_started')

### 2. Collection Integration

**File: `src/app/api/[db-key]/Collection/SaveCollectionDetails/route.ts`**

Added automatic pulse tracking:
```typescript
// After saving milk collection
await SectionPulseTracker.updatePulseOnCollection(
  sequelize,
  schemaName,
  actualSocietyId,
  collectionDateTime
);
```

Non-blocking: Pulse tracking errors don't fail collection saves.

### 3. API Endpoints

**File: `src/app/api/user/pulse/route.ts`**

**GET /api/user/pulse**
- Retrieves pulse status for all societies (current date)
- Query params:
  - `date=YYYY-MM-DD` - Get status for specific date
  - `societyId=123` - Get status for specific society
- Returns summary with counts and detailed pulse array

**POST /api/user/pulse/check**
- Manual trigger for pulse checks (admin only)
- Runs checkSectionEnd() and checkInactivity()
- Returns updated pulse statistics

## Frontend Components

### 1. Pulse Indicator Component (`src/components/SectionPulseIndicator.tsx`)

**`SectionPulseIndicator`**
- Visual indicator with color-coded status
- Compact or full card display modes
- Shows:
  - Status icon and color
  - Start time, last collection time
  - Total collections count
  - Inactive days (if applicable)
  - Section end time (if ended)

**Status Colors:**
- 🟢 Green (Active) - Collections happening
- 🟡 Yellow (Not Started) - No collections yet today
- 🔴 Red (Ended) - Section ended (60+ min since last)
- ⚫ Gray (Inactive) - No pulse for multiple days

**`PulseSummaryCard`**
- Overview card showing total counts
- Grid display of active/ended/not started/inactive counts
- Total societies counter

### 2. Society Dashboard Integration

**File: `src/app/admin/society/page.tsx`**

Added pulse section between status messages and top performers:
- Fetch pulse data on page load
- Summary card always visible
- Expandable details section
- Shows only active/ended/inactive societies (hides not_started)
- Sorted by status priority (active → ended → inactive)

## Pulse Status States

### not_started
- No collections recorded yet for the day
- Displayed as "Section not started"
- Hidden from details view (only in summary count)

### active
- Collections happening within last 60 minutes
- Animated pulsing green indicator
- Shows time since last collection
- Message: "Active - Last collection X min ago"

### ended
- 60+ minutes passed since last collection
- Red indicator
- Shows section end time
- Message: "Section ended at HH:MM"

### inactive
- No collections for 1+ consecutive days
- Gray indicator
- Shows number of inactive days
- Message: "No pulse for X day(s)"

## Data Flow

1. **Collection Event**
   - ESP32/Machine sends milk collection data
   - API saves to milk_collections table
   - SectionPulseTracker.updatePulseOnCollection() called
   - Pulse record created/updated for the day

2. **Periodic Checks (Cron/Scheduler)**
   - Every 10-15 minutes: checkSectionEnd()
   - Daily at midnight: checkInactivity()

3. **Dashboard Display**
   - Frontend calls GET /api/user/pulse
   - Receives summary + detailed pulse array
   - Displays summary card always
   - Shows expandable details on demand

## Migration Instructions

### Run Migration
```bash
npx sequelize-cli db:migrate
```

This creates `section_pulse` table in all existing admin schemas.

### Rollback (if needed)
```bash
npx sequelize-cli db:migrate:undo
```

## Scheduler Setup (Required)

The pulse checks need to run periodically. Implement using one of:

### Option 1: Node-cron (Recommended for single server)
```typescript
// Add to server startup or separate cron service
import cron from 'node-cron';
import { SectionPulseTracker } from '@/lib/sectionPulseTracker';

// Run section end check every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  const schemas = await getAllAdminSchemas();
  for (const schema of schemas) {
    await SectionPulseTracker.checkSectionEnd(sequelize, schema);
  }
});

// Run inactivity check daily at midnight
cron.schedule('0 0 * * *', async () => {
  const schemas = await getAllAdminSchemas();
  for (const schema of schemas) {
    await SectionPulseTracker.checkInactivity(sequelize, schema);
  }
});
```

### Option 2: External Cron (VPS/Production)
```bash
# Add to crontab
*/15 * * * * curl -X POST http://localhost:3000/api/user/pulse/check -H "Authorization: Bearer ADMIN_TOKEN"
0 0 * * * curl -X POST http://localhost:3000/api/user/pulse/check -H "Authorization: Bearer ADMIN_TOKEN"
```

### Option 3: Next.js API Route (Development)
Create `/api/cron/pulse-check/route.ts`:
```typescript
export async function GET() {
  // Run pulse checks
  // Protect with API key or internal-only access
}
```

## Testing

### 1. Manual Collection Test
```bash
# Send test collection via ESP32 endpoint
curl -X POST "http://localhost:3000/api/DBKEY/Collection/SaveCollectionDetails" \
  -d "InputString=S-1|LSE-SVPWTBQ-12AH|LE2.00|Mm1|MO|1|COW|F090.70|S07.90|C28.00|P02.90|L04.30|s00.65|W06.00|T26.47|I00001|Q100.00|R500.00|r05.00|i00.00|D2025-12-02_08:00:00"

# Check pulse status
curl "http://localhost:3000/api/user/pulse" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: USER_ID"
```

### 2. Manual Pulse Check
```bash
curl -X POST "http://localhost:3000/api/user/pulse/check" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "x-user-id: ADMIN_ID"
```

### 3. Query Specific Date
```bash
curl "http://localhost:3000/api/user/pulse?date=2025-12-02" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: USER_ID"
```

## Database Queries

### Check Pulse Records
```sql
SELECT * FROM `schema_name`.section_pulse 
WHERE pulse_date = CURDATE()
ORDER BY pulse_status, society_id;
```

### Find Inactive Societies
```sql
SELECT sp.*, s.name 
FROM `schema_name`.section_pulse sp
JOIN `schema_name`.societies s ON s.id = sp.society_id
WHERE sp.pulse_status = 'inactive'
ORDER BY sp.inactive_days DESC;
```

### Daily Collection Summary
```sql
SELECT 
  s.name,
  sp.first_collection_time,
  sp.last_collection_time,
  sp.total_collections,
  sp.pulse_status
FROM `schema_name`.section_pulse sp
JOIN `schema_name`.societies s ON s.id = sp.society_id
WHERE sp.pulse_date = CURDATE();
```

## Future Enhancements

1. **Alerts**
   - Email/SMS when section ends
   - Notify when society becomes inactive
   - Alert on unusual patterns

2. **Analytics**
   - Average section start/end times
   - Collection density graphs
   - Inactive society trends

3. **Predictive**
   - Predict section end time based on patterns
   - Forecast inactive days
   - Collection volume predictions

4. **Export**
   - Daily pulse reports
   - CSV export for analysis
   - PDF summary reports

## Files Created/Modified

### Created
1. `database/migrations/20251202000001-create-section-pulse-table.js`
2. `src/lib/sectionPulseTracker.ts`
3. `src/app/api/user/pulse/route.ts`
4. `src/components/SectionPulseIndicator.tsx`

### Modified
1. `src/lib/adminSchema.ts` - Added section_pulse table
2. `src/app/api/[db-key]/Collection/SaveCollectionDetails/route.ts` - Added pulse tracking
3. `src/app/admin/society/page.tsx` - Added pulse UI section

## Support

For issues or questions:
1. Check pulse records in database
2. Review console logs for pulse tracking errors
3. Verify scheduler is running
4. Test manual pulse check endpoint
5. Ensure all migrations completed successfully

---

**Implementation Date:** December 2, 2025  
**Version:** 1.0  
**Status:** ✅ Complete
