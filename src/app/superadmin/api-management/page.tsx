'use client';

import { useState, useEffect } from 'react';
import { Download, Key, Settings, Loader2, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
import { encrypt, getEncryptionKey } from '@/lib/encryption';

interface MachineInput {
  id: string;
  machineId: string;
}

interface ModelConfig {
  id: string;
  modelName: string;
  machineCount: number;
  machines: MachineInput[];
}

interface GeneratedConfig {
    psrCode: string;
    totalMachines: number;
    totalModels: number;
    generatedAt: string;
}

export default function APIManagementPage() {
  const [societyId, setSocietyId] = useState('');
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [machineModels, setMachineModels] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch machine models from superadmin API
  useEffect(() => {
    const fetchMachineModels = async () => {
      try {
        setLoadingModels(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/superadmin/machines', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success && data.data.machines) {
          const models = data.data.machines.map((machine: { machineType: string }) => ({
            value: machine.machineType.toLowerCase(),
            label: machine.machineType
          }));
          setMachineModels(models);
        }
      } catch (error) {
        console.error('Error fetching machine models:', error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchMachineModels();
  }, []);

  const addModelConfig = () => {
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      modelName: '',
      machineCount: 0,
      machines: []
    };
    setModelConfigs([...modelConfigs, newModel]);
  };

  const removeModelConfig = (modelId: string) => {
    setModelConfigs(modelConfigs.filter(m => m.id !== modelId));
  };

  const updateModelName = (modelId: string, modelName: string) => {
    setModelConfigs(modelConfigs.map(m => 
      m.id === modelId ? { ...m, modelName } : m
    ));
  };

  const updateMachineCount = (modelId: string, count: string) => {
    const num = parseInt(count);
    if (!isNaN(num) && num > 0 && num <= 100) {
      setModelConfigs(modelConfigs.map(m => {
        if (m.id === modelId) {
          const machines: MachineInput[] = Array.from({ length: num }, (_, i) => ({
            id: `${modelId}-machine-${i + 1}`,
            machineId: m.machines[i]?.machineId || ''
          }));
          return { ...m, machineCount: num, machines };
        }
        return m;
      }));
    }
  };

  const updateMachineId = (modelId: string, machineIndex: number, value: string) => {
    // Validate format: Must start with exactly one letter
    const upperValue = value.toUpperCase();
    if (upperValue && !/^[A-Z][0-9A-Z]*$/.test(upperValue)) {
      alert('Machine ID must start with exactly one letter (A-Z) followed by numbers/letters.\nExample: M001, A123, B456');
      return;
    }
    
    // Check for duplicates within the same model
    const currentModel = modelConfigs.find(m => m.id === modelId);
    if (currentModel && upperValue.trim()) {
      const isDuplicate = currentModel.machines.some((machine, idx) => 
        idx !== machineIndex && machine.machineId === upperValue
      );
      
      if (isDuplicate) {
        alert(`Duplicate Machine ID "${upperValue}" found in ${currentModel.modelName}. Each machine must have a unique ID.`);
        return;
      }
    }
    
    setModelConfigs(modelConfigs.map(m => {
      if (m.id === modelId) {
        const updated = [...m.machines];
        updated[machineIndex].machineId = upperValue;
        return { ...m, machines: updated };
      }
      return m;
    }));
  };

  const addMachineToModel = (modelId: string) => {
    setModelConfigs(modelConfigs.map(m => {
      if (m.id === modelId) {
        const newMachine: MachineInput = {
          id: `${modelId}-machine-${m.machines.length + 1}`,
          machineId: ''
        };
        return {
          ...m,
          machines: [...m.machines, newMachine],
          machineCount: m.machines.length + 1
        };
      }
      return m;
    }));
  };

  const removeMachineFromModel = (modelId: string, machineIndex: number) => {
    setModelConfigs(modelConfigs.map(m => {
      if (m.id === modelId) {
        const updated = m.machines.filter((_, i) => i !== machineIndex);
        return { ...m, machines: updated, machineCount: updated.length };
      }
      return m;
    }));
  };

  const generatePSRCode = (societyId: string, models: ModelConfig[]): string => {
    // Generate a unique secret key for this society
    const secretKey = `PSR-${societyId}-${Date.now().toString(36).toUpperCase()}`;
    
    // Create ultra-compact data object with embedded secret key
    const data = {
      s: societyId.toUpperCase(),
      k: secretKey, // Secret key
      m: models.map(m => ({
        t: m.modelName.toLowerCase(),
        i: m.machines.map(machine => machine.machineId.toUpperCase())
      }))
    };
    
    // Convert to JSON and encrypt (includes GZIP compression)
    const jsonString = JSON.stringify(data);
    const encrypted = encrypt(jsonString, getEncryptionKey());
    
    // Simple format: PSR-{encrypted_data} (no checksum needed, encryption provides integrity)
    return `PSR-${encrypted}`;
  };

  const handleGenerate = async () => {
    // Validation
    if (!societyId.trim()) {
      alert('Please enter Society ID');
      return;
    }
    if (modelConfigs.length === 0) {
      alert('Please add at least one machine model');
      return;
    }

    // Validate each model
    for (let i = 0; i < modelConfigs.length; i++) {
      const model = modelConfigs[i];
      if (!model.modelName.trim()) {
        alert(`Please select a model for Model #${i + 1}`);
        return;
      }
      if (model.machines.length === 0) {
        alert(`Please add at least one machine for ${model.modelName}`);
        return;
      }
      // Validate each machine ID in this model
      for (let j = 0; j < model.machines.length; j++) {
        if (!model.machines[j].machineId.trim()) {
          alert(`Please enter Machine ID for ${model.modelName} - Machine #${j + 1}`);
          return;
        }
      }
      
      // Check for duplicates within the same model
      const machineIds = model.machines.map(m => m.machineId.toUpperCase());
      const duplicates = machineIds.filter((id, idx) => machineIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        alert(`Duplicate Machine IDs found in ${model.modelName}: ${[...new Set(duplicates)].join(', ')}`);
        return;
      }
    }
    
    // Check for duplicates across all models in the same society
    const allMachineIds: { id: string; model: string }[] = [];
    modelConfigs.forEach(model => {
      model.machines.forEach(machine => {
        allMachineIds.push({
          id: machine.machineId.toUpperCase(),
          model: model.modelName
        });
      });
    });
    
    const duplicateMap = new Map<string, string[]>();
    allMachineIds.forEach(({ id, model }) => {
      if (!duplicateMap.has(id)) {
        duplicateMap.set(id, []);
      }
      duplicateMap.get(id)!.push(model);
    });
    
    const crossModelDuplicates = Array.from(duplicateMap.entries())
      .filter(([_, models]) => models.length > 1);
    
    if (crossModelDuplicates.length > 0) {
      const duplicateDetails = crossModelDuplicates.map(([id, models]) => 
        `${id} (in ${models.join(', ')})`
      ).join('\n');
      alert(`Duplicate Machine IDs found across models:\n${duplicateDetails}\n\nEach machine must have a unique ID within the society.`);
      return;
    }

    setIsGenerating(true);

    try {
      // Calculate total machines
      const totalMachines = modelConfigs.reduce((sum, m) => sum + m.machines.length, 0);
      
      // Generate single PSR code for all models and machines
      const psrCode = generatePSRCode(societyId, modelConfigs);

      // Call backend API to generate package
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/api-management/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          societyId,
          modelConfigs,
          psrCode,
          totalMachines
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedConfig({
          psrCode,
          totalMachines,
          totalModels: modelConfigs.length,
          generatedAt: new Date().toISOString()
        });
        setDownloadUrl(data.downloadUrl);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error generating config:', error);
      alert('Failed to generate configuration');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
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
    setModelConfigs([]);
    setGeneratedConfig(null);
    setDownloadUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Key className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Generate PSR codes and API configurations for machines</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuration</h2>
            </div>

            <div className="space-y-5">
              {/* Society ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Society ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  placeholder="e.g., S-101, DAIRY-A, Q1, MySociety"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter any alphanumeric identifier (letters, numbers, hyphens, underscores)
                </p>
              </div>

              {/* Machine Models Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Machine Models</h3>
                  <button
                    onClick={addModelConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Model
                  </button>
                </div>

                {modelConfigs.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <Settings className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No models added yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add Model" to get started</p>
                  </div>
                )}

                {/* Model Configurations */}
                <div className="space-y-4">
                  {modelConfigs.map((modelConfig, modelIndex) => (
                    <div key={modelConfig.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                      {/* Model Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                          Model #{modelIndex + 1}
                        </h4>
                        <button
                          onClick={() => removeModelConfig(modelConfig.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Model Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Machine Model <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={modelConfig.modelName}
                          onChange={(e) => updateModelName(modelConfig.id, e.target.value)}
                          disabled={loadingModels}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                        >
                          <option value="">{loadingModels ? 'Loading models...' : 'Select Machine Model'}</option>
                          {machineModels.map((model) => (
                            <option key={model.value} value={model.value}>
                              {model.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Number of Machines for this Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Number of Machines <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={modelConfig.machineCount || ''}
                          onChange={(e) => updateMachineCount(modelConfig.id, e.target.value)}
                          placeholder="Enter number (1-100)"
                          disabled={!modelConfig.modelName}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Machine IDs for this Model */}
                      {modelConfig.machines.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Machine IDs for {modelConfig.modelName || 'this model'}
                            </span>
                            <button
                              onClick={() => addMachineToModel(modelConfig.id)}
                              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Machine
                            </button>
                          </div>
                          
                          <div className="max-h-80 overflow-y-auto space-y-2">
                            {modelConfig.machines.map((machine, machineIndex) => (
                              <div key={machine.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[60px]">
                                  #{machineIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  value={machine.machineId}
                                  onChange={(e) => updateMachineId(modelConfig.id, machineIndex, e.target.value)}
                                  placeholder={`Machine ID (e.g., M${(machineIndex + 1).toString().padStart(3, '0')})`}
                                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                                {modelConfig.machines.length > 1 && (
                                  <button
                                    onClick={() => removeMachineFromModel(modelConfig.id, machineIndex)}
                                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || modelConfigs.length === 0}
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
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Codes</h2>
              </div>
              {generatedConfig && (
                <div className="flex gap-2">
                  <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                    {generatedConfig.totalModels} models
                  </span>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                    {generatedConfig.totalMachines} machines
                  </span>
                </div>
              )}
            </div>

            {generatedConfig ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Models:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{generatedConfig.totalModels}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Machines:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{generatedConfig.totalMachines}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">Generated: {new Date(generatedConfig.generatedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Single PSR Code Display */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Master PSR Code ({generatedConfig.totalModels} Models, {generatedConfig.totalMachines} Machines)
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedConfig.psrCode);
                        alert('PSR code copied to clipboard!');
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
                    >
                      Copy Code
                    </button>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                    <code className="block text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                      {generatedConfig.psrCode}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    This single code authenticates all {generatedConfig.totalMachines} machines in your society
                  </p>
                </div>

                {/* Download Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleDownloadJSON}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download JSON Configuration
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/Common_API/publish.zip';
                      link.download = 'psr-api-publish.zip';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download API Publish Package
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No codes generated yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Fill the form and click Generate to create PSR codes</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              <span>Enter the Society ID that will use these machines</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">2.</span>
              <span>Select the Machine Model (all machines will use this model)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              <span>Enter the number of machines you want to configure (1-100)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">4.</span>
              <span>Enter unique Machine ID for each machine</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">5.</span>
              <span>Use the + Add Machine button to add more machines if needed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">6.</span>
              <span>Click Generate to create unique PSR codes for all machines</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">7.</span>
              <span>Download the JSON configuration or the complete API publish package</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">8.</span>
              <span>Deploy the API package to enable machine operations with PSR codes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
