# PSR-v4 External API Integration Guide

**Complete Integration Guide for Third-Party Systems**

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**API Version**: v1  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Machine ID Formats](#machine-id-formats)
5. [Integration Examples](#integration-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Security Guidelines](#security-guidelines)
9. [Rate Limiting](#rate-limiting)
10. [Testing](#testing)

---

## 🎯 Overview

The PSR-v4 External API provides 5 dedicated endpoints for third-party system integration, primarily designed for dairy machine integration and external application connectivity. These APIs use database key (db-key) authentication, separate from the internal JWT-based authentication system.

### Key Features

✅ **5 Production-Ready Endpoints**
- Machine correction data retrieval
- Farmer information access
- Machine password management
- Update history tracking

✅ **Dual Authentication System**
- Internal APIs: JWT-based (35+ endpoints)
- External APIs: db-key-based (5 endpoints)

✅ **Alphanumeric Machine ID Support**
- Numeric format: M00001 → integer 1
- Alphanumeric format: M0000df → variants ['0000df', 'df']
- Intelligent variant matching

✅ **RESTful Design**
- JSON request/response format
- Standard HTTP methods (GET/POST)
- Comprehensive error messages

---

## 🔐 Authentication

### Database Key (db-key) Authentication

External APIs use a unique database key assigned to each organization during admin approval.

#### db-key Format
```
Format: 3 uppercase letters + 4 digits
Examples: JOH1234, MAR5678, RAJ9012
```

#### How to Obtain db-key

1. **Admin Registration**: Register as an Admin user in PSR-v4
2. **Email Verification**: Complete email OTP verification
3. **Super Admin Approval**: Wait for Super Admin approval
4. **Welcome Email**: Receive db-key in welcome email (confidential)

#### Using db-key in API Calls

**URL Structure**:
```
/api/[db-key]/[Module]/[Action]
```

**Example**:
```
GET https://psr-v4.com/api/JOH1234/MachineCorrection/GetLatestMachineCorrection
```

**Important**: 
- db-key is part of the URL path, not a header
- No additional authentication tokens required
- Keep db-key confidential (treat like a password)

---

## 🔌 API Endpoints

### 1. GetLatestMachineCorrection

Retrieve latest milk test correction factors for a specific machine.

#### Endpoint
```
GET/POST /api/[db-key]/MachineCorrection/GetLatestMachineCorrection
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `machineId` | string | Yes | Machine identifier (M00001 or M0000df) |

#### Request Examples

**GET Request**:
```bash
GET /api/JOH1234/MachineCorrection/GetLatestMachineCorrection?machineId=M00001
```

**POST Request**:
```bash
POST /api/JOH1234/MachineCorrection/GetLatestMachineCorrection
Content-Type: application/json

{
  "machineId": "M0000df"
}
```

**cURL Example**:
```bash
curl -X POST https://psr-v4.com/api/JOH1234/MachineCorrection/GetLatestMachineCorrection \
  -H "Content-Type: application/json" \
  -d '{"machineId": "M0000df"}'
```

#### Response Format

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Machine correction data retrieved successfully",
  "data": {
    "machine_id": "M0000df",
    "corrections": {
      "channel1": {
        "fat": 0.0500,
        "snf": 0.0300,
        "clr": 0.0200,
        "temp": 0.0100,
        "water": 0.0000,
        "protein": 0.0150
      },
      "channel2": {
        "fat": 0.0480,
        "snf": 0.0310,
        "clr": 0.0190,
        "temp": 0.0105,
        "water": 0.0000,
        "protein": 0.0145
      },
      "channel3": {
        "fat": 0.0520,
        "snf": 0.0295,
        "clr": 0.0210,
        "temp": 0.0095,
        "water": 0.0000,
        "protein": 0.0155
      }
    },
    "updated_at": "2025-11-05T10:30:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "status": "error",
  "message": "Machine correction data not found",
  "error": {
    "code": "MACHINE_NOT_FOUND",
    "details": "No correction data available for machine M99999"
  }
}
```

#### Correction Parameters

| Parameter | Description | Decimal Places |
|-----------|-------------|----------------|
| `fat` | Fat content correction factor | 4 |
| `snf` | Solids-Not-Fat correction factor | 4 |
| `clr` | Corrected Lactometer Reading adjustment | 4 |
| `temp` | Temperature compensation factor | 4 |
| `water` | Water content detection calibration | 4 |
| `protein` | Protein measurement precision tuning | 4 |

---

### 2. SaveMachineCorrectionUpdationHistory

Log when external systems fetch correction data (audit trail).

#### Endpoint
```
POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `machineId` | string | Yes | Machine identifier |
| `fetchedAt` | string | No | ISO 8601 timestamp (defaults to current time) |

#### Request Example

```bash
POST /api/JOH1234/MachineCorrection/SaveMachineCorrectionUpdationHistory
Content-Type: application/json

{
  "machineId": "M0000df",
  "fetchedAt": "2025-11-05T10:30:00Z"
}
```

#### Response Format

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Correction update history saved successfully",
  "data": {
    "id": 12345,
    "machine_id": "M0000df",
    "fetched_at": "2025-11-05T10:30:00Z",
    "created_at": "2025-11-05T10:30:15Z"
  }
}
```

---

### 3. GetLatestFarmerInfo

Retrieve comprehensive farmer information including society and machine assignments.

#### Endpoint
```
GET/POST /api/[db-key]/FarmerInfo/GetLatestFarmerInfo
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmerId` | string/number | Yes | Farmer unique identifier |

#### Request Example

```bash
POST /api/JOH1234/FarmerInfo/GetLatestFarmerInfo
Content-Type: application/json

{
  "farmerId": "F001234"
}
```

#### Response Format

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Farmer information retrieved successfully",
  "data": {
    "farmer_id": "F001234",
    "name": "John Doe",
    "contact": {
      "email": "john.doe@example.com",
      "phone": "+91-9876543210",
      "address": "123 Main Street, Village Name",
      "pincode": "123456",
      "city": "City Name",
      "state": "State Name"
    },
    "society": {
      "id": 5,
      "name": "Village Dairy Society",
      "code": "VDS001"
    },
    "machine": {
      "id": "M0000df",
      "type": "Automatic Milk Analyzer",
      "status": "Active"
    },
    "bank_details": {
      "account_number": "1234567890",
      "ifsc_code": "BANK0001234",
      "bank_name": "State Bank",
      "branch": "Main Branch"
    },
    "status": "Active",
    "registration_date": "2025-01-15T00:00:00Z"
  }
}
```

---

### 4. GetLatestMachinePassword

Retrieve current active password for a machine.

#### Endpoint
```
GET/POST /api/[db-key]/MachinePassword/GetLatestMachinePassword
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `machineId` | string | Yes | Machine identifier |

#### Request Example

```bash
POST /api/JOH1234/MachinePassword/GetLatestMachinePassword
Content-Type: application/json

{
  "machineId": "M0000df"
}
```

#### Response Format

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Machine password retrieved successfully",
  "data": {
    "machine_id": "M0000df",
    "password": "Secure@Pass123",
    "password_status": "pending",
    "created_at": "2025-11-05T10:00:00Z",
    "updated_at": "2025-11-05T10:00:00Z"
  }
}
```

**Password Status Values**:
- `pending`: Password generated but not delivered to machine
- `updated`: Password successfully delivered and confirmed

---

### 5. UpdateMachinePasswordStatus

Update password delivery status after machine receives password.

#### Endpoint
```
POST /api/[db-key]/MachinePassword/UpdateMachinePasswordStatus
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `machineId` | string | Yes | Machine identifier |
| `status` | string | Yes | New status: 'pending' or 'updated' |

#### Request Example

```bash
POST /api/JOH1234/MachinePassword/UpdateMachinePasswordStatus
Content-Type: application/json

{
  "machineId": "M0000df",
  "status": "updated"
}
```

#### Response Format

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Machine password status updated successfully",
  "data": {
    "machine_id": "M0000df",
    "old_status": "pending",
    "new_status": "updated",
    "updated_at": "2025-11-05T10:35:00Z"
  }
}
```

**Validation Rules**:
- Status must be either 'pending' or 'updated'
- Machine must exist in database
- Password record must exist for the machine

---

## 🔢 Machine ID Formats

### Numeric Format

**Input**: M00001  
**Storage**: `machine_id` (integer) = 1  
**Matching**: Direct integer comparison

**Example**:
```json
{
  "machineId": "M00001"
}
// Internally converted to: WHERE machine_id = 1
```

### Alphanumeric Format

**Input**: M0000df  
**Storage**: 
- `machine_id` (VARCHAR) = 'M0000df'
- `machine_id_variants` (JSON) = ['0000df', 'df']

**Matching**: Searches both exact match and variant array

**Example**:
```json
{
  "machineId": "M0000df"
}
// Searches:
// 1. WHERE machine_id = 'M0000df'
// 2. WHERE JSON_CONTAINS(machine_id_variants, '"0000df"')
// 3. WHERE JSON_CONTAINS(machine_id_variants, '"df"')
```

### Variant Generation Logic

```
Input: M0000df

Step 1: Remove 'M' prefix → "0000df"
Step 2: Generate variants
  - Variant 1: Full ID without prefix → "0000df"
  - Variant 2: Remove leading zeros → "df"
  - Variant 3: Lowercase versions → "0000df", "df"

Final variants array: ["0000df", "df"]
```

### Supported Formats

✅ **Numeric**:
- M00001, M223223, M01234
- Automatically strips leading zeros
- Converts to integer for matching

✅ **Alphanumeric**:
- M0000df, M0001ab, M00xyz
- Stores multiple variant formats
- Case-insensitive matching

❌ **Unsupported**:
- Without 'M' prefix: 00001, 0000df
- Special characters: M000-1, M000@df
- Spaces: M 0000df

---

## 💡 Integration Examples

### Example 1: Fetch Machine Corrections (Node.js)

```javascript
const axios = require('axios');

async function getMachineCorrections(dbKey, machineId) {
  try {
    const response = await axios.post(
      `https://psr-v4.com/api/${dbKey}/MachineCorrection/GetLatestMachineCorrection`,
      { machineId },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      }
    );

    if (response.data.status === 'success') {
      const corrections = response.data.data.corrections;
      console.log('Channel 1 Fat Correction:', corrections.channel1.fat);
      return corrections;
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data.message);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received');
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    throw error;
  }
}

