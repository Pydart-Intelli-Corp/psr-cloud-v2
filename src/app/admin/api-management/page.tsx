'use client';

import { useState } from 'react';
import { Download, Key, Settings, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface MachineConfig {
  machineId: string;
  psrCode: string;
}

interface GeneratedConfig {
  societyId: string;
  machineModel: string;
  machines: MachineConfig[];
  generatedAt: string;
}

export default function APIManagementPage() {
  const [societyId, setSocietyId] = useState('');
  const [machineModel, setMachineModel] = useState('');
  const [machineIds, setMachineIds] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const machineModels = [
    { value: 'lactosure', label: 'Lactosure' },
    { value: 'ekomilk', label: 'Ekomilk' },
    { value: 'ultrasonic', label: 'Ultrasonic' },
    { value: 'master', label: 'Master' },
  ];

  const generatePSRCode = (societyId: string, machineModel: string, machineId: string): string => {
    // Format: PSR-{SOCIETYID}-{MODEL}-{MACHINEID}
    // Example: PSR-SOC001-LACT-M001
    const modelPrefix = machineModel.substring(0, 4).toUpperCase();
    return `PSR-${societyId.toUpperCase()}-${modelPrefix}-${machineId.toUpperCase()}`;
  };

  const handleGenerate = async () => {
    // Validation
    if (!societyId.trim()) {
      alert('Please enter Society ID');
      return;
    }
    if (!machineModel) {
      alert('Please select Machine Model');
      return;
    }
    if (!machineIds.trim()) {
      alert('Please enter Machine IDs');
      return;
    }

    setIsGenerating(true);

    try {
      // Parse machine IDs (comma-separated or line-separated)
      const machineIdList = machineIds
        .split(/[,\n]/)
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (machineIdList.length === 0) {
        throw new Error('No valid machine IDs found');
      }

      // Generate PSR codes
      const machines: MachineConfig[] = machineIdList.map(machineId => ({
        machineId,
        psrCode: generatePSRCode(societyId, machineModel, machineId),
      }));

      const config: GeneratedConfig = {
        societyId,
        machineModel,
        machines,
        generatedAt: new Date().toISOString(),
      };

      setGeneratedConfig(config);

      // Send to backend to generate .NET API publish file
      const response = await fetch('/api/admin/api-management/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API package');
      }

      const data = await response.json();
      setDownloadUrl(data.downloadUrl);

      alert(`Generated ${machines.length} PSR codes successfully!`);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate PSR codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      // Download the generated publish file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `psr-api-${societyId}-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleDownloadJSON = () => {
    if (!generatedConfig) return;

    const dataStr = JSON.stringify(generatedConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `psr-codes-${societyId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('JSON configuration downloaded!');
  };

  const handleReset = () => {
    setSocietyId('');
    setMachineModel('');
    setMachineIds('');
    setGeneratedConfig(null);
    setDownloadUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Key className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
              <p className="text-gray-600">Generate PSR codes and API configurations for machines</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
            </div>

            <div className="space-y-5">
              {/* Society ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Society ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  placeholder="e.g., SOC001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Machine Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Model</option>
                  {machineModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Machine IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine IDs (Bulk) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={machineIds}
                  onChange={(e) => setMachineIds(e.target.value)}
                  placeholder="Enter machine IDs (comma or line separated)&#10;e.g., M001, M002, M003&#10;or one per line"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple IDs with commas or new lines
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Generate PSR Codes
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Generated Codes</h2>
              </div>
              {generatedConfig && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {generatedConfig.machines.length} codes
                </span>
              )}
            </div>

            {generatedConfig ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Society ID:</span>
                      <p className="font-semibold text-gray-900">{generatedConfig.societyId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Machine Model:</span>
                      <p className="font-semibold text-gray-900 capitalize">{generatedConfig.machineModel}</p>
                    </div>
                  </div>
                </div>

                {/* Codes List */}
                <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-4">
                  {generatedConfig.machines.map((machine, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Machine ID</p>
                        <p className="font-semibold text-gray-900">{machine.machineId}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">PSR Code</p>
                        <p className="font-mono text-sm font-bold text-green-600">{machine.psrCode}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDownloadJSON}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download JSON Configuration
                  </button>

                  {downloadUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download API Publish Package
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No codes generated yet</p>
                <p className="text-gray-400 text-sm mt-1">Fill the form and click Generate</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="text-blue-600">1.</span>
              <span>Enter the Society ID that will use these machines</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">2.</span>
              <span>Select the machine model type</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">3.</span>
              <span>Enter machine IDs in bulk (comma or line separated)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">4.</span>
              <span>Click Generate to create unique PSR codes for each machine</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">5.</span>
              <span>Download the JSON configuration or the complete API publish package</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">6.</span>
              <span>Deploy the API package to enable machine operations with PSR codes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
