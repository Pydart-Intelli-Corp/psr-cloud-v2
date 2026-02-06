'use client';

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

// Types for BLE device
interface BLEDevice {
  name: string;
  address: string;
  rssi: number;
  isPoornasree: boolean;
  machineId?: string;
}

// Dongle context state
interface DongleContextType {
  // Connection state
  connectedPort: SerialPort | null;
  isDongleVerified: boolean;
  isConnecting: boolean;
  
  // BLE state
  availableBLEMachines: Set<string>;
  connectedBLEMachines: Set<string>;
  allBLEDevices: BLEDevice[];
  bleScanning: boolean;
  bleConnectingMachine: string | null;
  machineIdToDongleId: Map<string, string>;
  bleDataReceived: Map<string, string>;
  
  // Error state
  serialPortError: string;
  
  // Functions
  connectPort: () => Promise<boolean>;
  disconnectPort: () => Promise<void>;
  sendDongleCommand: (command: string) => Promise<boolean>;
  handleBLEScan: () => Promise<void>;
  handleStopScan: () => void;
  handleBLEConnect: (machineId: string, deviceAddress?: string) => Promise<boolean>;
  handleBLEDisconnect: (machineId: string) => Promise<void>;
  handleConnectAll: () => Promise<void>;
  handleDisconnectAll: () => Promise<void>;
  clearError: () => void;
  
  // Data parsing callback - used by control panel to receive machine data
  onBleData: (callback: (machineId: string, data: string) => void) => void;
  offBleData: (callback: (machineId: string, data: string) => void) => void;
  
  // Inject external connection - used by Machine Management to share its port with context
  injectConnection: (params: {
    port: SerialPort | null;
    writer: WritableStreamDefaultWriter<Uint8Array> | null;
    reader: ReadableStreamDefaultReader<string> | null;
    verified: boolean;
    connectedMachines: Set<string>;
    machineIdMap: Map<string, string>;
    availableMachines: Set<string>;
    devices: BLEDevice[];
  }) => void;
  
  // Forward BLE data from Machine Management to subscribers (Control Panel)
  forwardBleData: (machineId: string, data: string) => void;
}

const DongleContext = createContext<DongleContextType | null>(null);

// Hook to use dongle context
export function useDongle() {
  const context = useContext(DongleContext);
  if (!context) {
    throw new Error('useDongle must be used within a DongleProvider');
  }
  return context;
}

// Utility functions
const isPoornasreeMachine = (name: string): boolean => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    normalized.includes('poornasree') ||
    normalized.includes('lactosure') ||
    /^mm\d+$/.test(normalized) ||
    /sl\.?no\.?\d+/.test(normalized.replace(/\s/g, ''))
  );
};

const extractMachineId = (name: string): string | null => {
  const normalized = name.replace(/[^a-zA-Z0-9\s.-]/g, '');
  
  // Try MM format first (MM1, MM01, MM001)
  const mmMatch = normalized.match(/MM[\s\-_]*0*(\d+)/i);
  if (mmMatch) return mmMatch[1];
  
  // Try Sl.No format
  const slMatch = normalized.match(/Sl\.?\s*No\.?\s*-?\s*0*(\d+)/i);
  if (slMatch) return slMatch[1];
  
  // Try extracting any number after dash
  const dashMatch = normalized.match(/-\s*0*(\d+)$/);
  if (dashMatch) return dashMatch[1];
  
  return null;
};

interface DongleProviderProps {
  children: ReactNode;
}

