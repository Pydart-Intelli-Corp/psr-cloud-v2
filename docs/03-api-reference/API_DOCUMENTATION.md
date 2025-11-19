# PSR-v4 API Documentation

**Poornasree Equipments Cloud - REST API Reference**

---

## 📋 Overview

The PSR-v4 API provides comprehensive endpoints for managing dairy equipment operations across a multi-tenant, role-based hierarchy. Built with Next.js 16 API routes, the system supports authentication, authorization, and complete CRUD operations for all entities.

**Base URL**: `/api`  
**Authentication**: JWT Bearer Token (Internal APIs) / DB Key (External APIs)  
**Content Type**: `application/json`  
**API Version**: v1.0  
**Total Endpoints**: 40+ (35+ Internal + 5 External)  
**Last Updated**: November 5, 2025

---

## 🔐 Authentication

### JWT Token Structure
```typescript
interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

### Headers Required
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Lifecycle
- **Access Token**: 7 days expiry
- **Refresh Token**: 30 days expiry
- **Storage**: HTTP-only cookies + localStorage
- **Rotation**: Automatic on refresh

---

## 👥 User Roles & Permissions

### Role Hierarchy
```
super_admin → admin → dairy → bmc → society → farmer
```

### Permission Matrix
| Resource | Super Admin | Admin | Dairy | BMC | Society | Farmer |
|----------|------------|-------|-------|-----|---------|--------|
| Users | Full | Own Schema | Read | Read | Read | Own Profile |
| Dairies | Read All | Full | Own | Read | Read | Read |
| BMCs | Read All | Full | Full | Own | Read | Read |
| Societies | Read All | Full | Full | Full | Own | Read |
| Farmers | Read All | Full | Full | Full | Full | Own |
| Machines | Read All | Full | Full | Full | Own | Read |

---

## 📚 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "admin",
  "companyName": "ABC Dairy Ltd",
  "companyPincode": "560001",
  "companyCity": "Bangalore",
  "companyState": "Karnataka"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "uid": "PSR_1640995200_A1B2C3",
    "email": "john@example.com",
    "status": "pending_email_verification"
  }
}
```

**Validation Rules:**
- Email: Valid format, MX record check, typo detection
- Password: Minimum 8 characters, complexity requirements
- Name: 2-50 characters
- Pincode: Valid Indian pincode format

---

#### POST /api/auth/verify-otp
Verify email with OTP code.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "status": "pending_approval", // for admin role
    "nextStep": "wait_for_approval"
  }
}
```

---

#### POST /api/auth/login
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "uid": "PSR_1640995200_A1B2C3",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "dbKey": "JOH1234",
      "companyName": "ABC Dairy Ltd"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `423`: Account locked (too many attempts)
- `403`: Account not verified/approved

---

#### POST /api/auth/check-status
Check account verification and approval status.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "pending_approval",
    "email_verified": true,
    "admin_approved": false,
    "can_login": false,
    "message": "Your account is pending admin approval."
  }
}
```

---

### Super Admin Endpoints

#### GET /api/superadmin/approvals
Get pending admin approval requests. **Requires: super_admin role**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "companyName": "ABC Dairy Ltd",
      "companyCity": "Bangalore",
      "companyState": "Karnataka",
      "createdAt": "2024-12-28T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/superadmin/approvals
Approve or reject admin applications. **Requires: super_admin role**

**Request Body:**
```json
{
  "userId": 1,
  "action": "approve", // or "reject"
  "reason": "Application meets requirements" // optional for rejection
}
```

**Response (200) - Approve:**
```json
{
  "success": true,
  "message": "Admin approved successfully",
  "data": {
    "dbKey": "JOH1234",
    "schemaCreated": true,
    "emailSent": true
  }
}
```

---

### User Profile Endpoints

