'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { FormModal, LoadingButton } from '@/components';
import ColumnSelector, { ColumnOption } from './ColumnSelector';

interface ColumnSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (selectedColumns: string[], format: 'csv' | 'pdf') => Promise<void>;
  availableColumns: ColumnOption[];
  defaultColumns?: string[];
  title?: string;
  isDownloading?: boolean;
}

const ColumnSelectionModal = ({
  isOpen,
  onClose,
  onDownload,
  availableColumns,
  defaultColumns = ['farmerId', 'rfId', 'farmerName', 'contactNumber', 'smsEnabled', 'bonus'],
  title = 'Select Columns for Download',
  isDownloading = false
}: ColumnSelectionModalProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'pdf'>('csv');

  const handleDownload = async () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to download.');
      return;
    }
    
    try {
      await onDownload(selectedColumns, downloadFormat);
      onClose();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleClose = () => {
    if (!isDownloading) {
      onClose();
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Download Format
          </label>
          <div className="flex gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={downloadFormat === 'csv'}
                onChange={(e) => setDownloadFormat(e.target.value as 'csv' | 'pdf')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                disabled={isDownloading}
              />
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-900 dark:text-gray-100">CSV</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={downloadFormat === 'pdf'}
                onChange={(e) => setDownloadFormat(e.target.value as 'csv' | 'pdf')}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                disabled={isDownloading}
              />
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-900 dark:text-gray-100">PDF</span>
            </label>
          </div>
        </div>

        {/* Column Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Select Columns to Include
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
            <ColumnSelector
              columns={availableColumns}
              selectedColumns={selectedColumns}
              onSelectionChange={setSelectedColumns}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Selected Columns Preview
          </label>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
            <div className="flex flex-wrap gap-1">
              {selectedColumns.length > 0 ? (
                selectedColumns.map((columnKey, index) => {
                  const column = availableColumns.find(col => col.key === columnKey);
                  return (
                    <span
                      key={columnKey}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                    >
                      {column?.label || columnKey}
                      {index < selectedColumns.length - 1 && <span className="ml-1">•</span>}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No columns selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDownloading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <LoadingButton
            onClick={handleDownload}
            isLoading={isDownloading}
            disabled={selectedColumns.length === 0}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadFormat === 'csv' ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </LoadingButton>
        </div>
      </div>
    </FormModal>
  );
};

export default ColumnSelectionModal;