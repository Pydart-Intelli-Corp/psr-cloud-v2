# BMC Comparison System - Detailed Study

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Data Flow](#data-flow)
5. [API Endpoints](#api-endpoints)
6. [Comparison Types](#comparison-types)
7. [Key Features](#key-features)
8. [Implementation Details](#implementation-details)

---

## 🎯 Overview

The BMC Comparison system is a sophisticated reporting feature that allows administrators to compare milk collection, dispatch, and sales data at the BMC (Bulk Milk Cooling Center) level. Unlike Society reports which track individual farmer transactions, BMC reports aggregate data from machines directly connected to BMCs.

### Purpose
- Compare BMC-level data across different time periods
- Validate data consistency between BMC collections and Society dispatches
- Track performance trends at the BMC level
- Identify discrepancies in milk quantity and quality metrics

### Key Difference: BMC vs Society Reports
- **Society Reports**: Track farmer-level transactions through societies
- **BMC Reports**: Track machine-level collections directly at BMC facilities
- **BMC vs Society Comparison**: Validates data consistency between both sources

---

## 🏗️ Architecture

### Component Hierarchy
```
Reports Page (page.tsx)
├── Report Source Toggle (Society/BMC)
├── Comparison Mode Toggle
└── Comparison Components
    ├── BmcComparisonSummary (Collection vs Collection)
    ├── BmcCollectionDispatchComparison (Collection vs Dispatch)
    ├── BmcVsSocietyComparison (BMC vs Society)
    ├── DispatchComparison (Dispatch vs Dispatch - reused)
    └── SalesComparison (Sales vs Sales - reused)
```

### State Management
```typescript
// Report source selection
const [reportSource, setReportSource] = useState<'society' | 'bmc'>('society');

// Comparison mode
const [comparisonMode, setComparisonMode] = useState(false);

// Comparison type
const [comparisonType, setComparisonType] = useState<
  'collection-collection' | 
  'collection-dispatch' | 
  'dispatch-dispatch' | 
  'sales-sales' | 
  'bmc-society'
>('collection-collection');

// Time period selection
const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

// Filter states
const [comparisonDairyFilter, setComparisonDairyFilter] = useState<string[]>([]);
const [comparisonBmcFilter, setComparisonBmcFilter] = useState<string[]>([]);
const [comparisonSocietyFilter, setComparisonSocietyFilter] = useState<string[]>([]);
```

---

## 🧩 Components

### 1. BmcComparisonSummary.tsx
**Purpose**: Compare BMC collection data across two time periods

**Props**:
```typescript
interface BmcComparisonSummaryProps {
  currentDate: { from: string; to: string; label: string };
  previousDate: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
}
```

**Key Features**:
- NO society filter (BMC-level only)
- Fetches from `/api/user/reports/bmc-collections`
- Compares 7 metrics: Collections, Quantity, FAT, SNF, CLR, Amount, Rate
- Weighted average calculations
- CSV/PDF export with Poornasree branding

**Metrics Displayed**:
| Metric | Description | Calculation |
|--------|-------------|-------------|
| Total Collections | Count of records | `records.length` |
| Total Quantity (L) | Sum of milk quantity | `Σ(quantity)` |
| Weighted FAT (%) | Fat content weighted by quantity | `Σ(fat × quantity) / Σ(quantity)` |
| Weighted SNF (%) | Solids-Not-Fat weighted | `Σ(snf × quantity) / Σ(quantity)` |
| Weighted CLR | Corrected Lactometer Reading | `Σ(clr × quantity) / Σ(quantity)` |
| Total Amount (₹) | Sum of transaction amounts | `Σ(total_amount)` |
| Avg Rate (₹/L) | Average price per liter | `Total Amount / Total Quantity` |

---

### 2. BmcCollectionDispatchComparison.tsx
**Purpose**: Compare BMC collection vs dispatch for the same time period

**Props**:
```typescript
interface BmcCollectionDispatchComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
}
```

**Key Features**:
- Single time period (not comparing two periods)
- Fetches from both:
  - `/api/user/reports/bmc-collections`
  - `/api/user/reports/bmc-dispatches`
- Identifies discrepancies between collection and dispatch
- Useful for loss analysis and quality control

**Use Case**:
```
Scenario: Quality control manager wants to check for losses
- Collection: 1000L collected at BMC
- Dispatch: 980L dispatched from BMC
- Difference: 20L loss (2% loss rate)
```

---

### 3. BmcVsSocietyComparison.tsx
**Purpose**: Compare BMC collection data vs Society dispatch data

**Props**:
```typescript
interface BmcVsSocietyComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
}
```

**Key Features**:
- Includes society filter (unique to this component)
- Fetches from:
  - `/api/user/reports/bmc-collections` (BMC data)
  - `/api/user/reports/dispatches` (Society data)
- Validates data consistency across sources
- Matches BMC farmer_id with Society society_id

**Data Matching Logic**:
```typescript
// BMC side: Filter by dairy_id and bmc_id
if (dairyFilter.length > 0) {
  // Filter by selected dairies
}
if (bmcFilter.length > 0) {
  // Filter by selected BMCs
}

// Society side: Additional society filter
if (societyFilter.length > 0) {
  // Filter by selected societies
}
```

---

### 4. Reused Components

#### DispatchComparison.tsx (BMC Mode)
- Used for BMC Dispatch vs Dispatch comparison
- Society filter hidden when in BMC mode
- Props: `societyFilter={[]}`, `onSocietyChange={() => {}}`

#### SalesComparison.tsx (BMC Mode)
- Used for BMC Sales vs Sales comparison
- Society filter hidden when in BMC mode
- Same prop pattern as DispatchComparison

---

## 🔄 Data Flow

### 1. User Interaction Flow
```
User clicks "Compare" button
    ↓
System checks reportSource
    ↓
If BMC mode → Show BMC selection dialog
    ↓
User selects BMC(s)
    ↓
Comparison mode activated
    ↓
User selects comparison type
    ↓
User selects time period (Daily/Weekly/Monthly/Yearly)
    ↓
Component fetches data
    ↓
Data filtered by selected BMCs
    ↓
Statistics calculated
    ↓
Results displayed with trends
```

### 2. Data Fetching Flow
```typescript
// Step 1: Fetch all records
const response = await fetch('/api/user/reports/bmc-collections', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const allRecords = await response.json();

// Step 2: Filter by date range
const filterRecords = (records, dateRange) => {
  return records.filter(r => {
    const recordDate = r.collection_date || r.date;
    if (recordDate < dateRange.from || recordDate > dateRange.to) return false;
    
    // Apply dairy filter
    if (dairyFilter.length > 0) {
      const selectedDairyIds = dairyFilter.map(id => 
        dairies.find(d => d.id.toString() === id)?.id
      ).filter(Boolean);
      if (!selectedDairyIds.includes(r.dairy_id)) return false;
    }
    
    // Apply BMC filter
    if (bmcFilter.length > 0) {
      const selectedBmcIds = bmcFilter.map(id => 
        bmcs.find(b => b.id.toString() === id)?.id
      ).filter(Boolean);
      if (!selectedBmcIds.includes(r.bmc_id)) return false;
    }
    
    return true;
  });
};

// Step 3: Calculate statistics
const stats = calculateStats(filteredRecords);
```

### 3. Statistics Calculation
```typescript
const calculateStats = (records: any[]): ComparisonData => {
  if (records.length === 0) {
    return { 
      totalRecords: 0, 
      totalQuantity: 0, 
      weightedFat: 0, 
      weightedSnf: 0, 
      weightedClr: 0, 
      totalAmount: 0, 
      averageRate: 0 
    };
  }

  const totalQuantity = records.reduce((sum, r) => 
    sum + (parseFloat(r.quantity) || 0), 0
  );
  
  const totalAmount = records.reduce((sum, r) => 
    sum + (parseFloat(r.total_amount) || 0), 0
  );
  
  const weightedFat = records.reduce((sum, r) => 
    sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
  ) / (totalQuantity || 1);
  
  const weightedSnf = records.reduce((sum, r) => 
    sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
  ) / (totalQuantity || 1);
  
  const weightedClr = records.reduce((sum, r) => 
    sum + ((parseFloat(r.clr_value || r.clr) || 0) * (parseFloat(r.quantity) || 0)), 0
  ) / (totalQuantity || 1);

  return {
    totalRecords: records.length,
    totalQuantity,
    weightedFat,
    weightedSnf,
    weightedClr,
    totalAmount,
    averageRate: totalAmount / (totalQuantity || 1)
  };
};
```

---

## 🌐 API Endpoints

### 1. BMC Collections API
**Endpoint**: `/api/user/reports/bmc-collections/route.ts`

**Query Logic**:
```sql
SELECT 
  mc.id,
  mc.farmer_id,
  COALESCE(s_farmer.name, 'No Name') as farmer_name,
  f.farmeruid as farmer_uid,
  mc.society_id,
  COALESCE(s.name, 'Direct BMC') as society_name,
  COALESCE(b.bmc_id, bmc_direct.bmc_id) as bmc_id,
  COALESCE(b.name, bmc_direct.name) as bmc_name,
  COALESCE(b.dairy_farm_id, bmc_direct.dairy_farm_id) as dairy_id,
  COALESCE(df.name, df_direct.name) as dairy_name,
  m.machine_id,
  mc.collection_date,
  mc.collection_time,
  mc.shift_type,
  mc.channel,
  mc.fat_percentage,
  mc.snf_percentage,
  mc.clr_value,
  mc.quantity,
  mc.rate_per_liter,
  mc.total_amount,
  mc.bonus,
  mc.machine_type,
  mc.machine_version,
  mc.created_at
FROM milk_collections mc
INNER JOIN machines m ON mc.machine_id = m.id
LEFT JOIN societies s ON mc.society_id = s.id
LEFT JOIN societies s_farmer ON s_farmer.society_id = mc.farmer_id
LEFT JOIN bmcs b ON s.bmc_id = b.id
LEFT JOIN bmcs bmc_direct ON m.bmc_id = bmc_direct.id
LEFT JOIN dairy_farms df ON b.dairy_farm_id = df.id
LEFT JOIN dairy_farms df_direct ON bmc_direct.dairy_farm_id = df_direct.id
LEFT JOIN farmers f ON f.farmer_id = mc.farmer_id AND f.society_id = mc.society_id
WHERE m.bmc_id IS NOT NULL
ORDER BY mc.collection_date DESC, mc.collection_time DESC
LIMIT 1000
```

**Key Points**:
- Filters records where `m.bmc_id IS NOT NULL` (BMC-connected machines only)
- Handles both direct BMC connections and society-based BMC connections
- Returns last 1000 records
- Includes farmer, society, BMC, and dairy information

### 2. BMC Dispatches API
**Endpoint**: `/api/user/reports/bmc-dispatches`
- Similar structure to bmc-collections
- Fetches dispatch records from BMC facilities

### 3. Society Dispatches API
**Endpoint**: `/api/user/reports/dispatches`
- Used in BmcVsSocietyComparison
- Fetches society-level dispatch records

---

## 📊 Comparison Types

### Type 1: Collection vs Collection (Time-based)
**Component**: `BmcComparisonSummary`

**Example**:
```
Current Period: This Week (Jan 12-18, 2025)
- Collections: 150
- Quantity: 1250.50 L
- FAT: 4.2%
- Amount: ₹45,000

Previous Period: Last Week (Jan 5-11, 2025)
- Collections: 140
- Quantity: 1180.00 L
- FAT: 4.0%
- Amount: ₹42,000

Difference:
- Collections: +10 (↑7.1%)
- Quantity: +70.5 L (↑6.0%)
- FAT: +0.2% (↑5.0%)
- Amount: +₹3,000 (↑7.1%)
```

### Type 2: Collection vs Dispatch (Same period)
**Component**: `BmcCollectionDispatchComparison`

**Example**:
```
Period: Today (Jan 15, 2025)

Collection:
- Records: 50
- Quantity: 500 L
- FAT: 4.5%

Dispatch:
- Records: 48
- Quantity: 490 L
- FAT: 4.4%

Difference:
- Records: +2 (↑4.2%)
- Quantity: +10 L (↑2.0%) ← Potential loss
- FAT: +0.1% (↑2.3%)
```

### Type 3: BMC vs Society (Data validation)
**Component**: `BmcVsSocietyComparison`

**Example**:
```
Period: This Month (Jan 2025)

BMC Collection (Machine data):
- Records: 1500
- Quantity: 15,000 L
- FAT: 4.3%

Society Dispatch (Society data):
- Records: 1480
- Quantity: 14,800 L
- FAT: 4.2%

Difference:
- Records: +20 (↑1.4%)
- Quantity: +200 L (↑1.4%) ← Data discrepancy
- FAT: +0.1% (↑2.4%)
```

### Type 4: Dispatch vs Dispatch (Time-based)
**Component**: `DispatchComparison` (BMC mode)

### Type 5: Sales vs Sales (Time-based)
**Component**: `SalesComparison` (BMC mode)

---

## ✨ Key Features

### 1. Weighted Average Calculations
All quality metrics use quantity-weighted averages for accuracy:

```typescript
// Simple average (WRONG)
averageFat = Σ(fat) / count

// Weighted average (CORRECT)
weightedFat = Σ(fat × quantity) / Σ(quantity)
```

**Why weighted?**
- A 100L batch with 5% FAT should have more influence than a 10L batch with 3% FAT
- Reflects true quality of total milk collected

### 2. Visual Trend Indicators
```typescript
const renderDifferenceCell = (current: number, previous: number, decimals: number = 2) => {
  const diff = current - previous;
  const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;
  const isPositive = diff > 0;
  const isNegative = diff < 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-bold ${
        isPositive ? 'text-green-600' : 
        isNegative ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {isPositive ? '+' : ''}{diff.toFixed(decimals)}
      </span>
      <div className="flex items-center gap-1">
        {isPositive && <TrendingUp className="w-3 h-3 text-green-600" />}
        {isNegative && <TrendingDown className="w-3 h-3 text-red-600" />}
        {!isPositive && !isNegative && <Minus className="w-3 h-3 text-gray-400" />}
        <span className={`text-xs ${
          isPositive ? 'text-green-600' : 
          isNegative ? 'text-red-600' : 
          'text-gray-500'
        }`}>
          {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
```

### 3. Export Functionality

#### CSV Export
```typescript
const csvContent = [
  'POORNASREE EQUIPMENTS - BMC Collection Comparison Report',
  'LactoConnect Milk Collection System',
  '',
  `Report Generated: ${currentDateTime}`,
  `Comparison Period: ${previousDate.label} vs ${currentDate.label}`,
  '',
  'COMPARISON DATA',
  '',
  'Metric,Total Collections,Total Quantity (L),...',
  `${currentDate.label},${currentData.totalCollections},...`,
  `${previousDate.label},${previousData.totalCollections},...`,
  `Difference,${diff},...`,
  '',
  'Thank you',
  'Poornasree Equipments'
].join('\n');
```

#### PDF Export
- Uses jsPDF and autoTable
- Includes Poornasree logo
- Professional formatting
- Landscape orientation for better table display

### 4. Hierarchical Filtering
```
Dairy Filter
    ↓
BMC Filter (filtered by selected dairies)
    ↓
Society Filter (filtered by selected BMCs) - only in BmcVsSocietyComparison
```

### 5. Time Period Selection
- **Daily**: Compare specific dates
- **Weekly**: Compare week ranges
- **Monthly**: Compare months
- **Yearly**: Compare years
- Custom date selection for each period type

---

## 🔧 Implementation Details

### Component Re-rendering Strategy
```typescript
// Unique keys ensure components re-render when time period changes
<BmcComparisonSummary 
  key={`bmc-collection-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
  currentDate={dates.current} 
  previousDate={dates.previous}
  // ... other props
/>
```

### Filter State Management
```typescript
// Separate filter states for comparison mode
const [comparisonDairyFilter, setComparisonDairyFilter] = useState<string[]>([]);
const [comparisonBmcFilter, setComparisonBmcFilter] = useState<string[]>([]);
const [comparisonSocietyFilter, setComparisonSocietyFilter] = useState<string[]>([]);
```

### BMC Selection Dialog
```typescript
// When entering BMC comparison mode, user must select BMCs
const handleComparisonToggle = () => {
  if (!comparisonMode && reportSource === 'bmc') {
    setTempBmcSelection(comparisonBmcFilter);
    setShowBmcDialog(true); // Show BMC selection dialog
  } else {
    setComparisonMode(!comparisonMode);
  }
};
```

### Date Range Calculation
```typescript
const getComparisonDates = () => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  if (timePeriod === 'daily') {
    const currentDate = customDate ? new Date(customDate) : today;
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    
    return {
      current: { 
        from: formatDate(currentDate), 
        to: formatDate(currentDate), 
        label: customDate ? formatDate(currentDate) : 'Today' 
      },
      previous: { 
        from: formatDate(previousDate), 
        to: formatDate(previousDate), 
        label: formatDate(previousDate)
      }
    };
  }
  // ... similar logic for weekly, monthly, yearly
};
```

---

## 📝 Summary

The BMC Comparison system provides:

1. **Multiple Comparison Types**: Time-based, type-based, and source-based comparisons
2. **Accurate Calculations**: Weighted averages for quality metrics
3. **Visual Feedback**: Trend indicators and color coding
4. **Flexible Filtering**: Dairy, BMC, and Society filters
5. **Export Options**: CSV and PDF with professional formatting
6. **Data Validation**: Compare BMC vs Society data for consistency
7. **Time Period Flexibility**: Daily, Weekly, Monthly, Yearly comparisons

**Business Value**:
- Quality control and loss analysis
- Performance tracking over time
- Data validation across sources
- Operational efficiency monitoring
- Financial analysis and reporting

---

**Last Updated**: January 2026  
**Version**: 2.1.0  
**Status**: 🟢 Production Ready
