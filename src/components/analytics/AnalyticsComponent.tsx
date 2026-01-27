'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Milk,
  BarChart3,
  Calendar,
  RefreshCw,
  Users,
  PieChart as PieChartIcon,
  DollarSign,
  Droplet,
  Activity,
  Award,
  Eye,
  X,
} from 'lucide-react';
import { FlowerSpinner } from '@/components';
import StatsCard from '@/components/management/StatsCard';
import { FilterDropdown } from '@/components/management';

interface DailyData {
  date: string;
  total_collections?: number;
  total_dispatches?: number;
  total_sales?: number;
  total_quantity: number;
  total_amount: number;
  avg_rate: number;
  weighted_fat?: number;
  weighted_snf?: number;
  weighted_clr?: number;
  weighted_protein?: number;
  weighted_lactose?: number;
}

interface BreakdownData {
  [key: string]: string | number | undefined;
  dairy_name?: string;
  bmc_name?: string;
  society_name?: string;
  machine_id?: string;
  machine_type?: string;
  shift?: string;
  channel?: string;
  total_collections?: number;
  total_quantity: number;
  total_amount: number;
  avg_rate?: number;
  weighted_fat?: number;
  weighted_snf?: number;
  weighted_clr?: number;
}

interface AnalyticsData {
  dailyCollections: DailyData[];
  dailyDispatches: DailyData[];
  dailySales: DailyData[];
  dairyBreakdown: BreakdownData[];
  bmcBreakdown: BreakdownData[];
  societyBreakdown: BreakdownData[];
  machineBreakdown: BreakdownData[];
  shiftBreakdown: BreakdownData[];
  channelBreakdown: BreakdownData[];
  dairyDispatchBreakdown: BreakdownData[];
  bmcDispatchBreakdown: BreakdownData[];
  societyDispatchBreakdown: BreakdownData[];
  machineDispatchBreakdown: BreakdownData[];
  channelDispatchBreakdown: BreakdownData[];
  dairySalesBreakdown: BreakdownData[];
  bmcSalesBreakdown: BreakdownData[];
  societySalesBreakdown: BreakdownData[];
  machineSalesBreakdown: BreakdownData[];
  channelSalesBreakdown: BreakdownData[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsComponent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(0); // 0 = All Time
  const [activeTab, setActiveTab] = useState<'collections' | 'dispatches' | 'sales'>('collections');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('line');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Filter states
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState('all');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [pieBreakdownType, setPieBreakdownType] = useState<'society' | 'bmc' | 'dairy' | 'machine' | 'channel'>('society');
  const [initialLoading, setInitialLoading] = useState(true);
  const [machinesVersion, setMachinesVersion] = useState(0);

  // Filter data
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societiesData, setSocietiesData] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [machinesData, setMachinesData] = useState<Array<{ id: number; machineId: string; machineType: string; societyId?: number; societyName?: string; societyIdentifier?: string }>>([]);
  
  // Filter BMCs to only show those with data
  const bmcsWithData = useMemo(() => {
    if (!bmcs.length) return bmcs;
    return bmcs;
  }, [bmcs]);
  
  // Filter societies based on BMC selection - matching report management
  const societies = useMemo(() => {
    console.log('🔍 Society Filter Logic:', { 
      societiesDataLength: societiesData.length, 
      bmcFilterLength: bmcFilter.length,
      bmcFilter,
      sampleSociety: societiesData[0]
    });
    
    if (!societiesData.length) return [];
    
    // If BMC filter is active, only show societies from selected BMCs
    if (bmcFilter.length > 0) {
      const selectedBmcIds = bmcFilter.map(id => parseInt(id)).filter(id => !isNaN(id));
      console.log('✅ Selected BMC IDs:', selectedBmcIds);
      
      const filtered = societiesData.filter(society => 
        society.bmc_id !== undefined && selectedBmcIds.includes(society.bmc_id)
      );
      
      console.log('📊 Filtered Societies:', filtered.length, filtered.slice(0, 3));
      return filtered;
    }
    
    console.log('📊 All Societies:', societiesData.length);
    return societiesData;
  }, [societiesData, bmcFilter]);
  
