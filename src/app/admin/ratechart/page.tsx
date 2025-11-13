'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Receipt, Trash2 } from 'lucide-react';
import { 
  FlowerSpinner,
  StatusMessage,
  StatsCard,
  EmptyState,
  LoadingSnackbar
} from '@/components';
import BulkDeleteConfirmModal from '@/components/management/BulkDeleteConfirmModal';
import RateChartUploadModal from '@/components/ratechart/RateChartUploadModal';
import RateChartMinimalCard from '@/components/ratechart/RateChartMinimalCard';
import ManagementPageHeader from '@/components/management/ManagementPageHeader';
import FilterDropdown from '@/components/management/FilterDropdown';

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface RateChart {
  id: number;
  societyId: number;
  societyName: string;
  societyIdentifier: string;
  channel: 'COW' | 'BUF' | 'MIX';
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  recordCount: number;
  shared_chart_id: number | null;
}

export default function RatechartManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { } = useLanguage();
  
  // State management
  const [rateCharts, setRateCharts] = useState<RateChart[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter states
  const [societyFilter, setSocietyFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selection and bulk operations
  const [selectedCharts, setSelectedCharts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch rate charts
  const fetchRateCharts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/ratechart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRateCharts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching rate charts:', error);
      setError('Failed to load rate charts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch societies
  const fetchSocieties = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Societies API response:', data);
      if (data.success) {
        const societiesList = data.data || [];
        console.log('Societies list:', societiesList);
        setSocieties(societiesList);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRateCharts();
      fetchSocieties();
    }
  }, [user, fetchRateCharts, fetchSocieties]);

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (event: Event) => {
      const customEvent = event as CustomEvent;
      const query = customEvent.detail?.query || '';
      setSearchQuery(query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rate chart?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/ratechart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Rate chart deleted successfully');
        fetchRateCharts();
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(data.message || 'Failed to delete rate chart');
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting rate chart:', error);
      setError('Error deleting rate chart');
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  // Upload success/error handlers
  const handleUploadSuccess = (message: string) => {
    setSuccess(message);
    fetchRateCharts();
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  const handleUploadError = (message: string) => {
    setError(message);
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  // Filter rate charts
  const filteredRateCharts = rateCharts.filter(chart => {
    if (societyFilter !== 'all' && chart.societyId.toString() !== societyFilter) return false;
    if (channelFilter !== 'all' && chart.channel !== channelFilter) return false;
    
    // Search functionality
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        chart.societyName.toLowerCase().includes(query) ||
        chart.societyIdentifier.toLowerCase().includes(query) ||
        chart.channel.toLowerCase().includes(query) ||
        chart.fileName.toLowerCase().includes(query) ||
        chart.uploadedBy.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Get only master charts (where shared_chart_id is null)
  const masterCharts = filteredRateCharts.filter(chart => chart.shared_chart_id === null);
  
  // For each master chart, find all societies using it (including shared references)
  const groupedCharts = masterCharts.reduce((acc, masterChart) => {
    acc[masterChart.id] = {
      chartId: masterChart.id,
      fileName: masterChart.fileName,
      channel: masterChart.channel,
      uploadedBy: masterChart.uploadedBy,
      createdAt: masterChart.uploadedAt,
      recordCount: masterChart.recordCount,
      societies: [],
      chartRecordIds: [masterChart.id] // Start with master chart ID
    };
    
    // Add the master chart's society
    acc[masterChart.id].societies.push({
      societyId: masterChart.societyId,
      societyName: masterChart.societyName,
      societyIdentifier: masterChart.societyIdentifier
    });
    
    // Find all societies that share this chart
    filteredRateCharts.forEach(chart => {
      if (chart.shared_chart_id === masterChart.id) {
        acc[masterChart.id].societies.push({
          societyId: chart.societyId,
          societyName: chart.societyName,
          societyIdentifier: chart.societyIdentifier
        });
        acc[masterChart.id].chartRecordIds.push(chart.id);
      }
    });
    
    return acc;
  }, {} as Record<number, { 
    chartId: number; 
    fileName: string; 
    channel: string; 
    uploadedBy: string; 
    createdAt: string;
    recordCount: number;
    societies: { societyId: number; societyName: string; societyIdentifier: string }[];
    chartRecordIds: number[];
  }>);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCharts(new Set());
      setSelectAll(false);
    } else {
      setSelectedCharts(new Set(filteredRateCharts.map(c => c.id)));
      setSelectAll(true);
    }
  };

  // Clear selections when filters change
  useEffect(() => {
    if (selectedCharts.size > 0) {
      const visibleChartIds = new Set(filteredRateCharts.map(c => c.id));
      const updatedSelection = new Set(
        Array.from(selectedCharts).filter(id => visibleChartIds.has(id))
      );
      
      if (updatedSelection.size !== selectedCharts.size) {
        setSelectedCharts(updatedSelection);
        setSelectAll(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyFilter, channelFilter, searchQuery, rateCharts]);

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedCharts.size === 0) return;

    setShowDeleteConfirm(false);
    setIsDeletingBulk(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('authToken');
      setUploadProgress(10);

      const ids = Array.from(selectedCharts);
      const deletePromises = ids.map(id =>
        fetch(`/api/user/ratechart/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      setUploadProgress(30);
      await Promise.all(deletePromises);
      setUploadProgress(70);

      await fetchRateCharts();
      setUploadProgress(95);

      setSelectedCharts(new Set());
      setSelectAll(false);
      setSuccess(`Successfully deleted ${ids.length} rate chart(s)`);
      setError('');
      
      setUploadProgress(100);
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error deleting rate charts:', error);
      setError('Error deleting selected rate charts');
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsDeletingBulk(false);
      setUploadProgress(0);
    }
  };

  // Calculate stats
  const uniqueCharts = Object.keys(groupedCharts).length;
  const totalCharts = rateCharts.length;
  const cowCharts = rateCharts.filter(c => c.channel === 'COW').length;
  const bufCharts = rateCharts.filter(c => c.channel === 'BUF').length;
  const mixCharts = rateCharts.filter(c => c.channel === 'MIX').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FlowerSpinner size={48} isLoading={true} />
      </div>
    );
  }

  return (
    <>
    {/* Loading Snackbar */}
    <LoadingSnackbar
      isVisible={isUploading || isDeletingBulk}
      message={isDeletingBulk ? "Deleting Rate Charts" : "Uploading Rate Chart"}
      submessage={isDeletingBulk ? "Please wait while we delete selected rate charts..." : "Please wait while we process your CSV file..."}
      progress={uploadProgress}
      showProgress={true}
    />

    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <ManagementPageHeader
        title="Ratechart Management"
        subtitle="Manage rate charts for different milk channels (COW, BUF, MIX)"
        icon={<Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
        onRefresh={fetchRateCharts}
        onAdd={() => setShowUploadModal(true)}
        addButtonText="Upload Rate Chart"
      />

      {/* Success/Error Messages */}
      <StatusMessage 
        success={success} 
        error={error}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <StatsCard
          title="Unique Charts"
          value={uniqueCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="blue"
        />
        <StatsCard
          title="Total Assignments"
          value={totalCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="gray"
        />
        <StatsCard
          title="COW Charts"
          value={cowCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="green"
        />
        <StatsCard
          title="BUFFALO Charts"
          value={bufCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="blue"
        />
        <StatsCard
          title="MIXED Charts"
          value={mixCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="yellow"
        />
      </div>

      {/* Filter Controls */}
      <FilterDropdown
        statusFilter={'all'}
        onStatusChange={() => {}}
        societyFilter={societyFilter}
        onSocietyChange={setSocietyFilter}
        machineFilter={channelFilter}
        onMachineChange={setChannelFilter}
        societies={societies}
        machines={[
          { id: 1, machineId: 'COW', machineType: 'COW' },
          { id: 2, machineId: 'BUF', machineType: 'BUFFALO (BUF)' },
          { id: 3, machineId: 'MIX', machineType: 'MIXED (MIX)' }
        ]}
        filteredCount={Object.keys(groupedCharts).length}
        totalCount={rateCharts.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        icon={<Receipt className="w-5 h-5" />}
      />

      {/* Bulk Actions Bar - Only show when items are selected */}
      {selectedCharts.size > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Select All Checkbox */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All
                </span>
              </label>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCharts.size} selected
              </span>
            </div>

            {/* Delete Selected Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedCharts.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Rate Charts Display */}
      <div className="space-y-6">
        {Object.keys(groupedCharts).length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-12 h-12" />}
            title="No Rate Charts Found"
            message="Upload your first rate chart to get started"
            actionText="Upload Rate Chart"
            onAction={() => setShowUploadModal(true)}
            showAction={true}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.values(groupedCharts).map(group => {
              // Check if all chart records in this group are selected
              const isGroupSelected = group.chartRecordIds.every(id => selectedCharts.has(id));
              
              return (
                <RateChartMinimalCard
                  key={group.chartId}
                  chartId={group.chartId}
                  fileName={group.fileName}
                  channel={group.channel}
                  uploadedBy={group.uploadedBy}
                  createdAt={group.createdAt}
                  societies={group.societies}
                  isSelected={isGroupSelected}
                  searchQuery={searchQuery}
                  onToggleSelection={() => {
                    // Toggle all chart records for this group
                    if (isGroupSelected) {
                      // Deselect all
                      group.chartRecordIds.forEach(id => {
                        setSelectedCharts(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(id);
                          return newSet;
                        });
                      });
                    } else {
                      // Select all
                      group.chartRecordIds.forEach(id => {
                        setSelectedCharts(prev => new Set(prev).add(id));
                      });
                    }
                  }}
                  onDelete={() => handleDelete(group.chartRecordIds[0])}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* Upload Modal - Positioned outside main container */}
    <RateChartUploadModal
      isOpen={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      societies={societies}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      onUploadStart={() => setIsUploading(true)}
      onUploadEnd={() => setIsUploading(false)}
      onProgressUpdate={(progress) => setUploadProgress(progress)}
    />

    {/* Bulk Delete Confirmation Modal */}
    <BulkDeleteConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleBulkDelete}
      itemCount={selectedCharts.size}
      itemType="rate chart"
      hasFilters={societyFilter !== 'all' || channelFilter !== 'all' || searchQuery !== ''}
    />
  </>
  );
}
