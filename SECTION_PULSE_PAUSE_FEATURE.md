# Section Pulse Pause Feature

## Overview
Enhanced the Section Pulse tracking system to include a 'paused' status that indicates when a section has been inactive for 5 minutes but not yet ended (60 minutes).

## Feature Details

### Pulse Status States
1. **not_started** (Yellow) - No collections yet today
2. **active** (Green) - Collections are happening
3. **paused** (Orange) - No collection for 5 minutes ⏸️
4. **ended** (Red) - No collection for 60 minutes 🔴
5. **inactive** (Gray) - Multi-day inactivity

### Timing Logic
- **Active → Paused**: After 5 minutes of no collections
- **Paused → Ended**: After 60 minutes total of no collections
- **Paused → Active**: When a new collection arrives (automatic restart)

### Visual Indicators
- **Active**: Green pulse with ECG wave animation
- **Paused**: Orange pulse with Clock icon
- **Ended**: Red pulse with XCircle icon

## Implementation Changes

### 1. Database Migration
**File**: `database/migrations/20251205000001-add-paused-status-to-section-pulse.js`
- Added 'paused' to pulse_status ENUM
- Updates: `ENUM('not_started', 'active', 'paused', 'ended', 'inactive')`

### 2. TypeScript Interfaces
**Files Updated**:
- `src/lib/sectionPulseTracker.ts`
  - Added 'paused' to PulseUpdateResult interface
  - New method: `checkSectionPauseAndEnd()` - checks both 5-min pause and 60-min end
  - Updated `updatePulseOnCollection()` - logs when restarting from pause

- `src/components/SectionPulseIndicator.tsx`
  - Added 'paused' to PulseStatus interface
  - Added orange color and clock icon for paused state

### 3. Scheduler Updates
**File**: `pulse-scheduler.js`
- Changed check interval from 15 minutes to 2 minutes
- Replaced `checkSectionEnd()` with `checkSectionPauseAndEnd()`
- Now checks for both pause (5 min) and end (60 min) conditions
- Logs: "⏸️ Section paused" and "🔴 Section end pulse recorded"

### 4. UI Updates
**File**: `src/app/admin/society/page.tsx`
- Tooltip already shows section start time from database
- Pulse indicator automatically shows orange for paused status

## Usage

### Starting the Scheduler
```bash
# Using Node
node pulse-scheduler.js

# Using PM2 (recommended for production)
pm2 start pulse-scheduler.js --name "pulse-scheduler"
pm2 logs pulse-scheduler
```

### Scheduler Output
```
⏰ Running section pause/end check...
   Found 3 admin schemas
   ✅ db_TST1234 - 2 paused, 1 ended
   ✅ db_XYZ5678 - 0 paused, 0 ended
   ✅ Section pause/end check completed in 145ms
```

### Collection Flow
1. **First collection** → Status: `active` (green)
2. **5 minutes pass** → Status: `paused` (orange) ⏸️
3. **New collection arrives** → Status: `active` (green) - "Section restarted from pause"
4. **60 minutes pass** → Status: `ended` (red) 🔴

## Database Schema
```sql
CREATE TABLE section_pulse (
  id INT PRIMARY KEY AUTO_INCREMENT,
  society_id INT NOT NULL,
  pulse_date DATE NOT NULL,
  first_collection_time DATETIME DEFAULT NULL,
  last_collection_time DATETIME DEFAULT NULL,
  section_end_time DATETIME DEFAULT NULL,
  pulse_status ENUM('not_started', 'active', 'paused', 'ended', 'inactive') DEFAULT 'not_started',
  total_collections INT DEFAULT 0,
  inactive_days INT DEFAULT 0,
  last_checked DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Integration
The pause feature works automatically with existing collection APIs:
- When a collection is received, `updatePulseOnCollection()` is called
- It automatically changes status from 'paused' to 'active' if needed
- Logs: "▶️ Section restarted from pause - collection at [time]"

## Benefits
1. **Better Visibility**: Operators can see when sections are temporarily paused vs permanently ended
2. **Automatic Recovery**: Sections automatically resume when collections restart
3. **Proactive Monitoring**: 5-minute warning before section ends
4. **Real-time Updates**: Visual feedback updates every 2 minutes

## Testing
To test the pause feature:
1. Create a collection → Status becomes `active` (green)
2. Wait 5 minutes → Status changes to `paused` (orange)
3. Create another collection → Status returns to `active` (green)
4. Wait 60 minutes → Status changes to `ended` (red)

## Troubleshooting
- If pulse scheduler is not running, statuses won't update automatically
- Check scheduler logs: `pm2 logs pulse-scheduler`
- Verify migration ran: Check pulse_status ENUM includes 'paused'
- Database query to check paused sections:
  ```sql
  SELECT * FROM section_pulse WHERE pulse_status = 'paused';
  ```

## Future Enhancements
- Push notifications when section pauses
- Configurable pause threshold (currently 5 minutes)
- Dashboard analytics for pause frequency
- Alert system for sections frequently pausing
