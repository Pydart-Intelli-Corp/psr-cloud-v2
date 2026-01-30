'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components';
import { FormInput, FormSelect } from '@/components/forms';
import { PageHeader, StatusMessage, FilterControls, EmptyState, StatusDropdown } from '@/components/management';
import { 
  DollarSign,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Download,
  Eye
} from 'lucide-react';

interface PaymentTransaction {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_uid: string;
  society_id: number;
  society_name: string;
  transaction_id: string;
  payment_method: 'paytm' | 'upi' | 'bank_transfer' | 'cash';
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const paymentMethodLabels: Record<string, string> = {
  paytm: 'Paytm',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash'
};

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock },
  processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: Clock },
  success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle2 },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: XCircle }
};

export default function PaymentTransactionsPage() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Manual payment modal
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    farmer_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/payment-transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch transactions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTransactions(result.data.transactions || []);
        setTotalPages(Math.ceil((result.data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      setError('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  // Create manual payment
  const handleCreateManualPayment = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/payment-transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmer_id: parseInt(manualPaymentData.farmer_id),
          amount: parseFloat(manualPaymentData.amount),
          payment_method: manualPaymentData.payment_method,
          reference_number: manualPaymentData.reference_number || null,
          notes: manualPaymentData.notes || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Manual payment created successfully!');
        setShowManualPaymentModal(false);
        setManualPaymentData({
          farmer_id: '',
          amount: '',
          payment_method: 'cash',
          reference_number: '',
          notes: ''
        });
        fetchTransactions();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      setError('Failed to create manual payment');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Update transaction status
  const handleUpdateStatus = async (transactionId: number, newStatus: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/payment-transactions/${transactionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Transaction status updated successfully!');
        fetchTransactions();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      setError('Failed to update transaction status');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, paymentMethodFilter, dateFrom, dateTo]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        fetchTransactions();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading && transactions.length === 0) {
    return <PageLoader />;
  }

  // Filter stats
  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const successCount = transactions.filter(t => t.status === 'success').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <PageHeader
          title="Payment Transactions"
          subtitle="View and manage all payment transactions for farmers"
          icon={<DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
          onRefresh={fetchTransactions}
          refreshText="Refresh"
          onAdd={() => setShowManualPaymentModal(true)}
          addButtonText="Manual Payment"
          className="mb-6 sm:mb-8"
        />

        {/* Status Messages */}
        <StatusMessage 
          success={success || undefined} 
          error={error || undefined}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{successCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Farmer name, UID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <FormSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'success', label: 'Success' },
                { value: 'failed', label: 'Failed' }
              ]}
            />

            <FormSelect
              label="Payment Method"
              value={paymentMethodFilter}
              onChange={setPaymentMethodFilter}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'paytm', label: 'Paytm' },
                { value: 'upi', label: 'UPI' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'cash', label: 'Cash' }
              ]}
            />

            <FormInput
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={setDateFrom}
            />

            <FormInput
              label="To Date"
              type="date"
              value={dateTo}
              onChange={setDateTo}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {transactions.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="w-12 h-12" />}
              title="No transactions found"
              message="No payment transactions match your filters. Try adjusting your search criteria."
              showAction={false}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Society
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => {
                      const StatusIcon = statusColors[transaction.status]?.icon || Clock;
                      return (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                            {transaction.transaction_id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {transaction.farmer_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.farmer_uid}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {transaction.society_name}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ₹{parseFloat(transaction.amount.toString()).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                              {paymentMethodLabels[transaction.payment_method]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]?.bg} ${statusColors[transaction.status]?.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(transaction.payment_date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={transaction.status}
                              onChange={(e) => handleUpdateStatus(transaction.id, e.target.value)}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="success">Success</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Manual Payment Modal */}
        {showManualPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Manual Payment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Record a manual payment transaction
                </p>
              </div>

              <div className="p-6 space-y-4">
                <FormInput
                  label="Farmer ID"
                  type="number"
                  value={manualPaymentData.farmer_id}
                  onChange={(value) => setManualPaymentData({ ...manualPaymentData, farmer_id: value })}
                  placeholder="Enter farmer ID"
                  required
                />

                <FormInput
                  label="Amount (₹)"
                  type="number"
                  value={manualPaymentData.amount}
                  onChange={(value) => setManualPaymentData({ ...manualPaymentData, amount: value })}
                  placeholder="0.00"
                  required
                  step="0.01"
                  min="0"
                />

                <FormSelect
                  label="Payment Method"
                  value={manualPaymentData.payment_method}
                  onChange={(value) => setManualPaymentData({ ...manualPaymentData, payment_method: value })}
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'paytm', label: 'Paytm' }
                  ]}
                  required
                />

                <FormInput
                  label="Reference Number"
                  value={manualPaymentData.reference_number}
                  onChange={(value) => setManualPaymentData({ ...manualPaymentData, reference_number: value })}
                  placeholder="Optional"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={manualPaymentData.notes}
                    onChange={(e) => setManualPaymentData({ ...manualPaymentData, notes: e.target.value })}
                    placeholder="Optional notes..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowManualPaymentModal(false);
                    setManualPaymentData({
                      farmer_id: '',
                      amount: '',
                      payment_method: 'cash',
                      reference_number: '',
                      notes: ''
                    });
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateManualPayment}
                  disabled={!manualPaymentData.farmer_id || !manualPaymentData.amount}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
