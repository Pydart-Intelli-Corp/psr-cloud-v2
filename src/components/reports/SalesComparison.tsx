'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  totalSales: number;
  totalQuantity: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
  totalAmount: number;
  averageRate: number;
}

interface SalesComparisonProps {
  currentDate: { from: string; to: string; label: string };
  previousDate: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
  timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export default function SalesComparison({ 
  currentDate, 
  previousDate,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange,
  reportSource = 'society',
  timePeriod = 'daily'
}: SalesComparisonProps) {
  const [currentData, setCurrentData] = useState<ComparisonData | null>(null);
  const [previousData, setPreviousData] = useState<ComparisonData | null>(null);
  const [dailyData, setDailyData] = useState<Array<{ date: string; data: ComparisonData }>>([]);
  const [loading, setLoading] = useState(true);
  
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const [dairiesRes, bmcsRes, societiesRes] = await Promise.all([
        fetch('/api/user/dairy', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/bmc', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/society', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (dairiesRes.ok) {
        const data = await dairiesRes.json();
        setDairies(data.data || []);
      }
      if (bmcsRes.ok) {
        const data = await bmcsRes.json();
        setBmcs(data.data || []);
      }
      if (societiesRes.ok) {
        const data = await societiesRes.json();
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Create stable dependency key
  const dependencyKey = `${currentDate.from}-${currentDate.to}-${previousDate.from}-${previousDate.to}-${dairyFilter.join(',')}-${bmcFilter.join(',')}-${societyFilter.join(',')}`;

  useEffect(() => {
    fetchComparisonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('===== Sales Comparison Debug =====');
      console.log('Current Date Range:', currentDate);
      console.log('Previous Date Range:', previousDate);
      
      // Use BMC sales endpoint if reportSource is 'bmc'
      const salesEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-sales'
        : '/api/user/reports/sales';
      
      const response = await fetch(
        salesEndpoint,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        console.error('Sales API Error:', response.status, response.statusText);
        setLoading(false);
        return;
      }
      
      const json = await response.json();
      const allRecords = json || [];
      
      console.log('Total Sales Records Fetched:', allRecords.length);
      if (allRecords.length > 0) {
        console.log('Sample Sales Record:', allRecords[0]);
      }
      
      // Filter records for current period
      const currentRecords = allRecords.filter((r: any) => {
        const recordDate = r.sales_date || r.date;
        const isInRange = recordDate >= currentDate.from && recordDate <= currentDate.to;
        
        if (!isInRange) return false;
        
        // Apply dairy filter
        if (dairyFilter.length > 0) {
          const selectedDairyIds = dairyFilter.map(id => {
            const dairy = dairies.find(d => d.id.toString() === id);
            return dairy?.id;
          }).filter(Boolean) as number[];
          if (selectedDairyIds.length > 0 && (!r.dairy_id || !selectedDairyIds.includes(r.dairy_id))) {
            return false;
          }
        }
        
        // Apply BMC filter
        if (bmcFilter.length > 0) {
          const selectedBmcIds = bmcFilter.map(id => {
            const bmc = bmcs.find(b => b.id.toString() === id);
            return bmc?.id;
          }).filter(Boolean) as number[];
          if (selectedBmcIds.length > 0 && (!r.bmc_id || !selectedBmcIds.includes(r.bmc_id))) {
            return false;
          }
        }
        
        // Apply society filter  
        if (societyFilter.length > 0) {
          const selectedSocietyIds = societyFilter.map(id => {
            const society = societies.find(s => s.id.toString() === id);
            return society?.society_id;
          }).filter(Boolean) as string[];
          if (selectedSocietyIds.length > 0 && (!r.society_id || !selectedSocietyIds.includes(r.society_id))) {
            return false;
          }
        }
        
        console.log('Current period sales match:', {
          date: recordDate,
          quantity: r.quantity,
          amount: r.total_amount
        });
        return true;
      });
      console.log('Current Period Sales Matched:', currentRecords.length);
      const currentStats = calculateStats(currentRecords);
      console.log('Current Stats:', currentStats);
      setCurrentData(currentStats);

      // Filter records for previous period
      const previousRecords = allRecords.filter((r: any) => {
        const recordDate = r.sales_date || r.date;
        const isInRange = recordDate >= previousDate.from && recordDate <= previousDate.to;
        
        if (!isInRange) return false;
        
        // Apply dairy filter
        if (dairyFilter.length > 0) {
          const selectedDairyIds = dairyFilter.map(id => {
            const dairy = dairies.find(d => d.id.toString() === id);
            return dairy?.id;
          }).filter(Boolean) as number[];
          if (selectedDairyIds.length > 0 && (!r.dairy_id || !selectedDairyIds.includes(r.dairy_id))) {
            return false;
          }
        }
        
        // Apply BMC filter
        if (bmcFilter.length > 0) {
          const selectedBmcIds = bmcFilter.map(id => {
            const bmc = bmcs.find(b => b.id.toString() === id);
            return bmc?.id;
          }).filter(Boolean) as number[];
          if (selectedBmcIds.length > 0 && (!r.bmc_id || !selectedBmcIds.includes(r.bmc_id))) {
            return false;
          }
        }
        
        // Apply society filter
        if (societyFilter.length > 0) {
          const selectedSocietyIds = societyFilter.map(id => {
            const society = societies.find(s => s.id.toString() === id);
            return society?.society_id;
          }).filter(Boolean) as string[];
          if (selectedSocietyIds.length > 0 && (!r.society_id || !selectedSocietyIds.includes(r.society_id))) {
            return false;
          }
        }
        
        console.log('Previous period sales match:', {
          date: recordDate,
          quantity: r.quantity,
          amount: r.total_amount
        });
        return true;
      });
      console.log('Previous Period Sales Matched:', previousRecords.length);
      const previousStats = calculateStats(previousRecords);
      console.log('Previous Stats:', previousStats);
      setPreviousData(previousStats);

      // Calculate daily variations if in daily mode with date range
      if (timePeriod === 'daily' && currentDate.from !== currentDate.to) {
        const dailyBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(currentDate.from);
        const endDate = new Date(currentDate.to);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const dayRecords = currentRecords.filter((r: any) => {
            const recordDate = r.sales_date || r.date;
            return recordDate === dateStr;
          });
          dailyBreakdown.push({
            date: dateStr,
            data: calculateStats(dayRecords)
          });
        }
        setDailyData(dailyBreakdown);
      } else {
        setDailyData([]);
      }

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: any[]): ComparisonData => {
    console.log('calculateStats (Sales) called with', records.length, 'records');
    
    if (records.length === 0) {
      console.log('No sales records - returning zeros');
      return {
        totalSales: 0,
        totalQuantity: 0,
        weightedFat: 0,
        weightedSnf: 0,
        weightedClr: 0,
        totalAmount: 0,
        averageRate: 0
      };
    }

    console.log('Sample sales record for calculation:', records[0]);

    const totalQuantity = records.reduce((sum, r) => {
      const qty = parseFloat(r.quantity) || 0;
      return sum + qty;
    }, 0);
    
    console.log('Sales total quantity:', totalQuantity);
    
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);

    const result = {
      totalSales: records.length,
      totalQuantity,
      weightedFat: 0, // Sales don't have FAT data
      weightedSnf: 0, // Sales don't have SNF data
      weightedClr: 0, // Sales don't have CLR data
      totalAmount,
      averageRate: totalAmount / (totalQuantity || 1)
    };
    
    console.log('Sales calculated stats result:', result);
    return result;
  };

  const exportToCSV = () => {
    if (!currentData || !previousData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    // Get filter details
    const selectedDairy = dairyFilter.length > 0 ? dairies.find(d => d.id.toString() === dairyFilter[0]) : null;
    const selectedBmc = bmcFilter.length > 0 ? bmcs.find(b => b.id.toString() === bmcFilter[0]) : null;
    const selectedSociety = societyFilter.length > 0 ? societies.find(s => s.id.toString() === societyFilter[0]) : null;

    let csvContent = [
      'POORNASREE EQUIPMENTS - Sales Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Comparison Period: ${previousDate.label} vs ${currentDate.label}`,
      ''
    ];

    // Add filter information
    if (selectedDairy || selectedBmc || selectedSociety) {
      csvContent.push('FILTERS APPLIED', '');
      if (selectedDairy) csvContent.push(`Dairy: ${selectedDairy.name} (${selectedDairy.dairyId})`);
      if (selectedBmc) csvContent.push(`BMC: ${selectedBmc.name} (${selectedBmc.bmcId})`);
      if (selectedSociety) csvContent.push(`Society: ${selectedSociety.name} (${selectedSociety.society_id})`);
      csvContent.push('');
    }

    if (dailyData.length > 0) {
      csvContent.push('DAY-BY-DAY BREAKDOWN', '');
      csvContent.push('Date,Sales,Quantity (L),Amount (Rs),Rate (Rs/L)');
      dailyData.forEach((day) => {
        csvContent.push(`${day.date},${day.data.totalSales},${day.data.totalQuantity.toFixed(2)},${day.data.totalAmount.toFixed(2)},${day.data.averageRate.toFixed(2)}`);
      });
      csvContent.push('');
    }

    const isSamePeriod = currentDate.from === previousDate.from && currentDate.to === previousDate.to;

    csvContent = csvContent.concat([
      'SUMMARY',
      '',
      'Period,Total Sales,Total Quantity (L),Total Amount (Rs),Avg Rate (Rs/L)',
      `${currentDate.from} to ${currentDate.to},${currentData.totalSales},${currentData.totalQuantity.toFixed(2)},${currentData.totalAmount.toFixed(2)},${currentData.averageRate.toFixed(2)}`,
    ]);

    if (!isSamePeriod) {
      csvContent.push(`${previousDate.from} to ${previousDate.to},${previousData.totalSales},${previousData.totalQuantity.toFixed(2)},${previousData.totalAmount.toFixed(2)},${previousData.averageRate.toFixed(2)}`);
      csvContent.push(`Difference,${(currentData.totalSales - previousData.totalSales).toFixed(0)},${(currentData.totalQuantity - previousData.totalQuantity).toFixed(2)},${(currentData.totalAmount - previousData.totalAmount).toFixed(2)},${(currentData.averageRate - previousData.averageRate).toFixed(2)}`);
    }

    csvContent = csvContent.concat([
      '',
      'Note: Sales records do not include FAT SNF or CLR measurements',
      '',
      'Thank you',
      'Poornasree Equipments',
      'Contact: marketing@poornasree.com',
      `Generated on: ${currentDateTime}`
    ]);

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-comparison-${currentDate.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!currentData || !previousData) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales Comparison Report - LactoConnect System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Comparison: ${previousDate.label} vs ${currentDate.label}`, 148.5, 21, { align: 'center' });

    // Get filter details
    const selectedDairy = dairyFilter.length > 0 ? dairies.find(d => d.id.toString() === dairyFilter[0]) : null;
    const selectedBmc = bmcFilter.length > 0 ? bmcs.find(b => b.id.toString() === bmcFilter[0]) : null;
    const selectedSociety = societyFilter.length > 0 ? societies.find(s => s.id.toString() === societyFilter[0]) : null;

    let startY = 28;

    // Add filter information
    if (selectedDairy || selectedBmc || selectedSociety) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Filters Applied:', 14, startY);
      doc.setFont('helvetica', 'normal');
      startY += 5;
      if (selectedDairy) {
        doc.text(`Dairy: ${selectedDairy.name} (${selectedDairy.dairyId})`, 14, startY);
        startY += 4;
      }
      if (selectedBmc) {
        doc.text(`BMC: ${selectedBmc.name} (${selectedBmc.bmcId})`, 14, startY);
        startY += 4;
      }
      if (selectedSociety) {
        doc.text(`Society: ${selectedSociety.name} (${selectedSociety.society_id})`, 14, startY);
        startY += 4;
      }
      startY += 2;
    }

    if (dailyData.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DAY-BY-DAY BREAKDOWN', 148.5, startY, { align: 'center' });

      const dailyRows = dailyData.map(day => [
        day.date,
        day.data.totalSales,
        day.data.totalQuantity.toFixed(2),
        day.data.totalAmount.toFixed(2),
        day.data.averageRate.toFixed(2)
      ]);

      autoTable(doc, {
        startY: startY + 4,
        head: [['Date', 'Sales', 'Qty (L)', 'Amt (Rs)', 'Rate (Rs/L)']],
        body: dailyRows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
        bodyStyles: { lineWidth: 0.2, lineColor: [200, 200, 200] }
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 148.5, startY, { align: 'center' });

    const isSamePeriod = currentDate.from === previousDate.from && currentDate.to === previousDate.to;

    const summaryBody = isSamePeriod 
      ? [[`${currentDate.from} to ${currentDate.to}`, currentData.totalSales, currentData.totalQuantity.toFixed(2), currentData.totalAmount.toFixed(2), currentData.averageRate.toFixed(2)]]
      : [
          [`${currentDate.from} to ${currentDate.to}`, currentData.totalSales, currentData.totalQuantity.toFixed(2), currentData.totalAmount.toFixed(2), currentData.averageRate.toFixed(2)],
          [`${previousDate.from} to ${previousDate.to}`, previousData.totalSales, previousData.totalQuantity.toFixed(2), previousData.totalAmount.toFixed(2), previousData.averageRate.toFixed(2)],
          ['Difference', (currentData.totalSales - previousData.totalSales).toFixed(0), (currentData.totalQuantity - previousData.totalQuantity).toFixed(2), (currentData.totalAmount - previousData.totalAmount).toFixed(2), (currentData.averageRate - previousData.averageRate).toFixed(2)]
        ];

    autoTable(doc, {
      startY: startY + 4,
      head: [['Period', 'Total Sales', 'Total Quantity (L)', 'Total Amount (Rs)', 'Avg Rate (Rs/L)']],
      body: summaryBody,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, finalY, { align: 'right' });
    doc.text('Contact: marketing@poornasree.com', 283, finalY + 5, { align: 'right' });

    doc.save(`sales-comparison-${currentDate.from}.pdf`);
  };

  const renderDifferenceCell = (current: number, previous: number, decimals: number = 2) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {isPositive ? '+' : ''}{diff.toFixed(decimals)}
        </span>
        <div className="flex items-center gap-1">
          {isPositive && <TrendingUp className="w-3 h-3 text-green-600" />}
          {isNegative && <TrendingDown className="w-3 h-3 text-red-600" />}
          {!isPositive && !isNegative && <Minus className="w-3 h-3 text-gray-400" />}
          <span className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <FlowerSpinner size={48} />
        </div>
      </div>
    );
  }

  if (!currentData || !previousData) {
    console.log('❌ NO SALES COMPARISON DATA');
    console.log('currentData:', currentData);
    console.log('previousData:', previousData);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">No data available for comparison</p>
      </div>
    );
  }

  console.log('✅ RENDERING SALES COMPARISON');
  console.log('Current Sales Data:', JSON.stringify(currentData, null, 2));
  console.log('Previous Sales Data:', JSON.stringify(previousData, null, 2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sales Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing weighted averages: {previousDate.label} ({previousDate.from}) vs {currentDate.label} ({currentDate.from})
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dairy Filter Dropdown */}
          {onDairyChange && dairies.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dairy:
              </label>
              <select
                value={dairyFilter.length > 0 ? dairyFilter[0] : ''}
                onChange={(e) => {
                  onDairyChange(e.target.value ? [e.target.value] : []);
                  if (onBmcChange) onBmcChange([]);
                  if (onSocietyChange) onSocietyChange([]);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Dairies</option>
                {dairies.map((dairy) => (
                  <option key={dairy.id} value={dairy.id.toString()}>
                    {dairy.name} ({dairy.dairyId})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* BMC Filter Dropdown */}
          {onBmcChange && bmcs.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BMC:
              </label>
              <select
                value={bmcFilter.length > 0 ? bmcFilter[0] : ''}
                onChange={(e) => {
                  onBmcChange(e.target.value ? [e.target.value] : []);
                  if (onSocietyChange) onSocietyChange([]);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">BMCs</option>
                {bmcs
                  .filter(bmc => {
                    if (dairyFilter.length > 0) {
                      const selectedDairyId = parseInt(dairyFilter[0]);
                      return bmc.dairyFarmId === selectedDairyId;
                    }
                    return true;
                  })
                  .map((bmc) => (
                    <option key={bmc.id} value={bmc.id.toString()}>
                      {bmc.name} ({bmc.bmcId})
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          {/* Society Filter Dropdown - Hidden in BMC mode */}
          {onSocietyChange && societies.length > 0 && reportSource !== 'bmc' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Society:
              </label>
              <select
                value={societyFilter.length > 0 ? societyFilter[0] : ''}
                onChange={(e) => onSocietyChange(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Societies</option>
                {societies
                  .filter(society => {
                    if (bmcFilter.length > 0) {
                      const selectedBmcId = parseInt(bmcFilter[0]);
                      return society.bmc_id === selectedBmcId;
                    }
                    if (dairyFilter.length > 0) {
                      const selectedDairyId = parseInt(dairyFilter[0]);
                      const dairyBmcIds = bmcs
                        .filter(bmc => bmc.dairyFarmId === selectedDairyId)
                        .map(bmc => bmc.id);
                      return society.bmc_id && dairyBmcIds.includes(society.bmc_id);
                    }
                    return true;
                  })
                  .map((society) => (
                    <option key={society.id} value={society.id.toString()}>
                      {society.name} ({society.society_id})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Day-by-Day Table */}
      {dailyData.length > 0 && (
      <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/40 dark:to-cyan-900/40">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Sales</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Quantity (L)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Amount (₹)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Rate (₹/L)</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((day, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr key={day.date} className={isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                        {day.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{day.data.totalSales}</span></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{day.data.totalQuantity.toFixed(2)}</span></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{day.data.totalAmount.toFixed(2)}</span></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{day.data.averageRate.toFixed(2)}</span></td>
                  </tr>
                );
              })}
              <tr className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/50 dark:to-cyan-900/50 font-bold">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Total / Average</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">{currentData.totalSales}</td>
                <td className="px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-200 border border-gray-300 dark:border-gray-600">{currentData.totalQuantity.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-blue-700 dark:text-blue-200 border border-gray-300 dark:border-gray-600">₹{currentData.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-cyan-700 dark:text-cyan-200 border border-gray-300 dark:border-gray-600">₹{currentData.averageRate.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
      </div>
      )}

      {/* Comparison Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comparison Summary</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Period</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Sales</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Quantity (L)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Amount (₹)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Avg Rate (₹/L)</th>
            </tr>
          </thead>
          <tbody>
            {/* Current Period Row */}
            <tr className="bg-blue-50 dark:bg-blue-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{currentDate.from} to {currentDate.to}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{currentData.totalSales}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{currentData.totalQuantity.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{currentData.totalAmount.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{currentData.averageRate.toFixed(2)}</span></td>
            </tr>
            {/* Previous Period Row - Only show if different */}
            {(currentDate.from !== previousDate.from || currentDate.to !== previousDate.to) && (
              <>
                <tr className="bg-green-50 dark:bg-green-900/20">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{previousDate.from} to {previousDate.to}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{previousData.totalSales}</span></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{previousData.totalQuantity.toFixed(2)}</span></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{previousData.totalAmount.toFixed(2)}</span></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{previousData.averageRate.toFixed(2)}</span></td>
                </tr>

                {/* Difference Row */}
                <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Difference</td>
                  <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalSales, previousData.totalSales, 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalQuantity, previousData.totalQuantity)}</td>
                  <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalAmount, previousData.totalAmount)}</td>
                  <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.averageRate, previousData.averageRate)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This comparison shows weighted average values calculated from all sales records in the selected time periods.
          Sales records do not include FAT, SNF, or CLR measurements. Green indicates improvement, red indicates decline. Percentage changes show the relative difference between periods.
        </p>
      </div>

      {/* Distribution Chart - Radar Style - Hide when daily data is available */}
      {dailyData.length === 0 && (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Distribution Chart — Comparison Analysis</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Radar visualization showing all parameters normalized to 0-100 scale</p>
        
        {(() => {
          const normalize = (value: number, min: number, max: number) => {
            if (max === min) return 50;
            return ((value - min) / (max - min)) * 100;
          };

          const qtyMin = Math.min(previousData.totalQuantity, currentData.totalQuantity) * 0.9;
          const qtyMax = Math.max(previousData.totalQuantity, currentData.totalQuantity) * 1.1;
          const amtMin = Math.min(previousData.totalAmount, currentData.totalAmount) * 0.9;
          const amtMax = Math.max(previousData.totalAmount, currentData.totalAmount) * 1.1;
          const rateMin = Math.min(previousData.averageRate, currentData.averageRate) * 0.9;
          const rateMax = Math.max(previousData.averageRate, currentData.averageRate) * 1.1;

          const previousNormalized = [
            { parameter: 'Quantity', value: normalize(previousData.totalQuantity, qtyMin, qtyMax), actual: previousData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', value: normalize(previousData.totalAmount, amtMin, amtMax), actual: previousData.totalAmount, unit: '₹' },
            { parameter: 'Rate', value: normalize(previousData.averageRate, rateMin, rateMax), actual: previousData.averageRate, unit: '₹/L' }
          ];

          const currentNormalized = [
            { parameter: 'Quantity', value: normalize(currentData.totalQuantity, qtyMin, qtyMax), actual: currentData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', value: normalize(currentData.totalAmount, amtMin, amtMax), actual: currentData.totalAmount, unit: '₹' },
            { parameter: 'Rate', value: normalize(currentData.averageRate, rateMin, rateMax), actual: currentData.averageRate, unit: '₹/L' }
          ];

          const combinedData = [
            { parameter: 'Quantity', previous: normalize(previousData.totalQuantity, qtyMin, qtyMax), current: normalize(currentData.totalQuantity, qtyMin, qtyMax), prevActual: previousData.totalQuantity, currActual: currentData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', previous: normalize(previousData.totalAmount, amtMin, amtMax), current: normalize(currentData.totalAmount, amtMin, amtMax), prevActual: previousData.totalAmount, currActual: currentData.totalAmount, unit: '₹' },
            { parameter: 'Rate', previous: normalize(previousData.averageRate, rateMin, rateMax), current: normalize(currentData.averageRate, rateMin, rateMax), prevActual: previousData.averageRate, currActual: currentData.averageRate, unit: '₹/L' }
          ];

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{previousDate.label}</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={previousNormalized}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name={previousDate.label} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                        itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                        formatter={(value: any, name: string, props: any) => {
                          const actual = props.payload.actual;
                          const unit = props.payload.unit;
                          return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{previousData.totalQuantity.toFixed(2)} L</span></div>
                    <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{previousData.totalAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{previousData.averageRate.toFixed(2)}/L</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{currentDate.label}</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={currentNormalized}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name={currentDate.label} dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} strokeWidth={2} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                        itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                        formatter={(value: any, name: string, props: any) => {
                          const actual = props.payload.actual;
                          const unit = props.payload.unit;
                          return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{currentData.totalQuantity.toFixed(2)} L</span></div>
                    <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{currentData.totalAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{currentData.averageRate.toFixed(2)}/L</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Overlay Comparison</h4>
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={combinedData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Radar name={previousDate.label} dataKey="previous" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2.5} />
                    <Radar name={currentDate.label} dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2.5} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                      itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                      formatter={(value: any, name: string, props: any) => {
                        const actual = name === previousDate.label ? props.payload.prevActual : props.payload.currActual;
                        const unit = props.payload.unit;
                        return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          );
        })()}
      </div>
      )}



      {/* Daily Variations - Area Chart */}
      {dailyData.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Daily Variations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Normalized trends from {currentDate.from} to {currentDate.to}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-xs font-semibold shadow-lg">
              0-100 Scale
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={dailyData.map(d => {
                const allQty = dailyData.map(day => day.data.totalQuantity);
                const allAmt = dailyData.map(day => day.data.totalAmount);
                const allRate = dailyData.map(day => day.data.averageRate);

                const normalize = (value: number, values: number[]) => {
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  if (max === min) return 50;
                  return ((value - min) / (max - min)) * 100;
                };

                return {
                  date: d.date.split('-').slice(1).join('/'),
                  Quantity: normalize(d.data.totalQuantity, allQty),
                  Amount: normalize(d.data.totalAmount, allAmt),
                  Rate: normalize(d.data.averageRate, allRate),
                  qtyActual: d.data.totalQuantity,
                  amtActual: d.data.totalAmount,
                  rateActual: d.data.averageRate
                };
              })} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  stroke="#6b7280"
                  label={{ value: 'Date (MM/DD)', position: 'insideBottom', offset: -10, style: { fontSize: 12, fill: '#6b7280', fontWeight: 600 } }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  stroke="#6b7280"
                  domain={[0, 100]}
                  label={{ value: 'Normalized Value (0-100)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280', fontWeight: 600 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                  itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                  formatter={(value: any, name: string, props: any) => {
                    const payload = props.payload;
                    if (name === 'Quantity (L)') return [`${payload.qtyActual.toFixed(2)} L`, name];
                    if (name === 'Amount (₹)') return [`₹${payload.amtActual.toFixed(2)}`, name];
                    if (name === 'Rate (₹/L)') return [`₹${payload.rateActual.toFixed(2)}/L`, name];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Area 
                  type="monotone" 
                  dataKey="Quantity" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fill="url(#colorQuantity)"
                  name="Quantity (L)"
                />
                <Area 
                  type="monotone" 
                  dataKey="Amount" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fill="url(#colorAmount)"
                  name="Amount (₹)"
                />
                <Area 
                  type="monotone" 
                  dataKey="Rate" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5}
                  fill="url(#colorRate)"
                  name="Rate (₹/L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {(() => {
              const getRange = (values: number[]) => {
                const min = Math.min(...values);
                const max = Math.max(...values);
                return { min, max };
              };

              const qtyRange = getRange(dailyData.map(d => d.data.totalQuantity));
              const amtRange = getRange(dailyData.map(d => d.data.totalAmount));
              const rateRange = getRange(dailyData.map(d => d.data.averageRate));

              return (
                <>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Qty: {qtyRange.min.toFixed(0)}-{qtyRange.max.toFixed(0)}L
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Amt: ₹{amtRange.min.toFixed(0)}-₹{amtRange.max.toFixed(0)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Rate: ₹{rateRange.min.toFixed(1)}-₹{rateRange.max.toFixed(1)}/L
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
