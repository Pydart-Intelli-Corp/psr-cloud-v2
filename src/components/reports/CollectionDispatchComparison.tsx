'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import FilterDropdown from '@/components/management/FilterDropdown';

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
}

export default function CollectionDispatchComparison({ 
  dateRange,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange
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

  useEffect(() => {
    fetchComparisonData();
  }, [dateRange, dairyFilter, bmcFilter, societyFilter]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('===== Collection vs Dispatch Comparison Debug =====');
      console.log('Date Range:', dateRange);
      
      // Fetch all collection data
      const collectionRes = await fetch(
        '/api/user/reports/collections',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!collectionRes.ok) {
        console.error('Collection API Error:', collectionRes.status, collectionRes.statusText);
        setLoading(false);
        return;
      }
      
      const collectionJson = await collectionRes.json();
      
      // Fetch all dispatch data
      const dispatchRes = await fetch(
        '/api/user/reports/dispatches',
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-psr-green-600"></div>
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
          
          {/* Filter Dropdown */}
          {onDairyChange && onBmcChange && onSocietyChange && (() => {
            console.log('FilterDropdown Render - Societies:', societies.length, societies);
            console.log('FilterDropdown Render - Dairies:', dairies.length);
            console.log('FilterDropdown Render - BMCs:', bmcs.length);
            console.log('FilterDropdown Render - SocietyFilter:', societyFilter);
            return true;
          })() && (
            <div className="flex-shrink-0">
              <FilterDropdown
                statusFilter="all"
                onStatusChange={() => {}}
                dairyFilter={dairyFilter}
                onDairyChange={(value) => onDairyChange(Array.isArray(value) ? value : [value])}
                bmcFilter={bmcFilter}
                onBmcChange={(value) => onBmcChange(Array.isArray(value) ? value : [value])}
                societyFilter={Array.isArray(societyFilter) ? societyFilter : []}
                onSocietyChange={(value) => onSocietyChange(Array.isArray(value) ? value : [value])}
                machineFilter="all"
                onMachineChange={() => {}}
                dairies={dairies}
                bmcs={bmcs}
                societies={societies}
                machines={[]}
                filteredCount={0}
                totalCount={0}
                hideMainFilterButton={true}
                hideSocietyFilter={false}
                showShiftFilter={false}
                showMachineFilter={false}
                showFarmerFilter={false}
                showDateFilter={false}
                showChannelFilter={false}
              />
            </div>
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
