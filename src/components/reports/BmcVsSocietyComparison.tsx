'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComparisonData {
  totalRecords: number;
  totalQuantity: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
  totalAmount: number;
  averageRate: number;
}

interface BmcVsSocietyComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
}

export default function BmcVsSocietyComparison({ 
  dateRange,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange,
  reportSource = 'bmc'
}: BmcVsSocietyComparisonProps) {
  const [bmcData, setBmcData] = useState<ComparisonData | null>(null);
  const [societyData, setSocietyData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string }>>([]);
  const [filteredSocieties, setFilteredSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (bmcFilter.length > 0 && societies.length > 0) {
      const selectedBmcId = parseInt(bmcFilter[0]);
      const filtered = societies.filter(s => s.bmc_id === selectedBmcId);
      setFilteredSocieties(filtered);
    } else {
      setFilteredSocieties([]);
    }
  }, [bmcFilter, societies]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const [bmcsRes, societiesRes] = await Promise.all([
        fetch('/api/user/bmc', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/society', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

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

  const dependencyKey = `${dateRange.from}-${dateRange.to}-${bmcFilter.join(',')}-${societyFilter.join(',')}-${societies.length}`;

  useEffect(() => {
    if (bmcFilter.length > 0 && societyFilter.length > 0 && societies.length > 0) {
      fetchComparisonData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // If label is 'Today', use only today's date
      const today = new Date().toISOString().split('T')[0];
      const effectiveFrom = dateRange.label === 'Today' ? today : dateRange.from;
      const effectiveTo = dateRange.label === 'Today' ? today : dateRange.to;
      
      console.log('BmcVsSociety - Date filtering:', { label: dateRange.label, effectiveFrom, effectiveTo, today });
      
      // Fetch collection data for BMC - use BMC endpoint if reportSource is 'bmc'
      const collectionEndpoint = reportSource === 'bmc' 
        ? '/api/user/reports/bmc-collections'
        : '/api/user/reports/collections';
      
      console.log('BmcVsSociety - Fetching from:', collectionEndpoint, 'reportSource:', reportSource);
      
      const collectionResponse = await fetch(collectionEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!collectionResponse.ok) {
        console.error('BmcVsSociety - Collection fetch failed:', collectionResponse.status);
        setLoading(false);
        return;
      }

      const allCollectionRecords = await collectionResponse.json() || [];
      console.log('BmcVsSociety - Total collection records:', allCollectionRecords.length);
      if (allCollectionRecords.length > 0) {
        console.log('BmcVsSociety - Sample collection record:', allCollectionRecords[0]);
      }
      
      const selectedBmcId = parseInt(bmcFilter[0]);
      console.log('BmcVsSociety - Selected BMC ID:', selectedBmcId);
      
      const selectedSociety = societies.find(s => s.id.toString() === societyFilter[0]);
      const selectedSocietyId = selectedSociety?.society_id;
      console.log('BmcVsSociety - Selected Society ID:', selectedSocietyId);

      // BMC level collection data (all societies under this BMC)
      const bmcRecords = allCollectionRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
        const matchesDate = dateRange.label === 'Today' 
          ? recordDate === effectiveFrom 
          : (recordDate >= effectiveFrom && recordDate <= effectiveTo);
        
        // For BMC reports, the bmc_id might be in the record directly or we need to match all records
        const matchesBmc = reportSource === 'bmc' 
          ? true  // BMC endpoint already filters by BMC, so accept all records
          : r.bmc_id === selectedBmcId;
        
        if (matchesDate) {
          console.log('BmcVsSociety - Record check:', { 
            recordDate, 
            matchesDate, 
            bmc_id: r.bmc_id, 
            selectedBmcId,
            reportSource,
            matchesBmc
          });
        }
        
        return matchesDate && matchesBmc;
      });
      console.log('BmcVsSociety - Filtered BMC records:', bmcRecords.length);
      setBmcData(calculateStats(bmcRecords));

      // Fetch dispatch data for Society - always use society endpoint
      const dispatchResponse = await fetch('/api/user/reports/dispatches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!dispatchResponse.ok) {
        console.error('BmcVsSociety - Dispatch fetch failed:', dispatchResponse.status);
        setLoading(false);
        return;
      }

      const allDispatchRecords = await dispatchResponse.json() || [];
      console.log('BmcVsSociety - Total dispatch records:', allDispatchRecords.length);

      // Society level dispatch data - use society_id string
      const societyRecords = allDispatchRecords.filter((r: any) => {
        const recordDate = r.dispatch_date || r.date;
        const matchesDate = dateRange.label === 'Today'
          ? recordDate === effectiveFrom
          : (recordDate >= effectiveFrom && recordDate <= effectiveTo);
        const matchesSociety = r.society_id === selectedSocietyId;
        return matchesDate && matchesSociety;
      });
      console.log('BmcVsSociety - Filtered society records:', societyRecords.length);
      setSocietyData(calculateStats(societyRecords));

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBmc = bmcs.find(b => b.id.toString() === bmcFilter[0]);
  const selectedSociety = societies.find(s => s.id.toString() === societyFilter[0]);

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

    const totalQuantity = records.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    const weightedFat = records.reduce((sum, r) => sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);
    const weightedSnf = records.reduce((sum, r) => sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);
    const weightedClr = records.reduce((sum, r) => sum + ((parseFloat(r.clr_value || r.clr) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);

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

  const getDifference = (bmc: number, society: number) => {
    const diff = bmc - society;
    const percentChange = society !== 0 ? ((diff / society) * 100) : 0;
    return { diff, percentChange };
  };

  const renderDifferenceCell = (bmc: number, society: number, decimals: number = 2) => {
    const { diff, percentChange } = getDifference(bmc, society);
    const isZero = diff === 0;
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    const colorClass = isZero ? 'text-green-600' : isPositive ? 'text-yellow-600' : 'text-red-600';
    const iconClass = isZero ? 'text-green-600' : isPositive ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`font-bold ${colorClass}`}>
          {isPositive ? '+' : ''}{diff.toFixed(decimals)}
        </span>
        <div className="flex items-center gap-1">
          {isZero && <Minus className={`w-3 h-3 ${iconClass}`} />}
          {isPositive && <TrendingUp className={`w-3 h-3 ${iconClass}`} />}
          {isNegative && <TrendingDown className={`w-3 h-3 ${iconClass}`} />}
          <span className={`text-xs ${colorClass}`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  const exportToCSV = () => {
    if (!bmcData || !societyData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    const csvContent = [
      'POORNASREE EQUIPMENTS - BMC vs Society Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Period: ${dateRange.label}`,
      `BMC: ${selectedBmc?.name || 'N/A'} (${selectedBmc?.bmcId || 'N/A'})`,
      `Society: ${selectedSociety?.name || 'N/A'} (${selectedSociety?.society_id || 'N/A'})`,
      '',
      'COMPARISON DATA',
      '',
      'Metric,Total Records,Total Quantity (L),Weighted FAT (%),Weighted SNF (%),Weighted CLR,Total Amount (Rs),Avg Rate (Rs/L)',
      `BMC Collection,${bmcData.totalRecords},${bmcData.totalQuantity.toFixed(2)},${bmcData.weightedFat.toFixed(2)},${bmcData.weightedSnf.toFixed(2)},${bmcData.weightedClr.toFixed(2)},${bmcData.totalAmount.toFixed(2)},${bmcData.averageRate.toFixed(2)}`,
      `Society Dispatch,${societyData.totalRecords},${societyData.totalQuantity.toFixed(2)},${societyData.weightedFat.toFixed(2)},${societyData.weightedSnf.toFixed(2)},${societyData.weightedClr.toFixed(2)},${societyData.totalAmount.toFixed(2)},${societyData.averageRate.toFixed(2)}`,
      `Difference,${(bmcData.totalRecords - societyData.totalRecords).toFixed(0)},${(bmcData.totalQuantity - societyData.totalQuantity).toFixed(2)},${(bmcData.weightedFat - societyData.weightedFat).toFixed(2)},${(bmcData.weightedSnf - societyData.weightedSnf).toFixed(2)},${(bmcData.weightedClr - societyData.weightedClr).toFixed(2)},${(bmcData.totalAmount - societyData.totalAmount).toFixed(2)},${(bmcData.averageRate - societyData.averageRate).toFixed(2)}`,
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
    a.download = `bmc-society-comparison-${dateRange.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!bmcData || !societyData) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Add Logo
    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BMC vs Society Comparison Report - LactoConnect System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${dateRange.label} | BMC: ${selectedBmc?.name || 'N/A'} (${selectedBmc?.bmcId || 'N/A'}) | Society: ${selectedSociety?.name || 'N/A'} (${selectedSociety?.society_id || 'N/A'})`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPARISON DATA', 148.5, 28, { align: 'center' });

    // Comparison Table
    autoTable(doc, {
      startY: 32,
      head: [['Metric', 'Total Records', 'Total Quantity (L)', 'Weighted FAT (%)', 'Weighted SNF (%)', 'Weighted CLR', 'Total Amount (Rs)', 'Avg Rate (Rs/L)']],
      body: [
        [
          'BMC Collection',
          bmcData.totalRecords,
          bmcData.totalQuantity.toFixed(2),
          bmcData.weightedFat.toFixed(2),
          bmcData.weightedSnf.toFixed(2),
          bmcData.weightedClr.toFixed(2),
          bmcData.totalAmount.toFixed(2),
          bmcData.averageRate.toFixed(2)
        ],
        [
          'Society Dispatch',
          societyData.totalRecords,
          societyData.totalQuantity.toFixed(2),
          societyData.weightedFat.toFixed(2),
          societyData.weightedSnf.toFixed(2),
          societyData.weightedClr.toFixed(2),
          societyData.totalAmount.toFixed(2),
          societyData.averageRate.toFixed(2)
        ],
        [
          'Difference',
          (bmcData.totalRecords - societyData.totalRecords).toFixed(0),
          (bmcData.totalQuantity - societyData.totalQuantity).toFixed(2),
          (bmcData.weightedFat - societyData.weightedFat).toFixed(2),
          (bmcData.weightedSnf - societyData.weightedSnf).toFixed(2),
          (bmcData.weightedClr - societyData.weightedClr).toFixed(2),
          (bmcData.totalAmount - societyData.totalAmount).toFixed(2),
          (bmcData.averageRate - societyData.averageRate).toFixed(2)
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] }
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    
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

    doc.save(`bmc-society-comparison-${dateRange.from}.pdf`);
  };

  if (bmcFilter.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">Please select a BMC to view comparison</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <FlowerSpinner size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              BMC vs Society Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing {selectedBmc?.name} (BMC) vs {selectedSociety?.name || 'Select Society'} for {dateRange.label}
            </p>
          </div>
          
          {/* Export Buttons */}
          {societyFilter.length > 0 && bmcData && societyData && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">BMC:</label>
            <select
              value={bmcFilter[0] || ''}
              onChange={(e) => onBmcChange && onBmcChange(e.target.value ? [e.target.value] : [])}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select BMC</option>
              {bmcs.map((bmc) => (
                <option key={bmc.id} value={bmc.id.toString()}>
                  {bmc.name} ({bmc.bmcId})
                </option>
              ))}
            </select>
          </div>

          {bmcFilter.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Society:</label>
              <select
                value={societyFilter[0] || ''}
                onChange={(e) => onSocietyChange && onSocietyChange(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Society</option>
                {filteredSocieties.map((society) => (
                  <option key={society.id} value={society.id.toString()}>
                    {society.name} ({society.society_id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {societyFilter.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Please select a society to view comparison</p>
        </div>
      ) : !bmcData || !societyData ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for comparison</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Metric</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Records</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Quantity (L)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Weighted FAT (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Weighted SNF (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Weighted CLR</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Total Amount (₹)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Avg Rate (₹/L)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">BMC Collection</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{bmcData.totalRecords}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{bmcData.totalQuantity.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{bmcData.weightedFat.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{bmcData.weightedSnf.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{bmcData.weightedClr.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{bmcData.totalAmount.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{bmcData.averageRate.toFixed(2)}</span></td>
              </tr>
              <tr className="bg-green-50 dark:bg-green-900/20">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Society Dispatch</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyData.totalRecords}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyData.totalQuantity.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyData.weightedFat.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyData.weightedSnf.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyData.weightedClr.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{societyData.totalAmount.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"><span className="font-semibold">₹{societyData.averageRate.toFixed(2)}</span></td>
              </tr>
              <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Difference (Collection - Dispatch)</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.totalRecords, societyData.totalRecords, 0)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.totalQuantity, societyData.totalQuantity)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.weightedFat, societyData.weightedFat)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.weightedSnf, societyData.weightedSnf)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.weightedClr, societyData.weightedClr)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.totalAmount, societyData.totalAmount)}</td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(bmcData.averageRate, societyData.averageRate)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> BMC Collection shows aggregated collection data for all societies under the selected BMC. Society Dispatch shows dispatch data for the selected society only. Positive differences indicate collection is higher than dispatch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