#### GET /api/user/profile
Get current user profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uid": "PSR_1640995200_A1B2C3",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "dbKey": "JOH1234",
    "companyName": "ABC Dairy Ltd",
    "companyPincode": "560001",
    "companyCity": "Bangalore",
    "companyState": "Karnataka",
    "emailVerified": true,
    "status": "active",
    "lastLoginAt": "2024-12-28T10:00:00.000Z",
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
}
```

---

#### PUT /api/user/profile
Update user profile information.

**Request Body:**
```json
{
  "fullName": "John Smith Doe",
  "companyName": "ABC Dairy Industries Ltd",
  "companyPincode": "560002",
  "companyCity": "Bangalore",
  "companyState": "Karnataka"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "updated": true,
    "changes": ["fullName", "companyName", "companyPincode"]
  }
}
```

---

### Dairy Management Endpoints

#### GET /api/user/dairy
Get dairy facilities for current admin. **Requires: admin role**

**Query Parameters:**
- `id`: Specific dairy ID (optional)
- `search`: Search by name/location (optional)
- `status`: Filter by status (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Central Dairy Farm",
      "dairyId": "CDF001",
      "location": "Bangalore Rural",
      "contactPerson": "Ram Kumar",
      "phone": "+91-9876543210",
      "email": "ram@centraldairy.com",
      "capacity": 5000,
      "status": "active",
      "monthlyTarget": 150000,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "stats": {
        "bmcCount": 5,
        "societyCount": 25,
        "farmerCount": 500
      }
    }
  ]
}
```

---

#### POST /api/user/dairy
Create a new dairy facility. **Requires: admin role**

**Request Body:**
```json
{
  "name": "North Dairy Farm",
  "password": "DairyPass123!",
  "dairyId": "NDF002",
  "location": "Mysore",
  "contactPerson": "Shyam Kumar",
  "phone": "+91-9876543211",
  "email": "shyam@northdairy.com",
  "capacity": 3000,
  "status": "active",
  "monthlyTarget": 100000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Dairy created successfully",
  "data": {
    "id": 2,
    "dairyId": "NDF002",
    "name": "North Dairy Farm",
    "status": "active"
  }
}
```

---

#### PUT /api/user/dairy
Update existing dairy facility. **Requires: admin role**

**Request Body:**
```json
{
  "id": 1,
  "name": "Central Dairy Farm Updated",
  "location": "Bangalore Rural District",
  "capacity": 6000,
  "monthlyTarget": 180000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dairy updated successfully",
  "data": {
    "updated": true,
    "changes": ["name", "location", "capacity", "monthlyTarget"]
  }
}
```

---

#### DELETE /api/user/dairy
Delete dairy facility. **Requires: admin role**

**Request Body:**
```json
{
  "id": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dairy deleted successfully",
  "data": {
    "deleted": true,
    "id": 2
  }
}
```

---

### BMC Management Endpoints

#### GET /api/user/bmc
Get BMC facilities for current admin. **Requires: admin role**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Central BMC Unit",
      "bmcId": "BMC001",
      "dairyFarmId": 1,
      "dairyFarmName": "Central Dairy Farm",
      "location": "Whitefield",
      "contactPerson": "Raj Patel",
      "phone": "+91-9876543212",
      "email": "raj@centralbmc.com",
      "capacity": 1000,
      "status": "active",
      "monthlyTarget": 30000,
      "createdAt": "2024-12-01T11:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/user/bmc
Create a new BMC facility. **Requires: admin role**

**Request Body:**
```json
{
  "name": "South BMC Unit",
  "password": "BMCPass123!",
  "bmcId": "BMC002",
  "dairyFarmId": 1,
  "location": "Koramangala",
  "contactPerson": "Priya Sharma",
  "phone": "+91-9876543213",
  "email": "priya@southbmc.com",
  "capacity": 800,
  "status": "active",
  "monthlyTarget": 25000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "BMC created successfully",
  "data": {
    "id": 2,
    "bmcId": "BMC002",
    "name": "South BMC Unit",
    "status": "active"
  }
}
```

---

### Society Management Endpoints

