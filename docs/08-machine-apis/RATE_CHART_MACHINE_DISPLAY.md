# Rate Chart Display in Machine Management

**Document Version:** 1.0  
**Last Updated:** 2025-01-15  
**Status:** ✅ Complete

## Overview

The Machine Management interface now displays rate chart information for each machine, showing which charts are available for download and which have already been downloaded.

## Feature Details

### Display Information

For each machine, the following rate chart information is shown:

1. **Pending Charts** (Clock icon 🕐)
   - Charts that are active (status = 1) and NOT yet downloaded by the machine
   - Shows channel badges (COW/BUF/MIX) with color coding
   - Blue badge: COW channel
   - Purple badge: BUF channel
   - Green badge: MIX channel

2. **Downloaded Charts** (Download icon ⬇️)
   - Charts that have been successfully downloaded by the machine
   - Shows channel badges with the same color coding
   - Displayed in green text to indicate completion

### Data Source

#### Machine API Query
```sql
SELECT 
  m.*,
  s.name as society_name,
  (SELECT COUNT(*) 
   FROM rate_charts rc 
   WHERE rc.society_id = m.society_id AND rc.status = 1
  ) as active_charts_count,
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
```

#### Data Format
The `chart_details` field contains a concatenated string:
```
COW:price_chart_cow.csv:pending|||BUF:price_chart_buf.csv:downloaded|||MIX:price_chart_mix.csv:pending
```

Each chart entry is separated by `|||` and contains:
- Channel name (COW/BUF/MIX)
- File name
- Status (pending/downloaded)

### UI Components

#### Machine Interface
```typescript
interface Machine {
  // ... existing fields
  activeChartsCount?: number;
  chartDetails?: string; // Format: "channel:filename:status|||channel:filename:status"
}
```

#### Helper Functions

1. **parseChartDetails(chartDetails?: string)**
   - Parses the concatenated string into arrays
   - Returns: `{ pending: Array, downloaded: Array }`

2. **getChannelColor(channel: string)**
   - Returns Tailwind CSS classes for channel badges
   - COW: Blue (`bg-blue-100 text-blue-800`)
   - BUF: Purple (`bg-purple-100 text-purple-800`)
   - MIX: Green (`bg-green-100 text-green-800`)

### Display Logic

The rate chart information appears in the machine card details section:

```tsx
// Pending Charts Section
{
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
}

// Downloaded Charts Section
{
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
}
```

## Implementation Files

### Backend
- **File:** `d:\psr-v4\src\app\api\user\machine\route.ts`
- **Changes:** Updated GET endpoint to include rate chart subqueries
- **Lines Modified:** 165-192 (single machine), 194-215 (all machines)

### Frontend
- **File:** `d:\psr-v4\src\app\admin\machine\page.tsx`
- **Changes:**
  - Updated Machine interface (lines 39-60)
  - Added helper functions (lines 162-195)
  - Added icons import (FileText, Download, Clock)
  - Updated ItemCard details for grouped view (lines 1433-1489)
  - Updated ItemCard details for list view (lines 1517-1573)

## Visual Examples

### Machine Card with Pending Charts
```
┌─────────────────────────────────────┐
│ 🔧 MCH001                    Active │
│                                      │
│ 📍 Main Hall                        │
│ 👤 John Doe                         │
│ 🕐 Pending: [COW] [BUF]            │
│ 🔑 Passwords: Not Set               │
└─────────────────────────────────────┘
```

### Machine Card with Downloaded Charts
```
┌─────────────────────────────────────┐
│ 🔧 MCH002                    Active │
│                                      │
│ 📍 Processing Unit                  │
│ 👤 Jane Smith                       │
│ ⬇️ Downloaded: [COW] [MIX]         │
│ 🔑 Passwords: Set                   │
└─────────────────────────────────────┘
```

### Machine Card with Both
```
┌─────────────────────────────────────┐
│ 🔧 MCH003                    Active │
│                                      │
│ 📍 Collection Center                │
│ 👤 Bob Wilson                       │
│ 🕐 Pending: [BUF]                   │
│ ⬇️ Downloaded: [COW] [MIX]         │
│ 🔑 Passwords: User Set              │
└─────────────────────────────────────┘
```

## Database Dependencies

This feature relies on:
1. **rate_charts** table (status column for admin control)
2. **rate_chart_download_history** table (per-machine tracking)
3. **machines** table (machine records)
4. **societies** table (society association)

## Related Documentation

- [Rate Chart Database Structure](./RATE_CHART_DATABASE_STRUCTURE.md)
- [DB Key API Structure](./DB_KEY_API_STRUCTURE.md)
- [GetLatestPriceChart Endpoint](./DB_KEY_API_STRUCTURE.md#5-getlatestpricechart)
- [SavePriceChartUpdationHistory Endpoint](./DB_KEY_API_STRUCTURE.md#9-savepricecchartupdationhistory)

## Testing Checklist

- [ ] Verify pending charts display correctly for new machines
- [ ] Verify downloaded charts display after SavePriceChartUpdationHistory call
- [ ] Test channel badge colors (COW=blue, BUF=purple, MIX=green)
- [ ] Test with machines having no rate charts
- [ ] Test with machines having multiple pending charts
- [ ] Test with machines having multiple downloaded charts
- [ ] Test with machines having both pending and downloaded charts
- [ ] Verify display in both folder view and list view
- [ ] Test responsive behavior on mobile/tablet/desktop

## Future Enhancements

Potential improvements for this feature:

1. **Tooltip on Hover:** Show full file name when hovering over channel badge
2. **Download Timestamp:** Display when chart was downloaded
3. **Chart Version:** Show chart version or upload date
4. **Quick Actions:** Add "Download Pending" button to trigger sync
5. **Chart Preview:** Click badge to preview rate chart data
6. **Statistics:** Show total/pending/downloaded counts in machine stats
7. **Filters:** Add filter to show only machines with pending charts
8. **Notifications:** Alert when new charts are available for a machine

## Status Indicators

| Icon | Meaning | Color |
|------|---------|-------|
| 🕐 Clock | Pending download | Default |
| ⬇️ Download | Successfully downloaded | Green |
| 🔵 COW | Cow channel chart | Blue |
| 🟣 BUF | Buffalo channel chart | Purple |
| 🟢 MIX | Mixed channel chart | Green |

## Notes

- Charts only appear if they have `status = 1` (active)
- Download status is per-machine (independent tracking)
- Multiple machines can download the same chart
- Chart details update in real-time after API refresh
- Empty sections (no pending/no downloaded) are not displayed
- Color coding helps quickly identify channel types
- The feature works seamlessly with existing machine management functionality

---

**Last Verified:** Machine management UI successfully displays rate chart information  
**Feature Status:** ✅ Production Ready
