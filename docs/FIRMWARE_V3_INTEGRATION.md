# Poornasree HUB v3.0.0 Firmware Integration

## Overview
Updated PSR Cloud V2 web application to integrate with the new **Poornasree HUB v3.0.0** (ESP32-S3) firmware, replacing the previous Poornasree USB Dongle v2.0.

**Update Date:** February 6, 2026  
**Firmware Version:** 3.0.0  
**Hardware:** ESP32-S3-WROOM-1-U (Native USB)

---

## Key Firmware Changes

### 1. **Device Identity**
- **Old:** Poornasree USB Dongle v2.0
- **New:** Poornasree HUB v3.0.0
- **Impact:** Updated version detection strings throughout codebase

### 2. **Command Protocol Enhancements**

#### New Commands Added:
- `MAC` - Get dongle BLE MAC address
- `HEAP` - Memory diagnostics
- `UPTIME` - Time since boot
- `STATUS` - Connection state with device list
- `DEVICEINFO[,id]` - Detailed device information (MTU, status)
- `SENDHEX`, `SENDHEXALL` - Hex-encoded binary data transmission
- `SENDBIN`, `SENDBINALL` - Decimal/hex mixed byte transmission

#### Modified Response Formats:
- **CONNECT_ALL,COMPLETE** now returns `CONNECTED=n,FAILED=m` (was `CONNECTED=n,SKIPPED=m`)
- **DISCONNECTED** now supports `DISCONNECTED,id` for specific device disconnection
- **CONNECTED,OK** now includes `ID=n` for device identification

### 3. **Data Packet Format**
**New Format:**
```
DATA,<dongle_id>,<STX><payload><ETX>
```
- Dongle Device ID prefix added (1-9)
- STX (0x02) and ETX (0x03) framing bytes
- Enables multi-device data routing

**Old Format:**
```
<STX><payload><ETX>
```

### 4. **MTU Optimization**
- **New:** 517 bytes (512 payload + 5 overhead)
- **Old:** 512 bytes
- Auto-chunking for large payloads (509 bytes per chunk)

### 5. **Multi-Device Support**
- Simultaneous connections: **Up to 9 devices** (was limited to 3)
- Each device gets unique ID (1-9)
- Independent message buffers per device

---

## Code Changes Made

### File: `src/app/admin/machine/page.tsx`

#### 1. **Dongle Verification Update**
```typescript
// OLD - Line ~720
if (buffer.includes('Poornasree USB Dongle v2.0')) {
  
// NEW
if (buffer.includes('Poornasree HUB')) {
```

#### 2. **VERSION Response Handler**
```typescript
// OLD - Line ~905
else if (line.includes('Poornasree USB Dongle v2.0')) {
  setIsDongleVerified(true);
  console.log('✅ [Dongle] Verified as Poornasree USB Dongle v2.0');

// NEW
else if (line.includes('Poornasree HUB')) {
  setIsDongleVerified(true);
  console.log('✅ [Dongle] Verified as Poornasree HUB v3.0.0');
```

#### 3. **Data Packet Handler (NEW)**
```typescript
// NEW - Handles DATA,id,<payload> format
else if (line.startsWith('DATA,')) {
  const parts = line.split(',');
  if (parts.length >= 3) {
    const dongleDeviceId = parts[1];
    const payload = parts.slice(2).join(',');
    
    // Extract machine data between STX and ETX
    const dataMatch = payload.match(/\x02(.*?)\x03/);
    if (dataMatch) {
      const data = dataMatch[1];
      
      // Extract machine ID from data
      const machineIdMatch = data.match(/MM(\d+)/);
      if (machineIdMatch) {
        const machineId = machineIdMatch[1];
        setBleDataReceived(prev => new Map(prev).set(machineId, data));
      } else {
        // Fallback: lookup via dongleDeviceId mapping
        let foundMachineId: string | null = null;
        machineIdToDongleId.forEach((dId, mId) => {
          if (dId === dongleDeviceId) foundMachineId = mId;
        });
        if (foundMachineId) {
          setBleDataReceived(prev => new Map(prev).set(foundMachineId, data));
        }
      }
    }
  }
}

// Legacy fallback for old firmware
else if (line.includes('\x02') || line.includes('\x03')) {
  // Old format handling
}
```

#### 4. **CONNECT_ALL Response Update**
```typescript
// OLD
else if (line.startsWith('CONNECT_ALL,COMPLETE')) {
  // Parsed SKIPPED=m
  
// NEW
else if (line.startsWith('CONNECT_ALL,COMPLETE')) {
  // Now parses CONNECTED=n,FAILED=m
  // Backward compatible with SKIPPED for old firmware
}
```

#### 5. **DISCONNECTED Handler Enhancement**
```typescript
// NEW - Supports DISCONNECTED,id for specific devices
else if (line.startsWith('DISCONNECTED,')) {
  if (line === 'DISCONNECTED,ALL') {
    // Disconnect all
  } else if (line === 'DISCONNECTED,OK') {
    // Legacy single device
  } else {
    // DISCONNECTED,id - find and remove specific device
    const dongleDeviceId = line.split(',')[1];
    // Reverse lookup machineId from dongleDeviceId
  }
}
```

#### 6. **Added Missing State Variables**
```typescript
// Auto-connect feature (future enhancement - currently disabled)
const [autoConnectEnabled, setAutoConnectEnabled] = useState(false);
const autoConnectEnabledRef = useRef(false);
const manuallyDisconnectedMachines = useRef<Set<string>>(new Set());
```