#### GET /api/user/society
Get society entities for current admin. **Requires: admin role**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Farmers Cooperative Society",
      "societyId": "FCS001",
      "location": "Hebbal",
      "presidentName": "Ganesh Rao",
      "contactPhone": "+91-9876543214",
      "bmcId": 1,
      "bmcName": "Central BMC Unit",
      "status": "active",
      "createdAt": "2024-12-01T12:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/user/society
Create a new society. **Requires: admin role**

**Request Body:**
```json
{
  "name": "Village Dairy Society",
  "password": "SocietyPass123!",
  "societyId": "VDS002",
  "location": "Yelahanka",
  "presidentName": "Kumar Swamy",
  "contactPhone": "+91-9876543215",
  "bmcId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Society created successfully",
  "data": {
    "id": 2,
    "societyId": "VDS002",
    "name": "Village Dairy Society",
    "status": "active"
  }
}
```

---

### Machine Management Endpoints

#### GET /api/user/machine
Get machines for current admin. **Requires: admin role**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "machineId": "M2232",
      "machineType": "Milk Collection Unit",
      "societyId": 1,
      "societyName": "Farmers Cooperative Society",
      "location": "Hebbal Center",
      "installationDate": "2024-11-15",
      "operatorName": "Suresh Kumar",
      "contactPhone": "+91-9876543216",
      "status": "active",
      "notes": "Regular maintenance required",
      "createdAt": "2024-12-01T13:00:00.000Z"
    }
  ]
}
```

---

#### GET /api/user/machine/by-society
Get machines filtered by society ID. **Requires: admin role**

**Query Parameters:**
- `societyId`: Society ID to filter machines (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "machineId": "M2232",
      "machineType": "Milk Collection Unit",
      "societyId": 1,
      "societyName": "Farmers Cooperative Society",
      "location": "Hebbal Center",
      "installationDate": "2024-11-15",
      "operatorName": "Suresh Kumar",
      "contactPhone": "+91-9876543216",
      "status": "active",
      "notes": "Regular maintenance required",
      "createdAt": "2024-12-01T13:00:00.000Z"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Society ID is required"
}
```

---

#### POST /api/user/machine
Create a new machine entry. **Requires: admin role**

**Request Body:**
```json
{
  "machineId": "MCH002",
  "machineType": "Cooling Tank",
  "societyId": 1,
  "location": "Society Premises",
  "installationDate": "2024-12-01",
  "operatorName": "Ramesh Babu",
  "contactPhone": "+91-9876543217",
  "status": "active",
  "notes": "New installation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Machine created successfully",
  "data": {
    "id": 2,
    "machineId": "MCH002",
    "machineType": "Cooling Tank",
    "status": "active"
  }
}
```

---

#### PUT /api/user/machine/[id]/status
Update machine status. **Requires: admin role**

**Request Body:**
```json
{
  "status": "maintenance"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Machine status updated successfully",
  "data": {
    "id": 1,
    "status": "maintenance",
    "updatedAt": "2024-12-28T14:00:00.000Z"
  }
}
```

---

### Farmer Management Endpoints

#### GET /api/user/farmer
Get farmers for current admin. **Requires: admin role**

