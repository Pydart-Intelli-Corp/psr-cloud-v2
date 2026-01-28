'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Download,
  FileDown,
  Truck,
  Package,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Trash2,
  Mail,
  Settings
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatsCard from '@/components/management/StatsCard';
import { FlowerSpinner, PageLoader } from '@/components';
import { FilterDropdown, LoadingSnackbar, StatusMessage, BulkActionsToolbar } from '@/components/management';
import PasswordConfirmDialog from '@/components/dialogs/PasswordConfirmDialog';
import EnhancedEmailReportModal from '@/components/dialogs/EnhancedEmailReportModal';
import DownloadModal from '@/components/dialogs/DownloadModal';
import ReportUploadDialog from '@/components/dialogs/ReportUploadDialog';
import { ColumnConfig } from '@/components/dialogs/ColumnSelector';

interface DispatchRecord {
  id: number;
  dispatch_id: string;
  society_id: string;
  society_name: string;
  bmc_id?: number;
  bmc_name?: string;
  dairy_id?: number;
  dairy_name?: string;
  machine_id: string;
  dispatch_date: string;
  dispatch_time: string;
  shift_type: string;
  channel: string;
  quantity: string;
  fat_percentage: string;
  snf_percentage: string;
  clr_value: string;
  rate_per_liter: string;
  total_amount: string;
  machine_type: string;
  machine_version: string;
}

interface DispatchStats {
  totalDispatches: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
}

// Column configuration for dispatch reports
const getDispatchColumns = (reportSource: 'society' | 'bmc'): ColumnConfig[] => [
  { key: 'dispatch_date', label: 'Date', required: true, description: 'Dispatch date' },
  { key: 'dispatch_time', label: 'Time', required: true, description: 'Dispatch time' },
  { key: 'dispatch_id', label: 'Dispatch ID', description: 'Unique dispatch identifier' },
  { key: reportSource === 'bmc' ? 'bmc_id' : 'society_id', label: reportSource === 'bmc' ? 'BMC ID' : 'Society ID', required: true, description: reportSource === 'bmc' ? 'BMC identifier' : 'Society identifier' },
  { key: reportSource === 'bmc' ? 'bmc_name' : 'society_name', label: reportSource === 'bmc' ? 'BMC' : 'Society', required: true, description: reportSource === 'bmc' ? 'BMC name' : 'Society name' },
  { key: 'machine_id', label: 'Machine ID', description: 'Machine identifier' },
  { key: 'machine_type', label: 'Machine Type', description: 'Type of machine used' },
  { key: 'shift_type', label: 'Shift', description: 'Morning or evening shift' },
  { key: 'channel', label: 'Channel', description: 'Milk type (COW/BUFFALO/MIXED)' },
  { key: 'quantity', label: 'Quantity (L)', required: true, description: 'Milk quantity in liters' },
  { key: 'fat_percentage', label: 'Fat %', description: 'Fat percentage' },
  { key: 'snf_percentage', label: 'SNF %', description: 'Solid-not-fat percentage' },
  { key: 'clr_value', label: 'CLR', description: 'Combined Lactometer Reading' },
  { key: 'rate_per_liter', label: 'Rate/L', required: true, description: 'Rate per liter' },
  { key: 'total_amount', label: 'Total Amount', required: true, description: 'Total payment amount' },
  { key: reportSource === 'bmc' ? 'society_name' : 'bmc_name', label: reportSource === 'bmc' ? 'Society' : 'BMC', description: reportSource === 'bmc' ? 'Society name' : 'BMC name' },
  { key: 'dairy_name', label: 'Dairy', description: 'Dairy name' }
];

// Default columns for dispatch reports
const getDefaultDispatchColumns = (reportSource: 'society' | 'bmc') => [
  'dispatch_date', 'dispatch_time', 'dispatch_id', 
  reportSource === 'bmc' ? 'bmc_id' : 'society_id', 
  reportSource === 'bmc' ? 'bmc_name' : 'society_name', 
  'channel', 'shift_type', 'quantity', 
  'fat_percentage', 'snf_percentage', 'clr_value',
  'rate_per_liter', 'total_amount'
];

