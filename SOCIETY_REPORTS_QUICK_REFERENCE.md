# Society Collection vs Dispatch - Quick Reference Guide

## 📊 Overview

The PSR Cloud V2 system provides three types of comparison reports for milk collection and dispatch operations:

1. **Collection Comparison** - Compare collection data across time periods
2. **Dispatch Comparison** - Compare dispatch data across time periods
3. **Collection vs Dispatch** - Compare collection against dispatch in same period

---

## 🔑 Key Concepts

### Weighted Averages
All quality metrics (FAT, SNF, CLR) use **quantity-weighted averages**:

```
Weighted FAT = Σ(FAT% × Quantity) / Total Quantity
```

**Why?** A 100L sample with 4% FAT should have more weight than a 1L sample with 5% FAT.

### Data Sources

| Report Type | Data Source | Date Field | CLR Field |
|-------------|-------------|------------|-----------|
| Collection | `milk_collections` | `collection_date` | `clr_value` |
| Dispatch | `milk_dispatches` | `dispatch_date` | `clr_value` |

---

## 📈 Report Types Explained

### 1. Collection Comparison
**Purpose**: Track collection trends over time

**Example Use Cases**:
- Compare January vs December collections
- Year-over-year growth analysis
- Seasonal pattern identification

**Key Metrics**:
- Total Collections (count)
- Total Quantity (liters)
- Weighted FAT, SNF, CLR
- Total Amount (₹)
- Average Rate (₹/L)

### 2. Dispatch Comparison
**Purpose**: Track dispatch trends over time

**Example Use Cases**:
- Monitor supply chain efficiency
- Track capacity utilization
- Identify dispatch patterns

**Key Metrics**: Same as Collection Comparison

### 3. Collection vs Dispatch Comparison
**Purpose**: Reconcile collection and dispatch in same period

**Example Use Cases**:
- Daily inventory reconciliation
- Loss/wastage detection
- Storage management
- Quality control verification

**Key Insight**:
```
Difference = Collection - Dispatch

Positive: More collected than dispatched (storage/loss)
Negative: More dispatched than collected (using stored milk)
Zero: Perfect balance
```

---

## 🎯 Visual Components

### 1. Comparison Summary Table
Shows side-by-side comparison with:
- Current period data
- Previous period data (if applicable)
- Difference with % change
- Color indicators (🟢 green = improvement, 🔴 red = decline)

### 2. Day-by-Day Breakdown
Appears when date range spans multiple days:
- Daily metrics for each date
- Total/Average row at bottom
- Helps identify daily patterns

### 3. Radar Charts
Visual comparison of normalized metrics (0-100 scale):
- Individual charts for each period
- Overlay chart showing both periods
- Easy to spot strengths/weaknesses

### 4. Area Charts
Daily trend visualization:
- All metrics on same 0-100 scale
- Interactive tooltips with actual values
- Color-coded for each metric

---

## 🔍 Filter System

### Hierarchical Structure
```
Dairy (Level 1)
  └── BMC (Level 2)
      └── Society (Level 3)
```

### Filter Behavior
1. **Select Dairy** → Shows only BMCs under that dairy
2. **Select BMC** → Shows only societies under that BMC  
3. **Select Society** → Shows only data for that society

### Reset Logic
- Changing Dairy → Resets BMC and Society
- Changing BMC → Resets Society
- Filters cascade down the hierarchy

---

## 📤 Export Options

### CSV Export
- Plain text format
- Includes all data tables
- Filter information included
- Easy to open in Excel

### PDF Export
- Professional formatting
- Company logo header
- Color-coded tables
- Landscape orientation
- Ready for printing/sharing

---

## 💡 Common Use Cases

### Monthly Performance Review
```
1. Select "Monthly" period
2. Choose current month vs previous month
3. Review comparison summary
4. Export PDF for records
```

### Daily Reconciliation
```
1. Select "Daily" period
2. Choose today's date
3. View Collection vs Dispatch
4. Investigate any discrepancies
```

### Quality Trend Analysis
```
1. Select 7-day date range
2. View day-by-day breakdown
3. Analyze area chart trends
4. Compare with previous week
```

### Society Performance Comparison
```
1. Select BMC filter
2. Run report for Society A
3. Export data
4. Change to Society B
5. Compare results
```

---

## 🔢 Key Calculations

### Weighted Average
```typescript
weightedMetric = Σ(metric × quantity) / Σ(quantity)
```

### Percentage Change
```typescript
percentChange = ((current - previous) / previous) × 100
```

### Normalization (for charts)
```typescript
normalized = ((value - min) / (max - min)) × 100
```

### Average Rate
```typescript
avgRate = totalAmount / totalQuantity
```

---

## ⚠️ Important Notes

### Data Limits
- API returns maximum 1000 records
- Use filters to narrow down data
- Recent records shown first

### Field Differences
- Collections have `farmer_id` and `farmeruid`
- Dispatches are society-level aggregates
- Both use `clr_value` for CLR metric

### Performance Tips
- Apply filters before generating reports
- Use date ranges wisely (avoid very large ranges)
- Export data for offline analysis

---

## 🎨 Color Coding

### Difference Indicators
- 🟢 **Green** with ↑: Positive change (improvement)
- 🔴 **Red** with ↓: Negative change (decline)
- ⚪ **Gray** with −: No change

### Chart Colors
- **Emerald Green**: Quantity
- **Blue**: Amount
- **Amber**: FAT %
- **Purple**: SNF %
- **Pink**: CLR
- **Cyan**: Rate

---

## 📱 Access Path

```
Society Dashboard → Reports Tab → Collection/Dispatch/Comparison
```

---

## 🔗 Related Documentation

- [Full Analysis Document](./SOCIETY_COLLECTION_VS_DISPATCH_ANALYSIS.md)
- [Main README](./README.md)
- [API Documentation](./DOCUMENTATION.md)

---

## 📞 Support

For questions or issues:
1. Check the full analysis document
2. Review the main documentation
3. Contact system administrator

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 2026  
**Status**: 🟢 Production Ready