**Query Parameters:**
- `id`: Specific farmer ID (optional)
- `societyId`: Filter by society (optional)
- `bmcId`: Filter by BMC (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ravi Krishnan",
      "farmerId": "FMR001",
      "phone": "+91-9876543218",
      "address": "Village Road, Hebbal",
      "societyId": 1,
      "societyName": "Farmers Cooperative Society",
      "machineId": 1,
      "machineName": "M2232 - Milk Collection Unit",
      "bmcId": 1,
      "bmcName": "Central BMC Unit",
      "cattleCount": 25,
      "buffaloCount": 15,
      "avgMilkPerDay": 120.5,
      "bonus": 2500.75,
      "status": "active",
      "createdAt": "2024-12-01T14:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/user/farmer
Create a new farmer entry. **Requires: admin role**

**Request Body:**
```json
{
  "name": "Lakshmi Devi",
  "farmerId": "FMR002",
  "phone": "+91-9876543219",
  "address": "Main Street, Yelahanka",
  "societyId": 1,
  "machineId": 2,
  "bmcId": 1,
  "cattleCount": 20,
  "buffaloCount": 10,
  "avgMilkPerDay": 95.5,
  "bonus": 1800.50
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Farmer created successfully",
  "data": {
    "id": 2,
    "farmerId": "FMR002",
    "name": "Lakshmi Devi",
    "status": "active"
  }
}
```

---

#### POST /api/user/farmer/upload
Upload farmers from CSV file. **Requires: admin role**

**Request Type:** `multipart/form-data`

**Form Data:**
- `file`: CSV file containing farmer data
- `societyId`: Society ID for CSV farmers (string)
- `machineId`: Machine ID for CSV farmers (string, required)

**CSV Format:**
```csv
ID,RF-ID,NAME,MOBILE,SMS,BONUS
FMR003,RF001,Suresh Kumar,9876543220,ON,2000
FMR004,RF002,Meera Patel,9876543221,OFF,1500
```

**Response (200):**
```json
{
  "success": true,
  "message": "CSV upload completed",
  "data": {
    "successCount": 2,
    "errorCount": 0,
    "errors": [],
    "totalProcessed": 2
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Machine ID is required"
}
```

---

## 🔧 Database Schema Structure

### Multi-Tenant Architecture

#### Master Database Tables
```sql
-- Main user accounts
users (id, uid, fullName, email, password, role, dbKey, ...)

-- Admin schema metadata
admin_schemas (id, adminId, dbKey, schemaName, createdAt)

-- System audit logs
audit_logs (id, userId, action, details, timestamp)
```

#### Admin-Specific Schema Tables
```sql
-- Schema naming: {adminName}_{dbKey}
-- Example: "john_JOH1234"

dairy_farms (id, name, dairyId, location, contactPerson, ...)
bmcs (id, name, bmcId, dairyFarmId, location, ...)
societies (id, name, societyId, location, bmcId, ...)
farmers (id, name, farmerId, societyId, machineId, bmcId, ...)
machines (id, machineId, machineType, societyId, ...)
```

---

## 🛡️ Security Implementation

### Authentication Flow
1. **Login Request**: Email + Password validation
2. **JWT Generation**: Access (7d) + Refresh (30d) tokens
3. **Token Storage**: HTTP-only cookies + localStorage
4. **Request Validation**: Bearer token verification
5. **Role Authorization**: Permission matrix validation

### Data Protection
- **Input Sanitization**: XSS prevention, SQL injection protection
- **Password Security**: bcrypt hashing (10 rounds)
- **Rate Limiting**: 5 login attempts per IP/user
- **Account Lockout**: 2-hour temporary lock
- **Audit Logging**: All actions tracked with timestamp

### Multi-Tenant Isolation
- **Schema Separation**: Complete database isolation per admin
- **Access Control**: Users can only access their schema
- **Query Filtering**: Automatic admin context injection
- **Data Validation**: Cross-tenant access prevention

---

## 📊 Response Formats

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data object
  },
  "timestamp": "2024-12-28T10:00:00.000Z"
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional error information"
  },
  "timestamp": "2024-12-28T10:00:00.000Z"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **423**: Locked (account locked)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

---

---

## 🔌 External API Endpoints

The PSR-v4 system provides specialized external API endpoints designed for integration with partner systems, external devices, and third-party applications. These endpoints use a simplified authentication model based on database keys (`db-key`) and support both GET and POST methods for maximum compatibility.

### Authentication Model
- **Database Key (`db-key`)**: Used in the URL path to identify the admin/organization
- **No JWT Required**: External APIs don't require Bearer tokens
- **InputString Format**: All parameters passed as a single pipe-separated string
- **Security**: Generic error messages to prevent information leakage

