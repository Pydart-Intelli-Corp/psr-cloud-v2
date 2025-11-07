# Quectel 4G Module Integration Guide

## Problem Statement
When Quectel 4G modules send HTTP requests with pipe characters (`|`) in the URL, they may:
- URL-encode the pipes as `%7C`
- Send CONNECT method instead of GET
- Not properly format the HTTP request

**Error seen:**
```
CONNECT
HTTP/1.1 400 Bad Request
InputString parameter is required
```

## Solutions

### Solution 1: Use POST Method (Recommended)

Instead of sending data in the URL, send it in the POST body.

#### AT Commands for Quectel Module

```at
// 1. Configure HTTP parameters
AT+QHTTPCFG="contextid",1
AT+QHTTPCFG="responseheader",1

// 2. Set the URL (without InputString)
AT+QHTTPURL=74,30
http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo

// 3. Set POST data with InputString
AT+QHTTPPOST=40,30,10
333|ECOD|LE2.00|M00000001|C00001

// 4. Read response
AT+QHTTPREAD=80
```

#### InputString Format (POST Body)
```
333|ECOD|LE2.00|M00000001|C00001
```

Components:
- `333` - Society ID (or S-333)
- `ECOD` - Machine Type
- `LE2.00` - Version
- `M00000001` - Machine ID
- `C00001` - Page Number (optional, for pagination)

---

### Solution 2: URL-Encode the InputString (GET Method)

If you must use GET, encode the pipe characters as `%7C`.

#### AT Commands

```at
// 1. Configure HTTP
AT+QHTTPCFG="contextid",1

// 2. Set URL with encoded pipes (%7C instead of |)
AT+QHTTPURL=150,30
http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001%7CC00001

// 3. Send GET request
AT+QHTTPGET=30

// 4. Read response
AT+QHTTPREAD=80
```

**URL Encoding:**
- `|` → `%7C`
- Full example: `333%7CECOD%7CLE2.00%7CM00000001%7CC00001`

---

### Solution 3: Use Simple POST with JSON (Alternative)

Send JSON body instead of plain text.

#### AT Commands

```at
// 1. Configure HTTP
AT+QHTTPCFG="contextid",1
AT+QHTTPCFG="contenttype",3  // JSON content type

// 2. Set URL
AT+QHTTPURL=74,30
http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo

// 3. Set JSON POST data
AT+QHTTPPOST=100,30,10
{"InputString":"333|ECOD|LE2.00|M00000001|C00001"}

// 4. Read response
AT+QHTTPREAD=80
```

---

## Response Formats

### CSV Response (No Page Number)
When you request without page number: `333|ECOD|LE2.00|M00000001`

```csv
RF-ID,ID,NAME,MOBILE,SMS,BONUS
1234567890,F001,John Doe,+919876543210,ON,5
9876543210,F002,Jane Smith,+919876543211,OFF,3
...
```

### Paginated Response
When you request with page number: `333|ECOD|LE2.00|M00000001|C00001`

```
farmerId|rfId|name|phone|sms|bonus||farmerId2|rfId2|name2|phone2|sms2|bonus2||
```

**Format:** Each farmer separated by `||`, fields separated by `|`, 5 farmers per page.

---

## Debugging Steps

### 1. Check PM2 Logs on Server

```bash
ssh root@168.231.121.19
pm2 logs psr-v4 --lines 100
```

Look for:
- `📡 External API Request Details:` - Shows method, URL, headers
- `GET Query Params:` - Shows parsed query parameters
- `POST JSON Body:` or `POST Form Data:` - Shows POST data
- `Parsed Values:` - Shows final DB Key and InputString

### 2. Test with cURL First

**GET with URL-encoded pipes:**
```bash
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001"
```

**POST with plain InputString:**
```bash
curl -X POST "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: text/plain" \
  -d "333|ECOD|LE2.00|M00000001"
```

**POST with JSON:**
```bash
curl -X POST "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/json" \
  -d '{"InputString":"333|ECOD|LE2.00|M00000001"}'
```

### 3. Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `InputString parameter is required` | Pipes not encoded in GET | Use POST or encode pipes as `%7C` |
| `400 Bad Request` | Wrong HTTP method (CONNECT) | Use GET or POST |
| `DB Key is required` | Wrong URL path | Check URL: `/api/BAB1568/...` |
| `Invalid DB Key` | Wrong or inactive DB key | Verify admin exists and is active |
| `Society not found` | Wrong society ID | Check society ID in database |
| Empty response | No farmers match criteria | Check machine ID, society ID |

---

## Quick Reference

### InputString Components

```
societyId|machineType|version|machineId[|pageNumber]
```

**Examples:**
- CSV download: `333|ECOD|LE2.00|M00000001`
- Paginated (page 1): `333|ECOD|LE2.00|M00000001|C00001`
- Paginated (page 2): `333|ECOD|LE2.00|M00000001|C00002`

**Society ID formats accepted:**
- `333` - numeric only
- `S-333` - with prefix

**Machine ID formats:**
- `M00000001` - numeric (leading zeros removed internally: 1)
- `MABC123` - alphanumeric (prefix M removed: ABC123)

**Page Number format:**
- `C00001` - page 1 (5 farmers)
- `C00002` - page 2 (next 5 farmers)
- Omit for CSV download (all farmers)

---

## Recommended Configuration for Quectel

**Use POST method with plain InputString in body:**

```at
AT+QHTTPCFG="contextid",1
AT+QHTTPCFG="responseheader",0
AT+QHTTPURL=74,30
http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo
AT+QHTTPPOST=40,30,10
333|ECOD|LE2.00|M00000001|C00001
AT+QHTTPREAD=80
```

**Why POST?**
- ✅ No need to encode pipes
- ✅ Simpler AT commands
- ✅ Works with all Quectel modules
- ✅ Better for debugging
- ✅ Handles longer InputStrings

---

## Testing Checklist

- [ ] Module can connect to server (ping 168.231.121.19)
- [ ] HTTP POST sends correct URL
- [ ] InputString in body has proper format
- [ ] Response received (check AT+QHTTPREAD)
- [ ] Parse CSV or paginated response
- [ ] Handle errors (check HTTP status code)
- [ ] Implement retry logic for network issues

---

## Support

**Check Logs:**
```bash
ssh root@168.231.121.19
pm2 logs psr-v4 --lines 100 | grep "📡"
```

**Test Endpoints:**
```bash
# Test from server (should work)
curl "http://localhost:3000/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001"

# Test from remote (should also work)
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001"
```

**Database Verification:**
```bash
mysql -u psr_admin -p psr_v4_main
# Password: PsrAdmin@20252!

SELECT COUNT(*) FROM babumongopi_bab1568.farmers WHERE society_id = 333;
# Should return count of farmers for society
```

---

## Next Steps

1. **Configure Quectel module** with POST method (recommended)
2. **Test with AT commands** using simple InputString
3. **Check PM2 logs** to verify request received
4. **Verify response** format matches expectations
5. **Implement parsing** in your application
6. **Add error handling** for network issues

**Contact:** Check PM2 logs or contact system administrator for support.
