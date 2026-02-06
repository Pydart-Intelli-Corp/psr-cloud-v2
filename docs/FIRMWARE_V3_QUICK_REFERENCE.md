# Firmware v3.0.0 Quick Reference Guide

## For Developers: Key Changes at a Glance

### 1. Version Detection
```javascript
// OLD
if (line.includes('Poornasree USB Dongle v2.0'))

// NEW  
if (line.includes('Poornasree HUB'))
```

### 2. Data Reception Format
```javascript
// OLD - No device ID prefix
DATA: <STX><payload><ETX>

// NEW - Device ID prefix (1-9)
DATA,1,<STX><payload><ETX>
DATA,2,<STX><payload><ETX>
```

### 3. Connection Responses
```javascript
// OLD
CONNECTED,OK

// NEW
CONNECTED,OK,ID=1
CONNECTED,OK,ID=2
```

### 4. Disconnection
```javascript
// OLD - No specific device support
DISCONNECT          // All devices only
DISCONNECTED,OK

// NEW - Specific device support
DISCONNECT          // All devices
DISCONNECT,1        // Specific device by dongle ID
DISCONNECTED,1      // Confirmation with device ID
DISCONNECTED,ALL
```

### 5. Connect All Response
```javascript
// OLD
CONNECT_ALL,COMPLETE,CONNECTED=2,SKIPPED=1

// NEW
CONNECT_ALL,COMPLETE,CONNECTED=2,FAILED=1
```

---

## New Commands Available (Not Yet Implemented in UI)

### Diagnostics
```javascript
sendDongleCommand('MAC');     // Returns: 48:27:E2:64:F4:D9
sendDongleCommand('HEAP');    // Returns: HEAP,267592,265424
sendDongleCommand('UPTIME');  // Returns: UPTIME,16323 (ms)
```

### Device Information
```javascript
sendDongleCommand('STATUS');           // List all connections
sendDongleCommand('DEVICEINFO');       // Detailed info for all
sendDongleCommand('DEVICEINFO,1');     // Detailed info for device 1
```

### Binary Data Transmission
```javascript
// Hex format
sendDongleCommand('SENDHEX,1,40 04 01');
sendDongleCommand('SENDHEXALL,FF AA 00');

// Decimal/mixed format
sendDongleCommand('SENDBIN,1,64,4,1,0xFF');
sendDongleCommand('SENDBINALL,0x40,4,1');
```

---

## Response Parsing Examples

### 1. Device List (STATUS command)
```
> STATUS
< ACK
< CONNECTED,2
< DEVICE,1,Poornasree - Sl.No - 4,34:85:18:5f:69:b5
< DEVICE,2,Poornasree - Sl.No - 1,34:85:18:67:13:0d
```

### 2. Device Info (DEVICEINFO command)
```
> DEVICEINFO,1
< ACK
< DEVICEINFO,1,Poornasree - Sl.No - 4,34:85:18:5f:69:b5,MTU=517,ACTIVE
```

### 3. Data Reception (Automatic)
```
< DATA,1,<STX>LE3.36|A|CH1|F01.41|...|MM00004|D2026-02-06_13:34:42<ETX>
< DATA,2,<STX>LE3.36|A|CH1|F00.00|...|MM00001|D2026-02-06_13:53:55<ETX>
```

### 4. Error Handling
```
< ERROR,MAX_CONNECTIONS_REACHED
< ERROR,CONNECT_FAILED
< ERROR,SERVICE_NOT_FOUND
< ERROR,CHARACTERISTIC_NOT_FOUND
< ERROR,DEVICE_NOT_FOUND
< ERROR,INVALID_FORMAT
< ERROR,INVALID_HEX
< ERROR,NO_DATA
```

---

## Testing Checklist

### Manual Testing
- [ ] Connect dongle and verify "Poornasree HUB v3.0.0" appears
- [ ] Run SCAN,5 and verify devices found
- [ ] Connect single device and verify ID assignment
- [ ] Connect all devices (CONNECT_ALL)
- [ ] Receive data from multiple devices simultaneously
- [ ] Disconnect specific device
- [ ] Disconnect all devices

