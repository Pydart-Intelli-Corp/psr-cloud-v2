'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft,
  Settings,
  MapPin,
  Phone,
  User,
  Calendar,
  Activity,
  Edit3,
  Trash2,
  Building2,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Wrench,
  Cog,
  Timer,
  Zap,
  PieChart,
  Download,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { 
  FlowerSpinner,
  LoadingSpinner,
  StatusMessage,
  EmptyState,
  ConfirmDeleteModal,
  FormModal,
  FormInput,
  FormSelect,
  FormActions,
  FormGrid,
  FormError
} from '@/components';
import LoadingButton from '@/components/loading/LoadingButton';

interface MachineDetails {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
  societyName?: string;
  location?: string;
  installationDate?: string;
  operatorName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
  isMasterMachine?: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  operationHours?: number;
  maintenanceCount?: number;
  efficiency?: number;
  lastOperationDate?: string;
  totalOperations?: number;
  averageEfficiency?: number;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    action: 'Machine operation completed',
    timestamp: '2024-11-05T09:30:00Z',
    details: 'Successful milk collection cycle - 500L processed',
    type: 'success'
  },
  {
    id: '2',
    action: 'Maintenance scheduled',
    timestamp: '2024-11-05T08:15:00Z',
    details: 'Routine maintenance scheduled for next week',
    type: 'info'
  },
  {
    id: '3',
    action: 'Performance alert',
    timestamp: '2024-11-04T16:45:00Z',
    details: 'Efficiency dropped below 85% threshold',
    type: 'warning'
  },
  {
    id: '4',
    action: 'System update',
    timestamp: '2024-11-04T14:20:00Z',
    details: 'Firmware updated to version 2.1.3',
    type: 'info'
  }
];

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

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface MachineType {
  id: number;
  machineType: string;
  description?: string;
  isActive: boolean;
}