// Helper function to highlight matching text in search results
const highlightText = (text: string | number | null | undefined, searchQuery: string) => {
  if (!text && text !== 0) return text || '';
  if (!searchQuery) return text;
  
  const textStr = text.toString();
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = textStr.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Helper function to map channel codes to display names
const getChannelDisplay = (channel: string): string => {
  const channelMap: { [key: string]: string } = {
    'ch1': 'COW',
    'ch2': 'BUFFALO',
    'ch3': 'MIXED',
    'CH1': 'COW',
    'CH2': 'BUFFALO',
    'CH3': 'MIXED',
    'COW': 'COW',
    'BUFFALO': 'BUFFALO',
    'MIXED': 'MIXED',
    'cow': 'COW',
    'buffalo': 'BUFFALO',
    'mixed': 'MIXED',
    'BUF': 'BUFFALO',
    'MIX': 'MIXED'
  };
  return channelMap[channel] || channel.toUpperCase();
};

interface DispatchReportsProps {
  globalSearch?: string;
  reportSource?: 'society' | 'bmc';
}

export default function DispatchReports({ globalSearch = '', reportSource = 'society' }: DispatchReportsProps) {
  const [records, setRecords] = useState<DispatchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DispatchRecord[]>([]);
  const [stats, setStats] = useState<DispatchStats>({
    totalDispatches: 0,
    totalQuantity: 0,
    totalAmount: 0,
    averageRate: 0,
    weightedFat: 0,
    weightedSnf: 0,
    weightedClr: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sync global search with local search
  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  // Combined search from global header and local search
  const combinedSearch = useMemo(() => globalSearch || searchQuery, [globalSearch, searchQuery]);
  
  const [dateFilter, setDateFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState<string[]>([]);

  // Fetch dairies and BMCs
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);

  // Delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Bulk selection and delete
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [bulkDeletePassword, setBulkDeletePassword] = useState('');

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  
  // Fetch dairies, BMCs, societies, and machines
  const [societiesData, setSocietiesData] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [machinesData, setMachinesData] = useState<Array<{ id: number; machineId: string; machineType: string; societyId?: number }>>([]);

  useEffect(() => {
    const fetchDairiesAndBmcs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const dairyRes = await fetch('/api/user/dairy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dairyRes.ok) {
          const dairyData = await dairyRes.json();
          setDairies(dairyData.data || []);
        }

        const bmcRes = await fetch('/api/user/bmc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bmcRes.ok) {
          const bmcData = await bmcRes.json();
          setBmcs(bmcData.data || []);
        }

        const societyRes = await fetch('/api/user/society', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (societyRes.ok) {
          const societyData = await societyRes.json();
          setSocietiesData(societyData.data || []);
        }

        const machineRes = await fetch('/api/user/machine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (machineRes.ok) {
          const machineData = await machineRes.json();
          setMachinesData(machineData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dairies/BMCs/Societies/Machines:', error);
      }
    };

    fetchDairiesAndBmcs();
  }, []);

  // Filter dairies to only show those with dispatch records
  const dairiesWithDispatches = useMemo(() => {
    if (!dairies.length || !records.length) return dairies;
    
    const dairyIdsInDispatches = new Set(
      records
        .filter(r => r.dairy_id)
        .map(r => r.dairy_id)
    );
    
    return dairies.filter(dairy => dairyIdsInDispatches.has(dairy.id));
  }, [dairies, records]);

  // Clear all filters
  const clearFilters = () => {
    setShiftFilter('all');
    setDairyFilter([]);
    setBmcFilter([]);
    setSocietyFilter([]);
    setMachineFilter([]);
    setDateFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setChannelFilter('all');
    setSearchQuery('');
    
    // Clear header search
    const event = new CustomEvent('globalSearch', {
      detail: { query: '' }
    });
    window.dispatchEvent(event);
  };

  // Delete record handler
  const handleDeleteClick = (recordId: number) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!recordToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/reports/dispatches/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recordId: recordToDelete,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete record');
      }

      // Show success message
      setSuccessMessage('Dispatch record deleted successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Refresh the records
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete record');
      setTimeout(() => setErrorMessage(''), 5000);
      throw error; // Re-throw to be handled by the dialog
    } finally {
      setDeleting(false);
      setRecordToDelete(null);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
      setSelectAll(false);
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (recordId: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
    setSelectAll(newSelected.size === filteredRecords.length && filteredRecords.length > 0);
  };

  const handleClearSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleBulkDeleteClick = () => {
    if (selectedRecords.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleUploadPasswordConfirm = async (password: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/reports/dispatches/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password, verifyOnly: true })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid password');
      }

      setShowPasswordDialog(false);
      setUploadDialogOpen(true);
    } catch (error) {
      throw error;
    }
  };

  // Handle file upload
  const handleUploadFile = async (file: File, reportType: 'collection' | 'dispatch' | 'sales', machineId?: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      if (machineId) {
        formData.append('machineId', machineId.toString());
      }

      // Map report types to correct plural forms
      const endpointMap: Record<'collection' | 'dispatch' | 'sales', string> = {
        collection: 'collections',
        dispatch: 'dispatches',
        sales: 'sales'
      };
      const endpoint = `/api/user/reports/${endpointMap[reportType]}/upload`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMessage(
        `Successfully uploaded ${data.successCount} of ${data.totalRows} records` +
        (data.errorCount > 0 ? `. ${data.errorCount} failed.` : '')
      );
      setTimeout(() => setSuccessMessage(''), 5000);

      fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleBulkDeleteConfirm = async (password: string) => {
    setShowBulkDeleteConfirm(false);
    setIsDeletingBulk(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const recordIds = Array.from(selectedRecords);
      
      const deletePromises = recordIds.map(recordId =>
        fetch('/api/user/reports/dispatches/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ recordId, password })
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Delete failed');
          }
          return res.json();
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        setSuccessMessage(`Successfully deleted ${successful} record(s)${failed > 0 ? `. ${failed} failed.` : ''}`);
        setTimeout(() => setSuccessMessage(''), 5000);
        fetchData();
        handleClearSelection();
      } else {
        const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
        const errorMsg = firstError?.reason?.message || 'Failed to delete selected records';
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete selected records');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsDeletingBulk(false);
      setBulkDeletePassword('');
    }
  };
  
  // Filter societies to only show those with dispatch records
  const societies = useMemo(() => {
    if (!societiesData.length || !records.length) return societiesData;
    
    const societyIdsInDispatches = new Set(
      records
        .filter(r => r.society_id)
        .map(r => r.society_id)
    );
    
    return societiesData.filter(society => societyIdsInDispatches.has(society.society_id));
  }, [societiesData, records]);
  
  // Filter machines to only show those with dispatch records
  const machines = useMemo(() => {
    if (!machinesData.length || !records.length) return machinesData;
    
    const machineIdsInDispatches = new Set(
      records
        .filter(r => r.machine_id)
        .map(r => r.machine_id)
    );
    
    const filteredMachines = machinesData.filter(machine => machineIdsInDispatches.has(machine.machineId));
    
    // Add dispatch counts to machines
    return filteredMachines.map(machine => ({
      ...machine,
      collectionCount: records.filter(r => r.machine_id === machine.machineId).length
    }));
  }, [machinesData, records]);

  // Calculate statistics
  const calculateStats = useCallback((data: DispatchRecord[]) => {
    const totalQuantity = data.reduce((sum, record) => sum + parseFloat(record.quantity || '0'), 0);
    const totalAmount = data.reduce((sum, record) => sum + parseFloat(record.total_amount || '0'), 0);
    
    // Calculate simple average rate from rate_per_liter column
    const totalRate = data.reduce((sum, record) => sum + parseFloat(record.rate_per_liter || '0'), 0);
    const averageRate = data.length > 0 ? totalRate / data.length : 0;
    
    // Calculate weighted averages
    const sumQuantityFat = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const fat = parseFloat(record.fat_percentage || '0');
      return sum + (qty * fat);
    }, 0);
    const sumQuantitySnf = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const snf = parseFloat(record.snf_percentage || '0');
      return sum + (qty * snf);
    }, 0);
    const sumQuantityClr = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const clr = parseFloat(record.clr_value || '0');
      return sum + (qty * clr);
    }, 0);
    
    const weightedFat = totalQuantity > 0 ? sumQuantityFat / totalQuantity : 0;
    const weightedSnf = totalQuantity > 0 ? sumQuantitySnf / totalQuantity : 0;
    const weightedClr = totalQuantity > 0 ? sumQuantityClr / totalQuantity : 0;

    setStats({
      totalDispatches: data.length,
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      weightedFat: parseFloat(weightedFat.toFixed(2)),
      weightedSnf: parseFloat(weightedSnf.toFixed(2)),
      weightedClr: parseFloat(weightedClr.toFixed(2))
    });
  }, []);

  // Fetch dispatch data
  const fetchData = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      if (showLoading) setLoading(true);
      const endpoint = reportSource === 'bmc' ? '/api/user/reports/bmc-dispatches' : '/api/user/reports/dispatches';
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Only update state if data has changed to prevent unnecessary re-renders
        setRecords(prevRecords => {
          const hasChanged = JSON.stringify(prevRecords) !== JSON.stringify(data);
          if (hasChanged) {
            calculateStats(data);
            return data;
          }
          return prevRecords;
        });
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [calculateStats, reportSource]);

  useEffect(() => {
    fetchData(true);
    
    // Auto-refresh every 1 second without showing loading
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Fetch admin email for email functionality
  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const email = data.email || '';
          setAdminEmail(email);
        }
      } catch (error) {
        console.error('Error fetching admin email:', error);
      }
    };

    fetchAdminEmail();
  }, []);

  // Filter records with multi-field search (matching machine management pattern)
  useEffect(() => {
    let filtered = records;

    // Dairy filter
    if (dairyFilter.length > 0) {
      const selectedDairyIds = dairyFilter
        .map(id => dairies.find(d => d.id.toString() === id)?.id)
        .filter(Boolean) as number[];
      if (selectedDairyIds.length > 0) {
        filtered = filtered.filter(record => record.dairy_id && selectedDairyIds.includes(record.dairy_id));
      }
    }

    // BMC filter
    if (bmcFilter.length > 0) {
      const selectedBmcIds = bmcFilter
        .map(id => bmcs.find(b => b.id.toString() === id)?.id)
        .filter(Boolean) as number[];
      if (selectedBmcIds.length > 0) {
        filtered = filtered.filter(record => record.bmc_id && selectedBmcIds.includes(record.bmc_id));
      }
    }

    // Status/Shift filter
    if (shiftFilter !== 'all') {
      if (shiftFilter === 'morning') {
        filtered = filtered.filter(record => ['MR', 'MX', 'morning'].includes(record.shift_type));
      } else if (shiftFilter === 'evening') {
        filtered = filtered.filter(record => ['EV', 'EX', 'evening'].includes(record.shift_type));
      } else {
        filtered = filtered.filter(record => record.shift_type === shiftFilter);
      }
    }

    // Society filter
    if (Array.isArray(societyFilter) && societyFilter.length > 0) {
      const selectedSocietyIds = societyFilter.map(id => {
        const society = societies.find(s => s.id.toString() === id);
        return society?.society_id;
      }).filter(Boolean);
      if (selectedSocietyIds.length > 0) {
        filtered = filtered.filter(record => selectedSocietyIds.includes(record.society_id));
      }
    }

    // Machine filter
    if (machineFilter.length > 0) {
      const selectedMachineIds = machineFilter
        .map(id => machines.find(m => m.id.toString() === id)?.machineId)
        .filter(Boolean) as string[];
      if (selectedMachineIds.length > 0) {
        filtered = filtered.filter(record => selectedMachineIds.includes(record.machine_id));
      }
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(record => {
        const displayChannel = getChannelDisplay(record.channel);
        return displayChannel === channelFilter;
      });
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.dispatch_date === dateFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(record => record.dispatch_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter(record => record.dispatch_date <= dateToFilter);
    }

    // Multi-field search across dispatch details (matching machine management pattern)
    if (combinedSearch) {
      const searchLower = combinedSearch.toLowerCase();
      filtered = filtered.filter(record => {
        // Get display value for shift
        const shiftDisplay = ['MR', 'MX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'morning'
          ? 'Morning' 
          : ['EV', 'EX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'evening'
          ? 'Evening' 
          : record.shift_type;
        
        return [
          record.dispatch_id,
          record.society_id,
          record.society_name,
          record.bmc_name,
          record.dairy_name,
          record.machine_id,
          record.machine_type,
          record.machine_version,
          record.channel,
          getChannelDisplay(record.channel),
          record.dispatch_date,
          record.dispatch_time,
          record.shift_type,
          shiftDisplay,
          record.quantity,
          record.fat_percentage,
          record.snf_percentage,
          record.clr_value,
          record.rate_per_liter,
          record.total_amount
        ].some(field =>
          field?.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
  }, [globalSearch, searchQuery, dateFilter, dateFromFilter, dateToFilter, shiftFilter, channelFilter, societyFilter, machineFilter, dairyFilter, bmcFilter, records, societies, machines, dairies, bmcs, calculateStats]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return;

    const dateRange = dateFromFilter && dateToFilter 
      ? `${dateFromFilter} To ${dateToFilter}`
      : dateFilter || 'All Dates';
    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    // Detailed data rows
    const dataRows = filteredRecords.map(record => [
      record.dispatch_date,
      record.dispatch_time,
      record.channel,
      record.shift_type,
      `${record.machine_id} (${record.machine_type})`,
      reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    const csvContent = [
      'Admin Report - LactoConnect Milk Dispatch System',
      `Date From ${dateRange}`,
      '',
      'DETAILED DISPATCH DATA',
      '',
      'Date,Time,Channel,Shift,Machine,' + (reportSource === 'bmc' ? 'BMC' : 'Society') + ',Fat (%),SNF (%),CLR,Rate,Quantity (L),Total Amount',
      ...dataRows.map(row => row.join(',')),
      '',
      '',
      'OVERALL SUMMARY',
      `Total Dispatches:,${stats.totalDispatches}`,
      `Total Quantity (L):,${stats.totalQuantity.toFixed(2)}`,
      `Overall Weighted Fat (%):,${stats.weightedFat.toFixed(2)}`,
      `Overall Weighted SNF (%):,${stats.weightedSnf.toFixed(2)}`,
      `Overall Weighted CLR:,${stats.weightedClr.toFixed(2)}`,
      `Total Amount (Rs):,${stats.totalAmount.toFixed(2)}`,
      `Overall Average Rate (Rs/L):,${stats.averageRate.toFixed(2)}`,
      '',
      'Thank you',
      'Poornasree Equipments',
      `Generated on: ${currentDateTime}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispatch-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    if (filteredRecords.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dateRange = dateFromFilter && dateToFilter 
      ? `${dateFromFilter} To ${dateToFilter}`
      : dateFilter 
      ? `${dateFilter} To ${dateFilter}`
      : 'All Dates';

    // Add Logo
    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Dispatch Report - LactoConnect Milk Dispatch System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED DISPATCH DATA', 148.5, 28, { align: 'center' });

    // Detailed Data Table with SI No
    const tableData = filteredRecords.map((record, index) => [
      (index + 1).toString(),
      record.dispatch_date,
      record.dispatch_time,
      getChannelDisplay(record.channel),
      record.shift_type,
      `${record.machine_id} (${record.machine_type})`,
      reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['SI No', 'Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', 'Fat (%)', 'SNF (%)', 'CLR', 'Rate', 'Quantity (L)', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 12 }
      }
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Left side - Weighted Averages
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WEIGHTED AVERAGES', 14, finalY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let leftY = finalY + 6;
    doc.text(`Weighted Fat      : ${stats.weightedFat.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted SNF      : ${stats.weightedSnf.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted CLR      : ${stats.weightedClr.toFixed(2)}`, 14, leftY);
    
    leftY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('OVERALL SUMMARY', 14, leftY);
    doc.setFont('helvetica', 'normal');
    leftY += 6;
    doc.text(`Total Dispatches   : ${stats.totalDispatches}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);

    // Right side - Report Notes
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let rightY = finalY + 6;
    doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
    
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    rightY += 5;
    doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

    doc.save(`dispatch-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Send email with CSV and PDF attachments
  const handleSendEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    try {
      // Generate CSV content
      const dateRange = dateFromFilter && dateToFilter 
        ? `${dateFromFilter} To ${dateToFilter}`
        : dateFilter || 'All Dates';
      const currentDateTime = new Date().toLocaleString('en-IN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
      });

      const dataRows = filteredRecords.map(record => [
        record.dispatch_date,
        record.dispatch_time,
        record.channel,
        record.shift_type,
        `${record.machine_id} (${record.machine_type})`,
        reportSource === 'bmc' ? (record.bmc_name || 'N/A') : (record.society_name || ''),
        record.fat_percentage,
        record.snf_percentage,
        record.clr_value,
        record.rate_per_liter,
        record.quantity,
        record.total_amount
      ]);

      const csvContent = [
        ['POORNASREE EQUIPMENTS MILK DISPATCH REPORT'],
        ['Admin Report with Weighted Averages'],
        [],
        ['Report Generated:', currentDateTime],
        ['Date Range:', dateRange],
        ['Total Dispatches:', stats.totalDispatches],
        ['Total Quantity (L):', stats.totalQuantity.toFixed(2)],
        ['Total Amount (₹):', stats.totalAmount.toFixed(2)],
        ['Average Rate (₹/L):', stats.averageRate.toFixed(2)],
        ['Weighted FAT (%):', stats.weightedFat.toFixed(2)],
        ['Weighted SNF (%):', stats.weightedSnf.toFixed(2)],
        ['Weighted CLR:', stats.weightedClr.toFixed(2)],
        [],
        ['Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', 'Fat (%)', 'SNF (%)', 'CLR', 'Rate (₹/L)', 'Quantity (L)', 'Total Amount (₹)'],
        ...dataRows
      ].map(row => row.join(',')).join('\n');

      // Generate PDF as base64 - matching current PDF design exactly
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Add Logo (same as current PDF)
      const logoPath = '/fulllogo.png';
      doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

      // Header (same as current PDF)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Dispatch Report - LactoConnect Milk Dispatch System', 148.5, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED DISPATCH DATA', 148.5, 28, { align: 'center' });

      // Detailed Data Table with SI No (same as current PDF)
      const tableData = filteredRecords.map((record, index) => [
        (index + 1).toString(),
        record.dispatch_date,
        record.dispatch_time,
        getChannelDisplay(record.channel),
        record.shift_type,
        `${record.machine_id} (${record.machine_type})`,
        reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
        record.fat_percentage,
        record.snf_percentage,
        record.clr_value,
        record.rate_per_liter,
        record.quantity,
        record.total_amount
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['SI No', 'Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', 'Fat (%)', 'SNF (%)', 'CLR', 'Rate', 'Quantity (L)', 'Total Amount']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
        bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 12 }
        }
      });

      // Summary Section (same as current PDF)
      const finalY = doc.lastAutoTable.finalY + 8;
      
      // Left side - Weighted Averages
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WEIGHTED AVERAGES', 14, finalY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let leftY = finalY + 6;
      doc.text(`Weighted Fat      : ${stats.weightedFat.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Weighted SNF      : ${stats.weightedSnf.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Weighted CLR      : ${stats.weightedClr.toFixed(2)}`, 14, leftY);
      
      leftY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('OVERALL SUMMARY', 14, leftY);
      doc.setFont('helvetica', 'normal');
      leftY += 6;
      doc.text(`Total Dispatches   : ${stats.totalDispatches}`, 14, leftY);
      leftY += 5;
      doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);

      // Right side - Report Notes
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let rightY = finalY + 6;
      doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
      rightY += 5;
      doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
      
      rightY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      rightY += 5;
      doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
      rightY += 5;
      doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Send email with attachments
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/reports/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          csvContent,
          pdfContent: pdfBase64,
          reportType: 'Dispatch Report',
          dateRange,
          stats
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send email');
      }

      setSuccessMessage(`Report sent successfully to ${email}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  // Enhanced email function with column selection
  const handleSendEmailWithColumns = async (email: string, selectedColumns: string[]) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    try {
      // Generate CSV content with selected columns
      const dateRange = dateFromFilter && dateToFilter 
        ? `${dateFromFilter} To ${dateToFilter}`
        : dateFilter || 'All Dates';
      const currentDateTime = new Date().toLocaleString('en-IN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
      });

      // Helper function to escape CSV values
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Get column labels for headers
      const columnLabels = selectedColumns.map(col => 
        getDispatchColumns(reportSource).find(c => c.key === col)?.label || col
      );

      const dataRows = filteredRecords.map(record => 
        selectedColumns.map(col => {
          switch (col) {
            case 'dispatch_date': return record.dispatch_date;
            case 'dispatch_time': return record.dispatch_time;
            case 'dispatch_id': return record.dispatch_id || '';
            case 'society_id': return record.society_id;
            case 'society_name': return record.society_name || '';
            case 'bmc_id': return record.bmc_id || '';
            case 'bmc_name': return record.bmc_name || '';
            case 'dairy_name': return record.dairy_name || '';
            case 'machine_id': return record.machine_id;
            case 'machine_type': return record.machine_type;
            case 'shift_type': return record.shift_type;
            case 'channel': return getChannelDisplay(record.channel);
            case 'quantity': return record.quantity;
            case 'fat_percentage': return record.fat_percentage;
            case 'snf_percentage': return record.snf_percentage;
            case 'clr_value': return record.clr_value;
            case 'rate_per_liter': return record.rate_per_liter;
            case 'total_amount': return record.total_amount;
            default: return '';
          }
        })
      );

      const csvContent = [
        ['POORNASREE EQUIPMENTS MILK DISPATCH REPORT'],
        ['Admin Report with Weighted Averages'],
        [],
        ['Report Generated:', currentDateTime],
        ['Date Range:', dateRange],
        ['Total Dispatches:', stats.totalDispatches],
        ['Total Quantity (L):', stats.totalQuantity.toFixed(2)],
        ['Total Amount (₹):', stats.totalAmount.toFixed(2)],
        ['Average Rate (₹/L):', stats.averageRate.toFixed(2)],
        ['Weighted FAT (%):', stats.weightedFat.toFixed(2)],
        ['Weighted SNF (%):', stats.weightedSnf.toFixed(2)],
        ['Weighted CLR:', stats.weightedClr.toFixed(2)],
        [],
        columnLabels,
        ...dataRows
      ].map(row => row.map(escapeCsvValue).join(',')).join('\n');

      // Generate PDF with selected columns
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Add Logo
      const logoPath = '/fulllogo.png';
      doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Dispatch Report - LactoConnect Milk Dispatch System', 148.5, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED DISPATCH DATA', 148.5, 28, { align: 'center' });

      // Table with selected columns
      const tableData = filteredRecords.map((record, index) => [
        (index + 1).toString(),
        ...selectedColumns.map(col => {
          switch (col) {
            case 'dispatch_date': return record.dispatch_date;
            case 'dispatch_time': return record.dispatch_time;
            case 'dispatch_id': return record.dispatch_id || '';
            case 'society_id': return record.society_id;
            case 'society_name': return record.society_name || '';
            case 'bmc_name': return record.bmc_name || '';
            case 'dairy_name': return record.dairy_name || '';
            case 'machine_id': return record.machine_id;
            case 'machine_type': return record.machine_type;
            case 'shift_type': return record.shift_type;
            case 'channel': return getChannelDisplay(record.channel);
            case 'quantity': return record.quantity;
            case 'fat_percentage': return record.fat_percentage;
            case 'snf_percentage': return record.snf_percentage;
            case 'clr_value': return record.clr_value;
            case 'rate_per_liter': return record.rate_per_liter;
            case 'total_amount': return record.total_amount;
            default: return '';
          }
        })
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['SI No', ...columnLabels]],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1, halign: 'center' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.5, lineColor: [0, 0, 0] },
        bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 10 },
          // Set society name column to left align if present
          ...(selectedColumns.includes('society_name') && { [selectedColumns.indexOf('society_name') + 1]: { halign: 'left' } })
        }
      });

      // Summary Section
      const finalY = doc.lastAutoTable.finalY + 8;
      
      // Left side - Weighted Averages
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WEIGHTED AVERAGES', 14, finalY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let leftY = finalY + 6;
      doc.text(`Weighted Fat      : ${stats.weightedFat.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Weighted SNF      : ${stats.weightedSnf.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Weighted CLR      : ${stats.weightedClr.toFixed(2)}`, 14, leftY);
      
      leftY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('OVERALL SUMMARY', 14, leftY);
      doc.setFont('helvetica', 'normal');
      leftY += 6;
      doc.text(`Total Dispatches  : ${stats.totalDispatches}`, 14, leftY);
      leftY += 5;
      doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
      leftY += 5;
      doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);

      // Right side - Report Notes
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let rightY = finalY + 6;
      doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
      rightY += 5;
      doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
      
      rightY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      rightY += 5;
      doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
      rightY += 5;
      doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Send email with attachments
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/reports/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          csvContent,
          pdfContent: pdfBase64,
          reportType: 'Dispatch Report',
          dateRange,
          stats
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send email');
      }

      setSuccessMessage(`Report sent successfully to ${email} with ${selectedColumns.length} columns`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  // Enhanced download function with column selection
  const handleDownloadWithColumns = (format: 'csv' | 'pdf', selectedColumns: string[]) => {
    try {
      if (format === 'csv') {
        // Generate CSV content with selected columns
        const dateRange = dateFromFilter && dateToFilter 
          ? `${dateFromFilter} To ${dateToFilter}`
          : dateFilter || 'All Dates';
        const currentDateTime = new Date().toLocaleString('en-IN', { 
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });

        // Helper function to escape CSV values
        const escapeCsvValue = (value: any): string => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        // Get column labels for headers
        const columnLabels = selectedColumns.map(col => 
          getDispatchColumns(reportSource).find(c => c.key === col)?.label || col
        );

        const dataRows = filteredRecords.map(record => 
          selectedColumns.map(col => {
            switch (col) {
              case 'dispatch_date': return record.dispatch_date;
              case 'dispatch_time': return record.dispatch_time;
              case 'dispatch_id': return record.dispatch_id || '';
              case 'society_id': return record.society_id;
              case 'society_name': return record.society_name || '';
              case 'bmc_id': return record.bmc_id || '';
              case 'bmc_name': return record.bmc_name || '';
              case 'dairy_name': return record.dairy_name || '';
              case 'machine_id': return record.machine_id;
              case 'machine_type': return record.machine_type;
              case 'shift_type': return record.shift_type;
              case 'channel': return getChannelDisplay(record.channel);
              case 'quantity': return record.quantity;
              case 'fat_percentage': return record.fat_percentage;
              case 'snf_percentage': return record.snf_percentage;
              case 'clr_value': return record.clr_value;
              case 'rate_per_liter': return record.rate_per_liter;
              case 'total_amount': return record.total_amount;
              default: return '';
            }
          })
        );

        const csvContent = [
          ['POORNASREE EQUIPMENTS MILK DISPATCH REPORT'],
          ['Admin Report with Weighted Averages'],
          [],
          ['Report Generated:', currentDateTime],
          ['Date Range:', dateRange],
          ['Total Dispatches:', stats.totalDispatches],
          ['Total Quantity (L):', stats.totalQuantity.toFixed(2)],
          ['Total Amount (₹):', stats.totalAmount.toFixed(2)],
          ['Average Rate (₹/L):', stats.averageRate.toFixed(2)],
          ['Weighted FAT (%):', stats.weightedFat.toFixed(2)],
          ['Weighted SNF (%):', stats.weightedSnf.toFixed(2)],
          ['Weighted CLR:', stats.weightedClr.toFixed(2)],
          [],
          columnLabels,
          ...dataRows
        ].map(row => row.map(escapeCsvValue).join(',')).join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dispatch-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setSuccessMessage(`CSV report downloaded successfully with ${selectedColumns.length} columns`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (format === 'pdf') {
        // Generate PDF with selected columns
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        // Add Logo
        const logoPath = '/fulllogo.png';
        doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

        const dateRange = dateFromFilter && dateToFilter 
          ? `${dateFromFilter} To ${dateToFilter}`
          : dateFilter || 'All Dates';

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Dispatch Report - LactoConnect Milk Dispatch System', 148.5, 15, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DETAILED DISPATCH DATA', 148.5, 28, { align: 'center' });

        // Get column labels for headers
        const columnLabels = selectedColumns.map(col => 
          getDispatchColumns(reportSource).find(c => c.key === col)?.label || col
        );

        // Table with selected columns
        const tableData = filteredRecords.map((record, index) => [
          (index + 1).toString(),
          ...selectedColumns.map(col => {
            switch (col) {
              case 'dispatch_date': return record.dispatch_date;
              case 'dispatch_time': return record.dispatch_time;
              case 'dispatch_id': return record.dispatch_id || '';
              case 'society_id': return record.society_id;
              case 'society_name': return record.society_name || '';
              case 'bmc_id': return record.bmc_id || '';
              case 'bmc_name': return record.bmc_name || '';
              case 'dairy_name': return record.dairy_name || '';
              case 'machine_id': return record.machine_id;
              case 'machine_type': return record.machine_type;
              case 'shift_type': return record.shift_type;
              case 'channel': return getChannelDisplay(record.channel);
              case 'quantity': return record.quantity;
              case 'fat_percentage': return record.fat_percentage;
              case 'snf_percentage': return record.snf_percentage;
              case 'clr_value': return record.clr_value;
              case 'rate_per_liter': return record.rate_per_liter;
              case 'total_amount': return record.total_amount;
              default: return '';
            }
          })
        ]);

        autoTable(doc, {
          startY: 32,
          head: [['SI No', ...columnLabels]],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 6, cellPadding: 1, halign: 'center' },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.5, lineColor: [0, 0, 0] },
          bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
          columnStyles: {
            0: { cellWidth: 10 },
            // Set society name column to left align if present
            ...(selectedColumns.includes('society_name') && { [selectedColumns.indexOf('society_name') + 1]: { halign: 'left' } })
          }
        });

        // Summary Section
        const finalY = doc.lastAutoTable.finalY + 8;
        
        // Left side - Weighted Averages
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('WEIGHTED AVERAGES', 14, finalY);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let leftY = finalY + 6;
        doc.text(`Weighted Fat      : ${stats.weightedFat.toFixed(2)}`, 14, leftY);
        leftY += 5;
        doc.text(`Weighted SNF      : ${stats.weightedSnf.toFixed(2)}`, 14, leftY);
        leftY += 5;
        doc.text(`Weighted CLR      : ${stats.weightedClr.toFixed(2)}`, 14, leftY);
        
        leftY += 8;
        doc.setFont('helvetica', 'bold');
        doc.text('OVERALL SUMMARY', 14, leftY);
        doc.setFont('helvetica', 'normal');
        leftY += 6;
        doc.text(`Total Dispatches  : ${stats.totalDispatches}`, 14, leftY);
        leftY += 5;
        doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
        leftY += 5;
        doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);

        // Right side - Report Notes
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let rightY = finalY + 6;
        doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
        rightY += 5;
        doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
        
        rightY += 8;
        doc.setFont('helvetica', 'bold');
        doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        rightY += 5;
        doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
        rightY += 5;
        doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

        // Download PDF
        doc.save(`dispatch-report-${new Date().toISOString().split('T')[0]}.pdf`);

        setSuccessMessage(`PDF report downloaded successfully with ${selectedColumns.length} columns`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setErrorMessage('Failed to download report. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-7 gap-3">
        <StatsCard
          title="Total Dispatches"
          value={stats.totalDispatches}
          icon={<Truck className="w-full h-full" />}
          color="green"
        />
        <StatsCard
          title="Total Quantity (L)"
          value={stats.totalQuantity}
          icon={<Package className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Total Amount (₹)"
          value={`₹${stats.totalAmount.toFixed(2)}`}
          icon={<TrendingUp className="w-full h-full" />}
          color="yellow"
        />
        <StatsCard
          title="Avg Rate (₹/L)"
          value={`₹${stats.averageRate.toFixed(2)}`}
          icon={<BarChart3 className="w-full h-full" />}
          color="gray"
        />
        <StatsCard
          title="Weighted FAT (%)"
          value={stats.weightedFat.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Weighted SNF (%)"
          value={stats.weightedSnf.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="green"
        />
        <StatsCard
          title="Weighted CLR"
          value={stats.weightedClr.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Filter Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearFilters();
                  fetchData();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-psr-primary-600 text-white rounded-lg hover:bg-psr-primary-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <FileDown className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                <Settings className="w-3 h-3" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <Mail className="w-4 h-4" />
                <Settings className="w-3 h-3" />
                <span className="hidden sm:inline">Send Mail</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown - All Filters Inside */}
          <FilterDropdown
            statusFilter={shiftFilter}
            onStatusChange={setShiftFilter}
            dairyFilter={dairyFilter}
            onDairyChange={(value) => setDairyFilter(Array.isArray(value) ? value : [value])}
            bmcFilter={bmcFilter}
            onBmcChange={(value) => setBmcFilter(Array.isArray(value) ? value : [value])}
            societyFilter={societyFilter}
            onSocietyChange={(value) => setSocietyFilter(Array.isArray(value) ? value : [value])}
            machineFilter={machineFilter}
            onMachineChange={(value) => setMachineFilter(Array.isArray(value) ? value : [value])}
            dairies={dairiesWithDispatches}
            bmcs={bmcs}
            societies={societies}
            machines={machines}
            filteredCount={filteredRecords.length}
            totalCount={records.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            icon={<Truck className="w-5 h-5" />}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            dateFromFilter={dateFromFilter}
            onDateFromChange={setDateFromFilter}
            dateToFilter={dateToFilter}
            onDateToChange={setDateToFilter}
            channelFilter={channelFilter}
            onChannelChange={setChannelFilter}
            showDateFilter
            showChannelFilter
            showShiftFilter
            showMachineFilter
            hideMainFilterButton={true}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-auto max-h-[600px]" tabIndex={0}>
          <table className="w-auto min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Sl. No</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Dispatch ID</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{reportSource === 'bmc' ? 'BMC' : 'Society'}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Shift</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Channel</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Machine</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Fat %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">SNF %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CLR</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Rate/L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Qty (L)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No dispatch records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <React.Fragment key={record.id}>
                    <tr className={`transition-colors ${
                      selectedRecords.has(record.id)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRecords.has(record.id)}
                          onChange={() => handleSelectOne(record.id)}
                          className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div>{highlightText(record.dispatch_date, combinedSearch)}</div>
                        <div className="text-xs text-gray-500">{record.dispatch_time}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                        {highlightText(record.dispatch_id, combinedSearch)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="font-medium">{highlightText(reportSource === 'bmc' ? (record.bmc_name || 'N/A') : record.society_name, combinedSearch)}</div>
                        <div className="text-xs text-gray-500">ID: {highlightText(reportSource === 'bmc' ? (record.bmc_id || 'N/A') : record.society_id, combinedSearch)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ['MR', 'MX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'morning'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : ['EV', 'EX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'evening'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {highlightText(
                            ['MR', 'MX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'morning'
                              ? 'Morning' 
                              : ['EV', 'EX'].includes(record.shift_type) || record.shift_type?.toLowerCase() === 'evening'
                              ? 'Evening' 
                              : record.shift_type,
                            combinedSearch
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getChannelDisplay(record.channel) === 'COW'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : getChannelDisplay(record.channel) === 'BUFFALO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {highlightText(getChannelDisplay(record.channel), combinedSearch)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="font-medium">{highlightText(record.machine_id || 'N/A', combinedSearch)}</div>
                        <div className="text-xs text-gray-500">{highlightText(record.machine_type, combinedSearch)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.fat_percentage).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.snf_percentage).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.clr_value).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">₹{highlightText(parseFloat(record.rate_per_liter).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{highlightText(parseFloat(record.quantity).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-green-600 dark:text-green-400">
                        ₹{highlightText(parseFloat(record.total_amount).toFixed(2), combinedSearch)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => handleDeleteClick(record.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Confirmation Dialog */}
      <PasswordConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Dispatch Record"
        message="Enter your admin password to confirm deletion. This action cannot be undone and will be logged for security purposes."
      />

      {/* Upload Password Dialog */}
      <PasswordConfirmDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onConfirm={handleUploadPasswordConfirm}
        title="Upload Dispatch Data"
        message="Enter your admin password to upload dispatch records."
        confirmButtonText="Upload"
        confirmButtonColor="purple"
      />

      {/* Upload Form Modal - Removed old form, using ReportUploadDialog instead */}

      {/* Bulk Delete Password Confirmation Modal */}
      <PasswordConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => {
          setShowBulkDeleteConfirm(false);
          setBulkDeletePassword('');
        }}
        onConfirm={handleBulkDeleteConfirm}
        title={`Delete ${selectedRecords.size} Dispatch Record${selectedRecords.size > 1 ? 's' : ''}`}
        message={`Enter your admin password to confirm deletion of ${selectedRecords.size} selected record(s). This action cannot be undone and will be logged for security purposes.`}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedRecords.size}
        totalCount={filteredRecords.length}
        onBulkDelete={handleBulkDeleteClick}
        onClearSelection={handleClearSelection}
        itemType="record"
        showStatusUpdate={false}
      />

      {/* Loading Snackbar */}
      <LoadingSnackbar
        isVisible={deleting || isDeletingBulk}
        message={isDeletingBulk ? `Deleting ${selectedRecords.size} Records` : "Deleting Record"}
        submessage="Verifying credentials and removing data..."
        showProgress={false}
      />

      {/* Enhanced Email Modal */}
      <EnhancedEmailReportModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmailWithColumns}
        defaultEmail={adminEmail}
        recordCount={filteredRecords.length}
        reportType="Dispatch Report"
        availableColumns={getDispatchColumns(reportSource)}
        defaultColumns={getDefaultDispatchColumns(reportSource)}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadWithColumns}
        recordCount={filteredRecords.length}
        reportType="Dispatch Report"
        availableColumns={getDispatchColumns(reportSource)}
        defaultColumns={getDefaultDispatchColumns(reportSource)}
      />

      {/* Upload Password Dialog */}
      <PasswordConfirmDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onConfirm={handleUploadPasswordConfirm}
        title="Upload Report Data"
        message="Enter your admin password to upload report records."
        confirmButtonText="Continue"
        confirmButtonColor="purple"
      />

      {/* Report Upload Dialog */}
      <ReportUploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUploadFile}
      />

      {/* Status Messages */}
      <StatusMessage
        success={successMessage}
        error={errorMessage}
        onClose={() => {
          setSuccessMessage('');
          setErrorMessage('');
        }}
      />
    </div>
  );
}