### Common Features
- **Dual Method Support**: Both GET (query parameter) and POST (body) requests
- **Machine ID Format**: All machine IDs use `M` prefix (e.g., `M00001`, `M0000df`)
- **Alphanumeric Support**: Machine IDs can be numeric (`M00001`) or alphanumeric (`M0000df`, `Mabc123`)
- **Variant Matching**: Automatic matching with/without leading zeros (`M0000df` matches `df` or `0000df`)
- **Error Handling**: Consistent quoted string responses with 200/400/404 status codes

---

### 1. GetLatestMachineCorrection

Retrieve the latest machine correction values for all three channels of a specific machine.

**Endpoint:**
```
GET/POST /api/[db-key]/MachineCorrection/GetLatestMachineCorrection
```

**Input Format:**
```
InputString=societyId|machineType|version|machineId
```

**Example:**
```
S-s12|ECOD|LE3.34|M00001
```

**Parameters:**
- `societyId`: Society ID (with or without `S-` prefix)
- `machineType`: Machine type (e.g., ECOD, DPST-G)
- `version`: Machine model/version (e.g., LE3.34)
- `machineId`: Machine ID with M prefix - supports numeric (`M00001`) or alphanumeric (`M0000df`)

**Response Format:**
```
"DD-MM-YYYY HH:mm:ss AM/PM||1|fat|snf|clr|temp|water|protein||2|fat|snf|clr|temp|water|protein||3|fat|snf|clr|temp|water|protein"
```

**Example Response:**
```
"23-07-2025 12:52:08 PM||1|1.00|9.00|67.00|9.00|8.00|0.00||2|1.00|9.00|67.00|9.00|8.00|0.00||3|1.00|9.00|67.00|9.00|8.00|0.00"
```

**Field Breakdown:**
- **Date/Time**: `DD-MM-YYYY HH:mm:ss AM/PM`
- **Channel 1-3** (each): `channel_number|fat|snf|clr|temp|water|protein`
- **Separators**: `||` between date and channels, and between each channel

**Error Responses:**
- `"Machine correction not found."` (200) - No correction data found
- `"Invalid DB Key"` (404) - Admin not found
- `"Invalid machine ID format"` (400) - Machine ID validation failed

**cURL Examples:**
```bash
# GET Request
curl "http://localhost:3000/api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M00001"

# POST Request (JSON)
curl -X POST "http://localhost:3000/api/MAN5678/MachineCorrection/GetLatestMachineCorrection" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001"}'

# POST Request (Form Data)
curl -X POST "http://localhost:3000/api/MAN5678/MachineCorrection/GetLatestMachineCorrection" \
  -d "InputString=S-s12|ECOD|LE3.34|M00001"

# Alphanumeric Machine ID
curl "http://localhost:3000/api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M0000df"
```

---

### 2. SaveMachineCorrectionUpdationHistory

Update the status of a machine correction record (sets status=0 to mark as processed).

**Endpoint:**
```
GET/POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory
```

**Input Format:**
```
InputString=societyId|machineType|version|machineId
```

**Example:**
```
S-s12|ECOD|LE3.34|M00001
```

**Response:**
```
"Machine correction status updated successfully."
```

**Error Responses:**
- `"Machine correction not found."` (200) - No correction record found
- `"Invalid DB Key"` (404) - Admin not found
- `"Invalid machine ID format"` (400) - Machine ID validation failed

**cURL Examples:**
```bash
# GET Request
curl "http://localhost:3000/api/MAN5678/MachineCorrection/SaveMachineCorrectionUpdationHistory?InputString=S-s12|ECOD|LE3.34|M00001"

# POST Request
curl -X POST "http://localhost:3000/api/MAN5678/MachineCorrection/SaveMachineCorrectionUpdationHistory" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001"}'
```

---

### 3. GetLatestFarmerInfo

Fetch farmer information for a specific society and machine with support for pagination or full CSV download.

