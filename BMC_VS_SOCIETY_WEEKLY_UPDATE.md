# BMC vs Society Comparison - Weekly/Monthly/Yearly Support Update

## 📋 Summary
Updated the BMC vs Society comparison component to support **weekly, monthly, and yearly** comparisons, matching the functionality of the Collection vs Dispatch comparison.

---

## ✅ Changes Made

### 1. **Updated Interface** (`BmcVsSocietyComparison.tsx`)
Added `timePeriod` prop to support different time periods:

```typescript
interface BmcVsSocietyComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
  timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // ✨ NEW
}
```

### 2. **Weekly Breakdown Logic**
Added weekly grouping for BMC and Society data:

```typescript
// Weekly breakdown for BMC
let currentWeekStart = new Date(startDate);
currentWeekStart.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday

while (currentWeekStart <= endDate) {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  
  const weekBmcRecords = bmcRecords.filter((r: any) => {
    const recordDate = r.collection_date || r.date;
    return recordDate >= currentWeekStart.toISOString().split('T')[0] && 
           recordDate <= weekEnd.toISOString().split('T')[0];
  });
  
  weeklyBmcBreakdown.push({
    date: `Week ${currentWeekStart.toISOString().split('T')[0]}`,
    data: calculateStats(weekBmcRecords)
  });
  
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
}
```

### 3. **Monthly Breakdown Logic**
Added monthly grouping:

```typescript
// Monthly breakdown for BMC
let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

while (currentMonth <= endDate) {
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const monthBmcRecords = bmcRecords.filter((r: any) => {
    const recordDate = r.collection_date || r.date;
    return recordDate >= currentMonth.toISOString().split('T')[0] && 
           recordDate <= monthEnd.toISOString().split('T')[0];
  });
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthlyBmcBreakdown.push({
    date: `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
    data: calculateStats(monthBmcRecords)
  });
  
  currentMonth.setMonth(currentMonth.getMonth() + 1);
}
```

### 4. **Yearly Breakdown Logic**
Added yearly grouping:

```typescript
// Yearly breakdown for BMC
const startYear = new Date(effectiveFrom).getFullYear();
const endYear = new Date(effectiveTo).getFullYear();

