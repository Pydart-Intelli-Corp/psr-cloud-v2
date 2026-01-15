'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import FilterDropdown from '@/components/management/FilterDropdown';

interface ComparisonData {
  totalCollections: number;
  totalQuantity: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
  totalAmount: number;
  averageRate: number;
}

interface ComparisonSummaryProps {
  currentDate: { from: string; to: string; label: string };
  previousDate: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
}

export default function ComparisonSummary({ 
  currentDate, 
  previousDate,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange
}: ComparisonSummaryProps) {
  const [currentData, setCurrentData] = useState<ComparisonData | null>(null);
  const [previousData, setPreviousData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter data states
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  
  // Fetch filter options
  useEffect(() => {
    console.log('🔄 ComparisonSummary useEffect - Fetching filter options...');
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    console.log('📡 Starting fetchFilterOptions...');
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
  }, [currentDate, previousDate, dairyFilter, bmcFilter, societyFilter]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('===== Collection Comparison Debug =====');
      console.log('Current Date Range:', currentDate);
      console.log('Previous Date Range:', previousDate);
      
      // Fetch all collection data
      const response = await fetch(
        '/api/user/reports/collections',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        console.error('Collection API Error:', response.status, response.statusText);
        setLoading(false);
        return;
      }
      
      const json = await response.json();
      const allRecords = json || [];
      
      console.log('Total Collection Records Fetched:', allRecords.length);
      if (allRecords.length > 0) {
        console.log('Sample Collection Record:', allRecords[0]);
      }
      
      // Filter records for current period
      const currentRecords = allRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
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
        
        console.log('Current period collection match:', {
          date: recordDate,
          quantity: r.quantity,
          clr: r.clr,
          clr_value: r.clr_value
        });
        return true;
      });
      console.log('Current Period Collections Matched:', currentRecords.length);
      const currentStats = calculateStats(currentRecords);
      console.log('Current Stats:', currentStats);
      setCurrentData(currentStats);

      // Filter records for previous period
      const previousRecords = allRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
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
        
        console.log('Previous period collection match:', {
          date: recordDate,
          quantity: r.quantity,
          clr: r.clr,
          clr_value: r.clr_value
        });
        return true;
      });
      console.log('Previous Period Collections Matched:', previousRecords.length);
      const previousStats = calculateStats(previousRecords);
      console.log('Previous Stats:', previousStats);
      setPreviousData(previousStats);

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: any[]): ComparisonData => {
    console.log('calculateStats (Collection) called with', records.length, 'records');
    
    if (records.length === 0) {
      console.log('No collection records - returning zeros');
      return {
        totalCollections: 0,
        totalQuantity: 0,
        weightedFat: 0,
        weightedSnf: 0,
        weightedClr: 0,
        totalAmount: 0,
        averageRate: 0
      };
    }

    console.log('Sample collection record for calculation:', records[0]);

    const totalQuantity = records.reduce((sum, r) => {
      const qty = parseFloat(r.quantity) || 0;
      return sum + qty;
    }, 0);
    
    console.log('Collection total quantity:', totalQuantity);
    
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    
    const weightedFat = records.reduce((sum, r) => 
      sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    const weightedSnf = records.reduce((sum, r) => 
      sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    // Collection records use 'clr_value' field name
    const weightedClr = records.reduce((sum, r) => {
      const clrValue = parseFloat(r.clr_value || r.clr) || 0;
      console.log('Collection CLR - clr_value:', r.clr_value, 'clr:', r.clr, 'parsed:', clrValue);
      return sum + (clrValue * (parseFloat(r.quantity) || 0));
    }, 0) / (totalQuantity || 1);

    const result = {
      totalCollections: records.length,
      totalQuantity,
      weightedFat,
      weightedSnf,
      weightedClr,
      totalAmount,
      averageRate: totalAmount / (totalQuantity || 1)
    };
    
    console.log('Collection calculated stats result:', result);
    return result;
  };

  const getDifference = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;
    return { diff, percentChange };
  };

  const renderDifferenceCell = (current: number, previous: number, decimals: number = 2) => {
    const { diff, percentChange } = getDifference(current, previous);
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

  if (!currentData || !previousData) {
    console.log('❌ NO COLLECTION COMPARISON DATA');
    console.log('currentData:', currentData);
    console.log('previousData:', previousData);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">No data available for comparison</p>
      </div>
    );
  }

  console.log('✅ RENDERING COLLECTION COMPARISON');
  console.log('Current Collection Data:', JSON.stringify(currentData, null, 2));
  console.log('Previous Collection Data:', JSON.stringify(previousData, null, 2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Collection Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing weighted averages: {previousDate.label} ({previousDate.from}) vs {currentDate.label} ({currentDate.from})
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
                Total Collections
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
            {/* Current Period Row */}
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                {currentDate.label}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{currentData.totalCollections}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{currentData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{currentData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{currentData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{currentData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{currentData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{currentData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Previous Period Row */}
            <tr className="bg-blue-50 dark:bg-blue-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                {previousDate.label}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{previousData.totalCollections}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{previousData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{previousData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{previousData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{previousData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{previousData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{previousData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Difference Row */}
            <tr className="bg-yellow-50 dark:bg-yellow-900/20">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Difference
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.totalCollections, previousData.totalCollections, 0)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.totalQuantity, previousData.totalQuantity)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.weightedFat, previousData.weightedFat)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.weightedSnf, previousData.weightedSnf)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.weightedClr, previousData.weightedClr)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.totalAmount, previousData.totalAmount)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(currentData.averageRate, previousData.averageRate)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This comparison shows weighted average values calculated from all collection records in the selected time periods.
          Green indicates improvement, red indicates decline. Percentage changes show the relative difference between periods.
        </p>
      </div>
    </div>
  );
}
