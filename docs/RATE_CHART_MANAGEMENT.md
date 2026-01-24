# Rate Chart Management System

## Overview
The Rate Chart Management system allows admins to upload and assign milk rate charts to societies and BMCs. Charts can be specific to individual societies or shared across all societies under a BMC.

## Database Schema

### Table: `rate_charts`
Located in each admin's schema (e.g., `tishnuthankappan_tis4782`)

```sql
CREATE TABLE `rate_charts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `shared_chart_id` INT NULL COMMENT 'Reference to master rate chart for shared data',
  `society_id` INT NULL COMMENT 'Reference to societies table (for society-assigned charts)',
  `bmc_id` INT NULL COMMENT 'Reference to bmcs table (for BMC-assigned charts)',
  `channel` ENUM('COW', 'BUF', 'MIX') NOT NULL COMMENT 'Milk channel type',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` VARCHAR(255) NOT NULL COMMENT 'Admin user who uploaded',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'Original CSV file name',
  `record_count` INT NOT NULL DEFAULT 0 COMMENT 'Number of rate records',
  `status` TINYINT(1) DEFAULT 1 COMMENT '1=Active, 0=Downloaded by machine',
  `is_bmc_assigned` TINYINT(1) DEFAULT 0 COMMENT '0=Society assigned, 1=BMC assigned',
  FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`bmc_id`) REFERENCES `bmcs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_society_id` (`society_id`),
  INDEX `idx_bmc_id` (`bmc_id`),
  INDEX `idx_channel` (`channel`),
  INDEX `idx_status` (`status`)
);
```

### Table: `rate_chart_data`
Stores the actual rate values

```sql
CREATE TABLE `rate_chart_data` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rate_chart_id` INT NOT NULL,
  `clr` DECIMAL(5,2) NOT NULL COMMENT 'Color/Degree value',
  `fat` DECIMAL(5,2) NOT NULL COMMENT 'Fat percentage',
  `snf` DECIMAL(5,2) NOT NULL COMMENT 'Solids-Not-Fat percentage',
  `rate` DECIMAL(10,2) NOT NULL COMMENT 'Rate per liter',
  FOREIGN KEY (`rate_chart_id`) REFERENCES `rate_charts`(`id`) ON DELETE CASCADE,
  INDEX `idx_rate_chart_id` (`rate_chart_id`),
  INDEX `idx_clr_fat_snf` (`clr`, `fat`, `snf`)
);
```

## Foreign Key Relationships

### Society Assignment
```
rate_charts.society_id → societies.id
```
- **Purpose**: Links rate chart to specific society
- **Constraint**: ON DELETE CASCADE - if society is deleted, its charts are deleted
- **Usage**: For society-specific rate charts

### BMC Assignment
```
rate_charts.bmc_id → bmcs.id
```
- **Purpose**: Links rate chart to BMC (shared across all societies under that BMC)
- **Constraint**: ON DELETE CASCADE - if BMC is deleted, its shared charts are deleted
- **Usage**: For BMC-wide rate charts that apply to multiple societies

### Society to BMC Relationship
```
societies.bmc_id → bmcs.id
```
- **Purpose**: Associates society with its parent BMC
- **Usage**: Determines which BMC-assigned charts a society can access

## Assignment Logic

### Priority System
When fetching rate charts for a society, the system follows this priority:

1. **Society-Specific Chart** (Priority 1)
   - `WHERE rc.society_id = ? AND rc.is_bmc_assigned = 0`
   - These are charts uploaded specifically for this society

2. **BMC-Assigned Chart** (Priority 2)
   - `WHERE rc.bmc_id = ? AND rc.is_bmc_assigned = 1`
   - These are charts shared across all societies under the BMC

### Query Example
```sql
SELECT 
  rc.id,
  rc.society_id,
  rc.bmc_id,
  rc.channel,
  rc.file_name,
  rc.is_bmc_assigned,
  CASE 
    WHEN rc.society_id = ? THEN 1  -- Society-specific (higher priority)
    ELSE 2                          -- BMC-assigned (lower priority)
  END as priority
