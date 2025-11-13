'use client';

import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { FormModal, FormSelect, FormActions } from '@/components';

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface RateChartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  societies: Society[];
  onUploadSuccess: (message: string) => void;
  onUploadError: (message: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

type ChannelType = 'COW' | 'BUF' | 'MIX';

/**
 * Reusable rate chart upload modal
 * Handles CSV file selection, society and channel selection, and upload
 * Supports multiple society selection
 */
const RateChartUploadModal: React.FC<RateChartUploadModalProps> = ({
  isOpen,
  onClose,
  societies,
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  onUploadEnd,
  onProgressUpdate
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSocieties, setSelectedSocieties] = useState<number[]>([]);
  const [channel, setChannel] = useState<ChannelType | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  // Update progress and notify parent
  const updateProgress = (progress: number) => {
    onProgressUpdate?.(progress);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        onUploadError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSocietyToggle = (societyId: number) => {
    setSelectedSocieties(prev => {
      if (prev.includes(societyId)) {
        return prev.filter(id => id !== societyId);
      } else {
        return [...prev, societyId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedSocieties.length === societies.length) {
      setSelectedSocieties([]);
    } else {
      setSelectedSocieties(societies.map(s => s.id));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSocieties.length === 0 || !channel || !selectedFile) {
      onUploadError('Please select at least one society, channel, and CSV file');
      return;
    }

    setIsUploading(true);
    updateProgress(0);
    onUploadStart?.();

    try {
      const token = localStorage.getItem('authToken');
      updateProgress(10);

      // Single API call with multiple society IDs
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('societyIds', selectedSocieties.join(','));
      uploadFormData.append('channel', channel);

      updateProgress(30);

      const response = await fetch('/api/user/ratechart/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      updateProgress(70);

      const data = await response.json();

      updateProgress(90);

      if (data.success) {
        updateProgress(100);
        const message = `Rate chart uploaded to ${selectedSocieties.length} ${selectedSocieties.length === 1 ? 'society' : 'societies'}! Total ${data.data.recordCount} records imported.`;
        onUploadSuccess(message);
        handleClose();
      } else {
        onUploadError(data.message || 'Failed to upload rate chart');
      }
    } catch (error) {
      console.error('Error uploading rate chart:', error);
      onUploadError('Error uploading rate chart. Please try again.');
    } finally {
      setIsUploading(false);
      updateProgress(0);
      onUploadEnd?.();
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `CLR,FAT,SNF,RATE
7,3,3,15
8,3,3.1,15.25
8,3,3.2,15.5
8,3,3.3,15.75
9,3,3.4,16
9,3,3.5,16.25
10,3,3.6,16.5`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ratechart_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedSocieties([]);
    setChannel('');
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Rate Chart"
      maxWidth="lg"
    >
      <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            CSV Format Requirements:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Headers: CLR, FAT, SNF, RATE (required)</li>
            <li>CLR: Color/Degree (numeric)</li>
            <li>FAT: Fat percentage (numeric, can have decimals)</li>
            <li>SNF: Solids-Not-Fat percentage (numeric, can have decimals)</li>
            <li>RATE: Rate per liter (numeric, can have decimals)</li>
            <li>File should be UTF-8 encoded</li>
          </ul>
          <button
            type="button"
            onClick={downloadSampleCSV}
            className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Download className="w-4 h-4 mr-1" />
            Download Sample CSV
          </button>
        </div>

        {/* Society Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Societies *
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              {selectedSocieties.length === societies.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {societies.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No societies available
              </p>
            ) : (
              societies.map(society => (
                <label
                  key={society.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSocieties.includes(society.id)}
                    onChange={() => handleSocietyToggle(society.id)}
                    className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {society.name} ({society.society_id})
                  </span>
                </label>
              ))
            )}
          </div>
          {selectedSocieties.length > 0 && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {selectedSocieties.length} {selectedSocieties.length === 1 ? 'society' : 'societies'} selected
            </p>
          )}
        </div>

        <FormSelect
          label="Milk Channel"
          value={channel}
          onChange={(value) => setChannel(value as ChannelType)}
          options={[
            { value: 'COW', label: 'COW' },
            { value: 'BUF', label: 'BUFFALO (BUF)' },
            { value: 'MIX', label: 'MIXED (MIX)' }
          ]}
          placeholder="Select Channel"
          required
        />

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CSV File *
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors">
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
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Click to upload CSV file
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    or drag and drop
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <FormActions
          onCancel={handleClose}
          submitText={`Upload to ${selectedSocieties.length} ${selectedSocieties.length === 1 ? 'Society' : 'Societies'}`}
          isLoading={isUploading}
          isSubmitDisabled={selectedSocieties.length === 0 || !channel || !selectedFile}
          submitType="submit"
        />
      </form>
    </FormModal>
  );
};

export default RateChartUploadModal;