// Usage
getMachineCorrections('JOH1234', 'M0000df');
```

### Example 2: Update Password Status (Python)

```python
import requests
import json

def update_machine_password_status(db_key, machine_id, status):
    """Update machine password status"""
    url = f"https://psr-v4.com/api/{db_key}/MachinePassword/UpdateMachinePasswordStatus"
    
    payload = {
        "machineId": machine_id,
        "status": status  # 'pending' or 'updated'
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        if data['status'] == 'success':
            print(f"Password status updated: {data['data']['new_status']}")
            return True
        else:
            print(f"Update failed: {data['message']}")
            return False
            
    except requests.exceptions.Timeout:
        print("Request timeout - server not responding")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        return False

# Usage
update_machine_password_status('JOH1234', 'M0000df', 'updated')
```

### Example 3: Get Farmer Info (C#)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class FarmerInfoClient
{
    private readonly HttpClient _httpClient;
    private readonly string _dbKey;

    public FarmerInfoClient(string dbKey)
    {
        _dbKey = dbKey;
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://psr-v4.com"),
            Timeout = TimeSpan.FromSeconds(10)
        };
    }

    public async Task<FarmerInfo> GetFarmerInfoAsync(string farmerId)
    {
        var url = $"/api/{_dbKey}/FarmerInfo/GetLatestFarmerInfo";
        var payload = new { farmerId };
        
        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ApiResponse<FarmerInfo>>(jsonResponse);

            if (result?.Status == "success")
            {
                return result.Data;
            }
            
            throw new Exception($"API Error: {result?.Message}");
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"HTTP Error: {ex.Message}");
            throw;
        }
        catch (TaskCanceledException)
        {
            Console.WriteLine("Request timeout");
            throw;
        }
    }
}

// Usage
var client = new FarmerInfoClient("JOH1234");
var farmerInfo = await client.GetFarmerInfoAsync("F001234");
Console.WriteLine($"Farmer: {farmerInfo.Name}");
```

### Example 4: Complete Integration Workflow

```javascript
// Complete workflow for dairy machine integration

class DairyMachineIntegration {
  constructor(dbKey) {
    this.dbKey = dbKey;
    this.baseUrl = 'https://psr-v4.com/api';
  }

  async fetchAndApplyCorrections(machineId) {
    try {
      // Step 1: Fetch correction data
      const corrections = await this.getMachineCorrections(machineId);
      
      // Step 2: Apply corrections to machine
      await this.applyCorrectionsToMachine(machineId, corrections);
      
      // Step 3: Log the update
      await this.logCorrectionUpdate(machineId);
      
      console.log(`Corrections applied successfully for ${machineId}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to apply corrections: ${error.message}`);
      // Implement retry logic
      return this.retryWithBackoff(() => 
        this.fetchAndApplyCorrections(machineId)
      );
    }
  }

  async getMachineCorrections(machineId) {
    const response = await fetch(
      `${this.baseUrl}/${this.dbKey}/MachineCorrection/GetLatestMachineCorrection`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId })
      }
    );
    
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.corrections;
    }
    throw new Error(data.message);
  }

  async logCorrectionUpdate(machineId) {
    await fetch(
      `${this.baseUrl}/${this.dbKey}/MachineCorrection/SaveMachineCorrectionUpdationHistory`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          machineId,
          fetchedAt: new Date().toISOString()
        })
      }
    );
  }

  async applyCorrectionsToMachine(machineId, corrections) {
    // Your machine-specific logic to apply corrections
    console.log(`Applying corrections to machine ${machineId}:`, corrections);
  }

  async retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
}

// Usage
const integration = new DairyMachineIntegration('JOH1234');
integration.fetchAndApplyCorrections('M0000df');
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 OK | Success | Process response data |
| 201 Created | Resource created | Confirm creation |
| 400 Bad Request | Invalid parameters | Check request format |
| 401 Unauthorized | Invalid db-key | Verify db-key |
| 404 Not Found | Resource not found | Verify IDs exist |
| 429 Too Many Requests | Rate limit exceeded | Implement backoff |
| 500 Internal Server Error | Server error | Retry with backoff |
| 503 Service Unavailable | Server maintenance | Retry later |

### Error Response Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information",
    "field": "parameterName" // Optional: which field caused error
  }
}
```

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_DB_KEY` | db-key not found or invalid | Verify db-key from welcome email |
| `MACHINE_NOT_FOUND` | Machine ID doesn't exist | Check machine ID format and existence |
| `INVALID_MACHINE_ID` | Machine ID format invalid | Use M + numeric/alphanumeric format |
| `FARMER_NOT_FOUND` | Farmer ID doesn't exist | Verify farmer ID |
| `INVALID_STATUS` | Invalid status value | Use 'pending' or 'updated' only |
| `MISSING_PARAMETER` | Required parameter missing | Check API documentation |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement rate limiting |
| `DATABASE_ERROR` | Internal database error | Retry after delay |

### Error Handling Best Practices

```javascript
async function robustApiCall(url, payload) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 5000
      });

      const data = await response.json();

      // Handle success
      if (response.ok && data.status === 'success') {
        return data.data;
      }

      // Handle client errors (4xx) - don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${data.message}`);
      }

      // Handle server errors (5xx) - retry
      if (response.status >= 500) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error(`Server error after ${maxRetries} retries`);
        }
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
        continue;
      }

    } catch (error) {
      // Network errors - retry
      retryCount++;
      if (retryCount >= maxRetries) {
        throw new Error(`Network error after ${maxRetries} retries: ${error.message}`);
      }
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
    }
  }
}
```

---

## ✅ Best Practices

### 1. Security

✅ **Secure db-key Storage**
```javascript
// Good: Use environment variables
const dbKey = process.env.PSR_DB_KEY;