  // Filter machines - matching report management
  const machines = useMemo(() => {
    if (!machinesData.length) return machinesData;
    return machinesData;
  }, [machinesData]);
  
  // Use ref to access current machines in fetchAnalytics without causing re-renders
  const machinesRef = useRef(machines);
  const urlFilterAppliedRef = useRef(false);
  const searchParamsRef = useRef(searchParams);
  const hasUrlFilterParam = useRef(false);
  
  // Update refs whenever values change
  useEffect(() => {
    machinesRef.current = machines;
    searchParamsRef.current = searchParams;
    
    // Check if URL has machine filter parameter on mount
    if (!hasUrlFilterParam.current) {
      const machineFilterParam = searchParams.get('machineFilter');
      hasUrlFilterParam.current = !!machineFilterParam;
    }
    
    console.log('🔄 Machines state updated, count:', machines.length, 
      'Sample:', machines.slice(0, 2).map(m => ({ id: m.id, machineId: m.machineId })));
  }, [machines, searchParams]);

  // Initialize machine filter from URL when machines are loaded (runs once)
  useEffect(() => {
    // Only apply URL filter after initial loading is complete
    if (initialLoading) {
      console.log('⏳ Waiting for filter data to load before applying URL filter');
      return;
    }
    
    const machineFilterParam = searchParamsRef.current.get('machineFilter');
    
    if (machineFilterParam && machinesRef.current.length > 0 && !urlFilterAppliedRef.current) {
      console.log('📌 Analytics - URL Params:', { machineFilter: machineFilterParam });
      console.log('📌 Available machines:', machinesRef.current.map(m => ({ id: m.id, machineId: m.machineId })));
      
      // Find machine by machineId string (e.g., "m103")
      const machine = machinesRef.current.find(m => m.machineId === machineFilterParam);
      
      if (machine) {
        console.log('✅ Applying URL machine filter:', machine.machineId, 'ID:', machine.id);
        urlFilterAppliedRef.current = true; // Mark as applied
        setMachineFilter([machine.id.toString()]);
      } else {
        console.warn('⚠️ Machine not found:', machineFilterParam);
        urlFilterAppliedRef.current = true; // Mark as attempted even if not found
      }
    } else if (!machineFilterParam) {
      // No URL filter param, mark as applied so we don't wait
      urlFilterAppliedRef.current = true;
    }
  }, [initialLoading]);

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Fetch dairies
        const dairyRes = await fetch('/api/user/dairy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dairyRes.ok) {
          const dairyData = await dairyRes.json();
          setDairies(dairyData.data || []);
        }

        // Fetch BMCs
        const bmcRes = await fetch('/api/user/bmc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bmcRes.ok) {
          const bmcData = await bmcRes.json();
          setBmcs(bmcData.data || []);
        }