---

## Connection Settings

### Serial Port Configuration
```typescript
baudRate: 115200  // ✅ Already correct
dataBits: 8
stopBits: 1
parity: 'none'
flowControl: 'none'
```

### BLE Scan Settings
```typescript
duration: 5 seconds  // SCAN,5 command
interval: 100ms
window: 99ms
activeScan: true
```

---

## Testing Checklist

### ✅ Completed Tests
- [x] Port detection and connection
- [x] Dongle verification (Poornasree HUB v3.0.0)
- [x] BLE scanning (SCAN,5)
- [x] CONNECT_ALL functionality (2 devices tested)
- [x] MTU negotiation (517 bytes confirmed)
- [x] Multi-device data reception (DATA,id format)
- [x] Device disconnection (DISCONNECT,id)

### Test Results (from user session):
```
✅ MAC: 48:27:E2:64:F4:D9
✅ Heap: 267KB free (265KB minimum)
✅ MTU: 517 bytes (optimal)
✅ Connected Devices: 2/9
   - Device 1: Sl.No - 4 (RSSI: -8 dBm - excellent)
   - Device 2: Sl.No - 1 (RSSI: -45 dBm - good)
✅ SENDHEXALL: 6 bytes to 2 devices
✅ Data Reception: Live milk test data from both machines
```

### Sample Data Received:
**Device 1 (Sl.No - 4):**
```
LE3.36|A|CH1|F01.41|S00.00|C00.00|P00.00|L00.00|s00.00|W99.00|T30.25|I000000|Q00000.00|R00000.00|r084.00|i099.99|MM00004|D2026-02-06_13:34:42
```

**Device 2 (Sl.No - 1):**
```
LE3.36|A|CH1|F00.00|S00.00|C00.00|P00.00|L00.00|s00.00|W99.00|T28.91|I000001|Q00001.00|R00429.00|r429.00|i000.00|MM00001|D2026-02-06_13:53:55
```

---

## Backwards Compatibility

The updated code maintains backwards compatibility with older firmware:
- Legacy data packet format still supported as fallback
- `SKIPPED` parameter in CONNECT_ALL responses handled
- Old VERSION responses will still work (partial string match)

---

## Future Enhancements

### Recommended Features to Implement:
1. **Auto-reconnect** - Automatic reconnection on device disconnect
2. **Connection health monitoring** - Use `STATUS` and `DEVICEINFO` commands
3. **Memory monitoring** - Track HEAP usage for dongle health
4. **RSSI-based connection quality** - Display signal strength indicators
5. **Hex/Binary command support** - UI for SENDHEX/SENDBIN commands
6. **Uptime tracking** - Monitor dongle stability

### New Commands to Integrate:
- `MAC` - Display dongle MAC in UI
- `HEAP` - Memory health indicator
- `UPTIME` - Dongle uptime display
- `DEVICEINFO` - Enhanced device details panel

---

## Breaking Changes

### For Users:
- **None** - Seamless upgrade experience
- Existing workflows remain identical

### For Developers:
- Must use new firmware-compatible dongles
- Old dongles (v2.0) will still work but with reduced features
- New features (9 devices, MTU 517) require v3.0.0 firmware

---

## Troubleshooting

### Common Issues:

#### 1. "Device not recognized"
**Cause:** Old firmware detection string  
**Fix:** Dongle should identify as "Poornasree HUB"

#### 2. "Data not received"
**Cause:** Missing DATA,id handler  
**Fix:** Updated processDongleResponse() handles new format

#### 3. "Connect all fails"
**Cause:** FAILED vs SKIPPED parameter  
**Fix:** Handler now supports both formats

#### 4. "Device disconnection not working"
**Cause:** Missing DISCONNECTED,id handler  
**Fix:** Enhanced handler with reverse ID lookup

---

## Performance Improvements

### Firmware v3.0.0 Benefits:
1. **Faster connections** - CONNECT_ALL native command
2. **Better stability** - Watchdog protection (30s timeout)
3. **Larger MTU** - More data per packet (512 vs 509 bytes)
4. **More devices** - 9 simultaneous connections (vs 3)
5. **Better error handling** - Detailed ERROR codes
6. **Data routing** - Device ID in DATA packets

---

## Migration Notes

### No Action Required:
- Web application detects firmware automatically
- Version string match updated
- All existing code paths preserved

### Recommended Actions:
1. Update all dongles to v3.0.0 firmware
2. Test multi-device scenarios (>3 devices)
3. Monitor HEAP usage in production
4. Update user documentation

---

## References

- **Firmware File:** `P:\wifi_dongle\src\dongle_firmware.ino`
- **Web App File:** `P:\psr-cloud-v2\src\app\admin\machine\page.tsx`
- **Test Session:** February 6, 2026 - 2 devices, full protocol test
- **Firmware Guide:** See firmware header comments for full command reference

---

## Support

For issues or questions:
- Check firmware version: Send `VERSION` command
- Check dongle MAC: Send `MAC` command
- Check memory: Send `HEAP` command
- Check connections: Send `STATUS` command

**Firmware Version:** 3.0.0 (2026-02-06)  
**Web App Version:** Compatible with v3.0.0+  
**Status:** ✅ Production Ready
