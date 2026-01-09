'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FlowerSpinner, PageLoader } from '@/components';
import { 
  Building2, 
  Users, 
  TrendingUp,
  TrendingDown,
  Droplet,
  Activity,
  AlertCircle,
  Calendar,
  Gauge,
  Milk,
  MonitorSmartphone,
  BarChart3,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SocietyUser {
  id: number;
  societyId: string;
  name: string;
  email: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId?: number;
  bmcName?: string;
  dairyId?: number;
  dairyName?: string;
  schema: string;
  dbKey?: string;
}

interface SocietyAnalytics {
  overview: {
    society: {
      name: string;
      location: string;
      presidentName: string;
      bmcName: string;
      dairyName: string;
    };
    entities: {
      totalFarmers: number;
      activeFarmers: number;
      totalMachines: number;
      activeMachines: number;
    };
    collections: {
      totalCollections: number;
      totalQuantity: number;
      avgFat: number;
      avgSNF: number;
      totalRevenue: number;
      collectionDays: number;
    };
    growth: {
      collectionsGrowth: string;
      quantityGrowth: string;
    };
  };
  topPerformers: {
    farmers: Array<{
      name: string;
      farmer_id: string;
      totalCollections: number;
      totalQuantity: number;
      avgFat: number;
      avgSNF: number;
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
    channel: string;
  }>;
  trends: {
    daily: Array<{
      date: string;
      totalQuantity: number;
      collections: number;
      avgFat: number;
      avgSnf: number;
    }>;
  };
  qualityMetrics: {
    avgFatByChannel: Array<{
      channel: string;
      avgFat: number;
      avgSnf: number;
      count: number;
    }>;
  };
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function SocietyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SocietyUser | null>(null);
  const [analytics, setAnalytics] = useState<SocietyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get society data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.type === 'society' || parsedUser.role === 'society') {
          const societyUser: SocietyUser = {
            id: parsedUser.id,
            societyId: parsedUser.societyId || parsedUser.uid,
            name: parsedUser.name,
            email: parsedUser.email,
            location: parsedUser.location,
            presidentName: parsedUser.presidentName,
            contactPhone: parsedUser.contactPhone,
            bmcId: parsedUser.bmcId,
            bmcName: parsedUser.bmcName,
            dairyId: parsedUser.dairyId,
            dairyName: parsedUser.dairyName,
            schema: parsedUser.schema || parsedUser.schemaName,
            dbKey: parsedUser.dbKey || parsedUser.schema
          };
          setUser(societyUser);
          fetchAnalytics(societyUser);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchAnalytics = async (societyUser: SocietyUser) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `/api/society/analytics?societyId=${societyUser.societyId}&schemaName=${societyUser.schema}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Fall back to stats API if analytics doesn't exist
        const statsResponse = await fetch(
          `/api/society/stats?societyId=${societyUser.societyId}&schemaName=${societyUser.schema}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          // Convert stats to analytics format
          const convertedAnalytics: SocietyAnalytics = {
            overview: {
              society: {
                name: societyUser.name,
                location: societyUser.location || '',
                presidentName: societyUser.presidentName || '',
                bmcName: societyUser.bmcName || '',
                dairyName: societyUser.dairyName || ''
              },
              entities: {
                totalFarmers: statsResult.data?.totalFarmers || 0,
                activeFarmers: statsResult.data?.activeFarmers || 0,
                totalMachines: 0,
                activeMachines: 0
              },
              collections: {
                totalCollections: statsResult.data?.totalCollections || 0,
                totalQuantity: statsResult.data?.totalQuantity || 0,
                avgFat: statsResult.data?.avgFat || 0,
                avgSNF: statsResult.data?.avgSNF || 0,
                totalRevenue: statsResult.data?.totalRevenue || 0,
                collectionDays: 0
              },
              growth: {
                collectionsGrowth: '0',
                quantityGrowth: statsResult.data?.lastMonthQuantity > 0 
                  ? (((statsResult.data?.thisMonthQuantity - statsResult.data?.lastMonthQuantity) / statsResult.data?.lastMonthQuantity) * 100).toFixed(1)
                  : '0'
              }
            },
            topPerformers: { farmers: [] },
            recentActivity: [],
            trends: { daily: [] },
            qualityMetrics: { avgFatByChannel: [] }
          };
          setAnalytics(convertedAnalytics);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setAnalytics(result.data);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      fetchAnalytics(user);
    }
  };

  if (loading || !user) {
    return <PageLoader />;
  }

  if (error || !analytics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Failed to load analytics'}
          </h2>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, topPerformers, recentActivity, trends, qualityMetrics } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user.presidentName || user.name} - Last 30 days overview
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {overview.society.bmcName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-indigo-700 dark:text-indigo-300">{overview.society.bmcName}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Farmers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Farmers</p>
              <p className="text-3xl font-bold mt-2">
                {overview.entities.totalFarmers.toLocaleString()}
              </p>
              <div className="mt-3 text-xs">
                <p className="text-indigo-100">
                  ✓ {overview.entities.activeFarmers} Active
                </p>
              </div>
            </div>
            <Users className="w-12 h-12 text-indigo-200 opacity-80" />
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
                  {overview.growth.collectionsGrowth}%
                </span>
              </div>
            </div>
            <Droplet className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </motion.div>

        {/* Total Quantity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Quantity</p>
              <p className="text-3xl font-bold mt-2">{overview.collections.totalQuantity.toLocaleString()} L</p>
              <div className="mt-2 flex items-center space-x-1">
                {parseFloat(overview.growth.quantityGrowth) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {overview.growth.quantityGrowth}% vs last month
                </span>
              </div>
            </div>
            <Milk className="w-12 h-12 text-emerald-200 opacity-80" />
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
                  <p className="text-2xl font-bold">{overview.collections.avgFat.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm">SNF</p>
                  <p className="text-2xl font-bold">{overview.collections.avgSNF.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            <Gauge className="w-12 h-12 text-amber-200 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Revenue Card */}
      {overview.collections.totalRevenue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue (Last 30 Days)</p>
              <p className="text-4xl font-bold mt-2">₹{overview.collections.totalRevenue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-16 h-16 text-green-200 opacity-60" />
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trends Chart */}
        {trends.daily.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Collection Trends
              </h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends.daily}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toFixed(2), '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalQuantity" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={false}
                  name="Quantity (L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Quality by Channel */}
        {qualityMetrics.avgFatByChannel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quality by Channel
              </h2>
              <Gauge className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={qualityMetrics.avgFatByChannel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avgFat" fill="#6366f1" name="Fat %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgSnf" fill="#10b981" name="SNF %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Top Farmers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Farmers */}
        {topPerformers.farmers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top Performing Farmers
            </h2>
            <div className="space-y-3">
              {topPerformers.farmers.slice(0, 5).map((farmer, index) => (
                <div key={farmer.farmer_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{farmer.name}</p>
                      <p className="text-xs text-gray-500">{farmer.farmer_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{farmer.totalQuantity.toFixed(1)} L</p>
                    <p className="text-xs text-gray-500">{farmer.totalCollections} collections</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Collections
            </h2>
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {recentActivity.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{activity.farmerName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.collection_date).toLocaleDateString()} • {activity.channel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{activity.quantity.toFixed(1)} L</p>
                    <p className="text-xs text-gray-500">Fat: {activity.fat.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Society Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Society Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-500">Society Name</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            </div>
          </div>
          {user.location && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.location}</p>
              </div>
            </div>
          )}
          {user.bmcName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">BMC</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.bmcName}</p>
              </div>
            </div>
          )}
          {user.dairyName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Milk className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Dairy</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.dairyName}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
