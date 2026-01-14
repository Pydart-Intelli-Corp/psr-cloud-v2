'use client';

import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { FormModal, FormSelect, FormActions } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

interface RateChartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  societies: Society[];
  bmcs?: BMC[];
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
  bmcs = [],
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  onUploadEnd,
  onProgressUpdate
}) => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignmentType, setAssignmentType] = useState<'society' | 'bmc'>('society');
  const [selectedSocieties, setSelectedSocieties] = useState<number[]>([]);
  const [selectedBmcs, setSelectedBmcs] = useState<number[]>([]);
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

  const handleBmcToggle = (bmcId: number) => {
    setSelectedBmcs(prev => {
      if (prev.includes(bmcId)) {
        return prev.filter(id => id !== bmcId);
      } else {
        return [...prev, bmcId];
      }
    });
  };

  const handleSelectAll = () => {
    if (assignmentType === 'society') {
      if (selectedSocieties.length === societies.length) {
        setSelectedSocieties([]);
      } else {
        setSelectedSocieties(societies.map(s => s.id));
      }
    } else {
      if (selectedBmcs.length === bmcs.length) {
        setSelectedBmcs([]);
      } else {
        setSelectedBmcs(bmcs.map(b => b.id));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCount = assignmentType === 'society' ? selectedSocieties.length : selectedBmcs.length;
    if (selectedCount === 0 || !channel || !selectedFile) {
      onUploadError(`Please select at least one ${assignmentType}, channel, and CSV file`);
      return;
    }

    setIsUploading(true);
    updateProgress(0);
    onUploadStart?.();

    try {
      const token = localStorage.getItem('authToken');
      updateProgress(10);

      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('assignmentType', assignmentType);
      
      if (assignmentType === 'society') {
        uploadFormData.append('societyIds', selectedSocieties.join(','));
      } else {
        uploadFormData.append('bmcIds', selectedBmcs.join(','));
      }
      
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
        const entityType = assignmentType === 'society' ? 'societies' : 'BMCs';
        const message = `Rate chart uploaded to ${selectedCount} ${selectedCount === 1 ? assignmentType : entityType}! Total ${data.data.recordCount} records imported.`;
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
    setSelectedBmcs([]);
    setAssignmentType('society');
    setChannel('');
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t.ratechartManagement.uploadRateChart}
      maxWidth="lg"
    >
      <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
            {t.ratechartManagement.csvFormatRequirements}:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <li>{t.ratechartManagement.headersRequired}: CLR, FAT, SNF, RATE</li>
            <li>{t.ratechartManagement.clrDescription}: {t.ratechartManagement.colorDegreeNumeric}</li>
            <li>{t.ratechartManagement.fatDescription}: {t.ratechartManagement.fatPercentageNumeric}</li>
            <li>{t.ratechartManagement.snfDescription}: {t.ratechartManagement.snfPercentageNumeric}</li>
            <li>{t.ratechartManagement.rateDescription}: {t.ratechartManagement.ratePerLiterNumeric}</li>
            <li>{t.ratechartManagement.fileEncodingUTF8}</li>
          </ul>
          <button
            type="button"
            onClick={downloadSampleCSV}
            className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Download className="w-4 h-4 mr-1" />
            {t.ratechartManagement.downloadSampleCSV}
          </button>
        </div>

        {/* Assignment Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assign To
          </label>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAssignmentType('society');
                setSelectedBmcs([]);
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                assignmentType === 'society'
                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Society
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignmentType('bmc');
                setSelectedSocieties([]);
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                assignmentType === 'bmc'
                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              BMC
            </button>
          </div>
        </div>

        {/* Society or BMC Selection */}
        {assignmentType === 'society' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.ratechartManagement.selectSociety} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                {selectedSocieties.length === societies.length ? t.common.clearAll : t.common.selectAll}
              </button>
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {societies.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  {t.ratechartManagement.noSocietiesAvailable}
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
                {selectedSocieties.length} {selectedSocieties.length === 1 ? t.ratechartManagement.society : t.ratechartManagement.societies} {t.common.selected}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select BMC <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                {selectedBmcs.length === bmcs.length ? t.common.clearAll : t.common.selectAll}
              </button>
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {bmcs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No BMCs available
                </p>
              ) : (
                bmcs.map(bmc => (
                  <label
                    key={bmc.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBmcs.includes(bmc.id)}
                      onChange={() => handleBmcToggle(bmc.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {bmc.name} ({bmc.bmcId})
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedBmcs.length > 0 && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {selectedBmcs.length} BMC{selectedBmcs.length > 1 ? 's' : ''} {t.common.selected}
              </p>
            )}
          </div>
        )}

        <FormSelect
          label={t.ratechartManagement.milkChannel}
          value={channel}
          onChange={(value) => setChannel(value as ChannelType)}
          options={[
            { value: 'COW', label: t.ratechartManagement.cow },
            { value: 'BUF', label: t.ratechartManagement.buffalo },
            { value: 'MIX', label: t.ratechartManagement.mixed }
          ]}
          placeholder={t.ratechartManagement.selectChannel}
          required
        />

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.ratechartManagement.csvFile} <span className="text-red-500">*</span>
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
                    {t.ratechartManagement.clickToUploadCSV}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.ratechartManagement.orDragAndDrop}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <FormActions
          onCancel={handleClose}
          submitText={`${t.common.upload} to ${assignmentType === 'society' ? selectedSocieties.length : selectedBmcs.length} ${assignmentType === 'society' ? (selectedSocieties.length === 1 ? t.ratechartManagement.society : t.ratechartManagement.societies) : (selectedBmcs.length === 1 ? 'BMC' : 'BMCs')}`}
          isLoading={isUploading}
          isSubmitDisabled={(assignmentType === 'society' ? selectedSocieties.length === 0 : selectedBmcs.length === 0) || !channel || !selectedFile}
          submitType="submit"
        />
      </form>
    </FormModal>
  );
};

export default RateChartUploadModal;
