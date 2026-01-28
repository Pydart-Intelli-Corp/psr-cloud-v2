'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { FlowerSpinner } from '@/components';

// Report upload dialog for CSV file uploads
type ReportType = 'collection' | 'dispatch' | 'sales';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId?: number;
  societyName?: string;
  societyIdentifier?: string;
}

interface Dairy {
  id: number;
  name: string;
  dairyId: string;
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
  dairyFarmId?: number;
}

interface Society {
  id: number;
  name: string;
  society_id: string;
  bmc_id?: number;
}

interface ReportUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, reportType: ReportType, machineId?: number) => Promise<void>;
}

export default function ReportUploadDialog({ isOpen, onClose, onUpload }: ReportUploadDialogProps) {
  const [reportType, setReportType] = useState<ReportType>('collection');
  const [selectedDairy, setSelectedDairy] = useState('');
  const [selectedBMC, setSelectedBMC] = useState('');
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dairies, setDairies] = useState<Dairy[]>([]);
  const [bmcs, setBmcs] = useState<BMC[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingDairies, setLoadingDairies] = useState(false);
  const [loadingBMCs, setLoadingBMCs] = useState(false);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch dairies, BMCs, societies, and machines when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchDairies();
    }
  }, [isOpen]);

  // Fetch BMCs when dairy is selected
  useEffect(() => {
    if (selectedDairy) {
      fetchBMCs(parseInt(selectedDairy));
      setSelectedBMC('');
      setSelectedSociety('');
      setSelectedMachine('');
    }
  }, [selectedDairy]);

  // Fetch societies when BMC is selected
  useEffect(() => {
    if (selectedBMC) {
      fetchSocieties(parseInt(selectedBMC));
      setSelectedSociety('');
      setSelectedMachine('');
    }
  }, [selectedBMC]);

  // Fetch machines when society is selected
  useEffect(() => {
    if (selectedSociety) {
      fetchMachines(parseInt(selectedSociety));
      setSelectedMachine('');
    }
  }, [selectedSociety]);

  const fetchDairies = async () => {
    setLoadingDairies(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dairies data:', data);
        setDairies(data.data || []);
      } else {
        console.error('Failed to fetch dairies:', response.status);
      }
    } catch (err) {
      console.error('Error fetching dairies:', err);
    } finally {
      setLoadingDairies(false);
    }
  };

  const fetchBMCs = async (dairyId: number) => {
    setLoadingBMCs(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('BMCs data:', data);
        // Filter BMCs by dairy
        const filteredBMCs = (data.data || []).filter((bmc: BMC) => bmc.dairyFarmId === dairyId);
        console.log('Filtered BMCs for dairy', dairyId, ':', filteredBMCs);
        setBmcs(filteredBMCs);
      } else {
        console.error('Failed to fetch BMCs:', response.status);
      }
    } catch (err) {
      console.error('Error fetching BMCs:', err);
    } finally {
      setLoadingBMCs(false);
    }
  };

  const fetchSocieties = async (bmcId: number) => {
    setLoadingSocieties(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Societies data:', data);
        // Filter societies by BMC
        const filteredSocieties = (data.data || []).filter((society: Society) => society.bmc_id === bmcId);
        console.log('Filtered societies for BMC', bmcId, ':', filteredSocieties);
        setSocieties(filteredSocieties);
      } else {
        console.error('Failed to fetch societies:', response.status);
      }
    } catch (err) {
      console.error('Error fetching societies:', err);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchMachines = async (societyId: number) => {
    setLoadingMachines(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine?societyIds=${societyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Machines data:', data);
        setMachines(data.data || []);
      } else {
        console.error('Failed to fetch machines:', response.status);
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setLoadingMachines(false);
    }
  };

  const handleReset = () => {
    setReportType('collection');
    setSelectedDairy('');
    setSelectedBMC('');
    setSelectedSociety('');
    setSelectedMachine('');
    setSelectedMachineType('');
    setSelectedFile(null);
    setSelectedMachineId(undefined);
    setError('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        setSuccessMessage('');
        setSelectedFile(null);
        return;
      }

      if (!selectedMachineType) {
        setError('Please select a machine before uploading a file');
        setSuccessMessage('');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
      setSuccessMessage('');

      // Validate CSV headers immediately
      const validation = await validateCSVHeaders(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid CSV format');
        setSuccessMessage('');
        setSelectedFile(null);
      } else {
        setError('');
        setSuccessMessage(`✓ CSV format validated successfully (${selectedMachineType.includes('ecod') || selectedMachineType.includes('ECOD') ? 'ECOD' : 'Standard'} ${reportType} format)`);
      }
    }
  };

  const validateCSVHeaders = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line); // Filter empty lines
        
        const isEcod = selectedMachineType.toLowerCase().includes('ecod');
        
        // Find the header line dynamically
        let headerLineIndex = -1;
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
          const line = lines[i].toLowerCase();
          
          // Header line must contain commas (it's CSV format)
          if (!line.includes(',')) continue;
          
          // For sales reports, look for "Date" (with or without "Time")
          // For collection/dispatch, look for both "Date" and "Time"
          if (reportType === 'sales') {
            // Sales header should have: Date, Shift, Channel, Litre, Rate, Amount (Standard)
            // Or: Date&Time, ID, Milk, Rate, Qty, Total (ECOD)
            if (isEcod) {
              if (line.includes('date') && line.includes('id')) {
                headerLineIndex = i;
                break;
              }
            } else {
              if (line.includes('date') && (line.includes('shift') || line.includes('channel'))) {
                headerLineIndex = i;
                break;
              }
            }
          } else {
            if (line.includes('date') && line.includes('time')) {
              headerLineIndex = i;
              break;
            }
          }
        }
        
        if (headerLineIndex === -1) {
          const expectedColumns = reportType === 'sales' 
            ? 'Date column' 
            : 'Date and Time columns';
          resolve({ 
            valid: false, 
            error: `Header line not found. Please ensure your CSV has a header row with ${expectedColumns}.` 
          });
          return;
        }
        
        const headerLine = lines[headerLineIndex];
        
        if (isEcod) {
          let expectedHeaders: string[];
          if (reportType === 'collection' || reportType === 'dispatch') {
            expectedHeaders = ['Date', 'Time', 'shift', 'ID', 'Name', 'Milk', 'Fat', 'SNF', 'CLR', 'Water', 'Rate', 'Bonus', 'Qty', 'Total'];
          } else {
            expectedHeaders = ['Date&Time', 'ID', 'Milk', 'Rate', 'Qty', 'Total'];
          }
          
          // Split by comma
          const actualHeaders = headerLine.split(',').map(h => h.trim());
          
          // Check if we have enough columns
          if (actualHeaders.length < expectedHeaders.length) {
            resolve({ 
              valid: false, 
              error: `Invalid ECOD ${reportType} format. Found ${actualHeaders.length} columns, expected ${expectedHeaders.length}. Headers: ${actualHeaders.join(', ')}` 
            });
            return;
          }
          
          // Clean headers for comparison
          const cleanActual = actualHeaders.slice(0, expectedHeaders.length).map(h => 
            h.trim().replace(/[^a-zA-Z0-9&]/g, '')
          );
          
          const matches = expectedHeaders.every((expected, index) => 
            cleanActual[index]?.toLowerCase() === expected.toLowerCase()
          );
          
          if (!matches) {
            resolve({ 
              valid: false, 
              error: `Invalid ECOD ${reportType} format. Expected headers: ${expectedHeaders.join(', ')}. Found: ${cleanActual.join(', ')}` 
            });
            return;
          }
        } else {
          // Standard format validation
          let expectedHeaders: string[];
          if (reportType === 'collection') {
            expectedHeaders = ['Date', 'Time', 'Shift', 'ID', 'Channel', 'Fat', 'SNF', 'CLR', 'Water', 'Qty', 'Rate', 'Incentive', 'Amount'];
          } else if (reportType === 'dispatch') {
            expectedHeaders = ['Date', 'Time', 'Shift', 'ID', 'Channel', 'Fat', 'SNF', 'CLR', 'Water', 'Qty', 'Rate', 'Incentive', 'Amount'];
          } else {
            expectedHeaders = ['Date', 'Shift', 'Channel', 'Litre', 'Rate', 'Amount'];
          }
          
          // Split by comma
          const actualHeaders = headerLine.split(',').map(h => h.trim());
          
          // Check if we have enough columns
          if (actualHeaders.length < expectedHeaders.length) {
            resolve({ 
              valid: false, 
              error: `Invalid ${reportType} format. Found ${actualHeaders.length} columns, expected ${expectedHeaders.length}. Headers: ${actualHeaders.join(', ')}` 
            });
            return;
          }
          
          // Clean headers for comparison
          const cleanActual = actualHeaders.slice(0, expectedHeaders.length).map(h => 
            h.trim().replace(/[^a-zA-Z0-9&]/g, '')
          );
          
          const matches = expectedHeaders.every((expected, index) => 
            cleanActual[index]?.toLowerCase() === expected.toLowerCase()
          );
          
          if (!matches) {
            resolve({ 
              valid: false, 
              error: `Invalid ${reportType} format. Expected headers: ${expectedHeaders.join(', ')}. Found: ${cleanActual.join(', ')}` 
            });
            return;
          }
        }
        
        resolve({ valid: true });
      };
      
      reader.onerror = () => {
        resolve({ valid: false, error: 'Error reading file' });
      };
      
      reader.readAsText(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!selectedMachineType) {
      setError('Please select a machine first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Validate CSV headers
      const validation = await validateCSVHeaders(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'Invalid CSV format');
        setUploading(false);
        return;
      }

      await onUpload(selectedFile, reportType, selectedMachineId);
      handleReset();
      onClose();
    } catch (err) {
      console.error('Error uploading file:', err);
      // Display the full error message from the API (including format mismatch details)
      const errorMessage = err instanceof Error ? err.message : 'Error uploading file. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  // Render modal in a portal to escape parent overflow-hidden
  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-black rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>

            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Report Data
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

          <div className="p-4 sm:p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Upload Error</h4>
                    <div className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-900 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            )}

            {/* Format Requirements - At Top */}
            <div className="mb-6 p-3 bg-psr-green-50 dark:bg-psr-green-950/50 rounded-lg border border-psr-green-200 dark:border-psr-green-900">
              <h3 className="text-sm font-medium text-psr-green-900 dark:text-psr-green-300 mb-2">
                CSV Format Requirements:
              </h3>
              <ul className="text-xs text-psr-green-700 dark:text-psr-green-400 space-y-0.5">
                {reportType === 'collection' && (
                  <>
                    {selectedMachineType.toLowerCase().includes('ecod') ? (
                      <>
                        <li>• Station information in first 5 rows (Station, ID, Date, Report Type, Milk Type)</li>
                        <li>• Headers: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total</li>
                        <li>• Date format: YY/MM/DD (e.g., 19/01/26)</li>
                        <li>• Valid shifts: MOR (Morning), EVE (Evening)</li>
                        <li>• Fat, SNF, CLR values with 2 decimal places</li>
                      </>
                    ) : (
                      <>
                        <li>• Machine info in first 5 rows (Machine Serial, Report Title, Report Type, Date Range, Channel)</li>
                        <li>• Headers: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount</li>
                        <li>• Date format: YYYY-MM-DD (e.g., 2026-01-19)</li>
                        <li>• Valid shifts: MR (Morning), ER (Evening)</li>
                      </>
                    )}
                  </>
                )}
                {reportType === 'dispatch' && (
                  <>
                    {selectedMachineType.toLowerCase().includes('ecod') ? (
                      <>
                        <li>• Station information in first 5 rows (Station, ID, Date, Despatch Report, Milk Type)</li>
                        <li>• Headers: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total</li>
                        <li>• Date format: YY/MM/DD (e.g., 19/01/26)</li>
                        <li>• Valid shifts: MOR (Morning), EVE (Evening)</li>
                        <li>• Fat, SNF, CLR values with 2 decimal places</li>
                      </>
                    ) : (
                      <>
                        <li>• Machine info in first 5 rows (Machine Serial, Dispatch Report, ID, Date Range, Channel)</li>
                        <li>• Headers: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount</li>
                        <li>• Date format: YYYY-MM-DD (e.g., 2026-01-19)</li>
                        <li>• Valid shifts: MR (Morning), ER (Evening)</li>
                      </>
                    )}
                  </>
                )}
                {reportType === 'sales' && (
                  <>
                    {selectedMachineType.toLowerCase().includes('ecod') ? (
                      <>
                        <li>• Station information in first 4 rows (Station, ID, Date Range, Sales Report)</li>
                        <li>• Headers: Date&Time, ID, Milk, Rate, Qty, Total</li>
                        <li>• Date format: YY/MM/DD HH:MM:SSAM/PM (e.g., 19/01/26 02:07:32PM)</li>
                        <li>• Combined date and time in single column</li>
                        <li>• Milk type: COW or BUFFALO</li>
                      </>
                    ) : (
                      <>
                        <li>• Machine info in first 4 rows (Machine Serial, Sales Report, Date Range, Channel)</li>
                        <li>• Headers: Date, Shift, Channel, Litre, Rate, Amount</li>
                        <li>• Date format: DD/M/YY (e.g., 19/1/26)</li>
                        <li>• Valid shifts: MOR (Morning), EVE (Evening)</li>
                      </>
                    )}
                  </>
                )}
                <li>• File should be UTF-8 encoded</li>
              </ul>
            </div>

            <form onSubmit={handleUpload}>
              {/* Row 1: Dairy and BMC */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dairy Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                      Dairy <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <select
                      value={selectedDairy}
                      onChange={(e) => setSelectedDairy(e.target.value)}
                      required
                      disabled={loadingDairies}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <option value="">Select Dairy</option>
                      {dairies.map(dairy => (
                        <option key={dairy.id} value={dairy.id}>
                          {dairy.name} ({dairy.dairyId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BMC Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                      BMC <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <select
                      value={selectedBMC}
                      onChange={(e) => setSelectedBMC(e.target.value)}
                      required
                      disabled={!selectedDairy || loadingBMCs}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <option value="">Select BMC</option>
                      {bmcs.map(bmc => (
                        <option key={bmc.id} value={bmc.id}>
                          {bmc.name} ({bmc.bmcId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Society and Report Type */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Society Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                      Society <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <select
                      value={selectedSociety}
                      onChange={(e) => setSelectedSociety(e.target.value)}
                      required
                      disabled={!selectedBMC || loadingSocieties}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <option value="">Select Society</option>
                      {societies.map(society => (
                        <option key={society.id} value={society.id}>
                          {society.name} ({society.society_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Report Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                      Report Type <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="collection">Collection Report</option>
                      <option value="dispatch">Dispatch Report</option>
                      <option value="sales">Sales Report</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Machine Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Machine <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => {
                    setSelectedMachine(e.target.value);
                    const machine = machines.find(m => m.id.toString() === e.target.value);
                    setSelectedMachineId(machine?.id);
                    setSelectedMachineType(machine?.machineType || '');
                  }}
                  required
                  disabled={!selectedSociety || loadingMachines}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Select Machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>
                      {machine.machineId} - {machine.machineType}
                    </option>
                  ))}
                </select>
                
                {/* Show detected format */}
                {selectedMachineType && (
                  <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-950/50 rounded-md border border-purple-200 dark:border-purple-900">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <strong>Detected Format:</strong> {selectedMachineType.toLowerCase().includes('ecod') ? 'ECOD' : 'LSE/SD'}
                      <br />
                      <span className="text-purple-600 dark:text-purple-400">
                        Upload CSV files matching the {selectedMachineType.toLowerCase().includes('ecod') ? 'ECOD' : 'Standard'} format shown above
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* File Upload - Modern Design */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
                  CSV File <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                
                {!selectedFile ? (
                  <label 
                    htmlFor="file-upload"
                    className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-psr-green-300 dark:border-psr-green-700 rounded-xl bg-gradient-to-br from-psr-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 hover:from-psr-green-100 hover:to-emerald-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 p-3 rounded-full bg-psr-green-100 dark:bg-psr-green-900/30 group-hover:bg-psr-green-200 dark:group-hover:bg-psr-green-800/40 transition-colors">
                        <Upload className="w-8 h-8 text-psr-green-600 dark:text-psr-green-400" />
                      </div>
                      <p className="mb-1 text-sm font-medium text-psr-green-600 dark:text-psr-green-400">
                        Click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        CSV files only
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative flex items-center justify-between p-4 border-2 border-psr-green-300 dark:border-psr-green-700 rounded-xl bg-psr-green-50 dark:bg-psr-green-900/20">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-psr-green-100 dark:bg-psr-green-800/40">
                        <FileText className="w-6 h-6 text-psr-green-600 dark:text-psr-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="ml-3 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-psr-green-600 hover:bg-psr-green-700 dark:bg-psr-green-700 dark:hover:bg-psr-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                >
                  {uploading ? (
                    <>
                      <FlowerSpinner size={16} className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Use portal to render outside parent containers
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
