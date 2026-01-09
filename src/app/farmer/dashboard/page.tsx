'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Milk, 
  User, 
  Calendar,
  TrendingUp,
  Droplet,
  Award,
  LogOut,
  Building2,
  Phone,
  Mail,
  Activity,
  FileText,
  BarChart3,
  DollarSign,
  Download,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import { FlowerSpinner, FilterDropdown } from '@/components';

interface FarmerData {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  societyId?: number;
  societyName?: string;
  societyIdentifier?: string;
  dbKey: string;
}

interface CollectionStats {
  totalCollections: number;
  totalQuantity: number;
  avgFat: number;
  avgSNF: number;
  lastCollectionDate: string;
  thisMonthQuantity: number;
  lastMonthQuantity: number;
}

interface CollectionRecord {
  id: number;
  collectionDate: string;
  collectionTime: string;
  shiftType: string;
  channel: string;
  quantity: number;
  fatPercentage: number;
  snfPercentage: number;
  clrValue: number;
  ratePerLiter: number;
  totalAmount: number;
}

interface RateChartData {
  id: number;
  channel: string;
  uploadedAt: string;
  fileName: string;
  recordCount: number;
  status: number;
  isShared?: boolean;
  rateData?: Array<{
    clr: number;
    fat: number;
    snf: number;
    rate: number;
  }>;
}

type ViewMode = 'overview' | 'reports' | 'analytics' | 'ratechart';