**Endpoint:**
```
GET/POST /api/[db-key]/FarmerInfo/GetLatestFarmerInfo
```

**Input Format (Paginated):**
```
InputString=societyId|machineType|version|machineId|pageNumber
```

**Input Format (CSV Download):**
```
InputString=societyId|machineType|version|machineId
```

**Examples:**
```
# Paginated (Page 1, 5 records)
S-1|ECOD|LE2.00|M00001|C00001

# CSV Download (All records)
S-1|ECOD|LE2.00|M00001
```

**Parameters:**
- `societyId`: Society ID (with or without `S-` prefix)
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine ID with M prefix - supports numeric/alphanumeric
- `pageNumber`: Optional - `C00001` for page 1, `C00002` for page 2, etc.

**Response Format (Paginated):**
```
"id|farmer_id|name|phone|sms_enabled|bonus||id|farmer_id|name|phone|sms_enabled|bonus||..."
```

**Example Response (Paginated):**
```
"6|11116|John Doe|9446024636|ON|0.11||7|11117|Jane Smith|9446024637|OFF|0.12"
```

**Response Format (CSV Download):**
- **Content-Type**: `text/csv`
- **Filename**: `FarmerDetails.csv`
- **Header**: `ID,RF-ID,NAME,MOBILE,SMS,BONUS`

**Example CSV:**
```csv
ID,RF-ID,NAME,MOBILE,SMS,BONUS
213,1,John Doe,9446024631,OFF,11
222,10,Jane Smith,9446024640,ON,0
```

**Pagination:**
- Page size: 5 records per page
- `C00001` = Page 1 (offset 0)
- `C00002` = Page 2 (offset 5)
- `C00003` = Page 3 (offset 10)

**Error Responses:**
- `"Farmer info not found."` (200) - No farmers found
- `"Invalid DB Key"` (404) - Admin not found
- `"Failed to download farmer. Invalid token."` (400) - Invalid society ID
- `"Failed to download farmer. Invalid machine details."` (400) - Invalid machine ID

**cURL Examples:**
```bash
# Paginated Request
curl "http://localhost:3000/api/MAN5678/FarmerInfo/GetLatestFarmerInfo?InputString=S-1|ECOD|LE2.00|M00001|C00001"

# CSV Download
curl "http://localhost:3000/api/MAN5678/FarmerInfo/GetLatestFarmerInfo?InputString=S-1|ECOD|LE2.00|M00001"

# POST Request
curl -X POST "http://localhost:3000/api/MAN5678/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-1|ECOD|LE2.00|M00001"}'
```

---

### 4. GetLatestMachinePassword

Retrieve user or supervisor password for a specific machine.

**Endpoint:**
```
GET/POST /api/[db-key]/MachinePassword/GetLatestMachinePassword
```

**Input Format:**
```
InputString=societyId|machineType|version|machineId|passwordType
```

**Example:**
```
S-s12|ECOD|LE3.34|M00001|U
```

**Parameters:**
- `societyId`: Society ID (with or without `S-` prefix)
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine ID with M prefix - supports numeric/alphanumeric
- `passwordType`: `U` for User password, `S` for Supervisor password

**Response Format:**
```
"password_value"
```

**Example Responses:**
```
"123456"    // User password
"000000"    // Supervisor password
```

**Error Responses:**
- `"Machine password not found."` (200) - Machine or password not found
- `"Invalid DB Key"` (404) - Admin not found
- `"Failed to get password. Invalid machine details."` (400) - Invalid machine ID
- `"Failed to get password. Invalid token."` (400) - Invalid society ID
- `"Invalid password type. Must be U or S"` (400) - Invalid password type

