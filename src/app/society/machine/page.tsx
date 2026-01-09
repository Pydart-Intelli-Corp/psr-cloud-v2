'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  RefreshCw,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Clock,
  Eye,
  Search
} from 'lucide-react';
import { FlowerSpinner, PageLoader } from '@/components';
import { ManagementPageHeader, StatsCard } from '@/components/management';

interface Machine {
  id: number;
  machineId: string;
  machineName: string;
  model: string;
  status: string;
  lastSync: string;
  isOnline: boolean;
}

export default function SocietyMachinePage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      fetchMachines();
    }
  }, [user]);

  const fetchMachines = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const societyId = user.societyId || user.uid;
      const schemaName = user.schema || user.schemaName;

      const response = await fetch(
        `/api/society/machines?societyId=${societyId}&schemaName=${schemaName}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMachines(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...machines];

    if (statusFilter !== 'all') {
      if (statusFilter === 'online') {
        filtered = filtered.filter(m => m.isOnline);
      } else if (statusFilter === 'offline') {
        filtered = filtered.filter(m => !m.isOnline);
      } else {
        filtered = filtered.filter(m => m.status === statusFilter);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.machineName?.toLowerCase().includes(query) ||
        m.machineId?.toLowerCase().includes(query) ||
        m.model?.toLowerCase().includes(query)
      );
    }

    setFilteredMachines(filtered);
  }, [machines, statusFilter, searchQuery]);

  const stats = {
    total: machines.length,
    online: machines.filter(m => m.isOnline).length,
    offline: machines.filter(m => !m.isOnline).length,
    active: machines.filter(m => m.status === 'active').length
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
              Machine Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and monitor machines assigned to your society
            </p>
          </div>
          <button
            onClick={fetchMachines}
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
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Machines</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.online}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.offline}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.active}</p>
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
                placeholder="Search machines..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Machines Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FlowerSpinner size={48} />
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Settings className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Machines Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {machines.length === 0 
                ? "No machines are assigned to your society yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMachines.map((machine) => (
              <div
                key={machine.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    machine.isOnline
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {machine.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {machine.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {machine.machineName || machine.machineId}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ID: {machine.machineId}
                </p>

                <div className="space-y-2 text-sm">
                  {machine.model && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Wrench className="w-4 h-4" />
                      <span>Model: {machine.model}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last Sync: {machine.lastSync 
                        ? new Date(machine.lastSync).toLocaleString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                    machine.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : machine.status === 'maintenance'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {machine.status === 'active' && <CheckCircle className="w-3 h-3" />}
                    {machine.status === 'maintenance' && <Wrench className="w-3 h-3" />}
                    {machine.status === 'inactive' && <AlertTriangle className="w-3 h-3" />}
                    {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Showing {filteredMachines.length} of {machines.length} machines
        </p>
      </div>
    </div>
  );
}
