'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft,
  Milk,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Edit3,
  Trash2,
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { 
  FlowerSpinner,
  LoadingSpinner,
  StatusMessage,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';

interface DairyDetails {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  lastActivity?: string;
  bmcCount?: number;
  societyCount?: number;
  farmerCount?: number;
  totalMilkProduction?: number;
  monthlyTarget?: number;
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
    action: 'Milk collection completed',
    timestamp: '2024-10-24T09:30:00Z',
    details: '2,500 liters collected from 15 BMCs',
    type: 'success'
  },
  {
    id: '2',
    action: 'New BMC registered',
    timestamp: '2024-10-24T08:15:00Z',
    details: 'BMC-001 added to the network',
    type: 'info'
  },
  {
    id: '3',
    action: 'Quality check alert',
    timestamp: '2024-10-24T07:45:00Z',
    details: 'Sample quality below threshold at BMC-003',
    type: 'warning'
  },
  {
    id: '4',
    action: 'Equipment maintenance',
    timestamp: '2024-10-23T16:20:00Z',
    details: 'Cooling system serviced at main facility',
    type: 'info'
  }
];

interface DairyFormData {
  name: string;
  dairyId: string;
  password: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  capacity: string;
  status: 'active' | 'inactive' | 'maintenance';
  monthlyTarget: string;
}

