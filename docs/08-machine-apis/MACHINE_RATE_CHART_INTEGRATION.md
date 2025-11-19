# Machine Management - Rate Chart Integration

**Feature:** Rate Chart Information Display in Machine Management  
**Date Completed:** 2025-01-15  
**Status:** ✅ Complete

## Summary

Enhanced the Machine Management interface to display rate chart information for each machine, showing:
- Which rate charts are available (pending download)
- Which rate charts have been downloaded
- Channel types (COW/BUF/MIX) with color-coded badges
- Real-time status based on per-machine download history

## Changes Made

### 1. Backend API Enhancement

**File:** `d:\psr-v4\src\app\api\user\machine\route.ts`

#### Single Machine Query (GET /api/user/machine?id=X)
```sql
SELECT 
  m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
  m.installation_date, m.operator_name, m.contact_phone, m.status, 
  m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
  m.created_at, m.updated_at,
  s.name as society_name, s.society_id as society_identifier,
  -- Count of active charts
  (SELECT COUNT(*) 
   FROM rate_charts rc 
   WHERE rc.society_id = m.society_id AND rc.status = 1
  ) as active_charts_count,
  -- Chart details with download status
  (SELECT GROUP_CONCAT(DISTINCT 
    CONCAT(rc.channel, ':', rc.file_name, ':', 
      CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
    SEPARATOR '|||')
   FROM rate_charts rc
   LEFT JOIN rate_chart_download_history dh 
     ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
   WHERE rc.society_id = m.society_id AND rc.status = 1
  ) as chart_details
FROM machines m
LEFT JOIN societies s ON m.society_id = s.id
WHERE m.id = ?
```

#### All Machines Query (GET /api/user/machine)
Same subqueries added to the query that fetches all machines.

**Key Points:**
- Uses LEFT JOIN to check if machine has downloaded each chart
- Returns concatenated string format: `channel:filename:status|||channel:filename:status`
- Only includes active charts (status = 1)
- Status is either "pending" or "downloaded" per machine

### 2. Frontend Interface Update

**File:** `d:\psr-v4\src\app\admin\machine\page.tsx`

#### Updated Machine Interface
```typescript
interface Machine {
  // ... existing fields
  activeChartsCount?: number;
  chartDetails?: string; // Format: "channel:filename:status|||channel:filename:status"
}
```

#### Added Helper Functions

**1. parseChartDetails(chartDetails?: string)**
```typescript
const parseChartDetails = (chartDetails?: string) => {
  if (!chartDetails) return { pending: [], downloaded: [] };
  
  const charts = chartDetails.split('|||');
  const pending: Array<{ channel: string; fileName: string }> = [];
  const downloaded: Array<{ channel: string; fileName: string }> = [];
  
  charts.forEach(chart => {
    const [channel, fileName, status] = chart.split(':');
    if (channel && fileName && status) {
      if (status === 'pending') {
        pending.push({ channel, fileName });
      } else if (status === 'downloaded') {
        downloaded.push({ channel, fileName });
      }
    }
  });
  
  return { pending, downloaded };
};
```

**2. getChannelColor(channel: string)**
```typescript
const getChannelColor = (channel: string) => {
  switch (channel.toUpperCase()) {
    case 'COW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'BUF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'MIX': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};
```

#### Added Icon Imports
```typescript
import { 
  // ... existing imports
  FileText,
  Download,
  Clock
} from 'lucide-react';
```

#### Updated ItemCard Details (Both Views)

Added rate chart display sections to both grouped (folder) view and list view:

