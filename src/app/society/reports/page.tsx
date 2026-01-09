'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Droplet, Truck, DollarSign } from 'lucide-react';
import { PageLoader, SocietyCollectionReports } from '@/components';

export const dynamic = 'force-dynamic';

type ReportType = 'collection' | 'dispatch' | 'sales';

interface TabConfig {
  id: ReportType;
  label: string;
  icon: typeof Droplet;
  color: string;
  gradient: string;
}

const tabs: TabConfig[] = [
  {
    id: 'collection',
    label: 'Collection',
    icon: Droplet,
    color: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    icon: Truck,
    color: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-600 to-emerald-600'
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: DollarSign,
    color: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600 to-pink-600'
  }
];

function SocietyReportsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ReportType>('collection');
  const [globalSearch, setGlobalSearch] = useState('');
  const [initialFromDate, setInitialFromDate] = useState<string | null>(null);
  const [initialToDate, setInitialToDate] = useState<string | null>(null);
  const [initialFarmerFilter, setInitialFarmerFilter] = useState<string | null>(null);

  // Read URL parameters on mount
  useEffect(() => {
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const farmerFilter = searchParams.get('farmerFilter');
    
    if (fromDate) setInitialFromDate(fromDate);
    if (toDate) setInitialToDate(toDate);
    if (farmerFilter) setInitialFarmerFilter(farmerFilter);
  }, []);

  // Listen to global search event from header
  useEffect(() => {
    const handleGlobalSearch = (event: CustomEvent<{ query: string }>) => {
      setGlobalSearch(event.detail.query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'collection':
        return (
          <SocietyCollectionReports 
            key="collection" 
            globalSearch={globalSearch} 
            initialFromDate={initialFromDate} 
            initialToDate={initialToDate}
            initialFarmerFilter={initialFarmerFilter}
          />
        );
      case 'dispatch':
        return (
          <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-center text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Dispatch reports coming soon</p>
            </div>
          </div>
        );
      case 'sales':
        return (
          <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sales reports coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Reports Title - Left Side */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Reports
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                  View and analyze society data
                </p>
              </div>
            </div>

            {/* Toggle Button - Right Side */}
            <div className="inline-flex bg-indigo-50 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm
                      transition-all duration-200 ease-out
                      ${isActive
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg`}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SocietyReports() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SocietyReportsPage />
    </Suspense>
  );
}
