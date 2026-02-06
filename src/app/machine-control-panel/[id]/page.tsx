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
  BarChart3,
  FileText,
  History,
  Usb,
  Zap,
  CircleDot,
  Waves,
  Sparkles
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
 * Extract value from prefixed string (e.g., "F05.21" -> "05.21")
 */
function extractValue(part: string, prefix: string): string {
  return part.replace(prefix, '');
}

/**
 * Parse double value safely
 */
function parseDoubleValue(value: string): number {
  try {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0.0 : parsed;
  } catch {
    return 0.0;
  }
}

/**
 * Parse Lactosure machine pipe-delimited data format (matching Flutter exactly)
 * Format: LE3.36|A|CH1|F05.21|S12.58|C44.10|P04.60|L06.90|s01.04|W00.00|T20.00|I000100|Q00100.00|R00000.00|r000.00|i000.00|MM00201|D2026-01-05_10:28:12
 * 
 * Parts by position:
 * [0]: LE3.36 (version)
 * [1]: A (status)
 * [2]: CH1 (milk type - CH1=Cow, CH2=Buffalo, CH3=Mixed)
 * [3]: F05.21 (FAT)
 * [4]: S12.58 (SNF)
 * [5]: C44.10 (CLR)
 * [6]: P04.60 (Protein)
 * [7]: L06.90 (Lactose)
 * [8]: s01.04 (Salt - lowercase 's')
 * [9]: W00.00 (Water)
 * [10]: T20.00 (Temperature)
 * [11]: I000100 (Farmer ID)
 * [12]: Q00100.00 (Quantity)
 * [13]: R00000.00 (Total Amount)
 * [14]: r000.00 (Rate - lowercase 'r')
 * [15]: i000.00 (Incentive - lowercase 'i')
 * [16]: MM00201 (Machine ID)
 * [17]: D2026-01-05_10:28:12 (Timestamp)
 */
function parseLactosureData(rawData: string): MilkReading | null {
  try {
    console.log('🔵 [Parser] Raw data received:', rawData);
    console.log('🔵 [Parser] Data length:', rawData.length, 'characters');

    // Remove trailing control characters (like Flutter: replaceAll(RegExp(r'\^@|\r|\n'), ''))
    const cleanData = rawData.replace(/\^@|\r|\n|[\x00-\x1F\x7F]/g, '').trim();
    console.log('🔵 [Parser] After cleanup:', cleanData);

    // Split by pipe delimiter
    const parts = cleanData.split('|');
    console.log('🔵 [Parser] Split into', parts.length, 'parts');

    // Flutter requires at least 16 parts
    if (parts.length < 16) {
      console.log('❌ [Parser] Invalid data - expected at least 16 parts, got', parts.length);
      console.log('📄 [Parser] Parts:', parts);
      return null;
    }

    console.log('📋 [Parser] Parsing each field:');
    for (let i = 0; i < Math.min(parts.length, 18); i++) {
      console.log(`   [${i}]: ${parts[i]}`);
    }

    // Parse timestamp if available (parts[17]: D2026-01-05_10:28:12)
    let readingTimestamp = new Date();
    if (parts.length > 17) {
      try {
        const timestampStr = extractValue(parts[17], 'D');
        // Format: 2026-01-05_10:28:12
        const cleanTimestamp = timestampStr.replace('_', 'T');
        const parsed = new Date(cleanTimestamp);
        if (!isNaN(parsed.getTime())) {
          readingTimestamp = parsed;
        }
      } catch (e) {
        console.log('⚠️ [Parser] Could not parse timestamp:', e);
      }
    }

    // Parse milk type from CH field (parts[2])
    const chValue = extractValue(parts[2], 'CH');
    let milkType: 'cow' | 'buffalo' | 'mixed' = 'cow';
    if (chValue === '2') {
      milkType = 'buffalo';
    } else if (chValue === '3') {
      milkType = 'mixed';
    }

    const reading: MilkReading = {
      milkType: milkType,                                           // parts[2]: CH1/CH2/CH3
      fat: parseDoubleValue(extractValue(parts[3], 'F')),           // parts[3]: F05.21
      snf: parseDoubleValue(extractValue(parts[4], 'S')),           // parts[4]: S12.58
      clr: parseDoubleValue(extractValue(parts[5], 'C')),           // parts[5]: C44.10
      protein: parseDoubleValue(extractValue(parts[6], 'P')),       // parts[6]: P04.60
      lactose: parseDoubleValue(extractValue(parts[7], 'L')),       // parts[7]: L06.90
      salt: parseDoubleValue(extractValue(parts[8], 's')),          // parts[8]: s01.04 (lowercase s!)
      water: parseDoubleValue(extractValue(parts[9], 'W')),         // parts[9]: W00.00
      temperature: parseDoubleValue(extractValue(parts[10], 'T')),  // parts[10]: T20.00
      farmerId: extractValue(parts[11], 'I'),                       // parts[11]: I000100
      quantity: parseDoubleValue(extractValue(parts[12], 'Q')),     // parts[12]: Q00100.00
      totalAmount: parseDoubleValue(extractValue(parts[13], 'R')),  // parts[13]: R00000.00
      rate: parseDoubleValue(extractValue(parts[14], 'r')),         // parts[14]: r000.00 (lowercase r!)
      incentive: parseDoubleValue(extractValue(parts[15], 'i')),    // parts[15]: i000.00 (lowercase i!)
      machineId: parts.length > 16 
        ? extractValue(parts[16], 'MM') 
        : '0',                                                      // parts[16]: MM00201
      timestamp: readingTimestamp,                                  // parts[17]: D2026-01-05_10:28:12
    };

    console.log('✅ [Parser] Successfully created reading:', {
      fat: reading.fat,
      snf: reading.snf,
      clr: reading.clr,
      farmerId: reading.farmerId,
      machineId: reading.machineId,
    });

    return reading;
  } catch (e) {
    console.log('❌ [Parser] Error parsing lactosure data:', e);
    return null;
  }
}

// Glassmorphism Loader
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 opacity-20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500/30 rounded-full" />
            <div className="absolute w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Control Panel</h2>
          <p className="text-gray-400 text-sm">Initializing dashboard...</p>
        </div>
      </div>
    </div>
  );
}

