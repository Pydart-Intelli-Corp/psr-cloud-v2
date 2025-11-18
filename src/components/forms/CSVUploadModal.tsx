'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import { Society } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
}

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  societies: Society[];
  onUploadComplete: () => void;
}

interface UploadResult {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  failedFarmers: Array<{
    row: number;
    farmerId: string;
    name: string;
    error: string;
  }>;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  societies,
  onUploadComplete
}) => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  // Fetch machines for selected society
  const fetchMachinesBySociety = async (societyId: string) => {
    if (!societyId) {
      setMachines([]);
      return;
    }

    setMachinesLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine/by-society?societyId=${societyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      } else {
        console.error('Failed to fetch machines');
        setMachines([]);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    } finally {
      setMachinesLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedSociety('');
    setSelectedMachine('');
    setMachines([]);
    setUploadResult(null);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError(t.farmerManagement.csvFileOnly);
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSociety || !selectedMachine) {
      setError(t.farmerManagement.pleaseSelectSocietyAndMachine);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('societyId', selectedSociety);
      formData.append('machineId', selectedMachine);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data.data);
        if (data.data.successCount > 0) {
          onUploadComplete();
        }
      } else {
        setError(data.message || t.farmerManagement.uploadError);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(t.farmerManagement.uploadError + '. ' + t.farmerManagement.tryAgain);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    let csvContent = `ID,RF-ID,NAME,MOBILE,SMS,BONUS
1,11111,John Doe,9446024632,OFF,0
2,11112,Jane Smith,9446024633,ON,50
3,11113,Bob Johnson,9446024634,OFF,0`;

    // Add machine selection info as comments
    if (selectedMachine && machines.length > 0) {
      const selectedMachineObj = machines.find(m => m.id.toString() === selectedMachine);
      if (selectedMachineObj) {
        csvContent += `
# Selected machine will be assigned to all farmers:
# ${selectedMachineObj.id} - ${selectedMachineObj.machineId} (${selectedMachineObj.machineType})`;
      }
    } else if (machines.length > 0) {
      csvContent += `
# Available machines for selected society:`;
      machines.forEach(machine => {
        csvContent += `
# ${machine.id} - ${machine.machineId} (${machine.machineType})`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmer_sample_${selectedSociety ? societies.find(s => s.id.toString() === selectedSociety)?.name.replace(/[^a-zA-Z0-9]/g, '_') : 'template'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t.farmerManagement.csvUploadTitle}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!uploadResult ? (
              <>
                {/* Instructions */}
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t.farmerManagement.csvFormatRequirements}
                  </h3>
                  <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-0.5">
                    <li>• {t.farmerManagement.csvHeaders}</li>
                    <li>• {t.farmerManagement.csvIdRequired}</li>
                    <li>• {t.farmerManagement.csvSmsValues}</li>
                    <li>• {t.farmerManagement.csvBonusFormat}</li>
                    <li>• {t.farmerManagement.csvMachineId}</li>
                    <li>• {t.farmerManagement.csvRfIdUnique}</li>
                    <li>• {t.farmerManagement.csvFarmerIdUnique}</li>
                  </ul>
                  <button
                    onClick={downloadSampleCSV}
                    className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {t.farmerManagement.downloadSampleTemplate}
                  </button>
                </div>

                {/* Society and Machine Selection - Same Row */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Society Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.farmerManagement.selectDefaultSociety} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSociety}
                        onChange={(e) => {
                          setSelectedSociety(e.target.value);
                          setSelectedMachine('');
                          if (e.target.value) {
                            fetchMachinesBySociety(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t.farmerManagement.selectSociety}</option>
                        {societies.map((society) => (
                          <option key={society.id} value={society.id}>
                            {society.name} ({society.society_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Machine Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.farmerManagement.defaultMachine} <span className="text-red-500">*</span>
                      </label>
                      {machinesLoading ? (
                        <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                          <FlowerSpinner size={16} isLoading={true} className="mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t.common.loading}</span>
                        </div>
                      ) : (
                        <select
                          value={selectedMachine}
                          onChange={(e) => setSelectedMachine(e.target.value)}
                          disabled={!selectedSociety}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{t.farmerManagement.selectMachine}</option>
                          {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                              {machine.machineId} - {machine.machineType}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  
                  {/* Machine Status Info */}
                  {selectedSociety && (
                    <div className="mt-3">
                      {machines.length > 0 ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                          <p className="text-sm text-green-700 dark:text-green-200 mb-1">
                            {machines.length} {t.farmerManagement.machine}(s) {t.common.available} for this {t.farmerManagement.society}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {t.farmerManagement.csvMachineId}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-200">
                            {t.farmerManagement.noMachinesAvailable} {t.farmerManagement.addMachinesFirst}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.farmerManagement.selectCsvFile} <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t.farmerManagement.selectCsvFile}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {t.farmerManagement.csvFilesOnly}, {t.farmerManagement.csvFileSizeLimit}
                      </p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="mt-3 flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedSociety || !selectedMachine || isUploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <FlowerSpinner size={16} isLoading={isUploading} className="mr-2" />
                        {t.farmerManagement.uploading}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {t.farmerManagement.uploadFarmers}
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Upload Results */}
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-green-900 dark:text-green-100">
                        {t.farmerManagement.uploadComplete}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        {uploadResult.successCount} {t.common.of} {uploadResult.totalProcessed} {t.farmerManagement.farmers} {t.farmerManagement.successful}
                      </p>
                    </div>
                  </div>

                  {uploadResult.failedCount > 0 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        {t.farmerManagement.failedFarmers} ({uploadResult.failedCount})
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {uploadResult.failedFarmers.map((failed, index) => (
                          <div key={index} className="text-sm text-yellow-700 dark:text-yellow-200">
                            {t.farmerManagement.row} {failed.row}: {failed.name} ({failed.farmerId}) - {failed.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {t.farmerManagement.uploadAnother}
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      {t.common.close}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CSVUploadModal;