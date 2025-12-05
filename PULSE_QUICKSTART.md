# Section Pulse Feature - Quick Start Guide

## ✅ Completed Setup

1. ✅ Database migration completed - `section_pulse` table created in all 7 admin schemas
2. ✅ Table structure verified with proper indexes and constraints
3. ✅ Node-cron package installed for scheduling
4. ✅ PM2 ecosystem config updated with pulse-scheduler

## 🚀 Testing the Feature

### Step 1: Start the Development Server

```powershell
npm run dev
```

### Step 2: Test Pulse Tracking with Collection Save

Send a test milk collection via the external ESP32 API:

```powershell
# Replace DBKEY with your actual database key (e.g., tes6572)
curl -X POST "http://localhost:3000/api/DBKEY/Collection/SaveCollectionDetails" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "InputString=S-1|LSE-SVPWTBQ-12AH|LE2.00|Mm1|MO|1|COW|F090.70|S07.90|C28.00|P02.90|L04.30|s00.65|W06.00|T26.47|I00001|Q100.00|R500.00|r05.00|i00.00|D2025-12-02_08:30:00"
```

**Expected Console Output:**
```
✅ Collection record saved successfully
✅ Section pulse updated successfully for society: 1
```

### Step 3: Verify Pulse Record in Database

```powershell
node -e "const { Sequelize } = require('sequelize'); const config = require('./config/database.js'); (async () => { const seq = new Sequelize(config.development.database, config.development.username, config.development.password, { host: config.development.host, port: config.development.port, dialect: config.development.dialect, logging: false }); const [rows] = await seq.query('SELECT * FROM tester_tes6572.section_pulse WHERE pulse_date = CURDATE()'); console.table(rows); await seq.close(); })()"
```

### Step 4: Test Pulse Status API

**Get all pulse statuses:**

```powershell
# Login first to get auth token
# Then use the token in the request

curl "http://localhost:3000/api/user/pulse" `
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" `
  -H "x-user-id: YOUR_USER_ID" `
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Pulse statuses retrieved successfully",
  "data": {
    "date": "2025-12-02",
    "totalSocieties": 5,
    "active": 1,
    "ended": 0,
    "notStarted": 4,
    "inactive": 0,
    "pulses": [
      {
        "societyId": 1,
        "pulseDate": "2025-12-02",
        "firstCollectionTime": "2025-12-02T08:30:00.000Z",
        "lastCollectionTime": "2025-12-02T08:30:00.000Z",
        "pulseStatus": "active",
        "totalCollections": 1,
        "statusMessage": "Active - Last collection 5 min ago",
        "societyName": "Test Society"
      }
    ]
  }
}
```

**Get specific society pulse:**

```powershell
curl "http://localhost:3000/api/user/pulse?societyId=1" `
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" `
  -H "x-user-id: YOUR_USER_ID"
```

### Step 5: Test Dashboard UI

1. Login to admin panel: `http://localhost:3000/login`
2. Navigate to Society Management: `/admin/society`
3. Scroll to "Section Pulse" section
4. You should see:
   - Summary card with total counts
   - "Show Details" button
   - Active society pulse indicators with green pulsing dots

### Step 6: Test Manual Pulse Check (Admin Only)

```powershell
curl -X POST "http://localhost:3000/api/user/pulse" `
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN" `
  -H "x-user-id: ADMIN_USER_ID" `
  -H "Content-Type: application/json"
```

This triggers both `checkSectionEnd()` and `checkInactivity()` checks.

## 🔄 Starting the Pulse Scheduler (Production)

### Option 1: Using Node (Development/Testing)

```powershell
# Start the scheduler
node pulse-scheduler.js
```

This will:
- Run section end check every 15 minutes
- Run inactivity check daily at midnight
- Show logs for each check

### Option 2: Using PM2 (Production)

```bash
# Start both apps (Next.js + Pulse Scheduler)
pm2 start ecosystem.config.js

# Check status
pm2 status

# View pulse scheduler logs
pm2 logs pulse-scheduler

# Restart pulse scheduler
pm2 restart pulse-scheduler

# Stop pulse scheduler
pm2 stop pulse-scheduler
```

## 📊 Monitoring Pulse Activity

### Check Today's Pulses

