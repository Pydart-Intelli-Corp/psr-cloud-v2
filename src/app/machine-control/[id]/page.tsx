'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDongle } from '@/contexts/DongleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Activity,
  Droplet,
  Thermometer,
  Beaker,
  FlaskConical,
  Play,
  Check,
  X,
  Droplets,
  Scale,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bluetooth,
  BluetoothOff,
  Gauge,
  Timer,
  WifiHigh,
  WifiLow,
  WifiZero,
  BarChart3,
  Trash2,
  FileText,
  History,
  Maximize2,
  Minimize2,
  Usb
} from 'lucide-react';

// Types for control panel
interface MilkReading {
  milkType: 'cow' | 'buffalo' | 'mixed';
  fat: number;
  snf: number;
  clr: number;
  protein: number;
  lactose: number;
  salt: number;
  water: number;
  temperature: number;
  farmerId: string;
  quantity: number;
  totalAmount: number;
  rate: number;
  incentive: number;
  machineId: string;
  timestamp: Date;
  shift?: 'MR' | 'EV';
}

interface MachineConnection {
  id: string;
  machineId: string;
  machineName: string;
  isConnected: boolean;
  lastActivity?: Date;
  signalStrength?: 'excellent' | 'good' | 'weak' | 'poor';
}

interface TodayStats {
  totalTests: number;
  totalQuantity: number;
  totalAmount: number;
  avgFat: number;
  avgSnf: number;
  highestFat: number;
  lowestFat: number;
  highestSnf: number;
  lowestSnf: number;
  bestReading?: MilkReading;
  worstReading?: MilkReading;
}

// Empty reading template
const emptyReading: MilkReading = {
  milkType: 'cow',
  fat: 0.0,
  snf: 0.0,
  clr: 0.0,
  protein: 0.0,
  lactose: 0.0,
  salt: 0.0,
  water: 0.0,
  temperature: 0.0,
  farmerId: '0',
  quantity: 0.0,
  totalAmount: 0.0,
  rate: 0.0,
  incentive: 0.0,
  machineId: '0',
  timestamp: new Date(),
};

/**
 * Parse Lactosure machine pipe-delimited data format
 * Example: LE3.36|A|CH1|F05.21|S12.58|C44.10|P04.60|L06.90|s01.04|W00.00|T20.00|I000100|Q00100.00|R00000.00|r000.00|i000.00|MM00201|D2026-01-05_10:28:12
 * 
 * Fields:
 * - LE3.36: Version
 * - A/M: Auto/Manual mode
 * - CH1/CH2/CH3: Channel (Cow/Buffalo/Mixed)
 * - F: Fat percentage
 * - S: SNF percentage
 * - C: CLR (Corrected Lactometer Reading)
 * - P: Protein percentage
 * - L: Lactose percentage
 * - s: Salt percentage
 * - W: Water percentage (adulteration)
 * - T: Temperature
 * - I: Farmer ID (6 digits)
 * - Q: Quantity in liters
 * - R: Total amount in rupees
 * - r: Rate per liter
 * - i: Incentive/bonus
 * - MM: Machine ID
 * - D: Date & time
 */
function parseLactosureData(rawData: string): MilkReading | null {
  try {
    // Remove any non-printable characters and trim
    const cleanData = rawData.replace(/[\x00-\x1F\x7F]/g, '').trim();
    
    // Check for Lactosure format (starts with LE or contains pipe-delimited data)
    if (!cleanData.includes('|')) {
return null;
    }

    const parts = cleanData.split('|');
// Initialize with default values
    const reading: MilkReading = { ...emptyReading, timestamp: new Date() };
    let hasValidData = false;

    for (const part of parts) {
      if (!part || part.length < 2) continue;

      const prefix = part.charAt(0);
      const valueStr = part.substring(1);

      switch (prefix) {
        case 'F': // Fat
          reading.fat = parseFloat(valueStr) || 0;
          hasValidData = true;
          break;
        case 'S': // SNF
          reading.snf = parseFloat(valueStr) || 0;
          hasValidData = true;
          break;
        case 'C': // CLR
          if (part.startsWith('CH')) {
            // Channel (CH1/CH2/CH3)
            const channel = part;
            reading.milkType = channel === 'CH2' ? 'buffalo' : channel === 'CH3' ? 'mixed' : 'cow';
          } else {
            reading.clr = parseFloat(valueStr) || 0;
            hasValidData = true;
          }
          break;
        case 'P': // Protein
          reading.protein = parseFloat(valueStr) || 0;
          break;
        case 'L': // Lactose (but not LE version)
          if (!part.startsWith('LE')) {
            reading.lactose = parseFloat(valueStr) || 0;
          }
          break;
        case 's': // Salt (lowercase s)
          reading.salt = parseFloat(valueStr) || 0;
          break;
        case 'W': // Water
          reading.water = parseFloat(valueStr) || 0;
          break;
        case 'T': // Temperature
          reading.temperature = parseFloat(valueStr) || 0;
          break;
        case 'I': // Farmer ID
          reading.farmerId = valueStr.replace(/^0+/, '') || '0';
          break;
        case 'Q': // Quantity
          reading.quantity = parseFloat(valueStr) || 0;
          break;
        case 'R': // Total Amount
          reading.totalAmount = parseFloat(valueStr) || 0;
          break;
        case 'r': // Rate (lowercase r)
          reading.rate = parseFloat(valueStr) || 0;
          break;
        case 'i': // Incentive (lowercase i)
          reading.incentive = parseFloat(valueStr) || 0;
          break;
        case 'M': // Machine ID (MM prefix)
          if (part.startsWith('MM')) {
            reading.machineId = part.substring(2).replace(/^0+/, '') || '0';
          }
          break;
        case 'D': // Date/time
          // Parse format: D2026-01-05_10:28:12
          try {
            const dateStr = valueStr.replace('_', 'T');
            reading.timestamp = new Date(dateStr);
          } catch {
            reading.timestamp = new Date();
          }
          break;
        case 'A': // Auto mode
        case 'M': // Manual mode (conflicts with MM, handled above)
          break;
      }
    }

    if (!hasValidData) {
return null;
    }
return reading;
  } catch (error) {
return null;
  }
}

