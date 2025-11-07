'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Filter,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Globe,
  Server,
  Radio,
} from 'lucide-react';

interface APIRequest {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  endpoint: string;
  dbKey?: string;
  societyId?: string;
  machineId?: string;
  inputString?: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  error?: string;
  category: 'external' | 'admin' | 'farmer' | 'machine' | 'auth' | 'other';
}

interface Stats {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byEndpoint: Record<string, number>;
  bySociety: Record<string, number>;
  byDbKey: Record<string, number>;
  avgResponseTime: number;
  errorRate: number;
  activeListeners: number;
}

const LiveMonitor = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<{
    category?: string;
    dbKey?: string;
    societyId?: string;
  }>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h' | 'all'>('5m');

  // Fetch initial data and stats
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Build query params
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.dbKey) params.append('dbKey', filter.dbKey);
      if (filter.societyId) params.append('societyId', filter.societyId);
      params.append('limit', '100');
      
      // Add time filter
      if (timeRange !== 'all') {
        const now = new Date();
        const minutes = timeRange === '1m' ? 1 : timeRange === '5m' ? 5 : timeRange === '15m' ? 15 : 60;
        const since = new Date(now.getTime() - minutes * 60 * 1000);
        params.append('since', since.toISOString());
      }

      // Fetch requests
      const requestsRes = await fetch(`/api/superadmin/monitoring/requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.data || []);
      }

      // Fetch stats
      const statsParams = new URLSearchParams();
      if (filter.category) statsParams.append('category', filter.category);
      if (timeRange !== 'all') {
        const now = new Date();
        const minutes = timeRange === '1m' ? 1 : timeRange === '5m' ? 5 : timeRange === '15m' ? 15 : 60;
        const since = new Date(now.getTime() - minutes * 60 * 1000);
        statsParams.append('since', since.toISOString());
      }
      
      const statsRes = await fetch(`/api/superadmin/monitoring/stats?${statsParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  }, [filter, timeRange]);

  // Setup SSE connection for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    console.log('🎯 Setting up SSE connection...');
    const eventSource = new EventSource(`/api/superadmin/monitoring/stream`);

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        console.log('📨 SSE Message received:', event.data);
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('🎯 SSE Connection confirmed');
          return;
        }
        
        if (data.type === 'heartbeat') {
          console.log('💓 SSE Heartbeat');
          return;
        }
        
        if (data.type === 'request') {
          console.log('📊 New request received:', data.data);
          const newRequest = data.data as APIRequest;
          
          // Check if matches filter
          if (filter.category && newRequest.category !== filter.category) {
            console.log('🚫 Request filtered out by category');
            return;
          }
          if (filter.dbKey && newRequest.dbKey !== filter.dbKey) {
            console.log('🚫 Request filtered out by dbKey');
            return;
          }
          if (filter.societyId && newRequest.societyId !== filter.societyId) {
            console.log('🚫 Request filtered out by societyId');
            return;
          }
          
          // Add to list
          console.log('✅ Adding request to list');
          setRequests(prev => [newRequest, ...prev].slice(0, 100));
          
          // Update stats
          fetchData();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.log('❌ SSE Error:', error);
      console.log('❌ SSE Disconnected');
      setIsConnected(false);
    };

    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
      setIsConnected(false);
    };
  }, [autoRefresh, filter, fetchData]);

  // Initial load
  useEffect(() => {
    const initLoad = () => {
      const token = localStorage.getItem('adminToken');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || userRole !== 'super_admin') {
        router.push('/superadmin');
        return;
      }

      fetchData();
    };
    
    initLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Clear logs
  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all request logs?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/superadmin/monitoring/requests', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setRequests([]);
      fetchData();
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  // Test endpoint - trigger a sample request
  const handleTestRequest = async () => {
    try {
      console.log('🧪 Triggering test request...');
      const response = await fetch('/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=S-2121%7CECOD-G%7CLE2.00%7CM00000003%7CC00001');
      console.log('🧪 Test request completed:', response.status);
      
      // Give it a moment to process
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error triggering test request:', error);
    }
  };

  // Get status color
  const getStatusColor = (code: number) => {
    if (code < 300) return 'text-green-600';
    if (code < 400) return 'text-blue-600';
    if (code < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      external: 'bg-purple-100 text-purple-800 border-purple-300',
      admin: 'bg-blue-100 text-blue-800 border-blue-300',
      farmer: 'bg-green-100 text-green-800 border-green-300',
      machine: 'bg-orange-100 text-orange-800 border-orange-300',
      auth: 'bg-red-100 text-red-800 border-red-300',
      other: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/superadmin/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Live API Monitor
              </h1>
              <p className="text-gray-600 mt-1">Real-time endpoint tracking and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
            
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <Radio className="w-4 h-4 inline mr-2" />
              {autoRefresh ? 'Live Mode' : 'Paused'}
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
            
            {/* Test Button */}
            <button
              onClick={handleTestRequest}
              className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              title="Trigger a test API request"
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Test
            </button>
            
            {/* Clear Logs */}
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.avgResponseTime.toFixed(0)}
                    <span className="text-lg text-gray-600 ml-1">ms</span>
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.errorRate.toFixed(1)}
                    <span className="text-lg text-gray-600 ml-1">%</span>
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stats.errorRate > 10 ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <AlertCircle className={`w-6 h-6 ${stats.errorRate > 10 ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {(100 - stats.errorRate).toFixed(1)}
                    <span className="text-lg text-gray-600 ml-1">%</span>
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters and Time Range */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Category Filter */}
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="external">External APIs</option>
              <option value="admin">Admin APIs</option>
              <option value="farmer">Farmer APIs</option>
              <option value="machine">Machine APIs</option>
              <option value="auth">Authentication</option>
              <option value="other">Other</option>
            </select>

            {/* Time Range */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1m">Last 1 minute</option>
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="all">All time</option>
            </select>

            {/* Clear Filters */}
            {(filter.category || filter.dbKey || filter.societyId) && (
              <button
                onClick={() => setFilter({})}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {stats && Object.keys(stats.byCategory).length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div
                  key={category}
                  className={`p-4 rounded-lg border ${getCategoryColor(category)} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setFilter({ ...filter, category })}
                >
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm capitalize mt-1">{category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Endpoints */}
        {stats && Object.keys(stats.byEndpoint).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Top Endpoints
              </h2>
              <div className="space-y-2">
                {Object.entries(stats.byEndpoint)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([endpoint, count]) => (
                    <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-mono text-gray-700 truncate">{endpoint}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Societies */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Top Societies
              </h2>
              <div className="space-y-2">
                {Object.entries(stats.bySociety)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([societyId, count]) => (
                    <div 
                      key={societyId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setFilter({ ...filter, societyId })}
                    >
                      <span className="text-sm font-medium text-gray-700">Society {societyId}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                {Object.keys(stats.bySociety).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No society data</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Recent Requests ({requests.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Society
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No requests yet. Waiting for API calls...
                      </td>
                    </tr>
                  )}
                  {requests.map((req) => (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          req.method === 'GET' ? 'bg-green-100 text-green-800' :
                          req.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          req.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono truncate max-w-xs">
                        {req.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(req.category)}`}>
                          {req.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.societyId ? `S-${req.societyId}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${getStatusColor(req.statusCode)}`}>
                          {req.statusCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {req.ip || '-'}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