// Bad: Hardcode in source code
const dbKey = 'JOH1234'; // ❌ Never do this
```

✅ **HTTPS Only**
```javascript
// Good: Use HTTPS
const baseUrl = 'https://psr-v4.com/api';

// Bad: Use HTTP
const baseUrl = 'http://psr-v4.com/api'; // ❌ Insecure
```

✅ **Rotate db-keys Regularly**
- Contact Super Admin for db-key rotation
- Update all integrated systems
- Test thoroughly after rotation

### 2. Performance

✅ **Implement Caching**
```javascript
// Cache correction data for 1 hour
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

async function getCachedCorrections(machineId) {
  const cached = cache.get(machineId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchCorrections(machineId);
  cache.set(machineId, { data, timestamp: Date.now() });
  return data;
}
```

✅ **Use Connection Pooling**
```javascript
// Node.js example with axios
const axios = require('axios');
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const client = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 5000
});
```

✅ **Batch Requests When Possible**
```javascript
// Instead of multiple individual requests
async function getCorrectionsBatch(machineIds) {
  // If API supports batch operations, use it
  // Otherwise, use Promise.all for parallel requests
  return Promise.all(
    machineIds.map(id => getMachineCorrections(id))
  );
}
```

### 3. Reliability

✅ **Implement Retry Logic**
```javascript
async function retryWithExponentialBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