**cURL Examples:**
```bash
# Get User Password
curl "http://localhost:3000/api/MAN5678/MachinePassword/GetLatestMachinePassword?InputString=S-s12|ECOD|LE3.34|M00001|U"

# Get Supervisor Password
curl "http://localhost:3000/api/MAN5678/MachinePassword/GetLatestMachinePassword?InputString=S-s12|ECOD|LE3.34|M00001|S"

# POST Request
curl -X POST "http://localhost:3000/api/MAN5678/MachinePassword/GetLatestMachinePassword" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001|U"}'

# Alphanumeric Machine ID
curl "http://localhost:3000/api/MAN5678/MachinePassword/GetLatestMachinePassword?InputString=S-s12|ECOD|LE3.34|M0000df|U"
```

---

### 5. UpdateMachinePasswordStatus

Update password status flag (statusU or statusS) to 0, effectively marking the password as "acknowledged" or "processed" by the external system.

**Endpoint:**
```
GET/POST /api/[db-key]/MachinePassword/UpdateMachinePasswordStatus
```

**Input Format:**
```
InputString=societyId|machineType|version|machineId|passwordType
```

**Example:**
```
S-s12|ECOD|LE3.34|M00001|U
```

**Parameters:**
- `societyId`: Society ID (with or without `S-` prefix)
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine ID with M prefix - supports numeric/alphanumeric
- `passwordType`: `U` to update statusU, `S` to update statusS

**Response:**
```
"User password status updated to 0 for machine <machine_id>"
```
or
```
"Supervisor password status updated to 0 for machine <machine_id>"
```

**Error Responses:**
- `"Machine not found"` (404) - Machine doesn't exist
- `"Invalid DB Key"` (404) - Admin not found
- `"Invalid machine ID format"` (400) - Machine ID validation failed
- `"Invalid society ID"` (400) - Society not found
- `"Invalid password type. Must be U or S"` (400) - Invalid password type

**cURL Examples:**
```bash
# Update User Password Status
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M00001|U"

# Update Supervisor Password Status
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M00001|S"

# POST Request
curl -X POST "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001|U"}'
```

---

### Machine ID Support

All external API endpoints support both **numeric** and **alphanumeric** machine IDs with flexible variant matching:

#### Numeric Machine IDs
- **Format**: `M` followed by digits only
- **Examples**: `M00001`, `M223223`, `M99999`
- **Processing**: Leading zeros removed, parsed as integer
- **Database Matching**: Direct integer comparison (`id = 1`)

#### Alphanumeric Machine IDs
- **Format**: `M` followed by letters and numbers
- **Examples**: `M0000df`, `Mabc123`, `Mxyz789`
- **Processing**: Creates variants with/without leading zeros
- **Database Matching**: String comparison with variants (`machine_id IN ('0000df', 'df')`)

#### Variant Matching Logic

**Example 1: `M0000df`**
- Removes `M` prefix → `0000df`
- Creates variants: `['0000df', 'df']`
- SQL Query: `machine_id IN ('0000df', 'df')`
- Matches database entries: `0000df` OR `df`

**Example 2: `M00001`**
- Removes `M` prefix → `00001`
- Parses as integer → `1`
- SQL Query: `id = 1`
- Direct numeric match (backward compatible)

**Example 3: `Mabc123`**
- Removes `M` prefix → `abc123`
- No leading zeros to strip
- Creates variant: `['abc123']`
- SQL Query: `machine_id IN ('abc123')`

#### Invalid Machine ID Formats
- Missing `M` prefix: `00001` ❌
- Special characters: `M@001`, `M-abc` ❌
- Empty after M: `M` ❌
- Spaces: `M 001` ❌

---

### External API Best Practices

#### 1. Error Handling
```javascript
const response = await fetch(apiUrl);
const text = await response.text();

// All responses are quoted strings
const data = text.replace(/^"|"$/g, ''); // Remove quotes

if (response.status === 404) {
  console.error('Admin or resource not found');
} else if (response.status === 400) {
  console.error('Validation error:', data);
} else if (data.includes('not found')) {
  console.log('No data available');
} else {
  // Process successful response
  console.log('Data:', data);
}
```

