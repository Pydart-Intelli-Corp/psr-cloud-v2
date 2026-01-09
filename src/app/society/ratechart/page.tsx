'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  Share2,
  CheckCircle,
  Droplet,
  X,
  Download,
  Filter
} from 'lucide-react';
import { FlowerSpinner, PageLoader } from '@/components';

interface RateData {
  fat: number;
  snf: number;
  clr?: number;
  rate: number;
}

interface RateChart {
  id: number;
  channel: string;
  fileName: string;
  uploadedAt: string;
  status: number;
  isShared: boolean;
  recordCount: number;
  rateData: RateData[];
}

export default function SocietyRateChartPage() {
  const router = useRouter();
  const [rateCharts, setRateCharts] = useState<RateChart[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<RateChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedChart, setSelectedChart] = useState<RateChart | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'society') {
          router.push('/society/login');
          return;
        }
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        router.push('/society/login');
      }
    } else {
      router.push('/society/login');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchRateCharts();
    }
  }, [user]);

  const fetchRateCharts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const societyId = user.societyId || user.uid;
      const schemaName = user.schema || user.schemaName;

      const response = await fetch(
        `/api/society/rate-chart?societyId=${societyId}&schemaName=${schemaName}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRateCharts(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching rate charts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...rateCharts];

    if (channelFilter !== 'all') {
      filtered = filtered.filter(c => c.channel === channelFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.fileName?.toLowerCase().includes(query) ||
        c.channel?.toLowerCase().includes(query)
      );
    }

    setFilteredCharts(filtered);
  }, [rateCharts, channelFilter, searchQuery]);

  const stats = {
    total: rateCharts.length,
    cow: rateCharts.filter(c => c.channel === 'COW').length,
    buffalo: rateCharts.filter(c => c.channel === 'BUFFALO').length,
    shared: rateCharts.filter(c => c.isShared).length
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'COW':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'BUFFALO':
        return 'bg-gray-800 text-white dark:bg-gray-600';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  if (loading && !user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rate Charts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View rate charts available for your society
            </p>
          </div>
          <button
            onClick={fetchRateCharts}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Charts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Droplet className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cow Charts</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.cow}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-700 dark:bg-gray-600 rounded-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Buffalo Charts</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.buffalo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shared (BMC)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.shared}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rate charts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Channels</option>
              <option value="COW">Cow</option>
              <option value="BUFFALO">Buffalo</option>
            </select>
          </div>
        </div>

        {/* Rate Charts Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FlowerSpinner size={48} />
          </div>
        ) : filteredCharts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Rate Charts Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {rateCharts.length === 0 
                ? "No rate charts are available for your society yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {chart.isShared && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                        <Share2 className="w-3 h-3" />
                        BMC Shared
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getChannelColor(chart.channel)}`}>
                      {chart.channel}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {chart.fileName}
                </h3>
                
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Uploaded: {chart.uploadedAt 
                        ? new Date(chart.uploadedAt).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{chart.recordCount} rate entries</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                  <button
                    onClick={() => setSelectedChart(chart)}
                    className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Rates
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Showing {filteredCharts.length} of {rateCharts.length} rate charts
        </p>

        {/* Rate Chart Detail Modal */}
        {selectedChart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedChart.fileName}</h3>
                    <p className="text-sm text-white/80">
                      {selectedChart.channel} • {selectedChart.recordCount} entries
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChart(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {selectedChart.rateData && selectedChart.rateData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fat %</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SNF %</th>
                          {selectedChart.rateData[0].clr !== undefined && (
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">CLR</th>
                          )}
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rate/L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedChart.rateData.map((rate, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{rate.fat.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{rate.snf.toFixed(1)}</td>
                            {rate.clr !== undefined && (
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{rate.clr}</td>
                            )}
                            <td className="px-4 py-2 text-sm text-right font-semibold text-indigo-600 dark:text-indigo-400">
                              ₹{rate.rate.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rate data available</p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedChart(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