### Automated Testing (Future)
```javascript
// Test version detection
test('Should detect Poornasree HUB v3.0.0', async () => {
  const response = await sendCommand('VERSION');
  expect(response).toContain('Poornasree HUB');
});

// Test data parsing
test('Should parse DATA,id format', () => {
  const line = 'DATA,1,\x02LE3.36|...|MM00004\x03';
  const parsed = parseDataPacket(line);
  expect(parsed.dongleId).toBe('1');
  expect(parsed.machineId).toBe('4');
});
```

---

## Migration Path

### Phase 1: Current ✅
- Version string updated
- Data format handler added
- Backwards compatibility maintained

### Phase 2: Recommended (Next Sprint)
- Add STATUS command integration
- Add DEVICEINFO display in UI
- Add HEAP/UPTIME monitoring
- Add binary data transmission UI

### Phase 3: Future Enhancements
- Auto-reconnect on disconnect
- Signal strength (RSSI) display
- MTU optimization controls
- Advanced diagnostics panel

---

## Troubleshooting

### Issue: "Device not recognized"
```javascript
// Check VERSION response
> VERSION
< ACK
< Poornasree HUB v3.0.0 (2026-02-06)
< Board: ESP32-S3-WROOM-1-U | BLE: NUS | MaxDevices: 9 | MTU: 512 | Buffer: 4096B
```
**Fix:** Ensure version check uses `includes('Poornasree HUB')` not exact match

### Issue: "Data not received from specific device"
```javascript
// Check device mapping
console.log('Machine ID to Dongle ID:', machineIdToDongleId);
// Should show: Map { '4' => '1', '1' => '2' }

// Check connected devices
console.log('Connected Machines:', connectedBLEMachines);
// Should show: Set { '4', '1' }
```

### Issue: "Connection fails after CONNECT_ALL"
```javascript
// Monitor progress
setConnectAllProgress({ current: 0, total: 2 });
// Watch for CONNECTED,OK,ID=n responses
// Update progress on each connection
```

---

## Performance Metrics (Production Data)

### Tested Configuration
- **Devices:** 2 simultaneous connections
- **Connection Time:** ~2 seconds per device
- **Data Throughput:** 517 bytes MTU
- **Memory Usage:** 267KB free (stable)
- **Signal Quality:** -8 dBm to -45 dBm (excellent to good)

### Scalability
- **Max Devices:** 9 (tested with 2)
- **Expected Connection Time (9 devices):** ~18 seconds
- **Data Rate:** Up to 512 bytes per packet per device

---

## Code Locations

### Main Files
- **Firmware:** `P:\wifi_dongle\src\dongle_firmware.ino`
- **Web App:** `P:\psr-cloud-v2\src\app\admin\machine\page.tsx`
- **Documentation:** `P:\psr-cloud-v2\docs\FIRMWARE_V3_INTEGRATION.md`

### Key Functions (Web App)
```javascript
testPortIsPoornasreeHub()       // Line ~680 - Dongle verification
processDongleResponse()         // Line ~910 - Protocol handler
handleBLEConnect()              // Line ~1630 - Connection logic
handleConnectAll()              // Line ~1567 - Batch connection
```

### Key Functions (Firmware)
```cpp
processDongleResponse()         // Line ~360 - Serial command handler
onNotify()                      // Line ~196 - BLE data callback
connectByAddress()              // Line ~366 - BLE connection
```

---

## Support Contacts

**For Firmware Issues:**
- Check hardware: ESP32-S3-WROOM-1-U
- Verify USB connection (GPIO 19/20)
- Check LED indicators

**For Web App Issues:**
- Browser: Chrome/Edge/Opera (Web Serial API required)
- Check console logs with `DEBUG_MODE = true`
- Verify port access (close Arduino IDE, PuTTY, etc.)

---

**Last Updated:** February 6, 2026  
**Firmware:** v3.0.0  
**Status:** ✅ Production Ready
