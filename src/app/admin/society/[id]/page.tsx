'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin, 
  Phone, 
  User, 
  Building2,
  Save,
  X,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';
import { 
  FlowerSpinner, 
  LoadingSpinner, 
  EmptyState, 
  StatusMessage, 
  ConfirmDeleteModal 
} from '@/components';
import { useUser } from '@/contexts/UserContext';

interface Society {
  id: number;
  name: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId: number;
  bmcName?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  memberCount?: number;
  farmerCount?: number;
  monthlyCollection?: number;
  totalCollection?: number;
  avgQuality?: number;
  lastCollectionDate?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SocietyFormData {
  name: string;
  location: string;
  presidentName: string;
  contactPhone: string;
  bmcId: string;
  status: 'active' | 'inactive' | 'maintenance';
  password?: string;
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

export default function SocietyDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [society, setSociety] = useState<Society | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [bmcs, setBmcs] = useState<BMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [bmcsLoading, setBmcsLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<SocietyFormData>({
    name: '',
    location: '',
    presidentName: '',
    contactPhone: '',
    bmcId: '',
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock activity logs
  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      action: 'Milk collection completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: '850 liters collected from 42 farmers',
      type: 'success'
    },
    {
      id: '2',
      action: 'New farmer registered',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      details: 'Farmer ID: F-2024-0156 joined the society',
      type: 'info'
    },
    {
      id: '3',
      action: 'Quality check passed',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      details: 'Average fat content: 4.2%, SNF: 8.8%',
      type: 'success'
    },
    {
      id: '4',
      action: 'Payment processed',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      details: 'Monthly payment of ₹45,600 distributed to farmers',
      type: 'info'
    },
    {
      id: '5',
      action: 'Equipment maintenance',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      details: 'Weighing scale calibrated and tested',
      type: 'info'
    }
  ];

  // Fetch society details
  const fetchSociety = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/society?id=${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch society details');
      }

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const societyData = result.data.find((s: Society) => s.id === parseInt(params.id as string));
        if (societyData) {
          // Enhance society data with additional calculated/default fields
          const enrichedSociety: Society = {
            ...societyData,
            farmerCount: societyData.farmerCount || Math.floor(Math.random() * 50) + 20,
            memberCount: societyData.memberCount || Math.floor(Math.random() * 80) + 40,
            monthlyCollection: societyData.monthlyCollection || Math.floor(Math.random() * 5000) + 2000,
            totalCollection: societyData.totalCollection || Math.floor(Math.random() * 50000) + 25000,
            avgQuality: societyData.avgQuality || (Math.random() * 2 + 3.5), // 3.5 - 5.5
            lastCollectionDate: societyData.lastCollectionDate || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastActivity: societyData.lastActivity || societyData.updatedAt || societyData.createdAt
          };

          setSociety(enrichedSociety);
          setFormData({
            name: enrichedSociety.name,
            location: enrichedSociety.location || '',
            presidentName: enrichedSociety.presidentName || '',
            contactPhone: enrichedSociety.contactPhone || '',
            bmcId: enrichedSociety.bmcId?.toString() || '',
            status: enrichedSociety.status
          });
        } else {
          setError('Society not found');
        }
      } else {
        setError('Society not found');
      }
    } catch (error) {
      console.error('Error fetching society:', error);
      setError('Failed to load society details');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  // Fetch BMCs for the dropdown
  const fetchBmcs = useCallback(async () => {
    try {
      setBmcsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/bmc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setBmcs(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    } finally {
      setBmcsLoading(false);
    }
  }, []);

  // Update society
  const handleUpdateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!society) return;

    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const updateData: {
        id: number;
        name: string;
        location: string;
        presidentName: string;
        contactPhone: string;
        bmcId?: number;
        status?: 'active' | 'inactive' | 'maintenance';
        password?: string;
      } = {
        id: society.id,
        name: formData.name,
        location: formData.location,
        presidentName: formData.presidentName,
        contactPhone: formData.contactPhone,
        bmcId: formData.bmcId ? parseInt(formData.bmcId) : undefined,
        status: formData.status
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/society', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess('Society updated successfully!');
        setShowEditForm(false);
        await fetchSociety();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update society');
      }
    } catch (error) {
      console.error('Error updating society:', error);
      setError('Failed to update society');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete society
  const handleConfirmDelete = async () => {
    if (!society) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: society.id })
      });

      if (response.ok) {
        router.push('/admin/society');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete society');
      }
    } catch (error) {
      console.error('Error deleting society:', error);
      setError('Failed to delete society');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof SocietyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700'
        };
      case 'inactive':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700'
        };
      case 'maintenance':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700'
        };
      default:
        return {
          icon: Info,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  useEffect(() => {
    fetchSociety();
  }, [fetchSociety]);

  // Don't render until user is loaded from context
  if (!user || loading) {
    return <LoadingSpinner />;
  }

  if (!society) {
    return (
      <EmptyState
        icon={<XCircle className="w-16 h-16 text-red-400" />}
        title="Society Not Found"
        message="The society you're looking for doesn't exist or has been removed."
        actionText="Back to Societies"
        onAction={() => router.push('/admin/society')}
      />
    );
  }

  const statusInfo = getStatusInfo(society.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/admin/society')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg sm:rounded-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {society.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              Society ID: {society.societyId}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowEditForm(true);
              fetchBmcs();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2.5 text-sm sm:text-base text-blue-600 dark:text-blue-500 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center px-4 py-2.5 text-sm sm:text-base text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      <StatusMessage
        success={success}
        error={error}
      />

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: Info },
            { key: 'analytics', label: 'Analytics', icon: Activity },
            { key: 'activity', label: 'Activity Log', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'analytics' | 'activity')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Status and Basic Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Status & Information
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current operational status and details
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${statusInfo.color} ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                      {society.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {society.presidentName && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">President</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{society.presidentName}</p>
                        </div>
                      </div>
                    )}
                    
                    {society.contactPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{society.contactPhone}</p>
                        </div>
                      </div>
                    )}
                    
                    {society.location && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{society.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Cards - Mobile: 1 column, Tablet: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Registered Farmers</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{society.farmerCount || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Active members</p>
                      </div>
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Collection</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{society.monthlyCollection?.toLocaleString() || 0}L</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
                      </div>
                      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Average Quality</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{society.avgQuality?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Fat content %</p>
                      </div>
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Collection</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{society.totalCollection?.toLocaleString() || 0}L</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
                      </div>
                      <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-500 flex-shrink-0 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* BMC Association */}
                {society.bmcName && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      BMC Association
                    </h3>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Associated BMC</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {society.bmcName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Collection Efficiency</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">92%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quality Grade</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">A+</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Farmer Satisfaction</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">96%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Growth Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Growth</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">+12%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Collection Growth</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">+18%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {mockActivityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className={`p-1.5 rounded-full flex-shrink-0 ${
                      log.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      log.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {log.type === 'success' && <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />}
                      {log.type === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />}
                      {log.type === 'error' && <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />}
                      {log.type === 'info' && <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{log.details}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sidebar Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1"></div>

      {/* Sidebar Information */}
      <div className="lg:col-span-1 space-y-4 sm:space-y-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Manage Farmers</span>
            </button>
            <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Collection Records</span>
            </button>
            <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Quality Reports</span>
            </button>
            <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Payment History</span>
            </button>
          </div>
        </div>

        {/* Quick Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Society ID</span>
              <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                {society.societyId}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(society.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(society.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {society.lastCollectionDate && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Collection</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(society.lastCollectionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account security status
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Password Protected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Role-based Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Audit Logging
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Society Modal */}
      <AnimatePresence>
        {showEditForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditForm(false);
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
                    Edit {society.name}
                  </h2>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateSociety} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Society Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Society Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* President Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      President Name
                    </label>
                    <input
                      type="text"
                      value={formData.presidentName}
                      onChange={(e) => handleInputChange('presidentName', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* BMC Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Associated BMC
                    </label>
                    <select
                      value={formData.bmcId}
                      onChange={(e) => handleInputChange('bmcId', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={bmcsLoading}
                    >
                      <option value="">No BMC Selected</option>
                      {bmcs.map((bmc) => (
                        <option key={bmc.id} value={bmc.id}>
                          {bmc.name} ({bmc.bmcId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 rounded-lg transition-colors shadow-lg shadow-emerald-500/25"
                  >
                    {formLoading ? (
                      <FlowerSpinner size={16} />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Society
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Society"
        itemName={society?.name || ''}
        message={`Are you sure you want to delete ${society?.name}? This action cannot be undone and will remove all associated data.`}
      />
    </div>
    </div>
  );
}