```tsx
// Rate Chart Information
...(() => {
  const { pending, downloaded } = parseChartDetails(machine.chartDetails);
  const details: Array<{ icon: JSX.Element; text: string | JSX.Element; className?: string }> = [];
  
  // Pending Charts Section
  if (pending.length > 0) {
    details.push({
      icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      text: (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs font-medium">Pending:</span>
          {pending.map((chart, idx) => (
            <span key={idx} className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)}`}>
              {chart.channel}
            </span>
          ))}
        </div>
      )
    });
  }
  
  // Downloaded Charts Section
  if (downloaded.length > 0) {
    details.push({
      icon: <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      text: (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs font-medium">Downloaded:</span>
          {downloaded.map((chart, idx) => (
            <span key={idx} className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)}`}>
              {chart.channel}
            </span>
          ))}
        </div>
      ),
      className: 'text-green-600 dark:text-green-400'
    });
  }
  
  return details;
})(),
```

## Visual Design

### Channel Badge Colors

| Channel | Color Scheme | Tailwind Classes |
|---------|--------------|------------------|
| COW | Blue | `bg-blue-100 text-blue-800` |
| BUF | Purple | `bg-purple-100 text-purple-800` |
| MIX | Green | `bg-green-100 text-green-800` |

### Icons

| Icon | Purpose | When Shown |
|------|---------|------------|
| 🕐 Clock | Pending charts | When there are charts not yet downloaded |
| ⬇️ Download | Downloaded charts | When machine has downloaded charts |

### Layout

The rate chart information appears in the machine card between the installation date and password status:

```
┌────────────────────────────────────────┐
│ 🔧 Machine ID            [Status Badge]│
│                                         │
│ 📍 Location                            │
│ 👤 Operator Name                       │
│ 📞 Contact Phone                       │
│ 📅 Installed: 01/15/2025              │
│ 🕐 Pending: [COW] [BUF]               │ ← NEW
│ ⬇️ Downloaded: [MIX]                   │ ← NEW
│ 🔑 Password Status                     │
└────────────────────────────────────────┘
```

## Data Flow

1. **Machine Page Loads** → Calls `/api/user/machine`
2. **API Executes Query** → Joins machines, societies, rate_charts, rate_chart_download_history
3. **API Returns Data** → Includes `chartDetails` concatenated string
4. **Frontend Parses** → `parseChartDetails()` splits into pending/downloaded arrays
5. **UI Renders** → Shows channel badges with appropriate colors and icons

## Example Scenarios

### Scenario 1: Machine with No Charts
```
Society: ABC Dairy
Active Charts: 0
Result: No rate chart sections shown
```

### Scenario 2: Machine with Pending Charts
```
Society: XYZ Dairy
Active Charts: 2 (COW, BUF)
Download History: None
Result: Shows "Pending: COW BUF"
```

### Scenario 3: Machine with Downloaded Charts
```
Society: XYZ Dairy
Active Charts: 2 (COW, BUF)
Download History: COW downloaded
Result: 
  - "Pending: BUF"
  - "Downloaded: COW"
```

### Scenario 4: Machine with All Charts Downloaded
```
Society: XYZ Dairy
Active Charts: 3 (COW, BUF, MIX)
Download History: All downloaded
Result: Shows "Downloaded: COW BUF MIX"
```

## Database Dependencies

### Tables Used
1. **machines** - Machine records
2. **societies** - Society information
3. **rate_charts** - Chart metadata (status column for admin control)
4. **rate_chart_download_history** - Per-machine download tracking

### Key Relationships
```
machines.society_id → societies.id
rate_charts.society_id → societies.id
rate_chart_download_history.machine_id → machines.id
rate_chart_download_history.rate_chart_id → rate_charts.id
```

## Testing Guide

### Manual Testing Steps

1. **No Charts Scenario**
   - Create a machine in a society with no active rate charts
   - Verify no rate chart sections appear

2. **Pending Charts Scenario**
   - Upload and assign rate charts to a society
   - Create a machine in that society
   - Verify "Pending" section appears with correct channels

3. **Downloaded Charts Scenario**
   - Use machine API to call `GetLatestPriceChart`
   - Then call `SavePriceChartUpdationHistory`
   - Refresh machine management
   - Verify "Downloaded" section appears

4. **Mixed Scenario**
   - Assign multiple charts (COW, BUF, MIX)
   - Download only one channel
   - Verify both "Pending" and "Downloaded" sections appear

5. **Multiple Machines**
   - Create multiple machines in the same society
   - Download different charts on each machine
   - Verify each machine shows independent status

### API Testing

**Test Query:**
```bash
# Get single machine with chart details
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/user/machine?id=1"

# Expected response includes:
{
  "success": true,
  "data": {
    "id": 1,
    "machineId": "M2232",
    "activeChartsCount": 2,
    "chartDetails": "COW:price_chart_cow.csv:pending|||BUF:price_chart_buf.csv:downloaded"
  }
}
```

## Performance Considerations

### Query Optimization
- Uses subqueries to fetch chart data without affecting main query performance
- LEFT JOIN ensures machines without charts still return results
- DISTINCT in GROUP_CONCAT prevents duplicate entries
- Indexes on `rate_chart_download_history(machine_id, rate_chart_id)` improve join performance

### Frontend Optimization
- Parsing happens only once per machine
- Conditional rendering (only show sections that have data)
- Memoization could be added if performance issues arise

## Related Documentation

- [Rate Chart Database Structure](./RATE_CHART_DATABASE_STRUCTURE.md)
- [Rate Chart Display Feature](./RATE_CHART_MACHINE_DISPLAY.md)
- [DB Key API Structure](./DB_KEY_API_STRUCTURE.md)
- [Machine Management Implementation](../04-features/MACHINE_MANAGEMENT_IMPLEMENTATION.md)

## Migration Notes

### Database Migrations Applied
- `20251115000001-add-status-to-rate-charts.js` - Added status column
- `20251115000002-create-rate-chart-download-history.js` - Created download history table

### No Breaking Changes
- Existing functionality remains unchanged
- Additional fields are optional
- Backward compatible with machines created before this feature

## Future Enhancements

1. **Click to View Details** - Show full chart information in a modal
2. **Download Timestamp** - Display when chart was downloaded
3. **Quick Sync Button** - Trigger chart download directly from UI
4. **Chart Statistics** - Show distribution of chart downloads across machines
5. **Notifications** - Alert when new charts are available
6. **Export Report** - Generate report of chart download status across all machines

## Troubleshooting

### Issue: Chart details not showing
**Possible Causes:**
- No active rate charts for the society
- Database migration not run
- API query error

**Solution:**
1. Check rate_charts table for active charts (status = 1)
2. Verify rate_chart_download_history table exists
3. Check browser console for API errors

### Issue: Incorrect download status
**Possible Causes:**
- Download history not recorded
- SavePriceChartUpdationHistory not called

**Solution:**
1. Verify SavePriceChartUpdationHistory endpoint is working
2. Check rate_chart_download_history table for records
3. Ensure machine ID matches in download history

### Issue: Channel colors not showing
**Possible Causes:**
- Tailwind classes not loading
- Dark mode class conflicts

**Solution:**
1. Verify Tailwind CSS is properly configured
2. Check browser dev tools for missing CSS classes
3. Test in both light and dark modes

---

**Implementation Status:** ✅ Complete  
**Production Ready:** Yes  
**Documentation:** Complete  
**Testing:** Manual testing recommended
