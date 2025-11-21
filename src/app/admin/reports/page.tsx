'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Droplet, Truck, DollarSign } from 'lucide-react';
import CollectionReports from '@/components/reports/CollectionReports';
import DispatchReports from '@/components/reports/DispatchReports';
import SalesReports from '@/components/reports/SalesReports';

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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('collection');

  const renderContent = () => {
    switch (activeTab) {
      case 'collection':
        return <CollectionReports key="collection" />;
      case 'dispatch':
        return <DispatchReports key="dispatch" />;
      case 'sales':
        return <SalesReports key="sales" />;
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
                    <span className="text-sm sm:text-base whitespace-nowrap">{tab.label}</span>
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
