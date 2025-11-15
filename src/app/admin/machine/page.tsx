'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Clock
} from 'lucide-react';
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
  userPassword?: string;
  supervisorPassword?: string;
  statusU: 0 | 1;
  statusS: 0 | 1;
  createdAt: string;
  activeChartsCount?: number;
  chartDetails?: string; // Format: "channel:filename:status|||channel:filename:status"
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
  notes: ''
};

export default function MachineManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { } = useLanguage();
  
  // State management
  const [machines, setMachines] = useState<Machine[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
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
  const [societyFilter, setSocietyFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
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
        setMachines(data.data || []);
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

  useEffect(() => {
    if (user) {
      fetchMachines();
      fetchSocieties();
      fetchMachineTypes();
    }
  }, [user, fetchMachines, fetchSocieties, fetchMachineTypes]);

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
    if (societyFilter !== 'all' && machineFilter !== 'all') {
      // Check if current machine selection is still valid for the selected society
      const currentMachine = machines.find(m => m.id?.toString() === machineFilter);
      if (currentMachine && currentMachine.societyId?.toString() !== societyFilter) {
        setMachineFilter('all');
      }
    }
  }, [societyFilter, machineFilter, machines]);

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

  // Clear selections when filters or search change or keep only visible machines
  useEffect(() => {
    // Recalculate filtered machines
    const currentFilteredMachines = machines.filter(machine => {
      const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
      const societyMatch = societyFilter === 'all' || machine.societyId?.toString() === societyFilter;
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
  const getPasswordStatusDisplay = (statusU: 0 | 1, statusS: 0 | 1) => {
    if (statusU === 1 && statusS === 1) {
      return { icon: <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: 'Both passwords set', className: 'text-green-600 dark:text-green-400' };
    } else if (statusU === 1 && statusS === 0) {
      return { icon: <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: 'User password only', className: 'text-yellow-600 dark:text-yellow-400' };
    } else if (statusU === 0 && statusS === 1) {
      return { icon: <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: 'Supervisor password only', className: 'text-blue-600 dark:text-blue-400' };
    } else {
      return { icon: <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: 'No passwords set', className: 'text-red-600 dark:text-red-400' };
    }
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
      notes: machine.notes || ''
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
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

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

    if (passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) {
      setError('Please confirm the supervisor password');
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

      if (response.ok) {
        setSuccess('Machine passwords updated successfully!');
        await fetchMachines();
        closePasswordModal();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update passwords';
        setError(errorMessage);
      }
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
    const matchesSociety = societyFilter === 'all' || machine.societyId?.toString() === societyFilter;
    const matchesMachine = machineFilter === 'all' || machine.id?.toString() === machineFilter;
    
    // Multi-field search across machine details
    const matchesSearch = searchQuery === '' || [
      machine.machineId,
      machine.machineType,
      machine.societyName,
      machine.societyIdentifier,
      machine.location,
      machine.operatorName,
      machine.contactPhone,
      machine.notes
    ].some(field => 
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesStatus && matchesSociety && matchesMachine && matchesSearch;
  });

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
    
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <PageHeader
        title="Machine Management"
        subtitle="Manage dairy equipment and machinery across societies"
        icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
        onRefresh={fetchMachines}
        onAdd={openAddModal}
        addButtonText="Add Machine"
      />

        {/* Success/Error Messages */}
        <StatusMessage 
          success={success} 
          error={error}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total Machines"
            value={societyFilter !== 'all' || machineFilter !== 'all' ? 
              `${filteredMachines.length}/${machines.length}` :
              machines.length
            }
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="green"
          />
          
          <StatsCard
            title="Active"
            value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
              `${filteredMachines.filter(m => m.status === 'active').length}/${machines.filter(m => m.status === 'active').length}` :
              machines.filter(m => m.status === 'active').length
            }
            icon={<Wrench className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="green"
          />

          <StatsCard
            title="Inactive"
            value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
              `${filteredMachines.filter(m => m.status === 'inactive').length}/${machines.filter(m => m.status === 'inactive').length}` :
              machines.filter(m => m.status === 'inactive').length
            }
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="red"
          />

          <StatsCard
            title="Maintenance"
            value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
              `${filteredMachines.filter(m => m.status === 'maintenance').length}/${machines.filter(m => m.status === 'maintenance').length}` :
              machines.filter(m => m.status === 'maintenance').length
            }
            icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="yellow"
          />

          <StatsCard
            title="Suspended"
            value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
              `${filteredMachines.filter(m => m.status === 'suspended').length}/${machines.filter(m => m.status === 'suspended').length}` :
              machines.filter(m => m.status === 'suspended').length
            }
            icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="yellow"
          />
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          {/* Header Info */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{`${filteredMachines.length}/${machines.length} machines`}</span>
            </div>
            {searchQuery && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs font-medium">
                <span>&ldquo;{searchQuery}&rdquo;</span>
              </div>
            )}
          </div>
          
          {/* Filters Grid - Mobile First */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Society Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                Society
              </label>
              <select
                value={societyFilter}
                onChange={(e) => setSocietyFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">All Societies</option>
                {societies.map(society => (
                  <option key={society.id} value={society.id.toString()}>
                    {society.name} ({society.society_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Machine Filter - Shows only machines from selected society */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                Machine
              </label>
              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">All Machines</option>
                {machines
                  .filter(machine => 
                    societyFilter === 'all' || 
                    machine.societyId?.toString() === societyFilter
                  )
                  .map(machine => (
                    <option key={machine.id} value={machine.id.toString()}>
                      {machine.machineId} - {machine.machineType}
                    </option>
                  ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {(statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSocietyFilter('all');
                    setMachineFilter('all');
                    setSearchQuery('');
                  }}
                  className="w-full xs:w-auto px-3 py-1.5 sm:py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle and Folder Controls */}
        {filteredMachines.length > 0 && (
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              {/* Select All Checkbox */}
              <label className="flex items-center space-x-2 cursor-pointer px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({filteredMachines.length})
                </span>
              </label>

              {/* Selected Count and Deselect All */}
              {selectedMachines.size > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                    {selectedMachines.size} selected
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMachines(new Set());
                      setSelectedSocieties(new Set());
                      setSelectAll(false);
                    }}
                    className="px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('folder')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'folder'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Folder View</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>List View</span>
                </button>
              </div>
            </div>

            {/* Folder Controls (shown only in folder view) */}
            {viewMode === 'folder' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={expandAllSocieties}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Expand All</span>
                </button>
                <button
                  onClick={collapseAllSocieties}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  <span>Collapse All</span>
                </button>
              </div>
            )}
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
                      className={`bg-white dark:bg-gray-800 rounded-lg border ${
                        isSocietySelected 
                          ? 'border-blue-500 dark:border-blue-400' 
                          : 'border-gray-200 dark:border-gray-700'
                      } overflow-hidden`}
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
                              <ItemCard
                                key={machine.id}
                                id={machine.id}
                                name={machine.machineId}
                                identifier={machine.machineType}
                                status={machine.status}
                                icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                                showStatus={true}
                                selected={selectedMachines.has(machine.id)}
                                onSelect={() => handleSelectMachine(machine.id)}
                                onPasswordSettings={() => handlePasswordSettingsClick(machine)}
                                searchQuery={searchQuery}
                                details={[
                                  ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                                  ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                                  ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                                  ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : []),
                                  // Rate Chart Information
                                  ...(() => {
                                    const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                                    const details: Array<{ icon: JSX.Element; text: string | JSX.Element; className?: string }> = [];
                                    
                                    if (pending.length > 0) {
                                      details.push({
                                        icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                                        text: (
                                          <div className="flex flex-wrap gap-1">
                                            <span className="text-xs font-medium">Pending:</span>
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
                                        )
                                      });
                                    }
                                    
                                    if (downloaded.length > 0) {
                                      details.push({
                                        icon: <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                                        text: (
                                          <div className="flex flex-wrap gap-1">
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
                                    const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS);
                                    return { 
                                      icon: passwordDisplay.icon, 
                                      text: passwordDisplay.text,
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
                    // Rate Chart Information
                    ...(() => {
                      const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                      const details: Array<{ icon: JSX.Element; text: string | JSX.Element; className?: string }> = [];
                      
                      if (pending.length > 0) {
                        details.push({
                          icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                          text: (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs font-medium">Pending:</span>
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
                          )
                        });
                      }
                      
                      if (downloaded.length > 0) {
                        details.push({
                          icon: <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                          text: (
                            <div className="flex flex-wrap gap-1">
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
                      const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS);
                      return { 
                        icon: passwordDisplay.icon, 
                        text: passwordDisplay.text,
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
              onChange={(value) => setFormData({ ...formData, machineId: value })}
              placeholder="e.g., MCH001, BMU-2024-001"
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
              onChange={(value) => setFormData({ ...formData, societyId: value })}
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
              onChange={(value) => setFormData({ ...formData, contactPhone: value })}
              placeholder="Operator contact number"
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
              placeholder="e.g., MCH001, BMU-2024-001"
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
              onChange={(value) => setFormData({ ...formData, societyId: value })}
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
              onChange={(value) => setFormData({ ...formData, contactPhone: value })}
              placeholder="Operator contact number"
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
        message="Are you sure you want to delete this machine? This action cannot be undone."
      />

      {/* Rate Chart View Modal */}
      <FormModal
        isOpen={showRateChartModal && !!selectedRateChart}
        onClose={closeRateChartModal}
        title={`Rate Chart - ${selectedRateChart?.channel || ''} Channel`}
        maxWidth="4xl"
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
              <FlowerSpinner size="lg" />
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
    </>
  );
}
