'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Droplet, Truck, DollarSign } from 'lucide-react';
import { PageLoader } from '@/components';
import CollectionReports from '@/components/reports/CollectionReports';
import DispatchReports from '@/components/reports/DispatchReports';
import SalesReports from '@/components/reports/SalesReports';

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

function ReportsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ReportType>('collection');
  const [globalSearch, setGlobalSearch] = useState('');
  const [initialSocietyId, setInitialSocietyId] = useState<string | null>(null);
  const [initialSocietyName, setInitialSocietyName] = useState<string | null>(null);
  const [initialFromDate, setInitialFromDate] = useState<string | null>(null);
  const [initialToDate, setInitialToDate] = useState<string | null>(null);
  const [initialBmcFilter, setInitialBmcFilter] = useState<string | null>(null);
  const [initialMachineFilter, setInitialMachineFilter] = useState<string | null>(null);

  // Read URL parameters on mount
  useEffect(() => {
    const societyId = searchParams.get('societyId');
    const societyName = searchParams.get('societyName');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const bmcFilter = searchParams.get('bmcFilter');
    const machineFilter = searchParams.get('machineFilter');
    
    console.log('Reports Page - URL Params:', { societyId, societyName, fromDate, toDate, machineFilter });
    
    if (societyId) {
      setInitialSocietyId(societyId);
      setInitialSocietyName(societyName);
    }
    
    if (fromDate) {
      console.log('Setting initialFromDate:', fromDate);
      setInitialFromDate(fromDate);
    }
    
    if (toDate) {
      console.log('Setting initialToDate:', toDate);
      setInitialToDate(toDate);
    }
    
    if (bmcFilter) {
      console.log('Setting initialBmcFilter:', bmcFilter);
      setInitialBmcFilter(bmcFilter);
    }
    
    if (machineFilter) {
      console.log('Setting initialMachineFilter:', machineFilter);
      setInitialMachineFilter(machineFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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
    console.log('Rendering with date filters:', { initialFromDate, initialToDate, initialBmcFilter, initialMachineFilter });
    switch (activeTab) {
      case 'collection':
        return <CollectionReports key="collection" globalSearch={globalSearch} initialSocietyId={initialSocietyId} initialSocietyName={initialSocietyName} initialFromDate={initialFromDate} initialToDate={initialToDate} initialBmcFilter={initialBmcFilter} initialMachineFilter={initialMachineFilter} />;
      case 'dispatch':
        return <DispatchReports key="dispatch" globalSearch={globalSearch} />;
      case 'sales':
        return <SalesReports key="sales" globalSearch={globalSearch} />;
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
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Reports
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                  View and analyze data
                </p>
              </div>
            </div>

            {/* Toggle Button - Right Side */}
            <div className="inline-flex bg-psr-green-50 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-psr-green-600 dark:bg-psr-green-700 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-psr-green-600 dark:hover:text-psr-green-400'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function ReportsPageWrapper() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ReportsPage />
    </Suspense>
  );
}
