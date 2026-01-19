'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import FilterDropdown from '@/components/management/FilterDropdown';
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

interface CollectionDispatchComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
}

export default function CollectionDispatchComparison({ 
  dateRange,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange,
  reportSource = 'society'
}: CollectionDispatchComparisonProps) {
  const [collectionData, setCollectionData] = useState<ComparisonData | null>(null);
  const [dispatchData, setDispatchData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter data states
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  
  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    console.log('📡 Starting fetchFilterOptions (CollectionDispatch)...');
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) return;
      
      console.log('📡 Fetching dairies, bmcs, societies...');
      
      // Fetch dairies
      const dairiesRes = await fetch('/api/user/dairy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dairiesRes.ok) {
        const dairiesData = await dairiesRes.json();
        const dairiesList = dairiesData.data || [];
        console.log('✅ Comparison - Dairies fetched:', dairiesList.length, dairiesList);
        setDairies(dairiesList);
      } else {
        console.error('❌ Dairies fetch failed:', dairiesRes.status, dairiesRes.statusText);
      }
      
      // Fetch BMCs
      const bmcsRes = await fetch('/api/user/bmc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bmcsRes.ok) {
        const bmcsData = await bmcsRes.json();
        const bmcsList = bmcsData.data || [];
        console.log('✅ Comparison - BMCs fetched:', bmcsList.length, bmcsList);
        setBmcs(bmcsList);
      } else {
        console.error('❌ BMCs fetch failed:', bmcsRes.status, bmcsRes.statusText);
      }
      
      // Fetch Societies
      const societiesRes = await fetch('/api/user/society', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (societiesRes.ok) {
        const societiesData = await societiesRes.json();
        const societiesList = societiesData.data || [];
        console.log('✅ Comparison - Societies fetched:', societiesList.length, societiesList);
        setSocieties(societiesList);
      } else {
        console.error('❌ Societies fetch failed:', societiesRes.status, societiesRes.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
    }
  };

  // Create stable dependency key
  const dependencyKey = `${dateRange.from}-${dateRange.to}-${dairyFilter.join(',')}-${bmcFilter.join(',')}-${societyFilter.join(',')}`;

  useEffect(() => {
    fetchComparisonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('===== Collection vs Dispatch Comparison Debug =====');
      console.log('Date Range:', dateRange);
      
      // Fetch all collection data - use BMC endpoint if reportSource is 'bmc'
      const collectionEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-collections'
        : '/api/user/reports/collections';
      
      const collectionRes = await fetch(
        collectionEndpoint,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!collectionRes.ok) {
        console.error('Collection API Error:', collectionRes.status, collectionRes.statusText);
        setLoading(false);
        return;
      }
      
      const collectionJson = await collectionRes.json();
      
      // Fetch all dispatch data - use BMC endpoint if reportSource is 'bmc'
      const dispatchEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-dispatches'
        : '/api/user/reports/dispatches';
      
      const dispatchRes = await fetch(
        dispatchEndpoint,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!dispatchRes.ok) {
        console.error('Dispatch API Error:', dispatchRes.status, dispatchRes.statusText);
        setLoading(false);
        return;
      }
      
      const dispatchJson = await dispatchRes.json();

      console.log('All Collection Records:', collectionJson?.length || 0);
      console.log('All Dispatch Records:', dispatchJson?.length || 0);
      
      if (dispatchJson && dispatchJson.length > 0) {
        console.log('Sample Dispatch Record Structure:', dispatchJson[0]);
        console.log('Dispatch Date Fields:', {
          dispatch_date: dispatchJson[0].dispatch_date,
          date: dispatchJson[0].date,
          dispatch_time: dispatchJson[0].dispatch_time
        });
        console.log('First 3 dispatch dates:', dispatchJson.slice(0, 3).map((r: any) => ({
          id: r.id,
          dispatch_date: r.dispatch_date,
          date: r.date
        })));
      }

      // Filter and calculate statistics for collection
      const allCollectionRecords = collectionJson || [];
      const collectionRecords = allCollectionRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
        const isInRange = recordDate >= dateRange.from && recordDate <= dateRange.to;
        
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
        
        console.log('Collection record in range:', {
          date: recordDate,
          quantity: r.quantity,
          clr: r.clr
        });
        return true;
      });
      console.log('Filtered Collection Records:', collectionRecords.length);
      const collectionStats = calculateStats(collectionRecords, 'collection');
      console.log('Collection Stats:', collectionStats);
      setCollectionData(collectionStats);

      // Filter and calculate statistics for dispatch
      const allDispatchRecords = dispatchJson || [];
      const dispatchRecords = allDispatchRecords.filter((r: any) => {
        const recordDate = r.dispatch_date || r.date;
        const isInRange = recordDate >= dateRange.from && recordDate <= dateRange.to;
        
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
        
        console.log('Dispatch filter check:', {
          id: r.id,
          dispatch_date: r.dispatch_date,
          date: r.date,
          recordDate: recordDate,
          dateRangeFrom: dateRange.from,
          dateRangeTo: dateRange.to,
          isInRange: isInRange
        });
        console.log('Dispatch record in range:', {
          date: recordDate,
          quantity: r.quantity,
          clr_value: r.clr_value,
          clr: r.clr
        });
        return isInRange;
      });
      console.log('Filtered Dispatch Records:', dispatchRecords.length);
      
      // Show data availability info
      if (dispatchRecords.length === 0 && allDispatchRecords.length > 0) {
        const dispatchDates = allDispatchRecords.map((r: any) => r.dispatch_date).sort();
        console.warn(`⚠️ NO DISPATCH DATA for ${dateRange.from} to ${dateRange.to}`);
        console.warn(`Available dispatch dates: ${dispatchDates[0]} to ${dispatchDates[dispatchDates.length - 1]}`);
      }
      
      const dispatchStats = calculateStats(dispatchRecords, 'dispatch');
      console.log('Dispatch Stats:', dispatchStats);
      setDispatchData(dispatchStats);

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: any[], type: string): ComparisonData => {
    console.log(`calculateStats for ${type}:`, records.length, 'records');
    
    if (records.length === 0) {
      console.log(`No ${type} records - returning zeros`);
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

    console.log(`Sample ${type} record:`, records[0]);

    const totalQuantity = records.reduce((sum, r) => {
      const qty = parseFloat(r.quantity) || 0;
      return sum + qty;
    }, 0);
    
    console.log(`${type} total quantity:`, totalQuantity);
    
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    
    const weightedFat = records.reduce((sum, r) => 
      sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    const weightedSnf = records.reduce((sum, r) => 
      sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    // Handle both 'clr' (collection) and 'clr_value' (dispatch) field names
    const weightedClr = records.reduce((sum, r) => {
      const clrValue = parseFloat(r.clr || r.clr_value) || 0;
      if (type === 'dispatch') {
        console.log(`Dispatch CLR - clr_value: ${r.clr_value}, clr: ${r.clr}, parsed: ${clrValue}, qty: ${r.quantity}`);
      }
      return sum + (clrValue * (parseFloat(r.quantity) || 0));
    }, 0) / (totalQuantity || 1);

    const result = {
      totalRecords: records.length,
      totalQuantity,
      weightedFat,
      weightedSnf,
      weightedClr,
      totalAmount,
      averageRate: totalAmount / (totalQuantity || 1)
    };
    
    console.log(`${type} calculated stats:`, result);
    return result;
  };

  const exportToCSV = () => {
    if (!collectionData || !dispatchData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    const csvContent = [
      'POORNASREE EQUIPMENTS - Collection vs Dispatch Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Period: ${dateRange.label} (${dateRange.from} to ${dateRange.to})`,
      '',
      'COMPARISON DATA',
      '',
      'Metric,Total Records,Total Quantity (L),Weighted FAT (%),Weighted SNF (%),Weighted CLR,Total Amount (Rs),Avg Rate (Rs/L)',
      `Collection,${collectionData.totalRecords},${collectionData.totalQuantity.toFixed(2)},${collectionData.weightedFat.toFixed(2)},${collectionData.weightedSnf.toFixed(2)},${collectionData.weightedClr.toFixed(2)},${collectionData.totalAmount.toFixed(2)},${collectionData.averageRate.toFixed(2)}`,
      `Dispatch,${dispatchData.totalRecords},${dispatchData.totalQuantity.toFixed(2)},${dispatchData.weightedFat.toFixed(2)},${dispatchData.weightedSnf.toFixed(2)},${dispatchData.weightedClr.toFixed(2)},${dispatchData.totalAmount.toFixed(2)},${dispatchData.averageRate.toFixed(2)}`,
      `Difference,${(collectionData.totalRecords - dispatchData.totalRecords).toFixed(0)},${(collectionData.totalQuantity - dispatchData.totalQuantity).toFixed(2)},${(collectionData.weightedFat - dispatchData.weightedFat).toFixed(2)},${(collectionData.weightedSnf - dispatchData.weightedSnf).toFixed(2)},${(collectionData.weightedClr - dispatchData.weightedClr).toFixed(2)},${(collectionData.totalAmount - dispatchData.totalAmount).toFixed(2)},${(collectionData.averageRate - dispatchData.averageRate).toFixed(2)}`,
      '',
      'SUMMARY',
      `Collection:,${collectionData.totalRecords} records,${collectionData.totalQuantity.toFixed(2)} L,Rs ${collectionData.totalAmount.toFixed(2)}`,
      `Dispatch:,${dispatchData.totalRecords} records,${dispatchData.totalQuantity.toFixed(2)} L,Rs ${dispatchData.totalAmount.toFixed(2)}`,
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
    a.download = `collection-dispatch-comparison-${dateRange.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!collectionData || !dispatchData) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Collection vs Dispatch Comparison - LactoConnect System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${dateRange.label} (${dateRange.from} to ${dateRange.to})`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPARISON DATA', 148.5, 28, { align: 'center' });

    autoTable(doc, {
      startY: 32,
      head: [['Metric', 'Total Records', 'Total Quantity (L)', 'Weighted FAT (%)', 'Weighted SNF (%)', 'Weighted CLR', 'Total Amount (Rs)', 'Avg Rate (Rs/L)']],
      body: [
        [
          'Collection',
          collectionData.totalRecords,
          collectionData.totalQuantity.toFixed(2),
          collectionData.weightedFat.toFixed(2),
          collectionData.weightedSnf.toFixed(2),
          collectionData.weightedClr.toFixed(2),
          collectionData.totalAmount.toFixed(2),
          collectionData.averageRate.toFixed(2)
        ],
        [
          'Dispatch',
          dispatchData.totalRecords,
          dispatchData.totalQuantity.toFixed(2),
          dispatchData.weightedFat.toFixed(2),
          dispatchData.weightedSnf.toFixed(2),
          dispatchData.weightedClr.toFixed(2),
          dispatchData.totalAmount.toFixed(2),
          dispatchData.averageRate.toFixed(2)
        ],
        [
          'Difference',
          (collectionData.totalRecords - dispatchData.totalRecords).toFixed(0),
          (collectionData.totalQuantity - dispatchData.totalQuantity).toFixed(2),
          (collectionData.weightedFat - dispatchData.weightedFat).toFixed(2),
          (collectionData.weightedSnf - dispatchData.weightedSnf).toFixed(2),
          (collectionData.weightedClr - dispatchData.weightedClr).toFixed(2),
          (collectionData.totalAmount - dispatchData.totalAmount).toFixed(2),
          (collectionData.averageRate - dispatchData.averageRate).toFixed(2)
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('COLLECTION SUMMARY', 14, finalY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let leftY = finalY + 6;
    doc.text(`Total Records: ${collectionData.totalRecords}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Quantity: ${collectionData.totalQuantity.toFixed(2)} L`, 14, leftY);
    leftY += 5;
    doc.text(`Total Amount: Rs ${collectionData.totalAmount.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted FAT: ${collectionData.weightedFat.toFixed(2)}%`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted SNF: ${collectionData.weightedSnf.toFixed(2)}%`, 14, leftY);

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

    doc.save(`collection-dispatch-comparison-${dateRange.from}.pdf`);
  };

  const getDifference = (collection: number, dispatch: number) => {
    const diff = collection - dispatch;
    const percentChange = dispatch !== 0 ? ((diff / dispatch) * 100) : 0;
    return { diff, percentChange };
  };

  const renderDifferenceCell = (collection: number, dispatch: number, decimals: number = 2) => {
    const { diff, percentChange } = getDifference(collection, dispatch);
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

  if (!collectionData || !dispatchData) {
    console.log('❌ NO COMPARISON DATA AVAILABLE');
    console.log('collectionData:', collectionData);
    console.log('dispatchData:', dispatchData);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">No data available for comparison</p>
      </div>
    );
  }

  console.log('✅ RENDERING COLLECTION VS DISPATCH COMPARISON');
  console.log('Collection Data:', JSON.stringify(collectionData, null, 2));
  console.log('Dispatch Data:', JSON.stringify(dispatchData, null, 2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Collection vs Dispatch Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing Collection and Dispatch data for {dateRange.label} ({dateRange.from} to {dateRange.to})
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BMC:
              </label>
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
          
          {/* Additional Filters */}
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

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Metric
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Total Records
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Total Quantity (L)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Weighted FAT (%)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Weighted SNF (%)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Weighted CLR
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Total Amount (₹)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                Avg Rate (₹/L)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Collection Row */}
            <tr className="bg-blue-50 dark:bg-blue-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Collection
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.totalRecords}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{collectionData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{collectionData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Dispatch Row */}
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Dispatch
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.totalRecords}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{dispatchData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{dispatchData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Difference Row */}
            <tr className="bg-yellow-50 dark:bg-yellow-900/20">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Difference (Collection - Dispatch)
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalRecords, dispatchData.totalRecords, 0)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalQuantity, dispatchData.totalQuantity)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedFat, dispatchData.weightedFat)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedSnf, dispatchData.weightedSnf)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedClr, dispatchData.weightedClr)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalAmount, dispatchData.totalAmount)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.averageRate, dispatchData.averageRate)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This comparison shows weighted average values for Collection vs Dispatch in the selected time period.
          Positive differences mean Collection values are higher, negative differences mean Dispatch values are higher.
        </p>
      </div>
    </div>
  );
}