```sql
SELECT 
  sp.society_id,
  s.name AS society_name,
  sp.first_collection_time,
  sp.last_collection_time,
  sp.section_end_time,
  sp.pulse_status,
  sp.total_collections,
  sp.inactive_days
FROM tester_tes6572.section_pulse sp
JOIN tester_tes6572.societies s ON s.id = sp.society_id
WHERE sp.pulse_date = CURDATE()
ORDER BY sp.pulse_status, sp.society_id;
```

### Find Active Societies

```sql
SELECT 
  s.name,
  sp.first_collection_time,
  sp.last_collection_time,
  sp.total_collections,
  TIMESTAMPDIFF(MINUTE, sp.last_collection_time, NOW()) AS minutes_since_last
FROM tester_tes6572.section_pulse sp
JOIN tester_tes6572.societies s ON s.id = sp.society_id
WHERE sp.pulse_status = 'active'
  AND sp.pulse_date = CURDATE();
```

### Find Inactive Societies

```sql
SELECT 
  s.name,
  sp.pulse_date,
  sp.inactive_days,
  sp.last_collection_time
FROM tester_tes6572.section_pulse sp
JOIN tester_tes6572.societies s ON s.id = sp.society_id
WHERE sp.pulse_status = 'inactive'
ORDER BY sp.inactive_days DESC;
```

## 🧪 Testing Scenarios

### Scenario 1: First Collection of the Day
1. Send collection via API
2. Check pulse record - should show:
   - `pulse_status = 'active'`
   - `first_collection_time` = collection time
   - `last_collection_time` = collection time
   - `total_collections = 1`

### Scenario 2: Multiple Collections
1. Send 3-4 collections within 10 minutes
2. Check pulse record - should show:
   - `pulse_status = 'active'`
   - `last_collection_time` updated to latest
   - `total_collections` incremented

### Scenario 3: Section End (60 min inactivity)
1. Send a collection
2. Wait 61 minutes (or manually run `POST /api/user/pulse`)
3. Check pulse record - should show:
   - `pulse_status = 'ended'`
   - `section_end_time` = last_collection_time + 60 minutes

### Scenario 4: Multi-day Inactivity
1. Don't send any collections for a society
2. Run inactivity check (or wait for midnight)
3. Check pulse record - should show:
   - `pulse_status = 'inactive'`
   - `inactive_days = 1` (increments daily)

## 🎨 UI Status Indicators

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Active | 🟢 Green (pulsing) | Activity | Collections happening |
| Not Started | 🟡 Yellow | Clock | No collections yet today |
| Ended | 🔴 Red | XCircle | 60+ min since last collection |
| Inactive | ⚫ Gray | AlertCircle | No pulse for 1+ days |

## 📝 Next Steps

1. ✅ Test collection save with pulse tracking
2. ✅ Verify dashboard displays pulse section
3. ✅ Test manual pulse checks via API
4. ⏳ Start pulse scheduler for production
5. ⏳ Monitor logs for any errors
6. ⏳ Set up alerts for critical pulse statuses (optional)

## 🔧 Troubleshooting

### Pulse not updating on collection save
- Check console logs for "Section pulse updated successfully"
- Verify society_id exists in societies table
- Check database connection

### Dashboard not showing pulse section
- Check browser console for API errors
- Verify authentication token is valid
- Check if pulseData state is being populated

### Scheduler not running
- Check PM2 status: `pm2 status`
- View scheduler logs: `pm2 logs pulse-scheduler`
- Verify node-cron is installed: `npm list node-cron`

### Database errors
- Verify migration completed: `SELECT * FROM sequelize_meta WHERE name LIKE '%section-pulse%'`
- Check table exists: `SHOW TABLES LIKE 'section_pulse'` in admin schema
- Verify foreign key constraints

## 📚 Documentation

Complete documentation available in:
- `SECTION_PULSE_FEATURE.md` - Full feature documentation
- `src/lib/sectionPulseTracker.ts` - Business logic implementation
- `src/app/api/user/pulse/route.ts` - API endpoint details
- `src/components/SectionPulseIndicator.tsx` - UI components

---

**Feature Status:** ✅ Complete and Ready for Testing  
**Last Updated:** December 2, 2025