✅ **Set Appropriate Timeouts**
```javascript
const timeout = {
  connection: 5000,  // 5 seconds to establish connection
  response: 10000    // 10 seconds to receive response
};
```

✅ **Log All API Interactions**
```javascript
function logApiCall(endpoint, machineId, status, duration) {
  console.log({
    timestamp: new Date().toISOString(),
    endpoint,
    machineId,
    status,
    duration_ms: duration
  });
}
```

### 4. Data Validation

✅ **Validate Machine ID Format**
```javascript
function validateMachineId(machineId) {
  // Must start with 'M' followed by digits or alphanumeric
  const pattern = /^M[0-9A-Za-z]+$/;
  
  if (!pattern.test(machineId)) {
    throw new Error('Invalid machine ID format');
  }
  
  return machineId;
}
```

✅ **Validate Response Data**
```javascript
function validateCorrectionData(data) {
  const required = ['channel1', 'channel2', 'channel3'];
  const params = ['fat', 'snf', 'clr', 'temp', 'water', 'protein'];
  
  for (const channel of required) {
    if (!data.corrections[channel]) {
      throw new Error(`Missing ${channel} in corrections`);
    }
    
    for (const param of params) {
      if (typeof data.corrections[channel][param] !== 'number') {
        throw new Error(`Invalid ${param} value in ${channel}`);
      }
    }
  }
  
  return true;
}
```