export default function FarmerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [rateCharts, setRateCharts] = useState<RateChartData[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingRateCharts, setLoadingRateCharts] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({ from: '', to: '' });
  const router = useRouter();

  useEffect(() => {
    // Get farmer data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('👤 User data from localStorage:', parsedUser);
        if (parsedUser.role === 'farmer') {
          setFarmer(parsedUser);
          fetchFarmerStats(parsedUser.uid, parsedUser.dbKey);
        } else {
          // Not a farmer, redirect to appropriate dashboard
          console.log('⚠️ User is not a farmer, redirecting...');
          setTimeout(() => router.push('/login'), 100);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setTimeout(() => router.push('/login'), 100);
      }
    } else {
      console.log('⚠️ No user data found, redirecting to login...');
      setTimeout(() => router.push('/login'), 100);
    }
  }, [router]);

  const fetchFarmerStats = async (farmerId: string, dbKey: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/farmer/stats?farmerId=${farmerId}&dbKey=${dbKey}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching farmer stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const fetchCollections = async (farmerId: string, dbKey: string, dateFrom?: string, dateTo?: string) => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('authToken');
      let url = `/api/farmer/collections?farmerId=${farmerId}&dbKey=${dbKey}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;

      console.log('📊 Fetching collections with URL:', url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Collections API response:', result);
        if (result.success && result.data) {
          console.log(`📊 Setting ${result.data.length} collections in state`);
          if (result.data.length > 0) {
            console.log('📊 First collection:', result.data[0]);
          }
          setCollections(result.data);
        } else {
          console.log('⚠️ No collections data in response');
          setCollections([]);
        }
      } else {
        console.error('❌ Collections API error:', response.status, response.statusText);
        setCollections([]);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchRateChart = async (societyId: number, dbKey: string) => {
    setLoadingRateCharts(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/farmer/rate-chart?societyId=${societyId}&dbKey=${dbKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Rate Chart API Response:', result);
        if (result.success && result.data) {
          console.log('📊 Number of charts received:', result.data.length);
          result.data.forEach((chart: any, index: number) => {
            console.log(`📊 Chart ${index + 1}:`, {
              id: chart.id,
              channel: chart.channel,
              fileName: chart.fileName,
              rateDataLength: chart.rateData?.length || 0,
              isShared: chart.isShared
            });
            if (chart.rateData && chart.rateData.length > 0) {
              console.log(`  First 3 rates:`, chart.rateData.slice(0, 3));
            }
          });
          setRateCharts(Array.isArray(result.data) ? result.data : [result.data]);
        }
      }
    } catch (error) {
      console.error('Error fetching rate chart:', error);
    } finally {
      setLoadingRateCharts(false);
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    
    if (mode === 'reports' && farmer && collections.length === 0) {
      fetchCollections(farmer.uid, farmer.dbKey);
    }
    
    if (mode === 'ratechart' && farmer && farmer.societyId && rateCharts.length === 0) {
      fetchRateChart(farmer.societyId, farmer.dbKey);
    }
  };

  // Auto-fetch collections when date range changes
  useEffect(() => {
    if (viewMode === 'reports' && farmer) {
      if (reportDateRange.from && reportDateRange.to) {
        fetchCollections(farmer.uid, farmer.dbKey, reportDateRange.from, reportDateRange.to);
      } else if (!reportDateRange.from && !reportDateRange.to) {
        fetchCollections(farmer.uid, farmer.dbKey);
      }
    }
  }, [reportDateRange.from, reportDateRange.to, viewMode, farmer]);

  const handleClearDateFilter = () => {
    setReportDateRange({ from: '', to: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <FlowerSpinner size={48} />
      </div>
    );
  }

  if (!farmer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{farmer.fullName}</h1>
                <p className="text-sm text-gray-600">Farmer ID: {farmer.uid}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 mb-8 text-white shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome back, {farmer.fullName.split(' ')[0]}!</h2>
          <p className="text-emerald-100">Here's your milk collection overview</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => handleViewChange('overview')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'overview'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleViewChange('reports')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'reports'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>My Reports</span>
          </button>
          <button
            onClick={() => handleViewChange('analytics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'analytics'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => handleViewChange('ratechart')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'ratechart'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Rate Chart</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Overview View */}
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Society</p>
                <p className="font-semibold text-gray-900">{farmer.societyName || 'Not Assigned'}</p>
                {farmer.societyIdentifier && (
                  <p className="text-xs text-gray-500">{farmer.societyIdentifier}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-semibold text-gray-900">{farmer.phone || 'Not Provided'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900 text-sm">{farmer.email}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-md border-l-4 border-emerald-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Milk className="h-6 w-6 text-emerald-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCollections}</h3>
              <p className="text-sm text-gray-600">Total Collections</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-600" />
                </div>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toFixed(2)}</h3>
              <p className="text-sm text-gray-600">Total Liters</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgFat.toFixed(2)}%</h3>
              <p className="text-sm text-gray-600">Average Fat</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgSNF.toFixed(2)}%</h3>
              <p className="text-sm text-gray-600">Average SNF</p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 text-center shadow-md"
          >
            <Milk className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No collection data available yet</p>
            <p className="text-gray-400 text-sm mt-2">Start delivering milk to see your statistics</p>
          </motion.div>
        )}

        {/* Recent Activity */}
        {stats && stats.lastCollectionDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Last Collection</p>
                  <p className="text-sm text-gray-600">{new Date(stats.lastCollectionDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold text-gray-900">{stats.thisMonthQuantity.toFixed(2)} L</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last Month</p>
                  <p className="text-xl font-bold text-gray-900">{stats.lastMonthQuantity.toFixed(2)} L</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
            </motion.div>
          )}

          {/* Reports View */}
          {viewMode === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filter Section */}
              <div className="mb-6">
                <FilterDropdown
                  statusFilter="all"
                  onStatusChange={() => {}}
                  societyFilter={[]}
                  onSocietyChange={() => {}}
                  machineFilter={[]}
                  onMachineChange={() => {}}
                  societies={[]}
                  machines={[]}
                  filteredCount={collections.length}
                  totalCount={collections.length}
                  dateFromFilter={reportDateRange.from}
                  onDateFromChange={(value) => setReportDateRange(prev => ({ ...prev, from: value }))}
                  dateToFilter={reportDateRange.to}
                  onDateToChange={(value) => setReportDateRange(prev => ({ ...prev, to: value }))}
                  showDateFilter={true}
                  hideMainFilterButton={true}
                  hideSocietyFilter={true}
                  icon={<FileText className="w-5 h-5" />}
                />
              </div>

              {/* Collections Table */}
              {loadingReports ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <FlowerSpinner size={48} />
                  <p className="text-gray-600 mt-4">Loading reports...</p>
                </div>
              ) : collections.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-emerald-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Shift</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Qty (L)</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Fat %</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">SNF %</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">CLR</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Rate</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {collections.map((collection, index) => (
                          <tr key={collection.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 text-sm text-gray-900">{new Date(collection.collectionDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{collection.collectionTime}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                collection.shiftType === 'morning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {collection.shiftType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {collection.channel}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{Number(collection.quantity).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900">{Number(collection.fatPercentage).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900">{Number(collection.snfPercentage).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900">{Number(collection.clrValue).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900">₹{Number(collection.ratePerLiter).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-right font-semibold text-emerald-600">₹{Number(collection.totalAmount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-emerald-50">
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                            {collections.reduce((sum, c) => sum + Number(c.quantity), 0).toFixed(2)} L
                          </td>
                          <td colSpan={4}></td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                            ₹{collections.reduce((sum, c) => sum + Number(c.totalAmount), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No collection records found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting the date range or check back later</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics View */}
          {viewMode === 'analytics' && stats && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Performance */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                    Monthly Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.thisMonthQuantity.toFixed(2)} L</p>
                      </div>
                      <Calendar className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Last Month</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.lastMonthQuantity.toFixed(2)} L</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Growth</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.lastMonthQuantity > 0 
                            ? ((stats.thisMonthQuantity - stats.lastMonthQuantity) / stats.lastMonthQuantity * 100).toFixed(1)
                            : '0.0'}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Quality Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Average Fat Content</p>
                        <p className="text-lg font-bold text-purple-600">{stats.avgFat.toFixed(2)}%</p>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.avgFat * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Average SNF Content</p>
                        <p className="text-lg font-bold text-orange-600">{stats.avgSNF.toFixed(2)}%</p>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.avgSNF * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Total Collections</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.totalCollections}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="bg-white rounded-xl p-6 shadow-md lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Overall Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                      <Droplet className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalQuantity.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total Liters Supplied</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <Award className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-purple-600 mb-1">{stats.avgFat.toFixed(2)}%</p>
                      <p className="text-sm text-gray-600">Average Fat Quality</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                      <Award className="h-10 w-10 text-orange-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-orange-600 mb-1">{stats.avgSNF.toFixed(2)}%</p>
                      <p className="text-sm text-gray-600">Average SNF Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rate Chart View */}
          {viewMode === 'ratechart' && (
            <motion.div
              key="ratechart"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {loadingRateCharts ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <FlowerSpinner size={48} />
                  <p className="text-gray-600 mt-4">Loading rate charts...</p>
                </div>
              ) : rateCharts.length > 0 ? (
                <div className="space-y-6">
                  {/* Channel Filter Tabs */}
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setChannelFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          channelFilter === 'all'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Channels ({rateCharts.length})
                      </button>
                      {rateCharts.filter(c => c.channel === 'COW').length > 0 && (
                        <button
                          onClick={() => setChannelFilter('COW')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            channelFilter === 'COW'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          COW ({rateCharts.filter(c => c.channel === 'COW').length})
                        </button>
                      )}
                      {rateCharts.filter(c => c.channel === 'BUF').length > 0 && (
                        <button
                          onClick={() => setChannelFilter('BUF')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            channelFilter === 'BUF'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          BUFFALO ({rateCharts.filter(c => c.channel === 'BUF').length})
                        </button>
                      )}
                      {rateCharts.filter(c => c.channel === 'MIX').length > 0 && (
                        <button
                          onClick={() => setChannelFilter('MIX')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            channelFilter === 'MIX'
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          MIXED ({rateCharts.filter(c => c.channel === 'MIX').length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <p className="text-xs font-medium text-gray-600 mb-1">Total Charts</p>
                      <p className="text-2xl font-bold text-gray-900">{rateCharts.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-4 text-white">
                      <p className="text-xs font-medium mb-1">COW</p>
                      <p className="text-2xl font-bold">{rateCharts.filter(c => c.channel === 'COW').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
                      <p className="text-xs font-medium mb-1">BUFFALO</p>
                      <p className="text-2xl font-bold">{rateCharts.filter(c => c.channel === 'BUF').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
                      <p className="text-xs font-medium mb-1">MIXED</p>
                      <p className="text-2xl font-bold">{rateCharts.filter(c => c.channel === 'MIX').length}</p>
                    </div>
                  </div>

                  {/* Rate Chart Cards */}
                  {rateCharts
                    .filter(chart => channelFilter === 'all' || chart.channel === channelFilter)
                    .map((rateChart) => (
                    <div key={rateChart.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      {/* Chart Header */}
                      <div className={`px-6 py-4 ${
                        rateChart.channel === 'COW' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        rateChart.channel === 'BUF' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center">
                              <DollarSign className="h-6 w-6 mr-2" />
                              {rateChart.channel === 'BUF' ? 'BUFFALO' : rateChart.channel === 'MIX' ? 'MIXED' : rateChart.channel} Milk Rate Chart
                            </h3>
                            <p className="text-sm text-white/90 mt-1">{rateChart.fileName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {rateChart.isShared && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                                Shared
                              </span>
                            )}
                            <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/20 text-white backdrop-blur-sm">
                              {rateChart.channel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chart Info */}
                      <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Total Records</p>
                            <p className="text-lg font-bold text-gray-900">{rateChart.recordCount}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Last Updated</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(rateChart.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Available Records</p>
                            <p className="text-lg font-bold text-emerald-600">{rateChart.rateData?.length || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rate Data Table */}
                      {rateChart.rateData && rateChart.rateData.length > 0 ? (
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-900">
                              Complete Rate Chart Data
                            </h4>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              {rateChart.rateData.length} total records
                            </span>
                          </div>
                          
                          <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-200 z-10 shadow-sm">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                                    #
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                                    FAT %
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                                    SNF %
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                                    CLR
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                                    Rate (₹/Liter)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                {rateChart.rateData.map((rate: any, index: number) => (
                                  <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                    <td className="px-4 py-2.5 text-xs text-gray-500 border border-gray-300 font-medium">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-900 border border-gray-300 font-medium">
                                      {Number(rate.fat).toFixed(1)}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-900 border border-gray-300 font-medium">
                                      {Number(rate.snf).toFixed(1)}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-900 border border-gray-300 font-medium">
                                      {Number(rate.clr).toFixed(1)}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm font-bold text-right border border-gray-300 text-emerald-700">
                                      ₹{Number(rate.rate).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Info Footer */}
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                              <Eye className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-blue-900">How to Use This Rate Chart</p>
                                <p className="text-xs text-blue-700 mt-1">
                                  Your milk payment is calculated based on the FAT%, SNF%, and CLR values measured during collection. 
                                  Find your milk's quality parameters in the table above to see the applicable rate per liter.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6">
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No rate data available for this chart</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Empty State for Filtered Results */}
                  {rateCharts.filter(chart => channelFilter === 'all' || chart.channel === channelFilter).length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-md">
                      <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No {channelFilter === 'all' ? '' : channelFilter} rate charts available</p>
                      <p className="text-gray-400 text-sm mt-2">Try selecting a different channel filter</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No rate charts available</p>
                  <p className="text-gray-400 text-sm mt-2">Please contact your society administrator</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <p>For any queries, please contact your society administrator</p>
        </motion.div>
      </main>
    </div>
  );
}