        // Fetch Societies
        const societyRes = await fetch('/api/user/society', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (societyRes.ok) {
          const societyData = await societyRes.json();
          setSocietiesData(societyData.data || []);
        }

        // Fetch Machines
        const machineRes = await fetch('/api/user/machine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (machineRes.ok) {
          const machineData = await machineRes.json();
          const machineList = machineData.data || [];
          console.log('🔧 Fetched machines:', machineList.length, machineList.slice(0, 2));
          
          setMachinesData(machineList.map((m: { 
            machineId: string; 
            machineType?: string; 
            id?: number;
            societyId?: number;
            societyName?: string;
            societyIdentifier?: string;
          }) => ({ 
            id: m.id || 0, 
            machineId: m.machineId, 
            machineType: m.machineType || 'Unknown',
            societyId: m.societyId,
            societyName: m.societyName,
            societyIdentifier: m.societyIdentifier,
            collectionCount: 0
          })));
        }
        
        console.log('✅ Filter data loaded, ready for analytics fetch');
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        setInitialLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Calculate date range for custom dates
      const dateParams = useCustomDate && fromDate && toDate 
        ? `from=${fromDate}&to=${toDate}`
        : `days=${dateRange}`;

      // Build filter params
      const filterParams = new URLSearchParams();
      if (dairyFilter.length > 0) filterParams.append('dairy', dairyFilter.join(','));
      if (bmcFilter.length > 0) filterParams.append('bmc', bmcFilter.join(','));
      if (societyFilter.length > 0) filterParams.append('society', societyFilter.join(','));
      if (machineFilter.length > 0) {
        console.log('🔍 Machine Filter:', machineFilter, 'Available Machines:', machinesRef.current.length);
        // Convert machine database IDs to machine_id strings using ref
        const machineIds = machineFilter
          .map(id => {
            const machine = machinesRef.current.find(m => m.id.toString() === id);
            console.log('Converting ID:', id, 'to machineId:', machine?.machineId);
            return machine?.machineId;
          })
          .filter(Boolean);
        console.log('✅ Converted Machine IDs:', machineIds);
        if (machineIds.length > 0) {
          filterParams.append('machine', machineIds.join(','));
        }
      }
      if (channelFilter !== 'all') filterParams.append('channel', channelFilter);

      const queryString = filterParams.toString() ? `${dateParams}&${filterParams}` : dateParams;
      console.log('📡 Analytics API Query:', queryString);

      const response = await fetch(`/api/user/analytics?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Analytics API Error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to fetch analytics');
      }

      const result = await response.json();
      console.log('📊 Analytics API Response:', result);
      console.log('📅 Date Range:', useCustomDate ? `${fromDate} to ${toDate}` : `Last ${dateRange} days`);
      console.log('📈 Daily Collections:', result.dailyCollections?.length || 0, 'records');
      console.log('📈 Daily Dispatches:', result.dailyDispatches?.length || 0, 'records');
      console.log('📈 Daily Sales:', result.dailySales?.length || 0, 'records');
      
      // Log sample data to verify structure
      if (result.dailyCollections?.length > 0) {
        console.log('📋 Sample Collection Data:', result.dailyCollections[0]);
      }
      if (result.dailyDispatches?.length > 0) {
        console.log('📋 Sample Dispatch Data:', result.dailyDispatches[0]);
      }
      if (result.dailySales?.length > 0) {
        console.log('📋 Sample Sales Data:', result.dailySales[0]);
      }
      
      // Update machine collection counts FIRST (before setData) to avoid batching issues
      if (result.machineBreakdown && result.machineBreakdown.length > 0) {
        console.log('📊 Machine Breakdown Data:', result.machineBreakdown.slice(0, 3));
        
        // Create completely new machine objects with updated counts
        const updatedMachines = machinesRef.current.map(machine => {
          const machineStats = result.machineBreakdown.find(
            (m: { machine_id: string }) => m.machine_id === machine.machineId
          );
          const collectionCount = machineStats?.total_collections || 0;
          console.log(`  ${machine.machineId}: ${collectionCount} collections`);
          
          return {
            id: machine.id,
            machineId: machine.machineId,
            machineType: machine.machineType,
            societyId: machine.societyId,
            societyName: machine.societyName,
            societyIdentifier: machine.societyIdentifier,
            collectionCount
          };
        });
        
        console.log('✅ Updating machines with collection counts', updatedMachines.slice(0, 2));
        setMachinesData(updatedMachines);
        setMachinesVersion(prev => prev + 1);
      } else {
        console.log('⚠️ No machine breakdown data in analytics response');
      }

      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load analytics: ${errorMessage}`);
      setLoading(false);
    }
  }, [dateRange, fromDate, toDate, useCustomDate, refreshTrigger, dairyFilter, bmcFilter, societyFilter, machineFilter, channelFilter]);

  useEffect(() => {
    if (initialLoading) {
      console.log('⏳ Skipping analytics fetch, waiting for filter data to load');
      return;
    }
    
    // If URL has machine filter param, wait for it to be applied before fetching
    if (hasUrlFilterParam.current && !urlFilterAppliedRef.current) {
      console.log('⏳ Waiting for URL filter to be applied before fetching analytics');
      return;
    }
    
    console.log('🚀 Running fetchAnalytics with filters:', { 
      machineFilter, 
      dairyFilter, 
      bmcFilter, 
      societyFilter,
      machinesAvailable: machines.length,
      urlFilterApplied: urlFilterAppliedRef.current
    });
    fetchAnalytics();
  }, [fetchAnalytics, initialLoading, machineFilter]);

  if (initialLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FlowerSpinner size={64} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const dailyData = activeTab === 'collections' 
    ? data.dailyCollections 
    : activeTab === 'dispatches' 
    ? data.dailyDispatches 
    : data.dailySales;

  console.log(`📊 Active Tab: ${activeTab}, Daily Data Length: ${dailyData?.length || 0}`);
  if (dailyData?.length > 0) {
    console.log('📋 Sample Daily Data:', dailyData[0]);
  }

  // Filter data based on custom date range if applicable
  const filteredDailyData = useCustomDate && fromDate && toDate
    ? dailyData.filter(day => {
        const dayDate = new Date(day.date).toISOString().split('T')[0];
        return dayDate >= fromDate && dayDate <= toDate;
      })
    : dateRange > 0 ? dailyData.slice(-dateRange) : dailyData; // For preset, take last N days or all if dateRange is 0

  console.log(`🔍 Date Range: ${dateRange}, Use Custom: ${useCustomDate}, Filtered Data Length: ${filteredDailyData?.length || 0}`);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number | string;
      color: string;
      dataKey?: string;
      payload?: {
        name: string;
        value: number;
        amount?: number;
        collections?: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index: number) => {
            const numValue = typeof entry.value === 'number' ? entry.value : parseFloat(entry.value);
            const formattedValue = !isNaN(numValue) ? numValue.toFixed(2) : entry.value;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                {entry.name}: {formattedValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Enhanced Pie Chart Tooltip with detailed information
  const PieChartTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      fill?: string;
      payload: {
        name: string;
        value: number;
        amount: number;
        collections: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = payload[0].fill || '#10b981';
      const avgRate = data.value > 0 ? data.amount / data.value : 0;
      const totalQty = pieChartData.reduce((sum, s) => sum + s.value, 0);
      const percentage = (data.value / totalQty) * 100;
      
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow-2xl border-2 border-green-500 dark:border-green-400 min-w-[220px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <p className="font-bold text-gray-900 dark:text-white text-base">{data.name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Collections:</span>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{data.collections || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Quantity:</span>
              <span className="font-semibold text-sm text-green-600 dark:text-green-400">{data.value.toFixed(2)} L</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">₹{data.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Avg Rate:</span>
              <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">₹{avgRate.toFixed(2)}/L</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Share:</span>
                <span className="font-bold text-base text-orange-600 dark:text-orange-400">{percentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate contributions for pie chart based on breakdown type AND active tab
  const pieChartData = (() => {
    // Determine which breakdown data to use based on active tab
    const getBreakdownData = () => {
      switch (activeTab) {
        case 'dispatches':
          switch (pieBreakdownType) {
            case 'society':
              return data.societyDispatchBreakdown;
            case 'bmc':
              return data.bmcDispatchBreakdown;
            case 'dairy':
              return data.dairyDispatchBreakdown;
            case 'machine':
              return data.machineDispatchBreakdown;
            case 'channel':
              return data.channelDispatchBreakdown;
          }
          break;
        case 'sales':
          switch (pieBreakdownType) {
            case 'society':
              return data.societySalesBreakdown;
            case 'bmc':
              return data.bmcSalesBreakdown;
            case 'dairy':
              return data.dairySalesBreakdown;
            case 'machine':
              return data.machineSalesBreakdown;
            case 'channel':
              return data.channelSalesBreakdown;
          }
          break;
        default: // collections
          switch (pieBreakdownType) {
            case 'society':
              return data.societyBreakdown;
            case 'bmc':
              return data.bmcBreakdown;
            case 'dairy':
              return data.dairyBreakdown;
            case 'machine':
              return data.machineBreakdown;
            case 'channel':
              return data.channelBreakdown;
          }
      }
      return [];
    };

    const breakdownData = getBreakdownData();
    
    // Map the data based on breakdown type
    switch (pieBreakdownType) {
      case 'society':
        return breakdownData.map((item) => ({
          name: item.society_name || 'Unknown',
          value: Number(item.total_quantity || 0),
          amount: Number(item.total_amount || 0),
          collections: Number(item.total_collections || item.total_dispatches || item.total_sales || 0)
        })).filter(s => s.value > 0);
      case 'bmc':
        return breakdownData.map((item) => ({
          name: item.bmc_name || 'Unknown',
          value: Number(item.total_quantity || 0),
          amount: Number(item.total_amount || 0),
          collections: Number(item.total_collections || item.total_dispatches || item.total_sales || 0)
        })).filter(b => b.value > 0);
      case 'dairy':
        return breakdownData.map((item) => ({
          name: item.dairy_name || 'Unknown',
          value: Number(item.total_quantity || 0),
          amount: Number(item.total_amount || 0),
          collections: Number(item.total_collections || item.total_dispatches || item.total_sales || 0)
        })).filter(d => d.value > 0);
      case 'machine':
        return breakdownData.map((item) => ({
          name: `${item.machine_id || 'Unknown'} (${item.machine_type || 'N/A'})`,
          value: Number(item.total_quantity || 0),
          amount: Number(item.total_amount || 0),
          collections: Number(item.total_collections || item.total_dispatches || item.total_sales || 0)
        })).filter(m => m.value > 0);
      case 'channel':
        return breakdownData.map((item) => ({
          name: item.channel || 'Unknown',
          value: Number(item.total_quantity || 0),
          amount: Number(item.total_amount || 0),
          collections: Number(item.total_collections || item.total_dispatches || item.total_sales || 0)
        })).filter(c => c.value > 0);
      default:
        return [];
    }
  })();

  // Legacy variable for backward compatibility
  const societyContributions = pieChartData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive milk collection insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Controls */}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="preset"
                checked={!useCustomDate}
                onChange={() => {
                  setUseCustomDate(false);
                  setRefreshTrigger(prev => prev + 1);
                }}
                className="w-3.5 h-3.5 text-green-600"
              />
              <label htmlFor="preset" className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Preset
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(parseInt(e.target.value));
                  if (!useCustomDate) {
                    setRefreshTrigger(prev => prev + 1);
                  }
                }}
                disabled={useCustomDate}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>All Time</option>
                <option value={7}>7 Days</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="custom"
                checked={useCustomDate}
                onChange={() => setUseCustomDate(true)}
                className="w-3.5 h-3.5 text-green-600"
              />
              <label htmlFor="custom" className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Custom
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={!useCustomDate}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={!useCustomDate}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            {(() => {
              const totalCount = filteredDailyData.reduce((sum, day) => sum + (day.total_collections || day.total_dispatches || day.total_sales || 0), 0);
              const totalQty = Number(filteredDailyData.reduce((sum, day) => sum + (Number(day.total_quantity) || 0), 0));
              const totalAmt = Number(filteredDailyData.reduce((sum, day) => sum + (Number(day.total_amount) || 0), 0));
              const avgRate = totalQty > 0 ? totalAmt / totalQty : 0;

              return (
                <>
                  <StatsCard
                    title={`Total ${activeTab === 'collections' ? 'Collections' : activeTab === 'dispatches' ? 'Dispatches' : 'Sales'}`}
                    value={totalCount}
                    icon={<Droplet className="w-full h-full" />}
                    color="blue"
                  />
                  <StatsCard
                    title="Total Quantity (L)"
                    value={parseFloat(totalQty.toFixed(2))}
                    icon={<BarChart3 className="w-full h-full" />}
                    color="green"
                  />
                  <StatsCard
                    title="Total Amount (₹)"
                    value={`₹${parseFloat(totalAmt.toFixed(2))}`}
                    icon={<DollarSign className="w-full h-full" />}
                    color="yellow"
                  />
                  <StatsCard
                    title="Average Rate (₹/L)"
                    value={`₹${avgRate.toFixed(2)}`}
                    icon={<Activity className="w-full h-full" />}
                    color="blue"
                  />
                  <StatsCard
                    title={`Top Society: ${data?.societyBreakdown[0]?.society_name || 'N/A'}`}
                    value={`${data?.societyBreakdown[0]?.total_quantity ? Number(data.societyBreakdown[0].total_quantity).toFixed(2) : '0.00'} L`}
                    icon={<Award className="w-full h-full" />}
                    color="yellow"
                  />
                  <StatsCard
                    title={`Top Machine: ${data?.machineBreakdown[0]?.machine_id || 'N/A'}`}
                    value={`${data?.machineBreakdown[0]?.total_quantity ? Number(data.machineBreakdown[0].total_quantity).toFixed(2) : '0.00'} L`}
                    icon={<Activity className="w-full h-full" />}
                    color="blue"
                  />
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <FilterDropdown
          key={`filters-${machinesVersion}`}
          statusFilter="all"
          onStatusChange={() => {}}
          dairyFilter={dairyFilter}
          onDairyChange={(value) => setDairyFilter(Array.isArray(value) ? value : [value])}
          bmcFilter={bmcFilter}
          onBmcChange={(value) => setBmcFilter(Array.isArray(value) ? value : [value])}
          societyFilter={societyFilter}
          onSocietyChange={(value) => setSocietyFilter(Array.isArray(value) ? value : [value])}
          machineFilter={machineFilter}
          onMachineChange={(value) => setMachineFilter(Array.isArray(value) ? value : [value])}
          dairies={dairies}
          bmcs={bmcsWithData}
          societies={societies}
          machines={machines}
          filteredCount={0}
          totalCount={0}
          searchQuery=""
          onSearchChange={() => {}}
          icon={<BarChart3 className="w-5 h-5" />}
          channelFilter={channelFilter}
          onChannelChange={setChannelFilter}
          showChannelFilter
          showMachineFilter
          hideMainFilterButton={true}
        />
      </div>

      {/* Chart Type Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {activeTab === 'collections' ? 'Collection' : activeTab === 'dispatches' ? 'Dispatch' : 'Sales'} Trends
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Data Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('collections')}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'collections'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Milk className="w-4 h-4 inline mr-2" />
                Collections
              </button>
              <button
                onClick={() => setActiveTab('dispatches')}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'dispatches'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Dispatches
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'sales'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Sales
              </button>
            </div>

            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Chart Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  chartType === 'line'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  chartType === 'bar'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  chartType === 'pie'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <PieChartIcon className="w-4 h-4 inline mr-2" />
                Pie
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Chart Modal */}
      {expandedChart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExpandedChart(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{expandedChart}</h3>
              <button
                onClick={() => setExpandedChart(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Chart Info Overlay - Minimal, Top Right, Auto-fade */}
            <div className="absolute top-20 right-6 z-20 bg-white/70 dark:bg-gray-800/70 hover:bg-white/95 hover:dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-2.5 text-[10px] max-w-[200px] transition-all duration-300 opacity-40 hover:opacity-100">
              <div className="space-y-1.5">
                {/* Time Range */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Period:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {useCustomDate && fromDate && toDate 
                      ? `${new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
                      : dateRange === 0 
                      ? 'All Time'
                      : `${dateRange}d`
                    }
                  </span>
                </div>

                {/* Data Points & Type Combined */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Data:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {filteredDailyData.length}pts • {chartType}
                  </span>
                </div>

                {/* Range & Avg Combined */}
                {filteredDailyData.length > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Stats:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {(() => {
                        const dataKey = 
                          expandedChart === 'Weighted FAT (%)' ? 'weighted_fat' :
                          expandedChart === 'Weighted SNF (%)' ? 'weighted_snf' :
                          expandedChart === 'Weighted CLR' ? 'weighted_clr' :
                          expandedChart === 'Average Rate (₹/L)' ? 'avg_rate' :
                          expandedChart === 'Total Quantity (Liters)' ? 'total_quantity' :
                          expandedChart === 'Total Amount (₹)' ? 'total_amount' : null;
                        
                        if (dataKey) {
                          const values = filteredDailyData.map(d => Number(d[dataKey as keyof DailyData]) || 0);
                          const avg = values.reduce((a, b) => a + b, 0) / values.length;
                          return `Avg ${avg.toFixed(2)}`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                )}

                {/* Active Filters */}
                {(() => {
                  const filters = [];
                  if (dairyFilter.length > 0) filters.push(`D:${dairyFilter.length}`);
                  if (bmcFilter.length > 0) filters.push(`B:${bmcFilter.length}`);
                  if (societyFilter.length > 0) filters.push(`S:${societyFilter.length}`);
                  if (machineFilter.length > 0) filters.push(`M:${machineFilter.length}`);
                  if (channelFilter !== 'all') filters.push(channelFilter.substring(0, 3));
                  
                  if (filters.length > 0) {
                    return (
                      <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 mb-0.5">Filters:</div>
                        <div className="text-gray-900 dark:text-white font-semibold text-[9px]">
                          {filters.join(' • ')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="p-6">
              <ResponsiveContainer width="100%" height={600}>
                {(() => {
                  const renderChart = () => {
                    switch (expandedChart) {
                      case 'Weighted FAT (%)':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'FAT (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="weighted_fat" stroke="#10b981" strokeWidth={3} name="FAT %" dot={{ fill: '#10b981', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'FAT (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="weighted_fat" fill="#10b981" name="FAT %" />
                          </BarChart>
                        );
                      case 'Weighted SNF (%)':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'SNF (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="weighted_snf" stroke="#3b82f6" strokeWidth={3} name="SNF %" dot={{ fill: '#3b82f6', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'SNF (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="weighted_snf" fill="#3b82f6" name="SNF %" />
                          </BarChart>
                        );
                      case 'Weighted CLR':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'CLR Value', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="weighted_clr" stroke="#f59e0b" strokeWidth={3} name="CLR" dot={{ fill: '#f59e0b', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'CLR Value', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="weighted_clr" fill="#f59e0b" name="CLR" />
                          </BarChart>
                        );
                      case 'Average Rate (₹/L)':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Rate (₹/L)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="avg_rate" stroke="#8b5cf6" strokeWidth={3} name="Rate (₹/L)" dot={{ fill: '#8b5cf6', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Rate (₹/L)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="avg_rate" fill="#8b5cf6" name="Rate (₹/L)" />
                          </BarChart>
                        );
                      case 'Total Sales Count':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Sales Count', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="total_sales" stroke="#06b6d4" strokeWidth={3} name="Sales Count" dot={{ fill: '#06b6d4', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Sales Count', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="total_sales" fill="#06b6d4" name="Sales Count" />
                          </BarChart>
                        );
                      case 'Total Quantity (Liters)':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Quantity (Liters)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="total_quantity" stroke="#ec4899" strokeWidth={3} name="Quantity (L)" dot={{ fill: '#ec4899', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Quantity (Liters)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="total_quantity" fill="#ec4899" name="Quantity (L)" />
                          </BarChart>
                        );
                      case 'Total Amount (₹)':
                        return chartType === 'line' ? (
                          <LineChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Line type="monotone" dataKey="total_amount" stroke="#ef4444" strokeWidth={3} name="Amount (₹)" dot={{ fill: '#ef4444', r: 4 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={filteredDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14 }} 
                              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 14 }} />
                            <Bar dataKey="total_amount" fill="#ef4444" name="Amount (₹)" />
                          </BarChart>
                        );
                      case 'Society-wise Milk Contributions':
                        return (
                          <PieChart>
                            <Pie
                              data={societyContributions}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={200}
                              label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}L`}
                              labelLine
                            >
                              {societyContributions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} formatter={(value) => value} />
                          </PieChart>
                        );
                      default:
                        return null;
                    }
                  };
                  return renderChart();
                })()}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid - Hidden when pie chart is active */}
      {chartType !== 'pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weighted FAT - Hidden for Sales */}
          {activeTab !== 'sales' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Weighted FAT (%)</h3>
                <button
                  onClick={() => setExpandedChart('Weighted FAT (%)')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Expand chart"
                >
                  <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'line' ? (
                  <LineChart data={filteredDailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="weighted_fat" stroke="#10b981" strokeWidth={3} name="FAT %" dot={{ fill: '#10b981', r: 4 }} />
                  </LineChart>
                ) : (
                  <BarChart data={filteredDailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="weighted_fat" fill="#10b981" name="FAT %" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

        {/* Weighted SNF - Hidden for Sales */}
        {activeTab !== 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Weighted SNF (%)</h3>
              <button
                onClick={() => setExpandedChart('Weighted SNF (%)')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Expand chart"
              >
                <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="weighted_snf" stroke="#3b82f6" strokeWidth={3} name="SNF %" dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="weighted_snf" fill="#3b82f6" name="SNF %" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Weighted CLR - Hidden for Sales */}
        {activeTab !== 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Weighted CLR</h3>
              <button
                onClick={() => setExpandedChart('Weighted CLR')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Expand chart"
              >
                <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="weighted_clr" stroke="#f59e0b" strokeWidth={3} name="CLR" dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="weighted_clr" fill="#f59e0b" name="CLR" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Average Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Average Rate (₹/L)</h3>
            <button
              onClick={() => setExpandedChart('Average Rate (₹/L)')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Expand chart"
            >
              <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="avg_rate" stroke="#8b5cf6" strokeWidth={3} name="Rate (₹/L)" dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            ) : (
              <BarChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="avg_rate" fill="#8b5cf6" name="Rate (₹/L)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Total Count - Only for Sales */}
        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Total Sales Count</h3>
              <button
                onClick={() => setExpandedChart('Total Sales Count')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Expand chart"
              >
                <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="total_sales" stroke="#06b6d4" strokeWidth={3} name="Sales Count" dot={{ fill: '#06b6d4', r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={filteredDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total_sales" fill="#06b6d4" name="Sales Count" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Total Quantity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Total Quantity (Liters)</h3>
            <button
              onClick={() => setExpandedChart('Total Quantity (Liters)')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Expand chart"
            >
              <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="total_quantity" stroke="#ec4899" strokeWidth={3} name="Quantity (L)" dot={{ fill: '#ec4899', r: 4 }} />
              </LineChart>
            ) : (
              <BarChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_quantity" fill="#ec4899" name="Quantity (L)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Total Amount */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Total Amount (₹)</h3>
            <button
              onClick={() => setExpandedChart('Total Amount (₹)')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Expand chart"
            >
              <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="total_amount" stroke="#ef4444" strokeWidth={3} name="Amount (₹)" dot={{ fill: '#ef4444', r: 4 }} />
              </LineChart>
            ) : (
              <BarChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_amount" fill="#ef4444" name="Amount (₹)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        </div>
      )}

      {/* Enhanced Pie Chart - Only visible when Pie chart type is active */}
      {chartType === 'pie' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'collections' ? 'Collection' : activeTab === 'dispatches' ? 'Dispatch' : 'Sales'} Distribution
              </h2>
            </div>
            
            {/* Breakdown Type Toggle */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">Break down by:</span>
              <button
                onClick={() => setPieBreakdownType('society')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  pieBreakdownType === 'society'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Society
              </button>
              <button
                onClick={() => setPieBreakdownType('bmc')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  pieBreakdownType === 'bmc'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                BMC
              </button>
              <button
                onClick={() => setPieBreakdownType('dairy')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  pieBreakdownType === 'dairy'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Dairy
              </button>
              <button
                onClick={() => setPieBreakdownType('machine')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  pieBreakdownType === 'machine'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Machine
              </button>
              <button
                onClick={() => setPieBreakdownType('channel')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  pieBreakdownType === 'channel'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Channel
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}L`}
                labelLine
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieChartTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Enhanced Details Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    {pieBreakdownType.charAt(0).toUpperCase() + pieBreakdownType.slice(1)} Name
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Collections</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Quantity (L)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Amount (₹)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">% Share</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Avg Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pieChartData.map((item, index) => {
                  const totalQty = pieChartData.reduce((sum, s) => sum + s.value, 0);
                  const percentage = (item.value / totalQty) * 100;
                  const avgRate = item.value > 0 ? item.amount / item.value : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{item.collections || 0}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{item.value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">₹{avgRate.toFixed(2)}/L</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                <tr>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    {pieChartData.reduce((sum, s) => sum + (s.collections || 0), 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    {pieChartData.reduce((sum, s) => sum + s.value, 0).toFixed(2)} L
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    ₹{pieChartData.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">100%</td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    ₹{(
                      pieChartData.reduce((sum, s) => sum + s.value, 0) > 0
                        ? pieChartData.reduce((sum, s) => sum + s.amount, 0) / pieChartData.reduce((sum, s) => sum + s.value, 0)
                        : 0
                    ).toFixed(2)}/L
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