---

## 🔒 Security Guidelines

### 1. db-key Protection

❌ **Never**:
- Commit db-key to version control
- Include db-key in client-side code
- Share db-key via email or chat
- Log db-key in plain text

✅ **Always**:
- Store db-key in environment variables
- Use secrets management systems
- Rotate db-key periodically
- Encrypt db-key at rest

### 2. Transport Security

✅ **Use HTTPS Only**
```javascript
// All API calls must use HTTPS
if (!apiUrl.startsWith('https://')) {
  throw new Error('HTTPS required for API calls');
}
```

✅ **Verify SSL Certificates**
```javascript
// Don't disable certificate verification
const axios = require('axios');

// Good
const client = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: true // ✅ Verify certificates
  })
});

// Bad
const badClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // ❌ Insecure!
  })
});
```

### 3. Input Validation

✅ **Sanitize All Inputs**
```javascript
function sanitizeMachineId(input) {
  // Remove any non-alphanumeric characters except 'M'
  return input.replace(/[^M0-9A-Za-z]/g, '');
}

function sanitizeStatus(status) {
  const validStatuses = ['pending', 'updated'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }
  return status;
}
```

### 4. Rate Limiting

✅ **Respect Rate Limits**
```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

// Usage: 100 requests per minute
const limiter = new RateLimiter(100, 60000);
await limiter.checkLimit();
```

