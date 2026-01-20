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
import SalesComparison from '@/components/reports/SalesComparison';
import BmcComparisonSummary from '@/components/reports/BmcComparisonSummary';
import BmcCollectionDispatchComparison from '@/components/reports/BmcCollectionDispatchComparison';
import BmcVsSocietyComparison from '@/components/reports/BmcVsSocietyComparison';

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
  const [comparisonType, setComparisonType] = useState<'collection-collection' | 'collection-dispatch' | 'collection-sales' | 'dispatch-dispatch' | 'dispatch-sales' | 'sales-sales' | 'bmc-society'>('collection-collection');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [customDate, setCustomDate] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [customWeekStart, setCustomWeekStart] = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Comparison filter states
  const [comparisonDairyFilter, setComparisonDairyFilter] = useState<string[]>([]);
  const [comparisonBmcFilter, setComparisonBmcFilter] = useState<string[]>([]);
  const [comparisonSocietyFilter, setComparisonSocietyFilter] = useState<string[]>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [showBmcDialog, setShowBmcDialog] = useState(false);
  const [showSocietyDialog, setShowSocietyDialog] = useState(false);
  const [tempBmcSelection, setTempBmcSelection] = useState<string[]>([]);
  const [tempSocietySelection, setTempSocietySelection] = useState<string[]>([]);
  const [filteredSocieties, setFilteredSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const [bmcsRes, societiesRes] = await Promise.all([
          fetch('/api/user/bmc', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/user/society', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (bmcsRes.ok) {
          const data = await bmcsRes.json();
          setBmcs(data.data || []);
        }
        
        if (societiesRes.ok) {
          const data = await societiesRes.json();
          setSocieties(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (comparisonBmcFilter.length > 0 && societies.length > 0) {
      const selectedBmcId = parseInt(comparisonBmcFilter[0]);
      const filtered = societies.filter(s => s.bmc_id === selectedBmcId);
      setFilteredSocieties(filtered);
    } else {
      setFilteredSocieties([]);
    }
  }, [comparisonBmcFilter, societies]);

  const handleComparisonToggle = () => {
    if (!comparisonMode && reportSource === 'bmc') {
      setTempBmcSelection(comparisonBmcFilter.length > 0 ? [comparisonBmcFilter[0]] : []);
      setShowBmcDialog(true);
      setComparisonType('bmc-society'); // Set default to BMC vs Society for BMC mode
    } else {
      setComparisonMode(!comparisonMode);
      // Reset to collection-collection when exiting comparison mode
      if (comparisonMode) {
        setComparisonType('collection-collection');
      }
    }
  };

  const confirmBmcSelection = () => {
    if (tempBmcSelection.length === 0) {
      alert('Please select one BMC');
      return;
    }
    setComparisonBmcFilter(tempBmcSelection);
    setShowBmcDialog(false);
    setComparisonMode(true);
    
    // Show society selection dialog after BMC selection
    setTimeout(() => {
      setTempSocietySelection(comparisonSocietyFilter.length > 0 ? [comparisonSocietyFilter[0]] : []);
      setShowSocietyDialog(true);
    }, 300);
  };

  const confirmSocietySelection = () => {
    if (tempSocietySelection.length === 0) {
      alert('Please select one Society');
      return;
    }
    setComparisonSocietyFilter(tempSocietySelection);
    setShowSocietyDialog(false);
  };

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
      // Use custom date range if provided, otherwise use today
      if (customDate && customDateTo) {
        // Date range mode
        return {
          current: { 
            from: customDate, 
            to: customDateTo, 
            label: `${customDate} to ${customDateTo}` 
          },
          previous: { 
            from: customDate, 
            to: customDateTo, 
            label: `${customDate} to ${customDateTo}`
          }
        };
      } else if (customDate) {
        // Single date comparison mode
        const currentDate = new Date(customDate);
        const previousDate = new Date(currentDate);
        previousDate.setDate(currentDate.getDate() - 1);
        
        return {
          current: { 
            from: formatDate(currentDate), 
            to: formatDate(currentDate), 
            label: formatDate(currentDate) 
          },
          previous: { 
            from: formatDate(previousDate), 
            to: formatDate(previousDate), 
            label: formatDate(previousDate)
          }
        };
      } else {
        // Default: today vs yesterday
        const currentDate = today;
        const previousDate = new Date(today);
        previousDate.setDate(today.getDate() - 1);
        
        return {
          current: { 
            from: formatDate(currentDate), 
            to: formatDate(currentDate), 
            label: 'Today' 
          },
          previous: { 
            from: formatDate(previousDate), 
            to: formatDate(previousDate), 
            label: formatDate(previousDate)
          }
        };
      }
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
          key={`collection-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for Society Collection vs Dispatch
    if (comparisonMode && reportSource === 'society' && comparisonType === 'collection-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <CollectionDispatchComparison 
          key={`collection-dispatch-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current}
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for Society Dispatch vs Dispatch
    if (comparisonMode && reportSource === 'society' && comparisonType === 'dispatch-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <DispatchComparison 
          key={`dispatch-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for Society Sales vs Sales
    if (comparisonMode && reportSource === 'society' && comparisonType === 'sales-sales') {
      const dates = getComparisonDates();
      
      return (
        <SalesComparison 
          key={`sales-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
          timePeriod={timePeriod}
        />
      );
    }
    
    // Special comparison view for BMC Collection vs Collection
    if (comparisonMode && reportSource === 'bmc' && comparisonType === 'collection-collection') {
      const dates = getComparisonDates();
      
      return (
        <BmcComparisonSummary 
          key={`bmc-collection-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          reportSource={reportSource}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for BMC Collection vs Dispatch
    if (comparisonMode && reportSource === 'bmc' && comparisonType === 'collection-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <BmcCollectionDispatchComparison 
          key={`bmc-collection-dispatch-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current}
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          reportSource={reportSource}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for BMC Dispatch vs Dispatch
    if (comparisonMode && reportSource === 'bmc' && comparisonType === 'dispatch-dispatch') {
      const dates = getComparisonDates();
      
      return (
        <DispatchComparison 
          key={`bmc-dispatch-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={[]}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={() => {}}
          reportSource={reportSource}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for BMC Sales vs Sales
    if (comparisonMode && reportSource === 'bmc' && comparisonType === 'sales-sales') {
      const dates = getComparisonDates();
      
      return (
        <SalesComparison 
          key={`bmc-sales-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          currentDate={dates.current} 
          previousDate={dates.previous}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={[]}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={() => {}}
          reportSource={reportSource}
          timePeriod={timePeriod}
        />
      );
    }

    // Special comparison view for BMC vs Society
    if (comparisonMode && reportSource === 'bmc' && comparisonType === 'bmc-society') {
      const dates = getComparisonDates();
      
      return (
        <BmcVsSocietyComparison 
          key={`bmc-society-comparison-${timePeriod}-${customDate}-${customWeekStart}-${customMonth}-${customYear}`}
          dateRange={dates.current}
          dairyFilter={comparisonDairyFilter}
          bmcFilter={comparisonBmcFilter}
          societyFilter={comparisonSocietyFilter}
          onDairyChange={setComparisonDairyFilter}
          onBmcChange={setComparisonBmcFilter}
          onSocietyChange={setComparisonSocietyFilter}
          reportSource={reportSource}
          timePeriod={timePeriod}
        />
      );
    }
    

    
    // Comparison mode with BMC - removed old side-by-side view
    // Now BMC uses same comparison structure as society (handled above)

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
              {(activeTab === 'collection' || activeTab === 'dispatch' || activeTab === 'sales') && (
                <button
                  onClick={handleComparisonToggle}
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
              {comparisonMode && (reportSource === 'society' || reportSource === 'bmc') ? (
                <div className="flex flex-col gap-2">
                  {/* Comparison Type Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comparison Type:</label>
                    <select
                      value={comparisonType}
                      onChange={(e) => {
                        const newType = e.target.value as typeof comparisonType;
                        setComparisonType(newType);
                        if (reportSource === 'bmc' && newType === 'bmc-society' && comparisonBmcFilter.length === 0) {
                          setTempBmcSelection([]);
                          setShowBmcDialog(true);
                        }
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-psr-green-500 focus:border-transparent"
                    >
                      {reportSource === 'bmc' && (
                        <option value="bmc-society">BMC vs Society</option>
                      )}
                      <option value="collection-collection">Collection vs Collection</option>
                      <option value="collection-dispatch">Collection vs Dispatch</option>
                      <option value="dispatch-dispatch">Dispatch vs Dispatch</option>
                      <option value="sales-sales">Sales vs Sales</option>
                    </select>
                  </div>
                  
                  {/* Time Period Selection with Custom Date in Same Row */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period:</label>
                      <select
                        value={timePeriod}
                        onChange={(e) => {
                          setTimePeriod(e.target.value as typeof timePeriod);
                          setCustomDate('');
                          setCustomDateTo('');
                          setCustomWeekStart('');
                          setCustomMonth('');
                          setCustomYear('');
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    
                    {/* Custom Date Selection */}
                    <div className="flex items-center gap-2">
                    {timePeriod === 'daily' && (
                      <>
                        <label className="text-xs text-gray-600 dark:text-gray-400">From:</label>
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="From date"
                        />
                        <label className="text-xs text-gray-600 dark:text-gray-400">To:</label>
                        <input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => {
                            const fromDate = new Date(customDate);
                            const toDate = new Date(e.target.value);
                            const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysDiff > 31) {
                              alert('Maximum date range is 31 days');
                              return;
                            }
                            setCustomDateTo(e.target.value);
                          }}
                          min={customDate}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="To date"
                        />
                        {(customDate || customDateTo) && (
                          <button
                            onClick={() => { setCustomDate(''); setCustomDateTo(''); }}
                            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear dates"
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

      {showBmcDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-psr-green-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select BMC</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Select one BMC for comparison</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {bmcs.length > 0 ? (
                <div className="space-y-2">
                  {bmcs.map((bmc) => (
                    <label key={bmc.id} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-600">
                      <input
                        type="radio"
                        name="bmcSelection"
                        checked={tempBmcSelection.includes(bmc.id.toString())}
                        onChange={() => setTempBmcSelection([bmc.id.toString()])}
                        className="w-4 h-4 text-psr-green-600 border-gray-300 focus:ring-psr-green-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{bmc.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({bmc.bmcId})</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading BMCs...</p>
              )}
              {tempBmcSelection.length > 0 && (
                <p className="text-sm text-psr-green-600 dark:text-psr-green-400 mt-4 text-center">
                  ✓ {bmcs.find(b => b.id.toString() === tempBmcSelection[0])?.name} selected
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button onClick={() => { setShowBmcDialog(false); setTempBmcSelection([]); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">Cancel</button>
              <button onClick={confirmBmcSelection} className="flex-1 px-4 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSocietyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-psr-green-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Society</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Select one Society to compare with the selected BMC</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSocieties.length > 0 ? (
                <div className="space-y-2">
                  {filteredSocieties.map((society) => (
                    <label key={society.id} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-600">
                      <input
                        type="radio"
                        name="societySelection"
                        checked={tempSocietySelection.includes(society.id.toString())}
                        onChange={() => setTempSocietySelection([society.id.toString()])}
                        className="w-4 h-4 text-psr-green-600 border-gray-300 focus:ring-psr-green-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{society.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({society.society_id})</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No societies found for selected BMC</p>
              )}
              {tempSocietySelection.length > 0 && (
                <p className="text-sm text-psr-green-600 dark:text-psr-green-400 mt-4 text-center">
                  ✓ {filteredSocieties.find(s => s.id.toString() === tempSocietySelection[0])?.name} selected
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button onClick={() => { setShowSocietyDialog(false); setTempSocietySelection([]); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">Cancel</button>
              <button onClick={confirmSocietySelection} className="flex-1 px-4 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
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


