'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download,
  FileDown,
  Droplet,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Trash2,
  Mail,
  X,
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
import { ColumnConfig } from '@/components/dialogs/ColumnSelector';
import ReportUploadDialog from '@/components/dialogs/ReportUploadDialog';


interface CollectionRecord {
  id: number;
  farmer_id: string;
  farmer_name: string;
  farmer_uid?: string;
  society_id: string;
  society_name: string;
  bmc_id?: number;
  bmc_name?: string;
  dairy_id?: number;
  dairy_name?: string;
  machine_id: string;
  collection_date: string;
  collection_time: string;
  shift_type: string;
  channel: string;
  quantity: string;
  fat_percentage: string;
  snf_percentage: string;
  clr_value: string;
  protein_percentage: string;
  lactose_percentage: string;
  salt_percentage: string;
  water_percentage: string;
  temperature: string;
  rate_per_liter: string;
  total_amount: string;
  bonus: string;
  machine_type: string;
  machine_version: string;
}

interface CollectionStats {
  totalCollections: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
}

// Column configuration for collection reports
const getCollectionColumns = (reportSource: 'society' | 'bmc'): ColumnConfig[] => [
  { key: 'collection_date', label: 'Date', required: true, description: 'Collection date' },
  { key: 'collection_time', label: 'Time', required: true, description: 'Collection time' },
  { key: 'farmer_id', label: 'Farmer ID', description: 'Unique farmer identifier' },
  { key: 'farmer_name', label: 'Farmer Name', description: 'Name of the farmer' },
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
  { key: 'protein_percentage', label: 'Protein %', description: 'Protein percentage' },
  { key: 'lactose_percentage', label: 'Lactose %', description: 'Lactose percentage' },
  { key: 'salt_percentage', label: 'Salt %', description: 'Salt percentage' },
  { key: 'water_percentage', label: 'Water %', description: 'Water percentage' },
  { key: 'temperature', label: 'Temperature (°C)', description: 'Milk temperature' },
  { key: 'rate_per_liter', label: 'Rate/L', required: true, description: 'Rate per liter' },
  { key: 'bonus', label: 'Bonus', description: 'Bonus amount' },
  { key: 'total_amount', label: 'Total Amount', required: true, description: 'Total payment amount' },
  { key: reportSource === 'bmc' ? 'society_name' : 'bmc_name', label: reportSource === 'bmc' ? 'Society' : 'BMC', description: reportSource === 'bmc' ? 'Society name' : 'BMC name' },
  { key: 'dairy_name', label: 'Dairy', description: 'Dairy name' }
];

