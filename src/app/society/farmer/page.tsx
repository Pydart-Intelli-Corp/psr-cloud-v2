'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  RefreshCw,
  Search,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp
} from 'lucide-react';
import { FlowerSpinner, PageLoader } from '@/components';

interface Farmer {
  id: number;
  farmerId: string;
  farmerName: string;
  phone: string;
  email?: string;
  address?: string;
  village?: string;
  channel: string;
  status: number;
  createdAt: string;
  totalCollections: number;
  totalQuantity: number;
}

export default function SocietyFarmerPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

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
      fetchFarmers();
    }
  }, [user]);

  const fetchFarmers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const societyId = user.societyId || user.uid;
      const schemaName = user.schema || user.schemaName;

      const response = await fetch(
        `/api/society/farmers?societyId=${societyId}&schemaName=${schemaName}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFarmers(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...farmers];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => 
        statusFilter === 'active' ? f.status === 1 : f.status === 0
      );
    }

    if (channelFilter !== 'all') {
      filtered = filtered.filter(f => f.channel === channelFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.farmerName?.toLowerCase().includes(query) ||
        f.farmerId?.toLowerCase().includes(query) ||
        f.phone?.includes(query) ||
        f.village?.toLowerCase().includes(query)
      );
    }

    setFilteredFarmers(filtered);
  }, [farmers, statusFilter, channelFilter, searchQuery]);

  const stats = {
    total: farmers.length,
    active: farmers.filter(f => f.status === 1).length,
    inactive: farmers.filter(f => f.status === 0).length,
    totalQuantity: farmers.reduce((sum, f) => sum + (f.totalQuantity || 0), 0)
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
              Farmer Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View farmers registered under your society
            </p>
          </div>
          <button
            onClick={fetchFarmers}
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
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Droplet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Milk (L)</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalQuantity.toLocaleString()}
                </p>
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
                placeholder="Search by name, ID, phone, or village..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Channels</option>
              <option value="COW">Cow</option>
              <option value="BUFFALO">Buffalo</option>
              <option value="MIX">Mix</option>
            </select>
          </div>
        </div>

        {/* Farmers Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FlowerSpinner size={48} />
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Farmers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {farmers.length === 0 
                ? "No farmers are registered under your society yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Channel</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Village</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Collections</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Qty (L)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{farmer.farmerName}</p>
                          <p className="text-xs text-gray-500">{farmer.farmerId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{farmer.phone || '-'}</span>
                          </div>
                          {farmer.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{farmer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          farmer.channel === 'COW' 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : farmer.channel === 'BUFFALO'
                            ? 'bg-gray-800 text-white dark:bg-gray-600'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {farmer.channel || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{farmer.village || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {farmer.totalCollections?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {farmer.totalQuantity?.toFixed(1) || '0.0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          farmer.status === 1
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {farmer.status === 1 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {farmer.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedFarmer(farmer)}
                          className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </p>

        {/* Farmer Detail Modal */}
        {selectedFarmer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Farmer Details</h3>
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedFarmer.farmerName?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedFarmer.farmerName}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">ID: {selectedFarmer.farmerId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFarmer.phone || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Channel</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFarmer.channel || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Village</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFarmer.village || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      selectedFarmer.status === 1
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedFarmer.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedFarmer.totalCollections?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Collections</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedFarmer.totalQuantity?.toFixed(1) || '0.0'} L
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
                  </div>
                </div>

                {selectedFarmer.address && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFarmer.address}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