export default function DairyDetails() {
  const router = useRouter();
  const params = useParams();
  const dairyId = params.id;
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [dairy, setDairy] = useState<DairyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<DairyFormData>({
    name: '',
    dairyId: '',
    password: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: '',
    status: 'active',
    monthlyTarget: ''
  });

  const fetchDairyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch real dairy data from API
      const response = await fetch('/api/user/dairy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dairy details');
      }

      const result = await response.json();
      const dairies = result.data || result; // Handle both response formats
      
      // Find the specific dairy by ID
      const foundDairy = Array.isArray(dairies) 
        ? dairies.find((d: DairyDetails) => d.id === parseInt(dairyId as string))
        : null;
      
      if (!foundDairy) {
        setError('Dairy not found');
        setDairy(null);
        return;
      }

      // Add additional calculated/default fields
      const enrichedDairy: DairyDetails = {
        ...foundDairy,
        // Set defaults for fields that might not be in the database yet
        bmcCount: foundDairy.bmcCount || 0,
        societyCount: foundDairy.societyCount || 0,
        farmerCount: foundDairy.farmerCount || 0,
        totalMilkProduction: foundDairy.totalMilkProduction || 0,
        monthlyTarget: foundDairy.monthlyTarget || foundDairy.capacity || 0,
        lastActivity: foundDairy.lastActivity || foundDairy.createdAt
      };

      setDairy(enrichedDairy);
    } catch (error) {
      console.error('Error fetching dairy details:', error);
      setError('Failed to load dairy details');
    } finally {
      setLoading(false);
    }
  }, [dairyId, router]);

  // Open edit modal
  const handleEditClick = () => {
    if (!dairy) return;
    
    setFormData({
      name: dairy.name,
      dairyId: dairy.dairyId,
      password: '', // Don't populate password for security
      location: dairy.location || '',
      contactPerson: dairy.contactPerson || '',
      phone: dairy.phone || '',
      email: dairy.email || '',
      capacity: dairy.capacity?.toString() || '',
      status: dairy.status || 'active',
      monthlyTarget: dairy.monthlyTarget?.toString() || ''
    });
    setShowEditForm(true);
  };

  // Update dairy
  const handleUpdateDairy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dairy) return;

    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const updateData: {
        id: number;
        name: string;
        location: string;
        contactPerson: string;
        phone: string;
        email: string;
        capacity?: number;
        status?: 'active' | 'inactive' | 'maintenance';
        monthlyTarget?: number;
        password?: string;
      } = {
        id: dairy.id,
        name: formData.name,
        location: formData.location,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: formData.status,
        monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : undefined
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/dairy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess('Dairy updated successfully!');
        setShowEditForm(false);
        await fetchDairyDetails();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update dairy');
      }
    } catch (error) {
      console.error('Error updating dairy:', error);
      setError('Failed to update dairy');
    } finally {
      setFormLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Delete dairy
  const handleConfirmDelete = async () => {
    if (!dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/dairy`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: dairy.id })
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to dairy list after successful deletion
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 1000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof DairyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
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
    fetchDairyDetails();
  }, [dairyId, fetchDairyDetails]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !dairy) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title={`${t.dairyManagement.dairyDetails} ${t.common.noDataAvailable}`}
        message={error || t.dairyManagement.noDairiesFound}
        actionText={`${t.common.back} to ${t.nav.dairyManagement}`}
        onAction={() => router.push('/admin/dairy')}
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
                onClick={() => router.push('/admin/dairy')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{dairy.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Dairy ID: {dairy.dairyId}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status + Actions */}
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(dairy.status)}`}>
                {dairy.status}
              </span>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={handleEditClick}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common.edit}</span>
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common.delete}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
              {[
                { id: 'overview' as const, label: t.dashboard.overview, icon: Building2 },
                { id: 'analytics' as const, label: t.nav.analytics, icon: BarChart3 },
                { id: 'activity' as const, label: t.dashboard.recentActivity, icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
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
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t.dairyManagement.dairyDetails}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {dairy.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.location}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{dairy.location}</p>
                        </div>
                      </div>
                    )}
                    {dairy.contactPerson && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.contactPerson}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{dairy.contactPerson}</p>
                        </div>
                      </div>
                    )}
                    {dairy.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.phone}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-all">{dairy.phone}</p>
                        </div>
                      </div>
                    )}
                    {dairy.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.email}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-all">{dairy.email}</p>
                        </div>
                      </div>
                    )}
                    {dairy.capacity && (
                      <div className="flex items-start gap-3">
                        <Milk className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dashboard.capacity}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{dairy.capacity.toLocaleString()} Liters</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.common.createdAt}</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{new Date(dairy.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards - Mobile: 1 column, Tablet: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connected BMCs</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dairy.bmcCount || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Bulk Milk Coolers</p>
                      </div>
                      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Societies</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dairy.societyCount || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Registered societies</p>
                      </div>
                      <Users className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Registered Farmers</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dairy.farmerCount || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Total farmers</p>
                      </div>
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Production</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dairy.totalMilkProduction?.toLocaleString() || 0}L</p>
                        {dairy.monthlyTarget && dairy.monthlyTarget > 0 ? (
                          <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                            {((dairy.totalMilkProduction! / dairy.monthlyTarget) * 100).toFixed(1)}% of {dairy.monthlyTarget.toLocaleString()}L target
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Capacity: {dairy.capacity?.toLocaleString() || 0}L</p>
                        )}
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
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t.dashboard.quickActions}</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Manage BMCs</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">View Societies</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Production Reports</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Quality Monitoring</span>
                      </button>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Last Activity</h3>
                    {dairy.lastActivity && (
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Activity className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">Last seen: {new Date(dairy.lastActivity).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Production {t.nav.analytics}</h3>
              <div className="text-center py-8 sm:py-12">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Analytics dashboard will be implemented here</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Charts, graphs, and production metrics</p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">{t.dashboard.recentActivity}</h3>
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

      {/* Status Messages */}
      <StatusMessage success={success} error={error} />

      {/* Edit Dairy Modal */}
      <AnimatePresence>
        {showEditForm && dairy && (
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
                  name: '',
                  dairyId: '',
                  password: '',
                  location: '',
                  contactPerson: '',
                  phone: '',
                  email: '',
                  capacity: '',
                  status: 'active',
                  monthlyTarget: ''
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
                    Edit {dairy.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        name: '',
                        dairyId: '',
                        password: '',
                        location: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                        capacity: '',
                        status: 'active',
                        monthlyTarget: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 touch-target sm:min-h-0 sm:min-w-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateDairy} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dairy Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter dairy name"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dairy ID
                    </label>
                    <input
                      type="text"
                      value={formData.dairyId}
                      className="psr-input !bg-gray-100 dark:!bg-gray-700 !text-gray-500 dark:!text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter contact person name"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter phone number"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter email"
                      autoComplete="off"
                    />
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
                      Capacity (Liters)
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter capacity"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'maintenance')}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Target (Liters)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyTarget}
                      onChange={(e) => handleInputChange('monthlyTarget', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter monthly target"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        name: '',
                        dairyId: '',
                        password: '',
                        location: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                        capacity: '',
                        status: 'active',
                        monthlyTarget: ''
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-green-500/25"
                  >
                    {formLoading ? (
                      <>
                        <FlowerSpinner size={16} className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Update Dairy
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
        itemName={dairy?.name || 'this dairy'}
        itemType="Dairy"
      />
    </div>
  );
}