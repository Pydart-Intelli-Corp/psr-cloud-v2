'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import EntityManager from '@/components/management/EntityManager';
import { Building2, Milk, Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { FlowerSpinner, PageLoader } from '@/components';

type TabType = 'overview' | 'dairy' | 'bmc' | 'society';

interface StatsCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: string;
}

const statsCards: StatsCard[] = [
  {
    title: 'Total Dairy Farms',
    value: 5,
    icon: <Building2 size={24} />,
    trend: '+2 this month',
    trendUp: true,
    color: 'bg-blue-500'
  },
  {
    title: 'Active BMCs',
    value: 3,
    icon: <Milk size={24} />,
    trend: '+1 this month',
    trendUp: true,
    color: 'bg-emerald-500'
  },
  {
    title: 'Registered Societies',
    value: 8,
    icon: <Users size={24} />,
    trend: '+3 this month',
    trendUp: true,
    color: 'bg-purple-500'
  },
  {
    title: 'Total Capacity',
    value: 15000,
    icon: <BarChart3 size={24} />,
    trend: '+2500L this month',
    trendUp: true,
    color: 'bg-orange-500'
  }
];

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: <BarChart3 size={18} /> },
  { id: 'dairy' as TabType, label: 'Dairy Farms', icon: <Building2 size={18} /> },
  { id: 'bmc' as TabType, label: 'BMCs', icon: <Milk size={18} /> },
  { id: 'society' as TabType, label: 'Societies', icon: <Users size={18} /> }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user } = useUser();

  if (!user) {
    return <PageLoader />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {statsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl text-white ${card.color}`}>
                      {card.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trendUp ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                      {card.trend}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {card.title.includes('Capacity') ? `${card.value.toLocaleString()}L` : card.value.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar size={20} className="text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: 'New dairy farm "Green Valley Dairy" added', time: '2 hours ago', type: 'dairy' },
                  { action: 'BMC "Central Processing Unit" capacity updated', time: '5 hours ago', type: 'bmc' },
                  { action: 'Society "Farmers Unity" registered successfully', time: '1 day ago', type: 'society' },
                  { action: 'Monthly report generated for all entities', time: '2 days ago', type: 'report' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'dairy' ? 'bg-blue-500' :
                      activity.type === 'bmc' ? 'bg-emerald-500' :
                      activity.type === 'society' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{activity.action}</p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dairy':
        return (
          <EntityManager
            entityType="dairy"
            title="Dairy Farm"
            icon={<Building2 size={24} className="text-blue-500" />}
            apiEndpoint="dairy"
          />
        );

      case 'bmc':
        return (
          <EntityManager
            entityType="bmc"
            title="BMC"
            icon={<Milk size={24} className="text-emerald-500" />}
            apiEndpoint="bmc"
          />
        );

      case 'society':
        return (
          <EntityManager
            entityType="society"
            title="Society"
            icon={<Users size={24} className="text-purple-500" />}
            apiEndpoint="society"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your dairy farms, BMCs, and societies</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}