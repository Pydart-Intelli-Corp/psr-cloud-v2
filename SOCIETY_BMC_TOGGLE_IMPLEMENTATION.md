# Society/BMC Reports Toggle - Implementation Summary

## Overview
Added toggle switch functionality to switch between Society and BMC reports for Collection and Dispatch report types. Sales reports remain unchanged as they don't have BMC-specific data.

## Changes Made

### 1. New API Endpoints

#### `/api/user/reports/bmc-collections/route.ts`
- Fetches collection records from machines assigned to BMCs (`m.bmc_id IS NOT NULL`)
- Joins with BMC, dairy, society, and farmer tables
- Returns same data structure as society collections

#### `/api/user/reports/bmc-dispatches/route.ts`
- Fetches dispatch records from machines assigned to BMCs (`m.bmc_id IS NOT NULL`)
- Joins with BMC, dairy, and society tables
- Returns same data structure as society dispatches

### 2. Frontend Updates

#### `src/app/admin/reports/page.tsx`
**Added:**
- `reportSource` state: `'society' | 'bmc'` (default: 'society')
- Society/BMC toggle switch UI (only visible for Collection and Dispatch tabs)
- Icons: `Users` for Society, `Building2` for BMC
- Dynamic key for report components: `${activeTab}-${reportSource}` to force re-render on toggle

**UI Layout:**
```
[Society/BMC Toggle] [Collection | Dispatch | Sales Toggle]
```

#### `src/components/reports/CollectionReports.tsx`
**Added:**
- `reportSource` prop to component interface
- Dynamic API endpoint selection in `fetchData`:
  - Society: `/api/user/reports/collections`
  - BMC: `/api/user/reports/bmc-collections`
- Added `reportSource` to `fetchData` dependency array

#### `src/components/reports/DispatchReports.tsx`
**Added:**
- `reportSource` prop to component interface
- Dynamic API endpoint selection in `fetchData`:
  - Society: `/api/user/reports/dispatches`
  - BMC: `/api/user/reports/bmc-dispatches`
- Added `reportSource` to `fetchData` dependency array

## Database Query Logic

### BMC Collections Query
```sql
SELECT mc.*, m.machine_id, b.name as bmc_name, ...
FROM milk_collections mc
INNER JOIN machines m ON mc.machine_id = m.machine_id
LEFT JOIN bmcs b ON m.bmc_id = b.id
WHERE m.bmc_id IS NOT NULL
```

### BMC Dispatches Query
```sql
SELECT md.*, m.machine_id, b.name as bmc_name, ...
FROM milk_dispatches md
INNER JOIN machines m ON md.machine_id = m.machine_id
LEFT JOIN bmcs b ON m.bmc_id = b.id
WHERE m.bmc_id IS NOT NULL
```

## Key Features Preserved

✅ All filtering capabilities (date, shift, channel, dairy, BMC, society, machine)
✅ Statistics calculation (weighted averages for collections/dispatches)
✅ Export to CSV/PDF with column selection
✅ Email reports with attachments
✅ Bulk delete functionality
✅ Real-time auto-refresh (1-second interval)
✅ Search highlighting
✅ Dark mode support

## User Experience

1. **Toggle Visibility**: Society/BMC toggle only appears for Collection and Dispatch tabs
2. **Default State**: Always starts with "Society" selected
3. **Seamless Switching**: Component re-renders with new data when toggling
4. **Visual Feedback**: Active toggle button has white background with shadow
5. **Responsive Design**: Toggle adapts to mobile screens

## Technical Notes

- **Data Isolation**: BMC reports only show data from machines with `bmc_id` set
- **Schema Consistency**: Both Society and BMC reports use the same data structure
- **Performance**: Same 1000-record limit and auto-refresh behavior
- **Multi-tenant**: Respects admin schema isolation via JWT token

## Testing Checklist

- [ ] Toggle switches between Society and BMC for Collection reports
- [ ] Toggle switches between Society and BMC for Dispatch reports
- [ ] Toggle is hidden for Sales reports
- [ ] BMC collections show only BMC machine data
- [ ] BMC dispatches show only BMC machine data
- [ ] All filters work correctly in BMC mode
- [ ] Export/Email functions work in BMC mode
- [ ] Statistics calculate correctly in BMC mode
- [ ] Auto-refresh works in BMC mode
- [ ] Toggle state persists when switching between Collection/Dispatch tabs

## Files Modified

1. `src/app/api/user/reports/bmc-collections/route.ts` (NEW)
2. `src/app/api/user/reports/bmc-dispatches/route.ts` (NEW)
3. `src/app/admin/reports/page.tsx` (MODIFIED)
4. `src/components/reports/CollectionReports.tsx` (MODIFIED)
5. `src/components/reports/DispatchReports.tsx` (MODIFIED - already had changes)

## Future Enhancements

- Add BMC-specific analytics/insights
- Add BMC performance comparison charts
- Add BMC-level aggregation reports
- Persist toggle state in URL parameters for deep linking
