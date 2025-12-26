'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useDashboardData } from '@/hooks/useEntityData';
import AddEntityModal from '@/components/forms/AddEntityModal';
import { 
  Building2, 
  Milk, 
  Users, 
  Plus,
  Eye,
  Trash2,
  Shield,
  BarChart3
} from 'lucide-react';
import { FlowerSpinner } from '@/components';

interface DashboardStats {
  totalDairies: number;
  totalBMCs: number;
  totalSocieties: number;
  totalFarmers: number;
}

interface Entity {
  id: number;
  name: string;
  location?: string;
  createdAt?: string;
  created_at?: string;
  // Type-specific fields
  dairy_id?: string;
  dairyId?: string;
  bmc_id?: string;
  bmcId?: string;
  society_id?: string;
  societyId?: string;
  contact_person?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status?: string;
  dairy_farm_name?: string;
  president_name?: string;
  contact_phone?: string;
  contactPhone?: string;
  bmc_name?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useUser();
  
  const [activeModal, setActiveModal] = useState<'dairy' | 'bmc' | 'society' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dairies' | 'bmcs' | 'societies'>('overview');

  // Use React Query hooks for cached data fetching
  const { dairies, bmcs, societies, isLoading, isError, error } = useDashboardData();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user, router]);

  const handleEntityAdded = () => {
    // Invalidate queries to refetch data
    dairies.refetch();
    bmcs.refetch();
    societies.refetch();
  };

  const stats = {
    totalDairies: dairies.data?.length || 0,
    totalBMCs: bmcs.data?.length || 0,
    totalSocieties: societies.data?.length || 0,
    totalFarmers: 0
  };

  const statCards = [
    {
      title: 'Dairy Farms',
      value: stats.totalDairies.toString(),
      icon: Building2,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      actionLabel: 'Add Dairy',
      onClick: () => setActiveModal('dairy')
    },
    {
      title: 'BMCs',
      value: stats.totalBMCs.toString(),
      icon: Milk,
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      actionLabel: 'Add BMC',
      onClick: () => setActiveModal('bmc')
    },
    {
      title: 'Societies',
      value: stats.totalSocieties.toString(),
      icon: Users,
      color: 'bg-gradient-to-r from-teal-500 to-green-500',
      actionLabel: 'Add Society',
      onClick: () => setActiveModal('society')
    },
    {
      title: 'Total Farmers',
      value: stats.totalFarmers.toString(),
      icon: Shield,
      color: 'bg-gradient-to-r from-green-600 to-emerald-600',
      actionLabel: 'View Farmers',
      onClick: () => {} // TODO: Navigate to farmers
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'dairies', label: 'Dairy Farms', icon: Building2 },
    { id: 'bmcs', label: 'BMCs', icon: Milk },
    { id: 'societies', label: 'Societies', icon: Users }
  ];

  const renderEntityCard = (entity: Entity, type: 'dairy' | 'bmc' | 'society') => {
    const getEntityId = () => {
      switch (type) {
        case 'dairy': return entity.dairy_id;
        case 'bmc': return entity.bmc_id;
        case 'society': return entity.society_id;
      }
    };

    const getSubtitle = () => {
      switch (type) {
        case 'dairy': return entity.contact_person || entity.location;
        case 'bmc': return entity.dairy_farm_name || entity.location;
        case 'society': return entity.bmc_name || entity.president_name;
      }
    };

    return (
      <motion.div
        key={entity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${
                type === 'dairy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                type === 'bmc' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
              }`}>
                {type === 'dairy' && <Building2 className="w-5 h-5" />}
                {type === 'bmc' && <Milk className="w-5 h-5" />}
                {type === 'society' && <Users className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entity.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {getEntityId()}</p>
              </div>
            </div>
            
            {getSubtitle() && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{getSubtitle()}</p>
            )}
            
            {entity.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">📍 {entity.location}</p>
            )}

            {/* Additional info based on type */}
            {type === 'dairy' && entity.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">📞 {entity.phone}</p>
            )}
            {type === 'bmc' && entity.capacity && (
              <p className="text-sm text-gray-500 dark:text-gray-400">🥛 Capacity: {entity.capacity.toLocaleString()} L</p>
            )}
            {type === 'society' && entity.contact_phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">📞 {entity.contact_phone}</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Added {new Date(entity.created_at || entity.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{card.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <button
                      onClick={card.onClick}
                      className="mt-4 w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{card.actionLabel}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveModal('dairy')}
                  className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                >
                  <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-green-900 dark:text-green-300">Add Dairy Farm</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Register new dairy</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveModal('bmc')}
                  className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                >
                  <Milk className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <p className="font-medium text-emerald-900 dark:text-emerald-300">Add BMC</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Add collection center</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveModal('society')}
                  className="flex items-center space-x-3 p-4 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                >
                  <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  <div className="text-left">
                    <p className="font-medium text-teal-900 dark:text-teal-300">Add Society</p>
                    <p className="text-sm text-teal-600 dark:text-teal-400">Register new society</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'dairies':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dairy Farms ({dairies.data?.length || 0})</h3>
              <button
                onClick={() => setActiveModal('dairy')}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dairy</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dairies.data?.map(dairy => renderEntityCard(dairy, 'dairy'))}
            </div>
            {(dairies.data?.length || 0) === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No dairy farms yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding your first dairy farm</p>
                <button
                  onClick={() => setActiveModal('dairy')}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-lg"
                >
                  Add First Dairy
                </button>
              </div>
            )}
          </div>
        );

      case 'bmcs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">BMCs ({bmcs.data?.length || 0})</h3>
              <button
                onClick={() => setActiveModal('bmc')}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add BMC</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bmcs.data?.map(bmc => renderEntityCard(bmc, 'bmc'))}
            </div>
            {(bmcs.data?.length || 0) === 0 && (
              <div className="text-center py-12">
                <Milk className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No BMCs yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Add bulk milk cooling centers</p>
                <button
                  onClick={() => setActiveModal('bmc')}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-lg"
                >
                  Add First BMC
                </button>
              </div>
            )}
          </div>
        );

      case 'societies':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Societies ({societies.data?.length || 0})</h3>
              <button
                onClick={() => setActiveModal('society')}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Society</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {societies.data?.map(society => renderEntityCard(society, 'society'))}
            </div>
            {(societies.data?.length || 0) === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No societies yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Register farmer societies</p>
                <button
                  onClick={() => setActiveModal('society')}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-lg"
                >
                  Add First Society
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render until user is loaded
  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <FlowerSpinner />
          <span className="mt-4 text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading dashboard data...' : 'Loading user profile...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {user?.companyName || user?.fullName || 'Admin'} Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user.fullName.split(' ')[0] || 'Admin'}! Manage your dairy operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                dairies.refetch();
                bmcs.refetch();
                societies.refetch();
              }}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>Refresh Data</span>
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              DB: {user?.dbKey || 'N/A'}
            </div>
          </div>
        </div>

        {/* Information Banner */}
        {stats.totalDairies === 0 && stats.totalBMCs === 0 && stats.totalSocieties === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400 dark:text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Welcome to your admin dashboard!</strong> 
                  Your account is active and ready to use. Click the &quot;Load Data&quot; button above to fetch your entity data, 
                  or use the &quot;Add&quot; buttons to create new dairy farms, BMCs, and societies.
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  User: {user?.fullName} | DB Key: {user?.dbKey} | Status: Active
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'dairies' | 'bmcs' | 'societies')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Add Entity Modal */}
        {activeModal && (
          <AddEntityModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            type={activeModal}
            onSuccess={handleEntityAdded}
          />
        )}
      </div>
  );
}