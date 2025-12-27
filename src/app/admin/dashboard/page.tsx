'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { FlowerSpinner, PageLoader } from '@/components';
import { 
  Building2, 
  Milk, 
  Users, 
  TrendingUp,
  TrendingDown,
  Droplet,
  Activity,
  Award,
  AlertCircle,
  Factory,
  UserCheck,
  Zap,
  Calendar,
  BarChart3,
  Gauge,
  Settings
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardAnalytics {
  overview: {
    entities: {
      totalDairies: number;
      totalBMCs: number;
      totalSocieties: number;
      totalFarmers: number;
      totalMachines: number;
    };
    collections: {
      totalCollections: number;
      totalQuantity: number;
      avgFat: number;
      avgSNF: number;
      activeFarmers: number;
      activeSocieties: number;
      collectionDays: number;
    };
    growth: {
      collectionsGrowth: string;
      quantityGrowth: string;
    };
  };
  topPerformers: {
    societies: Array<{
      name: string;
      society_id: string;
      totalCollections: number;
      totalQuantity: number;
      avgFat: number;
      avgSNF: number;
      bestFarmerName?: string;
      bestFarmerId?: string;
      bestFarmerQuantity?: number;
    }>;
    machines: Array<{
      machine_id: string;
      machine_type: string;
      totalCollections: number;
      totalQuantity: number;
      societyName: string;
      societyId?: string;
      societyLocation?: string;
      machineLocation?: string;
    }>;
    farmers: Array<{
      name: string;
      farmer_id: string;
      totalCollections: number;
      totalQuantity: number;
      avgFat: number;
      avgSNF: number;
      societyName: string;
    }>;
    bmcs: Array<{
      name: string;
      bmc_id: string;
      totalCollections: number;
      totalQuantity: number;
    }>;
    dairies: Array<{
      name: string;
      dairy_id: string;
      totalCollections: number;
      totalQuantity: number;
    }>;
  };
  recentActivity: Array<{
    collection_date: string;
    collection_time: string;
    quantity: number;
    fat: number;
    snf: number;
    farmerName: string;
    farmer_id: string;
    societyName: string;
    machineId: string;
  }>;
  qualityMetrics: Array<{
    period: string;
    avgFat: number;
    avgSNF: number;
    minFat: number;
    maxFat: number;
    minSNF: number;
    maxSNF: number;
  }>;
  trends: {
    daily: Array<{
      date: string;
      collections: number;
      quantity: number;
      avgFat: number;
      avgSNF: number;
    }>;
  };
  machines: {
    byType: Array<{
      machine_type: string;
      count: number;
      activeCount: number;
      onlineCount: number;
    }>;
  };
  sectionPulse: Array<{
    pulse_status: string;
    count: number;
  }>;
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
      }
      return;
    }

    fetchAnalytics();
  }, [user, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token available:', !!token);
      
      const response = await fetch('/api/user/dashboard/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch analytics';
        try {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          const text = await response.text();
          console.error('❌ Raw response:', text);
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Analytics loaded successfully');
      console.log('📊 Trends data:', result.data?.trends?.daily);
      setAnalytics(result.data);
    } catch (err: any) {
      console.error('💥 Analytics fetch error:', err);
      setError(err.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return <PageLoader />;
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Failed to load analytics'}
          </h2>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, topPerformers, recentActivity, qualityMetrics, trends, machines } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive overview of your dairy operations - Last 30 days
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Entities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Entities</p>
              <p className="text-3xl font-bold mt-2">
                {(overview.entities.totalDairies + overview.entities.totalBMCs + overview.entities.totalSocieties).toLocaleString()}
              </p>
              <div className="mt-3 space-y-1 text-xs">
                <p>🏢 {overview.entities.totalDairies} Dairies</p>
                <p>🥛 {overview.entities.totalBMCs} BMCs</p>
                <p>👥 {overview.entities.totalSocieties} Societies</p>
              </div>
            </div>
            <Factory className="w-12 h-12 text-emerald-200 opacity-80" />
          </div>
        </motion.div>

        {/* Total Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Collections</p>
              <p className="text-3xl font-bold mt-2">{overview.collections.totalCollections.toLocaleString()}</p>
              <div className="mt-2 flex items-center space-x-1">
                {parseFloat(overview.growth.collectionsGrowth) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {overview.growth.collectionsGrowth}% vs last week
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-2">
                {overview.collections.activeFarmers} active farmers
              </p>
            </div>
            <Droplet className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </motion.div>

        {/* Total Quantity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Quantity</p>
              <p className="text-3xl font-bold mt-2">{overview.collections.totalQuantity.toLocaleString()} L</p>
              <div className="mt-2 flex items-center space-x-1">
                {parseFloat(overview.growth.quantityGrowth) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {overview.growth.quantityGrowth}% vs last week
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-2">
                {overview.collections.collectionDays} collection days
              </p>
            </div>
            <Milk className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </motion.div>

        {/* Quality Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Avg Quality</p>
              <div className="mt-2 space-y-1">
                <div>
                  <p className="text-sm">Fat</p>
                  <p className="text-2xl font-bold">{overview.collections.avgFat}%</p>
                </div>
                <div>
                  <p className="text-sm">SNF</p>
                  <p className="text-2xl font-bold">{overview.collections.avgSNF}%</p>
                </div>
              </div>
            </div>
            <Gauge className="w-12 h-12 text-amber-200 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Collection Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Collection Trends (Last 30 Days)
          </h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends.daily}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              yAxisId="left"
              className="text-gray-600 dark:text-gray-400" 
              tick={{ fontSize: 12 }}
              label={{ value: 'Quantity (L)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              className="text-gray-600 dark:text-gray-400" 
              tick={{ fontSize: 12 }}
              label={{ value: 'Collections', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="quantity" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Quantity (L)"
              dot={{ fill: '#10b981' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="collections" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Collections"
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quality Metrics & Machine Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Gauge className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Metrics</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityMetrics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="period" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 11 }}
              />
              <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="avgFat" fill="#f59e0b" name="Avg Fat %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avgSNF" fill="#8b5cf6" name="Avg SNF %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Machine Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Machine Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={machines.byType}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry: any) => `${entry.machine_type}: ${entry.count} (${(entry.percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {machines.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                formatter={(value: any, name: any, props: any) => {
                  const { payload } = props;
                  return [
                    <div key="tooltip-content" className="space-y-1">
                      <div className="font-semibold text-white">{payload.machine_type}</div>
                      <div className="text-gray-300">Total: {value}</div>
                      <div className="text-emerald-400">Active: {payload.activeCount}</div>
                      <div className="text-blue-400">Online: {payload.onlineCount}</div>
                    </div>,
                    ''
                  ];
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value, entry: any) => `${entry.payload.machine_type}: ${entry.payload.count}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fat & SNF Quality Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Droplet className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Trends (30 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends.daily}>
              <defs>
                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSNF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400" 
                tick={{ fontSize: 11 }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '8px'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="avgFat" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorFat)"
                name="Fat %"
              />
              <Area 
                type="monotone" 
                dataKey="avgSNF" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorSNF)"
                name="SNF %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Collection Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Weekly Collection Volume</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={trends.daily.slice(-7).map((day, index) => ({
                day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                quantity: day.quantity,
                collections: day.collections,
                avgPerCollection: day.collections > 0 ? (day.quantity / day.collections).toFixed(1) : 0
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="day" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                className="text-gray-600 dark:text-gray-400" 
                tick={{ fontSize: 11 }}
                label={{ value: 'Quantity (L)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-gray-600 dark:text-gray-400" 
                tick={{ fontSize: 11 }}
                label={{ value: 'Collections', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Quantity (L)') return [`${Number(value).toLocaleString()} L`, 'Quantity'];
                  if (name === 'Collections') return [value, 'Collections'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                yAxisId="left"
                dataKey="quantity" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Quantity (L)"
              />
              <Bar 
                yAxisId="right"
                dataKey="collections" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Collections"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performers Grid - showing more sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Societies</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.societies.slice(0, 5).map((society, index) => (
              <div key={society.society_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{society.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {society.society_id}</p>
                    {society.bestFarmerName && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        ⭐ Best: {society.bestFarmerName} ({society.bestFarmerId}) - {Number(society.bestFarmerQuantity || 0).toLocaleString()} L
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{society.totalQuantity.toLocaleString()} L</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{society.totalCollections} collections</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Machines</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.machines.slice(0, 5).map((machine, index) => (
              <div key={machine.machine_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{machine.machine_id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{machine.machine_type}</p>
                    {machine.societyName && (
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                        🏢 {machine.societyName} {machine.societyId && `(${machine.societyId})`}
                      </p>
                    )}
                    {(machine.societyLocation || machine.machineLocation) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        📍 {machine.societyLocation || machine.machineLocation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{machine.totalCollections}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">collections</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top BMCs and Dairies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top BMCs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Milk className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top BMCs</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.bmcs.slice(0, 5).map((bmc, index) => (
              <div key={bmc.bmc_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{bmc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {bmc.bmc_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-cyan-600 dark:text-cyan-400">{bmc.totalQuantity.toLocaleString()} L</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{bmc.totalCollections} collections</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Dairies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Factory className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Dairies</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.dairies.slice(0, 5).map((dairy, index) => (
              <div key={dairy.dairy_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{dairy.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {dairy.dairy_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">{dairy.totalQuantity.toLocaleString()} L</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dairy.totalCollections} collections</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Farmers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Farmers (Last 30 Days)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topPerformers.farmers.slice(0, 6).map((farmer, index) => (
            <div key={`farmer-${farmer.farmer_id}-${index}`} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-green-200 dark:border-gray-600">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{farmer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {farmer.farmer_id}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Society:</span> {farmer.societyName}
                </p>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  {farmer.totalQuantity.toLocaleString()} L
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-green-200 dark:border-gray-600">
                  <span className="text-gray-500 dark:text-gray-400">{farmer.totalCollections} collections</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {farmer.avgFat}% / {farmer.avgSNF}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
