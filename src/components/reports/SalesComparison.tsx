'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import FilterDropdown from '@/components/management/FilterDropdown';
import { FlowerSpinner } from '@/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  reportSource = 'society'
}: SalesComparisonProps) {
  const [currentData, setCurrentData] = useState<ComparisonData | null>(null);
  const [previousData, setPreviousData] = useState<ComparisonData | null>(null);
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
      
      // Use BMC sales endpoint if reportSource is 'bmc'
      const salesEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-sales'
        : '/api/user/reports/sales';
      
      const response = await fetch(salesEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        setLoading(false);
        return;
      }
      
      const allRecords = await response.json() || [];
      
      const filterRecords = (records: any[], dateRange: { from: string; to: string }) => {
        return records.filter((r: any) => {
          const recordDate = r.sales_date || r.date;
          if (recordDate < dateRange.from || recordDate > dateRange.to) return false;
          
          if (dairyFilter.length > 0) {
            const selectedDairyIds = dairyFilter.map(id => dairies.find(d => d.id.toString() === id)?.id).filter(Boolean) as number[];
            if (selectedDairyIds.length > 0 && (!r.dairy_id || !selectedDairyIds.includes(r.dairy_id))) return false;
          }
          
          if (bmcFilter.length > 0) {
            const selectedBmcIds = bmcFilter.map(id => bmcs.find(b => b.id.toString() === id)?.id).filter(Boolean) as number[];
            if (selectedBmcIds.length > 0 && (!r.bmc_id || !selectedBmcIds.includes(r.bmc_id))) return false;
          }
          
          if (societyFilter.length > 0) {
            const selectedSocietyIds = societyFilter.map(id => societies.find(s => s.id.toString() === id)?.society_id).filter(Boolean) as string[];
            if (selectedSocietyIds.length > 0 && (!r.society_id || !selectedSocietyIds.includes(r.society_id))) return false;
          }
          
          return true;
        });
      };
      
      setCurrentData(calculateStats(filterRecords(allRecords, currentDate)));
      setPreviousData(calculateStats(filterRecords(allRecords, previousDate)));
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: any[]): ComparisonData => {
    if (records.length === 0) {
      return { totalSales: 0, totalQuantity: 0, weightedFat: 0, weightedSnf: 0, weightedClr: 0, totalAmount: 0, averageRate: 0 };
    }

    const totalQuantity = records.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    const totalRate = records.reduce((sum, r) => sum + (parseFloat(r.rate_per_liter) || 0), 0);
    
    return {
      totalSales: records.length,
      totalQuantity,
      weightedFat: 0, // Sales don't have FAT data
      weightedSnf: 0, // Sales don't have SNF data
      weightedClr: 0, // Sales don't have CLR data
      totalAmount,
      averageRate: records.length > 0 ? totalRate / records.length : 0
    };
  };

  const exportToCSV = () => {
    if (!currentData || !previousData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    const csvContent = [
      'POORNASREE EQUIPMENTS - Sales Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Comparison Period: ${previousDate.label} vs ${currentDate.label}`,
      '',
      'COMPARISON DATA',
      '',
      'Metric,Total Sales,Total Quantity (L),Total Amount (Rs),Avg Rate (Rs/L)',
      `${currentDate.label},${currentData.totalSales},${currentData.totalQuantity.toFixed(2)},${currentData.totalAmount.toFixed(2)},${currentData.averageRate.toFixed(2)}`,
      `${previousDate.label},${previousData.totalSales},${previousData.totalQuantity.toFixed(2)},${previousData.totalAmount.toFixed(2)},${previousData.averageRate.toFixed(2)}`,
      `Difference,${(currentData.totalSales - previousData.totalSales).toFixed(0)},${(currentData.totalQuantity - previousData.totalQuantity).toFixed(2)},${(currentData.totalAmount - previousData.totalAmount).toFixed(2)},${(currentData.averageRate - previousData.averageRate).toFixed(2)}`,
      '',
      'SUMMARY',
      `Current Period (${currentDate.label}):,${currentData.totalSales} sales,${currentData.totalQuantity.toFixed(2)} L,Rs ${currentData.totalAmount.toFixed(2)}`,
      `Previous Period (${previousDate.label}):,${previousData.totalSales} sales,${previousData.totalQuantity.toFixed(2)} L,Rs ${previousData.totalAmount.toFixed(2)}`,
      '',
      'Note: Sales records do not include FAT SNF or CLR measurements',
      '',
      'Thank you',
      'Poornasree Equipments',
      'Contact: marketing@poornasree.com',
      `Generated on: ${currentDateTime}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
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
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPARISON DATA', 148.5, 28, { align: 'center' });

    autoTable(doc, {
      startY: 32,
      head: [['Metric', 'Total Sales', 'Total Quantity (L)', 'Total Amount (Rs)', 'Avg Rate (Rs/L)']],
      body: [
        [
          currentDate.label,
          currentData.totalSales,
          currentData.totalQuantity.toFixed(2),
          currentData.totalAmount.toFixed(2),
          currentData.averageRate.toFixed(2)
        ],
        [
          previousDate.label,
          previousData.totalSales,
          previousData.totalQuantity.toFixed(2),
          previousData.totalAmount.toFixed(2),
          previousData.averageRate.toFixed(2)
        ],
        [
          'Difference',
          (currentData.totalSales - previousData.totalSales).toFixed(0),
          (currentData.totalQuantity - previousData.totalQuantity).toFixed(2),
          (currentData.totalAmount - previousData.totalAmount).toFixed(2),
          (currentData.averageRate - previousData.averageRate).toFixed(2)
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CURRENT PERIOD SUMMARY', 14, finalY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let leftY = finalY + 6;
    doc.text(`Period: ${currentDate.label}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Sales: ${currentData.totalSales}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Quantity: ${currentData.totalQuantity.toFixed(2)} L`, 14, leftY);
    leftY += 5;
    doc.text(`Total Amount: Rs ${currentData.totalAmount.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Average Rate: Rs ${currentData.averageRate.toFixed(2)}/L`, 14, leftY);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let rightY = finalY + 6;
    doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    rightY += 5;
    doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

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
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">No data available for comparison</p>
      </div>
    );
  }

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
        
        <div className="flex items-center justify-between gap-4">
          {/* BMC Filter Dropdown - Always Visible */}
          {onBmcChange && bmcs.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">BMC:</label>
              <select
                value={bmcFilter.length > 0 ? bmcFilter[0] : ''}
                onChange={(e) => onBmcChange(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All BMCs</option>
                {bmcs.map((bmc) => (
                  <option key={bmc.id} value={bmc.id.toString()}>
                    {bmc.name} ({bmc.bmcId})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {onDairyChange && onSocietyChange && (
            <FilterDropdown
              statusFilter="all"
              onStatusChange={() => {}}
              dairyFilter={dairyFilter}
              onDairyChange={(value) => onDairyChange(Array.isArray(value) ? value : [value])}
              bmcFilter={[]}
              onBmcChange={() => {}}
              societyFilter={Array.isArray(societyFilter) ? societyFilter : []}
              onSocietyChange={(value) => onSocietyChange(Array.isArray(value) ? value : [value])}
              machineFilter="all"
              onMachineChange={() => {}}
              dairies={dairies}
              bmcs={[]}
              societies={societies}
              machines={[]}
              filteredCount={0}
              totalCount={0}
              hideMainFilterButton={true}
              hideBmcFilter={true}
              hideSocietyFilter={false}
              showShiftFilter={false}
              showMachineFilter={false}
              showFarmerFilter={false}
              showDateFilter={false}
              showChannelFilter={false}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Metric</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Sales</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Quantity (L)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Amount (₹)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Avg Rate (₹/L)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{currentDate.label}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{currentData.totalSales}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{currentData.totalQuantity.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{currentData.totalAmount.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{currentData.averageRate.toFixed(2)}</span></td>
            </tr>

            <tr className="bg-blue-50 dark:bg-blue-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{previousDate.label}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{previousData.totalSales}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{previousData.totalQuantity.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{previousData.totalAmount.toFixed(2)}</span></td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{previousData.averageRate.toFixed(2)}</span></td>
            </tr>

            <tr className="bg-yellow-50 dark:bg-yellow-900/20">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Difference</td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalSales, previousData.totalSales, 0)}</td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalQuantity, previousData.totalQuantity)}</td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.totalAmount, previousData.totalAmount)}</td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(currentData.averageRate, previousData.averageRate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This comparison shows sales data for the selected time periods.
          Sales records do not include FAT, SNF, or CLR measurements. Average rate is calculated from rate_per_liter field.
          Green indicates improvement, red indicates decline.
        </p>
      </div>
    </div>
  );
}
