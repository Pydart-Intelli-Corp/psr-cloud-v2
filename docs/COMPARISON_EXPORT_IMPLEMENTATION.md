# Comparison Reports - Export Implementation Guide

## 📋 Overview

This guide shows how to add CSV and PDF export functionality to comparison reports, following the pattern from CollectionReports.tsx.

---

## 🔑 Key Dependencies

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
```

---

## 📊 Export Pattern from CollectionReports

### **1. CSV Export Function**

```typescript
const exportToCSV = () => {
  if (filteredRecords.length === 0) return;

  const dateRange = dateFromFilter && dateToFilter 
    ? `${dateFromFilter} To ${dateToFilter}`
    : dateFilter || 'All Dates';
    
  const currentDateTime = new Date().toLocaleString('en-IN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  });

  const csvContent = [
    'Admin Report - LactoConnect System',
    `Date From ${dateRange}`,
    '',
    'DETAILED DATA',
    '',
    'Headers,Go,Here',
    ...dataRows.map(row => row.join(',')),
    '',
    'SUMMARY',
    `Total:,${stats.total}`,
    '',
    'Thank you',
    'Poornasree Equipments',
    `Generated on: ${currentDateTime}`
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

### **2. PDF Export Function**

```typescript
const exportToPDF = () => {
  if (filteredRecords.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Add Logo
  const logoPath = '/fulllogo.png';
  doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Title', 148.5, 15, { align: 'center' });
  
  // Table
  autoTable(doc, {
    startY: 32,
    head: [['Column1', 'Column2', 'Column3']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold' 
    }
  });

  // Summary
  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 14, finalY);
  
  doc.save(`report-${new Date().toISOString().split('T')[0]}.pdf`);
};
```

### **3. UI Buttons**

```typescript
<div className=\"flex gap-2\">
  <button
    onClick={exportToCSV}
    className=\"flex items-center gap-2 px-3 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700\"
  >
    <Download className=\"w-4 h-4\" />
    <span>CSV</span>
  </button>
  <button
    onClick={exportToPDF}
    className=\"flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
  >
    <Download className=\"w-4 h-4\" />
    <span>PDF</span>
  </button>
</div>
```

---

## 🎯 Implementation for Comparison Reports

### **For ComparisonSummary (Collection vs Collection)**

#### CSV Structure:
```
POORNASREE EQUIPMENTS - COLLECTION COMPARISON REPORT
Comparing: [Previous Label] vs [Current Label]
Date Range: [Previous From-To] vs [Current From-To]

COMPARISON DATA
Metric,Previous Period,Current Period,Difference,Change %
Total Collections,[prev],[curr],[diff],[%]
Total Quantity (L),[prev],[curr],[diff],[%]
Weighted FAT (%),[prev],[curr],[diff],[%]
Weighted SNF (%),[prev],[curr],[diff],[%]
Weighted CLR,[prev],[curr],[diff],[%]
Total Amount (₹),[prev],[curr],[diff],[%]
Average Rate (₹/L),[prev],[curr],[diff],[%]

Generated on: [timestamp]
```

#### PDF Structure:
- **Header**: Logo + "Collection Comparison Report"
- **Subtitle**: Date ranges being compared
- **Table**: 3 rows (Previous, Current, Difference) × 7 columns (metrics)
- **Summary**: Key insights section
- **Footer**: Company info

---

## 📝 Minimal Implementation Steps

### **Step 1: Add Imports**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
```

### **Step 2: Add Export Functions**

```typescript
const exportComparisonToCSV = () => {
  if (!currentData || !previousData) return;

  const csvContent = [
    ['POORNASREE EQUIPMENTS - COLLECTION COMPARISON REPORT'],
    [`Comparing: ${previousDate.label} vs ${currentDate.label}`],
    [],
    ['Metric', previousDate.label, currentDate.label, 'Difference', 'Change %'],
    ['Total Collections', previousData.totalCollections, currentData.totalCollections, 
     currentData.totalCollections - previousData.totalCollections,
     ((currentData.totalCollections - previousData.totalCollections) / previousData.totalCollections * 100).toFixed(1) + '%'],
    // ... more rows
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparison-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

const exportComparisonToPDF = () => {
  if (!currentData || !previousData) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  doc.addImage('/fulllogo.png', 'PNG', 14, 8, 0, 12);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Collection Comparison Report', 148.5, 15, { align: 'center' });

  const tableData = [
    [previousDate.label, previousData.totalCollections, previousData.totalQuantity.toFixed(2), 
     previousData.weightedFat.toFixed(2), previousData.weightedSnf.toFixed(2), 
     previousData.weightedClr.toFixed(2), previousData.totalAmount.toFixed(2), 
     previousData.averageRate.toFixed(2)],
    [currentDate.label, currentData.totalCollections, currentData.totalQuantity.toFixed(2), 
     currentData.weightedFat.toFixed(2), currentData.weightedSnf.toFixed(2), 
     currentData.weightedClr.toFixed(2), currentData.totalAmount.toFixed(2), 
     currentData.averageRate.toFixed(2)],
    ['Difference', 
     (currentData.totalCollections - previousData.totalCollections).toString(),
     (currentData.totalQuantity - previousData.totalQuantity).toFixed(2),
     (currentData.weightedFat - previousData.weightedFat).toFixed(2),
     (currentData.weightedSnf - previousData.weightedSnf).toFixed(2),
     (currentData.weightedClr - previousData.weightedClr).toFixed(2),
     (currentData.totalAmount - previousData.totalAmount).toFixed(2),
     (currentData.averageRate - previousData.averageRate).toFixed(2)]
  ];

  autoTable(doc, {
    startY: 25,
    head: [['Period', 'Collections', 'Quantity (L)', 'FAT %', 'SNF %', 'CLR', 'Amount (₹)', 'Rate (₹/L)']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  doc.save(`comparison-${new Date().toISOString().split('T')[0]}.pdf`);
};
```

### **Step 3: Add UI Buttons**

```typescript
// Add to the header section, after the title
<div className="flex gap-2">
  <button
    onClick={exportComparisonToCSV}
    disabled={!currentData || !previousData}
    className="flex items-center gap-2 px-3 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Download className="w-4 h-4" />
    <span className="hidden sm:inline">CSV</span>
  </button>
  <button
    onClick={exportComparisonToPDF}
    disabled={!currentData || !previousData}
    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Download className="w-4 h-4" />
    <span className="hidden sm:inline">PDF</span>
  </button>
</div>
```

---

## 🎨 Styling Guidelines

### **Button Colors**:
- CSV: `bg-psr-green-600` (green)
- PDF: `bg-blue-600` (blue)
- Disabled: `opacity-50` + `cursor-not-allowed`

### **PDF Styling**:
- Orientation: `landscape` for wide tables
- Font sizes: Title (14), Headers (11), Body (9)
- Colors: White headers with black text
- Theme: `grid` for bordered tables

---

## 📦 Components to Update

1. ✅ **ComparisonSummary.tsx** - Collection vs Collection
2. ✅ **DispatchComparison.tsx** - Dispatch vs Dispatch  
3. ✅ **SalesComparison.tsx** - Sales vs Sales (no FAT/SNF/CLR)
4. ✅ **CollectionDispatchComparison.tsx** - Collection vs Dispatch

---

## 🚀 Quick Implementation Checklist

For each comparison component:

- [ ] Add jsPDF and autoTable imports
- [ ] Add Download icon import
- [ ] Create `exportToCSV()` function
- [ ] Create `exportToPDF()` function
- [ ] Add export buttons to header
- [ ] Test with sample data
- [ ] Verify PDF formatting
- [ ] Verify CSV formatting

---

## 💡 Key Differences for Each Component

### **ComparisonSummary & DispatchComparison**:
- 7 metrics (includes FAT, SNF, CLR)
- 3 rows (Previous, Current, Difference)

### **SalesComparison**:
- 4 metrics only (no FAT, SNF, CLR)
- 3 rows (Previous, Current, Difference)

### **CollectionDispatchComparison**:
- 7 metrics
- 3 rows (Collection, Dispatch, Difference)
- Single time period (not comparing periods)

---

## 📄 Example Output

### **CSV Example**:
```csv
POORNASREE EQUIPMENTS - COLLECTION COMPARISON REPORT
Comparing: Last Week vs This Week
Date Range: 2025-01-06 to 2025-01-12 vs 2025-01-13 to 2025-01-19

Metric,Last Week,This Week,Difference,Change %
Total Collections,150,165,+15,+10.0%
Total Quantity (L),1250.50,1380.25,+129.75,+10.4%
Weighted FAT (%),4.20,4.35,+0.15,+3.6%
Weighted SNF (%),8.50,8.65,+0.15,+1.8%
Weighted CLR,28.00,28.50,+0.50,+1.8%
Total Amount (₹),45000.00,49500.00,+4500.00,+10.0%
Average Rate (₹/L),36.00,35.87,-0.13,-0.4%

Generated on: 2025-01-19 14:30:00
Poornasree Equipments
```

---

## 🎯 Benefits

- ✅ Professional PDF reports with logo
- ✅ Easy data sharing via CSV
- ✅ Consistent formatting across all reports
- ✅ Automated calculations in exports
- ✅ Timestamp for audit trail

---

**Implementation Time**: ~30 minutes per component  
**Complexity**: Low (copy-paste pattern)  
**Dependencies**: Already installed (jsPDF, autoTable)

---

This pattern can be applied to all 4 comparison components with minimal modifications!
