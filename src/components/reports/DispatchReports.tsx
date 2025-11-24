'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Download,
  FileDown,
  Truck,
  Package,
  TrendingUp,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatsCard from '@/components/management/StatsCard';
import { FlowerSpinner } from '@/components';
import { FilterDropdown } from '@/components/management';

interface DispatchRecord {
  id: number;
  dispatch_id: string;
  society_id: string;
  society_name: string;
  bmc_id?: number;
  bmc_name?: string;
  dairy_id?: number;
  dairy_name?: string;
  machine_id: string;
  dispatch_date: string;
  dispatch_time: string;
  shift_type: string;
  channel: string;
  quantity: string;
  fat_percentage: string;
  snf_percentage: string;
  clr_value: string;
  rate_per_liter: string;
  total_amount: string;
  machine_type: string;
  machine_version: string;
}

interface DispatchStats {
  totalDispatches: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
}

// Helper function to highlight matching text in search results
const highlightText = (text: string | number, searchQuery: string) => {
  if (!searchQuery) return text;
  
  const textStr = text.toString();
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = textStr.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Helper function to map channel codes to display names
const getChannelDisplay = (channel: string): string => {
  const channelMap: { [key: string]: string } = {
    'ch1': 'COW',
    'ch2': 'BUFFALO',
    'ch3': 'MIXED',
    'CH1': 'COW',
    'CH2': 'BUFFALO',
    'CH3': 'MIXED',
    'COW': 'COW',
    'BUFFALO': 'BUFFALO',
    'MIXED': 'MIXED',
    'cow': 'COW',
    'buffalo': 'BUFFALO',
    'mixed': 'MIXED'
  };
  return channelMap[channel] || channel.toUpperCase();
};

interface DispatchReportsProps {
  globalSearch?: string;
}

export default function DispatchReports({ globalSearch = '' }: DispatchReportsProps) {
  const [records, setRecords] = useState<DispatchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DispatchRecord[]>([]);
  const [stats, setStats] = useState<DispatchStats>({
    totalDispatches: 0,
    totalQuantity: 0,
    totalAmount: 0,
    averageRate: 0,
    weightedFat: 0,
    weightedSnf: 0,
    weightedClr: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sync global search with local search
  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  // Combined search from global header and local search
  const combinedSearch = useMemo(() => globalSearch || searchQuery, [globalSearch, searchQuery]);
  
  const [dateFilter, setDateFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [dairyFilter, setDairyFilter] = useState('all');
  const [bmcFilter, setBmcFilter] = useState('all');
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Fetch dairies and BMCs
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairy_id: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmc_id: string; dairyFarmId?: number }>>([]);
  const [societiesData, setSocietiesData] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);

  useEffect(() => {
    const fetchDairiesAndBmcs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const dairyRes = await fetch('/api/user/dairy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dairyRes.ok) {
          const dairyData = await dairyRes.json();
          setDairies(dairyData.data || []);
        }

        const bmcRes = await fetch('/api/user/bmc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bmcRes.ok) {
          const bmcData = await bmcRes.json();
          setBmcs(bmcData.data || []);
        }

        const societyRes = await fetch('/api/user/society', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (societyRes.ok) {
          const societyData = await societyRes.json();
          setSocietiesData(societyData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dairies/BMCs:', error);
      }
    };

    fetchDairiesAndBmcs();
  }, []);

  // Filter dairies to only show those with dispatch records
  const dairiesWithDispatches = useMemo(() => {
    if (!dairies.length || !records.length) return dairies;
    
    const dairyIdsInDispatches = new Set(
      records
        .filter(r => r.dairy_id)
        .map(r => r.dairy_id)
    );
    
    return dairies.filter(dairy => dairyIdsInDispatches.has(dairy.id));
  }, [dairies, records]);

  // Clear all filters
  const clearFilters = () => {
    setShiftFilter('all');
    setDairyFilter('all');
    setBmcFilter('all');
    setSocietyFilter([]);
    setMachineFilter('all');
    setDateFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setChannelFilter('all');
    setSearchQuery('');
    
    // Clear header search
    const event = new CustomEvent('globalSearch', {
      detail: { query: '' }
    });
    window.dispatchEvent(event);
  };
  
  // Extract unique societies and machines from records (memoized)
  const societies = useMemo(() => {
    const uniqueSocieties = new Map<string, { society_id: string; society_name: string }>();
    records.forEach(r => {
      if (r.society_id && !uniqueSocieties.has(r.society_id)) {
        uniqueSocieties.set(r.society_id, {
          society_id: r.society_id,
          society_name: r.society_id // Dispatch API doesn't return society_name yet
        });
      }
    });
    return Array.from(uniqueSocieties.values()).map((society, index) => ({
      id: index + 1,
      name: society.society_name,
      society_id: society.society_id
    }));
  }, [records]);
  
  const machines = useMemo(() => {
    const uniqueMachines = new Map<string, { machine_id: string; machine_type: string; society_id: string }>();
    records.forEach(r => {
      if (r.machine_id && !uniqueMachines.has(r.machine_id)) {
        uniqueMachines.set(r.machine_id, {
          machine_id: r.machine_id,
          machine_type: r.machine_type || r.machine_id,
          society_id: r.society_id
        });
      }
    });
    return Array.from(uniqueMachines.values()).map((machine, index) => ({
      id: index + 1,
      machineId: machine.machine_id,
      machineType: machine.machine_type,
      societyId: societies.findIndex(s => s.society_id === machine.society_id) + 1 || undefined
    }));
  }, [records, societies]);

  // Calculate statistics
  const calculateStats = useCallback((data: DispatchRecord[]) => {
    const totalQuantity = data.reduce((sum, record) => sum + parseFloat(record.quantity || '0'), 0);
    const totalAmount = data.reduce((sum, record) => sum + parseFloat(record.total_amount || '0'), 0);
    
    // Calculate simple average rate from rate_per_liter column
    const totalRate = data.reduce((sum, record) => sum + parseFloat(record.rate_per_liter || '0'), 0);
    const averageRate = data.length > 0 ? totalRate / data.length : 0;
    
    // Calculate weighted averages
    const sumQuantityFat = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const fat = parseFloat(record.fat_percentage || '0');
      return sum + (qty * fat);
    }, 0);
    const sumQuantitySnf = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const snf = parseFloat(record.snf_percentage || '0');
      return sum + (qty * snf);
    }, 0);
    const sumQuantityClr = data.reduce((sum, record) => {
      const qty = parseFloat(record.quantity || '0');
      const clr = parseFloat(record.clr_value || '0');
      return sum + (qty * clr);
    }, 0);
    
    const weightedFat = totalQuantity > 0 ? sumQuantityFat / totalQuantity : 0;
    const weightedSnf = totalQuantity > 0 ? sumQuantitySnf / totalQuantity : 0;
    const weightedClr = totalQuantity > 0 ? sumQuantityClr / totalQuantity : 0;

    setStats({
      totalDispatches: data.length,
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      weightedFat: parseFloat(weightedFat.toFixed(2)),
      weightedSnf: parseFloat(weightedSnf.toFixed(2)),
      weightedClr: parseFloat(weightedClr.toFixed(2))
    });
  }, []);

  // Fetch dispatch data
  const fetchData = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      if (showLoading) setLoading(true);
      const response = await fetch('/api/user/reports/dispatches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchData(true);
    
    // Auto-refresh every 1 second without showing loading
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Filter records with multi-field search (matching machine management pattern)
  useEffect(() => {
    let filtered = records;

    // Dairy filter
    if (dairyFilter !== 'all') {
      const selectedDairy = dairies.find(d => d.id.toString() === dairyFilter);
      if (selectedDairy) {
        filtered = filtered.filter(record => record.dairy_id === selectedDairy.id);
      }
    }

    // BMC filter
    if (bmcFilter !== 'all') {
      const selectedBmc = bmcs.find(b => b.id.toString() === bmcFilter);
      if (selectedBmc) {
        filtered = filtered.filter(record => record.bmc_id === selectedBmc.id);
      }
    }

    // Status/Shift filter
    if (shiftFilter !== 'all') {
      if (shiftFilter === 'morning') {
        filtered = filtered.filter(record => ['MR', 'MX', 'morning'].includes(record.shift_type));
      } else if (shiftFilter === 'evening') {
        filtered = filtered.filter(record => ['EV', 'EX', 'evening'].includes(record.shift_type));
      } else {
        filtered = filtered.filter(record => record.shift_type === shiftFilter);
      }
    }

    // Society filter
    if (Array.isArray(societyFilter) && societyFilter.length > 0) {
      const selectedSocietyIds = societyFilter.map(id => {
        const society = societies.find(s => s.id.toString() === id);
        return society?.society_id;
      }).filter(Boolean);
      if (selectedSocietyIds.length > 0) {
        filtered = filtered.filter(record => selectedSocietyIds.includes(record.society_id));
      }
    }

    // Machine filter
    if (machineFilter !== 'all') {
      const selectedMachine = machines.find(m => m.id.toString() === machineFilter);
      if (selectedMachine) {
        filtered = filtered.filter(record => record.machine_id === selectedMachine.machineId);
      }
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(record => {
        const displayChannel = getChannelDisplay(record.channel);
        return displayChannel === channelFilter;
      });
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.dispatch_date === dateFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(record => record.dispatch_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter(record => record.dispatch_date <= dateToFilter);
    }

    // Multi-field search across dispatch details (matching machine management pattern)
    if (combinedSearch) {
      const searchLower = combinedSearch.toLowerCase();
      filtered = filtered.filter(record =>
        [
          record.dispatch_id,
          record.society_id,
          record.society_name,
          record.machine_id,
          record.channel,
          getChannelDisplay(record.channel),
          record.dispatch_date,
          record.shift_type
        ].some(field =>
          field?.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
  }, [globalSearch, searchQuery, dateFilter, dateFromFilter, dateToFilter, shiftFilter, channelFilter, societyFilter, machineFilter, dairyFilter, bmcFilter, records, societies, machines, dairies, bmcs, calculateStats]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return;

    const dateRange = dateFromFilter && dateToFilter 
      ? `${dateFromFilter} To ${dateToFilter}`
      : dateFilter || 'All Dates';
    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    // Detailed data rows
    const dataRows = filteredRecords.map(record => [
      record.dispatch_date,
      record.dispatch_time,
      record.channel,
      record.shift_type,
      record.machine_type,
      record.machine_id,
      record.society_id,
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    const csvContent = [
      'Admin Report - LactoConnect Milk Dispatch System',
      `Date From ${dateRange}`,
      '',
      'DETAILED DISPATCH DATA',
      '',
      'Date,Time,Channel,Shift,MachineType,Machine ID,Society ID,Fat (%),SNF (%),CLR,Rate,Quantity (L),Total Amount',
      ...dataRows.map(row => row.join(',')),
      '',
      '',
      'OVERALL SUMMARY',
      `Total Dispatches:,${stats.totalDispatches}`,
      `Total Quantity (L):,${stats.totalQuantity.toFixed(2)}`,
      `Overall Weighted Fat (%):,${stats.weightedFat.toFixed(2)}`,
      `Overall Weighted SNF (%):,${stats.weightedSnf.toFixed(2)}`,
      `Overall Weighted CLR:,${stats.weightedClr.toFixed(2)}`,
      `Total Amount (Rs):,${stats.totalAmount.toFixed(2)}`,
      `Overall Average Rate (Rs/L):,${stats.averageRate.toFixed(2)}`,
      '',
      'Thank you',
      'Poornasree Equipments',
      `Generated on: ${currentDateTime}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispatch-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    if (filteredRecords.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dateRange = dateFromFilter && dateToFilter 
      ? `${dateFromFilter} To ${dateToFilter}`
      : dateFilter 
      ? `${dateFilter} To ${dateFilter}`
      : 'All Dates';

    // Add Logo
    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Dispatch Report - LactoConnect Milk Dispatch System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED DISPATCH DATA', 148.5, 28, { align: 'center' });

    // Detailed Data Table with SI No
    const tableData = filteredRecords.map((record, index) => [
      (index + 1).toString(),
      record.dispatch_date,
      record.dispatch_time,
      getChannelDisplay(record.channel),
      record.shift_type,
      record.machine_type,
      record.machine_id,
      record.society_id,
      record.fat_percentage,
      record.snf_percentage,
      record.clr_value,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['SI No', 'Date', 'Time', 'Channel', 'Shift', 'MachineType', 'Machine ID', 'Society ID', 'Fat (%)', 'SNF (%)', 'CLR', 'Rate', 'Quantity (L)', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 12 }
      }
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Left side - Weighted Averages
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WEIGHTED AVERAGES', 14, finalY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let leftY = finalY + 6;
    doc.text(`Weighted Fat      : ${stats.weightedFat.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted SNF      : ${stats.weightedSnf.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Weighted CLR      : ${stats.weightedClr.toFixed(2)}`, 14, leftY);
    
    leftY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('OVERALL SUMMARY', 14, leftY);
    doc.setFont('helvetica', 'normal');
    leftY += 6;
    doc.text(`Total Dispatches   : ${stats.totalDispatches}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);

    // Right side - Report Notes
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT NOTES', 283, finalY, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let rightY = finalY + 6;
    doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('Contact: marketing@poornasree.com', 283, rightY, { align: 'right' });
    
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('POORNASREE EQUIPMENTS', 283, rightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    rightY += 5;
    doc.text('Thank you for using LactoConnect', 283, rightY, { align: 'right' });
    rightY += 5;
    doc.text('For support, visit: www.poornasree.com', 283, rightY, { align: 'right' });

    doc.save(`dispatch-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FlowerSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-7 gap-3">
        <StatsCard
          title="Total Dispatches"
          value={stats.totalDispatches}
          icon={<Truck className="w-full h-full" />}
          color="green"
        />
        <StatsCard
          title="Total Quantity (L)"
          value={stats.totalQuantity}
          icon={<Package className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Total Amount (₹)"
          value={`₹${stats.totalAmount.toFixed(2)}`}
          icon={<TrendingUp className="w-full h-full" />}
          color="yellow"
        />
        <StatsCard
          title="Avg Rate (₹/L)"
          value={`₹${stats.averageRate.toFixed(2)}`}
          icon={<BarChart3 className="w-full h-full" />}
          color="gray"
        />
        <StatsCard
          title="Weighted FAT (%)"
          value={stats.weightedFat.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Weighted SNF (%)"
          value={stats.weightedSnf.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="green"
        />
        <StatsCard
          title="Weighted CLR"
          value={stats.weightedClr.toFixed(2)}
          icon={<BarChart3 className="w-full h-full" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Filter Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearFilters();
                  fetchData();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-psr-primary-600 text-white rounded-lg hover:bg-psr-primary-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-psr-green-600 text-white rounded-lg hover:bg-psr-green-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm hover:shadow-md"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown - All Filters Inside */}
          <FilterDropdown
            statusFilter={shiftFilter}
            onStatusChange={setShiftFilter}
            dairyFilter={dairyFilter}
            onDairyChange={setDairyFilter}
            bmcFilter={bmcFilter}
            onBmcChange={setBmcFilter}
            societyFilter={societyFilter}
            onSocietyChange={(value) => setSocietyFilter(Array.isArray(value) ? value : [value])}
            machineFilter={machineFilter}
            onMachineChange={setMachineFilter}
            dairies={dairiesWithDispatches}
            bmcs={bmcs}
            societies={societies}
            machines={machines}
            filteredCount={filteredRecords.length}
            totalCount={records.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            icon={<Truck className="w-5 h-5" />}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            dateFromFilter={dateFromFilter}
            onDateFromChange={setDateFromFilter}
            dateToFilter={dateToFilter}
            onDateToChange={setDateToFilter}
            channelFilter={channelFilter}
            onChannelChange={setChannelFilter}
            showDateFilter
            showChannelFilter
            showShiftFilter
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-auto max-h-[600px]" tabIndex={0}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dispatch ID</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shift</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty (L)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fat %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SNF %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No dispatch records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div>{highlightText(record.dispatch_date, combinedSearch)}</div>
                        <div className="text-xs text-gray-500">{record.dispatch_time}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                        {highlightText(record.dispatch_id, combinedSearch)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="font-medium">{highlightText(record.society_name, combinedSearch)}</div>
                        <div className="text-xs text-gray-500">ID: {highlightText(record.society_id, combinedSearch)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ['MR', 'MX'].includes(record.shift_type)
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {['MR', 'MX'].includes(record.shift_type) ? 'Morning' : 'Evening'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getChannelDisplay(record.channel) === 'COW'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : getChannelDisplay(record.channel) === 'BUFFALO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {highlightText(getChannelDisplay(record.channel), combinedSearch)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{highlightText(parseFloat(record.quantity).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.fat_percentage).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{highlightText(parseFloat(record.snf_percentage).toFixed(2), combinedSearch)}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-green-600 dark:text-green-400">
                        ₹{highlightText(parseFloat(record.total_amount).toFixed(2), combinedSearch)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {expandedRow === record.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === record.id && (
                      <tr>
                        <td colSpan={10} className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Machine:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{highlightText(record.machine_id || 'N/A', combinedSearch)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Machine Type:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{highlightText(record.machine_type || 'N/A', combinedSearch)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Rate/L:</span>
                              <div className="font-medium text-gray-900 dark:text-white">₹{record.rate_per_liter}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Machine Type:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{record.machine_type} v{record.machine_version}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
