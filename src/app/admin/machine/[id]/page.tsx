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
  Zap
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'correction' | 'activity'>('overview');
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

  // Load data on mount
  useEffect(() => {
    fetchMachineDetails();
    fetchSocieties();
    fetchMachineTypes();
  }, [fetchMachineDetails, fetchSocieties, fetchMachineTypes]);

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

  // Save correction data
  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setCorrectionLoading(true);
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
        setSuccess('Correction data saved successfully!');
        // Fetch the latest data to show what was saved
        await fetchCorrectionData();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to save correction data');
      }
    } catch (error) {
      console.error('Error saving correction data:', error);
      setError('Failed to save correction data');
    } finally {
      setCorrectionLoading(false);
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
            {/* Top Row: Back button + Title */}
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
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{machine.machineId}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{machine.machineType}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status + Actions */}
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(machine.status)}`}>
                {machine.status}
              </span>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={handleEditClick}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common?.edit || 'Edit'}</span>
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common?.delete || 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
              {[
                { id: 'overview' as const, label: t.dashboard?.overview || 'Overview', icon: Building2 },
                { id: 'analytics' as const, label: t.nav?.analytics || 'Analytics', icon: BarChart3 },
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
    </div>
  );
}