#### 2. Machine ID Format
```javascript
// Always include M prefix
const machineId = 'M00001';  // ✅ Correct
const machineId = '00001';   // ❌ Wrong

// Alphanumeric support
const machineId = 'M0000df'; // ✅ Correct
const machineId = 'Mabc123'; // ✅ Correct
```

#### 3. InputString Construction
```javascript
// Build InputString from components
const societyId = 'S-s12';
const machineType = 'ECOD';
const version = 'LE3.34';
const machineId = 'M00001';
const passwordType = 'U';

const inputString = [societyId, machineType, version, machineId, passwordType]
  .filter(Boolean)
  .join('|');

// Result: "S-s12|ECOD|LE3.34|M00001|U"
```

#### 4. Response Parsing

**Machine Correction:**
```javascript
const response = "23-07-2025 12:52:08 PM||1|1.00|9.00|67.00|9.00|8.00|0.00||2|1.00|9.00|67.00|9.00|8.00|0.00||3|1.00|9.00|67.00|9.00|8.00|0.00";

const parts = response.replace(/^"|"$/g, '').split('||');
const dateTime = parts[0]; // "23-07-2025 12:52:08 PM"

// Parse channel data
for (let i = 1; i < parts.length; i++) {
  const [channel, fat, snf, clr, temp, water, protein] = parts[i].split('|');
  console.log(`Channel ${channel}:`, { fat, snf, clr, temp, water, protein });
}
```

**Farmer Info (Paginated):**
```javascript
const response = "6|11116|John Doe|9446024636|ON|0.11||7|11117|Jane Smith|9446024637|OFF|0.12";

const farmers = response.replace(/^"|"$/g, '').split('||').map(farmerStr => {
  const [id, farmerId, name, phone, smsEnabled, bonus] = farmerStr.split('|');
  return { id, farmerId, name, phone, smsEnabled, bonus };
});
```

#### 5. Integration Security
- **Never expose `db-key` publicly**: Store securely in environment variables
- **Validate responses**: Check for error messages before processing data
- **Rate limiting**: Implement client-side throttling (max 100 req/min)
- **Retry logic**: Implement exponential backoff for failed requests
- **Logging**: Log all API calls with timestamps for debugging

---

## 🔄 Rate Limiting

### Current Limits
- **Authentication**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **File Upload**: 10 requests per minute per user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 API Testing

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Dairies:**
```bash
curl -X GET http://localhost:3000/api/user/dairy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create BMC:**
```bash
curl -X POST http://localhost:3000/api/user/bmc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test BMC",
    "password": "BMCPass123!",
    "bmcId": "TEST001",
    "dairyFarmId": 1,
    "location": "Test Location"
  }'
```

---

## 📚 SDK and Libraries

### JavaScript/TypeScript SDK (Planned)
```typescript
import { PSRClient } from 'psr-v4-sdk';

const client = new PSRClient({
  baseUrl: 'https://api.psr-v4.com',
  apiKey: 'your-api-key'
});

const dairies = await client.dairy.list();
const newBmc = await client.bmc.create({
  name: 'New BMC',
  bmcId: 'BMC123'
});
```

---

## 📋 Changelog

### Version 1.0 (December 28, 2024)
- ✅ Complete authentication system
- ✅ Multi-tenant architecture implementation
- ✅ Dairy, BMC, Society, Farmer, Machine management
- ✅ JWT-based security with role-based access
- ✅ Comprehensive error handling and validation

### Planned Features
- [ ] Real-time WebSocket endpoints
- [ ] Bulk operation APIs
- [ ] Advanced filtering and sorting
- [ ] File upload endpoints
- [ ] Analytics and reporting APIs
- [ ] Notification system APIs

---

## 🤝 Support

For API support and questions:
- **Documentation**: See `/docs` directory
- **Issues**: File bug reports in project repository
- **Email**: Contact development team

---

**API Documentation Version**: 1.0  
**Last Updated**: November 5, 2025  
**Maintained By**: PSR-v4 Development Team