for (let year = startYear; year <= endYear; year++) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  
  const yearBmcRecords = bmcRecords.filter((r: any) => {
    const recordDate = r.collection_date || r.date;
    return recordDate >= yearStart.toISOString().split('T')[0] && 
           recordDate <= yearEnd.toISOString().split('T')[0];
  });
  
  yearlyBmcBreakdown.push({
    date: `${year}`,
    data: calculateStats(yearBmcRecords)
  });
}
```

### 5. **Updated UI Labels**
- Chart title now shows: "Daily/Weekly/Monthly/Yearly Variations - BMC vs Society"
- X-axis label adapts: "Date (MM/DD)" / "Week" / "Month" / "Year"
- Note text includes time period: "Data is grouped by day/week/month/year"

### 6. **Updated Reports Page** (`page.tsx`)
Added `timePeriod` prop when rendering BmcVsSocietyComparison:

```typescript
<BmcVsSocietyComparison 
  key={`bmc-society-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
  dateRange={dates.current}
  dairyFilter={comparisonDairyFilter}
  bmcFilter={comparisonBmcFilter}
  societyFilter={comparisonSocietyFilter}
  onDairyChange={setComparisonDairyFilter}
  onBmcChange={setComparisonBmcFilter}
  onSocietyChange={setComparisonSocietyFilter}
  reportSource={reportSource}
  timePeriod={timePeriod} // ✨ NEW
/>
```

---

## 🎯 Features Now Available

### **Daily Comparison** (Existing)
- Shows day-by-day breakdown
- Date format: "01/15", "01/16", etc.
- Works when date range is selected

### **Weekly Comparison** (NEW)
- Groups data by week (Sunday to Saturday)
- Date format: "Week 2025-01-12"
- Aggregates all records within each week

### **Monthly Comparison** (NEW)
- Groups data by month
- Date format: "Jan 2025", "Feb 2025"
- Aggregates all records within each month

### **Yearly Comparison** (NEW)
- Groups data by year
- Date format: "2024", "2025"
- Aggregates all records within each year

---

## 📊 How It Works

1. **User selects time period** in the reports page dropdown (Daily/Weekly/Monthly/Yearly)
2. **User selects date range** using custom date inputs
3. **Component calculates breakdown** based on selected time period:
   - **Daily**: Loops through each day in range
   - **Weekly**: Loops through each week (Sunday-Saturday)
   - **Monthly**: Loops through each month
   - **Yearly**: Loops through each year
4. **Data is aggregated** for each period using `calculateStats()`
5. **Charts and tables** display the breakdown with appropriate labels

---

## 🎨 Visual Updates

### **Table Headers**
- Date column shows appropriate format based on time period
- Type column shows "BMC" vs "Society"
- All metrics displayed with color coding

### **Area Chart**
- X-axis label adapts to time period
- Normalized 0-100 scale for comparison
- Multiple parameters shown with gradients
- Tooltip shows actual values

### **Legend**
- Shows value ranges for each metric
- Color-coded badges for easy identification

---

## 🔄 Comparison with Collection vs Dispatch

The BMC vs Society comparison now has **identical functionality** to Collection vs Dispatch:

| Feature | Collection vs Dispatch | BMC vs Society |
|---------|----------------------|----------------|
| Daily breakdown | ✅ | ✅ |
| Weekly breakdown | ✅ | ✅ |
| Monthly breakdown | ✅ | ✅ |
| Yearly breakdown | ✅ | ✅ |
| Day-by-day table | ✅ | ✅ |
| Area chart visualization | ✅ | ✅ |
| Radar chart (summary) | ✅ | ✅ |
| CSV/PDF export | ✅ | ✅ |
| Filter support | ✅ | ✅ |

---

## 🧪 Testing Checklist

- [ ] Daily comparison works with date range
- [ ] Weekly comparison groups by week correctly
- [ ] Monthly comparison groups by month correctly
- [ ] Yearly comparison groups by year correctly
- [ ] Chart labels update based on time period
- [ ] Table displays correct date format
- [ ] CSV export includes correct breakdown
- [ ] PDF export includes correct breakdown
- [ ] Filters work with all time periods
- [ ] Radar chart shows when no breakdown available

---

## 📝 Notes

1. **Week starts on Sunday** (day 0) following JavaScript Date convention
2. **Month names** use abbreviated format (Jan, Feb, Mar, etc.)
3. **Year format** is simple 4-digit year (2024, 2025)
4. **Data aggregation** uses weighted averages for FAT, SNF, CLR, and Rate
5. **Empty periods** show zero values in breakdown

---

## 🚀 Usage Example

```typescript
// In reports page, user selects:
// - Time Period: Weekly
// - Date Range: 2025-01-01 to 2025-01-31
// - BMC: BMC-001
// - Society: SOC-001

// Component will show:
// Week 2024-12-29 (Dec 29 - Jan 4)
// Week 2025-01-05 (Jan 5 - Jan 11)
// Week 2025-01-12 (Jan 12 - Jan 18)
// Week 2025-01-19 (Jan 19 - Jan 25)
// Week 2025-01-26 (Jan 26 - Feb 1)

// Each week shows aggregated BMC collection vs Society dispatch data
```

---

## ✨ Benefits

1. **Consistent UX**: Same behavior as Collection vs Dispatch comparison
2. **Flexible Analysis**: Users can analyze data at different time granularities
3. **Better Insights**: Weekly/monthly trends are easier to spot than daily noise
4. **Scalable**: Works with large date ranges without overwhelming the UI
5. **Professional**: Matches industry-standard reporting patterns

---

**Updated by**: Amazon Q Developer  
**Date**: January 2025  
**Status**: ✅ Complete and Ready for Testing
