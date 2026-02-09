'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, UserCheck, Phone, Mail, Building2, Settings, Folder, FolderOpen, ChevronDown, ChevronRight, Plus, Upload, Droplets, TrendingUp, Award, BarChart3, X, Badge } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailOnBlur } from '@/lib/validation/emailValidation';
import { 
  FlowerSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid,
  StatusMessage,
  ItemCard,
  EmptyState,
  ColumnSelectionModal
} from '@/components';
import {
  BulkDeleteConfirmModal,
  ConfirmDeleteModal,
  BulkActionsToolbar,
  LoadingSnackbar,
  ViewModeToggle,
  FilterDropdown,
  StatsGrid,
  ManagementPageHeader,
  FloatingActionButton
} from '@/components/management';
import CSVUploadModal from '@/components/forms/CSVUploadModal';
import { downloadFarmersAsCSV, downloadFarmersAsPDF, getFarmerColumns } from '@/lib/utils/downloadUtils';

import { Society, Farmer } from '@/types';

const FarmerManagement = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [machines, setMachines] = useState<Array<{id: number, machineId: string, machineType: string, societyId?: number, societyName?: string}>>([]);
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'maintenance'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkSocietyId, setBulkSocietyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Selective deletion state
  const [selectedFarmers, setSelectedFarmers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState<{id: number, name: string, farmerId: string} | null>(null);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  
  // Folder view state
  const [expandedSocieties, setExpandedSocieties] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('folder');
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  
  // Graph modal state
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'rate'>('quantity');
  const [graphData, setGraphData] = useState<any[]>([]);
  
  // Bulk status update state
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'suspended' | 'maintenance'>('active');
  const [performanceStats, setPerformanceStats] = useState<{
    topCollector: { farmer: any; totalQuantity: number } | null;
    bestFat: { farmer: any; avgFat: number } | null;
    bestSnf: { farmer: any; avgSnf: number } | null;
    topRevenue: { farmer: any; totalAmount: number } | null;
    mostActive: { farmer: any; totalCollections: number } | null;
    bestQuality: { farmer: any; avgRate: number } | null;
  }>({  
    topCollector: null,
    bestFat: null,
    bestSnf: null,
    topRevenue: null,
    mostActive: null,
    bestQuality: null
  });

  // Form state
  const [formData, setFormData] = useState({
    farmerId: '',
    farmeruid: '',
    rfId: '',
    farmerName: '',
    contactNumber: '',
    email: '',
    smsEnabled: 'OFF',
    emailNotificationsEnabled: 'ON',
    bonus: 0,
    address: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    societyId: '',
    machineId: '',
    status: 'active',
    notes: '',
    // Payment fields
    paytmPhone: '',
    paytmEnabled: 'NO',
    upiId: '',
    pendingPaymentAmount: 0
  });



  // Fetch farmers, societies, and machines
  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

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

  // Reset machine filter when society filter changes
  useEffect(() => {
    if (societyFilter.length > 0 && machineFilter.length > 0) {
      // Check if current machine selections are still valid for the selected society
      const validMachines = machineFilter.filter(mId => {
        const machine = machines.find(m => m.id.toString() === mId);
        return machine && societyFilter.includes(machine.societyId?.toString() || '');
      });
      if (validMachines.length !== machineFilter.length) {
        setMachineFilter(validMachines);
      }
    }
  }, [societyFilter, machineFilter, machines]);

  // Read URL parameters and initialize filters on mount
  useEffect(() => {
    const societyId = searchParams.get('societyId');
    const societyName = searchParams.get('societyName');
    const dairyFilterParam = searchParams.get('dairyFilter');
    const bmcFilterParam = searchParams.get('bmcFilter');
    const farmerIdParam = searchParams.get('farmerId');
    const farmerNameParam = searchParams.get('farmerName');
    
    if (societyId && !societyFilter.includes(societyId)) {
      setSocietyFilter([societyId]);
      
      // Show success message with society name
      if (societyName) {
        setSuccess(`Filter Applied: ${decodeURIComponent(societyName)}`);
      }
    }
    
    if (dairyFilterParam && !dairyFilter.includes(dairyFilterParam)) {
      setDairyFilter([dairyFilterParam]);
      setSuccess('Filter Applied: Dairy');
    }
    
    if (bmcFilterParam && !bmcFilter.includes(bmcFilterParam)) {
      setBmcFilter([bmcFilterParam]);
      setSuccess('Filter Applied: BMC');
    }
    
    // Handle farmer filter from collection report - search by both ID and name
    if ((farmerIdParam || farmerNameParam) && farmers.length > 0) {
      const searchTerm = farmerNameParam ? decodeURIComponent(farmerNameParam) : farmerIdParam;
      setSearchQuery(searchTerm || '');
      setSuccess(`Filter Applied: ${farmerNameParam ? decodeURIComponent(farmerNameParam) : `Farmer ID ${farmerIdParam}`}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmers.length]); // Run when farmers data loads

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFarmers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchPerformanceStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/farmer-performance', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceStats(data.stats || {
          topCollector: null,
          bestFat: null,
          bestSnf: null,
          topRevenue: null,
          mostActive: null,
          bestQuality: null
        });
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    }
  }, []);

  const fetchGraphData = useCallback(async (metric: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/farmer-performance?graphData=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const allFarmers = data.farmers || [];
        
        const chartData = allFarmers.map((farmer: any) => ({
          name: farmer.farmer_name,
          farmerId: farmer.farmer_id,
          societyName: farmer.society_name,
          value: metric === 'quantity' ? (parseFloat(farmer.total_quantity) || 0) :
                 metric === 'revenue' ? (parseFloat(farmer.total_amount) || 0) :
                 metric === 'fat' ? (parseFloat(farmer.avg_fat) || 0) :
                 metric === 'snf' ? (parseFloat(farmer.avg_snf) || 0) :
                 metric === 'collections' ? (parseInt(farmer.total_collections) || 0) :
                 (parseFloat(farmer.avg_rate) || 0)
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 20); // Top 20 farmers
        
        setGraphData(chartData);
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphData([]);
    }
  }, []);

  const handleCardClick = (metric: 'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'rate') => {
    setGraphMetric(metric);
    fetchGraphData(metric);
    setShowGraphModal(true);
  };

  const fetchSocieties = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  // Fetch dairies
  const fetchDairies = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDairies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    }
  };

  // Fetch BMCs
  const fetchBmcs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBmcs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    }
  };

  // Fetch all machines
  const fetchAllMachines = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    }
  };

  // Fetch machines by society ID
  const fetchMachinesBySociety = async (societyId: string) => {
    if (!societyId) {
      setMachines([]);
      return;
    }

    try {
      setMachinesLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine/by-society?societyId=${societyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      } else {
        setMachines([]);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    } finally {
      setMachinesLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    setIsUpdatingStatus(true);
    setUpdateProgress(0);
    try {
      const farmer = farmers.find(f => f.id === id);
      if (!farmer) return;

      setUpdateProgress(30);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: farmer.id,
          farmerId: farmer.farmerId,
          rfId: farmer.rfId,
          farmerName: farmer.farmerName,
          contactNumber: farmer.contactNumber,
          smsEnabled: farmer.smsEnabled,
          emailNotificationsEnabled: farmer.emailNotificationsEnabled || 'ON',
          bonus: farmer.bonus,
          address: farmer.address,
          bankName: farmer.bankName,
          bankAccountNumber: farmer.bankAccountNumber,
          ifscCode: farmer.ifscCode,
          societyId: farmer.societyId,
          machineId: farmer.machineId,
          status: newStatus,
          notes: farmer.notes
        })
      });

      setUpdateProgress(70);
      if (response.ok) {
        setFarmers(prev =>
          prev.map(f => (f.id === id ? { ...f, status: newStatus as Farmer['status'] } : f))
        );
        setUpdateProgress(100);
        setSuccess('Farmer status updated successfully');
        setError('');
      } else {
        setError('Failed to update farmer status');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating farmer status');
      setSuccess('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle farmer deletion - show confirmation
  const handleDelete = (id: number) => {
    const farmer = farmers.find(f => f.id === id);
    if (farmer) {
      setFarmerToDelete({ id: farmer.id, name: farmer.farmerName, farmerId: farmer.farmerId });
      setShowSingleDeleteConfirm(true);
    }
  };

  // Confirm single farmer deletion
  const confirmDeleteFarmer = async () => {
    if (!farmerToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/farmer?id=${farmerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFarmers(prev => prev.filter(f => f.id !== farmerToDelete.id));
        setSuccess(t.farmerManagement.deletedSuccessfully || 'Farmer deleted successfully');
        setError('');
      } else {
        setError(t.farmerManagement.deleteError || 'Failed to delete farmer. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
      setError(t.farmerManagement.deleteError || 'Error deleting farmer. Please try again.');
      setSuccess('');
    } finally {
      setShowSingleDeleteConfirm(false);
      setFarmerToDelete(null);
    }
  };

  // Selection handlers
  const handleSelectFarmer = (farmerId: number) => {
    setSelectedFarmers(prev => {
      const newSelected = new Set(prev);
      const isDeselecting = newSelected.has(farmerId);
      
      if (isDeselecting) {
        newSelected.delete(farmerId);
        
        // When deselecting a farmer, uncheck selectAll
        setSelectAll(false);
        
        // Check if we should deselect the society folder
        const farmer = filteredFarmers.find(f => f.id === farmerId);
        if (farmer && farmer.societyId) {
          const societyId = farmer.societyId;
          const societyFarmers = filteredFarmers.filter(f => f.societyId === societyId);
          const allSocietyFarmersSelected = societyFarmers.every(f => 
            f.id === farmerId ? false : newSelected.has(f.id)
          );
          
          // If not all farmers in the society are selected, deselect the society folder
          if (!allSocietyFarmersSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.delete(societyId);
              return updatedSocieties;
            });
          }
        }
      } else {
        newSelected.add(farmerId);
        
        // Check if the society folder should be selected
        const farmer = filteredFarmers.find(f => f.id === farmerId);
        if (farmer && farmer.societyId) {
          const societyId = farmer.societyId;
          const societyFarmers = filteredFarmers.filter(f => f.societyId === societyId);
          const allSocietyFarmersSelected = societyFarmers.every(f => 
            f.id === farmerId ? true : newSelected.has(f.id)
          );
          
          // If all farmers in the society are now selected, select the society folder
          if (allSocietyFarmersSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.add(societyId);
              return updatedSocieties;
            });
          }
        }
        
        // Check if all filtered farmers are now selected
        const allFilteredIds = new Set(filteredFarmers.map(f => f.id));
        const allSelected = Array.from(allFilteredIds).every(id => 
          id === farmerId ? true : newSelected.has(id)
        );
        
        if (allSelected) {
          setSelectAll(true);
        }
      }
      
      return newSelected;
    });
  };

  // Toggle society folder expansion
  const toggleSocietyExpansion = (societyId: number) => {
    setExpandedSocieties(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(societyId)) {
        newExpanded.delete(societyId);
      } else {
        newExpanded.add(societyId);
      }
      return newExpanded;
    });
  };

  // Toggle society selection
  const toggleSocietySelection = (societyId: number, farmerIds: number[]) => {
    setSelectedSocieties(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(societyId)) {
        // Deselect society and all its farmers
        newSelected.delete(societyId);
        setSelectedFarmers(prevFarmers => {
          const updatedFarmers = new Set(prevFarmers);
          farmerIds.forEach(id => updatedFarmers.delete(id));
          
          // Check if we should unset selectAll
          // If any farmer is deselected, selectAll should be false
          setSelectAll(false);
          
          return updatedFarmers;
        });
      } else {
        // Select society and all its farmers
        newSelected.add(societyId);
        setSelectedFarmers(prevFarmers => {
          const updatedFarmers = new Set(prevFarmers);
          farmerIds.forEach(id => updatedFarmers.add(id));
          
          // Check if all filtered farmers are now selected
          const allFilteredIds = new Set(filteredFarmers.map(f => f.id));
          const allSelected = Array.from(allFilteredIds).every(id => updatedFarmers.has(id));
          if (allSelected) {
            setSelectAll(true);
          }
          
          return updatedFarmers;
        });
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFarmers(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
    } else {
      // Select only the currently filtered farmers
      setSelectedFarmers(new Set(filteredFarmers.map(f => f.id)));
      
      // Also select all societies that have farmers in the filtered list
      const farmersBySociety = filteredFarmers.reduce((acc, farmer) => {
        const societyId = farmer.societyId || 0;
        if (!acc.includes(societyId)) {
          acc.push(societyId);
        }
        return acc;
      }, [] as number[]);
      setSelectedSocieties(new Set(farmersBySociety));
      
      setSelectAll(true);
    }
  };

  // Clear selections when filters or search change or keep only visible farmers
  useEffect(() => {
    if (selectedFarmers.size > 0) {
      // Calculate filtered farmers inline to avoid dependency issues
      const currentlyFilteredFarmers = farmers.filter(farmer => {
        const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
        const societyMatch = societyFilter.length === 0 || societyFilter.includes(farmer.societyId?.toString() || '');
        const machineMatch = machineFilter.length === 0 || 
          machineFilter.includes(farmer.machineId?.toString() || '');
        const searchMatch = searchQuery === '' || 
          farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.farmeruid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && societyMatch && machineMatch && searchMatch;
      });
      
      // Keep only farmers that are still visible after filtering/searching
      const visibleFarmerIds = new Set(currentlyFilteredFarmers.map(f => f.id));
      const updatedSelection = new Set(
        Array.from(selectedFarmers).filter(id => visibleFarmerIds.has(id))
      );
      
      if (updatedSelection.size !== selectedFarmers.size) {
        setSelectedFarmers(updatedSelection);
        setSelectAll(false);
        
        // Update society selections based on remaining selected farmers
        const visibleSocietyIds = new Set(currentlyFilteredFarmers.map(f => f.societyId).filter(Boolean));
        const updatedSocietySelection = new Set<number>();
        
        visibleSocietyIds.forEach(societyId => {
          const societyFarmers = currentlyFilteredFarmers.filter(f => f.societyId === societyId);
          const allSocietyFarmersSelected = societyFarmers.every(f => updatedSelection.has(f.id));
          if (allSocietyFarmersSelected && societyFarmers.length > 0) {
            updatedSocietySelection.add(societyId as number);
          }
        });
        
        setSelectedSocieties(updatedSocietySelection);
      }
    } else {
      setSelectAll(false);
      setSelectedSocieties(new Set());
    }
  }, [statusFilter, societyFilter, machineFilter, searchQuery, farmers, selectedFarmers]);

  const handleBulkDelete = async () => {
    if (selectedFarmers.size === 0) return;

    // Close the confirmation modal immediately and show LoadingSnackbar
    setShowDeleteConfirm(false);
    setIsDeletingBulk(true);
    setUpdateProgress(0);
    
    try {
      const token = localStorage.getItem('authToken');
      setUpdateProgress(10);
      
      const ids = Array.from(selectedFarmers);
      setUpdateProgress(20);
      
      const response = await fetch(`/api/user/farmer?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUpdateProgress(60);

      if (response.ok) {
        setUpdateProgress(80);
        await fetchFarmers(); // Refresh the list
        setUpdateProgress(95);
        setSelectedFarmers(new Set());
        setSelectAll(false);
        setSuccess(`Successfully deleted ${ids.length} farmer(s)${(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) ? ' from filtered results' : ''}`);
        setSocietyFilter([]);
        setError('');
        setUpdateProgress(100);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete selected farmers');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting farmers:', error);
      setError('Error deleting selected farmers');
      setSuccess('');
    } finally {
      setIsDeletingBulk(false);
      setUpdateProgress(0);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus?: string) => {
    if (selectedFarmers.size === 0) return;

    const statusToUpdate = newStatus || bulkStatus;
    setIsBulkUpdatingStatus(true);
    setUpdateProgress(0);

    try {
      // Step 1: Get token (5%)
      const token = localStorage.getItem('authToken');
      setUpdateProgress(5);
      
      // Step 2: Prepare farmer IDs (10%)
      const farmerIds = Array.from(selectedFarmers);
      const totalFarmers = farmerIds.length;
      setUpdateProgress(10);
      
      console.log(`🔄 Bulk updating ${totalFarmers} farmers to status: ${statusToUpdate}`);
      
      // Step 3: Single bulk update API call (10% to 90%)
      setUpdateProgress(30);
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bulkStatusUpdate: true,
          farmerIds: farmerIds,
          status: statusToUpdate
        })
      });

      setUpdateProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update farmer status');
      }

      const result = await response.json();
      const updatedCount = result.data?.updated || totalFarmers;
      
      // Step 4: Refresh data (90%)
      setUpdateProgress(90);
      await fetchFarmers();
      
      // Step 5: Finalize (100%)
      setUpdateProgress(100);
      setSelectedFarmers(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
      
      console.log(`✅ Successfully updated ${updatedCount} farmers`);
      
      setSuccess(
        `Successfully updated status to "${statusToUpdate}" for ${updatedCount} farmer(s)${
          (statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0) ? ' from filtered results' : ''
        }`
      );
      setError('');

    } catch (error) {
      console.error('Error updating farmer status:', error);
      setUpdateProgress(100);
      setError(error instanceof Error ? error.message : 'Error updating farmer status. Please try again.');
      setSuccess('');
    } finally {
      setIsBulkUpdatingStatus(false);
    }
  };

  // Handle bulk download for selected farmers
  const handleBulkDownload = () => {
    if (selectedFarmers.size === 0) {
      setError('No farmers selected');
      return;
    }
    handleOpenColumnSelection();
  };

  // Handle opening column selection modal
  const handleOpenColumnSelection = () => {
    setShowColumnSelection(true);
  };

  // Handle download with selected columns
  const handleDownloadWithColumns = async (selectedColumns: string[], format: 'csv' | 'pdf') => {
    setIsDownloading(true);
    try {
      // If farmers are selected, download only selected farmers (that are also filtered)
      // If no farmers are selected, download all filtered farmers
      const farmersForDownload = selectedFarmers.size > 0 
        ? filteredFarmers.filter(farmer => selectedFarmers.has(farmer.id))
        : filteredFarmers;

      const farmersToDownload = farmersForDownload.map(farmer => ({
        farmerId: farmer.farmerId,
        rfId: farmer.rfId,
        farmerName: farmer.farmerName,
        contactNumber: farmer.contactNumber,
        email: farmer.contactNumber, // Using contactNumber as email since no separate email field
        societyId: farmer.societyId,
        address: farmer.address,
        notes: farmer.notes,
        status: farmer.status,
        smsEnabled: farmer.smsEnabled === 'ON',
        bonus: farmer.bonus,
        bankName: farmer.bankName,
        bankAccountNumber: farmer.bankAccountNumber,
        ifscCode: farmer.ifscCode
      }));

      const societiesData = societies.map(society => ({
        id: society.id,
        name: society.name,
        society_id: society.society_id
      }));

      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        society: societyFilter.length > 0 ? societyFilter[0] : undefined,
        selection: selectedFarmers.size > 0 ? `${selectedFarmers.size}-selected` : undefined
      };

      const downloadMessage = selectedFarmers.size > 0 
        ? `${selectedFarmers.size} selected farmer(s) downloaded successfully`
        : `${farmersToDownload.length} farmer(s) downloaded successfully`;

      if (format === 'csv') {
        downloadFarmersAsCSV(farmersToDownload, societiesData, filters, selectedColumns);
        setSuccess(`${downloadMessage} as CSV`);
      } else {
        await downloadFarmersAsPDF(farmersToDownload, societiesData, filters, selectedColumns);
        setSuccess(`${downloadMessage} as PDF`);
      }
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
      setError(`Failed to download ${format.toUpperCase()} file`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.farmerId || !formData.farmerId.trim()) {
      setError('Please enter a farmer ID.');
      setSuccess('');
      return;
    }

    if (!formData.farmerName || !formData.farmerName.trim()) {
      setError('Please enter the farmer name.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the farmer.');
      setSuccess('');
      return;
    }

    if (!formData.machineId) {
      setError('Please select a machine for the farmer.');
      setSuccess('');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          bonus: Number(formData.bonus)
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          farmerId: '',
          farmeruid: '',
          rfId: '',
          farmerName: '',
          contactNumber: '',
          email: '',
          smsEnabled: 'OFF',
          emailNotificationsEnabled: 'ON',
          bonus: 0,
          address: '',
          bankName: '',
          bankAccountNumber: '',
          ifscCode: '',
          societyId: '',
          machineId: '',
          status: 'active',
          notes: '',
          // Payment fields
          paytmPhone: '',
          paytmEnabled: 'NO',
          upiId: '',
          pendingPaymentAmount: 0
        });
        setSuccess('Farmer created successfully');
        setError('');
        fetchFarmers();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || errorResponse.message || 'Failed to create farmer';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerId: 'This Farmer ID already exists' });
        } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerName: 'This Farmer name already exists' });
        } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ email: 'This email address already exists' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error creating farmer:', error);
      setError('Error creating farmer. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    // Validate required fields
    if (!formData.farmerId || !formData.farmerId.trim()) {
      setError('Please enter a farmer ID.');
      setSuccess('');
      return;
    }

    if (!formData.farmerName || !formData.farmerName.trim()) {
      setError('Please enter the farmer name.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the farmer.');
      setSuccess('');
      return;
    }

    if (!formData.machineId) {
      setError('Please select a machine for the farmer.');
      setSuccess('');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedFarmer.id,
          ...formData,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          bonus: Number(formData.bonus)
        })
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedFarmer(null);
        setFormData({
          farmerId: '',
          farmeruid: '',
          rfId: '',
          farmerName: '',
          contactNumber: '',
          email: '',
          smsEnabled: 'OFF',
          emailNotificationsEnabled: 'ON',
          bonus: 0,
          address: '',
          bankName: '',
          bankAccountNumber: '',
          ifscCode: '',
          societyId: '',
          machineId: '',
          status: 'active',
          notes: '',
          // Payment fields
          paytmPhone: '',
          paytmEnabled: 'NO',
          upiId: '',
          pendingPaymentAmount: 0
        });
        setSuccess('Farmer updated successfully');
        setError('');
        fetchFarmers();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update farmer';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerId: 'This Farmer ID already exists' });
        } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerName: 'This Farmer name already exists' });
        } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ email: 'This email address already exists' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating farmer:', error);
      setError('Error updating farmer. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    // Validate required fields
    if (!bulkSocietyId) {
      setError('Please select a default society for bulk upload.');
      setSuccess('');
      return;
    }

    setIsSubmitting(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const farmers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const farmer: Record<string, string | number> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          // Map CSV headers to our farmer fields
          switch (header.toLowerCase()) {
            case 'id':
            case 'farmer_id':
            case 'farmerid':
              farmer.farmerId = value;
              break;
            case 'rf-id':
            case 'rfid':
            case 'rf_id':
              farmer.rfId = value;
              break;
            case 'name':
            case 'farmer_name':
            case 'farmername':
              farmer.farmerName = value;
              break;
            case 'mobile':
            case 'phone':
            case 'contact':
            case 'contact_number':
              farmer.contactNumber = value;
              break;
            case 'sms':
            case 'sms_enabled':
              farmer.smsEnabled = value.toUpperCase() === 'ON' ? 'ON' : 'OFF';
              break;
            case 'bonus':
              farmer.bonus = parseFloat(value) || 0;
              break;
            case 'address':
              farmer.address = value;
              break;
            case 'bank_name':
            case 'bankname':
              farmer.bankName = value;
              break;
            case 'bank_account_number':
            case 'account_number':
            case 'accountnumber':
              farmer.bankAccountNumber = value;
              break;
            case 'ifsc_code':
            case 'ifsc':
              farmer.ifscCode = value;
              break;
            case 'society_id':
            case 'societyid':
            case 'society':
              const societyId = parseInt(value);
              if (societyId && !isNaN(societyId)) {
                farmer.societyId = societyId;
              }
              break;
            case 'machine-id':
            case 'machine_id':
            case 'machineid':
              const machineId = parseInt(value);
              if (machineId && !isNaN(machineId)) {
                farmer.machineId = machineId;
              }
              break;
          }
        });

        // Ensure every farmer has a society ID - use CSV value if available, otherwise use default
        if (!farmer.societyId) {
          farmer.societyId = parseInt(bulkSocietyId);
        }

        return farmer;
      }).filter(farmer => farmer.farmerId && farmer.farmerName);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ farmers })
      });

      if (response.ok) {
        setShowBulkModal(false);
        setSelectedFile(null);
        setBulkSocietyId('');
        setSuccess('Farmers uploaded successfully');
        setError('');
        fetchFarmers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload farmers');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error uploading farmers:', error);
      setError('Error uploading farmers. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal control functions
  const openAddModal = () => {
    setFormData({
      farmerId: '',
      farmeruid: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      email: '',
      smsEnabled: 'OFF',
      emailNotificationsEnabled: 'ON',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: '',
      // Payment fields
      paytmPhone: '',
      paytmEnabled: 'NO',
      upiId: '',
      pendingPaymentAmount: 0
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleEditClick = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    const societyId = farmer.societyId?.toString() || '';
    setFormData({
      farmerId: farmer.farmerId,
      farmeruid: farmer.farmeruid || '',
      rfId: farmer.rfId || '',
      farmerName: farmer.farmerName,
      contactNumber: farmer.contactNumber || '',
      email: farmer.email || '',
      smsEnabled: farmer.smsEnabled,
      emailNotificationsEnabled: farmer.emailNotificationsEnabled || 'ON',
      bonus: farmer.bonus,
      address: farmer.address || '',
      bankName: farmer.bankName || '',
      bankAccountNumber: farmer.bankAccountNumber || '',
      ifscCode: farmer.ifscCode || '',
      societyId: societyId,
      machineId: farmer.machineId?.toString() || '',
      status: farmer.status,
      notes: farmer.notes || '',
      // Payment fields
      paytmPhone: farmer.paytmPhone || '',
      paytmEnabled: farmer.paytmEnabled || 'NO',
      upiId: farmer.upiId || '',
      pendingPaymentAmount: farmer.pendingPaymentAmount || 0
    });
    
    // Load machines for the farmer's society
    if (societyId) {
      fetchMachinesBySociety(societyId);
    }
    
    setShowEditForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setFormData({
      farmerId: '',
      farmeruid: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      email: '',
      smsEnabled: 'OFF',
      emailNotificationsEnabled: 'ON',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: '',
      // Payment fields
      paytmPhone: '',
      paytmEnabled: 'NO',
      upiId: '',
      pendingPaymentAmount: 0
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setSelectedFarmer(null);
    setFormData({
      farmerId: '',
      farmeruid: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      email: '',
      smsEnabled: 'OFF',
      emailNotificationsEnabled: 'ON',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: '',
      // Payment fields
      paytmPhone: '',
      paytmEnabled: 'NO',
      upiId: '',
      pendingPaymentAmount: 0
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Initial data fetch
  useEffect(() => {
    fetchFarmers();
    fetchDairies();
    fetchBmcs();
    fetchSocieties();
    fetchAllMachines();
    fetchPerformanceStats();
  }, [fetchFarmers, fetchPerformanceStats]);

  // Filter farmers using inline logic that supports array-based filters
  const filteredFarmers = farmers.filter(farmer => {
    // Search query filter
    const searchMatch = searchQuery === '' ||
      farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.farmeruid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!searchMatch) return false;

    // Status filter
    const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
    if (!statusMatch) return false;

    // Get farmer's society, BMC, and dairy
    const farmerSociety = societies.find(s => s.id === farmer.societyId);
    const farmerBmc = farmerSociety?.bmc_id ? bmcs.find(b => b.id === farmerSociety.bmc_id) : null;
    const farmerDairy = farmerBmc?.dairyFarmId ? dairies.find(d => d.id === farmerBmc.dairyFarmId) : null;

    // Dairy filter
    if (dairyFilter.length > 0) {
      if (!farmerDairy || !dairyFilter.includes(farmerDairy.id.toString())) {
        return false;
      }
    }

    // BMC filter
    if (bmcFilter.length > 0) {
      if (!farmerBmc || !bmcFilter.includes(farmerBmc.id.toString())) {
        return false;
      }
    }

    // Society filter (additional check beyond the utility function)
    if (societyFilter.length > 0) {
      if (!farmer.societyId || !societyFilter.includes(farmer.societyId.toString())) {
        return false;
      }
    }
    
    // Machine filter
    if (machineFilter.length > 0) {
      const farmerMachineId = farmer.machineId?.toString();
      if (!farmerMachineId || !machineFilter.includes(farmerMachineId)) {
        return false;
      }
    }

    return true;
  });

  // Filter societies to only show those with farmers in the current filtered list
  const availableSocieties = useMemo(() => {
    // Get unique society IDs from farmers based on current status and search filters
    const farmersForSocietyFilter = farmers.filter(farmer => {
      // Search filter
      const searchMatch = searchQuery === '' || 
        farmer.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.farmerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
      if (!statusMatch) return false;
      
      // Machine filter (but not society filter)
      if (machineFilter.length > 0) {
        const farmerMachineId = farmer.machineId?.toString();
        if (!farmerMachineId || !machineFilter.includes(farmerMachineId)) {
          return false;
        }
      }
      
      return true;
    });

    const societyIdsWithFarmers = new Set(
      farmersForSocietyFilter
        .map(f => f.societyId)
        .filter(Boolean)
    );

    return societies.filter(society => societyIdsWithFarmers.has(society.id));
  }, [farmers, societies, searchQuery, statusFilter, machineFilter]);

  // Filter machines to only show those with farmers in the current filtered list
  const availableMachines = useMemo(() => {
    // Get unique machine IDs from farmers based on current status, search, and society filters
    const farmersForMachineFilter = farmers.filter(farmer => {
      // Search filter
      const searchMatch = searchQuery === '' || 
        farmer.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.farmerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
      if (!statusMatch) return false;
      
      // Society filter (but not machine filter)
      if (societyFilter.length > 0) {
        if (!societyFilter.includes(farmer.societyId?.toString() || '')) {
          return false;
        }
      }
      
      return true;
    });

    const machineIdsWithFarmers = new Set(
      farmersForMachineFilter
        .map(f => f.machineId)
        .filter(Boolean)
    );

    return machines.filter(machine => machineIdsWithFarmers.has(machine.id));
  }, [farmers, machines, searchQuery, statusFilter, societyFilter]);

  return (
    <>
    {/* Loading Snackbar for All Operations */}
    <LoadingSnackbar
      isVisible={isSubmitting || isUpdatingStatus || isBulkUpdatingStatus || isDeletingBulk}
      message={
        isSubmitting ? (selectedFarmer ? t.farmerManagement.updatingFarmer : t.farmerManagement.addingFarmer) :
        isDeletingBulk ? t.farmerManagement.deletingFarmers :
        isBulkUpdatingStatus ? t.farmerManagement.updatingFarmers : 
        t.farmerManagement.updatingStatus
      }
      submessage={t.farmerManagement.pleaseWait}
      progress={isBulkUpdatingStatus || isDeletingBulk ? updateProgress : undefined}
      showProgress={isBulkUpdatingStatus || isDeletingBulk}
    />
    
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <ManagementPageHeader
        title={t.farmerManagement.title}
        subtitle={t.farmerManagement.subtitle}
        icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        onRefresh={fetchFarmers}
        hasData={filteredFarmers.length > 0}
      />

      {/* Success/Error Messages */}
      <StatusMessage 
        success={success} 
        error={error}
      />

      {/* Performance Stats Cards */}
      {(performanceStats.topCollector || performanceStats.bestFat || performanceStats.topRevenue) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {performanceStats.topCollector && (
            <div 
              onClick={() => handleCardClick('quantity')}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Top Collector (30d)</h3>
                <Droplets className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-bold text-green-800 dark:text-green-200 truncate">{performanceStats.topCollector.farmer.farmerName}</p>
              <p className="text-xs text-green-700 dark:text-green-300 truncate">ID: {performanceStats.topCollector.farmer.farmerId}</p>
              {performanceStats.topCollector.farmer.societyName && (
                <p className="text-xs text-green-600 dark:text-green-400 truncate">{performanceStats.topCollector.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">{performanceStats.topCollector.totalQuantity.toFixed(2)} L</p>
            </div>
          )}
          
          {performanceStats.topRevenue && (
            <div 
              onClick={() => handleCardClick('revenue')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Top Earner (30d)</h3>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-200 truncate">{performanceStats.topRevenue.farmer.farmerName}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 truncate">ID: {performanceStats.topRevenue.farmer.farmerId}</p>
              {performanceStats.topRevenue.farmer.societyName && (
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{performanceStats.topRevenue.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">₹{performanceStats.topRevenue.totalAmount.toFixed(2)}</p>
            </div>
          )}
          
          {performanceStats.bestFat && (
            <div 
              onClick={() => handleCardClick('fat')}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Best Fat (30d)</h3>
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-200 truncate">{performanceStats.bestFat.farmer.farmerName}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 truncate">ID: {performanceStats.bestFat.farmer.farmerId}</p>
              {performanceStats.bestFat.farmer.societyName && (
                <p className="text-xs text-purple-600 dark:text-purple-400 truncate">{performanceStats.bestFat.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">{performanceStats.bestFat.avgFat.toFixed(2)}% Fat</p>
            </div>
          )}
          
          {performanceStats.bestSnf && (
            <div 
              onClick={() => handleCardClick('snf')}
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Best SNF (30d)</h3>
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-lg font-bold text-orange-800 dark:text-orange-200 truncate">{performanceStats.bestSnf.farmer.farmerName}</p>
              <p className="text-xs text-orange-700 dark:text-orange-300 truncate">ID: {performanceStats.bestSnf.farmer.farmerId}</p>
              {performanceStats.bestSnf.farmer.societyName && (
                <p className="text-xs text-orange-600 dark:text-orange-400 truncate">{performanceStats.bestSnf.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{performanceStats.bestSnf.avgSnf.toFixed(2)}% SNF</p>
            </div>
          )}
          
          {performanceStats.mostActive && (
            <div 
              onClick={() => handleCardClick('collections')}
              className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Most Active (30d)</h3>
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-lg font-bold text-pink-800 dark:text-pink-200 truncate">{performanceStats.mostActive.farmer.farmerName}</p>
              <p className="text-xs text-pink-700 dark:text-pink-300 truncate">ID: {performanceStats.mostActive.farmer.farmerId}</p>
              {performanceStats.mostActive.farmer.societyName && (
                <p className="text-xs text-pink-600 dark:text-pink-400 truncate">{performanceStats.mostActive.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-pink-600 dark:text-pink-400 mt-1">{performanceStats.mostActive.totalCollections} Collections</p>
            </div>
          )}
          
          {performanceStats.bestQuality && (
            <div 
              onClick={() => handleCardClick('rate')}
              className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Best Rate (30d)</h3>
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 truncate">{performanceStats.bestQuality.farmer.farmerName}</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 truncate">ID: {performanceStats.bestQuality.farmer.farmerId}</p>
              {performanceStats.bestQuality.farmer.societyName && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">{performanceStats.bestQuality.farmer.societyName}</p>
              )}
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">₹{performanceStats.bestQuality.avgRate.toFixed(2)}/L</p>
            </div>
          )}
        </div>
      )}

      {/* Status Stats Cards */}
      <StatsGrid
        allItems={farmers}
        filteredItems={filteredFarmers}
        hasFilters={statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0}
        onStatusFilterChange={(status) => setStatusFilter(status)}
        currentStatusFilter={statusFilter}
      />

      {/* Filter Controls */}
      <FilterDropdown
        statusFilter={statusFilter}
        onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
        dairyFilter={dairyFilter}
        onDairyChange={(value) => setDairyFilter(Array.isArray(value) ? value : [value])}
        bmcFilter={bmcFilter}
        onBmcChange={(value) => setBmcFilter(Array.isArray(value) ? value : [value])}
        societyFilter={societyFilter}
        onSocietyChange={(value) => setSocietyFilter(Array.isArray(value) ? value : [value])}
        machineFilter={machineFilter}
        onMachineChange={(value) => setMachineFilter(Array.isArray(value) ? value : [value])}
        dairies={dairies}
        bmcs={bmcs}
        societies={availableSocieties}
        machines={availableMachines}
        filteredCount={filteredFarmers.length}
        totalCount={farmers.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        icon={<Users className="w-5 h-5" />}
        hideMainFilterButton={true}
      />

      {/* Select All and View Mode Controls */}
      {filteredFarmers.length > 0 && (
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Select All Control - Left Side */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.farmerManagement.selectAll} {filteredFarmers.length} {filteredFarmers.length === 1 ? t.roles.farmer : t.farmerManagement.farmers}
              {(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) && ` (${t.common.filter.toLowerCase()})`}
            </span>
          </label>

          {/* View Mode Toggle - Right Side */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              folderLabel="Folder View"
              listLabel="Grid View"
            />
          </div>
        </div>
      )}

      {/* Farmers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FlowerSpinner size={40} />
        </div>
      ) : filteredFarmers.length > 0 ? (
        viewMode === 'folder' ? (
          // Folder View - Grouped by Society
          <div className="space-y-4">
            {(() => {
              // Group farmers by society
              const farmersBySociety = filteredFarmers.reduce((acc, farmer) => {
                const societyId = farmer.societyId || 0;
                const societyName = farmer.societyName || 'Unassigned';
                const societyIdentifier = farmer.societyIdentifier || 'N/A';
                
                if (!acc[societyId]) {
                  acc[societyId] = {
                    id: societyId,
                    name: societyName,
                    identifier: societyIdentifier,
                    farmers: []
                  };
                }
                acc[societyId].farmers.push(farmer);
                return acc;
              }, {} as Record<number, {id: number; name: string; identifier: string; farmers: Farmer[]}>);

              const societyGroups = Object.values(farmersBySociety).sort((a, b) => 
                a.name.localeCompare(b.name)
              );

              return societyGroups.map(society => {
                const isExpanded = expandedSocieties.has(society.id);
                const isSocietySelected = selectedSocieties.has(society.id);
                const farmerCount = society.farmers.length;
                const activeCount = society.farmers.filter(f => f.status === 'active').length;
                const inactiveCount = society.farmers.filter(f => f.status === 'inactive').length;
                const farmerIds = society.farmers.map(f => f.id);

                return (
                  <div key={society.id} className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors hover:z-10 ${
                    isSocietySelected 
                      ? 'border-blue-500 dark:border-blue-400' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {/* Society Folder Header */}
                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Society Selection Checkbox */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSocietySelection(society.id, farmerIds);
                        }}
                        className="flex items-center mr-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSocietySelected}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                      </div>

                      {/* Expandable Header */}
                      <button
                        onClick={() => toggleSocietyExpansion(society.id)}
                        className="flex-1 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                          <div className="text-left">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                              {society.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            ID: {society.identifier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>{activeCount}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>{inactiveCount}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {farmerCount} {farmerCount === 1 ? 'farmer' : 'farmers'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                    {/* Farmers Grid - Shown when expanded */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {society.farmers.map((farmer) => (
                            <div key={farmer.id} className="relative hover:z-20 h-full">
                            <ItemCard
                              id={farmer.id}
                              name={farmer.farmerName}
                              identifier={`ID: ${farmer.farmerId}`}
                              status={farmer.status}
                              icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
                              details={[
                                ...(farmer.farmeruid ? [{ 
                                  icon: <Badge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                                  text: farmer.farmeruid,
                                  highlight: true,
                                  className: 'text-green-700 dark:text-green-400 font-semibold'
                                }] : []),
                                ...(farmer.contactNumber ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: farmer.contactNumber }] : []),
                                ...(farmer.email ? [{ icon: <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: farmer.email }] : []),
                                ...(farmer.machineName || farmer.machineType ? [{ 
                                  icon: <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                                  text: farmer.machineType && farmer.machineName 
                                    ? `${farmer.machineType} (${farmer.machineName})`
                                    : farmer.machineName || farmer.machineType || 'Machine Not Assigned',
                                  highlight: farmer.machineName ? false : undefined
                                }] : [{ 
                                  icon: <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, 
                                  text: 'No Machine Assigned',
                                  className: 'text-gray-500 dark:text-gray-400'
                                }]),
                                { icon: <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Bonus: ${farmer.bonus}` }
                              ]}
                              onStatusChange={(newStatus) => handleStatusChange(farmer.id, newStatus)}
                              onView={() => router.push(`/admin/farmer/${farmer.id}`)}
                              onEdit={() => handleEditClick(farmer)}
                              onDelete={() => handleDelete(farmer.id)}
                              viewText="View Details"
                              selectable={true}
                              selected={selectedFarmers.has(farmer.id)}
                              onSelect={() => handleSelectFarmer(farmer.id)}
                              searchQuery={searchQuery}
                              className="h-full"
                            />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          // List View - Traditional flat grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map(farmer => (
              <ItemCard
                key={farmer.id}
                id={farmer.id}
                name={farmer.farmerName}
                identifier={`ID: ${farmer.farmerId}`}
                status={farmer.status}
                icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
                details={[
                  ...(farmer.farmeruid ? [{ 
                    icon: <Badge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                    text: farmer.farmeruid,
                    highlight: true,
                    className: 'text-green-700 dark:text-green-400 font-semibold'
                  }] : []),
                  ...(farmer.contactNumber ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: farmer.contactNumber }] : []),
                  ...(farmer.email ? [{ icon: <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: farmer.email }] : []),
                  ...(farmer.societyName ? [{ 
                    icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                    text: farmer.societyIdentifier 
                      ? `${farmer.societyName} (${farmer.societyIdentifier})` 
                      : farmer.societyName,
                    highlight: true
                  }] : []),
                  ...(farmer.machineName || farmer.machineType ? [{ 
                    icon: <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                    text: farmer.machineType && farmer.machineName 
                      ? `${farmer.machineType} (${farmer.machineName})`
                      : farmer.machineName || farmer.machineType || 'Machine Not Assigned',
                    highlight: farmer.machineName ? false : undefined
                  }] : [{ 
                    icon: <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />, 
                    text: 'No Machine Assigned',
                    className: 'text-gray-500 dark:text-gray-400'
                  }]),
                  { icon: <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Bonus: ${farmer.bonus}` }
                ]}
                onStatusChange={(newStatus) => handleStatusChange(farmer.id, newStatus)}
                onView={() => router.push(`/admin/farmer/${farmer.id}`)}
                onEdit={() => handleEditClick(farmer)}
                onDelete={() => handleDelete(farmer.id)}
                viewText="View Details"
                selectable={true}
                selected={selectedFarmers.has(farmer.id)}
                onSelect={() => handleSelectFarmer(farmer.id)}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
          title={farmers.length === 0 ? t.farmerManagement.noFarmersFound : t.farmerManagement.noMatchingFarmers}
          message={farmers.length === 0 
            ? t.farmerManagement.getStartedMessage
            : searchQuery 
              ? `${t.farmerManagement.noMatchingFarmers}. ${t.farmerManagement.tryChangingFilters}`
              : t.farmerManagement.tryChangingFilters
          }
          actionText={farmers.length === 0 ? t.farmerManagement.addFarmer : undefined}
          onAction={farmers.length === 0 ? openAddModal : undefined}
          showAction={farmers.length === 0}
        />
      )}
      </div>

      {/* Add Farmer Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddModal}
        title={t.farmerManagement.addFarmer}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
          {/* Mandatory Fields First */}
          <FormInput
            label={t.farmerManagement.farmerId}
            type="text"
            value={formData.farmerId}
            onChange={(value) => {
              // Allow only numbers
              const numericValue = value.replace(/[^0-9]/g, '');
              setFormData({ ...formData, farmerId: numericValue });
            }}
            placeholder={t.farmerManagement.enterFarmerId}
            required
            error={fieldErrors.farmerId}
          />
          <FormInput
            label="Farmer UID"
            type="text"
            value={formData.farmeruid}
            onChange={(value) => {
              // Allow only alphanumeric characters, max 8 characters
              let alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              alphanumeric = alphanumeric.slice(0, 8); // Limit to 8 characters
              
              // Add hyphen after 4 characters: XXXX-XXXX
              let formatted = '';
              if (alphanumeric.length > 0) {
                formatted = alphanumeric.slice(0, 4);
                if (alphanumeric.length > 4) {
                  formatted += '-' + alphanumeric.slice(4, 8);
                }
              }
              
              setFormData({ ...formData, farmeruid: formatted });
            }}
            placeholder="e.g., VLDD-1234"
            required
            error={fieldErrors.farmeruid}
            maxLength={9}
          />
          <FormInput
            label={t.farmerManagement.farmerName}
            type="text"
            value={formData.farmerName}
            onChange={(value) => setFormData({ ...formData, farmerName: value })}
            placeholder={t.farmerManagement.enterFarmerName}
            required
            error={fieldErrors.farmerName}
          />
          <FormSelect
            label={t.farmerManagement.society}
            value={formData.societyId}
            onChange={(value) => {
              setFormData({ ...formData, societyId: value, machineId: '' });
              fetchMachinesBySociety(value);
            }}
            options={societies.map(society => ({
              value: society.id.toString(),
              label: `${society.name} (${society.society_id})`
            }))}
            placeholder={t.farmerManagement.selectSociety}
            required
            colSpan={1}
          />
          
          {/* Machine Selection - Same row as society */}
          <FormSelect
            label={t.farmerManagement.machine}
            value={formData.machineId}
            onChange={(value) => setFormData({ ...formData, machineId: value })}
            options={machines.map(machine => ({
              value: machine.id.toString(),
              label: `${machine.machineId} - ${machine.machineType}`
            }))}
            placeholder={machinesLoading ? t.common.loading : machines.length > 0 ? t.farmerManagement.selectMachine : t.farmerManagement.unassigned}
            disabled={machinesLoading}
            required
            colSpan={1}
            className="sm:max-w-[320px]"
          />
          
          {/* Show message if society selected but no machines */}
          {formData.societyId && !machinesLoading && machines.length === 0 && (
            <div className="col-span-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No machines found for this society. You can <strong>add machines first</strong> from the Machine Management section, or proceed without assigning a machine.
              </p>
            </div>
          )}
          
          {/* Contact Information */}
          <FormInput
            label={t.farmerManagement.contactNumber}
            type="tel"
            value={formData.contactNumber}
            onChange={(value) => {
              const formatted = formatPhoneInput(value);
              setFormData({ ...formData, contactNumber: formatted });
            }}
            onBlur={() => {
              const error = validatePhoneOnBlur(formData.contactNumber);
              if (error) {
                setFieldErrors(prev => ({ ...prev, contactNumber: error }));
              } else {
                const { contactNumber: _removed, ...rest } = fieldErrors;
                setFieldErrors(rest);
              }
            }}
            placeholder={t.farmerManagement.enterContactNumber}
            error={fieldErrors.contactNumber}
          />
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            onBlur={() => {
              const error = validateEmailOnBlur(formData.email);
              if (error) {
                setFieldErrors(prev => ({ ...prev, email: error }));
              } else {
                const { email: _removed, ...rest } = fieldErrors;
                setFieldErrors(rest);
              }
            }}
            placeholder="Enter Email Address"
            error={fieldErrors.email}
          />
          <FormSelect
            label={t.farmerManagement.smsEnabled}
            value={formData.smsEnabled}
            onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            placeholder={t.farmerManagement.selectStatus}
          />
          <FormSelect
            label="Email Notifications"
            value={formData.emailNotificationsEnabled}
            onChange={(value) => setFormData({ ...formData, emailNotificationsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            placeholder="Select Option"
          />
          
          {/* Optional Fields */}
          <FormInput
            label={t.farmerManagement.rfId}
            type="text"
            value={formData.rfId}
            onChange={(value) => setFormData({ ...formData, rfId: value })}
            placeholder={t.farmerManagement.enterRfId}
          />
          <FormInput
            label={t.farmerManagement.bonus}
            type="number"
            value={formData.bonus}
            onChange={(value) => setFormData({ ...formData, bonus: Number(value) })}
            placeholder={t.farmerManagement.enterBonus}
          />
          <FormSelect
            label={t.farmerManagement.status}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'active', label: t.farmerManagement.active },
              { value: 'inactive', label: t.farmerManagement.inactive },
              { value: 'suspended', label: t.farmerManagement.suspended },
              { value: 'maintenance', label: t.farmerManagement.maintenance }
            ]}
            placeholder={t.farmerManagement.selectStatus}
          />
          
          {/* Banking Information */}
          <FormInput
            label={t.farmerManagement.bankName}
            type="text"
            value={formData.bankName}
            onChange={(value) => setFormData({ ...formData, bankName: value })}
            placeholder={t.farmerManagement.enterBankName}
          />
          <FormInput
            label={t.farmerManagement.bankAccountNumber}
            type="number"
            value={formData.bankAccountNumber}
            onChange={(value) => {
              // Only allow numbers
              const numericValue = value.replace(/\D/g, '');
              setFormData({ ...formData, bankAccountNumber: numericValue });
            }}
            placeholder={t.farmerManagement.enterAccountNumber}
            pattern="[0-9]*"
            inputMode="numeric"
          />
          <FormInput
            label={t.farmerManagement.ifscCode}
            type="text"
            value={formData.ifscCode}
            onChange={(value) => setFormData({ ...formData, ifscCode: value })}
            placeholder={t.farmerManagement.enterIfscCode}
          />
          
          {/* Payment Information */}
          <div className="col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure payment methods for automated payments</p>
          </div>
          
          <FormInput
            label="Paytm Phone Number"
            type="tel"
            value={formData.paytmPhone}
            onChange={(value) => setFormData({ ...formData, paytmPhone: value })}
            placeholder="Enter Paytm registered phone"
          />
          
          <FormSelect
            label="Enable Paytm Payments"
            value={formData.paytmEnabled}
            onChange={(value) => setFormData({ ...formData, paytmEnabled: value })}
            options={[
              { value: 'YES', label: 'Enabled' },
              { value: 'NO', label: 'Disabled' }
            ]}
          />
          
          <FormInput
            label="UPI ID"
            type="text"
            value={formData.upiId}
            onChange={(value) => setFormData({ ...formData, upiId: value })}
            placeholder="farmer@upi"
          />
          
          <FormInput
            label="Pending Payment Amount (₹)"
            type="number"
            value={formData.pendingPaymentAmount}
            onChange={(value) => setFormData({ ...formData, pendingPaymentAmount: parseFloat(value) || 0 })}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          
          <FormInput
            label={t.farmerManagement.address}
            type="text"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder={t.farmerManagement.enterAddress}
          />
          
          <FormInput
            label={t.farmerManagement.notes}
            type="text"
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder={t.farmerManagement.enterNotes}
          />
        </FormGrid>
          
          <FormActions
            onCancel={closeAddModal}
            submitText={t.farmerManagement.createFarmer}
            isLoading={isSubmitting}
            isSubmitDisabled={
              !formData.societyId || 
              !formData.machineId || 
              !formData.farmerId || 
              !formData.farmerName ||
              Object.values(fieldErrors).some(error => error !== '')
            }
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Edit Farmer Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedFarmer}
        onClose={closeEditModal}
        title={t.farmerManagement.editFarmer}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
          {/* Mandatory Fields First */}
          <FormInput
            label={t.farmerManagement.farmerId}
            type="text"
            value={formData.farmerId}
            onChange={(value) => setFormData({ ...formData, farmerId: value })}
            placeholder={t.farmerManagement.enterUniqueFarmerId}
            required
            readOnly
            colSpan={1}
            error={fieldErrors.farmerId}
          />
          
          <FormInput
            label="Farmer UID"
            type="text"
            value={formData.farmeruid}
            onChange={(value) => {
              // Allow only alphanumeric characters, max 8 characters
              let alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              alphanumeric = alphanumeric.slice(0, 8); // Limit to 8 characters
              
              // Add hyphen after 4 characters: XXXX-XXXX
              let formatted = '';
              if (alphanumeric.length > 0) {
                formatted = alphanumeric.slice(0, 4);
                if (alphanumeric.length > 4) {
                  formatted += '-' + alphanumeric.slice(4, 8);
                }
              }
              
              setFormData({ ...formData, farmeruid: formatted });
            }}
            placeholder="e.g., VLDD-1234"
            error={fieldErrors.farmeruid}
            maxLength={9}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.farmerName}
            type="text"
            value={formData.farmerName}
            onChange={(value) => setFormData({ ...formData, farmerName: value })}
            placeholder={t.farmerManagement.enterFarmerFullName}
            required
            colSpan={1}
            error={fieldErrors.farmerName}
          />
          
          <FormSelect
            label={t.farmerManagement.society}
            value={formData.societyId}
            onChange={(value) => {
              setFormData({ ...formData, societyId: value, machineId: '' });
              fetchMachinesBySociety(value.toString());
            }}
            options={societies.map(society => ({ value: society.id, label: `${society.name} (${society.society_id})` }))}
            placeholder={t.farmerManagement.selectSociety}
            required
            colSpan={1}
          />
          
          {/* Machine Selection - Same row as society */}
          <FormSelect
            label={t.farmerManagement.machine}
            value={formData.machineId}
            onChange={(value) => setFormData({ ...formData, machineId: value })}
            options={machines.map(machine => ({
              value: machine.id.toString(),
              label: `${machine.machineId} - ${machine.machineType}`
            }))}
            placeholder={machinesLoading ? t.common.loading : machines.length > 0 ? t.farmerManagement.selectMachine : t.farmerManagement.noMachinesAvailable}
            disabled={machinesLoading}
            required
            colSpan={1}
            className="sm:max-w-[320px]"
          />

          {/* Optional Fields */}
          <FormInput
            label={t.farmerManagement.rfId}
            type="text"
            value={formData.rfId}
            onChange={(value) => setFormData({ ...formData, rfId: value })}
            placeholder={t.farmerManagement.enterRfIdOptional}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.contactNumber}
            type="tel"
            value={formData.contactNumber}
            onChange={(value) => {
              const formatted = formatPhoneInput(value);
              setFormData({ ...formData, contactNumber: formatted });
              if (fieldErrors.contactNumber) {
                setFieldErrors({ ...fieldErrors, contactNumber: '' });
              }
            }}
            onBlur={() => {
              const validationError = validatePhoneOnBlur(formData.contactNumber);
              if (validationError) {
                setFieldErrors({ ...fieldErrors, contactNumber: validationError });
              }
            }}
            error={fieldErrors.contactNumber}
            placeholder={t.farmerManagement.enterMobileNumber}
            colSpan={1}
          />
          
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => {
              setFormData({ ...formData, email: value });
              if (fieldErrors.email) {
                setFieldErrors({ ...fieldErrors, email: '' });
              }
            }}
            onBlur={() => {
              const validationError = validateEmailOnBlur(formData.email);
              if (validationError) {
                setFieldErrors({ ...fieldErrors, email: validationError });
              }
            }}
            error={fieldErrors.email}
            placeholder="Enter email address"
            colSpan={1}
          />
          
          <FormSelect
            label={t.farmerManagement.smsEnabled}
            value={formData.smsEnabled}
            onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            colSpan={1}
          />
          
          <FormSelect
            label="Email Notifications"
            value={formData.emailNotificationsEnabled}
            onChange={(value) => setFormData({ ...formData, emailNotificationsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.bonus}
            type="number"
            value={formData.bonus}
            onChange={(value) => setFormData({ ...formData, bonus: parseFloat(value) || 0 })}
            placeholder={t.farmerManagement.enterBonus}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.address}
            type="text"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder={t.farmerManagement.enterFarmerAddress}
            colSpan={2}
          />
          
          <FormInput
            label={t.farmerManagement.bankName}
            type="text"
            value={formData.bankName}
            onChange={(value) => setFormData({ ...formData, bankName: value })}
            placeholder={t.farmerManagement.enterBankName}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.bankAccountNumber}
            type="number"
            value={formData.bankAccountNumber}
            onChange={(value) => {
              // Only allow numbers
              const numericValue = value.replace(/\D/g, '');
              setFormData({ ...formData, bankAccountNumber: numericValue });
            }}
            placeholder={t.farmerManagement.enterAccountNumber}
            pattern="[0-9]*"
            inputMode="numeric"
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.ifscCode}
            type="text"
            value={formData.ifscCode}
            onChange={(value) => setFormData({ ...formData, ifscCode: value.toUpperCase() })}
            placeholder={t.farmerManagement.enterIfscCode}
            colSpan={1}
          />
          
          {/* Payment Information */}
          <div className="col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure payment methods for automated payments</p>
          </div>
          
          <FormInput
            label="Paytm Phone Number"
            type="tel"
            value={formData.paytmPhone}
            onChange={(value) => setFormData({ ...formData, paytmPhone: value })}
            placeholder="Enter Paytm registered phone"
            colSpan={1}
          />
          
          <FormSelect
            label="Enable Paytm Payments"
            value={formData.paytmEnabled}
            onChange={(value) => setFormData({ ...formData, paytmEnabled: value })}
            options={[
              { value: 'YES', label: 'Enabled' },
              { value: 'NO', label: 'Disabled' }
            ]}
            colSpan={1}
          />
          
          <FormInput
            label="UPI ID"
            type="text"
            value={formData.upiId}
            onChange={(value) => setFormData({ ...formData, upiId: value })}
            placeholder="farmer@upi"
            colSpan={1}
          />
          
          <FormInput
            label="Pending Payment Amount (₹)"
            type="number"
            value={formData.pendingPaymentAmount}
            onChange={(value) => setFormData({ ...formData, pendingPaymentAmount: parseFloat(value) || 0 })}
            placeholder="0.00"
            step="0.01"
            min="0"
            colSpan={1}
          />
          
          <FormSelect
            label={t.farmerManagement.status}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'active', label: t.farmerManagement.active },
              { value: 'inactive', label: t.farmerManagement.inactive },
              { value: 'suspended', label: t.farmerManagement.suspended },
              { value: 'maintenance', label: t.farmerManagement.maintenance }
            ]}
            colSpan={1}
          />
          
          <FormInput
            label={t.farmerManagement.notes}
            type="text"
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder={t.farmerManagement.enterNotes}
            colSpan={2}
          />
          </FormGrid>
          
          <FormActions
            onCancel={closeEditModal}
            submitText={t.farmerManagement.updateFarmer}
            isLoading={isSubmitting}
            isSubmitDisabled={
              !formData.societyId || 
              !formData.machineId || 
              !formData.farmerId || 
              !formData.farmerName ||
              Object.values(fieldErrors).some(error => error !== '')
            }
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Bulk Upload Modal */}
      <FormModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkSocietyId('');
          setSelectedFile(null);
        }}
        title="Bulk Upload Farmers"
      >
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <FormSelect
            label="Default Society"
            value={bulkSocietyId}
            onChange={(value) => setBulkSocietyId(value)}
            options={[
              ...societies.map(society => ({
                value: society.id.toString(),
                label: `${society.name} (${society.society_id})`
              }))
            ]}
            placeholder="Select Society"
            required
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>This society will be assigned to all farmers that don&apos;t have a society_id in the CSV</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-2">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Headers: ID, RF-ID, NAME, MOBILE, SMS, BONUS (minimum)</li>
              <li>Optional: ADDRESS, BANK_NAME, ACCOUNT_NUMBER, IFSC_CODE, SOCIETY_ID, MACHINE-ID</li>
              <li>SMS values: ON or OFF</li>
              <li>MACHINE-ID should be a valid machine ID (optional)</li>
              <li>All farmers must have a society - either from CSV SOCIETY_ID or the default above</li>
              <li>File should be UTF-8 encoded</li>
            </ul>
          </div>
          
          <FormActions
            onCancel={() => setShowBulkModal(false)}
            submitText="Upload Farmers"
            isLoading={isSubmitting}
            isSubmitDisabled={!selectedFile || !bulkSocietyId}
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedFarmers.size}
        itemType="farmer"
        hasFilters={statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        societies={societies}
        onUploadComplete={() => {
          fetchFarmers(); // Refresh the farmer list
          setSuccess('CSV upload completed successfully!');
        }}
      />

      {/* Column Selection Modal */}
      <ColumnSelectionModal
        isOpen={showColumnSelection}
        onClose={() => setShowColumnSelection(false)}
        onDownload={handleDownloadWithColumns}
        availableColumns={getFarmerColumns().map(col => ({
          key: col.key,
          label: col.header,
          required: ['farmerId'].includes(col.key) // Make farmer ID required
        }))}
        defaultColumns={['farmerId', 'rfId', 'farmerName', 'contactNumber', 'smsEnabled', 'bonus']}
        title="Select Columns for Farmer Download"
        isDownloading={isDownloading}
      />

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedFarmers.size}
        totalCount={farmers.length}
        onBulkDelete={() => setShowDeleteConfirm(true)}
        onBulkDownload={handleBulkDownload}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={() => {
          setSelectedFarmers(new Set());
          setSelectedSocieties(new Set());
          setSelectAll(false);
        }}
        itemType="farmer"
        showStatusUpdate={true}
        currentBulkStatus={bulkStatus}
        onBulkStatusChange={(status) => setBulkStatus(status as typeof bulkStatus)}
      />

      {/* Single Farmer Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={showSingleDeleteConfirm}
        onClose={() => {
          setShowSingleDeleteConfirm(false);
          setFarmerToDelete(null);
        }}
        onConfirm={confirmDeleteFarmer}
        itemName={farmerToDelete?.farmerId || ''}
        title="Delete Farmer"
        message="Are you sure you want to permanently delete farmer"
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: <Plus className="w-6 h-6 text-white" />,
            label: t.farmerManagement.addFarmer,
            onClick: openAddModal,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          },
          {
            icon: <Upload className="w-6 h-6 text-white" />,
            label: t.farmerManagement.uploadCSV,
            onClick: () => setShowCSVUpload(true),
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ]}
      />

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {graphMetric === 'quantity' && 'Top Collectors - Last 30 Days'}
                  {graphMetric === 'revenue' && 'Top Earners - Last 30 Days'}
                  {graphMetric === 'fat' && 'Best Fat Percentage - Last 30 Days'}
                  {graphMetric === 'snf' && 'Best SNF Percentage - Last 30 Days'}
                  {graphMetric === 'collections' && 'Most Active Farmers - Last 30 Days'}
                  {graphMetric === 'rate' && 'Best Rates - Last 30 Days'}
                </h2>
              </div>
              <button
                onClick={() => setShowGraphModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Graph Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const getLineColor = () => {
                  switch (graphMetric) {
                    case 'quantity': return '#10b981';
                    case 'revenue': return '#3b82f6';
                    case 'fat': return '#8b5cf6';
                    case 'snf': return '#f59e0b';
                    case 'collections': return '#ec4899';
                    case 'rate': return '#6366f1';
                    default: return '#6b7280';
                  }
                };

                const getYAxisLabel = () => {
                  switch (graphMetric) {
                    case 'quantity': return 'Quantity (L)';
                    case 'revenue': return 'Revenue (₹)';
                    case 'fat': return 'Fat %';
                    case 'snf': return 'SNF %';
                    case 'collections': return 'Collections';
                    case 'rate': return 'Rate (₹/L)';
                    default: return 'Value';
                  }
                };

                const CustomTooltip = ({ active, payload }: {
                  active?: boolean;
                  payload?: Array<{
                    payload: { name: string; farmerId: string; societyName: string; value: number };
                  }>;
                }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID: {data.farmerId}</p>
                        {data.societyName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.societyName}</p>
                        )}
                        <p className="font-semibold" style={{ color: getLineColor() }}>
                          {graphMetric === 'revenue' && '₹'}
                          {data.value.toFixed(2)}
                          {graphMetric === 'fat' || graphMetric === 'snf' ? '%' : ''}
                          {graphMetric === 'quantity' ? ' L' : ''}
                          {graphMetric === 'rate' ? '/L' : ''}
                        </p>
                      </div>
                    );
                  }
                  return null;
                };

                return graphData.length > 0 ? (
                  <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          tick={{ fontSize: 11 }}
                          stroke="#6b7280"
                          label={{ 
                            value: 'Farmer Name', 
                            position: 'insideBottom', 
                            offset: -5,
                            style: { fontSize: 13, fontWeight: 500, fill: '#9ca3af' }
                          }}
                        />
                        <YAxis 
                          label={{ 
                            value: getYAxisLabel(), 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fontSize: 14, fontWeight: 600 }
                          }}
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={getLineColor()} 
                          strokeWidth={3}
                          dot={{ fill: getLineColor(), r: 5 }}
                          activeDot={{ r: 7 }}
                          name={getYAxisLabel()}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No data available for the last 30 days</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrapper component with Suspense boundary for useSearchParams
const FarmerManagementWrapper = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <FarmerManagement />
    </Suspense>
  );
};

export default FarmerManagementWrapper;