FROM rate_charts rc
WHERE (
  (rc.society_id = ? AND rc.is_bmc_assigned = 0)  -- Society charts
  OR 
  (rc.bmc_id = ? AND rc.is_bmc_assigned = 1)      -- BMC charts
)
AND rc.status = 1  -- Only active charts
ORDER BY rc.channel ASC, priority ASC, rc.uploaded_at DESC
```

## External API Endpoint

### Endpoint: `/api/external/ratechart`
**Method**: GET  
**Authentication**: Bearer token (society users only)

#### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### JWT Payload Structure
```typescript
{
  id: number;              // Society database ID (societies.id)
  uid: string;             // Society code (societies.society_id)
  email: string;
  role: string;            // 'society'
  entityType: 'society';
  schemaName: string;      // Admin schema name
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Rate charts retrieved successfully",
  "data": {
    "society": {
      "id": 1,
      "name": "Nandini Society",
      "societyCode": "S-001",
      "bmcId": 5,
      "bmcName": "Central BMC"
    },
    "channels": {
      "COW": {
        "info": {
          "id": 314,
          "fileName": "cow_rates.csv",
          "channel": "COW",
          "uploadedAt": "2026-01-23T08:30:00.000Z",
          "recordCount": 16,
          "assignmentType": "society",
          "societyId": 1,
          "bmcId": null
        },
        "data": [
          {
            "fat": 3.0,
            "snf": 3.0,
            "clr": 7.0,
            "rate": 15.00
          }
        ]
      },
      "BUF": {
        "info": {
          "id": 315,
          "fileName": "buffalo_rates.csv",
          "channel": "BUF",
          "uploadedAt": "2026-01-23T08:31:00.000Z",
          "recordCount": 16,
          "assignmentType": "bmc",
          "societyId": null,
          "bmcId": 5
        },
        "data": [...]
      },
      "MIX": {
        "info": {...},
        "data": [...]
      }
    }
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Rate chart access is only available for societies"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "No active rate chart found for your society"
}
```

## Mobile App Integration

### Channel Mapping
The mobile app maps backend channel names to internal codes:

```dart
COW/BUFFALO/BUF/MIXED/MIX → CH1/CH2/CH3
```

| Backend | Mobile App | Display Name |
|---------|------------|--------------|
| COW     | CH1        | Cow          |
| BUF     | CH2        | Buffalo      |
| MIX     | CH3        | Mixed        |

### Service Implementation
File: `lib/services/api/rate_chart_service.dart`

```dart
Future<Map<String, dynamic>> fetchRateChart(String token) async {
  final response = await http.get(
    Uri.parse('${ApiConfig.baseUrl}/api/external/ratechart'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final backendChannels = data['data']['channels'] ?? {};
    final mappedChannels = <String, dynamic>{};
    
    // Map channels
    if (backendChannels['COW'] != null) mappedChannels['CH1'] = backendChannels['COW'];
    if (backendChannels['BUF'] != null) mappedChannels['CH2'] = backendChannels['BUF'];
    if (backendChannels['MIX'] != null) mappedChannels['CH3'] = backendChannels['MIX'];
    
    return {
      'success': true,
      'society': data['data']['society'],
      'channels': mappedChannels,
    };
  }
}
```

## Upload Process

### Web Admin Panel
1. Admin navigates to Rate Chart Management
2. Clicks "Upload Rate Chart"
3. Selects:
   - Channel (COW/BUF/MIX)
   - Assignment Type:
     - **Society**: Select specific society
     - **BMC**: Select BMC (applies to all societies under that BMC)
   - CSV file with rate data

### CSV Format
```csv
CLR,FAT,SNF,RATE
7,3.0,3.0,15.00
8,3.0,3.1,15.25
8,3.0,3.2,15.50
```

### Backend Upload Logic
File: `/api/user/ratechart/upload/route.ts`

1. **Delete existing charts** for same channel and assignment
   ```sql
   DELETE FROM rate_chart_data WHERE rate_chart_id IN (
     SELECT id FROM rate_charts 
     WHERE society_id = ? AND channel = ? AND is_bmc_assigned = 0
   )
   ```

2. **Insert new chart**
   ```sql
   INSERT INTO rate_charts 
   (society_id, bmc_id, channel, file_name, record_count, is_bmc_assigned, status)
   VALUES (?, ?, ?, ?, ?, ?, 1)
   ```

3. **Insert rate data**
   ```sql
   INSERT INTO rate_chart_data (rate_chart_id, clr, fat, snf, rate)
   VALUES (?, ?, ?, ?, ?)
   ```

## Testing Guide

### 1. Test Society-Specific Chart
```bash
# Upload COW chart for Society ID 1
POST /api/user/ratechart/upload
{
  "channel": "COW",
  "societyIds": [1],
  "csvData": "CLR,FAT,SNF,RATE\n7,3,3,15"
}

# Verify in mobile app
GET /api/external/ratechart
Authorization: Bearer <society_1_token>
# Should return: channels.COW.info.assignmentType = "society"
```

### 2. Test BMC-Assigned Chart
```bash
# Upload BUFFALO chart for BMC ID 5
POST /api/user/ratechart/upload
{
  "channel": "BUF",
  "bmcId": 5,
  "csvData": "CLR,FAT,SNF,RATE\n7,3,3,16"
}

# Verify in mobile app (any society under BMC 5)
GET /api/external/ratechart
Authorization: Bearer <society_under_bmc_5_token>
# Should return: channels.BUF.info.assignmentType = "bmc"
```

### 3. Test Priority System
```bash
# Scenario: BMC chart exists, then upload society-specific chart
# Step 1: Upload BMC chart
POST /api/user/ratechart/upload
{
  "channel": "MIX",
  "bmcId": 5,
  "csvData": "CLR,FAT,SNF,RATE\n7,3,3,17"
}

# Step 2: Fetch - should get BMC chart
GET /api/external/ratechart
# Returns: channels.MIX.info.assignmentType = "bmc"

# Step 3: Upload society-specific chart
POST /api/user/ratechart/upload
{
  "channel": "MIX",
  "societyIds": [1],
  "csvData": "CLR,FAT,SNF,RATE\n7,3,3,18"
}

# Step 4: Fetch again - should get society chart (higher priority)
GET /api/external/ratechart
# Returns: channels.MIX.info.assignmentType = "society"
```

## Troubleshooting

### Issue: Mobile app shows "No data for this channel"

**Check 1: Verify chart exists in database**
```sql
SELECT id, channel, society_id, bmc_id, is_bmc_assigned, status
FROM rate_charts
WHERE (society_id = 1 OR bmc_id = 5) AND channel = 'COW';
```

**Check 2: Verify society's BMC association**
```sql
SELECT id, name, society_id, bmc_id 
FROM societies 
WHERE id = 1;
```

**Check 3: Check chart status**
- `status = 1` means active
- `status = 0` means downloaded/inactive

**Check 4: Verify JWT payload**
```javascript
// Decode mobile app token
const payload = jwt.verify(token, JWT_SECRET);
console.log('Society ID:', payload.id);  // Should match societies.id
console.log('Schema:', payload.schemaName);
```

### Issue: Getting wrong chart data

**Verify assignment type**
```sql
SELECT 
  rc.id,
  rc.channel,
  rc.society_id,
  rc.bmc_id,
  rc.is_bmc_assigned,
  s.name as society_name,
  b.name as bmc_name
FROM rate_charts rc
LEFT JOIN societies s ON rc.society_id = s.id
LEFT JOIN bmcs b ON rc.bmc_id = b.id
WHERE rc.channel = 'COW' AND rc.status = 1;
```

## API Logging

### Backend Logs
```
✅ Fetching rate charts for society: Nandini Society (ID: 1, Society Code: S-001, BMC ID: 5)
📊 Found 3 rate chart(s) for society Nandini Society
  ✅ COW: Chart ID 314 (Society-specific) - 16 records
  ✅ BUF: Chart ID 315 (BMC-assigned) - 16 records
  ✅ MIX: Chart ID 316 (Society-specific) - 16 records
✅ Successfully retrieved 3 channel(s): COW, BUF, MIX
```

### Mobile App Logs
```
📊 Fetching rate chart data for all channels...
📊 Rate Chart Response Status: 200
ℹ️  Society: Nandini Society (Code: S-001)
ℹ️  BMC: Central BMC (ID: 5)
📊 Available channels: COW, BUF, MIX
  ✅ COW (CH1): 16 records (Society-specific)
  ✅ BUFFALO (CH2): 16 records (BMC-assigned)
  ✅ MIXED (CH3): 16 records (Society-specific)
```

## Security Considerations

1. **Authentication**: Only societies can access this endpoint
2. **Authorization**: Society can only see charts assigned to them or their BMC
3. **Schema Isolation**: Each admin's data is in separate schema
4. **Token Validation**: JWT must contain valid `id`, `schemaName`, and `entityType`
5. **CORS**: Configured for mobile app access

## Performance Optimization

1. **Indexed Columns**: 
   - `society_id`, `bmc_id`, `channel`, `status`
   - Enables fast lookups

2. **Single Query for All Channels**:
   - Fetches all 3 channels in one database query
   - Reduces network overhead

3. **Caching**: Mobile app caches response
   - Reduces API calls
   - Provides offline access

4. **Priority in SQL**:
   - Uses CASE statement for priority
   - Avoids multiple queries or application-level sorting
