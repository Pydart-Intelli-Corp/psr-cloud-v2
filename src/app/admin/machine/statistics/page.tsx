'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  FlowerSpinner, 
  StatusMessage, 
  StatsCard,
  EmptyState,
  Badge
} from '@/components';
import { StatisticsFilterDropdown, BulkActionsToolbar } from '@/components/management';

interface MachineStatistic {
  id: number;
  machine_id: number;
  machine_identifier: string;
  machine_type: string;
  operator_name?: string;
  society_id: number;
  society_name: string;
  society_identifier: string;
  stats_machine_type: string;
  version: string;
  total_test: number;
  daily_cleaning: number;
  weekly_cleaning: number;
  cleaning_skip: number;
  gain: number;
  auto_channel: string;
  statistics_date: string;
  statistics_time: string;
  created_at: string;
}

export default function MachineStatisticsPage() {
  const router = useRouter();

  const [statistics, setStatistics] = useState<MachineStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [societyFilter, setSocietyFilter] = useState('all');
  const [machineTypeFilter, setMachineTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [autoChannelFilter, setAutoChannelFilter] = useState('all');
  
  // Selection states
  const [selectedStatistics, setSelectedStatistics] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded font-semibold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/machine/all-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatistics(data.data.statistics || []);
      } else {
        setError(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to fetch machine statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (event: CustomEvent) => {
      const query = event.detail?.query || '';
      setSearchQuery(query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
    };
  }, []);

  // Get unique values for filters
  const societies = useMemo(() => {
    const unique = new Set(statistics.map(s => s.society_name));
    return Array.from(unique).sort();
  }, [statistics]);

  const machineTypes = useMemo(() => {
    const unique = new Set(statistics.map(s => s.machine_type));
    return Array.from(unique).sort();
  }, [statistics]);

  const dates = useMemo(() => {
    const unique = new Set(statistics.map(s => s.statistics_date));
    return Array.from(unique).sort().reverse();
  }, [statistics]);

  // Filter statistics
  const filteredStatistics = useMemo(() => {
    return statistics.filter(stat => {
      const matchesSearch = searchQuery === '' || 
        stat.machine_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stat.operator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stat.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stat.society_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stat.stats_machine_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSociety = societyFilter === 'all' || stat.society_name === societyFilter;
      const matchesMachineType = machineTypeFilter === 'all' || stat.machine_type === machineTypeFilter;
      const matchesDate = dateFilter === 'all' || stat.statistics_date === dateFilter;
      const matchesAutoChannel = autoChannelFilter === 'all' || stat.auto_channel === autoChannelFilter;

      return matchesSearch && matchesSociety && matchesMachineType && matchesDate && matchesAutoChannel;
    });
  }, [statistics, searchQuery, societyFilter, machineTypeFilter, dateFilter, autoChannelFilter]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (filteredStatistics.length === 0) {
      return {
        totalTests: 0,
        avgDailyCleaning: 0,
        avgWeeklyCleaning: 0,
        totalSkips: 0,
        avgGain: 0,
        enabledMachines: 0
      };
    }

    const totalTests = filteredStatistics.reduce((sum, s) => sum + s.total_test, 0);
    const totalDailyCleaning = filteredStatistics.reduce((sum, s) => sum + s.daily_cleaning, 0);
    const totalWeeklyCleaning = filteredStatistics.reduce((sum, s) => sum + s.weekly_cleaning, 0);
    const totalSkips = filteredStatistics.reduce((sum, s) => sum + s.cleaning_skip, 0);
    const totalGain = filteredStatistics.reduce((sum, s) => sum + s.gain, 0);
    const enabledMachines = filteredStatistics.filter(s => s.auto_channel === 'ENABLE').length;

    return {
      totalTests,
      avgDailyCleaning: Math.round(totalDailyCleaning / filteredStatistics.length),
      avgWeeklyCleaning: Math.round(totalWeeklyCleaning / filteredStatistics.length),
      totalSkips,
      avgGain: Math.round(totalGain / filteredStatistics.length),
      enabledMachines
    };
  }, [filteredStatistics]);

  // Handle toggle selection for individual row
  const handleToggleSelection = (id: number) => {
    const newSelected = new Set(selectedStatistics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStatistics(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedStatistics(new Set());
      setSelectAll(false);
    } else {
      // Select all filtered statistics
      const allIds = new Set(filteredStatistics.map(stat => stat.id));
      setSelectedStatistics(allIds);
      setSelectAll(true);
    }
  };

  // Update selectAll state when filtered statistics change
  useEffect(() => {
    if (filteredStatistics.length === 0) {
      if (selectAll) setSelectAll(false);
      if (selectedStatistics.size > 0) setSelectedStatistics(new Set());
    } else {
      const allSelected = filteredStatistics.every(stat => selectedStatistics.has(stat.id));
      const shouldBeSelected = allSelected && filteredStatistics.length > 0;
      if (selectAll !== shouldBeSelected) {
        setSelectAll(shouldBeSelected);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStatistics]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedStatistics.size === 0) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/machine/statistics/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          statisticIds: Array.from(selectedStatistics)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || `Deleted ${selectedStatistics.size} statistics successfully`);
        setSelectedStatistics(new Set());
        setSelectAll(false);
        await fetchStatistics(); // Refresh the list
      } else {
        setError(data.message || 'Failed to delete statistics');
      }
    } catch (error) {
      console.error('Error deleting statistics:', error);
      setError('Failed to delete statistics');
    } finally {
      setIsDeleting(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (filteredStatistics.length === 0) {
      setError('No data to download');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const headers = [
      'Machine ID',
      'Operator Name',
      'Society',
      'Society ID',
      'Machine Type',
      'Total Tests',
      'Daily Cleaning',
      'Weekly Cleaning',
      'Cleaning Skips',
      'Gain',
      'Auto Channel',
      'Date',
      'Time',
      'Created At'
    ];

    const csvData = filteredStatistics.map(stat => [
      stat.machine_identifier,
      stat.operator_name || '',
      stat.society_name,
      stat.society_identifier,
      stat.stats_machine_type,
      stat.total_test,
      stat.daily_cleaning,
      stat.weekly_cleaning,
      stat.cleaning_skip,
      stat.gain,
      stat.auto_channel,
      stat.statistics_date,
      stat.statistics_time,
      new Date(stat.created_at).toLocaleString()
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('Statistics downloaded successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pb-8">
      {/* Header - Mobile Responsive */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Single Row: Back button + Title + Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl flex-shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Machine Statistics</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Combined operational data from all machines</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchStatistics}
                className="flex items-center justify-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={filteredStatistics.length === 0}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-emerald-600"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Status Messages */}
        <StatusMessage success={success} error={error} />

        {/* Summary Stats */}
        {!loading && filteredStatistics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard
              title="Total Tests"
              value={summaryStats.totalTests.toLocaleString()}
              icon={<TrendingUp className="w-4 h-4" />}
              color="blue"
            />
            <StatsCard
              title="Daily Clean"
              value={summaryStats.avgDailyCleaning.toString()}
              icon={<Activity className="w-4 h-4" />}
              color="green"
            />
            <StatsCard
              title="Weekly Clean"
              value={summaryStats.avgWeeklyCleaning.toString()}
              icon={<Activity className="w-4 h-4" />}
              color="blue"
            />
            <StatsCard
              title="Total Skips"
              value={summaryStats.totalSkips.toString()}
              icon={<TrendingDown className="w-4 h-4" />}
              color="yellow"
            />
            <StatsCard
              title="Avg Gain"
              value={summaryStats.avgGain.toString()}
              icon={<TrendingUp className="w-4 h-4" />}
              color="blue"
            />
            <StatsCard
              title="Enabled"
              value={`${summaryStats.enabledMachines}/${filteredStatistics.length}`}
              icon={<Settings className="w-4 h-4" />}
              color="green"
            />
          </div>
        )}

        {/* Filter Controls */}
        <StatisticsFilterDropdown
          societyFilter={societyFilter}
          onSocietyChange={setSocietyFilter}
          machineTypeFilter={machineTypeFilter}
          onMachineTypeChange={setMachineTypeFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          autoChannelFilter={autoChannelFilter}
          onAutoChannelChange={setAutoChannelFilter}
          societies={societies}
          machineTypes={machineTypes}
          dates={dates}
          filteredCount={filteredStatistics.length}
          totalCount={statistics.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          icon={<BarChart3 className="w-5 h-5" />}
        />

        {/* Statistics Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FlowerSpinner />
          </div>
        ) : filteredStatistics.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-12 h-12" />}
            title="No Statistics Found"
            message={(societyFilter !== 'all' || machineTypeFilter !== 'all' || dateFilter !== 'all' || autoChannelFilter !== 'all' || searchQuery !== '') ? 'Try adjusting your filters' : 'No machine statistics available yet'}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div>
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 py-3 text-center w-[5%]">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]">
                      Machine
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]">
                      Society
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[9%]">
                      Type
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[7%]">
                      Tests
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[6%]">
                      Daily
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[6%]">
                      Weekly
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[6%]">
                      Skips
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[6%]">
                      Gain
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[6%]">
                      Auto
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[12%]">
                      Date
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[12%]">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStatistics.map((stat) => (
                    <tr 
                      key={stat.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStatistics.has(stat.id)}
                          onChange={() => handleToggleSelection(stat.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 break-words">
                            {highlightText(stat.machine_identifier, searchQuery)}
                          </span>
                          {stat.operator_name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 break-words">
                              {highlightText(stat.operator_name, searchQuery)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-gray-900 dark:text-gray-100 break-words">
                            {highlightText(stat.society_name, searchQuery)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            {highlightText(stat.society_identifier, searchQuery)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-xs text-gray-700 dark:text-gray-300">
                        {highlightText(stat.stats_machine_type, searchQuery)}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant="blue">
                          {stat.total_test.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant="green">
                          {stat.daily_cleaning}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant="purple">
                          {stat.weekly_cleaning}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant={stat.cleaning_skip > 0 ? 'orange' : 'gray'}>
                          {stat.cleaning_skip}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant="indigo">
                          {stat.gain}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <Badge variant={stat.auto_channel === 'ENABLE' ? 'emerald' : 'red'}>
                          {stat.auto_channel === 'ENABLE' ? 'ON' : 'OFF'}
                        </Badge>
                      </td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{stat.statistics_date}</span>
                        </span>
                      </td>
                      <td className="px-2 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {stat.statistics_time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filteredStatistics.length}</span> 
                {' '}of{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{statistics.length}</span> 
                {' '}statistics records
              </p>
            </div>
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedStatistics.size}
          totalCount={statistics.length}
          onBulkDelete={() => setShowDeleteConfirm(true)}
          onClearSelection={() => {
            setSelectedStatistics(new Set());
            setSelectAll(false);
          }}
          itemType="statistic"
          showStatusUpdate={false}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Statistics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {selectedStatistics.size} statistic{selectedStatistics.size !== 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <FlowerSpinner size={16} />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
