# BMC vs Society Comparison Integration

## Component Created
✅ **BmcVsSocietyComparison.tsx** - Compares BMC Collections with Society Dispatches

## What It Does
- Fetches BMC collections from `/api/user/reports/bmc-collections` (machine-level data)
- Fetches Society dispatches from `/api/user/reports/dispatches` (society-level data)
- Matches BMC farmer_id with Society society_id
- Shows weighted averages for 7 metrics
- Professional CSV/PDF export with Poornasree branding

## Integration Steps for reports/page.tsx

### 1. Import Added ✅
```typescript
import BmcVsSocietyComparison from '@/components/reports/BmcVsSocietyComparison';
```

### 2. Comparison Type Updated ✅
```typescript
const [comparisonType, setComparisonType] = useState<'...' | 'bmc-society'>('collection-collection');
```

### 3. Add Handler in renderContent() (NEEDS TO BE ADDED)
Add this BEFORE "// Comparison mode with Society" comment:

```typescript
// Special comparison view for BMC vs Society
if (comparisonMode && reportSource === 'bmc' && comparisonType === 'bmc-society') {
  const dates = getComparisonDates();
  
  return (
    <BmcVsSocietyComparison 
      key={`bmc-society-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
      dateRange={dates.current}
      dairyFilter={comparisonDairyFilter}
      bmcFilter={comparisonBmcFilter}
      onDairyChange={setComparisonDairyFilter}
      onBmcChange={setComparisonBmcFilter}
    />
  );
}
```

### 4. Add BMC Comparison UI (NEEDS TO BE ADDED)
In the comparison mode UI section, add BMC-specific comparison selector with "BMC vs Society" button.

The button should be added alongside:
- Collection vs Collection
- Collection vs Dispatch  
- Dispatch vs Dispatch
- Sales vs Sales
- **BMC vs Society** (NEW)

## File Location
`p:/psr-cloud-v2/src/components/reports/BmcVsSocietyComparison.tsx`

## Status
- ✅ Component created
- ✅ Import added
- ✅ Type updated
- ⚠️ Handler needs to be added to renderContent()
- ⚠️ UI button needs to be added to comparison selector
