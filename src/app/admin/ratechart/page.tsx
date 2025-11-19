'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Receipt, Trash2, Eye, FileText, Upload } from 'lucide-react';
import { 
  FlowerSpinner,
  StatusMessage,
  StatsCard,
  EmptyState,
  LoadingSnackbar
} from '@/components';
import { BulkActionsToolbar, FloatingActionButton } from '@/components/management';
import BulkDeleteConfirmModal from '@/components/management/BulkDeleteConfirmModal';
import RateChartUploadModal from '@/components/ratechart/RateChartUploadModal';
import RateChartMinimalCard from '@/components/ratechart/RateChartMinimalCard';
import AssignSocietyModal from '@/components/ratechart/AssignSocietyModal';
import TotalAssignmentsModal from '@/components/ratechart/TotalAssignmentsModal';
import ResetDownloadModal from '@/components/ratechart/ResetDownloadModal';
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
  status: number;
}

export default function RatechartManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  
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

  // Single delete confirmation
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<number | null>(null);
  const [chartToDeleteSocieties, setChartToDeleteSocieties] = useState<string>('');

  // Assign society modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedChartForAssign, setSelectedChartForAssign] = useState<{
    chartId: number;
    fileName: string;
    societies: Array<{ societyId: number; societyName: string; societyIdentifier: string }>;
  } | null>(null);

  // Bulk status
  const [bulkStatus, setBulkStatus] = useState<string>('active');

  // Total assignments modal
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  // Rate chart view modal
  const [showRateChartModal, setShowRateChartModal] = useState(false);
  const [selectedRateChart, setSelectedRateChart] = useState<{ fileName: string; channel: string; societyId: number } | null>(null);
  const [rateChartData, setRateChartData] = useState<Array<{ fat: string; snf: string; clr: string; rate: string }>>([]);
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [searchFat, setSearchFat] = useState('');
  const [searchSnf, setSearchSnf] = useState('');
  const [searchClr, setSearchClr] = useState('');

  // Reset download modal
  const [showResetDownloadModal, setShowResetDownloadModal] = useState(false);
  const [selectedChartForReset, setSelectedChartForReset] = useState<{
    chartId: number;
    fileName: string;
    channel: string;
    societies: Array<{ societyId: number; societyName: string }>;
    chartRecordIds: number[];
  } | null>(null);

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
      setError(t.ratechartManagement.failedToLoadCharts);
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

  // Fetch rate chart data
  const fetchRateChartData = async (fileName: string, channel: string, societyId: number) => {
    try {
      setLoadingChartData(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/user/ratechart/data?fileName=${encodeURIComponent(fileName)}&channel=${channel}&societyId=${societyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRateChartData(data.data || []);
      } else {
        setError(typeof data.error === 'string' ? data.error : data.error?.message || t.ratechartManagement.failedToFetchData);
      }
    } catch (error) {
      console.error('Error fetching rate chart data:', error);
      setError(t.ratechartManagement.failedToFetchData);
    } finally {
      setLoadingChartData(false);
    }
  };

  // Handle view rate chart
  const handleViewRateChart = (fileName: string, channel: string, societyId: number) => {
    setSelectedRateChart({ fileName, channel, societyId });
    setShowRateChartModal(true);
    fetchRateChartData(fileName, channel, societyId);
  };

  // Close rate chart modal
  const closeRateChartModal = () => {
    setShowRateChartModal(false);
    setSelectedRateChart(null);
    setRateChartData([]);
    setSearchFat('');
    setSearchSnf('');
    setSearchClr('');
  };

  // Handle delete - open confirmation modal
  const handleDelete = async (id: number) => {
    setChartToDelete(id);
    
    // Find the group that contains this chart ID to get society information
    const group = Object.values(groupedCharts).find(g => 
      g.chartRecordIds.includes(id) || g.chartId === id
    );
    
    if (group && group.societies.length > 0) {
      const societyIds = group.societies
        .map(s => s.societyIdentifier || s.societyId.toString())
        .join(', ');
      setChartToDeleteSocieties(societyIds);
    } else {
      setChartToDeleteSocieties('');
    }
    
    setShowSingleDeleteConfirm(true);
  };

  // Confirm single delete
  const confirmSingleDelete = async () => {
    if (!chartToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/ratechart/${chartToDelete}`, {
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
    } finally {
      setShowSingleDeleteConfirm(false);
      setChartToDelete(null);
      setChartToDeleteSocieties('');
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

  // Toggle status (active/inactive)
  const handleToggleStatus = async (chartId: number, currentStatus: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const newStatus = currentStatus === 1 ? 0 : 1;

      // Find the group and get all chart record IDs (master + shared)
      const group = Object.values(groupedCharts).find(g => g.chartId === chartId);
      const chartIds = group?.chartRecordIds || [chartId];

      const response = await fetch('/api/user/ratechart/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartIds, status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${t.ratechartManagement.statusUpdatedSuccessfully} ${newStatus === 1 ? t.ratechartManagement.active.toLowerCase() : t.ratechartManagement.inactive.toLowerCase()}`);
        fetchRateCharts();
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(data.message || t.ratechartManagement.failedToUpdateStatus);
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError(t.ratechartManagement.errorUpdatingStatus);
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const newStatus = status === 'active' ? 1 : 0;
      
      // Get all chart IDs from selected groups
      const selectedGroups = Object.values(groupedCharts).filter(group => 
        group.chartRecordIds.some(id => selectedCharts.has(id))
      );

      const allChartIds = selectedGroups.flatMap(group => group.chartRecordIds);

      const response = await fetch('/api/user/ratechart/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartIds: allChartIds, status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ ${selectedGroups.length} ${t.ratechartManagement.bulkStatusUpdated} ${status === 'active' ? t.ratechartManagement.active.toLowerCase() : t.ratechartManagement.inactive.toLowerCase()}`);
        setTimeout(() => setSuccess(''), 5000);
        // Clear selection and refresh
        setSelectedCharts(new Set());
        setSelectAll(false);
        await fetchRateCharts();
      } else {
        setError(data.message || t.ratechartManagement.failedToUpdateStatus);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating bulk status:', error);
      setError(t.ratechartManagement.errorUpdatingStatus);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Filter rate charts
  const filteredRateCharts = rateCharts.filter(chart => {
    if (societyFilter !== 'all' && chart.societyId.toString() !== societyFilter) return false;
    
    // Handle channel filter including 'unique' option
    if (channelFilter !== 'all') {
      if (channelFilter === 'unique') {
        // For unique filter, only show charts that are not shared
        // This means: shared_chart_id is null AND no other charts reference this chart
        const isShared = rateCharts.some(c => c.shared_chart_id === chart.id);
        if (chart.shared_chart_id !== null || isShared) return false;
      } else {
        // For specific channel filters (COW, BUF, MIX)
        if (chart.channel !== channelFilter) return false;
      }
    }
    
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
      status: masterChart.status,
      societies: [],
      chartRecordIds: [masterChart.id] // Start with master chart ID
    };
    
    // Add the master chart's society with its chart record ID
    acc[masterChart.id].societies.push({
      societyId: masterChart.societyId,
      societyName: masterChart.societyName,
      societyIdentifier: masterChart.societyIdentifier,
      chartRecordId: masterChart.id // Add the chart record ID for this society
    });
    
    // Find all societies that share this chart
    filteredRateCharts.forEach(chart => {
      if (chart.shared_chart_id === masterChart.id) {
        acc[masterChart.id].societies.push({
          societyId: chart.societyId,
          societyName: chart.societyName,
          societyIdentifier: chart.societyIdentifier,
          chartRecordId: chart.id // Add the chart record ID for this society
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
    status: number;
    societies: { societyId: number; societyName: string; societyIdentifier: string; chartRecordId: number }[];
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

  // Handle opening assign modal
  const handleOpenAssignModal = (chartId: number, fileName: string, societies: Array<{ societyId: number; societyName: string; societyIdentifier: string }>) => {
    setSelectedChartForAssign({ chartId, fileName, societies });
    setShowAssignModal(true);
  };

  // Handle assigning chart to additional societies
  const handleAssignSocieties = async (societyIds: number[], replaceExisting: boolean) => {
    if (!selectedChartForAssign) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/ratechart/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          masterChartId: selectedChartForAssign.chartId,
          societyIds,
          replaceExisting
        })
      });

      const data = await response.json();
      
      // Handle conflict scenario (409 status)
      if (response.status === 409 && data.requiresConfirmation) {
        return {
          requiresConfirmation: true,
          conflicts: data.conflicts
        };
      }
      
      if (data.success) {
        setSuccess(`Successfully assigned chart to ${data.data.assignedCount} ${data.data.assignedCount === 1 ? 'society' : 'societies'}`);
        setTimeout(() => setSuccess(''), 5000);
        
        // Refresh rate charts to show updated assignments
        await fetchRateCharts();
        
        setShowAssignModal(false);
        setSelectedChartForAssign(null);
        return;
      } else {
        setError(data.message || 'Failed to assign chart to societies');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error assigning chart to societies:', error);
      setError('Error assigning chart to societies');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle opening reset download modal
  const handleOpenResetDownloadModal = (chartId: number, fileName: string, channel: string, societies: Array<{ societyId: number; societyName: string; societyIdentifier: string }>, chartRecordIds: number[]) => {
    setSelectedChartForReset({
      chartId,
      fileName,
      channel,
      societies: societies.map(s => ({ societyId: s.societyId, societyName: s.societyName })),
      chartRecordIds
    });
    setShowResetDownloadModal(true);
  };

  // Handle resetting download history
  const handleResetDownload = async (machineIds: number[]) => {
    if (!selectedChartForReset) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/ratechart/reset-download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chartIds: selectedChartForReset.chartRecordIds || [selectedChartForReset.chartId],
          machineIds,
          channel: selectedChartForReset.channel
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const machineCount = machineIds.length;
        const chartName = selectedChartForReset.fileName;
        const channel = selectedChartForReset.channel;
        setSuccess(`✅ Successfully reset ${channel} channel download status for ${machineCount} machine${machineCount > 1 ? 's' : ''}. Chart "${chartName}" can now be re-downloaded by selected machines.`);
        setTimeout(() => setSuccess(''), 6000);
        setShowResetDownloadModal(false);
        setSelectedChartForReset(null);
      } else {
        setError(data.message || 'Failed to reset download history');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error resetting download history:', error);
      setError('❌ Error resetting download history. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle removing society from rate chart
  const handleRemoveSociety = async (chartRecordId: number, societyId: number, societyName: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/ratechart/remove-society', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId: chartRecordId, societyId })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Successfully removed ${societyName} from rate chart`);
        setTimeout(() => setSuccess(''), 5000);
        // Force a fresh fetch to update the UI
        setRateCharts([]);
        await fetchRateCharts();
      } else {
        setError(data.message || 'Failed to remove society');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error removing society:', error);
      setError('❌ Error removing society. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Calculate stats - only count unique master charts
  const allMasterCharts = rateCharts.filter(chart => chart.shared_chart_id === null);
  const uniqueCharts = allMasterCharts.length;
  // Count only valid assignments (those with a master chart or valid shared reference)
  const totalAssignments = rateCharts.length;
  const cowCharts = allMasterCharts.filter(c => c.channel === 'COW').length;
  const bufCharts = allMasterCharts.filter(c => c.channel === 'BUF').length;
  const mixCharts = allMasterCharts.filter(c => c.channel === 'MIX').length;

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
      message={isDeletingBulk ? t.ratechartManagement.deletingRateCharts : t.ratechartManagement.uploadingRateChart}
      submessage={isDeletingBulk ? t.ratechartManagement.pleaseWaitDeleting : t.ratechartManagement.pleaseWaitUploading}
      progress={uploadProgress}
      showProgress={true}
    />

    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <ManagementPageHeader
        title={t.ratechartManagement.title}
        subtitle={t.ratechartManagement.subtitle}
        icon={<Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
        onRefresh={fetchRateCharts}
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
          title={t.ratechartManagement.uniqueCharts}
          value={uniqueCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="blue"
          onClick={() => setChannelFilter('unique')}
          clickable={true}
          isActive={channelFilter === 'unique'}
        />
        <StatsCard
          title={t.ratechartManagement.totalAssignments}
          value={totalAssignments}
          icon={<Receipt className="w-4 h-4" />}
          color="gray"
          onClick={() => {
            setChannelFilter('all');
            setShowAssignmentsModal(true);
          }}
          clickable={true}
          isActive={channelFilter === 'all'}
        />
        <StatsCard
          title={t.ratechartManagement.cowCharts}
          value={cowCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="green"
          onClick={() => setChannelFilter('COW')}
          clickable={true}
          isActive={channelFilter === 'COW'}
        />
        <StatsCard
          title={t.ratechartManagement.buffaloCharts}
          value={bufCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="blue"
          onClick={() => setChannelFilter('BUF')}
          clickable={true}
          isActive={channelFilter === 'BUF'}
        />
        <StatsCard
          title={t.ratechartManagement.mixedCharts}
          value={mixCharts}
          icon={<Receipt className="w-4 h-4" />}
          color="yellow"
          onClick={() => setChannelFilter('MIX')}
          clickable={true}
          isActive={channelFilter === 'MIX'}
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
          { id: 1, machineId: 'COW', machineType: t.ratechartManagement.cow },
          { id: 2, machineId: 'BUF', machineType: t.ratechartManagement.buffalo },
          { id: 3, machineId: 'MIX', machineType: t.ratechartManagement.mixed }
        ]}
        filteredCount={Object.keys(groupedCharts).length}
        totalCount={rateCharts.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        icon={<Receipt className="w-5 h-5" />}
      />

      {/* Bulk Actions Toolbar */}
      {selectedCharts.size > 0 && (
        <BulkActionsToolbar
          selectedCount={(() => {
            const selectedGroupCount = Object.values(groupedCharts).filter(group => 
              group.chartRecordIds.some(id => selectedCharts.has(id))
            ).length;
            return selectedGroupCount;
          })()}
          onBulkDelete={() => setShowDeleteConfirm(true)}
          onClearSelection={() => {
            setSelectedCharts(new Set());
            setSelectAll(false);
          }}
          itemType="rate chart"
          showStatusUpdate={true}
          currentBulkStatus={bulkStatus}
          onBulkStatusChange={(status) => {
            setBulkStatus(status);
            handleBulkStatusUpdate(status);
          }}
          statusOptions={[
            { status: 'active', label: t.ratechartManagement.active, color: 'bg-green-500', bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/30' },
            { status: 'inactive', label: t.ratechartManagement.inactive, color: 'bg-red-500', bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/30' }
          ]}
        />
      )}

      {/* Rate Charts Display */}
      <div className="space-y-6">
        {Object.keys(groupedCharts).length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-12 h-12" />}
            title={t.ratechartManagement.noRateChartsFound}
            message={t.ratechartManagement.uploadFirstChart}
            actionText={t.ratechartManagement.uploadRateChart}
            onAction={() => setShowUploadModal(true)}
            showAction={true}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
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
                  status={group.status}
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
                  onAssignSociety={() => handleOpenAssignModal(group.chartId, group.fileName, group.societies)}
                  onDelete={() => handleDelete(group.chartRecordIds[0])}
                  onToggleStatus={handleToggleStatus}
                  onView={() => handleViewRateChart(group.fileName, group.channel, group.societies[0]?.societyId || 0)}
                  onResetDownload={() => handleOpenResetDownloadModal(group.chartId, group.fileName, group.channel, group.societies, group.chartRecordIds)}
                  onRemoveSociety={handleRemoveSociety}
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
      itemCount={(() => {
        const selectedGroupCount = Object.values(groupedCharts).filter(group => 
          group.chartRecordIds.some(id => selectedCharts.has(id))
        ).length;
        return selectedGroupCount;
      })()}
      itemType="rate chart"
      hasFilters={societyFilter !== 'all' || channelFilter !== 'all' || searchQuery !== ''}
      additionalInfo={(() => {
        // Get all selected groups
        const selectedGroups = Object.values(groupedCharts).filter(group => 
          group.chartRecordIds.some(id => selectedCharts.has(id))
        );
        
        if (selectedGroups.length === 0) return undefined;
        
        // Build society info for each selected chart
        const chartInfo = selectedGroups.map(group => {
          const societyIds = group.societies
            .map(s => s.societyIdentifier || s.societyId.toString())
            .join(', ');
          return `${group.fileName} (${group.channel}): ${societyIds}`;
        });
        
        return chartInfo.join(' | ');
      })()}
    />

    {/* Assign Society Modal */}
    {selectedChartForAssign && (
      <AssignSocietyModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedChartForAssign(null);
        }}
        onAssign={handleAssignSocieties}
        chartId={selectedChartForAssign.chartId}
        fileName={selectedChartForAssign.fileName}
        currentSocieties={selectedChartForAssign.societies}
        allSocieties={societies}
      />
    )}

    {/* Total Assignments Modal */}
    <TotalAssignmentsModal
      isOpen={showAssignmentsModal}
      onClose={() => setShowAssignmentsModal(false)}
      rateCharts={rateCharts}
    />

    {/* Single Delete Confirmation Modal */}
    <BulkDeleteConfirmModal
      isOpen={showSingleDeleteConfirm}
      onClose={() => {
        setShowSingleDeleteConfirm(false);
        setChartToDelete(null);
        setChartToDeleteSocieties('');
      }}
      onConfirm={confirmSingleDelete}
      itemCount={1}
      itemType="rate chart"
      additionalInfo={chartToDeleteSocieties ? `Assigned to society IDs: ${chartToDeleteSocieties}` : undefined}
    />

    {/* Rate Chart View Modal */}
    {showRateChartModal && selectedRateChart && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Rate Chart - {selectedRateChart.channel} Channel
              </h2>
              <button
                onClick={closeRateChartModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chart Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">File Name</h3>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedRateChart.fileName}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedRateChart.channel}
                </span>
              </div>
            </div>

            {/* Search Inputs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search FAT</label>
                <input
                  type="text"
                  value={searchFat}
                  onChange={(e) => setSearchFat(e.target.value)}
                  placeholder="e.g., 3.5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search SNF</label>
                <input
                  type="text"
                  value={searchSnf}
                  onChange={(e) => setSearchSnf(e.target.value)}
                  placeholder="e.g., 8.5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search CLR</label>
                <input
                  type="text"
                  value={searchClr}
                  onChange={(e) => setSearchClr(e.target.value)}
                  placeholder="e.g., 25.0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Chart Data Table */}
            <div className="overflow-auto max-h-[60vh]">
              {loadingChartData ? (
                <div className="flex justify-center items-center py-8">
                  <FlowerSpinner />
                </div>
              ) : (() => {
                // Filter data based on search inputs
                const filteredData = rateChartData.filter(row => {
                  const matchFat = !searchFat || row.fat.toLowerCase().includes(searchFat.toLowerCase());
                  const matchSnf = !searchSnf || row.snf.toLowerCase().includes(searchSnf.toLowerCase());
                  const matchClr = !searchClr || row.clr.toLowerCase().includes(searchClr.toLowerCase());
                  return matchFat && matchSnf && matchClr;
                });
                
                return filteredData.length > 0 ? (
                <div>
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                          FAT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                          SNF
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                          CLR
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                            {row.fat}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                            {row.snf}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                            {row.clr}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                            ₹{row.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                    Showing {filteredData.length} of {rateChartData.length} records
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{searchFat || searchSnf || searchClr ? 'No matching records found' : 'No data available for this rate chart'}</p>
                </div>
              );
              })()}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={closeRateChartModal}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Reset Download Modal */}
    {selectedChartForReset && (
      <ResetDownloadModal
        show={showResetDownloadModal}
        onClose={() => {
          setShowResetDownloadModal(false);
          setSelectedChartForReset(null);
        }}
        onConfirm={handleResetDownload}
        chartId={selectedChartForReset.chartId}
        fileName={selectedChartForReset.fileName}
        channel={selectedChartForReset.channel}
        societies={selectedChartForReset.societies}
      />
    )}

    {/* Floating Action Button */}
    <FloatingActionButton
      actions={[
        {
          icon: <Upload className="w-6 h-6 text-white" />,
          label: t.ratechartManagement.uploadRateChart,
          onClick: () => setShowUploadModal(true),
          color: 'bg-gradient-to-br from-green-500 to-green-600'
        }
      ]}
      directClick={true}
    />
  </>
  );
}
