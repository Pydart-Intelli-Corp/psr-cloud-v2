'use client';

import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDongle } from '@/contexts/DongleContext';
import { motion } from 'framer-motion';
import { formatPhoneInput, validatePhoneOnBlur, validateIndianPhone } from '@/lib/validation/phoneValidation';
import {
  Settings, 
  MapPin,
  Phone,
  User,
  Calendar,
  Building2,
  RefreshCw,
  Wrench,
  AlertTriangle,
  Lock,
  Key,
  KeyRound,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Clock,
  Plus,
  Upload,
  Eye,
  CheckCircle,
  Droplets,
  TrendingUp,
  Award,
  BarChart3,
  Users,
  X,
  Cable,
  Sliders
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  FlowerSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid, 
  FormError,
  PageHeader,
  StatusMessage,
  StatsCard,
  ItemCard,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';
import {
  BulkActionsToolbar,
  BulkDeleteConfirmModal,
  LoadingSnackbar,
  FloatingActionButton,
  ViewModeToggle,
  ManagementPageHeader,
  FilterDropdown,
  StatsGrid
} from '@/components/management';
import ControlPanelDialog from '@/components/dialogs/ControlPanelDialog';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
  bmcId?: number;
  societyName?: string;
  societyIdentifier?: string;
  bmcName?: string;
  bmcIdentifier?: string;
  location?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  maintenanceSchedule?: string;
  operatorName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
  isMasterMachine?: boolean;
  userPassword?: string;
  supervisorPassword?: string;
  statusU: 0 | 1;
  statusS: 0 | 1;
  createdAt: string;
  activeChartsCount?: number;
  chartDetails?: string; // Format: "channel:filename:status|||channel:filename:status"
  activeCorrectionsCount?: number;
  correctionDetails?: string; // Format: "pending:X corrections"
  totalCollections30d?: number;
  totalQuantity30d?: number;
  imageUrl?: string;
}

interface MachineFormData {
  machineId: string;
  machineType: string;
  societyId: string;
  bmcId: string;
  assignmentType: 'society' | 'bmc';
  location: string;
  installationDate: string;
  operatorName: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes: string;
  setAsMaster: boolean;
  disablePasswordInheritance: boolean;
}

interface PasswordFormData {
  userPassword: string;
  supervisorPassword: string;
  confirmUserPassword: string;
  confirmSupervisorPassword: string;
}

interface Society {
  id: number;
  name: string;
  society_id: string;
  bmc_id?: number;
}

interface MachineType {
  id: number;
  machineType: string;
}

const initialFormData: MachineFormData = {
  machineId: '',
  machineType: '',
  societyId: '',
  bmcId: '',
  assignmentType: 'society',
  location: '',
  installationDate: '',
  operatorName: '',
  contactPhone: '',
  status: 'active',
  notes: '',
  setAsMaster: false,
  disablePasswordInheritance: false
};

function MachineManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { } = useLanguage();
  const { injectConnection, forwardBleData } = useDongle();
  
  // State management
  const [machines, setMachines] = useState<Machine[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [machineTypesLoading, setMachineTypesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRateChartModal, setShowRateChartModal] = useState(false);
  const [selectedRateChart, setSelectedRateChart] = useState<{ fileName: string; channel: string; societyId: number } | null>(null);
  const [rateChartData, setRateChartData] = useState<Array<{ fat: string; snf: string; clr: string; rate: string }>>([]);
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [searchFat, setSearchFat] = useState('');
  const [searchSnf, setSearchSnf] = useState('');
  const [searchClr, setSearchClr] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState<MachineFormData>(initialFormData);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    userPassword: '',
    supervisorPassword: '',
    confirmUserPassword: '',
    confirmSupervisorPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    userPassword: '',
    confirmUserPassword: '',
    supervisorPassword: '',
    confirmSupervisorPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'suspended'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string[]>([]);
  const [machineFilter, setMachineFilter] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Performance stats state
  const [performanceStats, setPerformanceStats] = useState<{
    topCollector: { machine: any; totalQuantity: number } | null;
    mostTests: { machine: any; totalTests: number } | null;
    bestCleaning: { machine: any; totalCleanings: number } | null;
    mostCleaningSkip: { machine: any; totalSkips: number } | null;
    activeToday: { machine: any; collectionsToday: number } | null;
    highestUptime: { machine: any; activeDays: number } | null;
  }>({
    topCollector: null,
    mostTests: null,
    bestCleaning: null,
    mostCleaningSkip: null,
    activeToday: null,
    highestUptime: null
  });
  
  // Graph modal state
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'tests' | 'cleaning' | 'skip' | 'today' | 'uptime'>('quantity');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
    contactPhone?: string;
  }>({});

  // Folder view state
  const [expandedSocieties, setExpandedSocieties] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('list');
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  
  // Selection state
  const [selectedMachines, setSelectedMachines] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'maintenance' | 'suspended'>('active');

  // Master machine state
  const [societyHasMaster, setSocietyHasMaster] = useState(false);
  const [existingMasterMachine, setExistingMasterMachine] = useState<string | null>(null);
  const [isFirstMachine, setIsFirstMachine] = useState(false);
  
  // Change master modal state
  const [showChangeMasterModal, setShowChangeMasterModal] = useState(false);
  const [selectedSocietyForMaster, setSelectedSocietyForMaster] = useState<number | null>(null);
  const [newMasterMachineId, setNewMasterMachineId] = useState<number | null>(null);
  const [setForAll, setSetForAll] = useState(false);
  const [isChangingMaster, setIsChangingMaster] = useState(false);
  
  // Password update for multiple machines
  const [applyPasswordsToOthers, setApplyPasswordsToOthers] = useState(false);
  const [selectedMachinesForPassword, setSelectedMachinesForPassword] = useState<Set<number>>(new Set());
  const [selectAllMachinesForPassword, setSelectAllMachinesForPassword] = useState(false);
  
  // Show password modal state
  const [showPasswordViewModal, setShowPasswordViewModal] = useState(false);
  const [adminPasswordForView, setAdminPasswordForView] = useState('');
  const [viewPasswordError, setViewPasswordError] = useState('');
  const [viewingPasswords, setViewingPasswords] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ userPassword: string | null; supervisorPassword: string | null } | null>(null);
  const [machineToShowPassword, setMachineToShowPassword] = useState<Machine | null>(null);
  
  // Serial port state
  const [serialPortDropdownOpen, setSerialPortDropdownOpen] = useState(false);
  const [serialPorts, setSerialPorts] = useState<SerialPort[]>([]);
  const [connectedPort, setConnectedPort] = useState<SerialPort | null>(null);
  const [loadingPorts, setLoadingPorts] = useState(false);
  
  // Debug mode for verbose logging (disable in production to prevent buffer overruns)
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  const [serialPortError, setSerialPortError] = useState('');
  const serialPortDropdownRef = useRef<HTMLDivElement>(null);
  
  // BLE Dongle state - tracks available and connected machines via wifi dongle
  const [availableBLEMachines, setAvailableBLEMachines] = useState<Set<string>>(new Set()); // Machine IDs detected via BLE scan
  const [connectedBLEMachines, setConnectedBLEMachines] = useState<Set<string>>(new Set()); // Machine IDs connected
  const [machineIdToDongleId, setMachineIdToDongleId] = useState<Map<string, string>>(new Map()); // Map machine ID to dongle device ID
  const [bleScanning, setBleScanning] = useState(false);
  const [bleConnectingMachine, setBleConnectingMachine] = useState<string | null>(null); // Machine ID currently connecting
  const serialReaderRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const serialWriterRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null); // Dedicated writer for serial commands
  const bleDataBufferRef = useRef<string>(''); // Buffer for incomplete serial data
  const [hasCompletedInitialScan, setHasCompletedInitialScan] = useState(false);
  const [bleDataReceived, setBleDataReceived] = useState<Map<string, string>>(new Map()); // Store received data per machine
  
  // All discovered BLE devices (not just Poornasree machines)
  interface BLEDevice {
    name: string;
    address: string;
    rssi: number;
  }
  const [allBLEDevices, setAllBLEDevices] = useState<BLEDevice[]>([]);
  const [bleDevicesDropdownOpen, setBleDevicesDropdownOpen] = useState(false);
  const bleDevicesDropdownRef = useRef<HTMLDivElement>(null);
  const [controlPanelDropdownOpen, setControlPanelDropdownOpen] = useState(false);
  const controlPanelDropdownRef = useRef<HTMLDivElement>(null);
  const [controlPanelDialogOpen, setControlPanelDialogOpen] = useState(false);
  const [controlPanelMachineId, setControlPanelMachineId] = useState<string | null>(null);
  const [isDongleVerified, setIsDongleVerified] = useState(false); // Verified as Poornasree dongle
  const isDongleVerifiedRef = useRef(false); // Ref for immediate access in async functions
  const [connectingAll, setConnectingAll] = useState(false); // Track if Connect All is in progress
  const [connectAllProgress, setConnectAllProgress] = useState({ current: 0, total: 0 }); // Track connection progress
  const connectingAddressRef = useRef<string | null>(null); // Track the address currently being connected (for CONNECT_ALL)
  const connectAllAddressMapRef = useRef<Map<string, string>>(new Map()); // Map addresses to machine IDs during CONNECT_ALL
  const individualConnectionMapRef = useRef<Map<string, string>>(new Map()); // Map addresses to machine IDs for individual connections
  
  // Auto-connect feature (future enhancement - currently disabled)
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(false);
  const autoConnectEnabledRef = useRef(false);
  const manuallyDisconnectedMachines = useRef<Set<string>>(new Set());
  
  // Auto-reconnect state
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const autoConnectAttemptedRef = useRef(false);

  // Safe logging helper to prevent buffer overruns
  const safeLog = (message: string, data?: any) => {
    if (!DEBUG_MODE) return; // Skip all debug logs in production
    
    try {
      if (data !== undefined) {
        // Stringify and truncate if data is too large
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        const truncated = dataStr.length > 500 ? dataStr.substring(0, 500) + '... (truncated)' : dataStr;
        console.log(message, truncated);
      } else {
        console.log(message);
      }
    } catch (e) {
      // Silently fail if console buffer is full
    }
  };

  // Helper function to check if device is a Poornasree machine (Lactosure or Poornasree)
  const isPoornasreeMachine = (deviceName: string): boolean => {
    const lowerName = deviceName.toLowerCase();
    return lowerName.includes('lactosure') || lowerName.includes('poornasree');
  };

  // Extract machine ID from device name (supports both Lactosure and Poornasree formats)
  const extractMachineId = (deviceName: string): string | null => {
    if (!deviceName || typeof deviceName !== 'string') {
      console.warn('⚠️ [extractMachineId] Invalid input:', deviceName);
      return null;
    }
    
    const match = deviceName.match(/(?:Lactosure|Poornasree).*?(\d+)/i);
    
    if (!match) {
      console.warn('⚠️ [extractMachineId] No match found for device:', deviceName);
      console.warn('   Expected format: "Lactosure/Poornasree" followed by numbers');
      console.warn('   Examples: "Lactosure - Sl.No - 48", "Poornasree-123"');
    }
    
    return match ? match[1] : null;
  };

  // Password validation functions
  const validatePasswordFormat = (password: string) => {
    if (!password) return '';
    if (!/^\d{6}$/.test(password)) {
      return 'Password must be exactly 6 numbers';
    }
    return '';
  };

  // Serial port handler
  const handleSerialPortClick = async () => {
    setSerialPortError('');
    
    // Check if Web Serial API is supported
    if (!('serial' in navigator)) {
      setSerialPortError('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      setSerialPortDropdownOpen(true);
      return;
    }
    
    // Toggle dropdown
    if (!serialPortDropdownOpen) {
      try {
        setLoadingPorts(true);
        setSerialPortDropdownOpen(true);
        
        // Get list of paired ports
        const ports = await navigator.serial.getPorts();
        setSerialPorts(ports);
        
        // Set connected port if only one exists
        if (ports.length === 1) {
          setConnectedPort(ports[0]);
        }
        
        if (ports.length === 0) {
          setSerialPortError('No serial ports found. Click "Connect Port" to connect a device.');
        }
      } catch (err) {
        console.error('Error listing serial ports:', err);
        setSerialPortError('Failed to list serial ports: ' + (err as Error).message);
      } finally {
        setLoadingPorts(false);
      }
    } else {
      setSerialPortDropdownOpen(false);
    }
  };
  
  // Request new serial port
  const handleRequestPort = async () => {
    // Check if a port is already connected
    if (connectedPort) {
      setSerialPortError('Please disconnect the current port before connecting a new one.');
      return;
    }
    
    try {
      setLoadingPorts(true);
      setSerialPortError('');
      
      // Request port from user
      const port = await navigator.serial.requestPort();
      
      // Open the port
      await port.open({ baudRate: 115200 });
      
      // Set as connected port first
      setConnectedPort(port);
      
      // Wait for streams to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create writer for sending commands (must be done before starting reader)
      if (!port.writable) {
        throw new Error('Writable stream not available');
      }
      const writer = port.writable.getWriter();
      serialWriterRef.current = writer;
      console.log('✅ Serial writer created successfully');
      
      // Start reader for BLE responses
      console.log('🔄 Starting reader...');
      startDongleReader(port); // Pass port directly since state hasn't updated yet
      console.log('🔄 Reader start call completed');
      
      // Wait for reader to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Send VERSION command to verify dongle
      console.log('🔍 Sending VERSION command to verify dongle...');
      const versionData = new TextEncoder().encode('VERSION\n');
      await writer.write(versionData);
      
      // Wait for VERSION response and verification (max 3 seconds)
      console.log('⏳ Waiting for Poornasree HUB verification...');
      const verificationTimeout = 3000;
      const startTime = Date.now();
      
      while (!isDongleVerifiedRef.current && (Date.now() - startTime) < verificationTimeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check if verification succeeded
      if (!isDongleVerifiedRef.current) {
        // Not a Poornasree HUB - disconnect and clean up
        console.log('❌ Device is not a Poornasree HUB');
        
        // Clean up reader
        if (serialReaderRef.current) {
          try {
            await serialReaderRef.current.cancel();
            serialReaderRef.current = null;
          } catch {}
        }
        
        // Clean up writer
        if (serialWriterRef.current) {
          try {
            await serialWriterRef.current.releaseLock();
            serialWriterRef.current = null;
          } catch {}
        }
        
        // Close port
        try {
          await port.close();
        } catch {}
        
        setConnectedPort(null);
        setIsDongleVerified(false);
        isDongleVerifiedRef.current = false;
        setSerialPortError('This device is not a Poornasree HUB. Please connect the correct USB dongle.\n\nExpected: Poornasree HUB v3.0.0 (ESP32-S3)');
        setLoadingPorts(false);
        return;
      }
      
      // Verified as Poornasree HUB
      console.log('✅ Verified as Poornasree HUB');
      
      // Save port configuration to localStorage for auto-connect
      try {
        const portInfo = port.getInfo();
        const portConfig = {
          vendorId: portInfo.usbVendorId,
          productId: portInfo.usbProductId,
          verified: true,
          timestamp: Date.now()
        };
        localStorage.setItem('poornasree_hub_port', JSON.stringify(portConfig));
        console.log('💾 [Port Config] Saved to localStorage:', portConfig);
      } catch (err) {
        console.warn('⚠️ [Port Config] Could not save configuration:', err);
      }
      
      // Refresh the ports list
      const ports = await navigator.serial.getPorts();
      setSerialPorts(ports);
      
      // Clear any previous errors immediately
      setSerialPortError('');
      setLoadingPorts(false);
      
      setSuccess('Poornasree HUB connected successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Automatically start BLE scan after successful connection
      console.log('🔍 [Auto-Scan] Starting automatic scan after connection...');
      setTimeout(() => {
        handleBLEScan();
      }, 500); // Small delay to ensure UI is ready
    } catch (err) {
      const error = err as Error;
      
      // User cancelled the port selection dialog
      if (error.name === 'NotFoundError') {
        setLoadingPorts(false);
        return;
      }
      
      // Handle specific serial port errors
      console.error('Error requesting serial port:', error);
      
      let errorMessage = '';
      
      // Port already open (by this app or another)
      if (error.name === 'InvalidStateError' || error.message.includes('Failed to open')) {
        errorMessage = 'Port is already in use. Close other applications using this port (Arduino IDE, PuTTY, etc.) and try again.';
      }
      // Permission denied
      else if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
        errorMessage = 'Permission denied. Try disconnecting and reconnecting the USB device.';
      }
      // Network error (common with serial port issues)
      else if (error.name === 'NetworkError') {
        errorMessage = 'Failed to open serial port. The device may be disconnected, in use by another program, or locked by the system. Try:\n• Disconnect and reconnect the USB device\n• Close Arduino IDE, PuTTY, or other serial monitors\n• Check Device Manager for port issues';
      }
      // Device disconnected during operation
      else if (error.name === 'NotFoundError' && connectedPort) {
        errorMessage = 'Device disconnected. Please reconnect the USB device and try again.';
      }
      // Generic error
      else {
        errorMessage = `Failed to connect: ${error.message}`;
      }
      
      setSerialPortError(errorMessage);
      
      // Clean up if port was set but connection failed
      if (connectedPort) {
        setConnectedPort(null);
        setIsDongleVerified(false);
        isDongleVerifiedRef.current = false;
      }
      if (serialWriterRef.current) {
        try {
          await serialWriterRef.current.releaseLock();
        } catch {}
        serialWriterRef.current = null;
      }
    } finally {
      setLoadingPorts(false);
    }
  };
  
  // Disconnect serial port
  const handleDisconnectPort = async (port: SerialPort) => {
    try {
      setLoadingPorts(true);
      setSerialPortError('');
      
      // Cancel reader first
      if (serialReaderRef.current) {
        try {
          await serialReaderRef.current.cancel();
          serialReaderRef.current = null;
        } catch (err) {
          console.log('Reader already cancelled');
        }
      }
      
      // Release writer
      if (serialWriterRef.current) {
        try {
          await serialWriterRef.current.releaseLock();
          serialWriterRef.current = null;
        } catch (err) {
          console.log('Writer already released');
        }
      }
      
      // Close the port if it's open
      if (port) {
        try {
          await port.close();
        } catch (err) {
          console.log('Port already closed');
        }
        
        try {
          // Forget the port
          await (port as any).forget();
        } catch (err) {
          console.log('Port forget not available or already removed');
        }
      }
      
      // Clear BLE state
      setAvailableBLEMachines(new Set());
      setConnectedBLEMachines(new Set());
      setBleScanning(false);
      setBleConnectingMachine(null);
      bleDataBufferRef.current = '';
      setHasCompletedInitialScan(false);
      setBleDataReceived(new Map());
      
      // Note: autoScanTimerRef was removed with auto-connect feature
      
      // Clear connected port
      setConnectedPort(null);
      setIsDongleVerified(false);
      isDongleVerifiedRef.current = false;
      
      // Clear saved port config on manual disconnect
      try {
        localStorage.removeItem('poornasree_hub_port');
        console.log('💾 [Port Config] Cleared saved configuration');
      } catch {}
      
      // Refresh the ports list
      const ports = await navigator.serial.getPorts();
      setSerialPorts(ports);
      
      setSuccess('Serial port disconnected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error disconnecting serial port:', err);
      setSerialPortError('Failed to disconnect port: ' + (err as Error).message);
    } finally {
      setLoadingPorts(false);
    }
  };
  
  // Get port info with friendly name
  const getPortInfo = (port: SerialPort) => {
    const info = port.getInfo();
    if (info.usbVendorId && info.usbProductId) {
      // Always show 'Poornasree HUB' since we only allow verified devices to connect
      return 'Poornasree HUB';
    }
    return 'Serial Port';
  };
  
  // Retry auto-connect (called manually if auto-connect fails)
  const retryAutoConnect = async () => {
    console.log('🔄 [Auto-connect] Manual retry triggered by user');
    autoConnectAttemptedRef.current = false; // Reset the flag
    setIsAutoConnecting(true);
    setSerialPortError(''); // Clear any errors
    
    try {
      const ports = await navigator.serial.getPorts();
      setSerialPorts(ports);
      
      if (ports.length === 0) {
        setSerialPortError('No ports available. Please connect a device first.');
        setIsAutoConnecting(false);
        return;
      }
      
      // Try saved config first
      const savedConfigStr = localStorage.getItem('poornasree_hub_port');
      let savedConfig = null;
      
      if (savedConfigStr) {
        try {
          savedConfig = JSON.parse(savedConfigStr);
        } catch {}
      }
      
      let connected = false;
      
      // Try saved port
      if (savedConfig) {
        for (const port of ports) {
          const info = port.getInfo();
          if (info.usbVendorId === savedConfig.vendorId && info.usbProductId === savedConfig.productId) {
            try {
              await port.open({ baudRate: 115200 });
              setConnectedPort(port);
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
              if (!port.writable) throw new Error('Writable stream not available');
              const writer = port.writable.getWriter();
              serialWriterRef.current = writer;
              
              startDongleReader(port);
              
              await new Promise(resolve => setTimeout(resolve, 200));
              const versionData = new TextEncoder().encode('VERSION\\n');
              await writer.write(versionData);
              
              // Wait for verification
              const verificationTimeout = 3000;
              const startTime = Date.now();
              while (!isDongleVerifiedRef.current && (Date.now() - startTime) < verificationTimeout) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              if (isDongleVerifiedRef.current) {
                setSuccess('Poornasree HUB connected successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setTimeout(() => handleBLEScan(), 500);
                connected = true;
                break;
              }
            } catch (err) {
              console.warn('⚠️ [Retry] Error with saved port:', err);
            }
          }
        }
      }
      
      // Try detecting if saved port failed
      if (!connected) {
        for (const port of ports) {
          const isPoornasreeHub = await testPortIsPoornasreeHub(port);
          
          if (isPoornasreeHub) {
            try {
              await port.open({ baudRate: 115200 });
              setConnectedPort(port);
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
              if (!port.writable) throw new Error('Writable stream not available');
              const writer = port.writable.getWriter();
              serialWriterRef.current = writer;
              
              startDongleReader(port);
              
              await new Promise(resolve => setTimeout(resolve, 200));
              const versionData = new TextEncoder().encode('VERSION\\n');
              await writer.write(versionData);
              
              // Wait for verification
              const verificationTimeout = 3000;
              const startTime = Date.now();
              while (!isDongleVerifiedRef.current && (Date.now() - startTime) < verificationTimeout) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              if (isDongleVerifiedRef.current) {
                // Save config
                const info = port.getInfo();
                const portConfig = {
                  vendorId: info.usbVendorId,
                  productId: info.usbProductId,
                  verified: true,
                  timestamp: Date.now()
                };
                localStorage.setItem('poornasree_hub_port', JSON.stringify(portConfig));
                
                setSuccess('Poornasree HUB connected successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setTimeout(() => handleBLEScan(), 500);
                connected = true;
                break;
              }
            } catch (err) {
              console.warn('⚠️ [Retry] Error connecting:', err);
            }
          }
        }
      }
      
      if (!connected) {
        setSerialPortError('Could not connect to Poornasree HUB. Please try connecting manually.');
      }
    } catch (err) {
      console.error('❌ [Retry] Error during retry:', err);
      setSerialPortError('Retry failed: ' + (err as Error).message);
    } finally {
      setIsAutoConnecting(false);
    }
  };

  // ==================== BLE DONGLE FUNCTIONS ====================
  
  // Test if a port is Poornasree HUB (returns true if verified)
  const testPortIsPoornasreeHub = async (port: SerialPort): Promise<boolean> => {
    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
    let reader: ReadableStreamDefaultReader<string> | null = null;
    let wasAlreadyOpen = false;
    
    try {
      // Check if port is already open
      try {
        const info = port.getInfo();
        // Try to access readable to see if port is open
        if (port.readable) {
          wasAlreadyOpen = true;
          console.log('ℹ️ [Port Test] Port already open, skipping test');
          return false; // Don't test an already-open port
        }
      } catch {}
      
      // Open port with error handling for locked/in-use ports
      try {
        await port.open({ baudRate: 115200 });
      } catch (openErr: any) {
        if (openErr.name === 'InvalidStateError') {
          console.log('ℹ️ [Port Test] Port already open or locked, skipping');
          return false;
        }
        throw openErr; // Re-throw other errors
      }
      
      // Wait for port to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create writer
      if (!port.writable) {
        try { await port.close(); } catch {}
        return false;
      }
      writer = port.writable.getWriter();
      
      // Create reader
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable?.pipeThrough(textDecoder);
      reader = readableStreamClosed?.getReader();
      
      if (!reader) {
        try { await writer.releaseLock(); } catch {}
        try { await port.close(); } catch {}
        return false;
      }
      
      // Send VERSION command
      const versionData = new TextEncoder().encode('VERSION\n');
      await writer.write(versionData);
      
      // Wait for response (max 2 seconds)
      const timeout = 2000;
      const startTime = Date.now();
      let buffer = '';
      
      while ((Date.now() - startTime) < timeout) {
        const readPromise = reader.read();
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ value: '', done: true }), 500));
        
        const result = await Promise.race([readPromise, timeoutPromise]) as { value?: string; done: boolean };
        
        if (result.done) break;
        if (!result.value) continue;
        
        buffer += result.value;
        
        // Check if response contains Poornasree identifier (HUB v3.0.0)
        if (buffer.includes('Poornasree HUB')) {
          // Clean up in correct order
          try { await reader.cancel(); } catch {}
          try { await writer.releaseLock(); } catch {}
          try { await port.close(); } catch {}
          // Wait for port to fully close before returning
          await new Promise(resolve => setTimeout(resolve, 300));
          return true;
        }
      }
      
      // Not verified - clean up in correct order
      try { await reader.cancel(); } catch {}
      try { await writer.releaseLock(); } catch {}
      try { await port.close(); } catch {}
      // Wait for port to fully close
      await new Promise(resolve => setTimeout(resolve, 200));
      return false;
      
    } catch (err) {
      console.warn('⚠️ [Port Test] Error testing port:', err);
      
      // Clean up on error - in correct order, individually wrapped
      try {
        if (reader) await reader.cancel();
      } catch (e) {
        console.warn('⚠️ [Port Test] Could not cancel reader:', e);
      }
      
      try {
        if (writer) await writer.releaseLock();
      } catch (e) {
        console.warn('⚠️ [Port Test] Could not release writer:', e);
      }
      
      try {
        if (!wasAlreadyOpen) await port.close();
      } catch (e) {
        console.warn('⚠️ [Port Test] Could not close port:', e);
      }
      
      return false;
    }
  };
  
  // Send command to dongle via serial port
  const sendDongleCommand = async (command: string): Promise<boolean> => {
    // Only check writer ref - more reliable than port state
    if (!serialWriterRef.current) {
      console.error('No serial writer available');
      return false;
    }

    try {
      // Use the dedicated writer stored in ref
      const writer = serialWriterRef.current;
      
      // Send command with newline
      const data = new TextEncoder().encode(command + '\n');
      await writer.write(data);
      
      // Only log non-scan commands to reduce console spam
      if (!command.startsWith('SCAN')) {
        console.log(`🔵 [Dongle] ${command}`);
      }
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error sending command to dongle:', error);
      
      // Handle device disconnection during write
      if (error.name === 'NetworkError' || error.message.includes('device has been lost')) {
        console.log('🔌 [Writer] Device disconnected during write');
        
        // Clean up state
        setConnectedPort(null);
        setIsDongleVerified(false);
        isDongleVerifiedRef.current = false;
        setAvailableBLEMachines(new Set());
        setConnectedBLEMachines(new Set());
        setAllBLEDevices([]);
        setBleScanning(false);
        setBleConnectingMachine(null);
        setMachineIdToDongleId(new Map());
        serialWriterRef.current = null;
        serialReaderRef.current = null;
        bleDataBufferRef.current = '';
        
        // Show user-friendly error
        setSerialPortError('USB device disconnected. Please reconnect the Poornasree HUB and try again.');
      }
      
      return false;
    }
  };

  // Start reading from dongle (listens for BLE scan results and responses)
  const startDongleReader = async (port?: SerialPort) => {
    const portToUse = port || connectedPort;
    if (!portToUse || serialReaderRef.current) {
      console.log('⚠️ [Reader] Skipping start - port:', !!portToUse, 'reader exists:', !!serialReaderRef.current);
      return;
    }

    console.log('🟢 [Reader] Starting dongle reader...');
    try {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = portToUse.readable?.pipeThrough(textDecoder);
      const reader = readableStreamClosed?.getReader();
      
      if (!reader) {
        console.error('❌ [Reader] Failed to get reader');
        return;
      }
      
      serialReaderRef.current = reader;
      console.log('✅ [Reader] Reader started successfully');

      // Read loop
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('🛑 [Reader] Stream done');
          break;
        }
        if (!value) continue;

        // Add to buffer
        bleDataBufferRef.current += value;

        // Process complete lines
        const lines = bleDataBufferRef.current.split('\n');
        bleDataBufferRef.current = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Log important connection messages for debugging (with safe logging)
          try {
            if (trimmed.startsWith('ERROR') || trimmed.startsWith('CONNECT') || trimmed.startsWith('DISCONNECT') || trimmed.startsWith('STATUS')) {
              // Truncate long messages to prevent buffer overrun
              const msg = trimmed.length > 200 ? trimmed.substring(0, 200) + '...' : trimmed;
              console.log(`🔵 [Dongle] ${msg}`);
            }
          } catch (logError) {
            // Silently ignore logging errors
          }
          
          try {
            processDongleResponse(trimmed);
          } catch (processError) {
            console.error('❌ [Reader] Error processing response:', processError instanceof Error ? processError.message : 'Unknown error');
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      const errorMsg = error.message?.substring(0, 200) || 'Unknown error';
      console.error('❌ [Reader] Error:', errorMsg);
      
      // Handle device disconnection
      if (error.name === 'NetworkError' || error.message?.includes('device has been lost')) {
        console.log('🔌 [Reader] Device disconnected');
        
        // Clean up state
        setConnectedPort(null);
        setIsDongleVerified(false);
        isDongleVerifiedRef.current = false;
        setAvailableBLEMachines(new Set());
        setConnectedBLEMachines(new Set());
        setAllBLEDevices([]);
        setBleScanning(false);
        setBleConnectingMachine(null);
        setMachineIdToDongleId(new Map());
        bleDataBufferRef.current = '';
        
        // Show user-friendly error
        setSerialPortError('USB device disconnected. Please reconnect the Poornasree HUB and try again.');
        
        // Try to release writer if it exists
        if (serialWriterRef.current) {
          try {
            await serialWriterRef.current.releaseLock();
          } catch {}
          serialWriterRef.current = null;
        }
      }
    } finally {
      serialReaderRef.current = null;
    }
  };

  // Process dongle response line
  const processDongleResponse = (line: string) => {
    // ACK - acknowledgment from dongle
    if (line === 'ACK') {
      // Silently acknowledge - no logging needed
      return;
    }
    // VERSION response - verify it's Poornasree HUB (v3.0.0)
    else if (line.includes('Poornasree HUB')) {
      setIsDongleVerified(true);
      isDongleVerifiedRef.current = true;
      console.log('✅ [Dongle] Verified as Poornasree HUB v3.0.0');
      return;
    }
    // FOUND,DeviceName,Address,RSSI - tracks all discovered devices
    else if (line.startsWith('FOUND,')) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const deviceName = parts[1];
        const address = parts[2];
        const rssiStr = parts[3];
        const rssi = parseInt(rssiStr);
        
        // Validate data
        if (!deviceName || !address) {
          console.warn('⚠️ [BLE] Invalid FOUND response - missing device name or address');
          return;
        }
        
        if (isNaN(rssi)) {
          console.warn(`⚠️ [BLE] Invalid RSSI value: "${rssiStr}" for device ${deviceName}`);
        }
        
        setAllBLEDevices(prev => {
          // Check if device already exists (update RSSI if so)
          const existing = prev.findIndex(d => d.address === address);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { name: deviceName, address, rssi: isNaN(rssi) ? -100 : rssi };
            return updated;
          }
          // Add new device (only log Poornasree/Lactosure devices)
          const newDevices = [...prev, { name: deviceName, address, rssi: isNaN(rssi) ? -100 : rssi }];
          if (isPoornasreeMachine(deviceName)) {
            console.log(`📡 Found: ${deviceName} (${address}, RSSI: ${rssi})`);
          }
          return newDevices;
        });
        
        // Auto-connect to Poornasree/Lactosure devices if enabled
        if (isPoornasreeMachine(deviceName)) {
          // Extract machine ID from device name
          const machineId = extractMachineId(deviceName);
          if (machineId) {
            
            setAvailableBLEMachines(prev => {
              const newSet = new Set(prev);
              newSet.add(machineId);
              return newSet;
            });
          }
        }
      }
    }
    // SCAN_RESULT,Lactosure/Poornasree - Sl.No - 201,XX:XX:XX:XX:XX:XX,-XX
    else if (line.startsWith('SCAN_RESULT,')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const deviceName = parts[1];
        // Extract machine ID from device name
        const machineId = extractMachineId(deviceName);
        if (machineId) {
          setAvailableBLEMachines(prev => {
            const newSet = new Set(prev);
            const isNew = !newSet.has(machineId);
            newSet.add(machineId);
            
            if (isNew) {
              // Auto-connect if enabled and not manually disconnected
              if (autoConnectEnabled && !manuallyDisconnectedMachines.has(machineId)) {
                // Small delay to avoid overwhelming the dongle
                setTimeout(() => {
                  handleBLEConnect(machineId);
                }, 500);
              }
            }
            
            return newSet;
          });
        }
      }
    }
    // SCAN,START or SCAN,STARTED
    else if (line === 'SCAN,START' || line === 'SCAN,STARTED') {
      setBleScanning(true);
    }
    // SCAN,COMPLETE
    else if (line === 'SCAN,COMPLETE') {
      setBleScanning(false);
      setSerialPortError(''); // Clear any errors after successful scan
      
      // Mark initial scan as completed
      if (!hasCompletedInitialScan) {
        setHasCompletedInitialScan(true);
      }
      
      // Clean up stale devices (not seen in this scan and not connected)
      cleanupStaleDevices();
    }
    // CONNECTED,OK,ID=n - Connection successful with device ID
    else if (line.startsWith('CONNECTED,OK,ID=')) {
      const dongleDeviceId = line.split('=')[1];
      
      // Update CONNECT_ALL progress if in progress
      setConnectAllProgress(prev => {
        if (prev.total > 0) {
          return { ...prev, current: prev.current + 1 };
        }
        return prev;
      });
      
      // Try to get machine ID from multiple sources
      let machineId = bleConnectingMachine;
      
      // If no bleConnectingMachine, try individual connection map first
      if (!machineId && connectingAddressRef.current) {
        machineId = individualConnectionMapRef.current.get(connectingAddressRef.current.toLowerCase());
        if (machineId) {
          console.log(`🔗 [BLE] Resolved machine ID ${machineId} from individual connection map (${connectingAddressRef.current})`);
        }
      }
      
      // If still no machineId, try address map (for CONNECT_ALL)
      if (!machineId && connectingAddressRef.current) {
        machineId = connectAllAddressMapRef.current.get(connectingAddressRef.current.toLowerCase());
        if (machineId) {
          console.log(`🔗 [BLE] Resolved machine ID ${machineId} from CONNECT_ALL address map (${connectingAddressRef.current})`);
        }
      }
      
      // Fallback: try to find in allBLEDevices
      if (!machineId && connectingAddressRef.current) {
        const device = allBLEDevices.find(d => d.address.toLowerCase() === connectingAddressRef.current?.toLowerCase());
        if (device && isPoornasreeMachine(device.name)) {
          machineId = extractMachineId(device.name);
          console.log(`🔗 [BLE] Resolved machine ID ${machineId} from allBLEDevices (${connectingAddressRef.current})`);
        } else {
          console.warn(`⚠️ [BLE] Could not find device with address ${connectingAddressRef.current} in allBLEDevices (${allBLEDevices.length} devices)`);
        }
      }
      
      if (machineId) {
        // Add to connected set
        setConnectedBLEMachines(prev => {
          const newSet = new Set(prev);
          newSet.add(machineId);
          console.log(`✅ [BLE] Added ${machineId} to connected set, Total: ${newSet.size}`);
          return newSet;
        });
        
        // Map machine ID to dongle device ID
        setMachineIdToDongleId(prev => {
          const newMap = new Map(prev);
          newMap.set(machineId, dongleDeviceId);
          console.log(`🔗 [BLE] Mapped ${machineId} → Dongle ID: ${dongleDeviceId}`);
          return newMap;
        });
        
        console.log(`✅ [BLE] Connected to machine ${machineId} (Dongle ID: ${dongleDeviceId})`);
        
        // Save connected BLE devices to localStorage for auto-reconnect
        try {
          const savedDevices = JSON.parse(localStorage.getItem('connected_ble_devices') || '[]');
          
          // Find device address from mapping (CONNECT_ALL or individual)
          let deviceAddress = connectingAddressRef.current?.toLowerCase();
          
          // If not found (during rapid CONNECT_ALL), search in maps
          if (!deviceAddress || deviceAddress === 'null') {
            // Check CONNECT_ALL map
            for (const [addr, mId] of connectAllAddressMapRef.current.entries()) {
              if (mId === machineId) {
                deviceAddress = addr;
                break;
              }
            }
            // Check individual map
            if (!deviceAddress) {
              for (const [addr, mId] of individualConnectionMapRef.current.entries()) {
                if (mId === machineId) {
                  deviceAddress = addr;
                  break;
                }
              }
            }
          }
          
          if (deviceAddress) {
            const deviceInfo = allBLEDevices.find(d => d.address.toLowerCase() === deviceAddress);
            
            if (!deviceInfo) {
              console.log(`ℹ️ [BLE] Device not in allBLEDevices (${allBLEDevices.length} devices), using machine ID for name`);
            }
            
            // Save with device info if available, otherwise construct from machineId
            const deviceToSave = deviceInfo || { 
              address: deviceAddress, 
              name: `Poornasree - Sl.No - ${machineId}`,
              rssi: -50
            };
            
            if (!savedDevices.some((d: any) => d.address === deviceToSave.address)) {
              savedDevices.push({ address: deviceToSave.address, name: deviceToSave.name, machineId });
              localStorage.setItem('connected_ble_devices', JSON.stringify(savedDevices));
              console.log('💾 [BLE] Saved device to auto-reconnect list:', deviceToSave.name);
            } else {
              console.log('ℹ️ [BLE] Device already in saved list:', deviceToSave.name);
            }
          } else {
            console.warn('⚠️ [BLE] Could not find device address for machine', machineId);
          }
        } catch (err) {
          console.warn('⚠️ [BLE] Could not save connected device:', err);
        }
        
        // Clean up individual connection map if used
        if (connectingAddressRef.current) {
          individualConnectionMapRef.current.delete(connectingAddressRef.current.toLowerCase());
        }
      } else {
        // Enhanced error logging for machine ID resolution failure
        const connectingAddr = connectingAddressRef.current?.toLowerCase();
        const deviceFromAddr = connectingAddr ? allBLEDevices.find(d => d.address.toLowerCase() === connectingAddr) : null;
        
        console.error('❌ [BLE] Failed to resolve machine ID for connection');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Dongle Device ID:', dongleDeviceId);
        console.error('Connecting Address:', connectingAddressRef.current || 'Not available');
        console.error('BLE Connecting Machine:', bleConnectingMachine || 'Not set');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Connection Maps:');
        console.error('  • Individual Map Size:', individualConnectionMapRef.current.size);
        if (individualConnectionMapRef.current.size > 0) {
          console.error('  • Individual Map Entries:', Array.from(individualConnectionMapRef.current.entries()));
        }
        console.error('  • Connect All Map Size:', connectAllAddressMapRef.current.size);
        if (connectAllAddressMapRef.current.size > 0) {
          console.error('  • Connect All Map Entries:', Array.from(connectAllAddressMapRef.current.entries()));
        }
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('BLE Devices State:');
        console.error('  • Total Devices Found:', allBLEDevices.length);
        if (connectingAddr && deviceFromAddr) {
          console.error('  • Device at Address:', deviceFromAddr.name, `(RSSI: ${deviceFromAddr.rssi})`);
          const extractedId = extractMachineId(deviceFromAddr.name);
          console.error('  • Extracted Machine ID:', extractedId || 'Failed to extract');
          console.error('  • Is Poornasree Device:', isPoornasreeMachine(deviceFromAddr.name));
        } else if (connectingAddr) {
          console.error('  • Device at Address: NOT FOUND in allBLEDevices');
          console.error('  • Available Addresses:', allBLEDevices.slice(0, 5).map(d => d.address).join(', '), allBLEDevices.length > 5 ? '...' : '');
        }
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Possible Causes:');
        console.error('  1. Device name format not recognized (expected: Lactosure/Poornasree-XXX or Sl.No-XXX)');
        console.error('  2. Device not in allBLEDevices array (may need to rescan)');
        console.error('  3. Address mismatch (case sensitivity or formatting)');
        console.error('  4. Connection race condition (device connected before scan completed)');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Suggested Actions:');
        console.error('  • Querying dongle for device info (sending LIST command)...');
        console.error('  • Rescan BLE devices to refresh allBLEDevices array');
        console.error('  • Check device naming convention matches expected format');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Automatically send LIST command to try to resolve the device
        console.log(`🔄 [BLE] Sending LIST command to query device info for Dongle ID: ${dongleDeviceId}...`);
        sendDongleCommand('LIST').catch(err => {
          console.error('❌ [BLE] Failed to send LIST command:', err);
        });
        
        // Show user-friendly error notification
        setSerialPortError(`Device connected but not identified (ID: ${dongleDeviceId}). Querying dongle...`);
        setTimeout(() => setSerialPortError(''), 3000);
      }
      
      // Clear connecting state
      setBleConnectingMachine(null);
      connectingAddressRef.current = null;
    }
    // STATUS,CONNECTED,n - Intermediate status message from firmware
    else if (line.startsWith('STATUS,CONNECTED,')) {
      // Just acknowledge, wait for CONNECTED,OK,ID= message
    }
    // STATUS,CCCD_ENABLED - Notifications enabled
    else if (line === 'STATUS,CCCD_ENABLED') {
      // Notifications enabled successfully
    }
    // CONNECTED,OK (legacy format)
    else if (line === 'CONNECTED,OK') {
      setBleConnectingMachine(currentConnecting => {
        if (currentConnecting) {
          const machineId = currentConnecting;
          setConnectedBLEMachines(prev => {
            const newSet = new Set(prev);
            newSet.add(machineId);
            console.log(`✅ [BLE] Connected to machine ${machineId} (legacy format)`);
            return newSet;
          });
        }
        return null; // Clear connecting state
      });
    }
    // CONNECTING,address - Connection in progress (individual connection)
    else if (line.startsWith('CONNECTING,') && !line.startsWith('CONNECTING_ALL,')) {
      const address = line.split(',')[1];
      connectingAddressRef.current = address; // Store address for later resolution
      
      // Find device by address and set as connecting
      const device = allBLEDevices.find(d => d.address.toLowerCase() === address.toLowerCase());
      if (device) {
        if (isPoornasreeMachine(device.name)) {
          const machineId = extractMachineId(device.name);
          if (machineId) {
            // Store in individual connection map for reliable lookup
            individualConnectionMapRef.current.set(address.toLowerCase(), machineId);
            setBleConnectingMachine(machineId);
            console.log(`🔗 [BLE] Connecting to machine ${machineId} (${address})...`);
            console.log(`🗺️ [BLE] Mapped ${address} → Machine ${machineId} (individual)`);
          } else {
            console.warn(`⚠️ [BLE] Failed to extract machine ID from device: "${device.name}"`);
            console.warn(`   Address: ${address}`);
          }
        } else {
          console.warn(`⚠️ [BLE] Device is not a Poornasree/Lactosure machine: "${device.name}"`);
        }
      } else {
        // Device not in scan results - this is OK, dongle may be connecting directly
        console.log(`ℹ️ [BLE] Connecting to device ${address} (not in scan results yet)`);
        console.log(`   This is normal when:`);
        console.log(`   • Connecting before scan completes`);
        console.log(`   • Reconnecting to a known device`);
        console.log(`   • Using direct address connection`);
        console.log(`   The device will be identified when CONNECTED,OK,ID=X is received`);
        
        // Still store the address for later lookup
        // The machine ID will be resolved when CONNECTED response arrives
      }
    }
    // CONNECTING_ALL,address - CONNECT_ALL command connecting to a device
    else if (line.startsWith('CONNECTING_ALL,')) {
      const address = line.split(',')[1];
      connectingAddressRef.current = address; // Store address for later resolution
      
      // Find device by address and set as connecting
      const device = allBLEDevices.find(d => d.address.toLowerCase() === address.toLowerCase());
      if (device) {
        if (isPoornasreeMachine(device.name)) {
          const machineId = extractMachineId(device.name);
          if (machineId) {
            // Skip if already connected
            if (connectedBLEMachines.has(machineId)) {
              console.log(`⏭️ [CONNECT_ALL] Skipping machine ${machineId} (${address}) - already connected`);
              return; // Skip processing
            }
            setBleConnectingMachine(machineId);
            console.log(`🔗 [CONNECT_ALL] Connecting to machine ${machineId} (${address})...`);
          } else {
            console.warn(`⚠️ [CONNECT_ALL] Failed to extract machine ID from: "${device.name}"`);
          }
        }
      } else {
        console.warn(`⚠️ [CONNECT_ALL] Device ${address} not found in scan results`);
      }
    }
    // CONNECT_ALL,COMPLETE,CONNECTED=n,FAILED=m - New firmware v3.0.0 format
    else if (line.startsWith('CONNECT_ALL,COMPLETE')) {
      const parts = line.split(',');
      let connected = 0;
      let failed = 0;
      
      for (const part of parts) {
        if (part.startsWith('CONNECTED=')) {
          connected = parseInt(part.split('=')[1]);
        } else if (part.startsWith('FAILED=')) {
          failed = parseInt(part.split('=')[1]);
        } else if (part.startsWith('SKIPPED=')) {
          // Legacy support for old firmware
          failed = parseInt(part.split('=')[1]);
        }
      }
      
      console.log(`✅ [CONNECT_ALL] Completed: ${connected} connected, ${failed} failed`);
      setConnectingAll(false);
      setConnectAllProgress({ current: 0, total: 0 });
      setBleConnectingMachine(null);
      connectAllAddressMapRef.current.clear(); // Clear the address map
    }
    // DISCONNECTED,id or DISCONNECTED,ALL - Firmware v3.0.0 format
    else if (line.startsWith('DISCONNECTED,')) {
      if (line === 'DISCONNECTED,ALL') {
        setConnectedBLEMachines(new Set());
        setMachineIdToDongleId(new Map());
        setBleConnectingMachine(null);
        console.log('🔌 [BLE] All devices disconnected');
        
        // Don't auto-reconnect after manual disconnect all
        // (saved devices list is already cleared by handleDisconnectAll)
      } else if (line === 'DISCONNECTED,OK') {
        // Legacy format - single device disconnected successfully
        if (bleConnectingMachine) {
          setBleConnectingMachine(null);
        }
      } else {
        // DISCONNECTED,id - specific device disconnected
        const dongleDeviceId = line.split(',')[1];
        
        // Find and remove machine with this dongle ID
        let removedMachineId: string | null = null;
        machineIdToDongleId.forEach((dId, mId) => {
          if (dId === dongleDeviceId) {
            removedMachineId = mId;
          }
        });
        
        if (removedMachineId) {
          setConnectedBLEMachines(prev => {
            const newSet = new Set(prev);
            newSet.delete(removedMachineId);
            return newSet;
          });
          
          setMachineIdToDongleId(prev => {
            const newMap = new Map(prev);
            newMap.delete(removedMachineId);
            return newMap;
          });
          
          console.log(`🔌 [BLE] Machine ${removedMachineId} disconnected (Dongle ID: ${dongleDeviceId})`);
          
          // Check if device is in saved list for auto-reconnect
          try {
            const savedDevices = JSON.parse(localStorage.getItem('connected_ble_devices') || '[]');
            const savedDevice = savedDevices.find((d: any) => d.machineId === removedMachineId);
            
            if (savedDevice) {
              console.log(`🔄 [Auto-Reconnect] Device ${removedMachineId} was in saved list, attempting reconnect...`);
              
              // Wait 2 seconds then try to reconnect
              setTimeout(async () => {
                console.log(`🔗 [Auto-Reconnect] Reconnecting to ${savedDevice.name} (${savedDevice.address})...`);
                await sendDongleCommand(`CONNECT,${savedDevice.address}`);
              }, 2000);
            }
          } catch (err) {
            console.warn('⚠️ [Auto-Reconnect] Error checking saved devices:', err);
          }
        } else {
          console.warn(`⚠️ [BLE] Disconnected dongle ID ${dongleDeviceId} but no matching machine found`);
        }
        
        // Clear connecting state if this was the connecting machine
        if (bleConnectingMachine) {
          setBleConnectingMachine(null);
        }
      }
    }
    // ERROR responses
    else if (line.startsWith('ERROR,')) {
      const errorParts = line.split(',');
      const errorType = errorParts[1] || 'UNKNOWN';
      const errorDetail = errorParts.slice(2).join(',') || 'No details provided';
      
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [Dongle Error]');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error Type:', errorType);
      console.error('Error Detail:', errorDetail);
      console.error('Full Response:', line);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Context:');
      if (bleConnectingMachine) {
        console.error('  • Was connecting to machine:', bleConnectingMachine);
      }
      if (connectingAddressRef.current) {
        console.error('  • Device address:', connectingAddressRef.current);
      }
      if (bleScanning) {
        console.error('  • BLE scan was in progress');
      }
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Set user-friendly error message
      const friendlyErrors: Record<string, string> = {
        'CONNECTION_FAILED': 'Failed to connect to device. It may be out of range or already connected.',
        'TIMEOUT': 'Connection timed out. Please move closer to the device and try again.',
        'NOT_FOUND': 'Device not found. Please ensure the device is powered on and nearby.',
        'SCAN_FAILED': 'BLE scan failed. Please disconnect and reconnect the dongle.',
        'INVALID_COMMAND': 'Invalid command sent to dongle. Please refresh the page.',
      };
      
      const userMessage = friendlyErrors[errorType] || `Dongle error: ${errorType}`;
      setSerialPortError(userMessage);
      
      // Clear states
      setBleConnectingMachine(null);
      setBleScanning(false);
    }
    // DEVICE,id,name,address - Response from LIST command
    else if (line.startsWith('DEVICE,')) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const deviceId = parts[1];
        let deviceName = parts[2];
        const deviceAddress = parts[3].toLowerCase(); // Normalize to lowercase
        
        console.log(`📋 [LIST] Device ${deviceId}: ${deviceName} (${deviceAddress})`);
        
        // If device name is "Unknown", try to find it in allBLEDevices by address (case-insensitive)
        if (deviceName === 'Unknown') {
          const knownDevice = allBLEDevices.find(d => d.address.toLowerCase() === deviceAddress);
          if (knownDevice) {
            deviceName = knownDevice.name;
            console.log(`📋 [LIST] Resolved Unknown device to: ${deviceName}`);
          } else {
            // Use safeLog to prevent buffer issues with large device arrays
            safeLog(`📋 [LIST] Could not resolve Unknown device (${deviceAddress}). ${allBLEDevices.length} devices available`);
          }
        }
        
        // Extract machine ID from device name if it's a Poornasree/Lactosure device
        if (isPoornasreeMachine(deviceName)) {
          const machineId = extractMachineId(deviceName);
          if (machineId) {
            
            // Add to available machines
            setAvailableBLEMachines(prev => {
              const newSet = new Set(prev);
              newSet.add(machineId);
              return newSet;
            });
            
            // Add to connected machines
            setConnectedBLEMachines(prev => {
              const newSet = new Set(prev);
              newSet.add(machineId);
              return newSet;
            });
            
            // Map machine ID to dongle device ID
            setMachineIdToDongleId(prev => {
              const newMap = new Map(prev);
              newMap.set(machineId, deviceId);
              return newMap;
            });
            
            // Add to discovered devices list for display
            setAllBLEDevices(prev => {
              const existing = prev.find(d => d.address === deviceAddress);
              if (!existing) {
                return [...prev, { name: deviceName, address: deviceAddress, rssi: -50 }];
              }
              return prev;
            });
            
            // Save to localStorage for auto-reconnect (for already-connected devices)
            try {
              const savedDevices = JSON.parse(localStorage.getItem('connected_ble_devices') || '[]');
              if (!savedDevices.some((d: any) => d.address === deviceAddress)) {
                savedDevices.push({ address: deviceAddress, name: deviceName, machineId });
                localStorage.setItem('connected_ble_devices', JSON.stringify(savedDevices));
                console.log('💾 [LIST] Saved existing connection to auto-reconnect list');
              }
            } catch (err) {
              console.warn('⚠️ [LIST] Could not save device:', err);
            }
          }
        }
      }
    }
    // NO_DEVICES - No devices connected (response from LIST command)
    else if (line === 'NO_DEVICES') {
      console.log('📋 [LIST] No devices currently connected');
    }
    // DATA,id,<payload> - New firmware v3.0.0 format with STX/ETX framing
    else if (line.startsWith('DATA,')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const dongleDeviceId = parts[1];
        const payload = parts.slice(2).join(',');
        
        // Extract machine data between STX and ETX
        const dataMatch = payload.match(/\x02(.*?)\x03/);
        if (dataMatch) {
          const data = dataMatch[1];
          // Use safeLog to prevent buffer overruns with large data packets
          safeLog(`📥 [BLE Data] Device ${dongleDeviceId} (${data.length} bytes):`, data.substring(0, 100));
          
          // Extract machine ID from data and store
          const machineIdMatch = data.match(/MM(\d+)/);
          if (machineIdMatch) {
            const machineId = machineIdMatch[1];
            setBleDataReceived(prev => new Map(prev).set(machineId, data));
            forwardBleData(machineId, data); // Forward to Control Panel via context
            console.log(`📊 [BLE Data] Machine ${machineId} → Dongle ID ${dongleDeviceId}`);
          } else {
            // Try to find machine ID from dongleDeviceId mapping
            let foundMachineId: string | null = null;
            machineIdToDongleId.forEach((dId, mId) => {
              if (dId === dongleDeviceId) {
                foundMachineId = mId;
              }
            });
            
            if (foundMachineId) {
              setBleDataReceived(prev => new Map(prev).set(foundMachineId, data));
              forwardBleData(foundMachineId, data); // Forward to Control Panel via context
              console.log(`📊 [BLE Data] Machine ${foundMachineId} (via mapping) → Dongle ID ${dongleDeviceId}`);
            } else {
              console.warn(`⚠️ [BLE Data] Could not identify machine for dongle ID ${dongleDeviceId}`);
            }
          }
        }
      }
    }
    // Legacy data packets (STX...ETX wrapped) - fallback for old firmware
    else if (line.includes('\x02') || line.includes('\x03')) {
      // Extract machine data between STX and ETX
      const dataMatch = line.match(/\x02(.*?)\x03/);
      if (dataMatch) {
        const data = dataMatch[1];
        // Use safeLog to prevent buffer overruns with large data packets
        safeLog(`📥 [BLE Data] Received (${data.length} bytes):`, data.substring(0, 100));
        
        // Extract machine ID from data and store
        const machineIdMatch = data.match(/MM(\d+)/);
        if (machineIdMatch) {
          const machineId = machineIdMatch[1];
          setBleDataReceived(prev => new Map(prev).set(machineId, data));
          forwardBleData(machineId, data); // Forward to Control Panel via context
        }
      }
    }
  };

  // Clean up stale devices (not seen in recent scan and not connected)
  const cleanupStaleDevices = () => {
    setAvailableBLEMachines(prev => {
      const newSet = new Set<string>();
      prev.forEach(machineId => {
        // Keep if connected
        if (connectedBLEMachines.has(machineId)) {
          newSet.add(machineId);
        }
        // Otherwise, remove stale devices
      });
      
      if (newSet.size !== prev.size) {
        console.log(`🧹 [BLE] Cleaned up ${prev.size - newSet.size} stale devices`);
      }
      
      return newSet;
    });
  };

  // Query existing connections from dongle
  const queryExistingConnections = async () => {
    if (!serialWriterRef.current) {
      console.log('⚠️ [BLE] Cannot query - writer not ready');
      return;
    }
    
    console.log('🔍 [BLE] Querying existing connections...');
    
    // Send LIST command to get currently connected devices
    await sendDongleCommand('LIST');
  };

  // Start BLE scan via dongle
  const handleBLEScan = async () => {
    console.log('🔍 [BLE] handleBLEScan called, connectedPort:', !!connectedPort, 'writer:', !!serialWriterRef.current, 'verified:', isDongleVerifiedRef.current);
    
    // Check if dongle is verified first
    if (!isDongleVerifiedRef.current) {
      setSerialPortError('Please connect to a Poornasree HUB device first.');
      return;
    }
    
    // Check if writer exists immediately
    if (!serialWriterRef.current) {
      setSerialPortError('Not connected to Poornasree HUB. Please connect the device first.');
      return;
    }

    // Clear any previous errors
    setSerialPortError('');

    // Clear all discovered devices for fresh scan
    setAllBLEDevices([]);
    console.log('🧹 [BLE] Cleared device list');
    
    // Don't clear available machines - keep connected ones visible
    // Only clear if no machines are connected
    if (connectedBLEMachines.size === 0) {
      setAvailableBLEMachines(new Set());
    }
    
    // Send SCAN command to dongle with 5-second duration
    console.log('📤 [BLE] Sending SCAN,5 command...');
    const success = await sendDongleCommand('SCAN,5');
    console.log('📤 [BLE] Command result:', success);
    if (success) {
      setBleScanning(true);
      console.log('🔍 [BLE] Scan command sent (5 seconds)');
      // Scan will complete automatically (dongle sends SCAN,COMPLETE)
    } else {
      console.error('❌ [BLE] Failed to send scan command');
      setSerialPortError('Failed to send scan command to dongle');
    }
  };

  // Stop BLE scan
  const handleStopScan = () => {
    setBleScanning(false);
    console.log('🛑 [BLE] Scan stopped by user');
  };

  // Disconnect all BLE devices
  const handleDisconnectAll = async () => {
    if (!serialWriterRef.current || !isDongleVerifiedRef.current) {
      setSerialPortError('Please connect to a Poornasree HUB device first.');
      return;
    }

    console.log('🔌 [BLE] Disconnecting all devices...');
    
    // Clear saved connections from localStorage
    localStorage.removeItem('connected_ble_devices');
    console.log('🧹 [BLE] Cleared auto-reconnect list');
    
    const success = await sendDongleCommand('DISCONNECT');
    
    if (success) {
      // Clear all connected devices
      setConnectedBLEMachines(new Set());
      setMachineIdToDongleId(new Map());
      console.log('✅ [BLE] Disconnect all command sent');
    } else {
      console.error('❌ [BLE] Failed to send disconnect all command');
      setSerialPortError('Failed to disconnect all devices');
    }
  };

  // Connect to all available Poornasree devices
  const handleConnectAll = async () => {
    if (!serialWriterRef.current || !isDongleVerifiedRef.current) {
      setSerialPortError('Please connect to a Poornasree HUB device first.');
      return;
    }

    // Filter for Poornasree devices that aren't already connected
    const availableDevices = allBLEDevices.filter(d => {
      const machineId = extractMachineId(d.name);
      return isPoornasreeMachine(d.name) && machineId && !connectedBLEMachines.has(machineId);
    });
    
    const alreadyConnectedCount = allBLEDevices.filter(d => {
      const machineId = extractMachineId(d.name);
      return isPoornasreeMachine(d.name) && machineId && connectedBLEMachines.has(machineId);
    }).length;
    
    if (alreadyConnectedCount > 0) {
      console.log(`⏭️ [CONNECT_ALL] Skipping ${alreadyConnectedCount} already connected machine(s)`);
    }
    
    if (availableDevices.length === 0) {
      if (alreadyConnectedCount > 0) {
        setSerialPortError(`All machines are already connected (${alreadyConnectedCount})`);
      } else {
        setSerialPortError('No devices available to connect');
      }
      setTimeout(() => setSerialPortError(''), 2000);
      return;
    }

    console.log(`🔗 [BLE] Using CONNECT_ALL command for ${availableDevices.length} devices...`);
    setConnectingAll(true);
    setConnectAllProgress({ current: 0, total: availableDevices.length });

    // Build a map of addresses to machine IDs for quick lookup
    connectAllAddressMapRef.current = new Map();
    availableDevices.forEach(device => {
      const machineId = extractMachineId(device.name);
      if (machineId) {
        connectAllAddressMapRef.current.set(device.address.toLowerCase(), machineId);
        console.log(`🗺️ [CONNECT_ALL] Mapped ${device.address} → Machine ${machineId}`);
      }
    });

    // Use the dongle's native CONNECT_ALL command for super fast connection
    const success = await sendDongleCommand('CONNECT_ALL');
    
    if (success) {
      console.log('✅ [BLE] CONNECT_ALL command sent successfully');
      // The dongle will send CONNECTED,OK,ID=n for each device as they connect
      // Wait a bit for connections to establish
      await new Promise(resolve => setTimeout(resolve, availableDevices.length * 300));
    } else {
      console.error('❌ [BLE] CONNECT_ALL command failed');
      setSerialPortError('Failed to send connect all command');
    }
    
    setConnectingAll(false);
    setConnectAllProgress({ current: 0, total: 0 });
  };

  // Connect to BLE machine via dongle
  const handleBLEConnect = async (machineId: string, deviceAddress?: string): Promise<boolean> => {
    if (!serialWriterRef.current || !isDongleVerifiedRef.current) {
      setSerialPortError('Please connect to a Poornasree HUB device first.');
      return false;
    }

    // Check if already connected
    if (connectedBLEMachines.has(machineId)) {
      return true;
    }

    // Find the device address if not provided
    let address = deviceAddress;
    if (!address) {
      // Try to find the actual device name from allBLEDevices, fallback to Poornasree format
      const knownDevice = allBLEDevices.find(d => extractMachineId(d.name) === machineId);
      const deviceName = knownDevice ? knownDevice.name : `Poornasree - Sl.No - ${machineId}`;
      const device = allBLEDevices.find(d => d.name === deviceName);
      if (!device) {
        setSerialPortError(`Device ${machineId} not found. Please scan first.`);
        return false;
      }
      address = device.address;
    }
    
    setBleConnectingMachine(machineId);
    
    // Store address -> machineId mapping for reliable lookup when CONNECTED,OK,ID arrives
    individualConnectionMapRef.current.set(address.toLowerCase(), machineId);
    console.log(`🗺️ [Individual Connection] Mapped ${address} → Machine ${machineId}`);
    
    // Create a promise that resolves when connection succeeds or fails
    return new Promise<boolean>((resolve) => {
      let timeout: NodeJS.Timeout;
      
      // Set up a one-time listener for this specific connection
      const checkConnection = setInterval(() => {
        if (connectedBLEMachines.has(machineId)) {
          clearInterval(checkConnection);
          clearTimeout(timeout);
          setBleConnectingMachine(null);
          resolve(true);
        }
      }, 50);
      
      // Timeout after 3 seconds
      timeout = setTimeout(() => {
        clearInterval(checkConnection);
        setBleConnectingMachine(null);
        console.warn(`⏱️ [BLE] Connection timeout for machine ${machineId}`);
        resolve(false);
      }, 3000);
      
      // Send CONNECT command
      sendDongleCommand(`CONNECT,${address}`).then(success => {
        if (!success) {
          clearInterval(checkConnection);
          clearTimeout(timeout);
          setBleConnectingMachine(null);
          resolve(false);
        }
      });
    });
  };

  // Disconnect from BLE machine via dongle
  const handleBLEDisconnect = async (machineId: string) => {
    if (!serialWriterRef.current || !isDongleVerifiedRef.current) {
      setSerialPortError('Please connect to a Poornasree HUB device first.');
      return;
    }

    // Get the dongle device ID for this machine
    const dongleDeviceId = machineIdToDongleId.get(machineId);
    
    if (dongleDeviceId) {
      // Send DISCONNECT,id command to disconnect specific device
      await sendDongleCommand(`DISCONNECT,${dongleDeviceId}`);
    } else {
      // Fallback: disconnect all if we don't have the device ID
      await sendDongleCommand('DISCONNECT');
    }
    
    // Remove from connected set
    setConnectedBLEMachines(prev => {
      const newSet = new Set(prev);
      newSet.delete(machineId);
      return newSet;
    });
    
    // Keep device in available set (it's still in range after disconnect)
    setAvailableBLEMachines(prev => {
      const newSet = new Set(prev);
      newSet.add(machineId);
      return newSet;
    });
    
    // Remove from mapping
    setMachineIdToDongleId(prev => {
      const newMap = new Map(prev);
      newMap.delete(machineId);
      return newMap;
    });
  };

  // Toggle auto-connect feature
  const toggleAutoConnect = () => {
    setAutoConnectEnabled(prev => {
      const newValue = !prev;
      autoConnectEnabledRef.current = newValue;
      return newValue;
    });
  };

  // Check if machine is available via BLE
  const isMachineBLEAvailable = (machineId: string): boolean => {
    // Extract numeric part from machine ID (e.g., "M201" -> "201")
    const numericId = machineId.replace(/[^0-9]/g, '');
    return availableBLEMachines.has(numericId);
  };

  // Check if machine is connected via BLE
  const isMachineBLEConnected = (machineId: string): boolean => {
    const numericId = machineId.replace(/[^0-9]/g, '');
    return connectedBLEMachines.has(numericId);
  };

  // Get BLE button status for machine
  const getBLEButtonStatus = (machineId: string): 'offline' | 'available' | 'connecting' | 'connected' => {
    const numericId = machineId.replace(/[^0-9]/g, '');
    
    if (bleConnectingMachine === numericId) return 'connecting';
    if (connectedBLEMachines.has(numericId)) return 'connected';
    if (availableBLEMachines.has(numericId)) return 'available';
    return 'offline';
  };

  // ==================== END BLE DONGLE FUNCTIONS ====================

  // Parse rate chart details from concatenated string
  const parseChartDetails = (chartDetails?: string) => {
    if (!chartDetails) return { pending: [], downloaded: [] };
    
    const charts = chartDetails.split('|||');
    const pending: Array<{ channel: string; fileName: string }> = [];
    const downloaded: Array<{ channel: string; fileName: string }> = [];
    
    charts.forEach(chart => {
      const [channel, fileName, status] = chart.split(':');
      if (channel && fileName && status) {
        if (status === 'pending') {
          pending.push({ channel, fileName });
        } else if (status === 'downloaded') {
          downloaded.push({ channel, fileName });
        }
      }
    });
    
    return { pending, downloaded };
  };

  // Parse correction details from string
  // New format: "1,2,3:pending|||1,2:downloaded" where 1=C1, 2=C2, 3=C3
  const parseCorrectionDetails = (correctionDetails?: string) => {
    if (!correctionDetails) return { pending: [], downloaded: [] };
    
    const channelMap: Record<string, string> = { '1': 'C1', '2': 'C2', '3': 'C3' };
    const pending: Array<{ channel: string }> = [];
    const downloaded: Array<{ channel: string }> = [];
    const pendingChannels = new Set<string>();
    
    const records = correctionDetails.split('|||');
    
    // First pass: collect all pending channels
    records.forEach(record => {
      if (!record) return;
      const parts = record.split(':');
      if (parts.length >= 2) {
        const channelPart = parts[0].trim();
        const status = parts[1].trim().toLowerCase();
        
        if (channelPart && status === 'pending') {
          const channelList = channelPart.split(',');
          channelList.forEach(ch => {
            const channelName = channelMap[ch.trim()];
            if (channelName) {
              pendingChannels.add(channelName);
            }
          });
        }
      }
    });
    
    // Second pass: add to pending and downloaded lists (pending takes priority)
    records.forEach(record => {
      if (!record) return;
      const parts = record.split(':');
      if (parts.length >= 2) {
        const channelPart = parts[0].trim();
        const status = parts[1].trim().toLowerCase();
        
        if (channelPart) {
          const channelList = channelPart.split(',');
          channelList.forEach(ch => {
            const channelName = channelMap[ch.trim()];
            if (channelName) {
              if (status === 'pending') {
                // Add to pending only if not already added
                if (!pending.some(p => p.channel === channelName)) {
                  pending.push({ channel: channelName });
                }
              } else if (status === 'downloaded') {
                // Add to downloaded only if NOT in pending list
                if (!pendingChannels.has(channelName) && !downloaded.some(d => d.channel === channelName)) {
                  downloaded.push({ channel: channelName });
                }
              }
            }
          });
        }
      }
    });
    
    return { pending, downloaded };
  };

  // Check master machine status for selected society
  const checkMasterMachineStatus = (societyId: string) => {
    if (!societyId) {
      setSocietyHasMaster(false);
      setExistingMasterMachine(null);
      setIsFirstMachine(false);
      return;
    }

    const societyMachines = machines.filter(m => m.societyId === parseInt(societyId));
    const masterMachine = societyMachines.find(m => m.isMasterMachine);
    
    setIsFirstMachine(societyMachines.length === 0);
    setSocietyHasMaster(!!masterMachine);
    setExistingMasterMachine(masterMachine ? masterMachine.machineId : null);

    // Auto-check setAsMaster if it's the first machine
    if (societyMachines.length === 0) {
      setFormData(prev => ({ ...prev, setAsMaster: true }));
    } else {
      setFormData(prev => ({ ...prev, setAsMaster: false }));
    }
  };

  // Handle click on master badge to change master
  const handleMasterBadgeClick = (societyId: number) => {
    setSelectedSocietyForMaster(societyId);
    setNewMasterMachineId(null);
    setSetForAll(false);
    setShowChangeMasterModal(true);
  };

  // Handle change master confirmation
  const handleChangeMasterConfirm = async () => {
    if (!newMasterMachineId) {
      setError('Please select a machine to set as master');
      return;
    }

    setIsChangingMaster(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await fetch(`/api/user/machine/${newMasterMachineId}/set-master`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ setForAll })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Master machine updated successfully');
        setShowChangeMasterModal(false);
        await fetchMachines(); // Refresh machines list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || data.message || 'Failed to update master machine');
      }
    } catch (error) {
      console.error('Error updating master machine:', error);
      setError('Failed to update master machine');
    } finally {
      setIsChangingMaster(false);
    }
  };

  // Get channel badge color
  const getChannelColor = (channel: string) => {
    switch (channel.toUpperCase()) {
      case 'COW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'BUF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'MIX': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Fetch rate chart data
  const fetchRateChartData = async (fileName: string, channel: string, societyId: number) => {
    try {
      setLoadingChartData(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/user/ratechart/data?fileName=${encodeURIComponent(fileName)}&channel=${channel}&societyId=${societyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRateChartData(data.data || []);
      } else {
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch rate chart data');
      }
    } catch (error) {
      console.error('Error fetching rate chart data:', error);
      setError('Failed to fetch rate chart data');
    } finally {
      setLoadingChartData(false);
    }
  };

  // Handle view rate chart
  const handleViewRateChart = (fileName: string, channel: string, societyId: number) => {
    setSelectedRateChart({ fileName, channel, societyId });
    setShowRateChartModal(true);
    fetchRateChartData(fileName, channel, societyId);
  };

  // Close rate chart modal
  const closeRateChartModal = () => {
    setShowRateChartModal(false);
    setSelectedRateChart(null);
    setRateChartData([]);
    setSearchFat('');
    setSearchSnf('');
    setSearchClr('');
  };

  // Update password validation when data changes
  const updatePasswordData = (newData: Partial<PasswordFormData>) => {
    // Filter and limit input to 4 digits only
    const filteredData: Partial<PasswordFormData> = {};
    
    Object.entries(newData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Only allow digits and limit to 6 characters
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        filteredData[key as keyof PasswordFormData] = numericValue;
      }
    });
    
    const updatedData = { ...passwordData, ...filteredData };
    setPasswordData(updatedData);

    // Validate only the field being changed
    const fieldName = Object.keys(newData)[0] as keyof PasswordFormData;
    const newErrors = { ...passwordErrors };

    if (fieldName === 'userPassword') {
      const formatError = validatePasswordFormat(updatedData.userPassword);
      newErrors.userPassword = formatError;
      newErrors.confirmUserPassword = ''; // Clear confirm field error
    } else if (fieldName === 'confirmUserPassword') {
      const formatError = validatePasswordFormat(updatedData.confirmUserPassword);
      if (formatError) {
        newErrors.confirmUserPassword = formatError;
      } else if (updatedData.userPassword && updatedData.confirmUserPassword && 
                 updatedData.userPassword !== updatedData.confirmUserPassword) {
        newErrors.confirmUserPassword = 'Passwords do not match';
      } else {
        newErrors.confirmUserPassword = '';
      }
      newErrors.userPassword = ''; // Clear main field error
    } else if (fieldName === 'supervisorPassword') {
      const formatError = validatePasswordFormat(updatedData.supervisorPassword);
      newErrors.supervisorPassword = formatError;
      newErrors.confirmSupervisorPassword = ''; // Clear confirm field error
    } else if (fieldName === 'confirmSupervisorPassword') {
      const formatError = validatePasswordFormat(updatedData.confirmSupervisorPassword);
      if (formatError) {
        newErrors.confirmSupervisorPassword = formatError;
      } else if (updatedData.supervisorPassword && updatedData.confirmSupervisorPassword && 
                 updatedData.supervisorPassword !== updatedData.confirmSupervisorPassword) {
        newErrors.confirmSupervisorPassword = 'Passwords do not match';
      } else {
        newErrors.confirmSupervisorPassword = '';
      }
      newErrors.supervisorPassword = ''; // Clear main field error
    }

    setPasswordErrors(newErrors);
  };

  // Fetch machines
  const fetchPerformanceStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/machine-performance', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceStats(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Performance Stats Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching performance stats:', error);
    }
  }, []);

  const fetchGraphData = useCallback(async (metric: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/machine-performance?graphData=true&metric=${metric}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphData([]);
    }
  }, []);

  const handleCardClick = (metric: 'quantity' | 'tests' | 'cleaning' | 'skip' | 'today' | 'uptime') => {
    setGraphMetric(metric);
    fetchGraphData(metric);
    setShowGraphModal(true);
  };

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/machine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Sort machines: BMC machines first, then master machines, then by ID
        const sortedMachines = (data.data || []).sort((a: Machine, b: Machine) => {
          // BMC machines come first
          if (a.bmcId && !b.bmcId) return -1;
          if (!a.bmcId && b.bmcId) return 1;
          // If both are BMC or both are not, master machines come next
          if (a.isMasterMachine && !b.isMasterMachine) return -1;
          if (!a.isMasterMachine && b.isMasterMachine) return 1;
          // If both are master or both are not, sort by ID
          return a.id - b.id;
        });
        setMachines(sortedMachines);
      } else {
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch machines');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setError('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch societies for dropdown
  const fetchSocieties = useCallback(async () => {
    try {
      setSocietiesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    } finally {
      setSocietiesLoading(false);
    }
  }, []);

  // Fetch machine types from superadmin
  const fetchMachineTypes = useCallback(async () => {
    try {
      setMachineTypesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/superadmin/machines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMachineTypes(data.data.machines || []);
      }
    } catch (error) {
      console.error('Error fetching machine types:', error);
    } finally {
      setMachineTypesLoading(false);
    }
  }, []);

  // Fetch dairies
  const fetchDairies = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/dairy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDairies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    }
  }, []);

  // Fetch BMCs
  const fetchBmcs = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/bmc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBmcs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMachines();
      fetchSocieties();
      fetchMachineTypes();
      fetchDairies();
      fetchBmcs();
      fetchPerformanceStats();
    }
  }, [user, fetchMachines, fetchSocieties, fetchMachineTypes, fetchDairies, fetchBmcs, fetchPerformanceStats]);

  // Sync connection state to DongleContext for Control Panel
  useEffect(() => {
    // Transform local BLEDevice type to context type
    const contextDevices = allBLEDevices.map(d => ({
      name: d.name,
      address: d.address,
      rssi: d.rssi,
      isPoornasree: isPoornasreeMachine(d.name),
      machineId: extractMachineId(d.name) || undefined
    }));
    
    // Debug log before injecting
    console.log('🔄 [Machine Management] Syncing to DongleContext:', {
      hasPort: !!connectedPort,
      verified: isDongleVerified,
      connectedMachines: Array.from(connectedBLEMachines),
      deviceCount: contextDevices.length,
    });
    
    injectConnection({
      port: connectedPort,
      writer: serialWriterRef.current,
      reader: serialReaderRef.current,
      verified: isDongleVerified,
      connectedMachines: connectedBLEMachines,
      machineIdMap: machineIdToDongleId,
      availableMachines: availableBLEMachines,
      devices: contextDevices
    });
  }, [
    connectedPort, isDongleVerified, connectedBLEMachines, 
    machineIdToDongleId, availableBLEMachines, allBLEDevices, injectConnection
  ]);

  // Global error handler for buffer overruns and other errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      const error = event.error || new Error(event.message);
      const errorMsg = error.message || 'Unknown error occurred';
      
      // Check if it's a buffer overrun
      if (errorMsg.includes('Buffer overrun') || errorMsg.includes('buffer')) {
        setSerialPortError('Console buffer overflow detected. Reducing log output. Please refresh if issues persist.');
      } else {
        setSerialPortError(`Error: ${errorMsg.substring(0, 200)}`);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const reason = event.reason;
      const errorMsg = reason?.message || String(reason) || 'Unhandled promise rejection';
      
      if (errorMsg.includes('Buffer overrun') || errorMsg.includes('buffer')) {
        setSerialPortError('Console buffer overflow detected. Please refresh the page.');
      } else {
        setSerialPortError(`Promise Error: ${errorMsg.substring(0, 200)}`);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Effect to fetch initial data on mount
  useEffect(() => {
    const initializeData = async () => {
      if (typeof navigator === 'undefined' || !navigator.serial) {
        console.log('⚠️ [Auto-connect] Web Serial API not available');
        return;
      }

      // Prevent multiple auto-connect attempts
      if (autoConnectAttemptedRef.current) {
        console.log('⚠️ [Auto-connect] Already attempted, skipping');
        return;
      }
      
      // Wait a bit to ensure any previous cleanup is complete (for hot reload)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      autoConnectAttemptedRef.current = true;
      setIsAutoConnecting(true);

      try {
        // Check for saved port configuration
        const savedConfigStr = localStorage.getItem('poornasree_hub_port');
        let savedConfig = null;
        
        if (savedConfigStr) {
          try {
            savedConfig = JSON.parse(savedConfigStr);
            console.log('💾 [Auto-connect] Found saved port config:', savedConfig);
          } catch {}
        }
        
        const ports = await navigator.serial.getPorts();
        console.log('🔌 [Auto-connect] Found', ports.length, 'previously granted ports');
        
        // Update serial ports list in UI
        setSerialPorts(ports);
        
        if (ports.length === 0) {
          console.log('ℹ️ [Auto-connect] No ports available, user must grant permission');
          setIsAutoConnecting(false);
          return;
        }
        
        // Don't skip if connectedPort is set - it might be stale state from refresh
        if (connectedPort) {
          console.log('⚠️ [Auto-connect] Port already connected, verifying...');
          // Verify it's actually connected and working
          if (serialWriterRef.current && isDongleVerifiedRef.current) {
            console.log('✅ [Auto-connect] Existing connection is valid');
            setIsAutoConnecting(false);
            return;
          } else {
            console.log('⚠️ [Auto-connect] Existing connection is stale, reconnecting...');
            // Clean up stale connection
            setConnectedPort(null);
            setIsDongleVerified(false);
            isDongleVerifiedRef.current = false;
          }
        }
        
        // If we have saved config, try to find matching port first
        if (savedConfig && savedConfig.vendorId && savedConfig.productId) {
          console.log('🔍 [Auto-connect] Looking for saved port (VID: 0x' + savedConfig.vendorId.toString(16) + ', PID: 0x' + savedConfig.productId.toString(16) + ')');
          
          for (const port of ports) {
            const info = port.getInfo();
            if (info.usbVendorId === savedConfig.vendorId && info.usbProductId === savedConfig.productId) {
              console.log('✅ [Auto-connect] Found matching saved port, connecting...');
              
              try {
                // Open the port
                await port.open({ baudRate: 115200 });
                setConnectedPort(port);
                
                // Wait for streams
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Create writer
                if (!port.writable) throw new Error('Writable stream not available');
                const writer = port.writable.getWriter();
                serialWriterRef.current = writer;
                
                // Start reader
                startDongleReader(port);
                
                // Send VERSION to verify
                await new Promise(resolve => setTimeout(resolve, 200));
                const versionData = new TextEncoder().encode('VERSION\n');
                await writer.write(versionData);
                
                // Wait for verification
                const verificationTimeout = 3000;
                const startTime = Date.now();
                while (!isDongleVerifiedRef.current && (Date.now() - startTime) < verificationTimeout) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                if (isDongleVerifiedRef.current) {
                  setSerialPortError(''); // Clear any errors from auto-connect
                  setSuccess('Poornasree HUB auto-connected!');
                  setTimeout(() => setSuccess(''), 3000);
                  
                  // Query existing BLE connections to restore UI state
                  console.log('🔍 [Auto-Connect] Querying existing BLE connections from dongle...');
                  setTimeout(async () => {
                    await queryExistingConnections();
                    
                    // Wait for LIST response to populate connected devices
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Then scan for new devices
                    console.log('🔍 [Auto-Connect] Scanning for BLE devices...');
                    handleBLEScan();
                  }, 800);
                  return;
                } else {
                  // Verification failed, disconnect
                  console.warn('⚠️ [Auto-connect] Saved port verification failed');
                  if (serialWriterRef.current) {
                    try { await serialWriterRef.current.releaseLock(); } catch {}
                    serialWriterRef.current = null;
                  }
                  if (serialReaderRef.current) {
                    try { await serialReaderRef.current.cancel(); } catch {}
                    serialReaderRef.current = null;
                  }
                  await port.close();
                  setConnectedPort(null);
                  // Clear saved config since it's not valid
                  localStorage.removeItem('poornasree_hub_port');
                }
              } catch (err) {
                console.warn('⚠️ [Auto-connect] Error with saved port:', err);
              }
              break;
            }
          }
        }
        
        // If no saved config or saved port failed, try to detect Poornasree HUB
        if (!connectedPort && ports.length > 0) {
          console.log('🔍 [Auto-connect] Scanning ports to detect Poornasree HUB...');
          
          // Wait a bit to ensure any cleanup is complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          for (const port of ports) {
            console.log('🔌 [Auto-connect] Testing port...');
            
            const isPoornasreeHub = await testPortIsPoornasreeHub(port);
            
            if (isPoornasreeHub) {
              console.log('✅ [Auto-connect] Found Poornasree HUB! Connecting...');
              
              try {
                // Open and connect (check if already open first)
                if (!port.readable) {
                  await port.open({ baudRate: 115200 });
                } else {
                  console.log('ℹ️ [Auto-connect] Port already open, reusing connection');
                }
                setConnectedPort(port);
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (!port.writable) throw new Error('Writable stream not available');
                const writer = port.writable.getWriter();
                serialWriterRef.current = writer;
                
                startDongleReader(port);
                
                // Send VERSION again to trigger verification state
                await new Promise(resolve => setTimeout(resolve, 200));
                const versionData = new TextEncoder().encode('VERSION\n');
                await writer.write(versionData);
                
                // Wait for verification
                const verificationTimeout = 3000;
                const startTime = Date.now();
                while (!isDongleVerifiedRef.current && (Date.now() - startTime) < verificationTimeout) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                if (isDongleVerifiedRef.current) {
                  // Save this port config
                  const info = port.getInfo();
                  const portConfig = {
                    vendorId: info.usbVendorId,
                    productId: info.usbProductId,
                    verified: true,
                    timestamp: Date.now()
                  };
                  localStorage.setItem('poornasree_hub_port', JSON.stringify(portConfig));
                  
                  setSerialPortError(''); // Clear any errors from detection
                  setSuccess('Poornasree HUB detected and connected!');
                  setTimeout(() => setSuccess(''), 3000);
                  
                  // Query existing connections then scan for new devices
                  console.log('🔍 [Auto-Connect] Querying existing BLE connections from dongle...');
                  setTimeout(async () => {
                    await queryExistingConnections();
                    
                    // Wait for LIST response
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Then scan for new devices
                    console.log('🔍 [Auto-Connect] Scanning for BLE devices...');
                    handleBLEScan();
                  }, 800);
                  return;
                }
              } catch (err: any) {
                console.warn('⚠️ [Auto-connect] Error connecting to detected port:', err);
                // If port is already open, try to close and retry once
                if (err.name === 'InvalidStateError' && err.message?.includes('already open')) {
                  console.log('🔄 [Auto-connect] Port stuck open, closing and retrying...');
                  try {
                    await port.close();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Don't retry here, will be handled by manual connect
                  } catch {}
                }
              }
              break;
            }
          }
          
          console.log('⚠️ [Auto-connect] No Poornasree HUB detected among available ports');
        }
      } catch (err) {
        console.error('❌ [Auto-connect] Error during auto-connect:', err);
        setSerialPortError('Auto-connect failed: ' + (err as Error).message);
        setTimeout(() => setSerialPortError(''), 5000);
      } finally {
        setIsAutoConnecting(false);
      }
    };

    // Enable auto-connect on page load with small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeData();
    }, 500); // Increased from 300ms to 500ms for better stability
    
    return () => clearTimeout(timer);
  }, []); // Run once on mount
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Use async IIFE for proper cleanup order
      (async () => {
        // Cancel reader first
        if (serialReaderRef.current) {
          try {
            await serialReaderRef.current.cancel();
            serialReaderRef.current = null;
          } catch (err) {
            console.warn('⚠️ [Cleanup] Error canceling reader:', err);
          }
        }
        
        // Release writer second
        if (serialWriterRef.current) {
          try {
            await serialWriterRef.current.releaseLock();
            serialWriterRef.current = null;
          } catch (err) {
            console.warn('⚠️ [Cleanup] Error releasing writer:', err);
          }
        }
        
        // Close port last
        if (connectedPort) {
          try {
            await connectedPort.close();
          } catch (err) {
            console.warn('⚠️ [Cleanup] Error closing port:', err);
          }
        }
      })();
    };
  }, [connectedPort]);

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      setSearchQuery(customEvent.detail.query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  
  // Close serial port dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serialPortDropdownRef.current && !serialPortDropdownRef.current.contains(event.target as Node)) {
        setSerialPortDropdownOpen(false);
      }
      if (bleDevicesDropdownRef.current && !bleDevicesDropdownRef.current.contains(event.target as Node)) {
        setBleDevicesDropdownOpen(false);
      }
      if (controlPanelDropdownRef.current && !controlPanelDropdownRef.current.contains(event.target as Node)) {
        setControlPanelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset machine filter when society filter changes (similar to farmer management)
  useEffect(() => {
    if (societyFilter.length > 0 && machineFilter.length > 0) {
      // Check if current machine selections are still valid for the selected societies
      const validMachineIds = machines
        .filter(m => societyFilter.includes(m.societyId?.toString() || ''))
        .map(m => m.id?.toString() || '');
      
      const filteredMachineFilter = machineFilter.filter(id => validMachineIds.includes(id));
      if (filteredMachineFilter.length !== machineFilter.length) {
        setMachineFilter(filteredMachineFilter);
      }
    }
  }, [societyFilter, machineFilter, machines]);

  // Read URL parameters and initialize filters on mount
  useEffect(() => {
    const societyId = searchParams.get('societyId');
    const societyName = searchParams.get('societyName');
    const dairyFilterParam = searchParams.get('dairyFilter');
    
    if (societyId && !societyFilter.includes(societyId)) {
      setSocietyFilter([societyId]);
      
      // Show success message with society name
      if (societyName) {
        setSuccess(`Filter Applied: ${decodeURIComponent(societyName)}`);
      }
    }
    
    if (dairyFilterParam && !dairyFilter.includes(dairyFilterParam)) {
      setDairyFilter([dairyFilterParam]);
      setSuccess('Filter Applied: Dairy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.machineId || !formData.machineId.trim()) {
      setError('Please enter a machine ID.');
      setSuccess('');
      return;
    }

    if (!formData.machineType || !formData.machineType.trim()) {
      setError('Please select a machine type.');
      setSuccess('');
      return;
    }

    if (!formData.societyId && !formData.bmcId) {
      setError('Please select a society or BMC for the machine.');
      setSuccess('');
      return;
    }

    // Validate phone number if provided
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneValidation = validateIndianPhone(formData.contactPhone);
      if (!phoneValidation.isValid) {
        setFieldErrors({ ...fieldErrors, contactPhone: phoneValidation.error || 'Invalid phone number' });
        setError('Please fix the phone number error before saving.');
        setSuccess('');
        return;
      }
    }

    // Clear field errors if validation passes
    setFieldErrors({});
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData(initialFormData);
        setSuccess('Machine created successfully');
        setError('');
        fetchMachines();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to create machine';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
          if (errorMessage.toLowerCase().includes('in this society')) {
            setFieldErrors({ machineId: 'This Machine ID already exists in the selected society' });
          } else {
            setFieldErrors({ machineId: 'This Machine ID already exists' });
          }
        } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ machineType: 'This Machine type already exists for this society' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error creating machine:', error);
      setError('Error creating machine. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    // Validate required fields
    if (!formData.machineId || !formData.machineId.trim()) {
      setError('Please enter a machine ID.');
      setSuccess('');
      return;
    }

    if (!formData.machineType || !formData.machineType.trim()) {
      setError('Please select a machine type.');
      setSuccess('');
      return;
    }

    if (!formData.societyId && !formData.bmcId) {
      setError('Please select a society or BMC for the machine.');
      setSuccess('');
      return;
    }

    // Validate phone number if provided
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneValidation = validateIndianPhone(formData.contactPhone);
      if (!phoneValidation.isValid) {
        setFieldErrors({ ...fieldErrors, contactPhone: phoneValidation.error || 'Invalid phone number' });
        setError('Please fix the phone number error before saving.');
        setSuccess('');
        return;
      }
    }

    // Clear field errors if validation passes
    setFieldErrors({});
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedMachine.id, ...formData })
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedMachine(null);
        setFormData(initialFormData);
        setSuccess('Machine updated successfully');
        setError('');
        fetchMachines();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update machine';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
          if (errorMessage.toLowerCase().includes('in this society')) {
            setFieldErrors({ machineId: 'This Machine ID already exists in the selected society' });
          } else {
            setFieldErrors({ machineId: 'This Machine ID already exists' });
          }
        } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ machineType: 'This Machine type already exists for this society' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      setError('Error updating machine. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMachine) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/user/machine?id=${selectedMachine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine deleted successfully!');
        await fetchMachines();
        setShowDeleteModal(false);
        setSelectedMachine(null);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError('Failed to delete machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle society folder expansion
  const toggleSocietyExpansion = (uniqueKey: string) => {
    setExpandedSocieties(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(uniqueKey)) {
        newExpanded.delete(uniqueKey);
      } else {
        newExpanded.add(uniqueKey);
      }
      return newExpanded;
    });
  };

  // Expand all societies
  const expandAllSocieties = () => {
    const allSocietyIds = new Set(
      machines
        .filter(m => m.societyId)
        .map(m => `society_${m.societyId}`)
    );
    setExpandedSocieties(allSocietyIds);
  };

  // Collapse all societies
  const collapseAllSocieties = () => {
    setExpandedSocieties(new Set());
  };

  // Handle individual machine selection
  const handleSelectMachine = (machineId: number) => {
    setSelectedMachines(prev => {
      const newSelected = new Set(prev);
      const isDeselecting = newSelected.has(machineId);
      
      if (isDeselecting) {
        newSelected.delete(machineId);
        
        // When deselecting a machine, uncheck selectAll
        setSelectAll(false);
        
        // Check if we should deselect the society folder
        const machine = filteredMachines.find(m => m.id === machineId);
        if (machine && machine.societyId) {
          const societyId = machine.societyId;
          const societyMachines = filteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => 
            m.id === machineId ? false : newSelected.has(m.id)
          );
          
          // If not all machines in the society are selected, deselect the society folder
          if (!allSocietyMachinesSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.delete(societyId);
              return updatedSocieties;
            });
          }
        }
      } else {
        newSelected.add(machineId);
        
        // Check if the society folder should be selected
        const machine = filteredMachines.find(m => m.id === machineId);
        if (machine && machine.societyId) {
          const societyId = machine.societyId;
          const societyMachines = filteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => 
            m.id === machineId ? true : newSelected.has(m.id)
          );
          
          // If all machines in the society are now selected, select the society folder
          if (allSocietyMachinesSelected) {
            setSelectedSocieties(prevSocieties => {
              const updatedSocieties = new Set(prevSocieties);
              updatedSocieties.add(societyId);
              return updatedSocieties;
            });
          }
        }
        
        // Check if all filtered machines are now selected
        const allFilteredIds = new Set(filteredMachines.map(m => m.id));
        const allSelected = Array.from(allFilteredIds).every(id => 
          id === machineId ? true : newSelected.has(id)
        );
        
        if (allSelected) {
          setSelectAll(true);
        }
      }
      
      return newSelected;
    });
  };

  // Toggle society selection with machine auto-selection
  const toggleSocietySelection = (societyId: number, machineIds: number[]) => {
    setSelectedSocieties(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(societyId)) {
        // Deselect society and all its machines
        newSelected.delete(societyId);
        setSelectedMachines(prevMachines => {
          const updatedMachines = new Set(prevMachines);
          machineIds.forEach(id => updatedMachines.delete(id));
          
          // Check if we should unset selectAll
          setSelectAll(false);
          
          return updatedMachines;
        });
      } else {
        // Select society and all its machines
        newSelected.add(societyId);
        setSelectedMachines(prevMachines => {
          const updatedMachines = new Set(prevMachines);
          machineIds.forEach(id => updatedMachines.add(id));
          
          // Check if all filtered machines are now selected
          const allFilteredIds = new Set(filteredMachines.map(m => m.id));
          const allSelected = Array.from(allFilteredIds).every(id => updatedMachines.has(id));
          if (allSelected) {
            setSelectAll(true);
          }
          
          return updatedMachines;
        });
      }
      return newSelected;
    });
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMachines(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
    } else {
      // Select only the currently filtered machines
      setSelectedMachines(new Set(filteredMachines.map(m => m.id)));
      
      // Also select all societies that have machines in the filtered list
      const machinesBySociety = filteredMachines.reduce((acc, machine) => {
        const societyId = machine.societyId || 0;
        if (!acc.includes(societyId)) {
          acc.push(societyId);
        }
        return acc;
      }, [] as number[]);
      setSelectedSocieties(new Set(machinesBySociety));
      
      setSelectAll(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMachines.size === 0) return;

    // Close the confirmation modal immediately and show LoadingSnackbar
    setShowDeleteConfirm(false);
    setIsDeletingBulk(true);
    setUpdateProgress(0);
    
    try {
      const token = localStorage.getItem('authToken');
      setUpdateProgress(10);
      
      const ids = Array.from(selectedMachines);
      setUpdateProgress(20);
      
      const response = await fetch(`/api/user/machine?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUpdateProgress(60);

      if (response.ok) {
        setUpdateProgress(80);
        await fetchMachines(); // Refresh the list
        setUpdateProgress(95);
        setSelectedMachines(new Set());
        setSelectedSocieties(new Set());
        setSelectAll(false);
        setSuccess(`Successfully deleted ${ids.length} machine(s)${(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0) ? ' from filtered results' : ''}`);
        setError('');
        setUpdateProgress(100);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete selected machines');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting machines:', error);
      setError('Error deleting selected machines');
      setSuccess('');
    } finally {
      setIsDeletingBulk(false);
      setUpdateProgress(0);
    }
  };



  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus?: string) => {
    if (selectedMachines.size === 0) return;

    const statusToUpdate = newStatus || bulkStatus;
    setIsUpdatingStatus(true);
    setUpdateProgress(0);

    try {
      // Step 1: Get token (5%)
      const token = localStorage.getItem('authToken');
      setUpdateProgress(5);
      
      // Step 2: Prepare machine IDs (10%)
      const machineIds = Array.from(selectedMachines);
      const totalMachines = machineIds.length;
      setUpdateProgress(10);
      
      // Step 3: Single bulk update API call (10% to 90%)
      setUpdateProgress(30);
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bulkStatusUpdate: true,
          machineIds: machineIds,
          status: statusToUpdate
        })
      });

      setUpdateProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update machine status');
      }

      const result = await response.json();
      const updatedCount = result.data?.updated || totalMachines;
      
      // Step 4: Refresh data (90%)
      setUpdateProgress(90);
      await fetchMachines();
      
      // Step 5: Finalize (100%)
      setUpdateProgress(100);
      setSelectedMachines(new Set());
      setSelectedSocieties(new Set());
      setSelectAll(false);
      
      setSuccess(
        `Successfully updated status to "${statusToUpdate}" for ${updatedCount} machine(s)${
          (statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0) ? ' from filtered results' : ''
        }`
      );
      setError('');

    } catch (error) {
      console.error('Error updating machine status:', error);
      setUpdateProgress(100);
      setError(error instanceof Error ? error.message : 'Error updating machine status. Please try again.');
      setSuccess('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Clear selections when filters or search change or keep only visible machines
  useEffect(() => {
    // Recalculate filtered machines
    const currentFilteredMachines = machines.filter(machine => {
      const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
      const societyMatch = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
      const searchMatch = searchQuery === '' || 
        machine.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.machineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.operatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && societyMatch && searchMatch;
    });

    if (selectedMachines.size > 0) {
      // Keep only machines that are still visible after filtering/searching
      const visibleMachineIds = new Set(currentFilteredMachines.map(m => m.id));
      const updatedSelection = new Set(
        Array.from(selectedMachines).filter(id => visibleMachineIds.has(id))
      );
      
      if (updatedSelection.size !== selectedMachines.size) {
        setSelectedMachines(updatedSelection);
        setSelectAll(false);
        
        // Update society selections based on remaining selected machines
        const visibleSocietyIds = new Set(currentFilteredMachines.map(m => m.societyId).filter(Boolean));
        const updatedSocietySelection = new Set<number>();
        
        visibleSocietyIds.forEach(societyId => {
          const societyMachines = currentFilteredMachines.filter(m => m.societyId === societyId);
          const allSocietyMachinesSelected = societyMachines.every(m => updatedSelection.has(m.id));
          if (allSocietyMachinesSelected && societyMachines.length > 0) {
            updatedSocietySelection.add(societyId as number);
          }
        });
        
        setSelectedSocieties(updatedSocietySelection);
      }
    } else {
      setSelectAll(false);
      setSelectedSocieties(new Set());
    }
  }, [statusFilter, societyFilter, searchQuery, machines, selectedMachines]);

  // Handle status change
  const handleStatusChange = async (machine: Machine, newStatus: 'active' | 'inactive' | 'maintenance' | 'suspended') => {
    setIsUpdatingStatus(true);
    setUpdateProgress(0);
    try {
      // Step 1: Get token (10%)
      setUpdateProgress(10);
      const token = localStorage.getItem('authToken');
      
      // Step 2: Prepare request (20%)
      setUpdateProgress(20);
      
      // Step 3: Build request body (30%)
      const requestBody = {
        id: machine.id,
        machineId: machine.machineId,
        machineType: machine.machineType,
        societyId: machine.societyId,
        location: machine.location,
        installationDate: machine.installationDate,
        operatorName: machine.operatorName,
        contactPhone: machine.contactPhone,
        status: newStatus,
        notes: machine.notes
      };
      setUpdateProgress(30);
      
      // Step 4: Send API request (60%)
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      setUpdateProgress(60);

      // Step 5: Process response (80%)
      setUpdateProgress(80);
      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        // Step 6: Refresh data (100%)
        await fetchMachines();
        setUpdateProgress(100);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update status';
        setUpdateProgress(100);
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateProgress(100);
      setError('Failed to update status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Utility functions
  const getPasswordStatusDisplay = (statusU: 0 | 1, statusS: 0 | 1, userPassword?: string, supervisorPassword?: string) => {
    // Check if both passwords are set (not null/empty)
    const hasUserPassword = userPassword && userPassword.trim() !== '';
    const hasSupervisorPassword = supervisorPassword && supervisorPassword.trim() !== '';
    
    const details = [];
    
    // User password detail
    if (hasUserPassword) {
      const userStatus = statusU === 0 ? '✓' : '';
      const userClassName = statusU === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400';
      details.push({
        icon: <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
        text: `User ${userStatus}`,
        className: userClassName
      });
    }
    
    // Supervisor password detail
    if (hasSupervisorPassword) {
      const supervisorStatus = statusS === 0 ? '✓' : '';
      const supervisorClassName = statusS === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400';
      details.push({
        icon: <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
        text: `Supervisor ${supervisorStatus}`,
        className: supervisorClassName
      });
    }
    
    return details;
  };

  // Modal management
  const openAddModal = () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    setFormData({
      ...initialFormData,
      installationDate: currentDate
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleEditClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setFormData({
      machineId: machine.machineId,
      machineType: machine.machineType,
      societyId: machine.societyId ? machine.societyId.toString() : '',
      bmcId: machine.bmcId ? machine.bmcId.toString() : '',
      assignmentType: machine.bmcId ? 'bmc' : 'society',
      location: machine.location || '',
      installationDate: machine.installationDate || '',
      operatorName: machine.operatorName || '',
      contactPhone: machine.contactPhone || '',
      status: machine.status,
      notes: machine.notes || '',
      setAsMaster: false,
      disablePasswordInheritance: false
    });
    setFieldErrors({}); // Clear field errors
    setError(''); // Clear general errors
    setShowEditForm(true);
  };

  const handleDeleteClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDeleteModal(true);
  };

  const handlePasswordSettingsClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setPasswordData({
      userPassword: '',
      supervisorPassword: '',
      confirmUserPassword: '',
      confirmSupervisorPassword: ''
    });
    setShowPasswordModal(true);
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setSelectedMachine(null);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMachine(null);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      userPassword: '',
      supervisorPassword: '',
      confirmUserPassword: '',
      confirmSupervisorPassword: ''
    });
    setPasswordErrors({
      userPassword: '',
      confirmUserPassword: '',
      supervisorPassword: '',
      confirmSupervisorPassword: ''
    });
    setError('');
    setSuccess('');
    setSelectedMachine(null);
    setApplyPasswordsToOthers(false);
    setSelectedMachinesForPassword(new Set());
    setSelectAllMachinesForPassword(false);
  };

  // Handle show password request
  const handleShowPasswordClick = (machine: Machine) => {
    setMachineToShowPassword(machine);
    setShowPasswordViewModal(true);
    setAdminPasswordForView('');
    setViewPasswordError('');
    setRevealedPasswords(null);
  };

  // Handle admin password verification and show passwords
  const handleVerifyAndShowPasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineToShowPassword || !adminPasswordForView) {
      setViewPasswordError('Please enter your admin password');
      return;
    }

    setViewingPasswords(true);
    setViewPasswordError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/machine/${machineToShowPassword.id}/show-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminPassword: adminPasswordForView
        })
      });

      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === 'Invalid admin password') {
          setViewPasswordError('Invalid admin password. Please try again.');
        } else {
          localStorage.removeItem('authToken');
          router.push('/login');
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setViewPasswordError(errorData.error || 'Failed to retrieve passwords');
        return;
      }

      const result = await response.json();
      setRevealedPasswords({
        userPassword: result.data.userPassword,
        supervisorPassword: result.data.supervisorPassword
      });
      setAdminPasswordForView(''); // Clear admin password after successful verification

    } catch (error) {
      console.error('Error retrieving passwords:', error);
      setViewPasswordError('Failed to retrieve passwords. Please try again.');
    } finally {
      setViewingPasswords(false);
    }
  };

  // Close show password modal
  const closePasswordViewModal = () => {
    setShowPasswordViewModal(false);
    setAdminPasswordForView('');
    setViewPasswordError('');
    setRevealedPasswords(null);
    setMachineToShowPassword(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    // Clear previous errors
    setError('');

    // Check for live validation errors
    const hasErrors = Object.values(passwordErrors).some(error => error !== '');
    if (hasErrors) {
      setError('Please fix password validation errors before submitting');
      return;
    }

    if (!passwordData.userPassword && !passwordData.supervisorPassword) {
      setError('At least one password must be provided');
      return;
    }

    // Ensure passwords are confirmed when provided
    if (passwordData.userPassword && !passwordData.confirmUserPassword) {
      setError('Please confirm the user password');
      return;
    }

    if (passwordData.userPassword && passwordData.confirmUserPassword && 
        passwordData.userPassword !== passwordData.confirmUserPassword) {
      setError('User passwords do not match');
      return;
    }

    if (passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) {
      setError('Please confirm the supervisor password');
      return;
    }

    if (passwordData.supervisorPassword && passwordData.confirmSupervisorPassword && 
        passwordData.supervisorPassword !== passwordData.confirmSupervisorPassword) {
      setError('Supervisor passwords do not match');
      return;
    }

    // Validate password format (must be 6 digits)
    if (passwordData.userPassword) {
      const userPwdError = validatePasswordFormat(passwordData.userPassword);
      if (userPwdError) {
        setError(`User password: ${userPwdError}`);
        return;
      }
    }

    if (passwordData.supervisorPassword) {
      const supervisorPwdError = validatePasswordFormat(passwordData.supervisorPassword);
      if (supervisorPwdError) {
        setError(`Supervisor password: ${supervisorPwdError}`);
        return;
      }
    }

    // Check if applying to others and validate selection
    if (applyPasswordsToOthers && selectedMachinesForPassword.size === 0) {
      setError('Please select at least one machine to apply passwords to');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Update the master machine first
      const response = await fetch(`/api/user/machine/${selectedMachine.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userPassword: passwordData.userPassword || null,
          supervisorPassword: passwordData.supervisorPassword || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update passwords';
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // If applying to other machines, update them as well
      if (applyPasswordsToOthers && selectedMachinesForPassword.size > 0) {
        const updatePromises = Array.from(selectedMachinesForPassword).map(async (machineId) => {
          const updateResponse = await fetch(`/api/user/machine/${machineId}/password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userPassword: passwordData.userPassword || null,
              supervisorPassword: passwordData.supervisorPassword || null,
            }),
          });
          return updateResponse.ok;
        });

        await Promise.all(updatePromises);
        setSuccess(`Passwords updated for master machine and ${selectedMachinesForPassword.size} other machine(s)!`);
      } else {
        setSuccess('Machine passwords updated successfully!');
      }

      await fetchMachines();
      closePasswordModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating passwords:', error);
      setError('Failed to update passwords. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter machines with multi-field search
  const filteredMachines = machines.filter(machine => {
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    
    // Get society's BMC and dairy
    const machineSociety = societies.find(s => s.id === machine.societyId);
    const machineBmc = machineSociety?.bmc_id ? bmcs.find(b => b.id === machineSociety.bmc_id) : null;
    const machineDairy = machineBmc?.dairyFarmId ? dairies.find(d => d.id === machineBmc.dairyFarmId) : null;
    
    const matchesDairy = dairyFilter.length === 0 || dairyFilter.includes(machineDairy?.id.toString() || '');
    const matchesBmc = bmcFilter.length === 0 || bmcFilter.includes(machineBmc?.id.toString() || '');
    const matchesSociety = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
    const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
    
    // Multi-field search across machine details (case-insensitive)
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = searchLower === '' || [
      machine.machineId,
      machine.machineType,
      machine.societyName,
      machine.societyIdentifier,
      machine.location,
      machine.operatorName,
      machine.contactPhone,
      machine.notes
    ].some(field => 
      field?.toString().toLowerCase().includes(searchLower)
    );
    
    return matchesStatus && matchesDairy && matchesBmc && matchesSociety && matchesMachine && matchesSearch;
  });

  // Filter societies to only show those with machines in the current filtered list
  const availableSocieties = useMemo(() => {
    // Get unique society IDs from machines based on current status, search, and machine type filters
    const machinesForSocietyFilter = machines.filter(machine => {
      const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
      const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
      
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchLower === '' || [
        machine.machineId,
        machine.machineType,
        machine.societyName,
        machine.societyIdentifier,
        machine.location,
        machine.operatorName,
        machine.contactPhone,
        machine.notes
      ].some(field => 
        field?.toString().toLowerCase().includes(searchLower)
      );
      
      return matchesStatus && matchesMachine && matchesSearch;
    });

    const societyIdsWithMachines = new Set(
      machinesForSocietyFilter
        .map(m => m.societyId)
        .filter(Boolean)
    );

    return societies.filter(society => societyIdsWithMachines.has(society.id));
  }, [machines, societies, searchQuery, statusFilter, machineFilter]);

  return (
    <>
    {/* Loading Snackbar for Status Updates - Bottom Right Corner */}
    {isUpdatingStatus && (
      <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FlowerSpinner size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Updating status...
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Please wait
            </p>
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {updateProgress}%
            </p>
          </div>
        </div>
      </div>
    )}
    
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8">
      
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Machine Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Manage dairy equipment and machinery across societies
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={openAddModal}
              className="flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </button>
            
            <button
              onClick={() => router.push('/admin/machine/statistics')}
              className="flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </button>
            
            {/* BLE Devices Dropdown - Only shown when port connected */}
            {connectedPort && (
              <div ref={bleDevicesDropdownRef} className="relative">
                {/* Devices Button - Opens dropdown without scanning */}
                <button
                  onClick={() => {
                    const newState = !bleDevicesDropdownOpen;
                    setBleDevicesDropdownOpen(newState);
                    // Query existing connections when opening dropdown
                    if (newState) {
                      queryExistingConnections();
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
                  </svg>
                  <span>Devices</span>
                  {allBLEDevices.filter(d => isPoornasreeMachine(d.name)).length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {allBLEDevices.filter(d => isPoornasreeMachine(d.name)).length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${bleDevicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* BLE Devices Dropdown */}
                {bleDevicesDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {/* Header with Scan Button */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Poornasree Machines ({allBLEDevices.filter(d => isPoornasreeMachine(d.name)).length})
                        </p>
                        <div className="flex items-center gap-2">
                          {/* Scan/Stop Scan Button */}
                          <button
                            onClick={() => {
                              if (bleScanning) {
                                handleStopScan();
                              } else {
                                handleBLEScan();
                              }
                            }}
                            disabled={!isDongleVerified || !connectedPort}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-200 ${
                              !isDongleVerified || !connectedPort
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
                                : bleScanning
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                            }`}
                            title={!isDongleVerified || !connectedPort ? 'Connect to Poornasree HUB first' : ''}
                          >
                            {bleScanning ? (
                              <>
                                <FlowerSpinner size={14} />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Scan</span>
                              </>
                            )}
                          </button>
                          {/* Connect All Button */}
                          <button
                            onClick={handleConnectAll}
                            disabled={connectingAll || !isDongleVerified || !connectedPort || allBLEDevices.filter(d => isPoornasreeMachine(d.name)).length === 0 || bleScanning}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={connectingAll ? `Connecting ${connectAllProgress.current}/${connectAllProgress.total}...` : (!isDongleVerified || !connectedPort ? 'Connect to Poornasree HUB first' : 'Connect to all available devices')}
                          >
                            {connectingAll ? (
                              <>
                                <FlowerSpinner size={12} />
                                <span>{connectAllProgress.current}/{connectAllProgress.total}</span>
                              </>
                            ) : (
                              <span>All</span>
                            )}
                          </button>
                          {/* Disconnect All Button */}
                          <button
                            onClick={handleDisconnectAll}
                            className="px-1.5 py-1 text-[10px] font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded transition-all duration-200"
                            title="Disconnect all devices"
                          >
                            DC
                          </button>
                          {/* Close Button */}
                          <button
                            onClick={() => setBleDevicesDropdownOpen(false)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Device List or Empty State */}
                    {allBLEDevices.length > 0 ? (
                      <div className="py-1">
                        {allBLEDevices
                          .filter(device => isPoornasreeMachine(device.name)) // Only show Poornasree/Lactosure devices
                          .sort((a, b) => b.rssi - a.rssi) // Sort by signal strength
                          .map((device, index) => {
                          const machineIdMatch = device.name.match(/(\d+)/);
                          const machineId = machineIdMatch ? machineIdMatch[1] : null;
                          const isConnected = machineId && connectedBLEMachines.has(machineId);
                          const isConnecting = machineId && bleConnectingMachine === machineId;
                          
                          return (
                            <div
                              key={device.address}
                              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0 bg-emerald-50/50 dark:bg-emerald-900/10"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      device.rssi > -60 ? 'bg-green-500' :
                                      device.rssi > -75 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                    <p className="text-sm font-medium truncate text-emerald-700 dark:text-emerald-400">
                                      {device.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className={`text-xs font-semibold ${
                                      device.rssi > -60 ? 'text-green-600 dark:text-green-400' :
                                      device.rssi > -75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {device.rssi} dBm
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      {device.rssi > -60 ? 'Excellent' :
                                       device.rssi > -75 ? 'Good' : 'Weak'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (machineId) {
                                      if (isConnected) {
                                        handleBLEDisconnect(machineId);
                                      } else {
                                        handleBLEConnect(machineId, device.address);
                                      }
                                    }
                                  }}
                                  disabled={!machineId || isConnecting}
                                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                                    isConnected
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                      : isConnecting
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-wait'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {isConnecting ? (
                                    <>
                                      <FlowerSpinner size={14} />
                                      <span>Connecting...</span>
                                    </>
                                  ) : isConnected ? (
                                    'Disconnect'
                                  ) : (
                                    'Connect'
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 px-4 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No devices found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Click the Scan button above to discover Poornasree machines</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Serial Port Dropdown */}
            <div ref={serialPortDropdownRef} className="relative">
              <button
                onClick={handleSerialPortClick}
                disabled={isAutoConnecting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-wait"
              >
                {isAutoConnecting ? (
                  <FlowerSpinner size={16} />
                ) : (
                  <Cable className="w-4 h-4" />
                )}
                <span>{isAutoConnecting ? 'Connecting...' : 'Port'}</span>
                {connectedPort && !isAutoConnecting && (
                  <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                    ✓
                  </span>
                )}
                {!isAutoConnecting && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${serialPortDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {serialPortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Cable className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Serial Port Connection
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {connectedPort ? 'Connected device (1 port allowed)' : 'No device connected'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSerialPortDropdownOpen(false)}
                        className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Close"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {serialPortError && (
                    <div className="p-3 mx-3 mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700 dark:text-red-300 whitespace-pre-line">{serialPortError}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Auto-connecting Message */}
                  {isAutoConnecting && (
                    <div className="p-3 mx-3 mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FlowerSpinner size={16} />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          Auto-connecting to Poornasree HUB...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ports List */}
                  <div className="flex-1 overflow-y-auto p-3">
                    {loadingPorts || isAutoConnecting ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <FlowerSpinner size={24} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          {isAutoConnecting ? 'Auto-connecting...' : 'Loading...'}
                        </p>
                      </div>
                    ) : connectedPort ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                              <Cable className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {getPortInfo(connectedPort)}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                                  Connected
                                </span>
                                <button
                                  onClick={() => handleDisconnectPort(connectedPort)}
                                  disabled={loadingPorts}
                                  className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Cable className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No port connected</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                          {serialPorts.length > 0 
                            ? 'Auto-connect did not find Poornasree HUB' 
                            : 'Click below to connect a device'}
                        </p>
                        {serialPorts.length > 0 && !connectedPort && (
                          <button
                            onClick={retryAutoConnect}
                            className="px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            Retry Auto-Connect
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                      onClick={handleRequestPort}
                      disabled={loadingPorts || !!connectedPort}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                    >
                      <Plus className="w-4 h-4" />
                      {connectedPort ? 'Port Already Connected' : 'Connect Port'}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Only one port can be connected at a time
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchMachines}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg shadow-gray-500/25"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

        {/* Success/Error Messages */}
        <StatusMessage 
          success={success} 
          error={error}
        />

        {/* Performance Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <div 
              onClick={() => performanceStats.topCollector && handleCardClick('quantity')}
              className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 ${performanceStats.topCollector ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Top Collector (30d)</h3>
                <Droplets className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              {performanceStats.topCollector ? (
                <>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200 truncate">{performanceStats.topCollector.machine.machineId}</p>
                  <p className="text-xs text-green-700 dark:text-green-300 truncate">{performanceStats.topCollector.machine.machineType}</p>
                  {performanceStats.topCollector.machine.societyName && (
                    <p className="text-xs text-green-600 dark:text-green-400 truncate">{performanceStats.topCollector.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">{performanceStats.topCollector.totalQuantity.toFixed(2)} L</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.mostTests && handleCardClick('tests')}
              className={`bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 ${performanceStats.mostTests ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Most Tests (30d)</h3>
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              {performanceStats.mostTests ? (
                <>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200 truncate">{performanceStats.mostTests.machine.machineId}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 truncate">{performanceStats.mostTests.machine.machineType}</p>
                  {performanceStats.mostTests.machine.societyName && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 truncate">{performanceStats.mostTests.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">{performanceStats.mostTests.totalTests} Tests</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.bestCleaning && handleCardClick('cleaning')}
              className={`bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 ${performanceStats.bestCleaning ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Best Cleaning (30d)</h3>
                <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              {performanceStats.bestCleaning ? (
                <>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200 truncate">{performanceStats.bestCleaning.machine.machineId}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 truncate">{performanceStats.bestCleaning.machine.machineType}</p>
                  {performanceStats.bestCleaning.machine.societyName && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 truncate">{performanceStats.bestCleaning.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{performanceStats.bestCleaning.totalCleanings} Cleanings</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.mostCleaningSkip && handleCardClick('skip')}
              className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 ${performanceStats.mostCleaningSkip ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Most Cleaning Skip (30d)</h3>
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              {performanceStats.mostCleaningSkip ? (
                <>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200 truncate">{performanceStats.mostCleaningSkip.machine.machineId}</p>
                  <p className="text-xs text-red-700 dark:text-red-300 truncate">{performanceStats.mostCleaningSkip.machine.machineType}</p>
                  {performanceStats.mostCleaningSkip.machine.societyName && (
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">{performanceStats.mostCleaningSkip.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">{performanceStats.mostCleaningSkip.totalSkips} Skips</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.activeToday && handleCardClick('today')}
              className={`bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 ${performanceStats.activeToday ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Active Today</h3>
                <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              {performanceStats.activeToday ? (
                <>
                  <p className="text-lg font-bold text-pink-800 dark:text-pink-200 truncate">{performanceStats.activeToday.machine.machineId}</p>
                  <p className="text-xs text-pink-700 dark:text-pink-300 truncate">{performanceStats.activeToday.machine.machineType}</p>
                  {performanceStats.activeToday.machine.societyName && (
                    <p className="text-xs text-pink-600 dark:text-pink-400 truncate">{performanceStats.activeToday.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-pink-600 dark:text-pink-400 mt-1">{performanceStats.activeToday.collectionsToday} Today</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
            
            <div 
              onClick={() => performanceStats.highestUptime && handleCardClick('uptime')}
              className={`bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 ${performanceStats.highestUptime ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Highest Uptime (30d)</h3>
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {performanceStats.highestUptime ? (
                <>
                  <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 truncate">{performanceStats.highestUptime.machine.machineId}</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 truncate">{performanceStats.highestUptime.machine.machineType}</p>
                  {performanceStats.highestUptime.machine.societyName && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">{performanceStats.highestUptime.machine.societyName}</p>
                  )}
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{performanceStats.highestUptime.activeDays} Days</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available</p>
              )}
            </div>
          </div>

        {/* Status Stats Cards */}
        <StatsGrid
          allItems={machines}
          filteredItems={filteredMachines}
          hasFilters={statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0}
          onStatusFilterChange={(status) => setStatusFilter(status)}
          currentStatusFilter={statusFilter}
        />

        {/* Filter Controls */}
        <FilterDropdown
          statusFilter={statusFilter}
          onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
          dairyFilter={dairyFilter}
          onDairyChange={(value) => setDairyFilter(Array.isArray(value) ? value : [value])}
          bmcFilter={bmcFilter}
          onBmcChange={(value) => setBmcFilter(Array.isArray(value) ? value : [value])}
          societyFilter={societyFilter}
          onSocietyChange={(value) => setSocietyFilter(Array.isArray(value) ? value : [value])}
          machineFilter={machineFilter}
          onMachineChange={(value) => setMachineFilter(Array.isArray(value) ? value : [value])}
          dairies={dairies}
          bmcs={bmcs}
          societies={availableSocieties}
          machines={machines}
          filteredCount={filteredMachines.length}
          totalCount={machines.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          icon={<Settings className="w-5 h-5" />}
          hideMainFilterButton={true}
        />

      {/* Select All and View Mode Controls */}
      {filteredMachines.length > 0 && (
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Select All Control - Left Side */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select All {filteredMachines.length} {filteredMachines.length === 1 ? 'machine' : 'machines'}
              {(statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) && ` (filtered)`}
            </span>
          </label>

          {/* View Mode Toggle - Right Side */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              folderLabel="Folder View"
              listLabel="Grid View"
            />
          </div>
        </div>
      )}

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <FlowerSpinner size={40} />
          </div>
        ) : filteredMachines.length > 0 ? (
          viewMode === 'folder' ? (
            // Folder View - Grouped by Society or BMC
            <div className="space-y-4">
              {(() => {
                // Group machines by society or BMC
                const machinesBySociety = filteredMachines.reduce((acc, machine) => {
                  let groupId: number;
                  let groupName: string;
                  let groupIdentifier: string;
                  let groupType: 'society' | 'bmc';
                  
                  if (machine.bmcId) {
                    // Machine assigned to BMC
                    groupId = machine.bmcId;
                    groupName = machine.bmcName || 'Unknown BMC';
                    groupIdentifier = machine.bmcIdentifier || 'N/A';
                    groupType = 'bmc';
                  } else if (machine.societyId) {
                    // Machine assigned to Society
                    groupId = machine.societyId;
                    groupName = machine.societyName || 'Unknown Society';
                    groupIdentifier = machine.societyIdentifier || 'N/A';
                    groupType = 'society';
                  } else {
                    // Unassigned (shouldn't happen but handle it)
                    groupId = 0;
                    groupName = 'Unassigned';
                    groupIdentifier = 'N/A';
                    groupType = 'society';
                  }
                  
                  const key = `${groupType}_${groupId}`;
                  if (!acc[key]) {
                    acc[key] = {
                      id: groupId,
                      name: groupName,
                      identifier: groupIdentifier,
                      type: groupType,
                      machines: []
                    };
                  }
                  acc[key].machines.push(machine);
                  return acc;
                }, {} as Record<string, {id: number; name: string; identifier: string; type: 'society' | 'bmc'; machines: Machine[]}>);

                const societyGroups = Object.values(machinesBySociety).sort((a, b) => {
                  // BMC folders first, then society folders
                  if (a.type === 'bmc' && b.type !== 'bmc') return -1;
                  if (a.type !== 'bmc' && b.type === 'bmc') return 1;
                  return a.name.localeCompare(b.name);
                });

                return societyGroups.map((society, index) => {
                  const uniqueKey = `${society.type}_${society.id}`;
                  const isExpanded = expandedSocieties.has(uniqueKey);
                  const machineCount = society.machines.length;
                  const activeCount = society.machines.filter(m => m.status === 'active').length;
                  const inactiveCount = society.machines.filter(m => m.status === 'inactive').length;
                  const maintenanceCount = society.machines.filter(m => m.status === 'maintenance').length;
                  const isSocietySelected = selectedSocieties.has(society.id);
                  const machineIds = society.machines.map(m => m.id);

                  return (
                    <div 
                      key={uniqueKey} 
                      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors hover:z-10 ${
                        isSocietySelected 
                          ? 'border-blue-500 dark:border-blue-400' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Folder Header */}
                      <div className="flex items-center">
                        {/* Checkbox for selecting the entire folder */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSocietySelection(society.id, machineIds);
                          }}
                          className="flex items-center justify-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSocietySelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                          />
                        </div>

                        {/* Expandable folder button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSocietyExpansion(uniqueKey);
                          }}
                          className="flex-1 flex items-center justify-between p-4 pl-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className={`w-5 h-5 ${society.type === 'bmc' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                            ) : (
                              <Folder className={`w-5 h-5 ${society.type === 'bmc' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                            )}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                  {society.name}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  society.type === 'bmc' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                }`}>
                                  {society.type === 'bmc' ? 'BMC' : 'Society'}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                ID: {society.identifier}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>{activeCount}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span>{inactiveCount}</span>
                                  </span>
                                  {maintenanceCount > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span>{maintenanceCount}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {machineCount} {machineCount === 1 ? 'machine' : 'machines'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Machines Grid - Shown when expanded */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {society.machines.map((machine) => {
                              // Parse status data for footer
                              const chartData = parseChartDetails(machine.chartDetails);
                              const correctionData = parseCorrectionDetails(machine.correctionDetails);
                              const hasUserPwd = machine.userPassword && machine.userPassword.trim() !== '';
                              const hasSupervisorPwd = machine.supervisorPassword && machine.supervisorPassword.trim() !== '';
                              
                              return (
                              <div key={machine.id} className="relative hover:z-20">
                              <ItemCard
                                id={machine.id}
                                name={machine.machineId}
                                identifier={machine.machineType}
                                status={machine.status}
                                icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                                showStatus={true}
                                imageUrl={machine.imageUrl}
                                badge={machine.bmcId ? {
                                  text: 'BMC',
                                  color: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-600',
                                  onClick: undefined
                                } : machine.isMasterMachine ? {
                                  text: 'Master',
                                  color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                                  onClick: () => handleMasterBadgeClick(society.id)
                                } : machine.societyId ? {
                                  text: 'Society',
                                  color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-600',
                                  onClick: undefined
                                } : undefined}
                                selectable={true}
                                selected={selectedMachines.has(machine.id)}
                                onSelect={() => handleSelectMachine(machine.id)}
                                onPasswordSettings={() => handlePasswordSettingsClick(machine)}
                                searchQuery={searchQuery}
                                footerStatus={{
                                  password: {
                                    user: { 
                                      status: hasUserPwd ? (machine.statusU === 0 ? 'downloaded' : 'pending') : 'none',
                                      tooltip: hasUserPwd ? (machine.statusU === 0 ? 'User: Downloaded' : 'User: Ready') : 'User: Not set'
                                    },
                                    supervisor: { 
                                      status: hasSupervisorPwd ? (machine.statusS === 0 ? 'downloaded' : 'pending') : 'none',
                                      tooltip: hasSupervisorPwd ? (machine.statusS === 0 ? 'Supervisor: Downloaded' : 'Supervisor: Ready') : 'Supervisor: Not set'
                                    }
                                  },
                                  charts: {
                                    pending: chartData.pending.map(c => ({ channel: c.channel })),
                                    downloaded: chartData.downloaded.map(c => ({ channel: c.channel }))
                                  },
                                  corrections: {
                                    pending: correctionData.pending,
                                    downloaded: correctionData.downloaded
                                  }
                                }}
                                details={[
                                  ...(machine.bmcId && machine.bmcName ? [{ 
                                    icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                                    text: machine.bmcIdentifier 
                                      ? `BMC: ${machine.bmcName} (${machine.bmcIdentifier})` 
                                      : `BMC: ${machine.bmcName}`,
                                    highlight: true,
                                    className: 'text-blue-600 dark:text-blue-400'
                                  }] : []),
                                  ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                                  ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                                  ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                                  ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : []),
                                  // Collection Statistics (Last 30 Days)
                                  {
                                    icon: (
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      </div>
                                    ),
                                    text: (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                          {machine.totalCollections30d || 0} Collections
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">|
                                        </span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {(machine.totalQuantity30d || 0).toFixed(2)} L
                                        </span>
                                      </div>
                                    ),
                                    className: 'text-blue-600 dark:text-blue-400'
                                  },
                                  // Password Status Display - Show button
                                  (() => {
                                    const hasAnyPassword = (machine.userPassword && machine.userPassword.trim() !== '') || (machine.supervisorPassword && machine.supervisorPassword.trim() !== '');
                                    return {
                                      icon: <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                                      text: hasAnyPassword ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowPasswordClick(machine);
                                          }}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Show
                                          </button>
                                      ) : 'No passwords set',
                                      className: hasAnyPassword ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                    };
                                  })()
                                ]}
                                bleButton={(() => {
                                  const bleStatus = getBLEButtonStatus(machine.machineId);
                                  const numericId = machine.machineId.replace(/[^0-9]/g, '');
                                  return {
                                    status: bleStatus,
                                    onClick: () => {
                                      if (bleStatus === 'connected') {
                                        handleBLEDisconnect(numericId);
                                      } else if (bleStatus === 'available') {
                                        handleBLEConnect(numericId);
                                      }
                                    },
                                    disabled: !connectedPort
                                  };
                                })()}
                                onEdit={() => handleEditClick(machine)}
                                onDelete={() => handleDeleteClick(machine)}
                                onView={() => router.push(`/admin/machine/${machine.id}`)}
                                onControlPanel={() => { setControlPanelMachineId(machine.id.toString()); setControlPanelDialogOpen(true); }}
                                onStatusChange={(status) => handleStatusChange(machine, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                                viewText="View"
                              />
                              </div>
                            );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            // List View - Traditional flat grid
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredMachines.map((machine) => {
                // Parse status data for footer
                const chartData = parseChartDetails(machine.chartDetails);
                const correctionData = parseCorrectionDetails(machine.correctionDetails);
                const hasUserPwd = machine.userPassword && machine.userPassword.trim() !== '';
                const hasSupervisorPwd = machine.supervisorPassword && machine.supervisorPassword.trim() !== '';
                
                return (
                <ItemCard
                  key={machine.id}
                  id={machine.id}
                  name={machine.machineId}
                  identifier={machine.machineType}
                  status={machine.status}
                  icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                  showStatus={true}
                  imageUrl={machine.imageUrl}
                  badge={machine.bmcId ? {
                    text: 'BMC',
                    color: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-600',
                    onClick: undefined
                  } : machine.isMasterMachine ? {
                    text: 'Master',
                    color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                    onClick: () => handleMasterBadgeClick(machine.societyId)
                  } : machine.societyId ? {
                    text: 'Society',
                    color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-600',
                    onClick: undefined
                  } : undefined}
                  selectable={true}
                  selected={selectedMachines.has(machine.id)}
                  onSelect={() => handleSelectMachine(machine.id)}
                  onPasswordSettings={() => handlePasswordSettingsClick(machine)}
                  searchQuery={searchQuery}
                  footerStatus={{
                    password: {
                      user: { 
                        status: hasUserPwd ? (machine.statusU === 0 ? 'downloaded' : 'pending') : 'none',
                        tooltip: hasUserPwd ? (machine.statusU === 0 ? 'User: Downloaded' : 'User: Ready') : 'User: Not set'
                      },
                      supervisor: { 
                        status: hasSupervisorPwd ? (machine.statusS === 0 ? 'downloaded' : 'pending') : 'none',
                        tooltip: hasSupervisorPwd ? (machine.statusS === 0 ? 'Supervisor: Downloaded' : 'Supervisor: Ready') : 'Supervisor: Not set'
                      }
                    },
                    charts: {
                      pending: chartData.pending.map(c => ({ channel: c.channel })),
                      downloaded: chartData.downloaded.map(c => ({ channel: c.channel }))
                    },
                    corrections: {
                      pending: correctionData.pending,
                      downloaded: correctionData.downloaded
                    }
                  }}
                  details={[
                    ...(machine.bmcId && machine.bmcName ? [{ 
                      icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                      text: machine.bmcIdentifier 
                        ? `BMC: ${machine.bmcName} (${machine.bmcIdentifier})` 
                        : `BMC: ${machine.bmcName}`,
                      highlight: true,
                      className: 'text-blue-600 dark:text-blue-400'
                    }] : []),
                    ...(machine.societyName ? [{ 
                      icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                      text: machine.societyIdentifier 
                        ? `${machine.societyName} (${machine.societyIdentifier})` 
                        : machine.societyName,
                      highlight: true
                    }] : []),
                    ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                    ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                    ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                    ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : []),
                    // Collection Statistics (Last 30 Days)
                    {
                      icon: (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      ),
                      text: (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {machine.totalCollections30d || 0} Collections
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {(machine.totalQuantity30d || 0).toFixed(2)} L
                          </span>
                        </div>
                      ),
                      className: 'text-blue-600 dark:text-blue-400'
                    },
                    // Password Status Display - Show button
                    (() => {
                      const hasAnyPassword = (machine.userPassword && machine.userPassword.trim() !== '') || (machine.supervisorPassword && machine.supervisorPassword.trim() !== '');
                      return {
                        icon: <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
                        text: hasAnyPassword ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowPasswordClick(machine);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                              <Eye className="w-3 h-3" />
                              Show
                            </button>
                        ) : 'No passwords set',
                        className: hasAnyPassword ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      };
                    })()
                  ]}
                  bleButton={(() => {
                    const bleStatus = getBLEButtonStatus(machine.machineId);
                    const numericId = machine.machineId.replace(/[^0-9]/g, '');
                    return {
                      status: bleStatus,
                      onClick: () => {
                        if (bleStatus === 'connected') {
                          handleBLEDisconnect(numericId);
                        } else if (bleStatus === 'available') {
                          handleBLEConnect(numericId);
                        }
                      },
                      disabled: !connectedPort
                    };
                  })()}
                  onEdit={() => handleEditClick(machine)}
                  onDelete={() => handleDeleteClick(machine)}
                  onView={() => router.push(`/admin/machine/${machine.id}`)}
                  onControlPanel={() => { setControlPanelMachineId(machine.id.toString()); setControlPanelDialogOpen(true); }}
                  onStatusChange={(status) => handleStatusChange(machine, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                  viewText="View"
                />
              );
              })}
            </div>
          )
        ) : (
          <EmptyState
            icon={<Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
            title="No machines found"
            message={statusFilter === 'all' 
              ? "You haven't added any machines yet. Click 'Add Machine' to get started."
              : `No machines found with status: ${statusFilter}`
            }
            actionText={statusFilter === 'all' ? 'Add Your First Machine' : undefined}
            onAction={statusFilter === 'all' ? openAddModal : undefined}
            showAction={statusFilter === 'all'}
          />
        )}
      </div>

      {/* Add Machine Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddModal}
        title="Add New Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => {
                // Allow only one letter followed by numbers
                const formatted = value
                  .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                  .replace(/^([a-zA-Z])[a-zA-Z]+/, '$1') // Keep only first letter
                  .replace(/^([a-zA-Z])(\d*).*/, '$1$2') // One letter + numbers only
                  .toUpperCase()
                  .slice(0, 10); // Max length 10 (1 letter + 9 digits)
                setFormData({ ...formData, machineId: formatted });
              }}
              placeholder="e.g., M2232, S3232"
              required
              error={fieldErrors.machineId}
              colSpan={2}
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={machineTypesLoading}
              error={fieldErrors.machineType}
            />

            {/* Assignment Type Toggle */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign To
              </label>
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, assignmentType: 'society', bmcId: '' })}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.assignmentType === 'society'
                      ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Society
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, assignmentType: 'bmc', societyId: '' })}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.assignmentType === 'bmc'
                      ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  BMC
                </button>
              </div>
            </div>

            {/* Society or BMC Selection */}
            {formData.assignmentType === 'society' ? (
              <FormSelect
                label="Society"
                value={formData.societyId}
                onChange={(value) => {
                  setFormData({ ...formData, societyId: value });
                  checkMasterMachineStatus(value);
                }}
                options={societies.map(society => ({ 
                  value: society.id, 
                  label: `${society.name} (${society.society_id})` 
                }))}
                placeholder="Select Society"
                required
                disabled={societiesLoading}
                error={fieldErrors.societyId}
                colSpan={2}
              />
            ) : (
              <FormSelect
                label="BMC"
                value={formData.bmcId}
                onChange={(value) => setFormData({ ...formData, bmcId: value })}
                options={bmcs.map(bmc => ({ 
                  value: bmc.id, 
                  label: `${bmc.name} (${bmc.bmcId})` 
                }))}
                placeholder="Select BMC"
                required
                colSpan={2}
              />
            )}

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                setFormData({ ...formData, contactPhone: formatted });
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  const { contactPhone: _removed, ...rest } = fieldErrors;
                  setFieldErrors(rest);
                }
              }}
              placeholder="Operator contact number"
              error={fieldErrors.contactPhone}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' | 'suspended' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />

            <FormInput
              label="Notes"
              type="text"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              colSpan={2}
            />

            {/* Master Machine Checkbox */}
            {formData.societyId !== '' && (
              <div className="sm:col-span-2">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="setAsMaster"
                      checked={formData.setAsMaster}
                      onChange={(e) => setFormData({ ...formData, setAsMaster: e.target.checked })}
                      disabled={isFirstMachine}
                      className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <label htmlFor="setAsMaster" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                        Set as Master Machine
                      </label>
                      {isFirstMachine ? (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          This is the first machine for this society and will automatically be set as master
                        </p>
                      ) : societyHasMaster && formData.setAsMaster ? (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 font-medium">
                          ⚠️ Warning: This will replace the current master machine ({existingMasterMachine}) with this one
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Master machine passwords will be inherited by all machines in this society
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Inheritance Info */}
            {formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Password Inheritance Enabled
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        This machine will automatically inherit user and supervisor passwords from the master machine (<strong>{existingMasterMachine}</strong>). 
                        The passwords will be set when the machine is created, and you can update them later if needed.
                      </p>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <strong>Note:</strong> Password status (enabled/disabled) will also be inherited from the master machine.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disable Password Inheritance Checkbox */}
            {formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="disablePasswordInheritance"
                    checked={formData.disablePasswordInheritance}
                    onChange={(e) => setFormData({ ...formData, disablePasswordInheritance: e.target.checked })}
                    className="mt-1 w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="disablePasswordInheritance" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Do not inherit passwords from master machine
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Check this if you want to set passwords manually later instead of using the master machine's passwords
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* No Master Machine Warning */}
            {formData.societyId !== '' && !formData.setAsMaster && !societyHasMaster && !isFirstMachine && (
              <div className="sm:col-span-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        No Master Machine Found
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        This society has machines but no master machine is designated. Passwords will not be inherited automatically. 
                        Consider setting this machine as master or designate an existing machine as master first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeAddModal}
            submitText="Add Machine"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.machineId || !formData.machineType || (!formData.societyId && !formData.bmcId)}
          />
        </form>
      </FormModal>

      {/* Edit Machine Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedMachine}
        onClose={closeEditModal}
        title="Edit Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => setFormData({ ...formData, machineId: value })}
              placeholder="e.g., M2232, S3232"
              required
              error={fieldErrors.machineId}
              colSpan={2}
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={machineTypesLoading}
              error={fieldErrors.machineType}
            />

            {/* Assignment Type Toggle - Disabled in Edit Mode */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign To
              </label>
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-60 cursor-not-allowed">
                <button
                  type="button"
                  disabled
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    formData.assignmentType === 'society'
                      ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Society
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    formData.assignmentType === 'bmc'
                      ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  BMC
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assignment type cannot be changed after creation</p>
            </div>

            {/* Society or BMC Selection - Disabled in Edit Mode */}
            {formData.assignmentType === 'society' ? (
              <FormSelect
                label="Society"
                value={formData.societyId}
                onChange={(value) => setFormData({ ...formData, societyId: value })}
                options={societies.map(society => ({ 
                  value: society.id, 
                  label: `${society.name} (${society.society_id})` 
                }))}
                placeholder="Select Society"
                required
                disabled={true}
                error={fieldErrors.societyId}
                colSpan={2}
              />
            ) : (
              <FormSelect
                label="BMC"
                value={formData.bmcId}
                onChange={(value) => setFormData({ ...formData, bmcId: value })}
                options={bmcs.map(bmc => ({ 
                  value: bmc.id, 
                  label: `${bmc.name} (${bmc.bmcId})` 
                }))}
                placeholder="Select BMC"
                required
                disabled={true}
                colSpan={2}
              />
            )}

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                setFormData({ ...formData, contactPhone: formatted });
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  const { contactPhone: _removed, ...rest } = fieldErrors;
                  setFieldErrors(rest);
                }
              }}
              placeholder="Operator contact number"
              error={fieldErrors.contactPhone}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' | 'suspended' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />

            <FormInput
              label="Notes"
              type="text"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              colSpan={2}
            />
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeEditModal}
            submitText="Update Machine"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.machineId || !formData.machineType || (!formData.societyId && !formData.bmcId)}
          />
        </form>
      </FormModal>

      {/* Password Settings Modal */}
      <FormModal
        isOpen={showPasswordModal && !!selectedMachine}
        onClose={closePasswordModal}
        title={`Password Settings - ${selectedMachine?.machineId || ''}`}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="User Password (6 digits)"
              type="password"
              value={passwordData.userPassword}
              onChange={(value) => updatePasswordData({ userPassword: value })}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.userPassword}
              colSpan={2}
            />
            
            <FormInput
              label="Confirm User Password"
              type="password"
              value={passwordData.confirmUserPassword}
              onChange={(value) => updatePasswordData({ confirmUserPassword: value })}
              placeholder="Re-enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.confirmUserPassword}
              colSpan={2}
            />

            <FormInput
              label="Supervisor Password (6 digits)"
              type="password"
              value={passwordData.supervisorPassword}
              onChange={(value) => updatePasswordData({ supervisorPassword: value })}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.supervisorPassword}
              colSpan={2}
            />
            
            <FormInput
              label="Confirm Supervisor Password"
              type="password"
              value={passwordData.confirmSupervisorPassword}
              onChange={(value) => updatePasswordData({ confirmSupervisorPassword: value })}
              placeholder="Re-enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              error={passwordErrors.confirmSupervisorPassword}
              colSpan={2}
            />
          </FormGrid>

          {/* Apply to Other Machines Section - Only show for master machines */}
          {selectedMachine?.isMasterMachine && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="applyPasswordsToOthers"
                  checked={applyPasswordsToOthers}
                  onChange={(e) => {
                    setApplyPasswordsToOthers(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedMachinesForPassword(new Set());
                      setSelectAllMachinesForPassword(false);
                    }
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="applyPasswordsToOthers" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Apply these passwords to other machines in this {selectedMachine.bmcId ? 'BMC' : 'society'}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Select machines below to update their passwords with the same values
                  </p>
                </div>
              </div>

              {/* Machine Selection - Show when checkbox is checked */}
              {applyPasswordsToOthers && selectedMachine && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Machines ({selectedMachinesForPassword.size} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const groupMachines = machines.filter(
                          m => {
                            if (selectedMachine.bmcId) {
                              return m.bmcId === selectedMachine.bmcId && m.id !== selectedMachine.id;
                            } else {
                              return m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id;
                            }
                          }
                        );
                        if (selectAllMachinesForPassword) {
                          setSelectedMachinesForPassword(new Set());
                          setSelectAllMachinesForPassword(false);
                        } else {
                          setSelectedMachinesForPassword(new Set(groupMachines.map(m => m.id)));
                          setSelectAllMachinesForPassword(true);
                        }
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectAllMachinesForPassword ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {machines
                      .filter(m => {
                        if (selectedMachine.bmcId) {
                          return m.bmcId === selectedMachine.bmcId && m.id !== selectedMachine.id;
                        } else {
                          return m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id;
                        }
                      })
                      .map(machine => (
                        <label
                          key={machine.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMachinesForPassword.has(machine.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedMachinesForPassword);
                              if (e.target.checked) {
                                newSelected.add(machine.id);
                              } else {
                                newSelected.delete(machine.id);
                                setSelectAllMachinesForPassword(false);
                              }
                              setSelectedMachinesForPassword(newSelected);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {machine.machineId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {machine.machineType}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                  
                  {machines.filter(m => {
                    if (selectedMachine.bmcId) {
                      return m.bmcId === selectedMachine.bmcId && m.id !== selectedMachine.id;
                    } else {
                      return m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id;
                    }
                  }).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No other machines in this {selectedMachine.bmcId ? 'BMC' : 'society'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <FormError error={error} />

          <FormActions
            onCancel={closePasswordModal}
            submitText="Update Passwords"
            isLoading={isSubmitting}
            isSubmitDisabled={
              isSubmitting || 
              Object.values(passwordErrors).some(error => error !== '') ||
              (!passwordData.userPassword && !passwordData.supervisorPassword) ||
              // Disable if password is entered but not confirmed
              !!(passwordData.userPassword && !passwordData.confirmUserPassword) ||
              !!(passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) ||
              // Disable if confirmation is entered but password is not
              !!(!passwordData.userPassword && passwordData.confirmUserPassword) ||
              !!(!passwordData.supervisorPassword && passwordData.confirmSupervisorPassword)
            }
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedMachine}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Machine"
        itemName={selectedMachine?.machineId || ''}
        message="Are you sure you want to permanently delete machine"
      />

      {/* Rate Chart View Modal */}
      <FormModal
        isOpen={showRateChartModal && !!selectedRateChart}
        onClose={closeRateChartModal}
        title={`Rate Chart - ${selectedRateChart?.channel || ''} Channel`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Chart Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">File Name</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedRateChart?.fileName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChannelColor(selectedRateChart?.channel || '')}`}>
                {selectedRateChart?.channel}
              </span>
            </div>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search FAT</label>
              <input
                type="text"
                value={searchFat}
                onChange={(e) => setSearchFat(e.target.value)}
                placeholder="e.g., 3.5"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search SNF</label>
              <input
                type="text"
                value={searchSnf}
                onChange={(e) => setSearchSnf(e.target.value)}
                placeholder="e.g., 8.5"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search CLR</label>
              <input
                type="text"
                value={searchClr}
                onChange={(e) => setSearchClr(e.target.value)}
                placeholder="e.g., 25.0"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Chart Data Table */}
          {loadingChartData ? (
            <div className="flex justify-center items-center py-8">
              <FlowerSpinner />
            </div>
          ) : (() => {
            // Filter data based on search inputs
            const filteredData = rateChartData.filter(row => {
              const matchFat = !searchFat || row.fat.toLowerCase().includes(searchFat.toLowerCase());
              const matchSnf = !searchSnf || row.snf.toLowerCase().includes(searchSnf.toLowerCase());
              const matchClr = !searchClr || row.clr.toLowerCase().includes(searchClr.toLowerCase());
              return matchFat && matchSnf && matchClr;
            });
            
            return filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      FAT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      SNF
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      CLR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        {row.fat}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        {row.snf}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        {row.clr}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        ₹{row.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                Showing {filteredData.length} of {rateChartData.length} records
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{searchFat || searchSnf || searchClr ? 'No matching records found' : 'No data available for this rate chart'}</p>
            </div>
          );
          })()}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={closeRateChartModal}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </FormModal>

      {/* Change Master Machine Modal */}
      <FormModal
        isOpen={showChangeMasterModal}
        onClose={() => setShowChangeMasterModal(false)}
        title="Change Master Machine"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  About Master Machine
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  The master machine's passwords are inherited by all other machines in the society. 
                  Changing the master will update which machine's passwords are used as the default for new machines.
                </p>
              </div>
            </div>
          </div>

          {selectedSocietyForMaster && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select New Master Machine <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMasterMachineId || ''}
                  onChange={(e) => setNewMasterMachineId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a machine</option>
                  {machines
                    .filter(m => m.societyId === selectedSocietyForMaster)
                    .map(machine => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machineId} - {machine.machineType}
                        {machine.isMasterMachine ? ' (Current Master)' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <input
                  type="checkbox"
                  id="setForAllMachines"
                  checked={setForAll}
                  onChange={(e) => setSetForAll(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="setForAllMachines" className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer">
                    Apply master's passwords to all machines in society
                  </label>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    If checked, all machines in this society will be updated with the new master machine's passwords immediately.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowChangeMasterModal(false)}
              disabled={isChangingMaster}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeMasterConfirm}
              disabled={isChangingMaster || !newMasterMachineId}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChangingMaster ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Changing...
                </>
              ) : (
                'Change Master'
              )}
            </button>
          </div>
        </div>
      </FormModal>

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={showDeleteConfirm}
        itemCount={selectedMachines.size}
        itemType="machine"
        onConfirm={handleBulkDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedMachines.size}
        totalCount={machines.length}
        onBulkDelete={() => setShowDeleteConfirm(true)}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={() => {
          setSelectedMachines(new Set());
          setSelectedSocieties(new Set());
          setSelectAll(false);
        }}
        itemType="machine"
        showStatusUpdate={true}
        currentBulkStatus={bulkStatus}
        onBulkStatusChange={(status) => setBulkStatus(status as typeof bulkStatus)}
      />

      {/* Control Panel Dropdown Modal - Only shown when machines are connected and dropdown is open */}
      {connectedBLEMachines.size > 0 && controlPanelDropdownOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end p-8 pb-32 pointer-events-none">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/20 via-violet-900/10 to-black/20 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
            onClick={() => setControlPanelDropdownOpen(false)}
          ></div>
          
          {/* Modal card with glassmorphism */}
          <div className="relative pointer-events-auto w-[420px] animate-in slide-in-from-bottom-8 fade-in duration-500">
            {/* Animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
            
            {/* Glass container */}
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
              {/* Gradient mesh overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-cyan-500/5 pointer-events-none"></div>
              
              {/* Animated gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 animate-gradient-x"></div>
              
              {/* Header */}
              <div className="relative p-6 border-b border-white/20 dark:border-white/5">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon with 3D effect */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur-xl opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30 border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <svg className="relative w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                          Control Panel
                        </h3>
                        {/* Live pulse indicator */}
                        <div className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/50"></span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {connectedBLEMachines.size} {connectedBLEMachines.size === 1 ? 'Device' : 'Devices'} Online
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setControlPanelDropdownOpen(false)}
                    className="relative group/close p-2.5 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all duration-300 hover:rotate-90"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover/close:from-red-500/10 group-hover/close:to-red-500/20 rounded-xl transition-all duration-300"></div>
                    <X className="relative w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/close:text-red-600 dark:group-hover/close:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Connected Machines List */}
              <div className="relative p-4 max-h-[28rem] overflow-y-auto">
                <div className="space-y-3">
                  {Array.from(connectedBLEMachines).map((numericId, index) => {
                    const foundMachine = machines.find(m => parseInt(m.machineId.replace(/[^0-9]/g, ''), 10) === parseInt(numericId, 10));
                    // Create fallback machine object (like Flutter's orElse) if not found in list
                    const machine = foundMachine || {
                      id: numericId,
                      machineId: `M-${numericId}`,
                      machineType: 'Lactosure',
                    };
                    
                    return (
                      <div
                        key={numericId}
                        className="animate-in slide-in-from-right fade-in duration-500"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                      >
                        <button
                          onClick={() => {
                            setControlPanelMachineId(machine.id.toString());
                            setControlPanelDialogOpen(true);
                            setControlPanelDropdownOpen(false);
                          }}
                          className="group/item relative w-full overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {/* Gradient glow on hover */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-2xl opacity-0 group-hover/item:opacity-30 blur-xl transition-all duration-500"></div>
                          
                          {/* Card content */}
                          <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/40 dark:from-white/5 dark:to-white/[0.02] group-hover/item:from-white/80 group-hover/item:to-white/60 dark:group-hover/item:from-white/10 dark:group-hover/item:to-white/5 border border-white/30 dark:border-white/10 rounded-2xl p-4 transition-all duration-500">
                            {/* Mesh pattern */}
                            <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 via-transparent to-transparent rounded-full blur-2xl"></div>
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent rounded-full blur-2xl"></div>
                            </div>
                            
                            <div className="relative flex items-center gap-4">
                              {/* Machine icon with 3D effect */}
                              <div className="flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur-lg opacity-0 group-hover/item:opacity-50 transition-all duration-500"></div>
                                <div className="relative w-16 h-16 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover/item:shadow-violet-500/50 transition-all duration-500 group-hover/item:scale-110 border border-white/20">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                                  <Settings className="relative w-8 h-8 text-white group-hover/item:rotate-180 transition-transform duration-700 drop-shadow-lg" />
                                </div>
                              </div>
                              
                              {/* Machine info */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-base font-black text-gray-900 dark:text-white group-hover/item:text-transparent group-hover/item:bg-clip-text group-hover/item:bg-gradient-to-r group-hover/item:from-violet-600 group-hover/item:to-fuchsia-600 transition-all duration-500 truncate">
                                    {machine.machineId}
                                  </p>
                                  {/* Type badge */}
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-500/20">
                                    {machine.machineType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  <div className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-br from-emerald-400 to-green-500"></span>
                                  </div>
                                  <span>Connected & Ready</span>
                                </div>
                              </div>
                              
                              {/* Arrow with animation */}
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 group-hover/item:from-violet-500/20 group-hover/item:to-fuchsia-500/20 flex items-center justify-center transition-all duration-500 border border-violet-500/0 group-hover/item:border-violet-500/30">
                                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover/item:text-violet-600 dark:group-hover/item:text-violet-400 group-hover/item:translate-x-1 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer accent */}
              <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 opacity-30"></div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Floating Button - Only shown when machines are connected */}
      {connectedBLEMachines.size > 0 && (
        <div className="fixed bottom-6 right-24 z-50" ref={controlPanelDropdownRef}>
          <div className="relative group">
            {/* Animated gradient glow rings */}
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-70 blur-xl transition-all duration-500 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 rounded-full opacity-40 blur-lg animate-spin-slow"></div>
            
            {/* Glass morphism container */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02] p-0.5 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
              {/* Main button with gradient mesh */}
              <button
                onClick={() => {
                  // Navigate directly to control panel (like Flutter) - use first connected machine
                  // The control panel dialog has internal machine switcher for multiple machines
                  const firstMachineId = Array.from(connectedBLEMachines)[0];
                  const machine = machines.find(m => parseInt(m.machineId.replace(/[^0-9]/g, ''), 10) === parseInt(firstMachineId, 10));
                  // Use machine.id if found, otherwise use BLE numeric ID as fallback (like Flutter's orElse)
                  setControlPanelMachineId(machine?.id?.toString() || firstMachineId);
                  setControlPanelDialogOpen(true);
                }}
                className="relative w-14 h-14 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 rounded-[18px] shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 flex items-center justify-center overflow-hidden group/btn"
                title="Control Panel"
              >
                {/* Animated mesh pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/30 via-transparent to-transparent rounded-full blur-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-cyan-400/30 via-transparent to-transparent rounded-full blur-lg"></div>
                </div>
                
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                
                {/* Rotating border gradient */}
                <div className="absolute inset-0 rounded-[18px] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 blur-sm transition-opacity duration-500"></div>
                
                {/* Icon with 3D effect */}
                <div className="relative z-10 transform group-hover/btn:scale-110 group-hover/btn:rotate-180 transition-all duration-700 ease-out">
                  <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm"></div>
                  <svg className="relative w-6 h-6 drop-shadow-2xl filter" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                
                {/* Corner accents */}
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white/60 shadow-lg shadow-white/50"></div>
                <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-cyan-300/60 shadow-lg shadow-cyan-300/50"></div>
              </button>
            </div>
            
            {/* Badge - positioned outside button as overlay with high z-index */}
            <div className="absolute -top-2 -right-2 z-[100]">
              {/* Multiple animated rings */}
              <span className="absolute inline-flex h-8 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 opacity-20 animate-ping"></span>
              <span className="absolute inline-flex h-7 w-7 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 opacity-30 animate-pulse"></span>
              
              {/* Glass badge with higher contrast */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-white dark:border-gray-900 rounded-full shadow-2xl shadow-emerald-500/60">
                <div className="relative flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full">
                  <span className="text-xs font-black text-white drop-shadow-lg relative z-10">
                    {connectedBLEMachines.size}
                  </span>
                  {/* Inner glow for depth */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
            
            {/* Modern tooltip */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none z-[90]">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur-xl opacity-60"></div>
                
                {/* Glass tooltip */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 dark:from-gray-800/95 dark:to-gray-700/95 px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 animate-pulse"></div>
                    <p className="text-xs font-bold text-white whitespace-nowrap">Control Panel</p>
                  </div>
                  <p className="text-[10px] text-gray-300 font-medium pl-3.5">
                    {connectedBLEMachines.size} machine{connectedBLEMachines.size !== 1 ? 's' : ''} connected
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5">
                  <div className="border-6 border-transparent border-t-gray-900/95 dark:border-t-gray-800/95"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Show Password Modal */}
      <FormModal
        isOpen={showPasswordViewModal && !!machineToShowPassword}
        onClose={closePasswordViewModal}
        title={`View Passwords - ${machineToShowPassword?.machineId || ''}`}
      >
        {!revealedPasswords ? (
          <form onSubmit={handleVerifyAndShowPasswords} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Security Verification Required
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Enter your admin password to view machine passwords. This action will be logged for security purposes.
                  </p>
                </div>
              </div>
            </div>

            <FormInput
              label="Admin Password"
              type="password"
              value={adminPasswordForView}
              onChange={(value) => setAdminPasswordForView(value)}
              placeholder="Enter your admin password"
              error={viewPasswordError}
              required
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closePasswordViewModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={viewingPasswords || !adminPasswordForView}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {viewingPasswords ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    View Passwords
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Passwords Retrieved Successfully
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Machine passwords for {machineToShowPassword?.machineId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    User Password
                  </label>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {revealedPasswords.userPassword || 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Supervisor Password
                  </label>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {revealedPasswords.supervisorPassword || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closePasswordViewModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGraphModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {graphMetric === 'quantity' && 'Top 20 Machines by Quantity (Last 30 Days)'}
                {graphMetric === 'tests' && 'Top 20 Machines by Total Tests (Last 30 Days)'}
                {graphMetric === 'cleaning' && 'Top 20 Machines by Cleaning Count (Last 30 Days)'}
                {graphMetric === 'skip' && 'Top 20 Machines by Cleaning Skip Count (Last 30 Days)'}
                {graphMetric === 'today' && 'Most Active Machines Today'}
                {graphMetric === 'uptime' && 'Top 20 Machines by Uptime Days (Last 30 Days)'}
              </h2>
              <button onClick={() => setShowGraphModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.machine.machineId}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{data.machine.machineType}</p>
                            {data.machine.societyName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{data.machine.societyName}</p>
                            )}
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                              {graphMetric === 'quantity' && `${data.value.toFixed(2)} L`}
                              {graphMetric === 'tests' && `${data.value} Tests`}
                              {graphMetric === 'cleaning' && `${data.value} Cleanings`}
                              {graphMetric === 'skip' && `${data.value} Skips`}
                              {graphMetric === 'today' && `${data.value} Collections Today`}
                              {graphMetric === 'uptime' && `${data.value} Days Active`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Dialog */}
      {controlPanelMachineId && (
        <ControlPanelDialog
          isOpen={controlPanelDialogOpen}
          onClose={() => {
            setControlPanelDialogOpen(false);
            setControlPanelMachineId(null);
          }}
          machineDbId={controlPanelMachineId}
        />
      )}
    </>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
function MachineManagementWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <MachineManagement />
    </Suspense>
  );
}

export default MachineManagementWrapper;