export function DongleProvider({ children }: DongleProviderProps) {
  // Connection state
  const [connectedPort, setConnectedPort] = useState<SerialPort | null>(null);
  const [isDongleVerified, setIsDongleVerified] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const isDongleVerifiedRef = useRef(false);
  
  // BLE state
  const [availableBLEMachines, setAvailableBLEMachines] = useState<Set<string>>(new Set());
  const [connectedBLEMachines, setConnectedBLEMachines] = useState<Set<string>>(new Set());
  const [allBLEDevices, setAllBLEDevices] = useState<BLEDevice[]>([]);
  const [bleScanning, setBleScanning] = useState(false);
  const [bleConnectingMachine, setBleConnectingMachine] = useState<string | null>(null);
  const [machineIdToDongleId, setMachineIdToDongleId] = useState<Map<string, string>>(new Map());
  const [bleDataReceived, setBleDataReceived] = useState<Map<string, string>>(new Map());
  
  // Error state
  const [serialPortError, setSerialPortError] = useState('');
  
  // Refs
  const serialWriterRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const serialReaderRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const bleDataBufferRef = useRef<string>('');
  const connectingAddressRef = useRef<string>('');
  const connectAllAddressMapRef = useRef<Map<string, string>>(new Map());
  const individualConnectionMapRef = useRef<Map<string, string>>(new Map());
  
  // BLE data callbacks
  const bleDataCallbacksRef = useRef<Set<(machineId: string, data: string) => void>>(new Set());
  
  // Register/unregister BLE data callbacks
  const onBleData = useCallback((callback: (machineId: string, data: string) => void) => {
    bleDataCallbacksRef.current.add(callback);
  }, []);
  
  const offBleData = useCallback((callback: (machineId: string, data: string) => void) => {
    bleDataCallbacksRef.current.delete(callback);
  }, []);
  
  // Notify all BLE data callbacks
  const notifyBleData = useCallback((machineId: string, data: string) => {
    bleDataCallbacksRef.current.forEach(callback => {
      try {
        callback(machineId, data);
      } catch (err) {
}
    });
  }, []);
  
  // Forward BLE data from external source (Machine Management page)
  const forwardBleData = useCallback((machineId: string, data: string) => {
notifyBleData(machineId, data);
  }, [notifyBleData]);
  
  // Clear error
  const clearError = useCallback(() => {
    setSerialPortError('');
  }, []);
  
  // Send command to dongle
  const sendDongleCommand = useCallback(async (command: string): Promise<boolean> => {
    if (!serialWriterRef.current) {
return false;
    }
    
    try {
      const data = new TextEncoder().encode(command + '\n');
      await serialWriterRef.current.write(data);
      
      // Log hex commands with special formatting
      if (command.startsWith('SENDHEX')) {
} else if (!command.startsWith('SCAN')) {
}
      return true;
    } catch (err) {
      const error = err as Error;
if (error.name === 'NetworkError' || error.message.includes('device has been lost')) {
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
        setSerialPortError('USB device disconnected. Please reconnect the Poornasree HUB.');
      }
      
      return false;
    }
  }, []);
  
  // Process serial data line
  const processSerialLine = useCallback((line: string) => {
    if (!line.trim()) return;
    
    // VERSION response - verify dongle
    if (line.includes('Poornasree')) {
setIsDongleVerified(true);
      isDongleVerifiedRef.current = true;
    }
    
    // FOUND,name,address,rssi - Device found during BLE scan
    else if (line.startsWith('FOUND,')) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const deviceName = parts[1];
        const address = parts[2];
        const rssi = parseInt(parts[3]) || -100;
        
        const isPoornasree = isPoornasreeMachine(deviceName);
        const machineId = extractMachineId(deviceName);
        
        const newDevice: BLEDevice = {
          name: deviceName,
          address,
          rssi,
          isPoornasree,
          machineId: machineId || undefined
        };
        
        setAllBLEDevices(prev => {
          const existing = prev.find(d => d.address === address);
          if (existing) {
            return prev.map(d => d.address === address ? newDevice : d);
          }
          return [...prev, newDevice];
        });
        
        if (isPoornasree && machineId) {
          setAvailableBLEMachines(prev => new Set(prev).add(machineId));
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
    }
    
    // CONNECTED,OK,ID=n - Device connected
    else if (line.startsWith('CONNECTED,OK,ID=')) {
      const deviceId = line.split('=')[1];
      const address = connectingAddressRef.current || '';
      
      // Try to find machine ID from various sources
      let machineId = individualConnectionMapRef.current.get(address.toLowerCase()) ||
                      connectAllAddressMapRef.current.get(address.toLowerCase());
      
      if (!machineId) {
        const device = allBLEDevices.find(d => d.address.toLowerCase() === address.toLowerCase());
        if (device) {
          machineId = extractMachineId(device.name) || undefined;
        }
      }
      
      if (machineId) {
        setConnectedBLEMachines(prev => new Set(prev).add(machineId!));
        setMachineIdToDongleId(prev => new Map(prev).set(machineId!, deviceId));
}
      
      setBleConnectingMachine(null);
      connectingAddressRef.current = '';
    }
    
    // CONNECTING,address
    else if (line.startsWith('CONNECTING,')) {
      connectingAddressRef.current = line.split(',')[1];
    }
    
    // STATUS,DISCONNECTED,id - Async device disconnection callback
    else if (line.startsWith('STATUS,DISCONNECTED,')) {
      const deviceId = line.split(',')[2];
      
      // Find and remove machine by dongle ID
      setMachineIdToDongleId(prev => {
        const newMap = new Map(prev);
        for (const [machineId, id] of newMap) {
          if (id === deviceId) {
            setConnectedBLEMachines(prevConn => {
              const newSet = new Set(prevConn);
              newSet.delete(machineId);
              return newSet;
            });
            newMap.delete(machineId);
break;
          }
        }
        return newMap;
      });
    }
    
    // DISCONNECTED,id - Response to DISCONNECT command
    else if (line.startsWith('DISCONNECTED,') && !line.includes('ALL')) {
      const deviceId = line.split(',')[1];
      
      // Find and remove machine by dongle ID
      setMachineIdToDongleId(prev => {
        const newMap = new Map(prev);
        for (const [machineId, id] of newMap) {
          if (id === deviceId) {
            setConnectedBLEMachines(prevConn => {
              const newSet = new Set(prevConn);
              newSet.delete(machineId);
              return newSet;
            });
            newMap.delete(machineId);
break;
          }
        }
        return newMap;
      });
    }
    
    // BLE_DATA,id,hex_data - Data received from machine
    else if (line.startsWith('BLE_DATA,')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const deviceId = parts[1];
        const hexData = parts.slice(2).join(',');
        
        // Find machine ID for this device
        for (const [machineId, id] of machineIdToDongleId) {
          if (id === deviceId) {
            setBleDataReceived(prev => new Map(prev).set(machineId, hexData));
            notifyBleData(machineId, hexData);
            break;
          }
        }
      }
    }
    
    // DATA,id,{data} - Data received from machine (ESP32 firmware format)
    // Data is wrapped in STX (0x02) and ETX (0x03) control characters
    // Format: DATA,{deviceId},{STX}{pipe-delimited-data}{ETX}
    else if (line.startsWith('DATA,')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const deviceId = parts[1];
        // Join remaining parts (in case data contains commas) and clean up STX/ETX
        let data = parts.slice(2).join(',');
        
        // Remove STX (0x02) and ETX (0x03) control characters if present
        data = data.replace(/[\x02\x03]/g, '').trim();
// Find machine ID for this dongle device ID
        let foundMachineId: string | null = null;
        for (const [machineId, id] of machineIdToDongleId) {
          if (id === deviceId) {
            foundMachineId = machineId;
            break;
          }
        }
        
        // If we found a mapped machine ID, use it; otherwise try to extract from data
        if (foundMachineId) {
          setBleDataReceived(prev => new Map(prev).set(foundMachineId!, data));
          notifyBleData(foundMachineId, data);
        } else {
          // Try to extract machine ID from the data itself (MM prefix in Lactosure format)
          const machineIdMatch = data.match(/MM(\d+)/);
          if (machineIdMatch) {
            const machineId = machineIdMatch[1].replace(/^0+/, '') || '0'; // Remove leading zeros
            setBleDataReceived(prev => new Map(prev).set(machineId, data));
            notifyBleData(machineId, data);
          } else {
            // Fallback: broadcast to all listeners with device ID
setBleDataReceived(prev => new Map(prev).set(deviceId, data));
            notifyBleData(deviceId, data);
          }
        }
      }
    }
    
    // ERROR handling
    else if (line.startsWith('ERROR,')) {
      const errorType = line.split(',')[1];
      const friendlyErrors: Record<string, string> = {
        'ALREADY_CONNECTED': 'Device is already connected.',
        'CONNECTION_FAILED': 'Failed to connect to device.',
        'TIMEOUT': 'Connection timed out.',
        'NOT_FOUND': 'Device not found.',
        'SCAN_FAILED': 'BLE scan failed.',
      };
      setSerialPortError(friendlyErrors[errorType] || `Dongle error: ${errorType}`);
      setBleConnectingMachine(null);
      setBleScanning(false);
    }
  }, [allBLEDevices, machineIdToDongleId, notifyBleData]);
  
  // Start reading from dongle
  const startDongleReader = useCallback(async (port: SerialPort) => {
    if (!port.readable) return;
    
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable as WritableStream<Uint8Array>);
    const reader = decoder.readable.getReader();
    serialReaderRef.current = reader;
    
    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          bleDataBufferRef.current += value;
          
          // Process complete lines
          const lines = bleDataBufferRef.current.split('\n');
          bleDataBufferRef.current = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              processSerialLine(trimmedLine);
            }
          }
        }
      } catch (err) {
}
    };
    
    readLoop();
    
    // Return cleanup function
    return () => {
      reader.cancel();
      readableStreamClosed.catch(() => {});
    };
  }, [processSerialLine]);
  
  // Connect to port
  const connectPort = useCallback(async (): Promise<boolean> => {
    if (connectedPort) {
      setSerialPortError('Already connected. Disconnect first.');
      return false;
    }
    
    if (!('serial' in navigator)) {
      setSerialPortError('Web Serial API not supported. Use Chrome, Edge, or Opera.');
      return false;
    }
    
    try {
      setIsConnecting(true);
      setSerialPortError('');
      
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      setConnectedPort(port);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!port.writable) {
        throw new Error('Writable stream not available');
      }
      
      const writer = port.writable.getWriter();
      serialWriterRef.current = writer;
      
      startDongleReader(port);
      
      // Send VERSION to verify
      await new Promise(resolve => setTimeout(resolve, 200));
      const versionData = new TextEncoder().encode('VERSION\n');
      await writer.write(versionData);
      
      // Wait for verification
      const startTime = Date.now();
      while (!isDongleVerifiedRef.current && (Date.now() - startTime) < 3000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isDongleVerifiedRef.current) {
        // Not a Poornasree device - disconnect
        await port.close();
        setConnectedPort(null);
        serialWriterRef.current = null;
        setSerialPortError('Not a Poornasree HUB device.');
        setIsConnecting(false);
        return false;
      }
      
      // Save config
      try {
        const info = port.getInfo();
        localStorage.setItem('poornasree_hub_port', JSON.stringify({
          vendorId: info.usbVendorId,
          productId: info.usbProductId,
          verified: true,
          timestamp: Date.now()
        }));
      } catch {}
      
      setIsConnecting(false);
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'NotFoundError') {
setSerialPortError('Failed to connect: ' + error.message);
      }
      setIsConnecting(false);
      return false;
    }
  }, [connectedPort, startDongleReader]);
  
  // Disconnect from port
  const disconnectPort = useCallback(async () => {
    const port = connectedPort;
    if (!port) return;
    
    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
        serialReaderRef.current = null;
      }
      
      if (serialWriterRef.current) {
        await serialWriterRef.current.releaseLock();
        serialWriterRef.current = null;
      }
      
      await port.close();
      
      try {
        await (port as any).forget();
      } catch {}
      
      setConnectedPort(null);
      setIsDongleVerified(false);
      isDongleVerifiedRef.current = false;
      setAvailableBLEMachines(new Set());
      setConnectedBLEMachines(new Set());
      setAllBLEDevices([]);
      setBleScanning(false);
      setBleConnectingMachine(null);
      setMachineIdToDongleId(new Map());
      setBleDataReceived(new Map());
      bleDataBufferRef.current = '';
      
      localStorage.removeItem('poornasree_hub_port');
    } catch (err) {
setSerialPortError('Failed to disconnect: ' + (err as Error).message);
    }
  }, [connectedPort]);
  
  // BLE Scan
  const handleBLEScan = useCallback(async () => {
    if (!isDongleVerifiedRef.current || !serialWriterRef.current) {
      setSerialPortError('Connect to Poornasree HUB first.');
      return;
    }
    
    setAllBLEDevices([]);
    if (connectedBLEMachines.size === 0) {
      setAvailableBLEMachines(new Set());
    }
    
    const success = await sendDongleCommand('SCAN,5');
    if (success) {
      setBleScanning(true);
    }
  }, [connectedBLEMachines.size, sendDongleCommand]);
  
  // Stop scan
  const handleStopScan = useCallback(() => {
    setBleScanning(false);
  }, []);
  
  // Connect to BLE machine
  const handleBLEConnect = useCallback(async (machineId: string, deviceAddress?: string): Promise<boolean> => {
    if (!isDongleVerifiedRef.current || !serialWriterRef.current) {
      setSerialPortError('Connect to Poornasree HUB first.');
      return false;
    }
    
    if (connectedBLEMachines.has(machineId)) {
      return true;
    }
    
    let address = deviceAddress;
    if (!address) {
      const device = allBLEDevices.find(d => extractMachineId(d.name) === machineId);
      if (!device) {
        setSerialPortError(`Device ${machineId} not found. Scan first.`);
        return false;
      }
      address = device.address;
    }
    
    setBleConnectingMachine(machineId);
    individualConnectionMapRef.current.set(address.toLowerCase(), machineId);
    
    return new Promise<boolean>((resolve) => {
      let timeout: NodeJS.Timeout;
      
      const checkConnection = setInterval(() => {
        if (connectedBLEMachines.has(machineId)) {
          clearInterval(checkConnection);
          clearTimeout(timeout);
          setBleConnectingMachine(null);
          resolve(true);
        }
      }, 50);
      
      timeout = setTimeout(() => {
        clearInterval(checkConnection);
        setBleConnectingMachine(null);
        resolve(false);
      }, 3000);
      
      sendDongleCommand(`CONNECT,${address}`).then(success => {
        if (!success) {
          clearInterval(checkConnection);
          clearTimeout(timeout);
          setBleConnectingMachine(null);
          resolve(false);
        }
      });
    });
  }, [allBLEDevices, connectedBLEMachines, sendDongleCommand]);
  
  // Disconnect from BLE machine
  const handleBLEDisconnect = useCallback(async (machineId: string) => {
    if (!isDongleVerifiedRef.current || !serialWriterRef.current) {
      return;
    }
    
    const deviceId = machineIdToDongleId.get(machineId);
    if (deviceId) {
      await sendDongleCommand(`DISCONNECT,${deviceId}`);
    }
  }, [machineIdToDongleId, sendDongleCommand]);
  
  // Connect all
  const handleConnectAll = useCallback(async () => {
    if (!isDongleVerifiedRef.current || !serialWriterRef.current) {
      setSerialPortError('Connect to Poornasree HUB first.');
      return;
    }
    
    // Build address -> machineId map
    connectAllAddressMapRef.current.clear();
    const availableDevices = allBLEDevices.filter(d => d.isPoornasree && !connectedBLEMachines.has(d.machineId || ''));
    
    availableDevices.forEach(device => {
      if (device.machineId) {
        connectAllAddressMapRef.current.set(device.address.toLowerCase(), device.machineId);
      }
    });
    
    await sendDongleCommand('CONNECT_ALL');
  }, [allBLEDevices, connectedBLEMachines, sendDongleCommand]);
  
  // Disconnect all
  const handleDisconnectAll = useCallback(async () => {
    if (!isDongleVerifiedRef.current || !serialWriterRef.current) {
      return;
    }
    
    await sendDongleCommand('DISCONNECT');
    setConnectedBLEMachines(new Set());
    setMachineIdToDongleId(new Map());
  }, [sendDongleCommand]);
  
  // Inject external connection from Machine Management page
  // This allows Machine Management to share its port connection with the context
  // so that Control Panel can send commands through the same connection
  const injectConnection = useCallback((params: {
    port: SerialPort | null;
    writer: WritableStreamDefaultWriter<Uint8Array> | null;
    reader: ReadableStreamDefaultReader<string> | null;
    verified: boolean;
    connectedMachines: Set<string>;
    machineIdMap: Map<string, string>;
    availableMachines: Set<string>;
    devices: BLEDevice[];
  }) => {
setConnectedPort(params.port);
    serialWriterRef.current = params.writer;
    serialReaderRef.current = params.reader;
    setIsDongleVerified(params.verified);
    isDongleVerifiedRef.current = params.verified;
    setConnectedBLEMachines(params.connectedMachines);
    setMachineIdToDongleId(params.machineIdMap);
    setAvailableBLEMachines(params.availableMachines);
    setAllBLEDevices(params.devices);
  }, []);
  
  // NOTE: Auto-connect is disabled to avoid conflicts with Machine Management page
  // Machine Management page handles its own port connection and calls injectConnection
  // to share the connection state with this context
  
  const value: DongleContextType = {
    connectedPort,
    isDongleVerified,
    isConnecting,
    availableBLEMachines,
    connectedBLEMachines,
    allBLEDevices,
    bleScanning,
    bleConnectingMachine,
    machineIdToDongleId,
    bleDataReceived,
    serialPortError,
    connectPort,
    disconnectPort,
    sendDongleCommand,
    handleBLEScan,
    handleStopScan,
    handleBLEConnect,
    handleBLEDisconnect,
    handleConnectAll,
    handleDisconnectAll,
    clearError,
    onBleData,
    offBleData,
    injectConnection,
    forwardBleData,
  };
  
  return (
    <DongleContext.Provider value={value}>
      {children}
    </DongleContext.Provider>
  );
}

export default DongleContext;
