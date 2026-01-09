'use client';

// Society Collection Reports Component
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download,
  Droplet,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatsCard from '@/components/management/StatsCard';
import { FlowerSpinner, PageLoader } from '@/components';

interface CollectionRecord {
  id: number;
  collectionDate: string;
  collectionTime: string;
  shiftType: string;
  channel: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  fatPercentage: number;
  snfPercentage: number;
  clrValue: number;
  ratePerLiter: number;
  totalAmount: number;
}

interface CollectionStats {
  totalCollections: number;
  totalQuantity: number;
  totalAmount: number;
  averageFat: number;
  averageSnf: number;
}

interface SocietyCollectionReportsProps {
  globalSearch?: string;
  initialFromDate?: string | null;
  initialToDate?: string | null;
  initialFarmerFilter?: string | null;
}

export default function SocietyCollectionReports({ 
  globalSearch = '', 
  initialFromDate,
  initialToDate,
  initialFarmerFilter
}: SocietyCollectionReportsProps) {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<CollectionRecord[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Filters
  const [dateFrom, setDateFrom] = useState(initialFromDate || '');
  const [dateTo, setDateTo] = useState(initialToDate || '');
  const [channelFilter, setChannelFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [farmerFilter, setFarmerFilter] = useState(initialFarmerFilter || '');

  // Get user data on mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch collections when user is available
  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user, dateFrom, dateTo]);

  const fetchCollections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const societyId = user.societyId || user.uid;
      const schemaName = user.schema || user.schemaName;
      
      let url = `/api/society/collections?societyId=${societyId}&schemaName=${schemaName}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCollections(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...collections];
    
    if (channelFilter !== 'all') {
      filtered = filtered.filter(c => c.channel === channelFilter);
    }
    
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(c => c.shiftType === shiftFilter);
    }
    
    if (farmerFilter) {
      const search = farmerFilter.toLowerCase();
      filtered = filtered.filter(c => 
        c.farmerId.toLowerCase().includes(search) ||
        c.farmerName.toLowerCase().includes(search)
      );
    }
    
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.farmerId.toLowerCase().includes(search) ||
        c.farmerName.toLowerCase().includes(search) ||
        c.channel.toLowerCase().includes(search)
      );
    }
    
    setFilteredCollections(filtered);
    
    // Calculate stats
    const totalCollections = filtered.length;
    const totalQuantity = filtered.reduce((sum, c) => sum + c.quantity, 0);
    const totalAmount = filtered.reduce((sum, c) => sum + c.totalAmount, 0);
    const averageFat = totalCollections > 0 
      ? filtered.reduce((sum, c) => sum + c.fatPercentage, 0) / totalCollections 
      : 0;
    const averageSnf = totalCollections > 0 
      ? filtered.reduce((sum, c) => sum + c.snfPercentage, 0) / totalCollections 
      : 0;
    
    setStats({
      totalCollections,
      totalQuantity,
      totalAmount,
      averageFat,
      averageSnf
    });
  }, [collections, channelFilter, shiftFilter, farmerFilter, globalSearch]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setChannelFilter('all');
    setShiftFilter('all');
    setFarmerFilter('');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Collection Report', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Society: ${user?.name || 'N/A'}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
    if (dateFrom || dateTo) {
      doc.text(`Period: ${dateFrom || 'Start'} to ${dateTo || 'End'}`, 14, 44);
    }
    
    const tableData = filteredCollections.map(c => [
      new Date(c.collectionDate).toLocaleDateString(),
      c.shiftType === 'M' ? 'Morning' : 'Evening',
      c.farmerId,
      c.farmerName,
      c.channel,
      c.quantity.toFixed(2),
      c.fatPercentage.toFixed(2),
      c.snfPercentage.toFixed(2),
      `₹${c.ratePerLiter.toFixed(2)}`,
      `₹${c.totalAmount.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Shift', 'Farmer ID', 'Farmer', 'Channel', 'Qty (L)', 'Fat %', 'SNF %', 'Rate', 'Amount']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.save(`collection-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Shift', 'Farmer ID', 'Farmer Name', 'Channel', 'Quantity', 'Fat %', 'SNF %', 'CLR', 'Rate/L', 'Amount'];
    const rows = filteredCollections.map(c => [
      c.collectionDate,
      c.collectionTime,
      c.shiftType,
      c.farmerId,
      c.farmerName,
      c.channel,
      c.quantity,
      c.fatPercentage,
      c.snfPercentage,
      c.clrValue,
      c.ratePerLiter,
      c.totalAmount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Collections"
          value={stats?.totalCollections.toLocaleString() || '0'}
          icon={<Droplet className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity"
          value={`${(stats?.totalQuantity || 0).toFixed(1)} L`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Total Amount"
          value={`₹${(stats?.totalAmount || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Avg Fat %"
          value={(stats?.averageFat || 0).toFixed(2) + '%'}
          icon={<Droplet className="w-5 h-5" />}
          color="yellow"
        />
        <StatsCard
          title="Avg SNF %"
          value={(stats?.averageSnf || 0).toFixed(2) + '%'}
          icon={<Droplet className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Channels</option>
              <option value="COW">Cow</option>
              <option value="BUFFALO">Buffalo</option>
              <option value="MIX">Mix</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Shifts</option>
              <option value="M">Morning</option>
              <option value="E">Evening</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Farmer</label>
            <input
              type="text"
              value={farmerFilter}
              onChange={(e) => setFarmerFilter(e.target.value)}
              placeholder="Name or ID..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={fetchCollections}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCollections.length} of {collections.length} records
        </p>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Qty (L)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fat %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SNF %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rate/L</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                    <Droplet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No collection records found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(collection.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {collection.collectionTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        collection.shiftType === 'M' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        {collection.shiftType === 'M' ? 'Morning' : 'Evening'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{collection.farmerName}</p>
                        <p className="text-xs text-gray-500">{collection.farmerId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        collection.channel === 'COW' 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : collection.channel === 'BUFFALO'
                          ? 'bg-gray-800 text-white dark:bg-gray-600'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {collection.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {collection.quantity.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {collection.fatPercentage.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {collection.snfPercentage.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      ₹{collection.ratePerLiter.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                      ₹{collection.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