// Default columns for collection reports
const getDefaultCollectionColumns = (reportSource: 'society' | 'bmc') => [
  'collection_date', 'collection_time', 'farmer_id', 'farmer_name', 
  reportSource === 'bmc' ? 'bmc_id' : 'society_id', 
  reportSource === 'bmc' ? 'bmc_name' : 'society_name', 
  'channel', 'shift_type', 
  'quantity', 'fat_percentage', 'snf_percentage', 'clr_value',
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

interface CollectionReportsProps {
  globalSearch?: string;
  reportSource?: 'society' | 'bmc';
  initialSocietyId?: string | null;
  initialSocietyName?: string | null;
  initialFromDate?: string | null;
  initialToDate?: string | null;
  initialBmcFilter?: string | null;
  initialMachineFilter?: string | null;
}

export default function CollectionReports({ globalSearch = '', reportSource = 'society', initialSocietyId = null, initialSocietyName = null, initialFromDate = null, initialToDate = null, initialBmcFilter = null, initialMachineFilter = null }: CollectionReportsProps) {
  console.log('CollectionReports received props:', { initialSocietyId, initialSocietyName, initialFromDate, initialToDate, initialMachineFilter });
  
  const router = useRouter();
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CollectionRecord[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalCollections: 0,
    totalQuantity: 0,
    totalAmount: 0,
    averageRate: 0,
    weightedFat: 0,
    weightedSnf: 0,
    weightedClr: 0
  });
  const [loading, setLoading] = useState(true);
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);
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
  const [farmerFilter, setFarmerFilter] = useState<string[]>([]);
  
  // Fetch dairies and BMCs
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societiesData, setSocietiesData] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [machinesData, setMachinesData] = useState<Array<{ id: number; machineId: string; machineType: string; societyId?: number; collectionCount?: number }>>([]);
  const [farmersData, setFarmersData] = useState<Array<{ id: number; farmerId: string; farmerName: string; farmeruid?: string; societyId?: number }>>([]);

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

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Initialize society filter from URL parameters
  useEffect(() => {
    if (initialSocietyId) {
      // Find society by society_id string (e.g., "S101")
      const society = societiesData.find(s => s.society_id === initialSocietyId);
      
      if (society && !societyFilter.includes(society.id.toString())) {
        setSocietyFilter([society.id.toString()]);
        
        // Show success message with society name and date range if present
        if (initialSocietyName) {
          let message = `Filter Applied: ${decodeURIComponent(initialSocietyName)}`;
          
          if (initialFromDate && initialToDate) {
            message += ` • Date: ${initialFromDate} to ${initialToDate}`;
          }
          
          setSuccessMessage(message);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societiesData]); // Run when societies data loads

  // Initialize machine filter from URL parameters
  useEffect(() => {
    if (initialMachineFilter && machinesData.length > 0) {
      // Find machine by machineId string (e.g., "m103")
      const machine = machinesData.find(m => m.machineId === initialMachineFilter);
      
      if (machine && !machineFilter.includes(machine.id.toString())) {
        console.log('Setting machineFilter to machine:', machine.machineId, 'ID:', machine.id);
        setMachineFilter([machine.id.toString()]);
        
        // Show success message
        setSuccessMessage(`Filter Applied: Machine ${machine.machineId}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machinesData]); // Run when machines data loads

  // Initialize date filters from URL parameters
  useEffect(() => {
    if (initialFromDate) {
      console.log('Setting dateFromFilter to:', initialFromDate);
      setDateFromFilter(initialFromDate);
    }
    
    if (initialToDate) {
      console.log('Setting dateToFilter to:', initialToDate);
      setDateToFilter(initialToDate);
    }
    
    if (initialBmcFilter) {
      console.log('Setting bmcFilter to:', initialBmcFilter);
      setBmcFilter([initialBmcFilter]);
    }
  }, [initialFromDate, initialToDate, initialBmcFilter]); // Re-run when props change

  // Fetch admin email
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

  // Debug: Log filter states
  useEffect(() => {
    console.log('Current filter states:', {
      dateFromFilter,
      dateToFilter,
      societyFilter,
      recordsCount: records.length,
      filteredCount: filteredRecords.length
    });
  }, [dateFromFilter, dateToFilter, societyFilter, records.length, filteredRecords.length]);

  useEffect(() => {
    const fetchDairiesAndBmcs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Fetch dairies
        const dairyRes = await fetch('/api/user/dairy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dairyRes.ok) {
          const dairyData = await dairyRes.json();
          setDairies(dairyData.data || []);
        }

        // Fetch BMCs
        const bmcRes = await fetch('/api/user/bmc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bmcRes.ok) {
          const bmcData = await bmcRes.json();
          setBmcs(bmcData.data || []);
        }

        // Fetch Societies
        const societyRes = await fetch('/api/user/society', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (societyRes.ok) {
          const societyData = await societyRes.json();
          setSocietiesData(societyData.data || []);
        }

        // Fetch Machines
        const machineRes = await fetch('/api/user/machine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (machineRes.ok) {
          const machineData = await machineRes.json();
          setMachinesData(machineData.data || []);
        }

        // Fetch Farmers
        const farmerRes = await fetch('/api/user/farmer', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (farmerRes.ok) {
          const farmerData = await farmerRes.json();
          setFarmersData(farmerData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dairies/BMCs/societies/machines/farmers:', error);
      }
    };

    fetchDairiesAndBmcs();
  }, []);
  
  // Filter dairies to only show those with collection records
  const dairiesWithCollections = useMemo(() => {
    if (!dairies.length || !records.length) return dairies;
    
    const dairyIdsInCollections = new Set(
      records
        .filter(r => r.dairy_id)
        .map(r => r.dairy_id)
    );
    
    return dairies.filter(dairy => dairyIdsInCollections.has(dairy.id));
  }, [dairies, records]);
  
  // Filter BMCs to only show those with collection records
  const bmcsWithCollections = useMemo(() => {
    if (!bmcs.length || !records.length) return bmcs;
    
    const bmcIdsInCollections = new Set(
      records
        .filter(r => r.bmc_id)
        .map(r => r.bmc_id)
    );
    
    return bmcs.filter(bmc => bmcIdsInCollections.has(bmc.id));
  }, [bmcs, records]);
  
  // Extract unique societies and machines from records (memoized)
  const societies = useMemo(() => {
    if (!records.length) return [];
    
    // Get unique society IDs from collection records
    const societyIdsInCollections = new Set(
      records
        .filter(r => r.society_id)
        .map(r => r.society_id)
    );
    
    // If we have fetched society data, filter it to only show societies with collections
    if (societiesData.length > 0) {
      return societiesData.filter(society => 
        societyIdsInCollections.has(society.society_id)
      );
    }
    
    // Fallback to extracting from records if API data not available
    const uniqueSocieties = new Map<string, { society_id: string; society_name: string }>();
    records.forEach(r => {
      if (r.society_id && !uniqueSocieties.has(r.society_id)) {
        uniqueSocieties.set(r.society_id, {
          society_id: r.society_id,
          society_name: r.society_name || r.society_id
        });
      }
    });
    return Array.from(uniqueSocieties.values()).map((society, index) => ({
      id: index + 1,
      name: society.society_name,
      society_id: society.society_id,
      bmc_id: undefined
    }));
  }, [records, societiesData]);
  
  const machines = useMemo(() => {
    if (!machinesData.length || !records.length) return machinesData;
    
    const machineIdsInCollections = new Set(
      records
        .filter(r => r.machine_id)
        .map(r => r.machine_id)
    );
    
    const filteredMachines = machinesData.filter(machine => machineIdsInCollections.has(machine.machineId));
    
    // Add collection counts to machines
    return filteredMachines.map(machine => ({
      ...machine,
      collectionCount: records.filter(r => r.machine_id === machine.machineId).length
    }));
  }, [machinesData, records]);
  
  const farmers = useMemo(() => {
    if (reportSource === 'bmc') {
      // For BMC reports, farmer_id is actually society_id, so return societies as farmers
      if (!societiesData.length || !records.length) return [];
      
      const societyIdsInCollections = new Set(
        records
          .filter(r => r.farmer_id)
          .map(r => r.farmer_id)
      );
      
      // Map societies to farmer format for filter compatibility
      return societiesData
        .filter(society => societyIdsInCollections.has(society.society_id))
        .map(society => ({
          id: society.id,
          farmerId: society.society_id,
          farmerName: society.name,
          farmeruid: society.society_id,
          societyId: society.bmc_id
        }));
    }
    
    // For society reports, use actual farmers
    if (!farmersData.length || !records.length) return farmersData;
    
    const farmerIdsInCollections = new Set(
      records
        .filter(r => r.farmer_id)
        .map(r => r.farmer_id)
    );
    
    return farmersData.filter(farmer => farmerIdsInCollections.has(farmer.farmerId));
  }, [farmersData, records, reportSource, societiesData]);

  // Clear all filters
  const clearFilters = () => {
    setShiftFilter('all');
    setDairyFilter([]);
    setBmcFilter([]);
    setSocietyFilter([]);
    setMachineFilter([]);
    setFarmerFilter([]);
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
      const response = await fetch('/api/user/reports/collections/delete', {
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
      setSuccessMessage('Collection record deleted successfully');
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
      // Use a dummy record ID to verify password (same as delete)
      const response = await fetch('/api/user/reports/collections/delete', {
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
        // Enhanced error handling with format mismatch details
        let errorMsg = data.error || 'Upload failed';
        
        if (data.detectedFormat && data.expectedFormat) {
          errorMsg = `❌ CSV Format Mismatch\n\n${data.error}\n\n`;
          errorMsg += `🔍 Detected: ${data.detectedFormat} format\n`;
          errorMsg += `✓ Expected: ${data.expectedFormat} format\n`;
          errorMsg += `🔧 Machine Type: ${data.machineType}\n\n`;
          
          if (data.help) {
            errorMsg += `📋 Format Details:\n${data.help}\n\n`;
          }
          
          if (data.suggestion) {
            errorMsg += `💡 Suggestion: ${data.suggestion}`;
          }
        } else if (data.details) {
          errorMsg += `\n\nDetails: ${data.details}`;
        }
        
        throw new Error(errorMsg);
      }

      // Show success message
      setSuccessMessage(
        `Successfully uploaded ${data.successCount} of ${data.totalRows} records` +
        (data.errorCount > 0 ? `. ${data.errorCount} failed.` : '')
      );
      setTimeout(() => setSuccessMessage(''), 5000);

      // Refresh data
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
      
      // Delete records in parallel with password verification
      const deletePromises = recordIds.map(recordId =>
        fetch('/api/user/reports/collections/delete', {
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
        // Get error message from first failed promise
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

  // Calculate statistics
  const calculateStats = useCallback((data: CollectionRecord[]) => {
    const totalQuantity = data.reduce((sum, record) => sum + parseFloat(record.quantity || '0'), 0);
    const totalAmount = data.reduce((sum, record) => sum + parseFloat(record.total_amount || '0'), 0);
    
    // Calculate simple average rate from rate_per_liter column
    const totalRate = data.reduce((sum, record) => sum + parseFloat(record.rate_per_liter || '0'), 0);
    const averageRate = data.length > 0 ? totalRate / data.length : 0;
    
    // Calculate weighted averages: Σ(quantity × value) / Σquantity
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
      totalCollections: data.length,
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      weightedFat: parseFloat(weightedFat.toFixed(2)),
      weightedSnf: parseFloat(weightedSnf.toFixed(2)),
      weightedClr: parseFloat(weightedClr.toFixed(2))
    });
  }, []);

  // Fetch collection data
  const fetchData = useCallback(async (showLoading = true) => {
    // Don't fetch until initial filters are applied
    if (!initialFiltersApplied) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      if (showLoading) setLoading(true);
      const endpoint = reportSource === 'bmc' ? '/api/user/reports/bmc-collections' : '/api/user/reports/collections';
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
      console.error('Error fetching collection data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [calculateStats, reportSource, initialFiltersApplied]);

  // Mark initial filters as applied after all filter effects run
  useEffect(() => {
    // Check if we have URL params that need to be applied
    const hasMachineParam = initialMachineFilter !== null;
    const hasSocietyParam = initialSocietyId !== null;
    const hasDateParams = initialFromDate !== null || initialToDate !== null;
    
    // If no URL params, mark as ready immediately
    if (!hasMachineParam && !hasSocietyParam && !hasDateParams) {
      setInitialFiltersApplied(true);
      return;
    }
    
    // Wait for filter data to load before marking as ready
    const hasRequiredData = 
      (!hasMachineParam || machinesData.length > 0) &&
      (!hasSocietyParam || societiesData.length > 0);
    
    if (hasRequiredData) {
      // Small delay to ensure filter state updates complete
      const timer = setTimeout(() => {
        setInitialFiltersApplied(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialMachineFilter, initialSocietyId, initialFromDate, initialToDate, machinesData.length, societiesData.length]);

  useEffect(() => {
    if (initialFiltersApplied) {
      fetchData(true);
      
      // Auto-refresh every 1 second without showing loading
      const intervalId = setInterval(() => {
        fetchData(false);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchData, initialFiltersApplied]);

  // Filter records with multi-field search (matching machine management pattern)
  useEffect(() => {
    console.log('🔍 Filter Effect Running:', { 
      machineFilterLength: machineFilter.length, 
      recordsLength: records.length,
      machinesLength: machines.length 
    });
    
    let filtered = records;
    let skipRemainingFilters = false;

    // Machine filter - Check if machine exists in records first
    if (machineFilter.length > 0) {
      const selectedMachineIds = machineFilter
        .map(id => machinesData.find(m => m.id.toString() === id)?.machineId)
        .filter(Boolean) as string[];
      
      console.log('🎯 Machine Filter Applied:', { selectedMachineIds });
      
      if (selectedMachineIds.length > 0) {
        // Check if any of the selected machines exist in the records
        const machineExistsInRecords = records.some(record => 
          selectedMachineIds.includes(record.machine_id)
        );
        
        console.log('✅ Machine Exists Check:', { machineExistsInRecords });
        
        if (!machineExistsInRecords) {
          // If machine doesn't exist in records, show empty result and skip all other filters
          console.log('❌ Machine NOT found in records - showing NO DATA');
          filtered = [];
          skipRemainingFilters = true;
        } else {
          // Filter normally if machine exists
          console.log('✅ Machine found - filtering records');
          filtered = filtered.filter(record => selectedMachineIds.includes(record.machine_id));
          console.log('📊 Filtered count:', filtered.length);
        }
      }
    }

    // Only apply other filters if machine filter didn't result in no data
    if (!skipRemainingFilters) {
      // Dairy filter (now array-based)
      if (dairyFilter.length > 0) {
        const selectedDairyIds = dairyFilter.map(id => {
          const dairy = dairies.find(d => d.id.toString() === id);
          return dairy?.id;
        }).filter(Boolean) as number[];
        if (selectedDairyIds.length > 0) {
          filtered = filtered.filter(record => record.dairy_id !== undefined && selectedDairyIds.includes(record.dairy_id));
        }
      }

      // BMC filter (now array-based)
      if (bmcFilter.length > 0) {
        const selectedBmcIds = bmcFilter.map(id => {
          const bmc = bmcs.find(b => b.id.toString() === id);
          return bmc?.id;
        }).filter(Boolean) as number[];
        if (selectedBmcIds.length > 0) {
          filtered = filtered.filter(record => record.bmc_id !== undefined && selectedBmcIds.includes(record.bmc_id));
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

      // Farmer filter - for BMC reports, farmer_id is society_id
      if (farmerFilter.length > 0) {
        if (reportSource === 'bmc') {
          // For BMC reports, filter by society_id stored in farmer_id field
          const selectedSocietyIds = farmerFilter
            .map(id => farmers.find(f => f.id.toString() === id)?.farmerId)
            .filter(Boolean) as string[];
          if (selectedSocietyIds.length > 0) {
            filtered = filtered.filter(record => selectedSocietyIds.includes(record.farmer_id));
          }
        } else {
          // For society reports, filter by actual farmer IDs
          const selectedFarmerIds = farmerFilter
            .map(id => farmers.find(f => f.id.toString() === id)?.farmerId)
            .filter(Boolean) as string[];
          const selectedFarmerUIDs = farmerFilter
            .map(id => farmers.find(f => f.id.toString() === id)?.farmeruid)
            .filter(Boolean) as string[];
          if (selectedFarmerIds.length > 0 || selectedFarmerUIDs.length > 0) {
            filtered = filtered.filter(record => 
              selectedFarmerIds.includes(record.farmer_id) ||
              (record.farmer_uid && selectedFarmerUIDs.includes(record.farmer_uid))
            );
          }
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
        filtered = filtered.filter(record => record.collection_date === dateFilter);
      }

      // Date range filter
      if (dateFromFilter) {
        filtered = filtered.filter(record => record.collection_date >= dateFromFilter);
      }
      if (dateToFilter) {
        filtered = filtered.filter(record => record.collection_date <= dateToFilter);
      }

      // Multi-field search across collection details (matching machine management pattern)
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
            record.farmer_id,
            record.farmer_name,
            record.farmer_uid,
            record.society_id,
            record.society_name,
            record.bmc_name,
            record.dairy_name,
            record.machine_id,
            record.machine_type,
            record.machine_version,
            record.channel,
            getChannelDisplay(record.channel),
            record.collection_date,
            record.collection_time,
            record.shift_type,
            shiftDisplay,
            record.quantity,
            record.fat_percentage,
            record.snf_percentage,
            record.clr_value,
            record.protein_percentage,
            record.lactose_percentage,
            record.salt_percentage,
            record.water_percentage,
            record.temperature,
            record.rate_per_liter,
            record.total_amount,
            record.bonus
          ].some(field =>
            field?.toString().toLowerCase().includes(searchLower)
          );
        });
      }
    }

    console.log('🏁 Final filtered count:', filtered.length, 'skipRemainingFilters:', skipRemainingFilters);
    setFilteredRecords(filtered);
    calculateStats(filtered);
  }, [globalSearch, searchQuery, dateFilter, dateFromFilter, dateToFilter, shiftFilter, channelFilter, societyFilter, machineFilter, farmerFilter, dairyFilter, bmcFilter, records, societies, machines, farmers, dairies, bmcs, calculateStats, reportSource]);

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
      record.collection_date,
      record.collection_time,
      record.channel,
      record.shift_type,
      `${record.machine_id} (${record.machine_type})`,
      reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
      record.farmer_id,
      record.farmer_name,
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.water_percentage,
      record.rate_per_liter,
      record.quantity,
      record.total_amount,
      record.bonus
    ]);

    const csvContent = [
      'Admin Report - LactoConnect Milk Collection System',
      `Date From ${dateRange}`,
      '',
      'DETAILED COLLECTION DATA',
      '',
      'Date,Time,Channel,Shift,Machine,' + (reportSource === 'bmc' ? 'BMC' : 'Society') + ',' + (reportSource === 'bmc' ? 'Society ID' : 'Farmer ID') + ',' + (reportSource === 'bmc' ? 'Society' : 'Farmer Name') + ',Fat (%),SNF (%),CLR,Water (%),Rate,Quantity (L),Total Amount,Incentive',
      ...dataRows.map(row => row.join(',')),
      '',
      '',
      'OVERALL SUMMARY',
      `Total Collections:,${stats.totalCollections}`,
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
    a.download = `collection-report-${new Date().toISOString().split('T')[0]}.csv`;
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

    // Logo and Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Collection Report - LactoConnect Milk Collection System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED COLLECTION DATA', 148.5, 28, { align: 'center' });

    // Detailed Data Table with SI No
    const tableData = filteredRecords.map((record, index) => [
      (index + 1).toString(),
      record.collection_date,
      record.collection_time,
      getChannelDisplay(record.channel),
      record.shift_type,
      `${record.machine_id} (${record.machine_type})`,
      reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
      record.farmer_id,
      record.farmer_name || '',
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.water_percentage,
      record.rate_per_liter,
      record.quantity,
      record.total_amount,
      record.bonus
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['SI No', 'Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', reportSource === 'bmc' ? 'Society ID' : 'Farmer ID', reportSource === 'bmc' ? 'Society' : 'Farmer Name', 'Fat (%)', 'SNF (%)', 'CLR', 'Water (%)', 'Rate', 'Quantity (L)', 'Total Amount', 'Incentive']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 10 },
        8: { halign: 'left' }
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
    doc.text(`Total Collections  : ${stats.totalCollections}`, 14, leftY);
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

    doc.save(`collection-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
        record.collection_date,
        record.collection_time,
        record.channel,
        record.shift_type,
        `${record.machine_id} (${record.machine_type})`,
        reportSource === 'bmc' ? (record.bmc_name || 'N/A') : (record.society_name || ''),
        record.farmer_id || '',
        record.farmer_name || '',
        record.fat_percentage,
        record.snf_percentage,
        record.clr_value,
        record.water_percentage,
        record.rate_per_liter,
        record.quantity,
        record.total_amount,
        record.bonus
      ]);

      const csvContent = [
        ['POORNASREE EQUIPMENTS MILK COLLECTION REPORT'],
        ['Admin Report with Weighted Averages'],
        [],
        ['Report Generated:', currentDateTime],
        ['Date Range:', dateRange],
        ['Total Collections:', stats.totalCollections],
        ['Total Quantity (L):', stats.totalQuantity.toFixed(2)],
        ['Total Amount (₹):', stats.totalAmount.toFixed(2)],
        ['Average Rate (₹/L):', stats.averageRate.toFixed(2)],
        ['Weighted FAT (%):', stats.weightedFat.toFixed(2)],
        ['Weighted SNF (%):', stats.weightedSnf.toFixed(2)],
        ['Weighted CLR:', stats.weightedClr.toFixed(2)],
        [],
        ['Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', reportSource === 'bmc' ? 'Society ID' : 'Farmer ID', reportSource === 'bmc' ? 'Society' : 'Farmer Name', 'Fat (%)', 'SNF (%)', 'CLR', 'Water (%)', 'Rate (₹/L)', 'Quantity (L)', 'Total Amount (₹)', 'Incentive'],
        ...dataRows
      ].map(row => row.join(',')).join('\n');

      // Generate PDF as base64 - matching current PDF design exactly
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Add Logo (same as current PDF)
      const logoPath = '/fulllogo.png';
      doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

      // Logo and Header (same as current PDF)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Collection Report - LactoConnect Milk Collection System', 148.5, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED COLLECTION DATA', 148.5, 28, { align: 'center' });

      // Detailed Data Table with SI No (same as current PDF)
      const tableData = filteredRecords.map((record, index) => [
        (index + 1).toString(),
        record.collection_date,
        record.collection_time,
        getChannelDisplay(record.channel),
        record.shift_type,
        `${record.machine_id} (${record.machine_type})`,
        reportSource === 'bmc' ? `${record.bmc_name || 'N/A'}` : `${record.society_name} (${record.society_id})`,
        record.farmer_id,
        record.farmer_name || '',
        record.fat_percentage,
        record.snf_percentage,
        record.clr_value,
        record.water_percentage,
        record.rate_per_liter,
        record.quantity,
        record.total_amount,
        record.bonus
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['SI No', 'Date', 'Time', 'Channel', 'Shift', 'Machine', reportSource === 'bmc' ? 'BMC' : 'Society', reportSource === 'bmc' ? 'Society ID' : 'Farmer ID', reportSource === 'bmc' ? 'Society' : 'Farmer Name', 'Fat (%)', 'SNF (%)', 'CLR', 'Water (%)', 'Rate', 'Quantity (L)', 'Total Amount', 'Incentive']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1, halign: 'center' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.5, lineColor: [0, 0, 0] },
        bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 10 },
          8: { halign: 'left' }
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
      doc.text(`Total Collections  : ${stats.totalCollections}`, 14, leftY);
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
          reportType: 'Collection Report',
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

      // Get column labels for headers
      const columnLabels = selectedColumns.map(col => 
        getCollectionColumns(reportSource).find(c => c.key === col)?.label || col
      );

      const dataRows = filteredRecords.map(record => 
        selectedColumns.map(col => {
          switch (col) {
            case 'collection_date': return record.collection_date;
            case 'collection_time': return record.collection_time;
            case 'farmer_id': return record.farmer_id || '';
            case 'farmer_name': return record.farmer_name || '';
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
            case 'protein_percentage': return record.protein_percentage;
            case 'lactose_percentage': return record.lactose_percentage;
            case 'salt_percentage': return record.salt_percentage;
            case 'water_percentage': return record.water_percentage;
            case 'temperature': return record.temperature;
            case 'rate_per_liter': return record.rate_per_liter;
            case 'bonus': return record.bonus;
            case 'total_amount': return record.total_amount;
            default: return '';
          }
        })
      );

      // Helper function to escape CSV values
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        ['POORNASREE EQUIPMENTS MILK COLLECTION REPORT'],
        ['Admin Report with Weighted Averages'],
        [],
        ['Report Generated:', currentDateTime],
        ['Date Range:', dateRange],
        ['Total Collections:', stats.totalCollections],
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
      doc.text('Daily Collection Report - LactoConnect Milk Collection System', 148.5, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED COLLECTION DATA', 148.5, 28, { align: 'center' });

      // Table with selected columns
      const tableData = filteredRecords.map((record, index) => [
        (index + 1).toString(),
        ...selectedColumns.map(col => {
          switch (col) {
            case 'collection_date': return record.collection_date;
            case 'collection_time': return record.collection_time;
            case 'farmer_id': return record.farmer_id || '';
            case 'farmer_name': return record.farmer_name || '';
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
            case 'protein_percentage': return record.protein_percentage;
            case 'lactose_percentage': return record.lactose_percentage;
            case 'salt_percentage': return record.salt_percentage;
            case 'water_percentage': return record.water_percentage;
            case 'temperature': return record.temperature;
            case 'rate_per_liter': return record.rate_per_liter;
            case 'bonus': return record.bonus;
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
          // Set farmer name column to left align if present
          ...(selectedColumns.includes('farmer_name') && { [selectedColumns.indexOf('farmer_name') + 1]: { halign: 'left' } })
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
      doc.text(`Total Collections  : ${stats.totalCollections}`, 14, leftY);
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
          reportType: 'Collection Report',
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

        // Get column labels for headers
        const columnLabels = selectedColumns.map(col => 
          getCollectionColumns(reportSource).find(c => c.key === col)?.label || col
        );

        const dataRows = filteredRecords.map(record => 
          selectedColumns.map(col => {
            switch (col) {
              case 'collection_date': return record.collection_date;
              case 'collection_time': return record.collection_time;
              case 'farmer_id': return record.farmer_id || '';
              case 'farmer_name': return record.farmer_name || '';
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
              case 'protein_percentage': return record.protein_percentage;
              case 'lactose_percentage': return record.lactose_percentage;
              case 'salt_percentage': return record.salt_percentage;
              case 'water_percentage': return record.water_percentage;
              case 'temperature': return record.temperature;
              case 'rate_per_liter': return record.rate_per_liter;
              case 'bonus': return record.bonus;
              case 'total_amount': return record.total_amount;
              default: return '';
            }
          })
        );

        // Helper function to escape CSV values
        const escapeCsvValue = (value: any): string => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const csvContent = [
          ['POORNASREE EQUIPMENTS MILK COLLECTION REPORT'],
          ['Admin Report with Weighted Averages'],
          [],
          ['Report Generated:', currentDateTime],
          ['Date Range:', dateRange],
          ['Total Collections:', stats.totalCollections],
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
        link.download = `collection-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setSuccessMessage(`CSV report downloaded successfully with ${selectedColumns.length} columns`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (format === 'pdf') {
        // Generate PDF with selected columns (same as email function)
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
        doc.text('Daily Collection Report - LactoConnect Milk Collection System', 148.5, 15, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DETAILED COLLECTION DATA', 148.5, 28, { align: 'center' });

        // Get column labels for headers
        const columnLabels = selectedColumns.map(col => 
          getCollectionColumns(reportSource).find(c => c.key === col)?.label || col
        );

        // Table with selected columns
        const tableData = filteredRecords.map((record, index) => [
          (index + 1).toString(),
          ...selectedColumns.map(col => {
            switch (col) {
              case 'collection_date': return record.collection_date;
              case 'collection_time': return record.collection_time;
              case 'farmer_id': return record.farmer_id || '';
              case 'farmer_name': return record.farmer_name || '';
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
              case 'protein_percentage': return record.protein_percentage;
              case 'lactose_percentage': return record.lactose_percentage;
              case 'salt_percentage': return record.salt_percentage;
              case 'water_percentage': return record.water_percentage;
              case 'temperature': return record.temperature;
              case 'rate_per_liter': return record.rate_per_liter;
              case 'bonus': return record.bonus;
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
            // Set farmer name column to left align if present
            ...(selectedColumns.includes('farmer_name') && { [selectedColumns.indexOf('farmer_name') + 1]: { halign: 'left' } })
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
        doc.text(`Total Collections  : ${stats.totalCollections}`, 14, leftY);
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
        doc.save(`collection-report-${new Date().toISOString().split('T')[0]}.pdf`);

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
          title="Total Collections"
          value={stats.totalCollections}
          icon={<Droplet className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity (L)"
          value={stats.totalQuantity}
          icon={<BarChart3 className="w-full h-full" />}
          color="green"
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
            farmerFilter={farmerFilter}
            onFarmerChange={(value) => setFarmerFilter(Array.isArray(value) ? value : [value])}
            dairies={dairiesWithCollections}
            bmcs={bmcsWithCollections}
            societies={societies}
            machines={machines}
            farmers={farmers}
            filteredCount={filteredRecords.length}
            totalCount={records.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            icon={<Droplet className="w-5 h-5" />}
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
            showFarmerFilter
            farmerFilterLabel={reportSource === 'bmc' ? 'Society' : 'Farmer'}
            simpleFarmerFilter={reportSource === 'bmc'}
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
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{reportSource === 'bmc' ? 'Society' : 'Farmer'}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{reportSource === 'bmc' ? 'BMC' : 'Society'}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Machine</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Shift</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Channel</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Fat %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">SNF %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CLR</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Protein %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Lactose %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Salt %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Water %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Temp (°C)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Rate/L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Bonus</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Qty (L)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={21} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Droplet className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {machineFilter.length > 0 || farmerFilter.length > 0 || societyFilter.length > 0 || bmcFilter.length > 0 || dairyFilter.length > 0
                            ? 'No Data Available'
                            : 'No collection records found'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {machineFilter.length > 0
                            ? `No collection records found for the selected machine${machineFilter.length > 1 ? 's' : ''}`
                            : farmerFilter.length > 0
                            ? `No collection records found for the selected ${reportSource === 'bmc' ? 'society' : 'farmer'}${farmerFilter.length > 1 ? 's' : ''}`
                            : societyFilter.length > 0
                            ? `No collection records found for the selected society${societyFilter.length > 1 ? 'ies' : ''}`
                            : bmcFilter.length > 0
                            ? `No collection records found for the selected BMC${bmcFilter.length > 1 ? 's' : ''}`
                            : dairyFilter.length > 0
                            ? `No collection records found for the selected dairy${dairyFilter.length > 1 ? 'ies' : ''}`
                            : 'Try adjusting your filters or date range'}
                        </p>
                      </div>
                      {(machineFilter.length > 0 || farmerFilter.length > 0 || societyFilter.length > 0 || bmcFilter.length > 0 || dairyFilter.length > 0) && (
                        <button
                          onClick={clearFilters}
                          className="mt-2 px-4 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 transition-colors text-sm"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className={`transition-colors ${
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
                      <div>{highlightText(record.collection_date, combinedSearch)}</div>
                      <div className="text-xs text-gray-500">{record.collection_time}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                      <div 
                        className="font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => {
                          router.push(`/admin/farmer?farmerId=${encodeURIComponent(record.farmer_id)}&farmerName=${encodeURIComponent(record.farmer_name)}`);
                        }}
                        title="Click to view farmer details"
                      >
                        {highlightText(record.farmer_name, combinedSearch)}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span 
                          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => {
                            router.push(`/admin/farmer?farmerId=${encodeURIComponent(record.farmer_id)}&farmerName=${encodeURIComponent(record.farmer_name)}`);
                          }}
                          title="Click to view farmer details"
                        >
                          ID: {highlightText(record.farmer_id, combinedSearch)}
                        </span>
                        {record.farmer_uid && (
                          <span className="ml-2">UID: {highlightText(record.farmer_uid, combinedSearch)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="font-medium">{highlightText(reportSource === 'bmc' ? (record.bmc_name || 'N/A') : record.society_name, combinedSearch)}</div>
                      <div className="text-xs text-gray-500">ID: {highlightText(reportSource === 'bmc' ? (record.bmc_id || 'N/A') : record.society_id, combinedSearch)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="font-medium">{highlightText(record.machine_id, combinedSearch)}</div>
                      <div className="text-xs text-gray-500">{highlightText(record.machine_type, combinedSearch)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ['MR', 'MX', 'morning'].includes(record.shift_type?.toUpperCase() === 'MORNING' ? 'morning' : record.shift_type)
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : ['EV', 'EX', 'evening'].includes(record.shift_type?.toUpperCase() === 'EVENING' ? 'evening' : record.shift_type)
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
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.fat_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.snf_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.clr_value).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.protein_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.lactose_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.salt_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.water_percentage).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.temperature).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">₹{highlightText(parseFloat(record.rate_per_liter).toFixed(2), combinedSearch)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">₹{highlightText(parseFloat(record.bonus).toFixed(2), combinedSearch)}</td>
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
        title="Delete Collection Record"
        message="Enter your admin password to confirm deletion. This action cannot be undone and will be logged for security purposes."
      />

      {/* Bulk Delete Password Confirmation Modal */}
      <PasswordConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => {
          setShowBulkDeleteConfirm(false);
          setBulkDeletePassword('');
        }}
        onConfirm={handleBulkDeleteConfirm}
        title={`Delete ${selectedRecords.size} Collection Record${selectedRecords.size > 1 ? 's' : ''}`}
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
        reportType="Collection Report"
        availableColumns={getCollectionColumns(reportSource)}
        defaultColumns={getDefaultCollectionColumns(reportSource)}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadWithColumns}
        recordCount={filteredRecords.length}
        reportType="Collection Report"
        availableColumns={getCollectionColumns(reportSource)}
        defaultColumns={getDefaultCollectionColumns(reportSource)}
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
