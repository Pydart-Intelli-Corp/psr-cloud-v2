'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
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
  Building2,
  Users,
  Cog,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { FlowerSpinner } from '@/components';

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
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsComponent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [activeTab, setActiveTab] = useState<'collections' | 'dispatches' | 'sales'>('collections');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`/api/user/analytics?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics API error:', response.status, errorText);
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analytics data received:', result);
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Show error message to user
      alert('Failed to load analytics data. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
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

  // Calculate summary stats
  const getTotalStats = () => {
    const dailyData = activeTab === 'collections' 
      ? data.dailyCollections 
      : activeTab === 'dispatches' 
      ? data.dailyDispatches 
      : data.dailySales;

    const totalQuantity = dailyData.reduce((sum, d) => sum + Number(d.total_quantity || 0), 0);
    const totalAmount = dailyData.reduce((sum, d) => sum + Number(d.total_amount || 0), 0);
    const avgRate = dailyData.length > 0 
      ? dailyData.reduce((sum, d) => sum + Number(d.avg_rate || 0), 0) / dailyData.length 
      : 0;

    return { totalQuantity, totalAmount, avgRate };
  };

  const stats = getTotalStats();

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
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-green-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and trends
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={15}>Last 15 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'collections'
              ? 'border-green-600 text-green-600 dark:text-green-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab('dispatches')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'dispatches'
              ? 'border-green-600 text-green-600 dark:text-green-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Dispatches
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'sales'
              ? 'border-green-600 text-green-600 dark:text-green-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Sales
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalQuantity.toFixed(2)} L
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Milk className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rate/L</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{stats.avgRate.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quantity Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Quantity Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={activeTab === 'collections' 
              ? data.dailyCollections 
              : activeTab === 'dispatches' 
              ? data.dailyDispatches 
              : data.dailySales}
          >
            <defs>
              <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-gray-600 dark:text-gray-400" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total_quantity" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorQuantity)"
              name="Quantity (L)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weighted Parameters Trends (Collections only) */}
      {activeTab === 'collections' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quality Parameters Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyCollections}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="weighted_fat" stroke="#3b82f6" name="Fat %" strokeWidth={2} />
              <Line type="monotone" dataKey="weighted_snf" stroke="#f59e0b" name="SNF %" strokeWidth={2} />
              <Line type="monotone" dataKey="weighted_clr" stroke="#10b981" name="CLR" strokeWidth={2} />
              <Line type="monotone" dataKey="weighted_protein" stroke="#8b5cf6" name="Protein %" strokeWidth={2} />
              <Line type="monotone" dataKey="weighted_lactose" stroke="#ec4899" name="Lactose %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Amount vs Quantity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Amount vs Quantity Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={activeTab === 'collections' 
              ? data.dailyCollections 
              : activeTab === 'dispatches' 
              ? data.dailyDispatches 
              : data.dailySales}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis yAxisId="left" className="text-gray-600 dark:text-gray-400" />
            <YAxis yAxisId="right" orientation="right" className="text-gray-600 dark:text-gray-400" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="total_quantity" fill="#10b981" name="Quantity (L)" />
            <Bar yAxisId="right" dataKey="total_amount" fill="#3b82f6" name="Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Breakdown Pie Chart */}
        {activeTab === 'collections' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Shift-wise Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.shiftBreakdown}
                  dataKey="total_quantity"
                  nameKey="shift"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.shiftBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Breakdown Pie Chart */}
        {activeTab === 'collections' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Channel-wise Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.channelBreakdown}
                  dataKey="total_quantity"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.channelBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Dairy Breakdown Bar Chart */}
      {data.dairyBreakdown && data.dairyBreakdown.length > 0 && activeTab === 'collections' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Milk className="inline w-5 h-5 mr-2" />
            Dairy-wise Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dairyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="dairy_name" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total_quantity" fill="#10b981" name="Quantity (L)" />
              <Bar dataKey="total_amount" fill="#3b82f6" name="Amount (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* BMC Breakdown Bar Chart */}
      {data.bmcBreakdown && data.bmcBreakdown.length > 0 && activeTab === 'collections' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Building2 className="inline w-5 h-5 mr-2" />
            BMC-wise Performance (Top 20)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.bmcBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" className="text-gray-600 dark:text-gray-400" />
              <YAxis dataKey="bmc_name" type="category" width={150} className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total_quantity" fill="#10b981" name="Quantity (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Society Breakdown Bar Chart */}
      {data.societyBreakdown && data.societyBreakdown.length > 0 && activeTab === 'collections' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Users className="inline w-5 h-5 mr-2" />
            Society-wise Performance (Top 20)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.societyBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" className="text-gray-600 dark:text-gray-400" />
              <YAxis dataKey="society_name" type="category" width={150} className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total_quantity" fill="#3b82f6" name="Quantity (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Machine Breakdown Bar Chart */}
      {data.machineBreakdown && data.machineBreakdown.length > 0 && activeTab === 'collections' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Cog className="inline w-5 h-5 mr-2" />
            Machine-wise Performance (Top 20)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.machineBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="machine_id" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total_quantity" fill="#f59e0b" name="Quantity (L)" />
              <Bar dataKey="weighted_fat" fill="#3b82f6" name="Avg Fat %" />
              <Bar dataKey="weighted_snf" fill="#10b981" name="Avg SNF %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
