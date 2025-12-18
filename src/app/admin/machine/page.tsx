'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPhoneInput, validatePhoneOnBlur, validateIndianPhone } from '@/lib/validation/phoneValidation';
import { 
  Settings, 
  MapPin,
  Phone,
  User,
  Calendar,
  Building2,
  RefreshCw,
  Wrench,
  AlertTriangle,
  Lock,
  Key,
  KeyRound,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Clock,
  Plus,
  Upload,
  Eye,
  CheckCircle,
  Droplets,
  TrendingUp,
  Award,
  BarChart3,
  Users,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  FlowerSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid, 
  FormError,
  PageHeader,
  StatusMessage,
  StatsCard,
  ItemCard,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';
import {
  BulkActionsToolbar,
  BulkDeleteConfirmModal,
  LoadingSnackbar,
  FloatingActionButton,
  ViewModeToggle,
  ManagementPageHeader,
  FilterDropdown,
  StatsGrid
} from '@/components/management';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
  societyName?: string;
  societyIdentifier?: string;
  location?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  maintenanceSchedule?: string;
  operatorName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
  isMasterMachine?: boolean;
  userPassword?: string;
  supervisorPassword?: string;
  statusU: 0 | 1;
  statusS: 0 | 1;
  createdAt: string;
  activeChartsCount?: number;
  chartDetails?: string; // Format: "channel:filename:status|||channel:filename:status"
  totalCollections30d?: number;
  totalQuantity30d?: number;
}

interface MachineFormData {
  machineId: string;
  machineType: string;
  societyId: string;
  location: string;
  installationDate: string;
  operatorName: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes: string;
  setAsMaster: boolean;
  disablePasswordInheritance: boolean;
}

interface PasswordFormData {
  userPassword: string;
  supervisorPassword: string;
  confirmUserPassword: string;
  confirmSupervisorPassword: string;
}

interface Society {
  id: number;
  name: string;
  society_id: string;
  bmc_id?: number;
}

interface MachineType {
  id: number;
  machineType: string;
}

const initialFormData: MachineFormData = {
  machineId: '',
  machineType: '',
  societyId: '',
  location: '',
  installationDate: '',
  operatorName: '',
  contactPhone: '',
  status: 'active',
  notes: '',
  setAsMaster: false,
  disablePasswordInheritance: false
};

function MachineManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { } = useLanguage();
  
  // State management
  const [machines, setMachines] = useState<Machine[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [machineTypesLoading, setMachineTypesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRateChartModal, setShowRateChartModal] = useState(false);
  const [selectedRateChart, setSelectedRateChart] = useState<{ fileName: string; channel: string; societyId: number } | null>(null);
  const [rateChartData, setRateChartData] = useState<Array<{ fat: string; snf: string; clr: string; rate: string }>>([]);
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [searchFat, setSearchFat] = useState('');
  const [searchSnf, setSearchSnf] = useState('');
  const [searchClr, setSearchClr] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState<MachineFormData>(initialFormData);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    userPassword: '',
    supervisorPassword: '',
    confirmUserPassword: '',
    confirmSupervisorPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    userPassword: '',
    confirmUserPassword: '',
    supervisorPassword: '',
    confirmSupervisorPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'suspended'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Performance stats state
  const [performanceStats, setPerformanceStats] = useState<{
    topCollector: { machine: any; totalQuantity: number } | null;
    mostTests: { machine: any; totalTests: number } | null;
    bestCleaning: { machine: any; totalCleanings: number } | null;
    mostCleaningSkip: { machine: any; totalSkips: number } | null;
    activeToday: { machine: any; collectionsToday: number } | null;
    highestUptime: { machine: any; activeDays: number } | null;
  }>({
    topCollector: null,
    mostTests: null,
    bestCleaning: null,
    mostCleaningSkip: null,
    activeToday: null,
    highestUptime: null
  });
  
  // Graph modal state
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'tests' | 'cleaning' | 'skip' | 'today' | 'uptime'>('quantity');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
    contactPhone?: string;
  }>({});

  // Folder view state
  const [expandedSocieties, setExpandedSocieties] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('folder');
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  
  // Selection state
  const [selectedMachines, setSelectedMachines] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'maintenance' | 'suspended'>('active');

  // Master machine state
  const [societyHasMaster, setSocietyHasMaster] = useState(false);
  const [existingMasterMachine, setExistingMasterMachine] = useState<string | null>(null);
  const [isFirstMachine, setIsFirstMachine] = useState(false);
  
  // Change master modal state
  const [showChangeMasterModal, setShowChangeMasterModal] = useState(false);
  const [selectedSocietyForMaster, setSelectedSocietyForMaster] = useState<number | null>(null);
  const [newMasterMachineId, setNewMasterMachineId] = useState<number | null>(null);
  const [setForAll, setSetForAll] = useState(false);
  const [isChangingMaster, setIsChangingMaster] = useState(false);
  
  // Password update for multiple machines
  const [applyPasswordsToOthers, setApplyPasswordsToOthers] = useState(false);
  const [selectedMachinesForPassword, setSelectedMachinesForPassword] = useState<Set<number>>(new Set());
  const [selectAllMachinesForPassword, setSelectAllMachinesForPassword] = useState(false);
  
  // Show password modal state
  const [showPasswordViewModal, setShowPasswordViewModal] = useState(false);
  const [adminPasswordForView, setAdminPasswordForView] = useState('');
  const [viewPasswordError, setViewPasswordError] = useState('');
  const [viewingPasswords, setViewingPasswords] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ userPassword: string | null; supervisorPassword: string | null } | null>(null);
  const [machineToShowPassword, setMachineToShowPassword] = useState<Machine | null>(null);

  // Password validation functions
  const validatePasswordFormat = (password: string) => {
    if (!password) return '';
    if (!/^\d{6}$/.test(password)) {
      return 'Password must be exactly 6 numbers';
    }
    return '';
  };

  // Parse rate chart details from concatenated string
  const parseChartDetails = (chartDetails?: string) => {
    if (!chartDetails) return { pending: [], downloaded: [] };
    
    const charts = chartDetails.split('|||');
    const pending: Array<{ channel: string; fileName: string }> = [];
    const downloaded: Array<{ channel: string; fileName: string }> = [];
    
    charts.forEach(chart => {
      const [channel, fileName, status] = chart.split(':');
      if (channel && fileName && status) {
        if (status === 'pending') {
          pending.push({ channel, fileName });
        } else if (status === 'downloaded') {
          downloaded.push({ channel, fileName });
        }
      }
    });
    
    return { pending, downloaded };
  };

  // Check master machine status for selected society
  const checkMasterMachineStatus = (societyId: string) => {
    console.log('checkMasterMachineStatus called with:', societyId);
    
    if (!societyId) {
      setSocietyHasMaster(false);
      setExistingMasterMachine(null);
      setIsFirstMachine(false);
      return;
    }

    const societyMachines = machines.filter(m => m.societyId === parseInt(societyId));
    const masterMachine = societyMachines.find(m => m.isMasterMachine);
    
    console.log('Society machines:', societyMachines.length, 'Master:', masterMachine?.machineId);
    
    setIsFirstMachine(societyMachines.length === 0);
    setSocietyHasMaster(!!masterMachine);
    setExistingMasterMachine(masterMachine ? masterMachine.machineId : null);

    // Auto-check setAsMaster if it's the first machine
    if (societyMachines.length === 0) {
      setFormData(prev => ({ ...prev, setAsMaster: true }));
    } else {
      setFormData(prev => ({ ...prev, setAsMaster: false }));
    }
  };

  // Handle click on master badge to change master
  const handleMasterBadgeClick = (societyId: number) => {
    setSelectedSocietyForMaster(societyId);
    setNewMasterMachineId(null);
    setSetForAll(false);
    setShowChangeMasterModal(true);
  };

  // Handle change master confirmation
  const handleChangeMasterConfirm = async () => {
    if (!newMasterMachineId) {
      setError('Please select a machine to set as master');
      return;
    }

    setIsChangingMaster(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      console.log('Token from localStorage:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await fetch(`/api/user/machine/${newMasterMachineId}/set-master`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ setForAll })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Master machine updated successfully');
        setShowChangeMasterModal(false);
        await fetchMachines(); // Refresh machines list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || data.message || 'Failed to update master machine');
      }
    } catch (error) {
      console.error('Error updating master machine:', error);
      setError('Failed to update master machine');
    } finally {
      setIsChangingMaster(false);
    }
  };

  // Get channel badge color
  const getChannelColor = (channel: string) => {
    switch (channel.toUpperCase()) {
      case 'COW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'BUF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'MIX': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

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
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch rate chart data');
      }
    } catch (error) {
      console.error('Error fetching rate chart data:', error);
      setError('Failed to fetch rate chart data');
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

  // Update password validation when data changes
  const updatePasswordData = (newData: Partial<PasswordFormData>) => {
    // Filter and limit input to 4 digits only
    const filteredData: Partial<PasswordFormData> = {};
    
    Object.entries(newData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Only allow digits and limit to 6 characters
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        filteredData[key as keyof PasswordFormData] = numericValue;
      }
    });
    
    const updatedData = { ...passwordData, ...filteredData };
    setPasswordData(updatedData);

    // Validate only the field being changed
    const fieldName = Object.keys(newData)[0] as keyof PasswordFormData;
    const newErrors = { ...passwordErrors };

    if (fieldName === 'userPassword') {
      const formatError = validatePasswordFormat(updatedData.userPassword);
      newErrors.userPassword = formatError;
      newErrors.confirmUserPassword = ''; // Clear confirm field error
    } else if (fieldName === 'confirmUserPassword') {
      const formatError = validatePasswordFormat(updatedData.confirmUserPassword);
      if (formatError) {
        newErrors.confirmUserPassword = formatError;
      } else if (updatedData.userPassword && updatedData.confirmUserPassword && 
                 updatedData.userPassword !== updatedData.confirmUserPassword) {
        newErrors.confirmUserPassword = 'Passwords do not match';
      } else {
        newErrors.confirmUserPassword = '';
      }
      newErrors.userPassword = ''; // Clear main field error
    } else if (fieldName === 'supervisorPassword') {
      const formatError = validatePasswordFormat(updatedData.supervisorPassword);
      newErrors.supervisorPassword = formatError;
      newErrors.confirmSupervisorPassword = ''; // Clear confirm field error
    } else if (fieldName === 'confirmSupervisorPassword') {
      const formatError = validatePasswordFormat(updatedData.confirmSupervisorPassword);
      if (formatError) {
        newErrors.confirmSupervisorPassword = formatError;
      } else if (updatedData.supervisorPassword && updatedData.confirmSupervisorPassword && 
                 updatedData.supervisorPassword !== updatedData.confirmSupervisorPassword) {
        newErrors.confirmSupervisorPassword = 'Passwords do not match';
      } else {
        newErrors.confirmSupervisorPassword = '';
      }
      newErrors.supervisorPassword = ''; // Clear main field error
    }

    setPasswordErrors(newErrors);
  };

  // Fetch machines
  const fetchPerformanceStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/machine-performance', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Performance Stats Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Performance Stats Data:', data);
        setPerformanceStats(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Performance Stats Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching performance stats:', error);
    }
  }, []);

  const fetchGraphData = useCallback(async (metric: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/machine-performance?graphData=true&metric=${metric}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphData([]);
    }
  }, []);

  const handleCardClick = (metric: 'quantity' | 'tests' | 'cleaning' | 'skip' | 'today' | 'uptime') => {
    setGraphMetric(metric);
    fetchGraphData(metric);
    setShowGraphModal(true);
  };

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/machine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Sort machines: master machines first, then by ID
        const sortedMachines = (data.data || []).sort((a: Machine, b: Machine) => {
          // Master machines come first
          if (a.isMasterMachine && !b.isMasterMachine) return -1;
          if (!a.isMasterMachine && b.isMasterMachine) return 1;
          // If both are master or both are not, sort by ID
          return a.id - b.id;
        });
        setMachines(sortedMachines);
      } else {
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch machines');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setError('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch societies for dropdown
  const fetchSocieties = useCallback(async () => {
    try {
      setSocietiesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    } finally {
      setSocietiesLoading(false);
    }
  }, []);

  // Fetch machine types from superadmin
  const fetchMachineTypes = useCallback(async () => {
    try {
      setMachineTypesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/superadmin/machines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMachineTypes(data.data.machines || []);
      }
    } catch (error) {
      console.error('Error fetching machine types:', error);
    } finally {
      setMachineTypesLoading(false);
    }
  }, []);

  // Fetch dairies
  const fetchDairies = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/dairy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDairies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    }
  }, []);

  // Fetch BMCs
  const fetchBmcs = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/bmc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBmcs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMachines();
      fetchSocieties();
      fetchMachineTypes();
      fetchDairies();
      fetchBmcs();
      fetchPerformanceStats();
    }
  }, [user, fetchMachines, fetchSocieties, fetchMachineTypes, fetchDairies, fetchBmcs, fetchPerformanceStats]);

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      setSearchQuery(customEvent.detail.query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
  }, []);

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

  // Reset machine filter when society filter changes (similar to farmer management)
  useEffect(() => {
    if (societyFilter.length > 0 && machineFilter.length > 0) {
      // Check if current machine selections are still valid for the selected societies
      const validMachineIds = machines
        .filter(m => societyFilter.includes(m.societyId?.toString() || ''))
        .map(m => m.id?.toString() || '');
      
      const filteredMachineFilter = machineFilter.filter(id => validMachineIds.includes(id));
      if (filteredMachineFilter.length !== machineFilter.length) {
        setMachineFilter(filteredMachineFilter);
      }
    }
  }, [societyFilter, machineFilter, machines]);

  // Read URL parameters and initialize filters on mount
  useEffect(() => {
    const societyId = searchParams.get('societyId');
    const societyName = searchParams.get('societyName');
    const dairyFilterParam = searchParams.get('dairyFilter');
    
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.machineId || !formData.machineId.trim()) {
      setError('Please enter a machine ID.');
      setSuccess('');
      return;
    }

    if (!formData.machineType || !formData.machineType.trim()) {
      setError('Please select a machine type.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the machine.');
      setSuccess('');
      return;
    }

    // Validate phone number if provided
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneValidation = validateIndianPhone(formData.contactPhone);
      if (!phoneValidation.isValid) {
        setFieldErrors({ ...fieldErrors, contactPhone: phoneValidation.error || 'Invalid phone number' });
        setError('Please fix the phone number error before saving.');
        setSuccess('');
        return;
      }
    }

    // Clear field errors if validation passes
    setFieldErrors({});
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData(initialFormData);
        setSuccess('Machine created successfully');
        setError('');
        fetchMachines();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to create machine';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
          if (errorMessage.toLowerCase().includes('in this society')) {
            setFieldErrors({ machineId: 'This Machine ID already exists in the selected society' });
          } else {
            setFieldErrors({ machineId: 'This Machine ID already exists' });
          }
        } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ machineType: 'This Machine type already exists for this society' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error creating machine:', error);
      setError('Error creating machine. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    // Validate required fields
    if (!formData.machineId || !formData.machineId.trim()) {
      setError('Please enter a machine ID.');
      setSuccess('');
      return;
    }

    if (!formData.machineType || !formData.machineType.trim()) {
      setError('Please select a machine type.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the machine.');
      setSuccess('');
      return;
    }

    // Validate phone number if provided
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneValidation = validateIndianPhone(formData.contactPhone);
      if (!phoneValidation.isValid) {
        setFieldErrors({ ...fieldErrors, contactPhone: phoneValidation.error || 'Invalid phone number' });
        setError('Please fix the phone number error before saving.');
        setSuccess('');
        return;
      }
    }

    // Clear field errors if validation passes
    setFieldErrors({});
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedMachine.id, ...formData })
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedMachine(null);
        setFormData(initialFormData);
        setSuccess('Machine updated successfully');
        setError('');
        fetchMachines();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update machine';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
          if (errorMessage.toLowerCase().includes('in this society')) {
            setFieldErrors({ machineId: 'This Machine ID already exists in the selected society' });
          } else {
            setFieldErrors({ machineId: 'This Machine ID already exists' });
          }
        } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ machineType: 'This Machine type already exists for this society' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      setError('Error updating machine. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMachine) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/user/machine?id=${selectedMachine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine deleted successfully!');
        await fetchMachines();
        setShowDeleteModal(false);
        setSelectedMachine(null);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError('Failed to delete machine');
    } finally {
      setIsSubmitting(false);
    }
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

  // Expand all societies
  const expandAllSocieties = () => {
    const allSocietyIds = new Set(
      machines
        .filter(m => m.societyId)
        .map(m => m.societyId as number)
    );
    setExpandedSocieties(allSocietyIds);
  };

  // Collapse all societies
  const collapseAllSocieties = () => {
    setExpandedSocieties(new Set());
  };

  // Handle individual machine selection
  const handleSelectMachine = (machineId: number) => {
    setSelectedMachines(prev => {
      const newSelected = new Set(prev);
      const isDeselecting = newSelected.has(machineId);
      
      if (isDeselecting) {
        newSelected.delete(machineId);
        
        // When deselecting a machine, uncheck selectAll
        setSelectAll(false);
        
        // Check if we should deselect the society folder
        const machine = filteredMachines.find(m => m.id === machineId);
        if (machine && machine.societyId) {
          const societyId = machine.societyId;
          const societyMachines = filteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => 
            m.id === machineId ? false : newSelected.has(m.id)
          );
          
          // If not all machines in the society are selected, deselect the society folder
          if (!allSocietyMachinesSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.delete(societyId);
              return updatedSocieties;
            });
          }
        }
      } else {
        newSelected.add(machineId);
        
        // Check if the society folder should be selected
        const machine = filteredMachines.find(m => m.id === machineId);
        if (machine && machine.societyId) {
          const societyId = machine.societyId;
          const societyMachines = filteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => 
            m.id === machineId ? true : newSelected.has(m.id)
          );
          
          // If all machines in the society are now selected, select the society folder
          if (allSocietyMachinesSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.add(societyId);
              return updatedSocieties;
            });
          }
        }
        
        // Check if all filtered machines are now selected
        const allFilteredIds = new Set(filteredMachines.map(m => m.id));
        const allSelected = Array.from(allFilteredIds).every(id => 
          id === machineId ? true : newSelected.has(id)
        );
        
        if (allSelected) {
          setSelectAll(true);
        }
      }
      
      return newSelected;
    });
  };

  // Toggle society selection with machine auto-selection
  const toggleSocietySelection = (societyId: number, machineIds: number[]) => {
    setSelectedSocieties(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(societyId)) {
        // Deselect society and all its machines
        newSelected.delete(societyId);
        setSelectedMachines(prevMachines => {
          const updatedMachines = new Set(prevMachines);
          machineIds.forEach(id => updatedMachines.delete(id));
          
          // Check if we should unset selectAll
          setSelectAll(false);
          
          return updatedMachines;
        });
      } else {
        // Select society and all its machines
        newSelected.add(societyId);
        setSelectedMachines(prevMachines => {
          const updatedMachines = new Set(prevMachines);
          machineIds.forEach(id => updatedMachines.add(id));
          
          // Check if all filtered machines are now selected
          const allFilteredIds = new Set(filteredMachines.map(m => m.id));
          const allSelected = Array.from(allFilteredIds).every(id => updatedMachines.has(id));
          if (allSelected) {
            setSelectAll(true);
          }
          
          return updatedMachines;
        });
      }
      return newSelected;
    });
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMachines(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
    } else {
      // Select only the currently filtered machines
      setSelectedMachines(new Set(filteredMachines.map(m => m.id)));
      
      // Also select all societies that have machines in the filtered list
      const machinesBySociety = filteredMachines.reduce((acc, machine) => {
        const societyId = machine.societyId || 0;
        if (!acc.includes(societyId)) {
          acc.push(societyId);
        }
        return acc;
      }, [] as number[]);
      setSelectedSocieties(new Set(machinesBySociety));
      
      setSelectAll(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMachines.size === 0) return;

    // Close the confirmation modal immediately and show LoadingSnackbar
    setShowDeleteConfirm(false);
    setIsDeletingBulk(true);
    setUpdateProgress(0);
    
    try {
      const token = localStorage.getItem('authToken');
      setUpdateProgress(10);
      
      const ids = Array.from(selectedMachines);
      setUpdateProgress(20);
      
      const response = await fetch(`/api/user/machine?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUpdateProgress(60);

      if (response.ok) {
        setUpdateProgress(80);
        await fetchMachines(); // Refresh the list
        setUpdateProgress(95);
        setSelectedMachines(new Set());
        setSelectedSocieties(new Set());
        setSelectAll(false);
        setSuccess(`Successfully deleted ${ids.length} machine(s)${(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0) ? ' from filtered results' : ''}`);
        setError('');
        setUpdateProgress(100);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete selected machines');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting machines:', error);
      setError('Error deleting selected machines');
      setSuccess('');
    } finally {
      setIsDeletingBulk(false);
      setUpdateProgress(0);
    }
  };



  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus?: string) => {
    if (selectedMachines.size === 0) return;

    const statusToUpdate = newStatus || bulkStatus;
    setIsUpdatingStatus(true);
    setUpdateProgress(0);

    try {
      // Step 1: Get token (5%)
      const token = localStorage.getItem('authToken');
      setUpdateProgress(5);
      
      // Step 2: Prepare machine IDs (10%)
      const machineIds = Array.from(selectedMachines);
      const totalMachines = machineIds.length;
      setUpdateProgress(10);
      
      console.log(`🔄 Bulk updating ${totalMachines} machines to status: ${statusToUpdate}`);
      
      // Step 3: Single bulk update API call (10% to 90%)
      setUpdateProgress(30);
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bulkStatusUpdate: true,
          machineIds: machineIds,
          status: statusToUpdate
        })
      });

      setUpdateProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update machine status');
      }

      const result = await response.json();
      const updatedCount = result.data?.updated || totalMachines;
      
      // Step 4: Refresh data (90%)
      setUpdateProgress(90);
      await fetchMachines();
      
      // Step 5: Finalize (100%)
      setUpdateProgress(100);
      setSelectedMachines(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
      
      console.log(`✅ Successfully updated ${updatedCount} machines`);
      
      setSuccess(
        `Successfully updated status to "${statusToUpdate}" for ${updatedCount} machine(s)${
          (statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0) ? ' from filtered results' : ''
        }`
      );
      setError('');

    } catch (error) {
      console.error('Error updating machine status:', error);
      setUpdateProgress(100);
      setError(error instanceof Error ? error.message : 'Error updating machine status. Please try again.');
      setSuccess('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Clear selections when filters or search change or keep only visible machines
  useEffect(() => {
    // Recalculate filtered machines
    const currentFilteredMachines = machines.filter(machine => {
      const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
      const societyMatch = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
      const searchMatch = searchQuery === '' || 
        machine.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.machineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.operatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && societyMatch && searchMatch;
    });

    if (selectedMachines.size > 0) {
      // Keep only machines that are still visible after filtering/searching
      const visibleMachineIds = new Set(currentFilteredMachines.map(m => m.id));
      const updatedSelection = new Set(
        Array.from(selectedMachines).filter(id => visibleMachineIds.has(id))
      );
      
      if (updatedSelection.size !== selectedMachines.size) {
        setSelectedMachines(updatedSelection);
        setSelectAll(false);
        
        // Update society selections based on remaining selected machines
        const visibleSocietyIds = new Set(currentFilteredMachines.map(m => m.societyId).filter(Boolean));
        const updatedSocietySelection = new Set<number>();
        
        visibleSocietyIds.forEach(societyId => {
          const societyMachines = currentFilteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => updatedSelection.has(m.id));
          if (allSocietyMachinesSelected && societyMachines.length > 0) {
            updatedSocietySelection.add(societyId as number);
          }
        });
        
        setSelectedSocieties(updatedSocietySelection);
      }
    } else {
      setSelectAll(false);
      setSelectedSocieties(new Set());
    }
  }, [statusFilter, societyFilter, searchQuery, machines, selectedMachines]);

  // Handle status change
  const handleStatusChange = async (machine: Machine, newStatus: 'active' | 'inactive' | 'maintenance' | 'suspended') => {
    setIsUpdatingStatus(true);
    setUpdateProgress(0);
    try {
      // Step 1: Get token (10%)
      setUpdateProgress(10);
      const token = localStorage.getItem('authToken');
      
      // Step 2: Prepare request (20%)
      setUpdateProgress(20);
      
      // Step 3: Build request body (30%)
      const requestBody = {
        id: machine.id,
        machineId: machine.machineId,
        machineType: machine.machineType,
        societyId: machine.societyId,
        location: machine.location,
        installationDate: machine.installationDate,
        operatorName: machine.operatorName,
        contactPhone: machine.contactPhone,
        status: newStatus,
        notes: machine.notes
      };
      setUpdateProgress(30);
      
      // Step 4: Send API request (60%)
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      setUpdateProgress(60);

      // Step 5: Process response (80%)
      setUpdateProgress(80);
      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        // Step 6: Refresh data (100%)
        await fetchMachines();
        setUpdateProgress(100);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update status';
        setUpdateProgress(100);
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateProgress(100);
      setError('Failed to update status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Utility functions
  const getPasswordStatusDisplay = (statusU: 0 | 1, statusS: 0 | 1, userPassword?: string, supervisorPassword?: string) => {
    // Check if both passwords are set (not null/empty)
    const hasUserPassword = userPassword && userPassword.trim() !== '';
    const hasSupervisorPassword = supervisorPassword && supervisorPassword.trim() !== '';
    
    // Build status messages based on what's set
    const statuses: string[] = [];
    let icon = <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    let className = 'text-red-600 dark:text-red-400';
    
    // Check user password
    if (hasUserPassword) {
      if (statusU === 1) {
        statuses.push('User');
        className = 'text-amber-600 dark:text-amber-400';
        icon = <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      } else {
        statuses.push('User ✓');
        className = 'text-green-600 dark:text-green-400';
        icon = <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      }
    }
    
    // Check supervisor password
    if (hasSupervisorPassword) {
      if (statusS === 1) {
        statuses.push('Supervisor');
        className = 'text-amber-600 dark:text-amber-400';
        icon = hasUserPassword ? <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      } else {
        statuses.push('Supervisor ✓');
        className = 'text-green-600 dark:text-green-400';
        icon = hasUserPassword ? <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      }
    }
    
    // If both are set to inject, use amber color
    if (hasUserPassword && hasSupervisorPassword && statusU === 1 && statusS === 1) {
      className = 'text-amber-600 dark:text-amber-400';
      icon = <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    // If both are injected, use green color
    else if (hasUserPassword && hasSupervisorPassword && statusU === 0 && statusS === 0) {
      className = 'text-green-600 dark:text-green-400';
      icon = <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    // If mixed statuses, use amber (waiting for injection)
    else if (hasUserPassword && hasSupervisorPassword && (statusU === 1 || statusS === 1)) {
      className = 'text-amber-600 dark:text-amber-400';
      icon = <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    
    const text = statuses.length > 0 ? statuses.join(' | ') : 'No passwords';
    
    return { icon, text, className };
  };

  // Modal management
  const openAddModal = () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    setFormData({
      ...initialFormData,
      installationDate: currentDate
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleEditClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setFormData({
      machineId: machine.machineId,
      machineType: machine.machineType,
      societyId: machine.societyId.toString(),
      location: machine.location || '',
      installationDate: machine.installationDate || '',
      operatorName: machine.operatorName || '',
      contactPhone: machine.contactPhone || '',
      status: machine.status,
      notes: machine.notes || '',
      setAsMaster: false,
      disablePasswordInheritance: false
    });
    setFieldErrors({}); // Clear field errors
    setError(''); // Clear general errors
    setShowEditForm(true);
  };

  const handleDeleteClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDeleteModal(true);
  };

  const handlePasswordSettingsClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setPasswordData({
      userPassword: '',
      supervisorPassword: '',
      confirmUserPassword: '',
      confirmSupervisorPassword: ''
    });
    setShowPasswordModal(true);
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setSelectedMachine(null);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMachine(null);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      userPassword: '',
      supervisorPassword: '',
      confirmUserPassword: '',
      confirmSupervisorPassword: ''
    });
    setPasswordErrors({
      userPassword: '',
      confirmUserPassword: '',
      supervisorPassword: '',
      confirmSupervisorPassword: ''
    });
    setError('');
    setSuccess('');
    setSelectedMachine(null);
    setApplyPasswordsToOthers(false);
    setSelectedMachinesForPassword(new Set());
    setSelectAllMachinesForPassword(false);
  };

  // Handle show password request
  const handleShowPasswordClick = (machine: Machine) => {
    setMachineToShowPassword(machine);
    setShowPasswordViewModal(true);
    setAdminPasswordForView('');
    setViewPasswordError('');
    setRevealedPasswords(null);
  };

  // Handle admin password verification and show passwords
  const handleVerifyAndShowPasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineToShowPassword || !adminPasswordForView) {
      setViewPasswordError('Please enter your admin password');
      return;
    }

    setViewingPasswords(true);
    setViewPasswordError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/machine/${machineToShowPassword.id}/show-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminPassword: adminPasswordForView
        })
      });

      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === 'Invalid admin password') {
          setViewPasswordError('Invalid admin password. Please try again.');
        } else {
          localStorage.removeItem('authToken');
          router.push('/login');
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setViewPasswordError(errorData.error || 'Failed to retrieve passwords');
        return;
      }

      const result = await response.json();
      setRevealedPasswords({
        userPassword: result.data.userPassword,
        supervisorPassword: result.data.supervisorPassword
      });
      setAdminPasswordForView(''); // Clear admin password after successful verification

    } catch (error) {
      console.error('Error retrieving passwords:', error);
      setViewPasswordError('Failed to retrieve passwords. Please try again.');
    } finally {
      setViewingPasswords(false);
    }
  };

  // Close show password modal
  const closePasswordViewModal = () => {
    setShowPasswordViewModal(false);
    setAdminPasswordForView('');
    setViewPasswordError('');
    setRevealedPasswords(null);
    setMachineToShowPassword(null);
  };


  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    // Clear previous errors
    setError('');

    // Check for live validation errors
    const hasErrors = Object.values(passwordErrors).some(error => error !== '');
    if (hasErrors) {
      setError('Please fix password validation errors before submitting');
      return;
    }

    if (!passwordData.userPassword && !passwordData.supervisorPassword) {
      setError('At least one password must be provided');
      return;
    }

    // Ensure passwords are confirmed when provided
    if (passwordData.userPassword && !passwordData.confirmUserPassword) {
      setError('Please confirm the user password');
      return;
    }

    if (passwordData.userPassword && passwordData.confirmUserPassword && 
        passwordData.userPassword !== passwordData.confirmUserPassword) {
      setError('User passwords do not match');
      return;
    }

    if (passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) {
      setError('Please confirm the supervisor password');
      return;
    }

    if (passwordData.supervisorPassword && passwordData.confirmSupervisorPassword && 
        passwordData.supervisorPassword !== passwordData.confirmSupervisorPassword) {
      setError('Supervisor passwords do not match');
      return;
    }

    // Validate password format (must be 6 digits)
    if (passwordData.userPassword) {
      const userPwdError = validatePasswordFormat(passwordData.userPassword);
      if (userPwdError) {
        setError(`User password: ${userPwdError}`);
        return;
      }
    }

    if (passwordData.supervisorPassword) {
      const supervisorPwdError = validatePasswordFormat(passwordData.supervisorPassword);
      if (supervisorPwdError) {
        setError(`Supervisor password: ${supervisorPwdError}`);
        return;
      }
    }

    // Check if applying to others and validate selection
    if (applyPasswordsToOthers && selectedMachinesForPassword.size === 0) {
      setError('Please select at least one machine to apply passwords to');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Update the master machine first
      const response = await fetch(`/api/user/machine/${selectedMachine.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userPassword: passwordData.userPassword || null,
          supervisorPassword: passwordData.supervisorPassword || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update passwords';
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // If applying to other machines, update them as well
      if (applyPasswordsToOthers && selectedMachinesForPassword.size > 0) {
        const updatePromises = Array.from(selectedMachinesForPassword).map(async (machineId) => {
          const updateResponse = await fetch(`/api/user/machine/${machineId}/password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userPassword: passwordData.userPassword || null,
              supervisorPassword: passwordData.supervisorPassword || null,
            }),
          });
          return updateResponse.ok;
        });

        await Promise.all(updatePromises);
        setSuccess(`Passwords updated for master machine and ${selectedMachinesForPassword.size} other machine(s)!`);
      } else {
        setSuccess('Machine passwords updated successfully!');
      }

      await fetchMachines();
      closePasswordModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating passwords:', error);
      setError('Failed to update passwords. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter machines with multi-field search
  const filteredMachines = machines.filter(machine => {
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    
    // Get society's BMC and dairy
    const machineSociety = societies.find(s => s.id === machine.societyId);
    const machineBmc = machineSociety?.bmc_id ? bmcs.find(b => b.id === machineSociety.bmc_id) : null;
    const machineDairy = machineBmc?.dairyFarmId ? dairies.find(d => d.id === machineBmc.dairyFarmId) : null;
    
    const matchesDairy = dairyFilter.length === 0 || dairyFilter.includes(machineDairy?.id.toString() || '');
    const matchesBmc = bmcFilter.length === 0 || bmcFilter.includes(machineBmc?.id.toString() || '');
    const matchesSociety = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
    const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
    
    // Multi-field search across machine details (case-insensitive)
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = searchLower === '' || [
      machine.machineId,
      machine.machineType,
      machine.societyName,
      machine.societyIdentifier,
      machine.location,
      machine.operatorName,
      machine.contactPhone,
      machine.notes
    ].some(field => 
      field?.toString().toLowerCase().includes(searchLower)
    );
    
    return matchesStatus && matchesDairy && matchesBmc && matchesSociety && matchesMachine && matchesSearch;
  });

  // Filter societies to only show those with machines in the current filtered list
  const availableSocieties = useMemo(() => {
    // Get unique society IDs from machines based on current status, search, and machine type filters
    const machinesForSocietyFilter = machines.filter(machine => {
      const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
      const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
      
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchLower === '' || [
        machine.machineId,
        machine.machineType,
        machine.societyName,
        machine.societyIdentifier,
        machine.location,
        machine.operatorName,
        machine.contactPhone,
        machine.notes
      ].some(field => 
        field?.toString().toLowerCase().includes(searchLower)
      );
      
      return matchesStatus && matchesMachine && matchesSearch;
    });

    const societyIdsWithMachines = new Set(
      machinesForSocietyFilter
        .map(m => m.societyId)
        .filter(Boolean)
    );

    return societies.filter(society => societyIdsWithMachines.has(society.id));
  }, [machines, societies, searchQuery, statusFilter, machineFilter]);

  return (
    <>
    {/* Loading Snackbar for Status Updates - Bottom Right Corner */}
    {isUpdatingStatus && (
      <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FlowerSpinner size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Updating status...
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Please wait
            </p>
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {updateProgress}%
            </p>
          </div>
        </div>
      </div>
    )}
    
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <ManagementPageHeader
        title="Machine Management"
        subtitle="Manage dairy equipment and machinery across societies"
        icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        onRefresh={fetchMachines}
        onStatistics={() => router.push('/admin/machine/statistics')}
        hasData={filteredMachines.length > 0}
      />

        {/* Success/Error Messages */}
        <StatusMessage 
          success={success} 
          error={error}
        />

        {/* Performance Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <div 
              onClick={() => performanceStats.topCollector && handleCardClick('quantity')}
              className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 ${performanceStats.topCollector ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Top Collector (30d)</h3>
                <Droplets className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              {performanceStats.topCollector ? (
                <>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200 truncate">{performanceStats.topCollector.machine.machineId}</p>
                  <p className="text-xs text-green-700 dark:text-green-300 truncate">{performanceStats.topCollector.machine.machineType}</p>
                  {performanceStats.topCollector.machine.societyName && (
                    <p className="text-xs text-green-600 dark:text-green-400 truncate">{performanceStats.topCollector.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">{performanceStats.topCollector.totalQuantity.toFixed(2)} L</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.mostTests && handleCardClick('tests')}
              className={`bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 ${performanceStats.mostTests ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Most Tests (30d)</h3>
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              {performanceStats.mostTests ? (
                <>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200 truncate">{performanceStats.mostTests.machine.machineId}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 truncate">{performanceStats.mostTests.machine.machineType}</p>
                  {performanceStats.mostTests.machine.societyName && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 truncate">{performanceStats.mostTests.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">{performanceStats.mostTests.totalTests} Tests</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.bestCleaning && handleCardClick('cleaning')}
              className={`bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 ${performanceStats.bestCleaning ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Best Cleaning (30d)</h3>
                <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              {performanceStats.bestCleaning ? (
                <>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200 truncate">{performanceStats.bestCleaning.machine.machineId}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 truncate">{performanceStats.bestCleaning.machine.machineType}</p>
                  {performanceStats.bestCleaning.machine.societyName && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 truncate">{performanceStats.bestCleaning.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{performanceStats.bestCleaning.totalCleanings} Cleanings</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.mostCleaningSkip && handleCardClick('skip')}
              className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 ${performanceStats.mostCleaningSkip ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Most Cleaning Skip (30d)</h3>
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              {performanceStats.mostCleaningSkip ? (
                <>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200 truncate">{performanceStats.mostCleaningSkip.machine.machineId}</p>
                  <p className="text-xs text-red-700 dark:text-red-300 truncate">{performanceStats.mostCleaningSkip.machine.machineType}</p>
                  {performanceStats.mostCleaningSkip.machine.societyName && (
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">{performanceStats.mostCleaningSkip.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">{performanceStats.mostCleaningSkip.totalSkips} Skips</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.activeToday && handleCardClick('today')}
              className={`bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 ${performanceStats.activeToday ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Active Today</h3>
                <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              {performanceStats.activeToday ? (
                <>
                  <p className="text-lg font-bold text-pink-800 dark:text-pink-200 truncate">{performanceStats.activeToday.machine.machineId}</p>
                  <p className="text-xs text-pink-700 dark:text-pink-300 truncate">{performanceStats.activeToday.machine.machineType}</p>
                  {performanceStats.activeToday.machine.societyName && (
                    <p className="text-xs text-pink-600 dark:text-pink-400 truncate">{performanceStats.activeToday.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-pink-600 dark:text-pink-400 mt-1">{performanceStats.activeToday.collectionsToday} Today</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.highestUptime && handleCardClick('uptime')}
              className={`bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 ${performanceStats.highestUptime ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Highest Uptime (30d)</h3>
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {performanceStats.highestUptime ? (
                <>
                  <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 truncate">{performanceStats.highestUptime.machine.machineId}</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 truncate">{performanceStats.highestUptime.machine.machineType}</p>
                  {performanceStats.highestUptime.machine.societyName && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">{performanceStats.highestUptime.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{performanceStats.highestUptime.activeDays} Days</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
          </div>

        {/* Status Stats Cards */}
        <StatsGrid
          allItems={machines}
          filteredItems={filteredMachines}
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
          machines={machines}
          filteredCount={filteredMachines.length}
          totalCount={machines.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          icon={<Settings className="w-5 h-5" />}
          hideMainFilterButton={true}
        />

      {/* Select All and View Mode Controls */}
      {filteredMachines.length > 0 && (
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
              Select All {filteredMachines.length} {filteredMachines.length === 1 ? 'machine' : 'machines'}
              {(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) && ` (filtered)`}
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

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <FlowerSpinner size={40} />
          </div>
        ) : filteredMachines.length > 0 ? (
          viewMode === 'folder' ? (
            // Folder View - Grouped by Society
            <div className="space-y-4">
              {(() => {
                // Group machines by society
                const machinesBySociety = filteredMachines.reduce((acc, machine) => {
                  const societyId = machine.societyId || 0;
                  const societyName = machine.societyName || 'Unassigned';
                  const societyIdentifier = machine.societyIdentifier || 'N/A';
                  
                  if (!acc[societyId]) {
                    acc[societyId] = {
                      id: societyId,
                      name: societyName,
                      identifier: societyIdentifier,
                      machines: []
                    };
                  }
                  acc[societyId].machines.push(machine);
                  return acc;
                }, {} as Record<number, {id: number; name: string; identifier: string; machines: Machine[]}>);

                const societyGroups = Object.values(machinesBySociety).sort((a, b) => 
                  a.name.localeCompare(b.name)
                );

                return societyGroups.map(society => {
                  const isExpanded = expandedSocieties.has(society.id);
                  const machineCount = society.machines.length;
                  const activeCount = society.machines.filter(m => m.status === 'active').length;
                  const inactiveCount = society.machines.filter(m => m.status === 'inactive').length;
                  const maintenanceCount = society.machines.filter(m => m.status === 'maintenance').length;
                  const isSocietySelected = selectedSocieties.has(society.id);
                  const machineIds = society.machines.map(m => m.id);

                  return (
                    <div 
                      key={society.id} 
                      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors hover:z-10 ${
                        isSocietySelected 
                          ? 'border-blue-500 dark:border-blue-400' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Society Folder Header */}
                      <div className="flex items-center">
                        {/* Checkbox for selecting the entire society */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSocietySelection(society.id, machineIds);
                          }}
                          className="flex items-center justify-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSocietySelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                          />
                        </div>

                        {/* Expandable folder button */}
                        <button
                          onClick={() => toggleSocietyExpansion(society.id)}
                          className="flex-1 flex items-center justify-between p-4 pl-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                                  {maintenanceCount > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span>{maintenanceCount}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {machineCount} {machineCount === 1 ? 'machine' : 'machines'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Machines Grid - Shown when expanded */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {society.machines.map((machine) => (
                              <div key={machine.id} className="relative hover:z-20">
                              <ItemCard
                                id={machine.id}
                                name={machine.machineId}
                                identifier={machine.machineType}
                                status={machine.status}
                                icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                                showStatus={true}
                                badge={machine.isMasterMachine ? {
                                  text: 'Master',
                                  color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                                  onClick: () => handleMasterBadgeClick(society.id)
                                } : undefined}
                                selectable={true}
                                selected={selectedMachines.has(machine.id)}
                                onSelect={() => handleSelectMachine(machine.id)}
                                onPasswordSettings={() => handlePasswordSettingsClick(machine)}
                                searchQuery={searchQuery}
                                details={[
                                  ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                                  ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                                  ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                                  ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : []),
                                  // Collection Statistics (Last 30 Days)
                                  {
                                    icon: (
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      </div>
                                    ),
                                    text: (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                          {machine.totalCollections30d || 0} Collections
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">|
                                        </span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {(machine.totalQuantity30d || 0).toFixed(2)} L
                                        </span>
                                      </div>
                                    ),
                                    className: 'text-blue-600 dark:text-blue-400'
                                  },
                                  // Rate Chart Information
                                  ...(() => {
                                    const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                                    const details: Array<{ icon: React.ReactElement; text: string | React.ReactElement; className?: string }> = [];
                                    
                                    if (pending.length > 0) {
                                      details.push({
                                        icon: (
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                                          </div>
                                        ),
                                        text: (
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Ready:</span>
                                            {pending.map((chart, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => handleViewRateChart(chart.fileName, chart.channel, machine.societyId)}
                                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`}
                                              >
                                                {chart.channel}
                                              </button>
                                            ))}
                                          </div>
                                        ),
                                        className: 'text-amber-600 dark:text-amber-400'
                                      });
                                    }
                                    
                                    if (downloaded.length > 0) {
                                      details.push({
                                        icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                                        text: (
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-xs font-medium">Downloaded:</span>
                                            {downloaded.map((chart, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => handleViewRateChart(chart.fileName, chart.channel, machine.societyId)}
                                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`}
                                              >
                                                {chart.channel}
                                              </button>
                                            ))}
                                          </div>
                                        ),
                                        className: 'text-green-600 dark:text-green-400'
                                      });
                                    }
                                    
                                    return details;
                                  })(),
                                  // Password Status Display
                                  (() => {
                                    const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS, machine.userPassword, machine.supervisorPassword);
                                    const hasAnyPassword = (machine.userPassword && machine.userPassword.trim() !== '') || (machine.supervisorPassword && machine.supervisorPassword.trim() !== '');
                                    return { 
                                      icon: passwordDisplay.icon, 
                                      text: hasAnyPassword ? (
                                        <div className="flex items-center gap-2">
                                          <span>{passwordDisplay.text}</span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShowPasswordClick(machine);
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                          >
                                            <Eye className="w-3 h-3" />
                                            Show
                                          </button>
                                        </div>
                                      ) : passwordDisplay.text,
                                      className: passwordDisplay.className
                                    };
                                  })()
                                ]}
                                onEdit={() => handleEditClick(machine)}
                                onDelete={() => handleDeleteClick(machine)}
                                onView={() => router.push(`/admin/machine/${machine.id}`)}
                                onStatusChange={(status) => handleStatusChange(machine, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                                viewText="View"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredMachines.map((machine) => (
                <ItemCard
                  key={machine.id}
                  id={machine.id}
                  name={machine.machineId}
                  identifier={machine.machineType}
                  status={machine.status}
                  icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                  showStatus={true}
                  badge={machine.isMasterMachine ? {
                    text: 'Master',
                    color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                    onClick: () => handleMasterBadgeClick(machine.societyId)
                  } : undefined}
                  selectable={true}
                  selected={selectedMachines.has(machine.id)}
                  onSelect={() => handleSelectMachine(machine.id)}
                  onPasswordSettings={() => handlePasswordSettingsClick(machine)}
                  searchQuery={searchQuery}
                  details={[
                    ...(machine.societyName ? [{ 
                      icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                      text: machine.societyIdentifier 
                        ? `${machine.societyName} (${machine.societyIdentifier})` 
                        : machine.societyName,
                      highlight: true
                    }] : []),
                    ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                    ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                    ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                    ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : []),
                    // Collection Statistics (Last 30 Days)
                    {
                      icon: (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      ),
                      text: (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {machine.totalCollections30d || 0} Collections
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">|
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {(machine.totalQuantity30d || 0).toFixed(2)} L
                          </span>
                        </div>
                      ),
                      className: 'text-blue-600 dark:text-blue-400'
                    },
                    // Rate Chart Information
                    ...(() => {
                      const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                      const details: Array<{ icon: React.ReactElement; text: string | React.ReactElement; className?: string }> = [];
                      
                      if (pending.length > 0) {
                        details.push({
                          icon: (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                            </div>
                          ),
                          text: (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Ready:</span>
                              {pending.map((chart, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleViewRateChart(chart.fileName, chart.channel, machine.societyId)}
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`}
                                >
                                  {chart.channel}
                                </button>
                              ))}
                            </div>
                          ),
                          className: 'text-amber-600 dark:text-amber-400'
                        });
                      }
                      
                      if (downloaded.length > 0) {
                        details.push({
                          icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                          text: (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium">Downloaded:</span>
                              {downloaded.map((chart, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleViewRateChart(chart.fileName, chart.channel, machine.societyId)}
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`}
                                >
                                  {chart.channel}
                                </button>
                              ))}
                            </div>
                          ),
                          className: 'text-green-600 dark:text-green-400'
                        });
                      }
                      
                      return details;
                    })(),
                    // Password Status Display
                    (() => {
                      const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS, machine.userPassword, machine.supervisorPassword);
                      const hasAnyPassword = (machine.userPassword && machine.userPassword.trim() !== '') || (machine.supervisorPassword && machine.supervisorPassword.trim() !== '');
                      return { 
                        icon: passwordDisplay.icon, 
                        text: hasAnyPassword ? (
                          <div className="flex items-center gap-2">
                            <span>{passwordDisplay.text}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowPasswordClick(machine);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Show
                            </button>
                          </div>
                        ) : passwordDisplay.text,
                        className: passwordDisplay.className
                      };
                    })()
                  ]}
                  onEdit={() => handleEditClick(machine)}
                  onDelete={() => handleDeleteClick(machine)}
                  onView={() => router.push(`/admin/machine/${machine.id}`)}
                  onStatusChange={(status) => handleStatusChange(machine, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                  viewText="View"
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={<Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
            title="No machines found"
            message={statusFilter === 'all' 
              ? "You haven't added any machines yet. Click 'Add Machine' to get started."
              : `No machines found with status: ${statusFilter}`
            }
            actionText={statusFilter === 'all' ? 'Add Your First Machine' : undefined}
            onAction={statusFilter === 'all' ? openAddModal : undefined}
            showAction={statusFilter === 'all'}
          />
        )}
      </div>

      {/* Add Machine Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddModal}
        title="Add New Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => {
                // Allow only one letter followed by numbers
                const formatted = value
                  .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                  .replace(/^([a-zA-Z])[a-zA-Z]+/, '$1') // Keep only first letter
                  .replace(/^([a-zA-Z])(\d*).*/, '$1$2') // One letter + numbers only
                  .toUpperCase()
                  .slice(0, 10); // Max length 10 (1 letter + 9 digits)
                setFormData({ ...formData, machineId: formatted });
              }}
              placeholder="e.g., M2232, S3232"
              required
              error={fieldErrors.machineId}
              colSpan={2}
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={machineTypesLoading}
              error={fieldErrors.machineType}
            />

            <FormSelect
              label="Society"
              value={formData.societyId}
              onChange={(value) => {
                console.log('Society selected:', value, 'Type:', typeof value);
                setFormData({ ...formData, societyId: value });
                checkMasterMachineStatus(value);
              }}
              options={societies.map(society => ({ 
                value: society.id, 
                label: `${society.name} (${society.society_id})` 
              }))}
              placeholder="Select Society"
              required
              disabled={societiesLoading}
              error={fieldErrors.societyId}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                setFormData({ ...formData, contactPhone: formatted });
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  const { contactPhone: _removed, ...rest } = fieldErrors;
                  setFieldErrors(rest);
                }
              }}
              placeholder="Operator contact number"
              error={fieldErrors.contactPhone}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' | 'suspended' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />

            <FormInput
              label="Notes"
              type="text"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              colSpan={2}
            />

            {/* Master Machine Checkbox */}
            {formData.societyId !== '' && (
              <div className="sm:col-span-2">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="setAsMaster"
                      checked={formData.setAsMaster}
                      onChange={(e) => setFormData({ ...formData, setAsMaster: e.target.checked })}
                      disabled={isFirstMachine}
                      className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <label htmlFor="setAsMaster" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                        Set as Master Machine
                      </label>
                      {isFirstMachine ? (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          This is the first machine for this society and will automatically be set as master
                        </p>
                      ) : societyHasMaster && formData.setAsMaster ? (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 font-medium">
                          ⚠️ Warning: This will replace the current master machine ({existingMasterMachine}) with this one
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Master machine passwords will be inherited by all machines in this society
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Inheritance Info */}
            {formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Password Inheritance Enabled
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        This machine will automatically inherit user and supervisor passwords from the master machine (<strong>{existingMasterMachine}</strong>). 
                        The passwords will be set when the machine is created, and you can update them later if needed.
                      </p>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <strong>Note:</strong> Password status (enabled/disabled) will also be inherited from the master machine.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disable Password Inheritance Checkbox */}
            {formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="disablePasswordInheritance"
                    checked={formData.disablePasswordInheritance}
                    onChange={(e) => setFormData({ ...formData, disablePasswordInheritance: e.target.checked })}
                    className="mt-1 w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="disablePasswordInheritance" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Do not inherit passwords from master machine
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Check this if you want to set passwords manually later instead of using the master machine's passwords
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* No Master Machine Warning */}
            {formData.societyId !== '' && !formData.setAsMaster && !societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        No Master Machine Found
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        This society has machines but no master machine is designated. Passwords will not be inherited automatically. 
                        Consider setting this machine as master or designate an existing machine as master first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeAddModal}
            submitText="Add Machine"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.machineId || !formData.machineType || !formData.societyId}
          />
        </form>
      </FormModal>

      {/* Edit Machine Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedMachine}
        onClose={closeEditModal}
        title="Edit Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => setFormData({ ...formData, machineId: value })}
              placeholder="e.g., M2232, S3232"
              required
              error={fieldErrors.machineId}
              colSpan={2}
              readOnly
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={true}
              error={fieldErrors.machineType}
            />

            <FormSelect
              label="Society"
              value={formData.societyId}
              onChange={(value) => setFormData({ ...formData, societyId: value })}
              options={societies.map(society => ({ 
                value: society.id, 
                label: `${society.name} (${society.society_id})` 
              }))}
              placeholder="Select Society"
              required
              disabled={true}
              error={fieldErrors.societyId}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                setFormData({ ...formData, contactPhone: formatted });
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  const { contactPhone: _removed, ...rest } = fieldErrors;
                  setFieldErrors(rest);
                }
              }}
              placeholder="Operator contact number"
              error={fieldErrors.contactPhone}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' | 'suspended' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />

            <FormInput
              label="Notes"
              type="text"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              colSpan={2}
            />
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeEditModal}
            submitText="Update Machine"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.machineId || !formData.machineType || !formData.societyId}
          />
        </form>
      </FormModal>

      {/* Password Settings Modal */}
      <FormModal
        isOpen={showPasswordModal && !!selectedMachine}
        onClose={closePasswordModal}
        title={`Password Settings - ${selectedMachine?.machineId || ''}`}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="User Password (6 digits)"
              type="password"
              value={passwordData.userPassword}
              onChange={(value) => updatePasswordData({ userPassword: value })}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.userPassword}
              colSpan={2}
            />
            
            <FormInput
              label="Confirm User Password"
              type="password"
              value={passwordData.confirmUserPassword}
              onChange={(value) => updatePasswordData({ confirmUserPassword: value })}
              placeholder="Re-enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.confirmUserPassword}
              colSpan={2}
            />

            <FormInput
              label="Supervisor Password (6 digits)"
              type="password"
              value={passwordData.supervisorPassword}
              onChange={(value) => updatePasswordData({ supervisorPassword: value })}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.supervisorPassword}
              colSpan={2}
            />
            
            <FormInput
              label="Confirm Supervisor Password"
              type="password"
              value={passwordData.confirmSupervisorPassword}
              onChange={(value) => updatePasswordData({ confirmSupervisorPassword: value })}
              placeholder="Re-enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.confirmSupervisorPassword}
              colSpan={2}
            />
          </FormGrid>

          {/* Apply to Other Machines Section - Only show for master machines */}
          {selectedMachine?.isMasterMachine && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="applyPasswordsToOthers"
                  checked={applyPasswordsToOthers}
                  onChange={(e) => {
                    setApplyPasswordsToOthers(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedMachinesForPassword(new Set());
                      setSelectAllMachinesForPassword(false);
                    }
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="applyPasswordsToOthers" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Apply these passwords to other machines in this society
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Select machines below to update their passwords with the same values
                  </p>
                </div>
              </div>

              {/* Machine Selection - Show when checkbox is checked */}
              {applyPasswordsToOthers && selectedMachine && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Machines ({selectedMachinesForPassword.size} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const societyMachines = machines.filter(
                          m => m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id
                        );
                        if (selectAllMachinesForPassword) {
                          setSelectedMachinesForPassword(new Set());
                          setSelectAllMachinesForPassword(false);
                        } else {
                          setSelectedMachinesForPassword(new Set(societyMachines.map(m => m.id)));
                          setSelectAllMachinesForPassword(true);
                        }
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectAllMachinesForPassword ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {machines
                      .filter(m => m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id)
                      .map(machine => (
                        <label
                          key={machine.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMachinesForPassword.has(machine.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedMachinesForPassword);
                              if (e.target.checked) {
                                newSelected.add(machine.id);
                              } else {
                                newSelected.delete(machine.id);
                                setSelectAllMachinesForPassword(false);
                              }
                              setSelectedMachinesForPassword(newSelected);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {machine.machineId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {machine.machineType}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                  
                  {machines.filter(m => m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No other machines in this society
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <FormError error={error} />

          <FormActions
            onCancel={closePasswordModal}
            submitText="Update Passwords"
            isLoading={isSubmitting}
            isSubmitDisabled={
              isSubmitting || 
              Object.values(passwordErrors).some(error => error !== '') ||
              (!passwordData.userPassword && !passwordData.supervisorPassword) ||
              // Disable if password is entered but not confirmed
              !!(passwordData.userPassword && !passwordData.confirmUserPassword) ||
              !!(passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) ||
              // Disable if confirmation is entered but password is not
              !!(!passwordData.userPassword && passwordData.confirmUserPassword) ||
              !!(!passwordData.supervisorPassword && passwordData.confirmSupervisorPassword)
            }
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedMachine}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Machine"
        itemName={selectedMachine?.machineId || ''}
        message="Are you sure you want to permanently delete machine"
      />

      {/* Rate Chart View Modal */}
      <FormModal
        isOpen={showRateChartModal && !!selectedRateChart}
        onClose={closeRateChartModal}
        title={`Rate Chart - ${selectedRateChart?.channel || ''} Channel`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Chart Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">File Name</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedRateChart?.fileName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChannelColor(selectedRateChart?.channel || '')}`}>
                {selectedRateChart?.channel}
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
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

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={closeRateChartModal}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </FormModal>

      {/* Change Master Machine Modal */}
      <FormModal
        isOpen={showChangeMasterModal}
        onClose={() => setShowChangeMasterModal(false)}
        title="Change Master Machine"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  About Master Machine
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  The master machine's passwords are inherited by all other machines in the society. 
                  Changing the master will update which machine's passwords are used as the default for new machines.
                </p>
              </div>
            </div>
          </div>

          {selectedSocietyForMaster && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select New Master Machine <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMasterMachineId || ''}
                  onChange={(e) => setNewMasterMachineId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a machine</option>
                  {machines
                    .filter(m => m.societyId === selectedSocietyForMaster)
                    .map(machine => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machineId} - {machine.machineType}
                        {machine.isMasterMachine ? ' (Current Master)' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <input
                  type="checkbox"
                  id="setForAllMachines"
                  checked={setForAll}
                  onChange={(e) => setSetForAll(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="setForAllMachines" className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer">
                    Apply master's passwords to all machines in society
                  </label>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    If checked, all machines in this society will be updated with the new master machine's passwords immediately.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowChangeMasterModal(false)}
              disabled={isChangingMaster}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeMasterConfirm}
              disabled={isChangingMaster || !newMasterMachineId}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChangingMaster ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Changing...
                </>
              ) : (
                'Change Master'
              )}
            </button>
          </div>
        </div>
      </FormModal>

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={showDeleteConfirm}
        itemCount={selectedMachines.size}
        itemType="machine"
        onConfirm={handleBulkDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedMachines.size}
        totalCount={machines.length}
        onBulkDelete={() => setShowDeleteConfirm(true)}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={() => {
          setSelectedMachines(new Set());
          setSelectedSocieties(new Set());
          setSelectAll(false);
        }}
        itemType="machine"
        showStatusUpdate={true}
        currentBulkStatus={bulkStatus}
        onBulkStatusChange={(status) => setBulkStatus(status as typeof bulkStatus)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: <Plus className="w-6 h-6 text-white" />,
            label: 'Add Machine',
            onClick: openAddModal,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ]}
        directClick={true}
      />

      {/* Show Password Modal */}
      <FormModal
        isOpen={showPasswordViewModal && !!machineToShowPassword}
        onClose={closePasswordViewModal}
        title={`View Passwords - ${machineToShowPassword?.machineId || ''}`}
      >
        {!revealedPasswords ? (
          <form onSubmit={handleVerifyAndShowPasswords} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Security Verification Required
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Enter your admin password to view machine passwords. This action will be logged for security purposes.
                  </p>
                </div>
              </div>
            </div>

            <FormInput
              label="Admin Password"
              type="password"
              value={adminPasswordForView}
              onChange={(value) => setAdminPasswordForView(value)}
              placeholder="Enter your admin password"
              error={viewPasswordError}
              required
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closePasswordViewModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={viewingPasswords || !adminPasswordForView}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {viewingPasswords ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    View Passwords
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Passwords Retrieved Successfully
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Machine passwords for {machineToShowPassword?.machineId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    User Password
                  </label>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {revealedPasswords.userPassword || 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Supervisor Password
                  </label>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {revealedPasswords.supervisorPassword || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closePasswordViewModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGraphModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {graphMetric === 'quantity' && 'Top 20 Machines by Quantity (Last 30 Days)'}
                {graphMetric === 'tests' && 'Top 20 Machines by Total Tests (Last 30 Days)'}
                {graphMetric === 'cleaning' && 'Top 20 Machines by Cleaning Count (Last 30 Days)'}
                {graphMetric === 'skip' && 'Top 20 Machines by Cleaning Skip Count (Last 30 Days)'}
                {graphMetric === 'today' && 'Most Active Machines Today'}
                {graphMetric === 'uptime' && 'Top 20 Machines by Uptime Days (Last 30 Days)'}
              </h2>
              <button onClick={() => setShowGraphModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.machine.machineId}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{data.machine.machineType}</p>
                            {data.machine.societyName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{data.machine.societyName}</p>
                            )}
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                              {graphMetric === 'quantity' && `${data.value.toFixed(2)} L`}
                              {graphMetric === 'tests' && `${data.value} Tests`}
                              {graphMetric === 'cleaning' && `${data.value} Cleanings`}
                              {graphMetric === 'skip' && `${data.value} Skips`}
                              {graphMetric === 'today' && `${data.value} Collections Today`}
                              {graphMetric === 'uptime' && `${data.value} Days Active`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
function MachineManagementWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <MachineManagement />
    </Suspense>
  );
}

export default MachineManagementWrapper;
