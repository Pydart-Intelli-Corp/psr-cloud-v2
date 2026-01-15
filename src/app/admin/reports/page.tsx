'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Droplet, Truck, DollarSign, Building2, Users, GitCompare } from 'lucide-react';
import { PageLoader } from '@/components';
import CollectionReports from '@/components/reports/CollectionReports';
import DispatchReports from '@/components/reports/DispatchReports';
import SalesReports from '@/components/reports/SalesReports';
import ComparisonSummary from '@/components/reports/ComparisonSummary';
import CollectionDispatchComparison from '@/components/reports/CollectionDispatchComparison';
import DispatchComparison from '@/components/reports/DispatchComparison';

export const dynamic = 'force-dynamic';

type ReportType = 'collection' | 'dispatch' | 'sales';
type ReportSource = 'society' | 'bmc';

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
  const [reportSource, setReportSource] = useState<ReportSource>('society');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonType, setComparisonType] = useState<'collection-collection' | 'collection-dispatch' | 'collection-sales' | 'dispatch-dispatch' | 'dispatch-sales' | 'sales-sales'>('collection-collection');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [customDate, setCustomDate] = useState('');
  const [customWeekStart, setCustomWeekStart] = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Comparison filter states
  const [comparisonDairyFilter, setComparisonDairyFilter] = useState<string[]>([]);
  const [comparisonBmcFilter, setComparisonBmcFilter] = useState<string[]>([]);
  const [comparisonSocietyFilter, setComparisonSocietyFilter] = useState<string[]>([]);
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

  // Calculate date ranges for comparison based on time period
  const getComparisonDates = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    if (timePeriod === 'daily') {
      // Use custom date if provided, otherwise use today
      const currentDate = customDate ? new Date(customDate) : today;
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - 1);
      
      return {
        current: { 
          from: formatDate(currentDate), 
          to: formatDate(currentDate), 
          label: customDate ? formatDate(currentDate) : 'Today' 
        },
        previous: { 
          from: formatDate(previousDate), 
          to: formatDate(previousDate), 
          label: formatDate(previousDate)
        }
      };
    } else if (timePeriod === 'weekly') {
      // Use custom week start if provided, otherwise use current week
      const baseDate = customWeekStart ? new Date(customWeekStart) : today;
      const currentWeekStart = new Date(baseDate);
      currentWeekStart.setDate(baseDate.getDate() - baseDate.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      
      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(currentWeekStart.getDate() - 7);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
      
      const currentLabel = customWeekStart ? `Week of ${formatDate(currentWeekStart)}` : 'This Week';
      const previousLabel = `Week of ${formatDate(prevWeekStart)}`;
      
      return {
        current: { from: formatDate(currentWeekStart), to: formatDate(currentWeekEnd), label: currentLabel },
        previous: { from: formatDate(prevWeekStart), to: formatDate(prevWeekEnd), label: previousLabel }
      };
    } else if (timePeriod === 'monthly') {
      // Use custom month if provided (format: YYYY-MM), otherwise use current month
      let year = today.getFullYear();
      let month = today.getMonth();
      
      if (customMonth) {
        const [customYear, customMonthNum] = customMonth.split('-').map(Number);
        year = customYear;
        month = customMonthNum - 1; // JavaScript months are 0-indexed
      }
      
      const currentMonthStart = new Date(year, month, 1);
      const currentMonthEnd = new Date(year, month + 1, 0);
      
      const prevMonthStart = new Date(year, month - 1, 1);
      const prevMonthEnd = new Date(year, month, 0);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentLabel = customMonth ? `${monthNames[month]} ${year}` : 'This Month';
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const previousLabel = `${monthNames[prevMonth]} ${prevYear}`;
      
      return {
        current: { from: formatDate(currentMonthStart), to: formatDate(currentMonthEnd), label: currentLabel },
        previous: { from: formatDate(prevMonthStart), to: formatDate(prevMonthEnd), label: previousLabel }
      };
    } else { // yearly
      // Use custom year if provided, otherwise use current year
      const year = customYear ? parseInt(customYear) : today.getFullYear();
      
      const currentYearStart = new Date(year, 0, 1);
      const currentYearEnd = new Date(year, 11, 31);
      
      const prevYearStart = new Date(year - 1, 0, 1);
      const prevYearEnd = new Date(year - 1, 11, 31);
      
      const currentLabel = customYear ? `${year}` : 'This Year';
      const previousLabel = `${year - 1}`;
      
      return {
        current: { from: formatDate(currentYearStart), to: formatDate(currentYearEnd), label: currentLabel },
        previous: { from: formatDate(prevYearStart), to: formatDate(prevYearEnd), label: previousLabel }
      };
    }
  };

  const renderContent = () => {
    // Special comparison view for Society Collection vs Collection
    if (comparisonMode && reportSource === 'society' && comparisonType === 'collection-collection') {
      const dates = getComparisonDates();
      
      return (
        <ComparisonSummary 
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
        />
      );
    }

    // Special comparison view for Society Collection vs Dispatch
    if (comparisonMode && reportSource === 'society' && comparisonType === 'collection-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <CollectionDispatchComparison 
          dateRange={dates.current}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
        />
      );
    }

    // Special comparison view for Society Dispatch vs Dispatch
    if (comparisonMode && reportSource === 'society' && comparisonType === 'dispatch-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <DispatchComparison 
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
        />
      );
    }
    
    // Comparison mode with Society - show time-based comparisons
    if (comparisonMode && reportSource === 'society') {
      const dates = getComparisonDates();
      const [leftType, rightType] = comparisonType.split('-') as ['collection' | 'dispatch' | 'sales', 'collection' | 'dispatch' | 'sales'];
      
      const renderReport = (type: 'collection' | 'dispatch' | 'sales', dateRange: { from: string, to: string }, key: string) => {
        switch (type) {
          case 'collection':
            return <CollectionReports 
              key={key} 
              globalSearch={globalSearch} 
              reportSource="society" 
              initialSocietyId={initialSocietyId} 
              initialSocietyName={initialSocietyName} 
              initialFromDate={dateRange.from} 
              initialToDate={dateRange.to} 
              initialBmcFilter={initialBmcFilter} 
              initialMachineFilter={initialMachineFilter} 
            />;
          case 'dispatch':
            return <DispatchReports key={key} globalSearch={globalSearch} reportSource="society" />;
          case 'sales':
            return <SalesReports key={key} globalSearch={globalSearch} reportSource="society" />;
        }
      };

      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Previous Period */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {leftType.charAt(0).toUpperCase() + leftType.slice(1)} - {dates.previous.label}
                </h2>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {dates.previous.from} to {dates.previous.to}
              </span>
            </div>
            {renderReport(leftType, dates.previous, `${leftType}-prev-${timePeriod}`)}
          </div>

          {/* Current Period */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rightType.charAt(0).toUpperCase() + rightType.slice(1)} - {dates.current.label}
                </h2>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {dates.current.from} to {dates.current.to}
              </span>
            </div>
            {renderReport(rightType, dates.current, `${rightType}-curr-${timePeriod}`)}
          </div>
        </div>
      );
    }
    
    // Comparison mode with BMC - show Society vs BMC side by side
    if (comparisonMode && reportSource === 'bmc' && (activeTab === 'collection' || activeTab === 'dispatch')) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Society Report */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Society Reports</h2>
            </div>
            {activeTab === 'collection' ? (
              <CollectionReports 
                key={`collection-society`} 
                globalSearch={globalSearch} 
                reportSource="society" 
                initialSocietyId={initialSocietyId} 
                initialSocietyName={initialSocietyName} 
                initialFromDate={initialFromDate} 
                initialToDate={initialToDate} 
                initialBmcFilter={initialBmcFilter} 
                initialMachineFilter={initialMachineFilter} 
              />
            ) : (
              <DispatchReports key={`dispatch-society`} globalSearch={globalSearch} reportSource="society" />
            )}
          </div>

          {/* BMC Report */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">BMC Reports</h2>
            </div>
            {activeTab === 'collection' ? (
              <CollectionReports 
                key={`collection-bmc`} 
                globalSearch={globalSearch} 
                reportSource="bmc" 
                initialSocietyId={initialSocietyId} 
                initialSocietyName={initialSocietyName} 
                initialFromDate={initialFromDate} 
                initialToDate={initialToDate} 
                initialBmcFilter={initialBmcFilter} 
                initialMachineFilter={initialMachineFilter} 
              />
            ) : (
              <DispatchReports key={`dispatch-bmc`} globalSearch={globalSearch} reportSource="bmc" />
            )}
          </div>
        </div>
      );
    }

    // Normal single view mode
    const key = `${activeTab}-${reportSource}`;
    switch (activeTab) {
      case 'collection':
        return <CollectionReports key={key} globalSearch={globalSearch} reportSource={reportSource} initialSocietyId={initialSocietyId} initialSocietyName={initialSocietyName} initialFromDate={initialFromDate} initialToDate={initialToDate} initialBmcFilter={initialBmcFilter} initialMachineFilter={initialMachineFilter} />;
      case 'dispatch':
        return <DispatchReports key={key} globalSearch={globalSearch} reportSource={reportSource} />;
      case 'sales':
        return <SalesReports key={key} globalSearch={globalSearch} reportSource={reportSource} />;
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

            {/* Toggle Buttons - Right Side */}
            <div className="flex items-center gap-3">
              {/* Society/BMC Toggle */}
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => setReportSource('society')}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-sm
                      transition-all duration-200
                      ${
                        reportSource === 'society'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Society</span>
                  </button>
                  <button
                    onClick={() => setReportSource('bmc')}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-sm
                      transition-all duration-200
                      ${
                        reportSource === 'bmc'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">BMC</span>
                  </button>
                </div>

              {/* Comparison Button */}
              {(activeTab === 'collection' || activeTab === 'dispatch') && (
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md font-medium text-sm
                    transition-all duration-200
                    ${
                      comparisonMode
                        ? 'bg-psr-green-600 text-white hover:bg-psr-green-700'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                  title="Compare Society and BMC reports side by side"
                >
                  <GitCompare className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {comparisonMode ? 'Exit Comparison' : 'Compare'}
                  </span>
                </button>
              )}

              {/* Report Type Toggle - Show comparison options when comparison mode is active */}
              {comparisonMode && reportSource === 'society' ? (
                <div className="flex flex-col gap-2">
                  {/* Comparison Type Selection */}
                  <div className="inline-flex bg-psr-green-50 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
                    <button
                      onClick={() => setComparisonType('collection-collection')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        comparisonType === 'collection-collection'
                          ? 'bg-psr-green-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-psr-green-600'
                      }`}
                    >
                      Collection vs Collection
                    </button>
                    <button
                      onClick={() => setComparisonType('collection-dispatch')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        comparisonType === 'collection-dispatch'
                          ? 'bg-psr-green-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-psr-green-600'
                      }`}
                    >
                      Collection vs Dispatch
                    </button>
                    <button
                      onClick={() => setComparisonType('dispatch-dispatch')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        comparisonType === 'dispatch-dispatch'
                          ? 'bg-psr-green-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-psr-green-600'
                      }`}
                    >
                      Dispatch vs Dispatch
                    </button>
                  </div>
                  
                  {/* Time Period Selection with Custom Date in Same Row */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex bg-blue-50 dark:bg-gray-800 rounded-lg p-1 shadow-inner">
                      <button
                        onClick={() => {
                          setTimePeriod('daily');
                          setCustomDate('');
                          setCustomWeekStart('');
                          setCustomMonth('');
                          setCustomYear('');
                        }}
                        className={`px-3 py-1 rounded-md font-medium text-xs transition-all duration-200 ${
                          timePeriod === 'daily'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => {
                          setTimePeriod('weekly');
                          setCustomDate('');
                          setCustomWeekStart('');
                          setCustomMonth('');
                          setCustomYear('');
                        }}
                        className={`px-3 py-1 rounded-md font-medium text-xs transition-all duration-200 ${
                          timePeriod === 'weekly'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => {
                          setTimePeriod('monthly');
                          setCustomDate('');
                          setCustomWeekStart('');
                          setCustomMonth('');
                          setCustomYear('');
                        }}
                        className={`px-3 py-1 rounded-md font-medium text-xs transition-all duration-200 ${
                          timePeriod === 'monthly'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => {
                          setTimePeriod('yearly');
                          setCustomDate('');
                          setCustomWeekStart('');
                          setCustomMonth('');
                          setCustomYear('');
                        }}
                        className={`px-3 py-1 rounded-md font-medium text-xs transition-all duration-200 ${
                          timePeriod === 'yearly'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                    
                    {/* Custom Date Selection */}
                    <div className="flex items-center gap-2">
                    {timePeriod === 'daily' && (
                      <>
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Select date"
                        />
                        {customDate && (
                          <button
                            onClick={() => setCustomDate('')}
                            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear date"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    )}
                    {timePeriod === 'weekly' && (
                      <>
                        <input
                          type="date"
                          value={customWeekStart}
                          onChange={(e) => setCustomWeekStart(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Week start date"
                        />
                        {customWeekStart && (
                          <button
                            onClick={() => setCustomWeekStart('')}
                            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear week"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    )}
                    {timePeriod === 'monthly' && (
                      <>
                        <input
                          type="month"
                          value={customMonth}
                          onChange={(e) => setCustomMonth(e.target.value)}
                          max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Select month"
                        />
                        {customMonth && (
                          <button
                            onClick={() => setCustomMonth('')}
                            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear month"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    )}
                    {timePeriod === 'yearly' && (
                      <>
                        <input
                          type="number"
                          value={customYear}
                          onChange={(e) => setCustomYear(e.target.value)}
                          min="2000"
                          max={new Date().getFullYear()}
                          className="px-3 py-1.5 text-xs w-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Year"
                        />
                        {customYear && (
                          <button
                            onClick={() => setCustomYear('')}
                            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear year"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    )}                    </div>                  </div>
                </div>
              ) : (
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
              )}
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