interface MachineStatistic {
  id: number;
  machine_id: number;
  society_id: number;
  machine_type: string;
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

export default function MachineDetails() {
  const router = useRouter();
  const params = useParams();
  const machineId = params.id;
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [machine, setMachine] = useState<MachineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'statistics' | 'correction' | 'activity'>('overview');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [machineTypesLoading, setMachineTypesLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [correctionHistory, setCorrectionHistory] = useState<Array<Record<string, unknown>>>([]);
  const [statistics, setStatistics] = useState<MachineStatistic[]>([]);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
  }>({});
  const [formData, setFormData] = useState<MachineFormData>({
    machineId: '',
    machineType: '',
    societyId: '',
    location: '',
    installationDate: '',
    operatorName: '',
    contactPhone: '',
    status: 'active',
    notes: ''
  });
  
  // Correction form data
  const [correctionData, setCorrectionData] = useState({
    channel1_fat: '',
    channel1_snf: '',
    channel1_clr: '',
    channel1_temp: '',
    channel1_water: '',
    channel1_protein: '',
    channel2_fat: '',
    channel2_snf: '',
    channel2_clr: '',
    channel2_temp: '',
    channel2_water: '',
    channel2_protein: '',
    channel3_fat: '',
    channel3_snf: '',
    channel3_clr: '',
    channel3_temp: '',
    channel3_water: '',
    channel3_protein: ''
  });

  // State for machine correction data
  const [machineCorrection, setMachineCorrection] = useState<any>(null);
  const [showMachineCorrection, setShowMachineCorrection] = useState(false);
  const [machineCorrectionLoading, setMachineCorrectionLoading] = useState(false);
  const [showCorrectionDeleteModal, setShowCorrectionDeleteModal] = useState(false);
  const [selectedCorrections, setSelectedCorrections] = useState<number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // State for statistics selection and deletion
  const [showStatisticsDeleteModal, setShowStatisticsDeleteModal] = useState(false);
  const [selectedStatistics, setSelectedStatistics] = useState<number[]>([]);
  const [statisticsDeleteLoading, setStatisticsDeleteLoading] = useState(false);

  // State for master machine controls
  const [showSetMasterModal, setShowSetMasterModal] = useState(false);
  const [setForAll, setSetForAll] = useState(false);
  const [masterActionLoading, setMasterActionLoading] = useState(false);

  // State for correction propagation
  const [showCorrectionConfirmModal, setShowCorrectionConfirmModal] = useState(false);
  const [applyCorrectionsToOthers, setApplyCorrectionsToOthers] = useState(false);
  const [selectedMachinesForCorrection, setSelectedMachinesForCorrection] = useState<Set<number>>(new Set());
  const [selectAllMachinesForCorrection, setSelectAllMachinesForCorrection] = useState(false);
  const [otherMachines, setOtherMachines] = useState<Array<{id: number, machineId: string}>>([]);
  const [correctionSaveLoading, setCorrectionSaveLoading] = useState(false);

  const fetchMachineDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch real machine data from API
      const response = await fetch(`/api/user/machine?id=${machineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch machine details');
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const machineData = result.data[0];
        
        // Add additional calculated/default fields
        const enrichedMachine: MachineDetails = {
          ...machineData,
          // Set defaults for fields that might not be in the database yet
          operationHours: machineData.operationHours || 0,
          maintenanceCount: machineData.maintenanceCount || 0,
          efficiency: machineData.efficiency || 85,
          totalOperations: machineData.totalOperations || 0,
          averageEfficiency: machineData.averageEfficiency || 85,
          lastActivity: machineData.lastActivity || machineData.createdAt
        };

        setMachine(enrichedMachine);
      } else {
        setError('Machine not found');
        setMachine(null);
      }
    } catch (error) {
      console.error('Error fetching machine details:', error);
      setError('Failed to load machine details');
    } finally {
      setLoading(false);
    }
  }, [machineId, router]);

  // Fetch societies for dropdown
  const fetchSocieties = useCallback(async () => {
    try {
      setSocietiesLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSocieties(result.data);
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
      
      const response = await fetch('/api/superadmin/machines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setMachineTypes(result.data.filter((type: MachineType) => type.isActive));
      }
    } catch (error) {
      console.error('Error fetching machine types:', error);
    } finally {
      setMachineTypesLoading(false);
    }
  }, []);

  // Fetch machine statistics
  const fetchStatistics = useCallback(async () => {
    if (!machineId) return;
    
    try {
      setStatisticsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/user/machine/statistics?machineId=${machineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStatistics(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatisticsLoading(false);
    }
  }, [machineId]);

  // Load data on mount
  useEffect(() => {
    fetchMachineDetails();
    fetchSocieties();
    fetchMachineTypes();
  }, [fetchMachineDetails, fetchSocieties, fetchMachineTypes]);

  // Fetch statistics when statistics tab is active
  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, fetchStatistics]);

  // Open edit modal
  const handleEditClick = () => {
    if (!machine) return;
    
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
    setFieldErrors({});
    setError('');
    setShowEditForm(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditForm(false);
    setFieldErrors({});
    setError('');
  };

  // Update machine
  const handleUpdateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: machine.id,
          ...formData
        })
      });

      if (response.ok) {
        setSuccess('Machine updated successfully!');
        setShowEditForm(false);
        await fetchMachineDetails();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update machine');
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      setError('Failed to update machine');
    } finally {
      setFormLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Delete machine
  const handleConfirmDelete = async () => {
    if (!machine) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine?id=${machine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Machine deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to machine list after successful deletion
        setTimeout(() => {
          router.push('/admin/machine');
        }, 1000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError('Failed to delete machine');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof MachineFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch existing correction data
  const fetchCorrectionData = useCallback(async () => {
    if (!machine) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `/api/user/machine-correction?machineId=${machine.id}&societyId=${machine.societyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const data = result.data;
        
        // Store history if available
        if (result.history) {
          setCorrectionHistory(result.history);
        }
        
        // Convert database values to strings for form display
        // Convert 0 or null to empty string for better UX
        setCorrectionData({
          channel1_fat: data.channel1_fat ? String(data.channel1_fat) : '',
          channel1_snf: data.channel1_snf ? String(data.channel1_snf) : '',
          channel1_clr: data.channel1_clr ? String(data.channel1_clr) : '',
          channel1_temp: data.channel1_temp ? String(data.channel1_temp) : '',
          channel1_water: data.channel1_water ? String(data.channel1_water) : '',
          channel1_protein: data.channel1_protein ? String(data.channel1_protein) : '',
          channel2_fat: data.channel2_fat ? String(data.channel2_fat) : '',
          channel2_snf: data.channel2_snf ? String(data.channel2_snf) : '',
          channel2_clr: data.channel2_clr ? String(data.channel2_clr) : '',
          channel2_temp: data.channel2_temp ? String(data.channel2_temp) : '',
          channel2_water: data.channel2_water ? String(data.channel2_water) : '',
          channel2_protein: data.channel2_protein ? String(data.channel2_protein) : '',
          channel3_fat: data.channel3_fat ? String(data.channel3_fat) : '',
          channel3_snf: data.channel3_snf ? String(data.channel3_snf) : '',
          channel3_clr: data.channel3_clr ? String(data.channel3_clr) : '',
          channel3_temp: data.channel3_temp ? String(data.channel3_temp) : '',
          channel3_water: data.channel3_water ? String(data.channel3_water) : '',
          channel3_protein: data.channel3_protein ? String(data.channel3_protein) : ''
        });
      }
    } catch (error) {
      console.error('Error fetching correction data:', error);
    }
  }, [machine]);

  // Fetch machine correction data (from ESP32 device)
  const fetchMachineCorrection = async () => {
    if (!machine) return;

    try {
      setMachineCorrectionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `/api/user/machine/correction/${machine.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          setMachineCorrection(result.data);
          setShowMachineCorrection(true);
          setSuccess(`Loaded ${result.data.length} correction records from machine`);
        } else {
          // No data found - set all correction values to 0.00
          setCorrectionData({
            channel1_fat: '0.00',
            channel1_snf: '0.00',
            channel1_clr: '0.00',
            channel1_temp: '0.00',
            channel1_water: '0.00',
            channel1_protein: '0.00',
            channel2_fat: '0.00',
            channel2_snf: '0.00',
            channel2_clr: '0.00',
            channel2_temp: '0.00',
            channel2_water: '0.00',
            channel2_protein: '0.00',
            channel3_fat: '0.00',
            channel3_snf: '0.00',
            channel3_clr: '0.00',
            channel3_temp: '0.00',
            channel3_water: '0.00',
            channel3_protein: '0.00'
          });
          setMachineCorrection(null);
          setShowMachineCorrection(false);
          setSuccess('No correction data found - all values set to 0.00');
        }
      } else {
        setError(result.error || 'Failed to fetch machine correction data');
      }
    } catch (error) {
      console.error('Error fetching machine correction:', error);
      setError('Failed to fetch machine correction data');
    } finally {
      setMachineCorrectionLoading(false);
    }
  };

  // Selection handlers for machine corrections
  const handleSelectAll = () => {
    if (selectedCorrections.length === machineCorrection.length) {
      setSelectedCorrections([]);
    } else {
      setSelectedCorrections(machineCorrection.map((c: any) => c.id));
    }
  };

  const handleSelectCorrection = (id: number) => {
    setSelectedCorrections(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedCorrections.length > 0) {
      setShowCorrectionDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!machine || selectedCorrections.length === 0) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('authToken');

      const url = `/api/user/machine/correction/${machine.id}`;
      const params = new URLSearchParams();
      params.append('ids', selectedCorrections.join(','));

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || `${selectedCorrections.length} correction record(s) deleted successfully`);
        setShowCorrectionDeleteModal(false);
        setSelectedCorrections([]);
        // Refresh the correction data
        await fetchMachineCorrection();
      } else {
        setError(result.error || 'Failed to delete correction data');
      }
    } catch (error) {
      console.error('Error deleting correction data:', error);
      setError('Failed to delete correction data');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Statistics selection handlers
  const handleSelectAllStatistics = () => {
    if (selectedStatistics.length === statistics.length) {
      setSelectedStatistics([]);
    } else {
      setSelectedStatistics(statistics.map((s: MachineStatistic) => s.id));
    }
  };

  const handleSelectStatistic = (id: number) => {
    setSelectedStatistics(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedStatistics = () => {
    if (selectedStatistics.length > 0) {
      setShowStatisticsDeleteModal(true);
    }
  };

  const confirmDeleteStatistics = async () => {
    if (!machine || selectedStatistics.length === 0) return;

    try {
      setStatisticsDeleteLoading(true);
      const token = localStorage.getItem('authToken');

      const url = `/api/user/machine/statistics`;
      const params = new URLSearchParams();
      params.append('machineId', machine.id.toString());
      params.append('ids', selectedStatistics.join(','));

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || `${selectedStatistics.length} statistics record(s) deleted successfully`);
        setShowStatisticsDeleteModal(false);
        setSelectedStatistics([]);
        // Refresh the statistics data
        await fetchStatistics();
      } else {
        setError(result.error || 'Failed to delete statistics data');
      }
    } catch (error) {
      console.error('Error deleting statistics data:', error);
      setError('Failed to delete statistics data');
    } finally {
      setStatisticsDeleteLoading(false);
    }
  };

  // Load history item into form
  const loadHistoryItem = (historyData: Record<string, unknown>) => {
    setCorrectionData({
      channel1_fat: historyData.channel1_fat ? String(historyData.channel1_fat) : '',
      channel1_snf: historyData.channel1_snf ? String(historyData.channel1_snf) : '',
      channel1_clr: historyData.channel1_clr ? String(historyData.channel1_clr) : '',
      channel1_temp: historyData.channel1_temp ? String(historyData.channel1_temp) : '',
      channel1_water: historyData.channel1_water ? String(historyData.channel1_water) : '',
      channel1_protein: historyData.channel1_protein ? String(historyData.channel1_protein) : '',
      channel2_fat: historyData.channel2_fat ? String(historyData.channel2_fat) : '',
      channel2_snf: historyData.channel2_snf ? String(historyData.channel2_snf) : '',
      channel2_clr: historyData.channel2_clr ? String(historyData.channel2_clr) : '',
      channel2_temp: historyData.channel2_temp ? String(historyData.channel2_temp) : '',
      channel2_water: historyData.channel2_water ? String(historyData.channel2_water) : '',
      channel2_protein: historyData.channel2_protein ? String(historyData.channel2_protein) : '',
      channel3_fat: historyData.channel3_fat ? String(historyData.channel3_fat) : '',
      channel3_snf: historyData.channel3_snf ? String(historyData.channel3_snf) : '',
      channel3_clr: historyData.channel3_clr ? String(historyData.channel3_clr) : '',
      channel3_temp: historyData.channel3_temp ? String(historyData.channel3_temp) : '',
      channel3_water: historyData.channel3_water ? String(historyData.channel3_water) : '',
      channel3_protein: historyData.channel3_protein ? String(historyData.channel3_protein) : ''
    });
    setShowHistoryModal(false);
    setSuccess('History data loaded into form');
  };

  // Handle correction input changes
  const handleCorrectionChange = (field: string, value: string) => {
    // Allow empty string, positive and negative numbers with up to 2 decimal places
    if (value === '' || /^-?\d*\.?\d{0,2}$/.test(value)) {
      setCorrectionData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Fetch other machines in the same society (excluding current machine)
  const fetchOtherMachines = async () => {
    if (!machine) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine/by-society?societyId=${machine.societyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Filter out current machine
          const others = result.data.filter((m: any) => m.id !== machine.id);
          setOtherMachines(others.map((m: any) => ({ id: m.id, machineId: m.machineId })));
        }
      }
    } catch (error) {
      console.error('Error fetching other machines:', error);
    }
  };

  // Handle save correction button click - show confirmation modal
  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setError('');
    setSuccess('');

    // If this is a master machine, show confirmation modal with apply to others option
    if (machine.isMasterMachine) {
      await fetchOtherMachines();
      setApplyCorrectionsToOthers(false);
      setSelectedMachinesForCorrection(new Set());
      setSelectAllMachinesForCorrection(false);
      setShowCorrectionConfirmModal(true);
    } else {
      // For non-master machines, save directly
      await saveCorrectionData(false);
    }
  };

  // Actually save the correction data
  const saveCorrectionData = async (applyToOthers: boolean) => {
    if (!machine) return;

    setCorrectionSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Convert empty strings to "0" before sending
      const dataToSend = {
        machineId: machine.id,
        societyId: machine.societyId,
        channel1_fat: correctionData.channel1_fat || '0',
        channel1_snf: correctionData.channel1_snf || '0',
        channel1_clr: correctionData.channel1_clr || '0',
        channel1_temp: correctionData.channel1_temp || '0',
        channel1_water: correctionData.channel1_water || '0',
        channel1_protein: correctionData.channel1_protein || '0',
        channel2_fat: correctionData.channel2_fat || '0',
        channel2_snf: correctionData.channel2_snf || '0',
        channel2_clr: correctionData.channel2_clr || '0',
        channel2_temp: correctionData.channel2_temp || '0',
        channel2_water: correctionData.channel2_water || '0',
        channel2_protein: correctionData.channel2_protein || '0',
        channel3_fat: correctionData.channel3_fat || '0',
        channel3_snf: correctionData.channel3_snf || '0',
        channel3_clr: correctionData.channel3_clr || '0',
        channel3_temp: correctionData.channel3_temp || '0',
        channel3_water: correctionData.channel3_water || '0',
        channel3_protein: correctionData.channel3_protein || '0'
      };
      
      const response = await fetch('/api/user/machine-correction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        let successMessage = 'Correction data saved successfully!';
        let updatedCount = 0;

        // If master machine and apply to others is enabled
        if (applyToOthers && selectedMachinesForCorrection.size > 0) {
          const machineIds = Array.from(selectedMachinesForCorrection);
          
          // Apply corrections to selected machines in parallel
          const updatePromises = machineIds.map(async (machineId) => {
            try {
              const updateResponse = await fetch('/api/user/machine-correction', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...dataToSend,
                  machineId: machineId
                })
              });

              if (updateResponse.ok) {
                updatedCount++;
              }
            } catch (error) {
              console.error(`Error updating machine ${machineId}:`, error);
            }
          });

          await Promise.all(updatePromises);
          successMessage = `Correction data saved successfully! Applied to ${updatedCount} additional machine(s).`;
        }

        setSuccess(successMessage);
        setShowCorrectionConfirmModal(false);
        // Fetch the latest data to show what was saved
        await fetchCorrectionData();
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to save correction data');
      }
    } catch (error) {
      console.error('Error saving correction data:', error);
      setError('Failed to save correction data');
    } finally {
      setCorrectionSaveLoading(false);
    }
  };

  // Handle correction confirmation
  const handleCorrectionConfirm = async () => {
    // Validate machine selection if applying to others
    if (applyCorrectionsToOthers && selectedMachinesForCorrection.size === 0) {
      setError('Please select at least one machine to apply corrections');
      return;
    }

    await saveCorrectionData(applyCorrectionsToOthers);
  };

  // Toggle select all machines for correction
  const handleToggleSelectAllCorrection = () => {
    if (selectAllMachinesForCorrection) {
      setSelectedMachinesForCorrection(new Set());
      setSelectAllMachinesForCorrection(false);
    } else {
      setSelectedMachinesForCorrection(new Set(otherMachines.map(m => m.id)));
      setSelectAllMachinesForCorrection(true);
    }
  };

  // Toggle individual machine selection for correction
  const handleToggleMachineCorrection = (machineId: number) => {
    const newSelected = new Set(selectedMachinesForCorrection);
    if (newSelected.has(machineId)) {
      newSelected.delete(machineId);
      setSelectAllMachinesForCorrection(false);
    } else {
      newSelected.add(machineId);
      if (newSelected.size === otherMachines.length) {
        setSelectAllMachinesForCorrection(true);
      }
    }
    setSelectedMachinesForCorrection(newSelected);
  };

  // Handle set master machine
  const handleSetMasterClick = () => {
    setSetForAll(false);
    setShowSetMasterModal(true);
  };

  const handleSetMasterConfirm = async () => {
    if (!machine) return;

    setMasterActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/user/machine/${machine.id}/set-master`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setForAll })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const message = setForAll 
          ? 'Master machine set and all machines in society updated successfully!' 
          : 'Master machine set successfully!';
        setSuccess(message);
        setShowSetMasterModal(false);
        await fetchMachineDetails();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to set master machine');
      }
    } catch (error) {
      console.error('Error setting master machine:', error);
      setError('Failed to set master machine');
    } finally {
      setMasterActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'suspended': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  useEffect(() => {
    fetchMachineDetails();
    fetchSocieties();
    fetchMachineTypes();
  }, [machineId, fetchMachineDetails, fetchSocieties, fetchMachineTypes]);

  // Fetch correction data when machine is loaded
  useEffect(() => {
    if (machine) {
      fetchCorrectionData();
    }
  }, [machine, fetchCorrectionData]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Auto-dismiss success and error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Manual close handlers
  const handleCloseSuccess = () => setSuccess('');
  const handleCloseError = () => setError('');

  if (!user) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !machine) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title={`Machine Details ${t.common?.noDataAvailable || 'Not Available'}`}
        message={error || 'Machine not found'}
        actionText={`${t.common?.back || 'Back'} to Machines`}
        onAction={() => router.push('/admin/machine')}
        showAction={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pb-8">
      {/* Header - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Stack layout */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row: Back button + Title + 3-dot menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/machine')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{machine.machineId}</h1>
                    {machine.isMasterMachine && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-full border border-yellow-600 shadow-sm">
                        Master Machine
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{machine.machineType}</p>
                </div>
              </div>
              
              {/* 3-dot menu dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMenuOpen(false)}
                    />
                    
                    {/* Menu Items */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
                    >
                      <button
                        onClick={() => {
                          handleEditClick();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
                      >
                        <Edit3 className="w-4 h-4 text-green-600 dark:text-green-500" />
                        <span>{t.common?.edit || 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteClick();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
                        <span>{t.common?.delete || 'Delete'}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Row: Status */}
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(machine.status)}`}>
                {machine.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
              {[
                { id: 'overview' as const, label: t.dashboard?.overview || 'Overview', icon: Building2 },
                { id: 'analytics' as const, label: t.nav?.analytics || 'Analytics', icon: BarChart3 },
                { id: 'statistics' as const, label: 'Statistics', icon: PieChart },
                { id: 'correction' as const, label: 'Correction', icon: Settings },
                { id: 'activity' as const, label: t.dashboard?.recentActivity || 'Activity', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Responsive Padding */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Basic Information - Full width on mobile */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Machine Information</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="flex items-start gap-3">
                      <Cog className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Machine ID</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{machine.machineId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Machine Type</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{machine.machineType}</p>
                      </div>
                    </div>

                    {machine.societyName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Society</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{machine.societyName}</p>
                        </div>
                      </div>
                    )}

                    {machine.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{machine.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {machine.operatorName && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Operator</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{machine.operatorName}</p>
                        </div>
                      </div>
                    )}
                    
                    {machine.contactPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Contact</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-all">{machine.contactPhone}</p>
                        </div>
                      </div>
                    )}
                    
                    {machine.installationDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Installation Date</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{new Date(machine.installationDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.common?.createdAt || 'Created At'}</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{new Date(machine.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {machine.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{machine.notes}</p>
                    </div>
                  )}

                  {/* Master Machine Controls */}
                  {!machine.isMasterMachine && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Master Machine Settings</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Set this machine as the master for its society</p>
                        </div>
                      </div>
                      <button
                        onClick={handleSetMasterClick}
                        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        Set as Master Machine
                      </button>
                    </div>
                  )}
                </div>

                {/* Statistics Cards - Mobile: 1 column, Tablet: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Operation Hours</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{machine.operationHours || 0}h</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Total hours</p>
                      </div>
                      <Timer className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance Count</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{machine.maintenanceCount || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Total services</p>
                      </div>
                      <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{machine.efficiency || 0}%</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Current performance</p>
                      </div>
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Operations</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{machine.totalOperations || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Completed cycles</p>
                      </div>
                      <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Moved to bottom on mobile, sidebar on desktop */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4 sm:space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 rounded-lg transition-all duration-200 min-h-[44px] group">
                        <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors">
                          <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        </div>
                        <span className="ml-3 truncate">Schedule Maintenance</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg transition-all duration-200 min-h-[44px] group">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        </div>
                        <span className="ml-3 truncate">View Reports</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 rounded-lg transition-all duration-200 min-h-[44px] group">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        </div>
                        <span className="ml-3 truncate">Performance Monitor</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg transition-all duration-200 min-h-[44px] group">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        </div>
                        <span className="ml-3 truncate">Configuration</span>
                      </button>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Last Activity</h3>
                    {machine.lastActivity && (
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Activity className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">Last seen: {new Date(machine.lastActivity).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Performance Analytics</h3>
              <div className="text-center py-8 sm:py-12">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Analytics dashboard will be implemented here</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Charts, graphs, and performance metrics</p>
              </div>
            </div>
          )}

          {activeTab === 'correction' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Machine Correction Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure correction values for all three channels</p>
              </div>
              
              <form onSubmit={handleSaveCorrection} className="space-y-6">
                {/* Channel 1 - Emerald Theme */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">Channel 1</h4>
                    <span className="ml-auto px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">Primary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                      label="Fat (%)"
                      type="number"
                      value={correctionData.channel1_fat}
                      onChange={(value) => handleCorrectionChange('channel1_fat', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="SNF (%)"
                      type="number"
                      value={correctionData.channel1_snf}
                      onChange={(value) => handleCorrectionChange('channel1_snf', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="CLR"
                      type="number"
                      value={correctionData.channel1_clr}
                      onChange={(value) => handleCorrectionChange('channel1_clr', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Temp (°C)"
                      type="number"
                      value={correctionData.channel1_temp}
                      onChange={(value) => handleCorrectionChange('channel1_temp', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Water (%)"
                      type="number"
                      value={correctionData.channel1_water}
                      onChange={(value) => handleCorrectionChange('channel1_water', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Protein (%)"
                      type="number"
                      value={correctionData.channel1_protein}
                      onChange={(value) => handleCorrectionChange('channel1_protein', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Channel 2 - Green Theme */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">Channel 2</h4>
                    <span className="ml-auto px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">Secondary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                      label="Fat (%)"
                      type="number"
                      value={correctionData.channel2_fat}
                      onChange={(value) => handleCorrectionChange('channel2_fat', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="SNF (%)"
                      type="number"
                      value={correctionData.channel2_snf}
                      onChange={(value) => handleCorrectionChange('channel2_snf', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="CLR"
                      type="number"
                      value={correctionData.channel2_clr}
                      onChange={(value) => handleCorrectionChange('channel2_clr', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Temp (°C)"
                      type="number"
                      value={correctionData.channel2_temp}
                      onChange={(value) => handleCorrectionChange('channel2_temp', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Water (%)"
                      type="number"
                      value={correctionData.channel2_water}
                      onChange={(value) => handleCorrectionChange('channel2_water', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Protein (%)"
                      type="number"
                      value={correctionData.channel2_protein}
                      onChange={(value) => handleCorrectionChange('channel2_protein', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Channel 3 - Green Theme */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-green-900 dark:text-green-100">Channel 3</h4>
                    <span className="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">Tertiary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                      label="Fat (%)"
                      type="number"
                      value={correctionData.channel3_fat}
                      onChange={(value) => handleCorrectionChange('channel3_fat', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="SNF (%)"
                      type="number"
                      value={correctionData.channel3_snf}
                      onChange={(value) => handleCorrectionChange('channel3_snf', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="CLR"
                      type="number"
                      value={correctionData.channel3_clr}
                      onChange={(value) => handleCorrectionChange('channel3_clr', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Temp (°C)"
                      type="number"
                      value={correctionData.channel3_temp}
                      onChange={(value) => handleCorrectionChange('channel3_temp', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Water (%)"
                      type="number"
                      value={correctionData.channel3_water}
                      onChange={(value) => handleCorrectionChange('channel3_water', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <FormInput
                      label="Protein (%)"
                      type="number"
                      value={correctionData.channel3_protein}
                      onChange={(value) => handleCorrectionChange('channel3_protein', value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <LoadingButton
                    type="button"
                    variant="outline"
                    size="medium"
                    isLoading={machineCorrectionLoading}
                    onClick={fetchMachineCorrection}
                    className="min-h-[44px]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    From Machine
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    variant="outline"
                    size="medium"
                    isLoading={false}
                    onClick={() => setShowHistoryModal(true)}
                    disabled={correctionHistory.length === 0}
                    className="min-h-[44px]"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    History ({correctionHistory.length})
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    variant="outline"
                    size="medium"
                    isLoading={false}
                    onClick={() => setCorrectionData({
                      channel1_fat: '', channel1_snf: '', channel1_clr: '', channel1_temp: '', channel1_water: '', channel1_protein: '',
                      channel2_fat: '', channel2_snf: '', channel2_clr: '', channel2_temp: '', channel2_water: '', channel2_protein: '',
                      channel3_fat: '', channel3_snf: '', channel3_clr: '', channel3_temp: '', channel3_water: '', channel3_protein: ''
                    })}
                    className="min-h-[44px]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    variant="primary"
                    size="medium"
                    isLoading={correctionLoading}
                    loadingText="Saving Corrections..."
                    className="min-h-[44px]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Correction Data
                  </LoadingButton>
                </div>
              </form>

              {/* Machine Correction Data Table */}
              {showMachineCorrection && machineCorrection && Array.isArray(machineCorrection) && machine && (
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg sm:rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        Daily Corrections from Machine
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Machine: {machine.machineId} (ID: {machine.id}) • Society: {machine.societyName} • {machineCorrection.length} {machineCorrection.length === 1 ? 'day' : 'days'} of data
                        {selectedCorrections.length > 0 && ` • ${selectedCorrections.length} selected`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                        title={selectedCorrections.length === machineCorrection.length ? "Deselect all" : "Select all"}
                      >
                        {selectedCorrections.length === machineCorrection.length ? 'Deselect All' : 'Select All'}
                      </button>
                      {selectedCorrections.length > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center gap-1"
                          title="Delete selected records"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete ({selectedCorrections.length})
                        </button>
                      )}
                      <button
                        onClick={() => setShowMachineCorrection(false)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {machineCorrection.map((correction: any, index: number) => (
                      <div key={correction.id} className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-colors ${
                        selectedCorrections.includes(correction.id)
                          ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800'
                          : 'border-emerald-200 dark:border-emerald-700'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCorrections.includes(correction.id)}
                              onChange={() => handleSelectCorrection(correction.id)}
                              className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                            />
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              index === 0 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {index === 0 ? '🔴 Today' : correction.date}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Last updated: {new Date(correction.lastUpdated).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-emerald-200 dark:border-emerald-700">
                                <th className="text-left py-2 px-3 font-semibold text-emerald-900 dark:text-emerald-100">
                                  Parameter
                                </th>
                                <th className="text-center py-2 px-3 font-semibold text-emerald-900 dark:text-emerald-100">
                                  Channel 1 (COW)
                                </th>
                                <th className="text-center py-2 px-3 font-semibold text-emerald-900 dark:text-emerald-100">
                                  Channel 2 (BUF)
                                </th>
                                <th className="text-center py-2 px-3 font-semibold text-emerald-900 dark:text-emerald-100">
                                  Channel 3 (MIX)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800">
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">Fat (%)</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.fat || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.fat || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.fat || '-'}</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">SNF (%)</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.snf || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.snf || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.snf || '-'}</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">CLR</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.clr || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.clr || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.clr || '-'}</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">Temp (°C)</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.temp || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.temp || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.temp || '-'}</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">Water (%)</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.water || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.water || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.water || '-'}</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-medium text-emerald-900 dark:text-emerald-100">Protein (%)</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel1.protein || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel2.protein || '-'}</td>
                                <td className="py-2 px-3 text-center text-emerald-800 dark:text-emerald-200">{correction.channel3.protein || '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Machine Statistics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Operational statistics and performance metrics
                    {selectedStatistics.length > 0 && ` • ${selectedStatistics.length} selected`}
                  </p>
                </div>
                {statistics.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAllStatistics}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title={selectedStatistics.length === statistics.length ? "Deselect all" : "Select all"}
                    >
                      {selectedStatistics.length === statistics.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={fetchStatistics}
                      disabled={statisticsLoading}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh statistics"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${statisticsLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {selectedStatistics.length > 0 && (
                      <button
                        onClick={handleDeleteSelectedStatistics}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center gap-1"
                        title="Delete selected records"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete ({selectedStatistics.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {statisticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="large" />
                </div>
              ) : statistics.length === 0 ? (
                <EmptyState
                  icon={<PieChart className="w-10 h-10" />}
                  title="No Statistics Available"
                  message="No statistical data has been recorded for this machine yet."
                  showAction={false}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-12">
                          <input
                            type="checkbox"
                            checked={selectedStatistics.length === statistics.length && statistics.length > 0}
                            onChange={handleSelectAllStatistics}
                            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Time</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Total Tests</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Daily Clean</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Weekly Clean</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Skip Clean</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Gain</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Auto Channel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {statistics.map((stat) => (
                        <tr key={stat.id} className={`transition-colors ${
                          selectedStatistics.includes(stat.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStatistics.includes(stat.id)}
                              onChange={() => handleSelectStatistic(stat.id)}
                              className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                            {new Date(stat.statistics_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{stat.statistics_time}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {stat.total_test}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              {stat.daily_cleaning}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              {stat.weekly_cleaning}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              {stat.cleaning_skip}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              {stat.gain}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              stat.auto_channel === 'ENABLE' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {stat.auto_channel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Recent Activity</h3>
              <div className="space-y-3 sm:space-y-4">
                {mockActivityLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {getActivityIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">{log.action}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{log.details}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* Status Messages - Fixed Snackbar Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-md px-4 sm:px-0">
        <StatusMessage 
          success={success} 
          error={error} 
          onClose={success ? handleCloseSuccess : error ? handleCloseError : undefined}
        />
      </div>

      {/* Edit Machine Modal */}
      <AnimatePresence>
        {showEditForm && machine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditForm(false);
                setFormData({
                  machineId: '',
                  machineType: '',
                  societyId: '',
                  location: '',
                  installationDate: '',
                  operatorName: '',
                  contactPhone: '',
                  status: 'active',
                  notes: ''
                });
              }
            }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Edit {machine.machineId}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        machineId: '',
                        machineType: '',
                        societyId: '',
                        location: '',
                        installationDate: '',
                        operatorName: '',
                        contactPhone: '',
                        status: 'active',
                        notes: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 touch-target sm:min-h-0 sm:min-w-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateMachine} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Machine ID *
                    </label>
                    <input
                      type="text"
                      value={formData.machineId}
                      onChange={(e) => handleInputChange('machineId', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter machine ID"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Machine Type *
                    </label>
                    <select
                      value={formData.machineType}
                      onChange={(e) => handleInputChange('machineType', e.target.value)}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                      required
                    >
                      <option value="">Select machine type</option>
                      {machineTypes.map((type) => (
                        <option key={type.id} value={type.machineType}>
                          {type.machineType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Society *
                    </label>
                    <select
                      value={formData.societyId}
                      onChange={(e) => handleInputChange('societyId', e.target.value)}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                      required
                    >
                      <option value="">Select society</option>
                      {societies.map((society) => (
                        <option key={society.id} value={society.id.toString()}>
                          {society.name} (ID: {society.society_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter location"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="date"
                      value={formData.installationDate}
                      onChange={(e) => handleInputChange('installationDate', e.target.value)}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Operator Name
                    </label>
                    <input
                      type="text"
                      value={formData.operatorName}
                      onChange={(e) => handleInputChange('operatorName', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter operator name"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter contact phone"
                      autoComplete="off"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        machineId: '',
                        machineType: '',
                        societyId: '',
                        location: '',
                        installationDate: '',
                        operatorName: '',
                        contactPhone: '',
                        status: 'active',
                        notes: ''
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    {formLoading ? (
                      <>
                        <FlowerSpinner size={16} className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Update Machine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemName={machine?.machineId || 'this machine'}
        itemType="Machine"
      />

      {/* Edit Machine Modal */}
      <FormModal
        isOpen={showEditForm}
        onClose={closeEditModal}
        title="Edit Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateMachine} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => setFormData({ ...formData, machineId: value })}
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
            isLoading={formLoading}
            isSubmitDisabled={!formData.machineId || !formData.machineType || !formData.societyId}
          />
        </form>
      </FormModal>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Correction History</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last {correctionHistory.length} changes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* History List */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {correctionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {correctionHistory.map((item: Record<string, unknown>, index: number) => (
                      <motion.div
                        key={item.id as number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => loadHistoryItem(item)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          item.status === 1
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-md shadow-green-500/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {new Date(item.created_at as string).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          {item.status === 1 && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Channel 1</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Fat: {String(item.channel1_fat || '0')} | SNF: {String(item.channel1_snf || '0')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Channel 2</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Fat: {String(item.channel2_fat || '0')} | SNF: {String(item.channel2_snf || '0')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Channel 3</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Fat: {String(item.channel3_fat || '0')} | SNF: {String(item.channel3_snf || '0')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Statistics Modal */}
      <AnimatePresence>
        {showStatisticsDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !statisticsDeleteLoading && setShowStatisticsDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Selected Statistics
                </h3>
                <button
                  onClick={() => !statisticsDeleteLoading && setShowStatisticsDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={statisticsDeleteLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete <strong>{selectedStatistics.length}</strong> selected statistics {selectedStatistics.length === 1 ? 'record' : 'records'}? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowStatisticsDeleteModal(false)}
                  disabled={statisticsDeleteLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={confirmDeleteStatistics}
                  isLoading={statisticsDeleteLoading}
                  loadingText="Deleting..."
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Correction Confirmation Modal */}
      <AnimatePresence>
        {showCorrectionConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !correctionSaveLoading && setShowCorrectionConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Save Correction Data
                  </h3>
                  <button
                    onClick={() => !correctionSaveLoading && setShowCorrectionConfirmModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={correctionSaveLoading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Master Machine Correction
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        You are saving correction data for the master machine <strong>{machine?.machineId}</strong>. 
                        You can optionally apply these corrections to other machines in this society.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Apply to Other Machines Checkbox */}
                {otherMachines.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        id="applyCorrectionsToOthers"
                        checked={applyCorrectionsToOthers}
                        onChange={(e) => {
                          setApplyCorrectionsToOthers(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedMachinesForCorrection(new Set());
                            setSelectAllMachinesForCorrection(false);
                          }
                        }}
                        disabled={correctionSaveLoading}
                        className="mt-1 w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <label htmlFor="applyCorrectionsToOthers" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Apply these corrections to other machines
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Select which machines in this society should receive these correction values
                        </p>
                      </label>
                    </div>

                    {/* Machine Selection List */}
                    {applyCorrectionsToOthers && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                              Select Machines ({selectedMachinesForCorrection.size} selected)
                            </span>
                            <button
                              onClick={handleToggleSelectAllCorrection}
                              disabled={correctionSaveLoading}
                              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50 whitespace-nowrap px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                            >
                              {selectAllMachinesForCorrection ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {otherMachines.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                id={`machine-correction-${m.id}`}
                                checked={selectedMachinesForCorrection.has(m.id)}
                                onChange={() => handleToggleMachineCorrection(m.id)}
                                disabled={correctionSaveLoading}
                                className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                              />
                              <label
                                htmlFor={`machine-correction-${m.id}`}
                                className="flex-1 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                              >
                                {m.machineId}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {otherMachines.length === 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    No other machines found in this society
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCorrectionConfirmModal(false)}
                    disabled={correctionSaveLoading}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleCorrectionConfirm}
                    isLoading={correctionSaveLoading}
                    loadingText="Saving..."
                    variant="primary"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Save Correction Data
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set Master Machine Modal */}
      <AnimatePresence>
        {showSetMasterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !masterActionLoading && setShowSetMasterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Set as Master Machine
                </h3>
                <button
                  onClick={() => !masterActionLoading && setShowSetMasterModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={masterActionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  This will set <strong>{machine?.machineId}</strong> as the master machine for its society. The current master machine will be changed.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="setForAll"
                      checked={setForAll}
                      onChange={(e) => setSetForAll(e.target.checked)}
                      className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="setForAll" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                        Set passwords for all machines in society
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Update all machines in this society with the master machine's current passwords (user and supervisor passwords)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSetMasterModal(false)}
                  disabled={masterActionLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleSetMasterConfirm}
                  isLoading={masterActionLoading}
                  loadingText="Setting..."
                  variant="primary"
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                >
                  Set as Master
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Correction Modal */}
      <AnimatePresence>
        {showCorrectionDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleteLoading && setShowCorrectionDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Selected Corrections
                </h3>
                <button
                  onClick={() => !deleteLoading && setShowCorrectionDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={deleteLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete <strong>{selectedCorrections.length}</strong> selected correction {selectedCorrections.length === 1 ? 'record' : 'records'}? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCorrectionDeleteModal(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={confirmDelete}
                  isLoading={deleteLoading}
                  loadingText="Deleting..."
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}