// Toast Notification
function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void; }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl shadow-2xl ${
        type === 'success' 
          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
          : 'bg-red-500/20 border border-red-500/40 text-red-300'
      }`}
    >
      {type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors ml-2">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function MachineControlPanelDashboard() {
  const router = useRouter();
  const params = useParams();
  const machineDbId = params.id as string;

  // Machine state
  const [machine, setMachine] = useState<MachineConnection | null>(null);
  const [connectedMachines, setConnectedMachines] = useState<MachineConnection[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  
  // Reading state - matching Flutter's _machineReadings and _machineReadingHistory
  const [machineReadings, setMachineReadings] = useState<Map<string, MilkReading>>(new Map());
  const [machineReadingHistory, setMachineReadingHistory] = useState<Map<string, MilkReading[]>>(new Map()); // Per-machine history like Flutter
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const MAX_HISTORY_POINTS = 20; // Matching Flutter's _maxHistoryPoints
  
  // Test state - matching Flutter's _isTestRunning, _currentTestMachines, _machinesWithDataReceived
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testElapsedSeconds, setTestElapsedSeconds] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<'CH1' | 'CH2' | 'CH3'>('CH1');
  const [currentTestMachines, setCurrentTestMachines] = useState<string[]>([]); // Machines being tested
  const [machinesWithDataReceived, setMachinesWithDataReceived] = useState<Set<string>>(new Set()); // Machines that received data during test
  
  // Machine modes (Auto/Manual) - per machine settings
  const [machineWeighingScaleMode, setMachineWeighingScaleMode] = useState<Map<string, boolean>>(new Map()); // true = Auto, false = Manual
  const [machineFarmerIdMode, setMachineFarmerIdMode] = useState<Map<string, boolean>>(new Map()); // true = Auto, false = Manual (default)
  
  // Farmer ID and Weight inputs per machine
  const [machineFarmerIds, setMachineFarmerIds] = useState<Map<string, string>>(new Map());
  const [machineWeights, setMachineWeights] = useState<Map<string, string>>(new Map());
  
  // Dialog states
  const [showFarmerIdDialog, setShowFarmerIdDialog] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [pendingTestMachines, setPendingTestMachines] = useState<string[]>([]);
  
  // Today's statistics
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalTests: 0, totalQuantity: 0, totalAmount: 0,
    avgFat: 0, avgSnf: 0, highestFat: 0, lowestFat: 0, highestSnf: 0, lowestSnf: 0,
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dongle context
  const {
    connectedPort, isDongleVerified, connectedBLEMachines,
    sendDongleCommand, onBleData, offBleData,
  } = useDongle();
  
  // Refs
  const testTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFarmerIdsRef = useRef<Map<string, string>>(new Map());

  // Extract numeric ID from machine ID (e.g., "PSR-048" -> "48", "M-201" -> "201")
  const extractNumericId = useCallback((machineId: string | undefined): string | null => {
    if (!machineId) return null;
    const numericId = machineId.replace(/[^0-9]/g, '').replace(/^0+/, '');
    return numericId || null;
  }, []);

  // Check BLE connection status
  const isMachineConnectedViaBLE = useCallback((): boolean => {
    const numericId = extractNumericId(machine?.machineId);
    if (!numericId) return false;
    return connectedBLEMachines.has(numericId);
  }, [machine?.machineId, connectedBLEMachines, extractNumericId]);
  
  // Send command to ALL connected machines via SENDHEXALL
  const sendToAllMachines = useCallback(async (hexCommand: string): Promise<boolean> => {
    if (connectedPort && isDongleVerified) {
      return await sendDongleCommand(`SENDHEXALL,${hexCommand}`);
    }
    setError('No dongle connected. Connect from Machine Management first.');
    return false;
  }, [connectedPort, isDongleVerified, sendDongleCommand]);

  // Normalize machine ID - matching Flutter's _normalizeId
  // Strips 'M' prefix and leading zeros
  const normalizeId = useCallback((id: string): string => {
    return id.replace(/^[Mm]+/, '').replace(/^0+/, '') || '0';
  }, []);
  
  // BLE data subscription - matching Flutter's _setupBLEListener with updateWithBLEData pattern
  useEffect(() => {
    const handleBleData = (machineId: string, data: string) => {
      console.log('\n▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼');
      console.log(`📡 [Control Panel] BLE data received for machine: ${machineId}`);
      console.log(`📡 [Control Panel] Raw data length: ${data.length} characters`);
      
      const parsed = parseLactosureData(data);
      if (!parsed) {
        console.log('❌ [Control Panel] Failed to parse data');
        console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲\n');
        return;
      }

      // Normalize machine ID for storage (matching Flutter)
      const storageKey = normalizeId(machineId);
      console.log(`🔑 [Control Panel] Storage key (normalized): ${storageKey}`);
      
      const readingWithMachine = { ...parsed, machineId: storageKey };
      
      // Update machine readings Map
      setMachineReadings(prev => {
        const newMap = new Map(prev);
        newMap.set(storageKey, readingWithMachine);
        console.log(`✅ [Control Panel] Updated machineReadings for: ${storageKey}`);
        return newMap;
      });
      
      // Set selected machine if not set
      if (!selectedMachineId) setSelectedMachineId(storageKey);
      
      // Update per-machine reading history (matching Flutter's _machineReadingHistory)
      setMachineReadingHistory(prev => {
        const newHistory = new Map(prev);
        const machineHistory = newHistory.get(storageKey) || [];
        const updatedHistory = [...machineHistory, readingWithMachine];
        
        // Limit to MAX_HISTORY_POINTS (matching Flutter's _maxHistoryPoints)
        if (updatedHistory.length > MAX_HISTORY_POINTS) {
          updatedHistory.shift(); // Remove oldest
        }
        
        newHistory.set(storageKey, updatedHistory);
        console.log(`📊 [Control Panel] History size for ${storageKey}: ${updatedHistory.length}`);
        
        // Calculate stats from all machine histories
        const allReadings: MilkReading[] = [];
        newHistory.forEach(readings => allReadings.push(...readings));
        calculateTodayStats(allReadings);
        
        return newHistory;
      });
      
      // Track machine that received data during test (matching Flutter)
      if (isTestRunning && currentTestMachines.length > 0) {
        // Find matching machine in current test
        for (const testMachine of currentTestMachines) {
          const normalizedTest = normalizeId(testMachine);
          if (normalizedTest === storageKey || testMachine === storageKey) {
            console.log(`✅ [Test] Machine ${testMachine} received data`);
            
            setMachinesWithDataReceived(prev => {
              const newSet = new Set(prev);
              newSet.add(testMachine);
              console.log(`✅ [Test] Machines with data: ${newSet.size}/${currentTestMachines.length}`);
              
              // Check if ALL machines received data - mark complete (matching Flutter)
              if (newSet.size >= currentTestMachines.length && currentTestMachines.length > 0) {
                console.log('🎉 [Test] All machines received data!');
                // Complete test
                handleStopTest();
                setSuccess(`Test Complete: All ${currentTestMachines.length} machine(s) received data! FAT ${parsed.fat.toFixed(2)}%, SNF ${parsed.snf.toFixed(2)}%`);
              }
              
              return newSet;
            });
            break;
          }
        }
      } else {
        // Not in test mode - show notification for data received (matching Flutter's _showDataReceivedSnackbar)
        if (parsed.fat > 0 || parsed.snf > 0) {
          setSuccess(`Data received from M${storageKey}: FAT ${parsed.fat.toFixed(1)}% | SNF ${parsed.snf.toFixed(1)}% | CLR ${parsed.clr.toFixed(1)}`);
        }
      }
      
      console.log(`✅ [Control Panel] UI updated for machine: ${storageKey}`);
      console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲\n');
    };
    
    onBleData(handleBleData);
    return () => offBleData(handleBleData);
  }, [selectedMachineId, onBleData, offBleData, isTestRunning, currentTestMachines, normalizeId]);

  // Update connected machines from context - merge with API-loaded machine
  useEffect(() => {
    // Start with BLE connected machines
    const bleConnected: MachineConnection[] = Array.from(connectedBLEMachines).map(machineId => ({
      id: machineId, 
      machineId, 
      machineName: `Machine M-${machineId}`,
      isConnected: true, 
      signalStrength: 'excellent' as const,
    }));
    
    // If we have an API-loaded machine, check if it's in BLE list
    if (machine) {
      const apiMachineNumericId = extractNumericId(machine.machineId);
      const isBleConnected = apiMachineNumericId && connectedBLEMachines.has(apiMachineNumericId);
      
      // Check if API machine is already in BLE list
      const existsInBle = bleConnected.some(m => m.machineId === apiMachineNumericId);
      
      if (!existsInBle) {
        // Add API machine to list (with BLE connection status)
        bleConnected.unshift({
          id: machine.id,
          machineId: apiMachineNumericId || machine.machineId,
          machineName: machine.machineName,
          isConnected: isBleConnected || false,
          signalStrength: isBleConnected ? 'excellent' : 'poor',
        });
      }
    }
    
    if (bleConnected.length > 0) {
      setConnectedMachines(bleConnected);
    }
    
    // Auto-select first machine if none selected
    if (!selectedMachineId && bleConnected.length > 0) {
      // Prefer the current machine from URL if it's connected via BLE
      const apiMachineNumericId = extractNumericId(machine?.machineId);
      if (apiMachineNumericId && connectedBLEMachines.has(apiMachineNumericId)) {
        setSelectedMachineId(apiMachineNumericId);
      } else if (bleConnected.length > 0) {
        setSelectedMachineId(bleConnected[0].machineId);
      }
    }
  }, [connectedBLEMachines, selectedMachineId, machine, extractNumericId]);

  const machinesWithData = Array.from(machineReadings.keys());

  // Fetch machine details
  const fetchMachineDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) { router.push('/login'); return; }

      const response = await fetch(`/api/user/machine?id=${machineDbId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch machine details');

      const result = await response.json();
      if (result.success && result.data?.[0]) {
        const machineData = result.data[0];
        const machineConnection: MachineConnection = {
          id: machineDbId, machineId: machineData.machineId,
          machineName: `Machine ${machineData.machineId}`,
          isConnected: machineData.status === 'active',
          lastActivity: machineData.lastActivity ? new Date(machineData.lastActivity) : undefined,
          signalStrength: 'excellent'
        };
        setMachine(machineConnection);
        setConnectedMachines([machineConnection]);
        await fetchMachineReadings(machineData.machineId, token);
      }
    } catch { setError('Failed to load machine details'); }
    finally { setLoading(false); }
  }, [machineDbId, router]);

  // Fetch machine readings
  const fetchMachineReadings = async (machineId: string, token: string) => {
    try {
      const response = await fetch(`/api/user/reports/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const machineCollections = result.data
            .filter((col: any) => col.machine_id === machineId)
            .filter((col: any) => {
              const colDate = new Date(col.collection_date);
              colDate.setHours(0, 0, 0, 0);
              return colDate.getTime() === today.getTime();
            })
            .map((col: any): MilkReading => ({
              milkType: col.channel?.toLowerCase() === 'buffalo' ? 'buffalo' : col.channel?.toLowerCase() === 'mixed' ? 'mixed' : 'cow',
              fat: parseFloat(col.fat) || 0, snf: parseFloat(col.snf) || 0, clr: parseFloat(col.clr) || 0,
              protein: parseFloat(col.protein) || 0, lactose: parseFloat(col.lactose) || 0,
              salt: parseFloat(col.salt) || 0, water: parseFloat(col.water) || 0,
              temperature: parseFloat(col.temperature) || 0, farmerId: col.farmer_id?.toString() || '0',
              quantity: parseFloat(col.quantity) || 0, totalAmount: parseFloat(col.total_amount) || 0,
              rate: parseFloat(col.rate) || 0, incentive: parseFloat(col.bonus) || 0,
              machineId: col.machine_id, timestamp: new Date(col.collection_date + ' ' + (col.collection_time || '00:00:00')),
              shift: col.session === 'MO' ? 'MR' : 'EV',
            }));
          // Store in per-machine history (matching Flutter's _machineReadingHistory)
          if (machineCollections.length > 0) {
            const normalizedId = machineId.replace(/^[Mm]+/, '').replace(/^0+/, '') || '0';
            setMachineReadingHistory(prev => {
              const newHistory = new Map(prev);
              newHistory.set(normalizedId, machineCollections.slice(-MAX_HISTORY_POINTS));
              return newHistory;
            });
          }
          calculateTodayStats(machineCollections);
        }
      }
    } catch {}
  };

  // Calculate statistics
  const calculateTodayStats = (readings: MilkReading[]) => {
    if (readings.length === 0) {
      setTodayStats({ totalTests: 0, totalQuantity: 0, totalAmount: 0, avgFat: 0, avgSnf: 0, highestFat: 0, lowestFat: 0, highestSnf: 0, lowestSnf: 0 });
      return;
    }
    let sumFat = 0, sumSnf = 0, sumQuantity = 0, sumAmount = 0;
    let maxFat = 0, minFat = Infinity, maxSnf = 0, minSnf = Infinity;
    readings.forEach(r => {
      sumFat += r.fat; sumSnf += r.snf; sumQuantity += r.quantity; sumAmount += r.totalAmount;
      maxFat = Math.max(maxFat, r.fat); minFat = Math.min(minFat, r.fat);
      maxSnf = Math.max(maxSnf, r.snf); minSnf = Math.min(minSnf, r.snf);
    });
    setTodayStats({
      totalTests: readings.length, totalQuantity: sumQuantity, totalAmount: sumAmount,
      avgFat: sumFat / readings.length, avgSnf: sumSnf / readings.length,
      highestFat: maxFat, lowestFat: minFat === Infinity ? 0 : minFat,
      highestSnf: maxSnf, lowestSnf: minSnf === Infinity ? 0 : minSnf,
    });
  };

  // Build test command matching Flutter format exactly
  // Format: 40 0B 07 [channel] [cycleMode] [farmerID_MSB] [farmerID_MID] [farmerID_LSB] [weight3] [weight2] [weight1] [weight0] [LRC]
  const buildTestCommand = (channel: string, farmerId: string, weight: number): string => {
    // Channel byte: CH1 (Cow) = 0x00, CH2 (Buffalo) = 0x01, CH3 (Mixed) = 0x02
    let channelByte: number;
    switch (channel) {
      case 'CH1': channelByte = 0x00; break;
      case 'CH2': channelByte = 0x01; break;
      case 'CH3': channelByte = 0x02; break;
      default: channelByte = 0x00;
    }

    // Cycle mode (default to 0x00)
    const cycleMode = 0x00;

    // Convert farmer ID to integer and then to 3 bytes (Big-Endian)
    const farmerIdInt = parseInt(farmerId) || 1;
    const farmerIdMsb = (farmerIdInt >> 16) & 0xFF;
    const farmerIdMid = (farmerIdInt >> 8) & 0xFF;
    const farmerIdLsb = farmerIdInt & 0xFF;

    // Convert weight to 4 bytes (multiply by 100, then Big-Endian)
    const weightInt = Math.round(weight * 100);
    const weightByte3 = (weightInt >> 24) & 0xFF;
    const weightByte2 = (weightInt >> 16) & 0xFF;
    const weightByte1 = (weightInt >> 8) & 0xFF;
    const weightByte0 = weightInt & 0xFF;

    // Build command bytes
    const bytes = [
      0x40,         // Header
      0x0B,         // Number of bytes (11)
      0x07,         // Command: Test
      channelByte,  // Channel
      cycleMode,    // Cycle mode
      farmerIdMsb,  // Farmer ID MSB
      farmerIdMid,  // Farmer ID MID
      farmerIdLsb,  // Farmer ID LSB
      weightByte3,  // Weight byte 3 (MSB)
      weightByte2,  // Weight byte 2
      weightByte1,  // Weight byte 1
      weightByte0,  // Weight byte 0 (LSB)
    ];

    // Calculate LRC (XOR of all bytes)
    let lrc = 0;
    bytes.forEach(b => lrc ^= b);
    bytes.push(lrc);

    // Convert to hex string
    const hexCommand = bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
    console.log(`🔧 [Test Command] Channel: ${channel}, Farmer ID: ${farmerIdInt}, Weight: ${weight}kg`);
    console.log(`🔧 [Test Command] Hex: ${hexCommand}`);
    
    return hexCommand;
  };

  // Format machine ID (remove leading zeros)
  const formatMachineId = (machineId: string) => {
    return machineId.replace(/^0+/, '') || '0';
  };

  // Initialize test flow - check modes and show dialogs if needed
  const initiateTest = async () => {
    if (connectedBLEMachines.size === 0) {
      setError('No machines connected');
      return;
    }

    const machineIds = Array.from(connectedBLEMachines.keys());
    
    // Clear stored farmer IDs and weights for new test
    setMachineFarmerIds(new Map());
    setMachineWeights(new Map());

    // Check which machines need manual farmer ID input (default is Manual = false)
    const manualFarmerIdMachines = machineIds.filter(id => !(machineFarmerIdMode.get(id) ?? false));
    
    // Check which machines need manual weight input (default is Auto = true)
    const manualWeightMachines = machineIds.filter(id => !(machineWeighingScaleMode.get(id) ?? true));

    setPendingTestMachines(machineIds);

    // If any machine needs manual Farmer ID, show dialog
    if (manualFarmerIdMachines.length > 0) {
      setShowFarmerIdDialog(true);
      return;
    }

    // If any machine needs manual Weight, show dialog
    if (manualWeightMachines.length > 0) {
      setShowWeightDialog(true);
      return;
    }

    // All machines are in Auto mode, proceed with test
    await executeTest(machineIds);
  };

  // Execute the actual test after dialogs are completed
  const executeTest = async (machineIds: string[], farmerIds?: Map<string, string>, weights?: Map<string, string>) => {
    // Use passed values or fall back to state (passed values avoid async state issues)
    const finalFarmerIds = farmerIds || machineFarmerIds;
    const finalWeights = weights || machineWeights;
    
    // Clear previous test state (matching Flutter)
    setMachinesWithDataReceived(new Set());
    setCurrentTestMachines(machineIds);
    
    setIsTestRunning(true);
    setTestElapsedSeconds(0);
    testTimerRef.current = setInterval(() => setTestElapsedSeconds(s => s + 1), 1000);

    console.log(`🧪 [Test] Starting test for ${machineIds.length} machine(s):`, machineIds);

    // Send test command to all machines
    for (const machineId of machineIds) {
      const farmerId = finalFarmerIds.get(machineId) || '1';
      const weight = parseFloat(finalWeights.get(machineId) || '1') || 1;
      const testHex = buildTestCommand(selectedChannel, farmerId, weight);
      
      // Send to all machines using SENDHEXALL
      if (sendDongleCommand) {
        await sendDongleCommand(`SENDHEXALL,${testHex}`);
        break; // SENDHEXALL sends to all, so only need to send once
      }
    }
    
    setSuccess(`Test sent to ${connectedBLEMachines.size} machine(s)!`);
  };

  // Handle farmer ID dialog completion
  const handleFarmerIdDialogComplete = (farmerIds: Map<string, string>) => {
    setMachineFarmerIds(farmerIds);
    setShowFarmerIdDialog(false);
    
    // Store farmer IDs in ref for use after weight dialog (avoids async state issues)
    pendingFarmerIdsRef.current = farmerIds;

    // Check if weight dialog is needed
    const machineIds = Array.from(connectedBLEMachines.keys());
    const manualWeightMachines = machineIds.filter(id => !(machineWeighingScaleMode.get(id) ?? true));

    if (manualWeightMachines.length > 0) {
      setShowWeightDialog(true);
    } else {
      // Pass farmer IDs directly to avoid async state issues
      executeTest(pendingTestMachines, farmerIds, new Map());
    }
  };

  // Handle weight dialog completion
  const handleWeightDialogComplete = (weights: Map<string, string>) => {
    setMachineWeights(weights);
    setShowWeightDialog(false);
    // Pass farmer IDs from ref and weights directly to avoid async state issues
    executeTest(pendingTestMachines, pendingFarmerIdsRef.current, weights);
  };

  const handleTest = async () => {
    await initiateTest();
  };

  const handleStopTest = () => {
    setIsTestRunning(false);
    setTestElapsedSeconds(0);
    if (testTimerRef.current) { clearInterval(testTimerRef.current); testTimerRef.current = null; }
  };

  const handleOk = async () => {
    // OK command: 40 04 01 04 00 41
    const sent = await sendToAllMachines('400401040041');
    if (sent) setSuccess(`OK sent to ${connectedBLEMachines.size} machine(s)!`);
  };

  const handleCancel = async () => {
    // Cancel command: 40 04 01 0A 00 4F
    const sent = await sendToAllMachines('4004010A004F');
    if (sent) setSuccess(`Cancel sent to ${connectedBLEMachines.size} machine(s)!`);
    handleStopTest();
  };

  const handleClean = async () => {
    // Clean command: 40 04 09 00 0A 47
    const sent = await sendToAllMachines('400409000A47');
    if (sent) setSuccess(`Clean sent to ${connectedBLEMachines.size} machine(s)!`);
  };

  // Computed reading history for current machine (matching Flutter's _currentReadingHistory getter)
  const readingHistory = useMemo((): MilkReading[] => {
    // First try to get history for selected machine
    if (selectedMachineId && machineReadingHistory.has(selectedMachineId)) {
      return machineReadingHistory.get(selectedMachineId)!;
    }
    // If selected machine doesn't have history, try to find any machine with history
    for (const [, readings] of machineReadingHistory) {
      if (readings.length > 0) return readings;
    }
    return [];
  }, [selectedMachineId, machineReadingHistory]);

  // History navigation
  const goToPreviousReading = () => {
    if (historyIndex < readingHistory.length - 1) {
      setHistoryIndex(h => h + 1);
      setIsViewingHistory(true);
    }
  };

  const goToNextReading = () => {
    if (historyIndex > 0) {
      setHistoryIndex(h => h - 1);
      if (historyIndex - 1 === 0) setIsViewingHistory(false);
    }
  };

  const goToLiveReading = () => {
    setHistoryIndex(0);
    setIsViewingHistory(false);
  };

  // Displayed reading
  const displayedReading = useMemo(() => {
    if (isViewingHistory && readingHistory.length > 0) {
      const idx = readingHistory.length - 1 - historyIndex;
      return readingHistory[Math.max(0, Math.min(idx, readingHistory.length - 1))] || emptyReading;
    }
    if (selectedMachineId && machineReadings.has(selectedMachineId)) {
      return machineReadings.get(selectedMachineId)!;
    }
    return emptyReading;
  }, [isViewingHistory, readingHistory, historyIndex, selectedMachineId, machineReadings]);

  // Format functions
  const formatFarmerId = (id: string) => id.replace(/^0+/, '') || '0';
  const formatTimestamp = (date?: Date) => {
    if (!date) return '--';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return isToday ? `Today ${timeStr}` : `${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
  };
  const getTodayDateString = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Debug: Log context state changes
  useEffect(() => {
    console.log('🎛️ [Control Panel] Context State:', {
      connectedPort: !!connectedPort,
      isDongleVerified,
      connectedBLEMachines: Array.from(connectedBLEMachines),
      selectedMachineId,
      connectedMachinesCount: connectedMachines.length,
    });
  }, [connectedPort, isDongleVerified, connectedBLEMachines, selectedMachineId, connectedMachines]);

  // Initial load
  useEffect(() => {
    fetchMachineDetails();
    return () => { if (testTimerRef.current) clearInterval(testTimerRef.current); };
  }, [fetchMachineDetails]);

  if (loading) return <FullScreenLoader />;

  if (!machine) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Machine Not Found</h2>
          <p className="text-gray-400 mt-2 mb-6">The machine could not be loaded</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Control Panel
                </h1>
                <p className="text-xs text-gray-400">{machine.machineName} • {getTodayDateString()}</p>
              </div>
              {/* Settings Button */}
              <button 
                onClick={() => setShowSettingsPanel(true)}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                title="Test Settings"
              >
                <Settings className="w-5 h-5 text-purple-400" />
              </button>
              
              {/* Channel Dropdown - matching Flutter's ChannelDropdownButton */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    selectedChannel === 'CH1'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                      : selectedChannel === 'CH2'
                      ? 'bg-blue-500/15 border-blue-500/50 text-blue-400'
                      : 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                  }`}
                >
                  <span className={`p-1 rounded-lg ${
                    selectedChannel === 'CH1' ? 'bg-emerald-500/20' : selectedChannel === 'CH2' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                  }`}>
                    {selectedChannel === 'CH1' ? '🐄' : selectedChannel === 'CH2' ? '🐃' : '🔀'}
                  </span>
                  <span className="text-sm font-medium">
                    {selectedChannel === 'CH1' ? 'Cow' : selectedChannel === 'CH2' ? 'Buffalo' : 'Mixed'}
                  </span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-gray-800 rounded-xl border border-white/20 shadow-2xl overflow-hidden min-w-[140px]">
                    {(['CH1', 'CH2', 'CH3'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedChannel(ch)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selectedChannel === ch
                            ? ch === 'CH1' ? 'bg-emerald-500/20 text-emerald-400' : ch === 'CH2' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                            : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <span>{ch === 'CH1' ? '🐄' : ch === 'CH2' ? '🐃' : '🔀'}</span>
                        <span className="text-sm font-medium">{ch === 'CH1' ? 'Cow' : ch === 'CH2' ? 'Buffalo' : 'Mixed'}</span>
                        {selectedChannel === ch && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Center - History Navigator */}
            {readingHistory.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={goToPreviousReading} disabled={historyIndex >= readingHistory.length - 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={goToLiveReading}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isViewingHistory
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                  {isViewingHistory ? (
                    <span className="flex items-center gap-2"><History className="w-4 h-4" />{historyIndex + 1}/{readingHistory.length}</span>
                  ) : (
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4" />LIVE</span>
                  )}
                </button>
                <button onClick={goToNextReading} disabled={historyIndex <= 0}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Right - Machine Switcher (Flutter-style) */}
            <div className="flex items-center gap-2">
              {/* Navigation arrows when multiple machines */}
              {connectedBLEMachines.size > 1 && (
                <button 
                  onClick={() => {
                    const machineIds = Array.from(connectedBLEMachines);
                    const currentIdx = machineIds.indexOf(selectedMachineId || '');
                    const prevIdx = currentIdx <= 0 ? machineIds.length - 1 : currentIdx - 1;
                    setSelectedMachineId(machineIds[prevIdx]);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Current machine dropdown (Flutter PopupMenuButton style) */}
              {connectedBLEMachines.size > 0 ? (
                <div className="relative group">
                  <button 
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      selectedMachineId && connectedBLEMachines.has(selectedMachineId)
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-red-500/15 border-red-500/40 text-red-400'
                    }`}
                  >
                    <Bluetooth className={`w-4 h-4 ${selectedMachineId && connectedBLEMachines.has(selectedMachineId) ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-sm font-bold">M-{selectedMachineId || '--'}</span>
                    {connectedBLEMachines.size > 1 && (
                      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Dropdown menu (shows on hover like Flutter PopupMenu) */}
                  {connectedBLEMachines.size > 1 && (
                    <div className="absolute right-0 top-full mt-2 min-w-[200px] py-2 rounded-xl bg-gray-800/95 backdrop-blur-xl border border-white/20 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {Array.from(connectedBLEMachines).map((mId, index) => {
                        const isSelected = selectedMachineId === mId;
                        const lastReading = machineReadings.get(mId);
                        const hasData = !!lastReading;
                        
                        return (
                          <button 
                            key={mId}
                            onClick={() => setSelectedMachineId(mId)}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/10 ${
                              isSelected ? 'bg-emerald-500/15' : ''
                            }`}
                          >
                            {/* Serial number badge */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                              isSelected 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                : 'bg-white/10 border-white/20 text-white/60'
                            }`}>
                              {index + 1}
                            </div>
                            
                            {/* Machine info */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                                  Machine M-{mId}
                                </span>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                )}
                              </div>
                              {hasData ? (
                                <span className="text-xs text-cyan-400">
                                  FAT: {lastReading.fat.toFixed(1)} | SNF: {lastReading.snf.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-xs text-white/40">Connected</span>
                              )}
                            </div>
                            
                            {/* Check mark for selected */}
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white/40">
                  <BluetoothOff className="w-4 h-4" />
                  <span className="text-sm">No machines</span>
                </div>
              )}

              {/* Navigation arrows when multiple machines */}
              {connectedBLEMachines.size > 1 && (
                <button 
                  onClick={() => {
                    const machineIds = Array.from(connectedBLEMachines);
                    const currentIdx = machineIds.indexOf(selectedMachineId || '');
                    const nextIdx = currentIdx >= machineIds.length - 1 ? 0 : currentIdx + 1;
                    setSelectedMachineId(machineIds[nextIdx]);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Dongle Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                connectedPort && isDongleVerified
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
              }`}>
                <Usb className="w-4 h-4" />
                <span className="text-sm font-medium">{connectedPort && isDongleVerified ? 'HUB Ready' : 'API Mode'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Messages */}
      <AnimatePresence>
        {(error || success) && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
            {error && <Toast type="error" message={error} onClose={() => setError('')} />}
            {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        {/* Channel & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value as 'CH1' | 'CH2' | 'CH3')}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors">
              <option value="CH1" className="bg-gray-800">🐄 Cow (CH1)</option>
              <option value="CH2" className="bg-gray-800">🐃 Buffalo (CH2)</option>
              <option value="CH3" className="bg-gray-800">🥛 Mixed (CH3)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/admin/machine/${machineDbId}?tab=analytics`)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors">
              <BarChart3 className="w-4 h-4" />Reports
            </button>
            <button onClick={() => { setMachineReadings(new Map()); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors">
              <RefreshCw className="w-4 h-4" />Clear
            </button>
          </div>
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <InfoCard icon={<FileText className="w-5 h-5" />} label="Tests Today" value={todayStats.totalTests.toString()} color="blue" />
          <InfoCard icon={<Settings className="w-5 h-5" />} label="Machine" value={selectedMachineId ? `M-${selectedMachineId}` : '--'} color="emerald" />
          <InfoCard icon={<User className="w-5 h-5" />} label="Farmer ID" value={formatFarmerId(displayedReading.farmerId)} color="cyan" />
          <InfoCard icon={<Award className="w-5 h-5" />} label="Bonus" value={`₹${displayedReading.incentive.toFixed(2)}`} color="purple" />
        </div>

        {/* Primary Readings Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Milk Quality</span>
            <span className={`text-xs font-medium ${isViewingHistory ? 'text-amber-400' : 'text-white/40'}`}>{formatTimestamp(displayedReading.timestamp)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassReadingCard title="FAT" value={displayedReading.fat} unit="%" color="amber" maxValue={15} icon={<Droplet className="w-6 h-6" />} decimals={2} />
            <GlassReadingCard title="SNF" value={displayedReading.snf} unit="%" color="blue" maxValue={15} icon={<Gauge className="w-6 h-6" />} decimals={2} />
            <GlassReadingCard title="CLR" value={displayedReading.clr} unit="" color="purple" maxValue={100} icon={<Beaker className="w-6 h-6" />} decimals={1} />
          </div>
        </div>

        {/* Transaction Section */}
        <div className="mb-4">
          <span className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Transaction</span>
          <div className="grid grid-cols-3 gap-4 items-center">
            <TransactionItem label="Quantity" value={displayedReading.quantity.toFixed(2)} unit="L" color="cyan" />
            <TransactionItem label="Rate" value={`₹${displayedReading.rate.toFixed(2)}`} unit="/L" color="amber" />
            <div className="relative bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-4 text-center">
              <span className="text-xs text-emerald-400/80 uppercase tracking-wider block mb-1">Total</span>
              <span className="text-3xl font-black text-emerald-400">₹{displayedReading.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Other Parameters Grid */}
        <div className="mb-4">
          <span className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Other Parameters</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ParameterCard icon={<Droplet className="w-4 h-4" />} label="Milk Type" value={displayedReading.milkType === 'cow' ? 'Cow' : displayedReading.milkType === 'buffalo' ? 'Buffalo' : 'Mixed'} color="green" />
            <ParameterCard icon={<FlaskConical className="w-4 h-4" />} label="Protein" value={`${displayedReading.protein.toFixed(2)}%`} color="red" />
            <ParameterCard icon={<Beaker className="w-4 h-4" />} label="Lactose" value={`${displayedReading.lactose.toFixed(2)}%`} color="pink" />
            <ParameterCard icon={<Gauge className="w-4 h-4" />} label="Salt" value={`${displayedReading.salt.toFixed(2)}%`} color="slate" />
            <ParameterCard icon={<Droplets className="w-4 h-4" />} label="Water" value={`${displayedReading.water.toFixed(2)}%`} color="teal" />
            <ParameterCard icon={<Thermometer className="w-4 h-4" />} label="Temp" value={`${displayedReading.temperature.toFixed(1)}°C`} color="orange" />
          </div>
        </div>

        {/* Live Trend Graph */}
        <div className="mb-4">
          <span className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Live Trend ({getTodayDateString()})</span>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 h-48 flex items-center justify-center">
            {readingHistory.length > 0 ? (
              <div className="w-full h-full">
                <TrendChart readings={readingHistory} />
              </div>
            ) : (
              <div className="text-center text-white/40">
                <Waves className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No readings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Stats */}
        {todayStats.totalTests > 0 && (
          <div className="mb-4">
            <span className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Today's Stats</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Qty" value={`${todayStats.totalQuantity.toFixed(1)} L`} icon={<Scale className="w-4 h-4" />} />
              <StatCard label="Revenue" value={`₹${todayStats.totalAmount.toFixed(0)}`} icon={<Award className="w-4 h-4" />} />
              <StatCard label="Avg FAT" value={`${todayStats.avgFat.toFixed(2)}%`} icon={<TrendingUp className="w-4 h-4" />} />
              <StatCard label="Avg SNF" value={`${todayStats.avgSnf.toFixed(2)}%`} icon={<TrendingDown className="w-4 h-4" />} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Command Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-900/90 border-t border-white/10 px-4 py-4 safe-area-pb">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-3">
          <CommandButton icon={isTestRunning ? <Timer className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            label={isTestRunning ? `${testElapsedSeconds}s` : 'Test'} color="emerald"
            onClick={isTestRunning ? undefined : handleTest} isActive={isTestRunning} />
          <CommandButton icon={<Check className="w-6 h-6" />} label="OK" color="blue" onClick={handleOk} />
          <CommandButton icon={<X className="w-6 h-6" />} label="Cancel" color="amber" onClick={handleCancel} />
          <CommandButton icon={<Droplets className="w-6 h-6" />} label="Clean" color="purple" onClick={handleClean} />
        </div>
      </div>

      {/* Farmer ID Dialog */}
      <AnimatePresence>
        {showFarmerIdDialog && (
          <FarmerIdDialogComponent 
            machineIds={Array.from(connectedBLEMachines.keys()).filter(id => !(machineFarmerIdMode.get(id) ?? false))}
            machineWeighingScaleMode={machineWeighingScaleMode}
            formatMachineId={formatMachineId}
            onComplete={handleFarmerIdDialogComplete}
            onCancel={() => setShowFarmerIdDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Weight Dialog */}
      <AnimatePresence>
        {showWeightDialog && (
          <WeightDialogComponent
            machineIds={Array.from(connectedBLEMachines.keys()).filter(id => !(machineWeighingScaleMode.get(id) ?? true))}
            formatMachineId={formatMachineId}
            onComplete={handleWeightDialogComplete}
            onCancel={() => setShowWeightDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <SettingsPanelComponent
            connectedBLEMachines={connectedBLEMachines}
            machineWeighingScaleMode={machineWeighingScaleMode}
            setMachineWeighingScaleMode={setMachineWeighingScaleMode}
            machineFarmerIdMode={machineFarmerIdMode}
            setMachineFarmerIdMode={setMachineFarmerIdMode}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            formatMachineId={formatMachineId}
            onClose={() => setShowSettingsPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function InfoCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: { [key: string]: string } = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} backdrop-blur-xl rounded-xl border p-3 flex items-center gap-3`}>
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>{icon}</div>
      <div>
        <span className="block text-[10px] uppercase tracking-wider text-white/50">{label}</span>
        <span className="text-base font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function GlassReadingCard({ title, value, unit, color, maxValue, icon, decimals = 2 }: { title: string; value: number; unit: string; color: string; maxValue: number; icon: React.ReactNode; decimals?: number }) {
  const progress = Math.min(value / maxValue, 1);
  const colorMap: { [key: string]: { bg: string; border: string; text: string; glow: string } } = {
    amber: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'bg-amber-500' },
    blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'bg-blue-500' },
    purple: { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'bg-purple-500' },
  };
  const c = colorMap[color];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${c.bg} backdrop-blur-xl rounded-2xl border ${c.border} p-5 overflow-hidden`}>
      {/* Glow accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${c.glow} opacity-60`} style={{ width: `${progress * 100}%` }} />
      
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl bg-white/10 ${c.text}`}>{icon}</div>
        <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{title}</span>
      </div>
      
      {/* Circular Progress */}
      <div className="relative w-24 h-24 mx-auto mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
          <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6"
            className={c.text} strokeLinecap="round"
            strokeDasharray={`${progress * 264} 264`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{value.toFixed(decimals)}</span>
          <span className="text-xs text-white/60">{unit}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
          className={`h-full ${c.glow} rounded-full`} transition={{ duration: 0.5 }} />
      </div>
    </motion.div>
  );
}

function TransactionItem({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  const colorClasses: { [key: string]: string } = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl border p-4 text-center`}>
      <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">{label}</span>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/40 ml-1">{unit}</span>
    </div>
  );
}

function ParameterCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: { [key: string]: string } = {
    green: 'border-green-500/30 text-green-400',
    red: 'border-red-500/30 text-red-400',
    pink: 'border-pink-500/30 text-pink-400',
    slate: 'border-slate-500/30 text-slate-400',
    teal: 'border-teal-500/30 text-teal-400',
    orange: 'border-orange-500/30 text-orange-400',
  };
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-xl border ${colorMap[color]} p-3 flex items-center gap-2`}>
      <div className={`p-1.5 rounded-lg bg-white/10 ${colorMap[color]}`}>{icon}</div>
      <div>
        <span className="block text-[9px] uppercase tracking-wider text-white/40">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3">
      <div className="flex items-center gap-2 text-white/40 mb-1">{icon}<span className="text-[10px] uppercase">{label}</span></div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function CommandButton({ icon, label, color, onClick, isActive }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void; isActive?: boolean }) {
  const colorMap: { [key: string]: { bg: string; hover: string; text: string; activeBg: string } } = {
    emerald: { bg: 'bg-emerald-500/20', hover: 'hover:bg-emerald-500/30', text: 'text-emerald-400', activeBg: 'bg-emerald-500/40' },
    blue: { bg: 'bg-blue-500/20', hover: 'hover:bg-blue-500/30', text: 'text-blue-400', activeBg: 'bg-blue-500/40' },
    amber: { bg: 'bg-amber-500/20', hover: 'hover:bg-amber-500/30', text: 'text-amber-400', activeBg: 'bg-amber-500/40' },
    purple: { bg: 'bg-purple-500/20', hover: 'hover:bg-purple-500/30', text: 'text-purple-400', activeBg: 'bg-purple-500/40' },
  };
  const c = colorMap[color];
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} disabled={isActive}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border border-white/10 transition-colors ${isActive ? c.activeBg : c.bg} ${!isActive && c.hover} ${c.text} ${isActive ? 'animate-pulse' : ''}`}>
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </motion.button>
  );
}

function TrendChart({ readings }: { readings: MilkReading[] }) {
  const last20 = readings.slice(-20);
  if (last20.length < 2) return <div className="flex items-center justify-center h-full text-white/40 text-sm">Need at least 2 readings</div>;

  const maxFat = Math.max(...last20.map(r => r.fat), 10);
  const maxSnf = Math.max(...last20.map(r => r.snf), 15);
  const maxVal = Math.max(maxFat, maxSnf);

  return (
    <div className="w-full h-full flex items-end gap-1">
      {last20.map((r, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="w-full flex flex-col gap-0.5 items-center" style={{ height: '100%' }}>
            <div className="flex-1 w-full flex items-end justify-center gap-0.5">
              <div className="w-1/3 bg-amber-500/80 rounded-t-sm transition-all" style={{ height: `${(r.fat / maxVal) * 100}%`, minHeight: 4 }} title={`FAT: ${r.fat.toFixed(2)}%`} />
              <div className="w-1/3 bg-blue-500/80 rounded-t-sm transition-all" style={{ height: `${(r.snf / maxVal) * 100}%`, minHeight: 4 }} title={`SNF: ${r.snf.toFixed(2)}%`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Farmer ID Dialog Component
function FarmerIdDialogComponent({ 
  machineIds, 
  machineWeighingScaleMode, 
  formatMachineId, 
  onComplete, 
  onCancel 
}: { 
  machineIds: string[]; 
  machineWeighingScaleMode: Map<string, boolean>; 
  formatMachineId: (id: string) => string; 
  onComplete: (farmerIds: Map<string, string>) => void; 
  onCancel: () => void; 
}) {
  const [tempFarmerIds, setTempFarmerIds] = useState<Map<string, string>>(new Map());
  
  const allFilled = machineIds.every(id => (tempFarmerIds.get(id) || '').trim() !== '');
  const hasManualWeight = machineIds.some(id => !(machineWeighingScaleMode.get(id) ?? true));
  
  const handleSubmit = () => {
    if (allFilled) {
      onComplete(tempFarmerIds);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-emerald-500/10">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Enter Farmer IDs</h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          {machineIds.map((machineId, index) => (
            <div key={machineId} className="space-y-2">
              <label className="text-sm font-semibold text-white/70">
                Machine M-{formatMachineId(machineId)}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="number"
                  placeholder="Enter Farmer ID"
                  autoFocus={index === 0}
                  value={tempFarmerIds.get(machineId) || ''}
                  onChange={(e) => {
                    const newMap = new Map(tempFarmerIds);
                    newMap.set(machineId, e.target.value);
                    setTempFarmerIds(newMap);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allFilled) {
                      handleSubmit();
                    }
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-white/10 bg-gray-900/50">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              allFilled
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-600 text-white/40 cursor-not-allowed'
            }`}
          >
            {hasManualWeight ? 'Next' : 'Start Test'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Weight Dialog Component
function WeightDialogComponent({ 
  machineIds, 
  formatMachineId, 
  onComplete, 
  onCancel 
}: { 
  machineIds: string[]; 
  formatMachineId: (id: string) => string; 
  onComplete: (weights: Map<string, string>) => void; 
  onCancel: () => void; 
}) {
  const [tempWeights, setTempWeights] = useState<Map<string, string>>(new Map());
  
  const allFilled = machineIds.every(id => (tempWeights.get(id) || '').trim() !== '');
  
  const handleSubmit = () => {
    if (allFilled) {
      onComplete(tempWeights);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-cyan-500/10">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Scale className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Enter Weights</h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          {machineIds.map((machineId, index) => (
            <div key={machineId} className="space-y-2">
              <label className="text-sm font-semibold text-white/70">
                Machine M-{formatMachineId(machineId)}
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter Weight"
                  autoFocus={index === 0}
                  value={tempWeights.get(machineId) || ''}
                  onChange={(e) => {
                    const newMap = new Map(tempWeights);
                    newMap.set(machineId, e.target.value);
                    setTempWeights(newMap);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allFilled) {
                      handleSubmit();
                    }
                  }}
                  className="w-full pl-11 pr-12 py-3 bg-gray-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">kg</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-white/10 bg-gray-900/50">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              allFilled
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-gray-600 text-white/40 cursor-not-allowed'
            }`}
          >
            Start Test
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Settings Panel Component
function SettingsPanelComponent({ 
  connectedBLEMachines, 
  machineWeighingScaleMode,
  setMachineWeighingScaleMode,
  machineFarmerIdMode,
  setMachineFarmerIdMode,
  selectedChannel,
  setSelectedChannel,
  formatMachineId,
  onClose 
}: { 
  connectedBLEMachines: Set<string>;
  machineWeighingScaleMode: Map<string, boolean>;
  setMachineWeighingScaleMode: (map: Map<string, boolean>) => void;
  machineFarmerIdMode: Map<string, boolean>;
  setMachineFarmerIdMode: (map: Map<string, boolean>) => void;
  selectedChannel: 'CH1' | 'CH2' | 'CH3';
  setSelectedChannel: (channel: 'CH1' | 'CH2' | 'CH3') => void;
  formatMachineId: (id: string) => string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-800 rounded-2xl border border-white/20 shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Test Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          {/* Per-Machine Settings */}
          {Array.from(connectedBLEMachines).map((machineId) => (
            <div key={machineId} className="bg-gray-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Machine M-{formatMachineId(machineId)}</span>
              </div>

              {/* Weighing Scale Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Scale className="w-4 h-4" />
                  <span>Weighing Scale:</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newMap = new Map(machineWeighingScaleMode);
                      newMap.set(machineId, true);
                      setMachineWeighingScaleMode(newMap);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      machineWeighingScaleMode.get(machineId) ?? true
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-700/50 text-white/50 hover:bg-gray-700'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => {
                      const newMap = new Map(machineWeighingScaleMode);
                      newMap.set(machineId, false);
                      setMachineWeighingScaleMode(newMap);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      !(machineWeighingScaleMode.get(machineId) ?? true)
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-gray-700/50 text-white/50 hover:bg-gray-700'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Farmer ID Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <User className="w-4 h-4" />
                  <span>Farmer ID:</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newMap = new Map(machineFarmerIdMode);
                      newMap.set(machineId, true);
                      setMachineFarmerIdMode(newMap);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      machineFarmerIdMode.get(machineId) ?? false
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-700/50 text-white/50 hover:bg-gray-700'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => {
                      const newMap = new Map(machineFarmerIdMode);
                      newMap.set(machineId, false);
                      setMachineFarmerIdMode(newMap);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      !(machineFarmerIdMode.get(machineId) ?? false)
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-gray-700/50 text-white/50 hover:bg-gray-700'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
