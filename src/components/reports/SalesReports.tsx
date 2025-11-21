'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Download,
  FileDown,
  DollarSign,
  ShoppingCart,
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

interface SalesRecord {
  id: number;
  count: string;
  society_id: string;
  machine_id: string;
  sales_date: string;
  sales_time: string;
  channel: string;
  quantity: string;
  rate_per_liter: string;
  total_amount: string;
  machine_type: string;
  machine_version: string;
}

interface SalesStats {
  totalSales: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
}

export default function SalesReports() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SalesRecord[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalQuantity: 0,
    totalAmount: 0,
    averageRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [societyFilter, setSocietyFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // Extract unique societies and machines from records (memoized)
  const societies = useMemo(() => {
    const uniqueSocieties = new Map<string, { society_id: string; society_name: string }>();
    records.forEach(r => {
      if (r.society_id && !uniqueSocieties.has(r.society_id)) {
        uniqueSocieties.set(r.society_id, {
          society_id: r.society_id,
          society_name: r.society_id // Sales API doesn't return society_name yet
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
  const calculateStats = useCallback((data: SalesRecord[]) => {
    const totalQuantity = data.reduce((sum, record) => sum + parseFloat(record.quantity || '0'), 0);
    const totalAmount = data.reduce((sum, record) => sum + parseFloat(record.total_amount || '0'), 0);
    const averageRate = data.length > 0 ? totalAmount / totalQuantity : 0;

    setStats({
      totalSales: data.length,
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2))
    });
  }, []);

  // Fetch sales data
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/user/reports/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records with multi-field search (matching machine management pattern)
  useEffect(() => {
    let filtered = records;

    // Society filter
    if (societyFilter !== 'all') {
      const selectedSociety = societies.find(s => s.id.toString() === societyFilter);
      if (selectedSociety) {
        filtered = filtered.filter(record => record.society_id === selectedSociety.society_id);
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
      filtered = filtered.filter(record => record.channel === channelFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.sales_date === dateFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(record => record.sales_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter(record => record.sales_date <= dateToFilter);
    }

    // Multi-field search across sales details (matching machine management pattern)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        [
          record.count,
          record.society_id,
          record.machine_id,
          record.channel,
          record.sales_date
        ].some(field =>
          field?.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
  }, [searchQuery, dateFilter, dateFromFilter, dateToFilter, channelFilter, societyFilter, machineFilter, records, societies, machines, calculateStats]);

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
      record.sales_date,
      record.sales_time,
      record.channel,
      record.machine_type,
      record.machine_id,
      record.society_id,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    const csvContent = [
      'Admin Report - LactoConnect Milk Sales System',
      `Date From ${dateRange}`,
      '',
      'DETAILED SALES DATA',
      '',
      'Date,Time,Channel,MachineType,Machine ID,Society ID,Rate,Quantity (L),Total Amount',
      ...dataRows.map(row => row.join(',')),
      '',
      '',
      'OVERALL SUMMARY',
      `Total Sales:,${stats.totalSales}`,
      `Total Quantity (L):,${stats.totalQuantity.toFixed(2)}`,
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
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
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
    doc.text('Daily Sales Report - LactoConnect Milk Sales System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date From ${dateRange}`, 148.5, 21, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED SALES DATA', 148.5, 28, { align: 'center' });

    // Detailed Data Table with SI No
    const tableData = filteredRecords.map((record, index) => [
      (index + 1).toString(),
      record.sales_date,
      record.sales_time,
      record.channel,
      record.machine_type,
      record.machine_id,
      record.society_id,
      record.rate_per_liter,
      record.quantity,
      record.total_amount
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['SI No', 'Date', 'Time', 'Channel', 'MachineType', 'Machine ID', 'Society ID', 'Rate', 'Quantity (L)', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 15 }
      }
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Left side - Overall Summary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OVERALL SUMMARY', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let leftY = finalY + 6;
    doc.text(`Total Sales        : ${stats.totalSales}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Quantity (L) : ${stats.totalQuantity.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Total Amount       : ${stats.totalAmount.toFixed(2)}`, 14, leftY);
    leftY += 5;
    doc.text(`Avg Rate (Rs/L)    : ${stats.averageRate.toFixed(2)}`, 14, leftY);

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

    doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sales"
          value={stats.totalSales}
          icon={<ShoppingCart className="w-full h-full" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity (L)"
          value={stats.totalQuantity}
          icon={<BarChart3 className="w-full h-full" />}
          color="green"
        />
        <StatsCard
          title="Total Amount (₹)"
          value={`₹${stats.totalAmount.toFixed(2)}`}
          icon={<DollarSign className="w-full h-full" />}
          color="yellow"
        />
        <StatsCard
          title="Avg Rate (₹/L)"
          value={`₹${stats.averageRate.toFixed(2)}`}
          icon={<TrendingUp className="w-full h-full" />}
          color="gray"
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
                onClick={fetchData}
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
            statusFilter="all"
            onStatusChange={() => {}}
            societyFilter={societyFilter}
            onSocietyChange={setSocietyFilter}
            machineFilter={machineFilter}
            onMachineChange={setMachineFilter}
            societies={societies}
            machines={machines}
            filteredCount={filteredRecords.length}
            totalCount={records.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            icon={<DollarSign className="w-5 h-5" />}
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
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty (L)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate/L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No sales records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white whitespace-nowrap">
                        <div>{record.sales_date}</div>
                        <div className="text-xs text-gray-500">{record.sales_time}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                        #{record.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{record.society_id}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.channel === 'COW'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : record.channel === 'BUFFALO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {record.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                        {parseFloat(record.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                        ₹{parseFloat(record.rate_per_liter).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-green-600 dark:text-green-400">
                        ₹{parseFloat(record.total_amount).toFixed(2)}
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
                        <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Machine ID:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{record.machine_id}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Machine Type:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{record.machine_type}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Version:</span>
                              <div className="font-medium text-gray-900 dark:text-white">v{record.machine_version}</div>
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