---

## 🚦 Rate Limiting

### Current Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per db-key | 100 requests | 1 minute |
| Per IP address | 1000 requests | 1 hour |
| Burst limit | 10 requests | 1 second |

### Rate Limit Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699185600
```

### Handling Rate Limits

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    const waitSeconds = resetTime - Math.floor(Date.now() / 1000);
    
    console.log(`Rate limit exceeded. Waiting ${waitSeconds} seconds...`);
    await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
    
    // Retry the request
    return true;
  }
  return false;
}
```

---

## 🧪 Testing

### Test Environment

**Base URL**: `https://test.psr-v4.com/api`  
**Test db-key**: `TEST1234` (contact support for access)

### Sample Test Cases

#### Test 1: Valid Machine Correction Request

```bash
# Request
curl -X POST https://test.psr-v4.com/api/TEST1234/MachineCorrection/GetLatestMachineCorrection \
  -H "Content-Type: application/json" \
  -d '{"machineId": "M00001"}'

# Expected Response: 200 OK with correction data
```

#### Test 2: Invalid Machine ID

```bash
# Request
curl -X POST https://test.psr-v4.com/api/TEST1234/MachineCorrection/GetLatestMachineCorrection \
  -H "Content-Type: application/json" \
  -d '{"machineId": "INVALID"}'

# Expected Response: 400 Bad Request
{
  "status": "error",
  "message": "Invalid machine ID format",
  "error": {
    "code": "INVALID_MACHINE_ID",
    "details": "Machine ID must start with 'M' followed by numbers or alphanumeric characters"
  }
}
```

#### Test 3: Invalid db-key

```bash
# Request
curl -X POST https://test.psr-v4.com/api/INVALID/MachineCorrection/GetLatestMachineCorrection \
  -H "Content-Type: application/json" \
  -d '{"machineId": "M00001"}'

# Expected Response: 401 Unauthorized
```

### Integration Testing Checklist

- [ ] Test with numeric machine IDs (M00001, M223223)
- [ ] Test with alphanumeric machine IDs (M0000df, M0001ab)
- [ ] Test error handling for invalid IDs
- [ ] Test error handling for network failures
- [ ] Test retry logic with exponential backoff
- [ ] Test rate limiting behavior
- [ ] Test timeout handling
- [ ] Test concurrent requests
- [ ] Test caching implementation
- [ ] Test logging and monitoring

---

## 📞 Support

### Getting Help

**Documentation**:
- [Complete API Reference](03-api-reference/API_DOCUMENTATION.md)
- [Architecture Guide](02-architecture/ARCHITECTURE.md)
- [Machine Correction Details](04-features/MACHINE_CORRECTION_EXTERNAL_API.md)

**Contact**:
- Email: support@psr-v4.com
- Developer Portal: https://developers.psr-v4.com
- Issue Tracker: https://github.com/psr-v4/issues

### Reporting Issues

When reporting API issues, include:

1. **db-key** (masked if necessary: JOH****)
2. **Endpoint** being called
3. **Request payload** (sample)
4. **Response received** (including status code)
5. **Timestamp** of the issue
6. **Error messages** or logs

---

## 📝 Changelog

### Version 1.0 (November 5, 2025)

**Initial Release**:
- ✅ 5 external API endpoints
- ✅ db-key authentication system
- ✅ Alphanumeric machine ID support
- ✅ Complete documentation
- ✅ Integration examples (Node.js, Python, C#)
- ✅ Error handling guidelines
- ✅ Security best practices

---

## 📄 License

This API is proprietary to Poornasree Equipments Cloud (PSR-v4).  
Unauthorized use, distribution, or modification is prohibited.

**API Access**: Contact Super Admin for db-key assignment  
**Integration Support**: Available for approved partners

---

*Last Updated: November 5, 2025*  
*Version: 1.0*  
*Status: Production Ready*
