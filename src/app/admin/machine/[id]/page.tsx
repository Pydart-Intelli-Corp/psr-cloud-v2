'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Settings, 
  MapPin, 
  Phone, 
  User, 
  Building2,
  Save,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Wrench,
  Calendar,
  Cog
} from 'lucide-react';
import { 
  FlowerSpinner, 
  EmptyState, 
  StatusMessage, 
  ConfirmDeleteModal,
  FormModal,
  FormInput,
  FormSelect,
  FormTextarea,
  FormActions,
  FormGrid
} from '@/components';
import { useUser } from '@/contexts/UserContext';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
  societyName?: string;
  location?: string;
  installationDate?: string;
  operatorName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  operationHours?: number;
  maintenanceCount?: number;
  efficiency?: number;
  lastOperationDate?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface MachineFormData {
  machineId: string;
  machineType: string;
  societyId: string;
  location: string;
  installationDate: string;
  operatorName: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes: string;
}

interface Society {
  id: number;
  name: string;
  societyId: string;
}

interface MachineType {
  id: number;
  machineType: string;
  description?: string;
  isActive: boolean;
}

export default function MachineDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [societies, setSocieties] = useState<Society[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [machineTypesLoading, setMachineTypesLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
  }>({});
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Machine Status Updated',
      timestamp: new Date().toISOString(),
      details: 'Status changed to Active',
      type: 'success'
    },
    {
      id: '2',
      action: 'Maintenance Scheduled',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: 'Routine maintenance scheduled for next week',
      type: 'info'
    }
  ]);

  // Fetch machine details
  const fetchMachine = useCallback(async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/user/machine?id=${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setMachine(result.data[0]);
        setFormData({
          machineId: result.data[0].machineId,
          machineType: result.data[0].machineType,
          societyId: result.data[0].societyId.toString(),
          location: result.data[0].location || '',
          installationDate: result.data[0].installationDate || '',
          operatorName: result.data[0].operatorName || '',
          contactPhone: result.data[0].contactPhone || '',
          status: result.data[0].status,
          notes: result.data[0].notes || ''
        });
      } else {
        setError('Machine not found');
      }
    } catch (error) {
      console.error('Error fetching machine:', error);
      setError('Failed to fetch machine details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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

  useEffect(() => {
    if (user) {
      fetchMachine();
      fetchSocieties();
      fetchMachineTypes();
    }
  }, [user, fetchMachine, fetchSocieties, fetchMachineTypes]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      setFormLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: machine.id,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine updated successfully!');
        await fetchMachine();
        setShowEditForm(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update machine');
        }
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      setError('Failed to update machine');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!machine) return;

    try {
      setFormLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/user/machine?id=${machine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine deleted successfully!');
        setTimeout(() => {
          router.push('/admin/machine');
        }, 1500);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError('Failed to delete machine');
    } finally {
      setFormLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof MachineFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user types
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'inactive': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'maintenance': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <FlowerSpinner />
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={<Settings className="w-16 h-16 text-gray-400" />}
            title="Machine Not Found"
            message="The machine you're looking for doesn't exist or you don't have permission to view it."
            actionText="Back to Machines"
            onAction={() => router.push('/admin/machine')}
            showAction={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Status Messages */}
      <AnimatePresence>
        {(error || success) && (
          <StatusMessage
            success={success}
            error={error}
          />
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                  <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {machine.machineId}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {machine.machineType}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(machine.status)}`}>
                {getStatusIcon(machine.status)}
                <span className="ml-1.5 capitalize">{machine.status}</span>
              </span>
              
              <button
                onClick={() => setShowEditForm(true)}
                disabled={formLoading}
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm sm:text-base touch-target"
              >
                <Edit3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={formLoading}
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm sm:text-base touch-target"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'analytics', label: 'Analytics', icon: Activity },
                { id: 'activity', label: 'Activity', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'analytics' | 'activity')}
                  className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium rounded-t-lg whitespace-nowrap touch-target transition-colors ${
                    activeTab === tab.id
                      ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Machine Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                      Machine Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Machine ID */}
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Machine ID</dt>
                        <dd className="flex items-center text-gray-900 dark:text-gray-100">
                          <Cog className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="truncate">{machine.machineId}</span>
                        </dd>
                      </div>

                      {/* Machine Type */}
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</dt>
                        <dd className="flex items-center text-gray-900 dark:text-gray-100">
                          <Wrench className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{machine.machineType}</span>
                        </dd>
                      </div>

                      {/* Society */}
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Society</dt>
                        <dd className="flex items-center text-gray-900 dark:text-gray-100">
                          <Building2 className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{machine.societyName || 'Not assigned'}</span>
                        </dd>
                      </div>

                      {/* Location */}
                      {machine.location && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</dt>
                          <dd className="flex items-center text-gray-900 dark:text-gray-100">
                            <MapPin className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{machine.location}</span>
                          </dd>
                        </div>
                      )}

                      {/* Operator */}
                      {machine.operatorName && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Operator</dt>
                          <dd className="flex items-center text-gray-900 dark:text-gray-100">
                            <User className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{machine.operatorName}</span>
                          </dd>
                        </div>
                      )}

                      {/* Contact */}
                      {machine.contactPhone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Contact</dt>
                          <dd className="flex items-center text-gray-900 dark:text-gray-100">
                            <Phone className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{machine.contactPhone}</span>
                          </dd>
                        </div>
                      )}

                      {/* Installation Date */}
                      {machine.installationDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Installation Date</dt>
                          <dd className="flex items-center text-gray-900 dark:text-gray-100">
                            <Calendar className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(machine.installationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </dd>
                        </div>
                      )}


                    </div>

                    {/* Notes */}
                    {machine.notes && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</dt>
                        <dd className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {machine.notes}
                        </dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Quick Stats
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Operation Hours</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {machine.operationHours || 0}h
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance Count</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {machine.maintenanceCount || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {machine.efficiency || 0}%
                        </span>
                      </div>
                      
                      {machine.lastOperationDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Last Operation</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(machine.lastOperationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      System Information
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {new Date(machine.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {new Date(machine.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <EmptyState
                  icon={<Activity className="w-12 h-12 text-gray-400" />}
                  title="Analytics Coming Soon"
                  message="Machine analytics and performance metrics will be available here."
                />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                  Recent Activity
                </h3>
                
                {activityLogs.length > 0 ? (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className={`p-1.5 rounded-full ${
                          log.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                          log.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {getStatusIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                            {log.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {log.details}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Shield className="w-12 h-12 text-gray-400" />}
                    title="No Activity"
                    message="No recent activity logs available for this machine."
                  />
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Edit Machine"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Machine ID */}
        <FormInput
          label="Machine ID"
          value={formData.machineId}
          onChange={(value) => handleInputChange('machineId', value)}
          placeholder="Enter machine ID"
          disabled={formLoading}
          required
          error={fieldErrors.machineId}
        />

        {/* Machine Type */}
        <FormSelect
          label="Machine Type"
          value={formData.machineType}
          onChange={(value) => handleInputChange('machineType', value)}
          disabled={formLoading || machineTypesLoading}
          required
          error={fieldErrors.machineType}
          options={[
            { value: '', label: 'Select machine type' },
            ...machineTypes.map((type) => ({
              value: type.machineType,
              label: type.machineType
            }))
          ]}
        />

        {/* Society */}
        <FormSelect
          label="Society"
          value={formData.societyId}
          onChange={(value) => handleInputChange('societyId', value)}
          disabled={formLoading || societiesLoading}
          required
          error={fieldErrors.societyId}
          options={[
            { value: '', label: 'Select society' },
            ...societies.map((society) => ({
              value: society.id.toString(),
              label: `${society.name} (ID: ${society.societyId})`
            }))
          ]}
        />

        {/* Location */}
        <FormInput
          label="Location"
          value={formData.location}
          onChange={(value) => handleInputChange('location', value)}
          placeholder="Enter location"
          disabled={formLoading}
        />

        <FormGrid columns={2}>
          {/* Installation Date */}
          <FormInput
            type="date"
            label="Installation Date"
            value={formData.installationDate}
            onChange={(value) => handleInputChange('installationDate', value)}
            disabled={formLoading}
          />

          {/* Status */}
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            disabled={formLoading}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'maintenance', label: 'Maintenance' }
            ]}
          />
        </FormGrid>

        <FormGrid columns={2}>
          {/* Operator Name */}
          <FormInput
            label="Operator Name"
            value={formData.operatorName}
            onChange={(value) => handleInputChange('operatorName', value)}
            placeholder="Enter operator name"
            disabled={formLoading}
          />

          {/* Contact Phone */}
          <FormInput
            type="tel"
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(value) => handleInputChange('contactPhone', value)}
            placeholder="Enter contact phone"
            disabled={formLoading}
          />
        </FormGrid>

        {/* Notes */}
        <FormTextarea
          label="Notes"
          value={formData.notes}
          onChange={(value) => handleInputChange('notes', value)}
          placeholder="Enter any additional notes"
          disabled={formLoading}
          rows={3}
        />

          {/* Form Actions */}
          <FormActions
            onCancel={() => setShowEditForm(false)}
            submitType="submit"
            isLoading={formLoading}
            cancelText="Cancel"
            submitText="Save Changes"
            submitIcon={<Save className="w-4 h-4" />}
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={machine.machineId}
        itemType="machine"
        title="Delete Machine"
        message={`Are you sure you want to delete machine "${machine.machineId}"? This action cannot be undone.`}
        confirmText="Delete Machine"
      />
    </div>
  );
}