// Color palette matching Flutter app
const colors = {
  primaryAmber: '#f59e0b',
  primaryBlue: '#3b82f6',
  primaryPurple: '#8b5cf6',
  primaryGreen: '#22c55e',
  primaryTeal: '#14b8a6',
  primaryOrange: '#f97316',
  primaryPink: '#ec4899',
  primarySlate: '#64748b',
  errorColor: '#ef4444',
  warningColor: '#f59e0b',
  successColor: '#22c55e',
};

// Inline spinner component
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full" />
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <span className="text-lg font-medium text-white/80">Loading Control Panel...</span>
      </div>
    </div>
  );
}

// Inline status message component
function InlineStatusMessage({ 
  type, 
  message, 
  onClose 
}: { 
  type: 'success' | 'error'; 
  message: string; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm ${
        type === 'success' 
          ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
          : 'bg-red-500/20 border border-red-500/40 text-red-400'
      }`}
    >
      {type === 'success' ? (
        <Check className="w-5 h-5" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function MachineControlPanel() {
  const router = useRouter();
  const params = useParams();
  const machineDbId = params.id as string;

  // Machine state - now supports multiple connected machines
  const [machine, setMachine] = useState<MachineConnection | null>(null);
  const [connectedMachines, setConnectedMachines] = useState<MachineConnection[]>([]);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null); // Currently selected machine for display
  
  // Reading state - per-machine readings map
  const [machineReadings, setMachineReadings] = useState<Map<string, MilkReading>>(new Map());
  const [currentReading, setCurrentReading] = useState<MilkReading>(emptyReading);
  const [readingHistory, setReadingHistory] = useState<MilkReading[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Test state
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testElapsedSeconds, setTestElapsedSeconds] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<'CH1' | 'CH2' | 'CH3'>('CH1');
  
  // Today's statistics
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalTests: 0,
    totalQuantity: 0,
    totalAmount: 0,
    avgFat: 0,
    avgSnf: 0,
    highestFat: 0,
    lowestFat: 0,
    highestSnf: 0,
    lowestSnf: 0,
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Use shared DongleContext for USB dongle communication
  // NOTE: Connection is managed in Machine Management page, not here
  const {
    connectedPort,
    isDongleVerified,
    connectedBLEMachines,
    machineIdToDongleId,
    sendDongleCommand,
    onBleData,
    offBleData,
  } = useDongle();
  
  // Refs for timers
  const testTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the dongle device ID for the current machine
  const getCurrentMachineDeviceId = useCallback((): string | null => {
    if (!machine?.machineId) return null;
    return machineIdToDongleId.get(machine.machineId) || null;
  }, [machine?.machineId, machineIdToDongleId]);
  
  // Check if current machine is connected via BLE
  const isMachineConnectedViaBLE = useCallback((): boolean => {
    if (!machine?.machineId) return false;
    return connectedBLEMachines.has(machine.machineId);
  }, [machine?.machineId, connectedBLEMachines]);
  
  // Send command to current machine via dongle
  const sendToMachine = useCallback(async (hexCommand: string): Promise<boolean> => {
    const deviceId = getCurrentMachineDeviceId();
    
    if (deviceId) {
      // Send to specific device
      const command = `SENDHEX,${deviceId},${hexCommand}`;
      return await sendDongleCommand(command);
    } else if (connectedPort && isDongleVerified) {
      // Fallback: send to all connected devices
      const command = `SENDHEXALL,${hexCommand}`;
      return await sendDongleCommand(command);
    } else {
      setError('No dongle connected. Connect from Machine Management first.');
      return false;
    }
  }, [getCurrentMachineDeviceId, connectedPort, isDongleVerified, sendDongleCommand]);
  
  // Subscribe to BLE data for this machine
  useEffect(() => {
    const handleBleData = (machineId: string, data: string) => {
      // Accept data from ALL connected machines (multi-machine mode)
// Try to parse Lactosure pipe-delimited format
      const parsed = parseLactosureData(data);
      
      if (parsed) {
// Store reading for this specific machine (this triggers displayedReading to recompute via useMemo)
        const readingWithMachine = { ...parsed, machineId };
        
        setMachineReadings(prev => {
          const newMap = new Map(prev);
          newMap.set(machineId, readingWithMachine);
          return newMap;
        });
        
        // Auto-select this machine if none selected yet
        if (!selectedMachineId) {
          setSelectedMachineId(machineId);
        }
        
        // Add to history (for all machines)
        setReadingHistory(prev => {
          const newHistory = [...prev, readingWithMachine];
          // Keep only last 100 readings
          if (newHistory.length > 100) {
            return newHistory.slice(-100);
          }
          return newHistory;
        });
        
        // Recalculate today's stats (for all machines combined)
        setReadingHistory(prev => {
          calculateTodayStats(prev);
          return prev;
        });
        
        // If test was running and we got results for selected machine, stop it
        if (isTestRunning && selectedMachineId === machineId && (parsed.fat > 0 || parsed.snf > 0)) {
          handleStopTest();
          setSuccess(`✅ Test Complete M-${machineId}: FAT ${parsed.fat.toFixed(2)}%, SNF ${parsed.snf.toFixed(2)}%`);
        } else {
          setSuccess(`📡 M-${machineId}: FAT ${parsed.fat.toFixed(2)}%, SNF ${parsed.snf.toFixed(2)}%`);
        }
      } else {
        // Show raw data if not parseable
      }
    };
    
    onBleData(handleBleData);
    return () => offBleData(handleBleData);
  }, [selectedMachineId, onBleData, offBleData, isTestRunning]);

  // Update connected machines list from DongleContext
  useEffect(() => {
    if (connectedBLEMachines.size > 0) {
      const machines: MachineConnection[] = Array.from(connectedBLEMachines).map(machineId => ({
        id: machineId,
        machineId: machineId,
        machineName: `Machine M-${machineId}`,
        isConnected: true,
        signalStrength: 'excellent' as const,
      }));
      setConnectedMachines(machines);
      
      // Auto-select first machine if none selected
      if (!selectedMachineId && machines.length > 0) {
        setSelectedMachineId(machines[0].machineId);
      }
    }
  }, [connectedBLEMachines, selectedMachineId]);

  // Get list of machine IDs that have data
  const machinesWithData = Array.from(machineReadings.keys());

  // Fetch machine details
  const fetchMachineDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/machine?id=${machineDbId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch machine details');

      const result = await response.json();
      
      if (result.success && result.data?.[0]) {
        const machineData = result.data[0];
        
        // Create machine connection object
        const machineConnection: MachineConnection = {
          id: machineDbId,
          machineId: machineData.machineId,
          machineName: `Machine ${machineData.machineId}`,
          isConnected: machineData.status === 'active',
          lastActivity: machineData.lastActivity ? new Date(machineData.lastActivity) : undefined,
          signalStrength: 'excellent'
        };

        setMachine(machineConnection);
        setConnectedMachines([machineConnection]);
        
        // Fetch recent collections for this machine
        await fetchMachineReadings(machineData.machineId, token);
      }
    } catch (err) {
setError('Failed to load machine details');
    } finally {
      setLoading(false);
    }
  }, [machineDbId, router]);

  // Fetch machine readings/collections
  const fetchMachineReadings = async (machineId: string, token: string) => {
    try {
      const response = await fetch(`/api/user/reports/collections`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Filter collections for this machine and today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const machineCollections = result.data
            .filter((col: any) => col.machine_id === machineId)
            .filter((col: any) => {
              const colDate = new Date(col.collection_date);
              colDate.setHours(0, 0, 0, 0);
              return colDate.getTime() === today.getTime();
            })
            .map((col: any): MilkReading => ({
              milkType: col.channel?.toLowerCase() === 'buffalo' ? 'buffalo' : 
                       col.channel?.toLowerCase() === 'mixed' ? 'mixed' : 'cow',
              fat: parseFloat(col.fat) || 0,
              snf: parseFloat(col.snf) || 0,
              clr: parseFloat(col.clr) || 0,
              protein: parseFloat(col.protein) || 0,
              lactose: parseFloat(col.lactose) || 0,
              salt: parseFloat(col.salt) || 0,
              water: parseFloat(col.water) || 0,
              temperature: parseFloat(col.temperature) || 0,
              farmerId: col.farmer_id?.toString() || '0',
              quantity: parseFloat(col.quantity) || 0,
              totalAmount: parseFloat(col.total_amount) || 0,
              rate: parseFloat(col.rate) || 0,
              incentive: parseFloat(col.bonus) || 0,
              machineId: col.machine_id,
              timestamp: new Date(col.collection_date + ' ' + (col.collection_time || '00:00:00')),
              shift: col.session === 'MO' ? 'MR' : 'EV',
            }));

          setReadingHistory(machineCollections);
          
          // Set latest reading as current
          if (machineCollections.length > 0) {
            setCurrentReading(machineCollections[machineCollections.length - 1]);
          }

          // Calculate today's stats
          calculateTodayStats(machineCollections);
        }
      }
    } catch (err) {
}
  };

  // Calculate today's statistics
  const calculateTodayStats = (readings: MilkReading[]) => {
    if (readings.length === 0) {
      setTodayStats({
        totalTests: 0,
        totalQuantity: 0,
        totalAmount: 0,
        avgFat: 0,
        avgSnf: 0,
        highestFat: 0,
        lowestFat: 0,
        highestSnf: 0,
        lowestSnf: 0,
      });
      return;
    }

    let sumFat = 0, sumSnf = 0, sumQuantity = 0, sumAmount = 0;
    let maxFat = 0, minFat = Infinity;
    let maxSnf = 0, minSnf = Infinity;
    let bestReading: MilkReading | undefined;
    let worstReading: MilkReading | undefined;

    const calculateQuality = (r: MilkReading) => r.fat + r.snf;

    readings.forEach(reading => {
      sumFat += reading.fat;
      sumSnf += reading.snf;
      sumQuantity += reading.quantity;
      sumAmount += reading.totalAmount;

      if (reading.fat > maxFat) maxFat = reading.fat;
      if (reading.fat < minFat && reading.fat > 0) minFat = reading.fat;
      if (reading.snf > maxSnf) maxSnf = reading.snf;
      if (reading.snf < minSnf && reading.snf > 0) minSnf = reading.snf;

      const quality = calculateQuality(reading);
      if (!bestReading || quality > calculateQuality(bestReading)) {
        bestReading = reading;
      }
      if (!worstReading || quality < calculateQuality(worstReading)) {
        worstReading = reading;
      }
    });

    setTodayStats({
      totalTests: readings.length,
      totalQuantity: sumQuantity,
      totalAmount: sumAmount,
      avgFat: readings.length > 0 ? sumFat / readings.length : 0,
      avgSnf: readings.length > 0 ? sumSnf / readings.length : 0,
      highestFat: maxFat,
      lowestFat: minFat === Infinity ? 0 : minFat,
      highestSnf: maxSnf,
      lowestSnf: minSnf === Infinity ? 0 : minSnf,
      bestReading,
      worstReading,
    });
  };

  // Send command to machine via API
  const sendMachineCommand = async (
    command: 'TEST' | 'OK' | 'CANCEL' | 'CLEAN',
    options?: { channel?: 'CH1' | 'CH2' | 'CH3'; farmerId?: string; weight?: number }
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !machine) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/user/machine/command', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          machineId: machine.machineId,
          channel: options?.channel || selectedChannel,
          farmerId: options?.farmerId,
          weight: options?.weight,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Command failed');
      }
    } catch (err) {
throw err;
    }
  };

  // Handle test button - sends SENDHEXALL,40 0B 07 [channel] [cycleMode] [farmerID 3B] [weight 4B] [LRC]
  const handleTest = async () => {
    if (isTestRunning) return;

    setIsTestRunning(true);
    setTestElapsedSeconds(0);

    // Start timer
    testTimerRef.current = setInterval(() => {
      setTestElapsedSeconds(prev => {
        if (prev >= 45) {
          // Auto-stop after 45 seconds
          handleStopTest();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // Build test command hex
    // Channel: CH1=0x00 (Cow), CH2=0x01 (Buffalo), CH3=0x02 (Mixed)
    const channelByte = selectedChannel === 'CH1' ? '00' : selectedChannel === 'CH2' ? '01' : '02';
    const channelName = selectedChannel === 'CH1' ? 'Cow' : selectedChannel === 'CH2' ? 'Buffalo' : 'Mixed';
    
    // Simple test command: Farmer 1, Weight 1kg, Cycle 0
    // Format: 40 0B 07 [ch] [cycle] [fID MSB] [fID MID] [fID LSB] [w3] [w2] [w1] [w0] [LRC]
    const bytes = [0x40, 0x0B, 0x07, parseInt(channelByte, 16), 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x64];
    // Calculate LRC
    let lrc = 0;
    bytes.forEach(b => lrc ^= b);
    bytes.push(lrc);
    
    const hexCmd = bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');

    if (connectedPort && isDongleVerified) {
      // Send via dongle (either to specific machine or broadcast)
      const sent = await sendToMachine(hexCmd);
      if (sent) {
        const deviceId = getCurrentMachineDeviceId();
        setSuccess(`▶ Test (${channelName}) → ${deviceId ? `Device ${deviceId}` : 'All devices'}`);
      } else {
        setError('Failed to send test command');
        handleStopTest();
      }
    } else {
      // Fallback to API
      try {
        const result = await sendMachineCommand('TEST', { channel: selectedChannel });
        setSuccess(`▶ Test (${channelName}) [via API]`);
} catch (err) {
        setError('Failed to send test command');
        handleStopTest();
      }
    }
  };

  const handleStopTest = () => {
    if (testTimerRef.current) {
      clearInterval(testTimerRef.current);
      testTimerRef.current = null;
    }
    setIsTestRunning(false);
    setTestElapsedSeconds(0);
  };

  // Handle OK command - sends 40 04 01 04 00 41
  const handleOk = async () => {
    const hexCmd = '40 04 01 04 00 41';
    
    if (connectedPort && isDongleVerified) {
      // Send via dongle
      const sent = await sendToMachine(hexCmd);
      if (sent) {
        const deviceId = getCurrentMachineDeviceId();
        setSuccess(`✓ OK → ${deviceId ? `Device ${deviceId}` : 'All devices'}`);
      }
    } else {
      // Fallback to API
      try {
        await sendMachineCommand('OK');
        setSuccess(`✓ OK [${hexCmd}] (via API)`);
      } catch (err) {
        setError('Failed to send OK command');
      }
    }
  };

  // Handle Cancel command - sends 40 04 01 0A 00 4F
  const handleCancel = async () => {
    // Stop the test timer and reset state first
    if (isTestRunning) {
      if (testTimerRef.current) {
        clearInterval(testTimerRef.current);
        testTimerRef.current = null;
      }
      setIsTestRunning(false);
      setTestElapsedSeconds(0);
    }
    
    const hexCmd = '40 04 01 0A 00 4F';
    
    if (connectedPort && isDongleVerified) {
      // Send via dongle
      const sent = await sendToMachine(hexCmd);
      if (sent) {
        const deviceId = getCurrentMachineDeviceId();
        setSuccess(`✗ Cancel → ${deviceId ? `Device ${deviceId}` : 'All devices'}`);
      }
    } else {
      // Fallback to API
      try {
        await sendMachineCommand('CANCEL');
        setSuccess(`✗ Cancel [${hexCmd}] (via API)`);
      } catch (err) {
        setError('Failed to send cancel command');
      }
    }
  };

  // Handle Clean command - sends 40 04 09 00 0A 47
  const handleClean = async () => {
    const hexCmd = '40 04 09 00 0A 47';
    
    if (connectedPort && isDongleVerified) {
      // Send via dongle
      const sent = await sendToMachine(hexCmd);
      if (sent) {
        const deviceId = getCurrentMachineDeviceId();
        setSuccess(`🧹 Clean → ${deviceId ? `Device ${deviceId}` : 'All devices'}`);
      }
    } else {
      // Fallback to API
      try {
        await sendMachineCommand('CLEAN');
        setSuccess(`🧹 Clean [${hexCmd}] (via API)`);
      } catch (err) {
        setError('Failed to send clean command');
      }
    }
  };

  // Clear current reading
  const handleClearReading = () => {
    setCurrentReading(emptyReading);
    setSuccess('Display cleared');
  };

  // History navigation
  const goToPreviousReading = () => {
    if (historyIndex < readingHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setIsViewingHistory(true);
    }
  };

  const goToNextReading = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
    if (historyIndex <= 1) {
      setIsViewingHistory(false);
      setHistoryIndex(0);
    }
  };

  const goToLiveReading = () => {
    setIsViewingHistory(false);
    setHistoryIndex(0);
  };

  // Get displayed reading based on selected machine and history navigation
  // This is a COMPUTED value (like Flutter's getter) - automatically updates when machineReadings or selectedMachineId changes
  const displayedReading = useMemo(() => {
    // If viewing history, get from history list
    if (isViewingHistory && readingHistory.length > 0) {
      const actualIndex = readingHistory.length - 1 - historyIndex;
      if (actualIndex >= 0 && actualIndex < readingHistory.length) {
        return readingHistory[actualIndex];
      }
    }
    
    // Get reading for selected machine
    if (selectedMachineId && machineReadings.has(selectedMachineId)) {
      return machineReadings.get(selectedMachineId)!;
    }
    
    // Try normalized match (e.g., "201" matches "00201")
    if (selectedMachineId) {
      const normalizedSelected = selectedMachineId.replace(/^0+/, '');
      for (const [key, value] of machineReadings) {
        const normalizedKey = key.replace(/^0+/, '');
        if (normalizedKey === normalizedSelected) {
          return value;
        }
      }
    }
    
    // No data for selected machine - return empty
    return emptyReading;
  }, [isViewingHistory, readingHistory, historyIndex, selectedMachineId, machineReadings]);

  // Machine navigation
  const switchToPreviousMachine = () => {
    if (connectedMachines.length <= 1) return;
    setCurrentMachineIndex(prev => 
      prev === 0 ? connectedMachines.length - 1 : prev - 1
    );
  };

  const switchToNextMachine = () => {
    if (connectedMachines.length <= 1) return;
    setCurrentMachineIndex(prev => 
      prev === connectedMachines.length - 1 ? 0 : prev + 1
    );
  };

  // Format functions
  const formatMachineId = (id: string) => {
    return id.replace(/^[Mm]+/, '').replace(/^0+/, '') || '0';
  };

  const formatFarmerId = (id: string) => {
    return id.replace(/^0+/, '') || '0';
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return '--';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (isToday) {
      return `Today ${timeStr}`;
    }
    return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
  };

  const getTodayDateString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Initial load
  useEffect(() => {
    fetchMachineDetails();

    return () => {
      if (testTimerRef.current) clearInterval(testTimerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchMachineDetails]);

  // Polling for real-time updates
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      // Poll for new data every 5 seconds
      const token = localStorage.getItem('authToken');
      if (token && machine?.machineId) {
        fetchMachineReadings(machine.machineId, token);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [machine]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!machine) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Machine Not Found</h2>
          <p className="text-white/60 mt-2 mb-6">The machine could not be loaded</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Floating Header */}
      <header className="flex-none bg-slate-800/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">Control Panel</h1>
              <span className="text-xs text-white/50">
                {machine.isConnected ? 'Connected' : 'Offline'} • {getTodayDateString()}
              </span>
            </div>
          </div>

          {/* Center - History Navigator */}
          {readingHistory.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousReading}
                disabled={historyIndex >= readingHistory.length - 1}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white/70" />
              </button>
              
              <button
                onClick={goToLiveReading}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isViewingHistory
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-green-500/20 text-green-400 border border-green-500/40'
                }`}
              >
                {isViewingHistory ? (
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    {historyIndex + 1}/{readingHistory.length}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    LIVE
                  </span>
                )}
              </button>

              <button
                onClick={goToNextReading}
                disabled={historyIndex <= 0}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white/70" />
              </button>
            </div>
          )}

          {/* Right side - Multi-Machine Switcher (like Flutter) */}
          <div className="flex items-center gap-2">
            {/* Machine Pills - Show all connected machines */}
            {(machinesWithData.length > 0 || connectedBLEMachines.size > 0) ? (
              <div className="flex items-center gap-1.5">
                {Array.from(new Set([...machinesWithData, ...Array.from(connectedBLEMachines)])).map((mId) => {
                  const isSelected = selectedMachineId === mId;
                  const hasData = machineReadings.has(mId);
                  const reading = machineReadings.get(mId);
                  
                  return (
                    <button
                      key={mId}
                      onClick={() => {
                        setSelectedMachineId(mId);
                        // displayedReading is computed via useMemo - no need to set currentReading manually
}}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : hasData
                          ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
                          : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Bluetooth className={`w-3.5 h-3.5 ${isSelected ? 'text-green-400' : hasData ? 'text-blue-400' : 'text-white/40'}`} />
                      <span className="text-sm font-bold">M-{mId}</span>
                      {hasData && reading && (
                        <span className="text-[10px] text-white/50">
                          F:{reading.fat.toFixed(1)}
                        </span>
                      )}
                      {isSelected && (
                        <motion.div
                          layoutId="machine-indicator"
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white/40">
                <BluetoothOff className="w-4 h-4" />
                <span className="text-sm">No machines</span>
              </div>
            )}

            {/* Dongle Status - Read-only, connection managed in Machine Management */}
            <div className="ml-4 border-l border-white/20 pl-4">
              {connectedPort && isDongleVerified ? (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40"
                  title="USB dongle connected"
                >
                  <Usb className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    HUB Ready
                    {isMachineConnectedViaBLE() && ` • M-${machine?.machineId}`}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-500/40"
                  title="Commands will be sent via API"
                >
                  <Usb className="w-4 h-4" />
                  <span className="text-sm font-medium">API Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status Messages */}
      <AnimatePresence>
        {(error || success) && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            {error && (
              <InlineStatusMessage type="error" message={error} onClose={() => setError('')} />
            )}
            {success && (
              <InlineStatusMessage type="success" message={success} onClose={() => setSuccess('')} />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Controls Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Channel Selector */}
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as 'CH1' | 'CH2' | 'CH3')}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="CH1" className="bg-slate-800">🐄 Cow (CH1)</option>
              <option value="CH2" className="bg-slate-800">🐃 Buffalo (CH2)</option>
              <option value="CH3" className="bg-slate-800">🥛 Mixed (CH3)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Reports Button */}
            <button
              onClick={() => router.push(`/admin/machine/${machineDbId}?tab=analytics`)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Reports
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClearReading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="bg-blue-500/10 rounded-2xl border border-blue-500/20 p-4 mb-4 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-4">
            <InfoItem 
              label="TESTS" 
              value={todayStats.totalTests.toString()} 
              icon={<FileText className="w-5 h-5" />}
              color="#3b82f6"
            />
            <InfoItem 
              label="MACHINE" 
              value={selectedMachineId ? `M-${selectedMachineId}` : '--'} 
              icon={<Settings className="w-5 h-5" />}
              color="#22c55e"
            />
            <InfoItem 
              label="FARMER" 
              value={formatFarmerId(displayedReading.farmerId)} 
              icon={<User className="w-5 h-5" />}
              color="#14b8a6"
            />
            <InfoItem 
              label="BONUS" 
              value={`₹${displayedReading.incentive.toFixed(2)}`} 
              icon={<Award className="w-5 h-5" />}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Primary Readings (FAT, SNF, CLR) */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Milk Quality
          </span>
          <span className={`text-xs font-medium ${isViewingHistory ? 'text-amber-400' : 'text-white/50'}`}>
            {formatTimestamp(displayedReading.timestamp)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <PrimaryReadingCard
            title="FAT"
            value={displayedReading.fat}
            unit="%"
            color={colors.primaryAmber}
            maxValue={15}
            isViewingHistory={isViewingHistory}
          />
          <PrimaryReadingCard
            title="SNF"
            value={displayedReading.snf}
            unit="%"
            color={colors.primaryBlue}
            maxValue={15}
            isViewingHistory={isViewingHistory}
          />
          <PrimaryReadingCard
            title="CLR"
            value={displayedReading.clr}
            unit=""
            color={colors.primaryPurple}
            maxValue={100}
            isViewingHistory={isViewingHistory}
          />
        </div>

        {/* Transaction Section */}
        <div className="mb-3">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Transaction
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <TransactionCard
            title="Quantity"
            value={displayedReading.quantity}
            unit="L"
            color={colors.primaryBlue}
            type="quantity"
          />
          <span className="text-xl font-bold text-white/40">×</span>
          <TransactionCard
            title="Rate"
            value={displayedReading.rate}
            unit="/L"
            color={colors.primaryAmber}
            type="rate"
            prefix="₹"
          />
          <span className="text-xl font-bold text-white/40">=</span>
          <TotalAmountCard amount={displayedReading.totalAmount} />
        </div>

        {/* Additional Parameters */}
        <div className="mb-3">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Other Parameters
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <ParameterChip
            title="Milk Type"
            value={displayedReading.milkType === 'cow' ? 'Cow' : displayedReading.milkType === 'buffalo' ? 'Buffalo' : 'Mixed'}
            icon={<Droplet className="w-4 h-4" />}
            color={colors.primaryGreen}
          />
          <ParameterChip
            title="Protein"
            value={`${displayedReading.protein.toFixed(2)}%`}
            icon={<FlaskConical className="w-4 h-4" />}
            color={colors.errorColor}
          />
          <ParameterChip
            title="Lactose"
            value={`${displayedReading.lactose.toFixed(2)}%`}
            icon={<Beaker className="w-4 h-4" />}
            color={colors.primaryPink}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <ParameterChip
            title="Salt"
            value={`${displayedReading.salt.toFixed(2)}%`}
            icon={<Gauge className="w-4 h-4" />}
            color={colors.primarySlate}
          />
          <ParameterChip
            title="Water"
            value={`${displayedReading.water.toFixed(2)}%`}
            icon={<Droplets className="w-4 h-4" />}
            color={colors.primaryTeal}
          />
          <ParameterChip
            title="Temp"
            value={`${displayedReading.temperature.toFixed(1)}°C`}
            icon={<Thermometer className="w-4 h-4" />}
            color={colors.primaryOrange}
          />
        </div>

        {/* Live Trend Graph */}
        <div className="mb-3">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Live Trend ({getTodayDateString()})
          </span>
        </div>

        <LiveTrendGraph readings={readingHistory} />

        {/* Today's Statistics */}
        {todayStats.totalTests > 0 && (
          <>
            <div className="mb-3 mt-4">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                Today's Stats ({getTodayDateString()})
              </span>
            </div>

            <TodayStatsCard stats={todayStats} formatFarmerId={formatFarmerId} />
          </>
        )}

        {/* Command Reference */}
        <div className="mb-3 mt-4">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Command Protocol
          </span>
        </div>
        
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm mb-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 mb-3">
            {connectedPort && isDongleVerified ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Direct HUB Mode</span>
                {isMachineConnectedViaBLE() && (
                  <span className="text-white/60 text-sm">• Machine {machine?.machineId} via BLE</span>
                )}
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-sm font-medium">API Mode</span>
                <span className="text-white/40 text-xs">• Commands queued to database</span>
              </>
            )}
          </div>
          
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-green-400">Test:</span>
              <span className="text-white/60">40 0B 07 [ch] [cycle] [fID] [wt] [LRC]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400">OK:</span>
              <span className="text-white/60">40 04 01 04 00 41</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400">Cancel:</span>
              <span className="text-white/60">40 04 01 0A 00 4F</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400">Clean:</span>
              <span className="text-white/60">40 04 09 00 0A 47</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar - Fixed */}
      <div className="flex-none bg-slate-800/90 backdrop-blur-xl border-t border-white/10 p-4 safe-area-pb">
        <div className="flex items-center justify-around gap-3 max-w-2xl mx-auto">
          <ActionButton
            label={isTestRunning ? `${testElapsedSeconds}s` : 'Test'}
            icon={isTestRunning ? <Timer className="w-7 h-7" /> : <Play className="w-7 h-7" />}
            color={isTestRunning ? colors.warningColor : colors.successColor}
            onClick={isTestRunning ? undefined : handleTest}
            isLoading={isTestRunning}
          />
          <ActionButton
            label="OK"
            icon={<Check className="w-7 h-7" />}
            color={colors.primaryBlue}
            onClick={handleOk}
          />
          <ActionButton
            label="Cancel"
            icon={<X className="w-7 h-7" />}
            color={colors.warningColor}
            onClick={handleCancel}
          />
          <ActionButton
            label="Clean"
            icon={<Droplets className="w-7 h-7" />}
            color={colors.primaryPurple}
            onClick={handleClean}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-Components (Dark theme styled)
// ============================================

// Info Item Component
function InfoItem({ label, value, icon, color }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="p-2 rounded-lg"
        style={{ background: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-white/50 uppercase">
          {label}
        </span>
        <span className="text-base font-bold text-white">
          {value}
        </span>
      </div>
    </div>
  );
}

// Primary Reading Card Component
function PrimaryReadingCard({ 
  title, 
  value, 
  unit, 
  color, 
  maxValue = 15,
  isViewingHistory = false 
}: {
  title: string;
  value: number;
  unit: string;
  color: string;
  maxValue?: number;
  isViewingHistory?: boolean;
}) {
  const progress = Math.min(value / maxValue, 1);
  const isActive = value > 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - progress);

  const getIcon = () => {
    switch (title) {
      case 'FAT': return <Droplet className="w-4 h-4" />;
      case 'SNF': return <Gauge className="w-4 h-4" />;
      case 'CLR': return <Beaker className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl p-5 transition-all duration-300 backdrop-blur-sm"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `2px solid ${isActive ? `${color}50` : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      {/* Active glow bar */}
      {isActive && (
        <div 
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      )}

      <div className="flex flex-col items-center">
        {/* Title Badge */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
          style={{ 
            background: isActive ? `${color}25` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <span style={{ color }}>{getIcon()}</span>
          <span 
            className="text-xs font-bold"
            style={{ color: isActive ? color : 'rgba(255,255,255,0.5)' }}
          >
            {title}
          </span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
                filter: `drop-shadow(0 0 8px ${color}60)`,
              }}
            />
          </svg>
          
          {/* Value in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-white"
            >
              {title === 'CLR' ? value.toFixed(1) : value.toFixed(2)}
            </motion.span>
            {unit && (
              <span className="text-xs text-white/50">{unit}</span>
            )}
          </div>
        </div>

        {/* History indicator */}
        {isViewingHistory && (
          <span className="text-[10px] text-amber-400 font-medium">
            History
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Transaction Card Component
function TransactionCard({ 
  title, 
  value, 
  unit, 
  color, 
  type,
  prefix = ''
}: {
  title: string;
  value: number;
  unit: string;
  color: string;
  type: 'quantity' | 'rate';
  prefix?: string;
}) {
  const icon = type === 'quantity' 
    ? <Scale className="w-4 h-4" /> 
    : <TrendingUp className="w-4 h-4" />;

  return (
    <div 
      className="flex-1 rounded-xl p-4 border backdrop-blur-sm"
      style={{ 
        background: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-medium text-white/60">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">
          {prefix}{value.toFixed(2)}
        </span>
        <span className="text-sm text-white/50">{unit}</span>
      </div>
    </div>
  );
}

// Total Amount Card Component
function TotalAmountCard({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="flex-[1.5] rounded-xl p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-400 text-lg">₹</span>
        <span className="text-xs font-medium text-green-400">Total</span>
      </div>
      <motion.div
        key={amount}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl font-bold text-green-400"
        style={{ textShadow: '0 0 20px rgba(34,197,94,0.5)' }}
      >
        ₹{amount.toFixed(2)}
      </motion.div>
    </motion.div>
  );
}

// Parameter Chip Component
function ParameterChip({ 
  title, 
  value, 
  icon, 
  color 
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div 
      className="rounded-xl p-3 border backdrop-blur-sm"
      style={{ 
        background: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-medium text-white/50 uppercase truncate">
          {title}
        </span>
      </div>
      <span className="text-sm font-bold text-white">
        {value}
      </span>
    </div>
  );
}

// Live Trend Graph Component
function LiveTrendGraph({ readings }: { readings: MilkReading[] }) {
  const maxPoints = 20;
  const displayReadings = readings.slice(-maxPoints);
  
  if (displayReadings.length < 2) {
    return (
      <div className="h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <span className="text-sm text-white/50">
            Not enough data for trend
          </span>
        </div>
      </div>
    );
  }

  // Find max values for scaling
  const maxFat = Math.max(...displayReadings.map(r => r.fat), 10);
  const maxSnf = Math.max(...displayReadings.map(r => r.snf), 10);
  const maxClr = Math.max(...displayReadings.map(r => r.clr), 40);
  const maxValue = Math.max(maxFat, maxSnf, maxClr);
  const scaledMax = Math.ceil(maxValue / 10) * 10;

  const width = 100;
  const height = 100;
  
  const getPath = (key: 'fat' | 'snf' | 'clr') => {
    const scale = key === 'clr' ? scaledMax : scaledMax;
    const points = displayReadings.map((r, i) => {
      const x = (i / (displayReadings.length - 1)) * width;
      const y = height - ((r[key] / scale) * height);
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  };

  return (
    <div className="h-48 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
          <span className="text-xs text-white/60">FAT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
          <span className="text-xs text-white/60">SNF</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" style={{ boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
          <span className="text-xs text-white/60">CLR</span>
        </div>
      </div>

      {/* Graph */}
      <svg 
        viewBox={`-5 -5 ${width + 10} ${height + 10}`} 
        className="w-full h-32"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Data lines */}
        <path
          d={getPath('fat')}
          fill="none"
          stroke={colors.primaryAmber}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }}
        />
        <path
          d={getPath('snf')}
          fill="none"
          stroke={colors.primaryBlue}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' }}
        />
        <path
          d={getPath('clr')}
          fill="none"
          stroke={colors.primaryPurple}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.5))' }}
        />
      </svg>
    </div>
  );
}

// Today Stats Card Component
function TodayStatsCard({ 
  stats, 
  formatFarmerId 
}: { 
  stats: TodayStats;
  formatFarmerId: (id: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatItem
          label="Tests"
          value={stats.totalTests.toString()}
          icon={<FileText className="w-5 h-5" />}
          color={colors.primaryBlue}
        />
        <StatItem
          label="Quantity"
          value={`${stats.totalQuantity.toFixed(1)}L`}
          icon={<Droplets className="w-5 h-5" />}
          color={colors.primaryTeal}
        />
        <StatItem
          label="Amount"
          value={`₹${stats.totalAmount.toFixed(0)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color={colors.primaryGreen}
        />
      </div>

      <hr className="border-white/10 my-4" />

      {/* Averages Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatItem
          label="Avg FAT"
          value={stats.avgFat.toFixed(2)}
          icon={<Droplet className="w-5 h-5" />}
          color={colors.primaryAmber}
          subtitle={`${stats.lowestFat.toFixed(1)} - ${stats.highestFat.toFixed(1)}`}
        />
        <StatItem
          label="Avg SNF"
          value={stats.avgSnf.toFixed(2)}
          icon={<Gauge className="w-5 h-5" />}
          color={colors.primaryPurple}
          subtitle={`${stats.lowestSnf.toFixed(1)} - ${stats.highestSnf.toFixed(1)}`}
        />
      </div>

      <hr className="border-white/10 my-4" />

      {/* Best & Worst Row */}
      <div className="grid grid-cols-2 gap-4">
        <QualityCard
          title="Best Quality"
          icon={<Award className="w-4 h-4" />}
          color={colors.primaryGreen}
          reading={stats.bestReading}
          formatFarmerId={formatFarmerId}
        />
        <QualityCard
          title="Needs Improvement"
          icon={<TrendingDown className="w-4 h-4" />}
          color={colors.errorColor}
          reading={stats.worstReading}
          formatFarmerId={formatFarmerId}
        />
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({ 
  label, 
  value, 
  icon, 
  color,
  subtitle 
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="p-2.5 rounded-xl"
        style={{ background: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-base font-bold text-white">{value}</span>
        {subtitle && (
          <span className="text-[10px] text-white/40">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

// Quality Card Component
function QualityCard({ 
  title, 
  icon, 
  color, 
  reading,
  formatFarmerId 
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  reading?: MilkReading;
  formatFarmerId: (id: string) => string;
}) {
  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        background: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-semibold" style={{ color }}>{title}</span>
      </div>
      
      {reading ? (
        <div className="space-y-1">
          <div className="text-sm text-white/70">
            Farmer {formatFarmerId(reading.farmerId)}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-amber-400">F: {reading.fat.toFixed(1)}</span>
            <span className="text-blue-400">S: {reading.snf.toFixed(1)}</span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-white/40">No data</span>
      )}
    </div>
  );
}

// Action Button Component
function ActionButton({ 
  label, 
  icon, 
  color, 
  onClick,
  isLoading = false 
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  const isDisabled = !onClick;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="flex-1 flex flex-col items-center gap-2 py-2 transition-all"
    >
      <motion.div
        whileTap={!isDisabled ? { scale: 0.9 } : undefined}
        whileHover={!isDisabled ? { scale: 1.05 } : undefined}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isDisabled ? 'opacity-40' : ''
        }`}
        style={{ 
          background: `${color}20`,
          border: `2px solid ${color}40`,
          boxShadow: isLoading ? `0 0 20px ${color}40` : 'none',
        }}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-6 h-6" style={{ color }} />
          </motion.div>
        ) : (
          <span style={{ color }}>{icon}</span>
        )}
      </motion.div>
      <span 
        className={`text-xs font-bold ${isDisabled ? 'text-white/30' : 'text-white/70'}`}
      >
        {label}
      </span>
    </button>
  );
}
