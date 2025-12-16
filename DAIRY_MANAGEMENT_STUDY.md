# Dairy Management System - Detailed Study

**Created**: December 16, 2025  
**Component**: Core operational unit of PSR-V4 platform  
**Hierarchical Level**: First tier below Admin in the role hierarchy

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Role & Hierarchy Position](#role--hierarchy-position)
3. [Database Structure](#database-structure)
4. [API Endpoints](#api-endpoints)
5. [CRUD Operations](#crud-operations)
6. [Data Flow](#data-flow)
7. [Relationships](#relationships)
8. [Security & Validation](#security--validation)
9. [UI/UX Implementation](#uiux-implementation)
10. [Advanced Features](#advanced-features)
11. [Deletion & Cascading](#deletion--cascading)
12. [Error Handling](#error-handling)

---

## 🎯 Overview

The **Dairy Management System** is a critical component of PSR-V4 that allows Admins to create, manage, monitor, and delete dairy farms (milk collection centers). Each dairy serves as a central aggregation point for multiple BMCs (Bulk Milk Coolers), which in turn manage societies and farmers.

### Key Characteristics:
- **Admin-level entity** - Created and managed only by admins
- **Schema-scoped** - Each dairy belongs to a specific admin's dedicated database schema
- **Hierarchical parent** - Acts as parent to BMC entities
- **Stateful management** - Tracks active, inactive, and maintenance status
- **Analytics-rich** - Real-time metrics and 30-day performance data
- **Secure deletion** - OTP verification for permanent data removal
- **Cascading relationships** - Connected to BMCs, societies, farmers, machines, collections, sales

---

## 👥 Role & Hierarchy Position

```
Super Admin (Approval Authority)
    ↓
Admin (Creates/Manages Dairies)
    ↓
Dairy (Operational Center) ← YOU ARE HERE
    ├─ BMC (Milk Cooler Station)
    │   ├─ Society (Farmer Group)
    │   │   └─ Farmer (Individual)
    │   └─ Machines (Milk Meters)
    │       └─ Collections, Sales, Dispatch
```

### Dairy Role Responsibilities:

**Can Do**:
- Create and manage multiple dairies
- View all BMCs under their dairies
- View societies and farmers indirectly through BMCs
- Monitor milk collections, dispatches, sales
- Manage machines and corrections
- Create and assign rate charts
- View analytics and reports
- Transfer BMCs before deleting dairy
- Update dairy information and status

**Cannot Do**:
- Create users directly (except through their BMCs)
- Delete data belonging to other admins
- Access other admin's schemas
- Modify user roles (except subordinate roles)

---

## 🗄️ Database Structure

### Dairy Farms Table

**Table Name**: `dairy_farms` (within admin-specific schema)

**Location**: `{schema_name}.dairy_farms` (e.g., `admin_adm1234.dairy_farms`)

```sql
CREATE TABLE dairy_farms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Identification
  dairy_id VARCHAR(50) UNIQUE NOT NULL,        -- Unique identifier (e.g., D-DAIRY001)
  name VARCHAR(255) NOT NULL,                   -- Dairy name
  
  -- Contact Information
  contact_person VARCHAR(200),                  -- Primary contact name
  phone VARCHAR(20),                            -- Contact phone
  email VARCHAR(255),                           -- Contact email
  location VARCHAR(500),                        -- Physical location/address
  
  -- Access Control
  password VARCHAR(255) NOT NULL,               -- Device/API password for this dairy
  
  -- Operational Details
  capacity INT DEFAULT 5000,                    -- Milk handling capacity (liters/day)
  status ENUM('active', 'inactive', 'maintenance') 
         DEFAULT 'active',                      -- Current operational status
  monthly_target INT DEFAULT 5000,              -- Target milk collection (liters/month)
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_dairy_id ON dairy_farms(dairy_id);
CREATE INDEX idx_status ON dairy_farms(status);
CREATE INDEX idx_created_at ON dairy_farms(created_at);
```

### Related Tables in Same Schema

```
dairy_farms (1)
    ↓ (1:N)
bmcs
    ├─ Stores: id, dairy_farm_id, bmc_id, name, location, capacity, status
    ├─ Foreign Key: dairy_farm_id → dairy_farms.id
    └─ Cascade Delete: When dairy deleted, all BMCs deleted

milk_collections
    ├─ Stores: Linked through society → bmc → dairy_farm
    └─ Cascade Delete: All collections under dairy deleted

machines
    ├─ Stores: Linked to BMCs/Societies
    └─ Cascade Delete: All machines under dairy deleted

rate_charts
    ├─ Stores: Linked to societies under BMCs under dairy
    └─ Cascade Delete: All rate charts deleted

milk_sales
    ├─ Stores: Linked through machines → societies → bmcs → dairy
    └─ Cascade Delete: All sales records deleted

machine_corrections
    └─ Cascade Delete: All corrections deleted

section_pulse
    ├─ Stores: Collection session tracking per society
    └─ Cascade Delete: All pulse data deleted
```

---

## 🔌 API Endpoints

### 1. List All Dairies (GET)

**Endpoint**: `GET /api/user/dairy`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Request Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mumbai Dairy Farm",
      "dairyId": "D-DAIRY001",
      "location": "Andheri, Mumbai",
      "contactPerson": "John Doe",
      "phone": "+91-9876543210",
      "email": "dairy@example.com",
      "capacity": 5000,
      "status": "active",
      "monthlyTarget": 5000,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-15T14:30:00Z",
      
      -- 30-Day Statistics
      "bmcCount": 3,
      "societyCount": 12,
      "totalCollections30d": 450,
      "totalQuantity30d": 22500.50,
      "totalAmount30d": 450010.00,
      "weightedFat30d": 4.25,
      "weightedSnf30d": 8.15,
      "weightedClr30d": 1.05,
      "weightedWater30d": 2.30,
      
      -- Trends
      "dailyTrends": [
        { "date": "2025-11-16", "quantity": 750.5, "revenue": 15001, "collections": 15 }
      ]
    }
  ]
}
```

**Key Metrics Returned**:
- `bmcCount`: Number of BMCs under this dairy
- `societyCount`: Number of societies (aggregated from all BMCs)
- `totalCollections30d`: Total number of milk collections in last 30 days
- `totalQuantity30d`: Total liters collected in last 30 days
- `totalAmount30d`: Total revenue from milk sales
- `weightedFat30d`: Average fat percentage (weighted by quantity)
- `weightedSnf30d`: Average SNF (Solids-Not-Fat)
- `weightedClr30d`: Average CLR (Clotting Time Rate)
- `weightedWater30d`: Average water content percentage

---

### 2. Get Dairy Details (GET)

**Endpoint**: `GET /api/user/dairy/{id}`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Path Parameters**:
```
id: {dairyId}  -- Database ID of the dairy
```

**Response**:
```json
{
  "success": true,
  "data": {
    "basicInfo": {
      "id": 1,
      "name": "Mumbai Dairy Farm",
      "dairyId": "D-DAIRY001",
      "location": "Andheri, Mumbai",
      "contactPerson": "John Doe",
      "phone": "+91-9876543210",
      "email": "dairy@example.com",
      "capacity": 5000,
      "status": "active",
      "monthlyTarget": 5000,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-15T14:30:00Z"
    },
    "bmcs": [
      {
        "id": 1,
        "bmcId": "BMC001",
        "name": "Andheri BMC",
        "location": "Andheri East",
        "capacity": 2000,
        "status": "active",
        "societyCount": 4,
        "farmerCount": 20,
        "totalCollections": 150
      }
    ],
    "societies": [...],
    "farmers": [...],
    "machines": [...],
    "collections": [
      {
        "id": 1,
        "farmerId": 1,
        "farmerName": "Farmer Name",
        "societyId": 1,
        "quantity": 25.5,
        "fat": 4.2,
        "snf": 8.1,
        "collectionDate": "2025-12-15",
        "collectionTime": "06:30:00"
      }
    ],
    "analytics": {
      "totalBmcs": 3,
      "totalSocieties": 12,
      "totalFarmers": 180,
      "totalMachines": 25,
      "totalCollections": 450,
      "totalQuantity": 22500.50,
      "totalRevenue": 450010.00,
      "avgFat": 4.25,
      "avgSnf": 8.15,
      "avgRate": 20.00
    },
    "dailyTrends": [
      {
        "date": "2025-12-15",
        "quantity": 750.5,
        "revenue": 15001,
        "collections": 15
      }
    ],
    "shiftAnalysis": [
      {
        "shift": "morning",
        "totalCollections": 225,
        "totalQuantity": 11250,
        "avgFat": 4.3
      }
    ],
    "topFarmers": [
      {
        "id": 1,
        "name": "Top Farmer",
        "totalQuantity": 500.5,
        "totalCollections": 30
      }
    ],
    "topSocieties": [
      {
        "id": 1,
        "name": "Top Society",
        "totalQuantity": 2000.5,
        "totalCollections": 100
      }
    ]
  }
}
```

---

### 3. Create Dairy (POST)

**Endpoint**: `POST /api/user/dairy`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Request Body**:
```json
{
  "name": "string",                    -- Required: Dairy farm name
  "dairyId": "string",                 -- Required: Unique identifier
  "password": "string",                -- Required: Device access password
  "location": "string",                -- Optional: Physical location
  "contactPerson": "string",           -- Optional: Contact person name
  "phone": "string",                   -- Optional: Phone number
  "email": "string",                   -- Optional: Email address
  "capacity": number,                  -- Optional: Milk capacity (default: 5000)
  "status": "active|inactive|maintenance", -- Optional: Status (default: active)
  "monthlyTarget": number              -- Optional: Monthly target (default: 5000)
}
```

**Example Request**:
```json
{
  "name": "New Mumbai Dairy",
  "dairyId": "D-NEW001",
  "password": "SecurePassword123!",
  "location": "Dadar, Mumbai",
  "contactPerson": "Rajesh Kumar",
  "phone": "+91-9999999999",
  "email": "rajesh@dairy.com",
  "capacity": 8000,
  "status": "active",
  "monthlyTarget": 8000
}
```

**Response on Success** (201):
```json
{
  "success": true,
  "message": "Dairy farm added successfully",
  "data": {
    "dairyId": "D-NEW001",
    "name": "New Mumbai Dairy",
    "location": "Dadar, Mumbai",
    "contactPerson": "Rajesh Kumar",
    "capacity": 8000,
    "status": "active",
    "monthlyTarget": 8000
  }
}
```

**Response on Duplicate** (409):
```json
{
  "success": false,
  "error": "Dairy ID already exists"
}
```

**Validation**:
- `name`: Required, must be unique per schema
- `dairyId`: Required, must be unique per schema, typically prefixed with "D-"
- `password`: Required, used for device authentication
- `phone`: Optional, must match pattern if provided
- `email`: Optional, must be valid email if provided
- `capacity`: Optional, positive integer
- `monthlyTarget`: Optional, positive integer

---

### 4. Update Dairy (PUT)

**Endpoint**: `PUT /api/user/dairy`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Request Body**:
```json
{
  "id": number,                        -- Required: Dairy database ID
  "name": "string",                    -- Optional: New name
  "location": "string",                -- Optional: New location
  "contactPerson": "string",           -- Optional: New contact person
  "phone": "string",                   -- Optional: New phone
  "email": "string",                   -- Optional: New email
  "capacity": number,                  -- Optional: New capacity
  "status": "active|inactive|maintenance", -- Optional: New status
  "monthlyTarget": number,             -- Optional: New target
  "password": "string"                 -- Optional: Change password
}
```

**Response on Success** (200):
```json
{
  "success": true,
  "message": "Dairy updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Dairy Name",
    ...
  }
}
```

---

### 5. Delete Dairy (DELETE)

**Endpoint**: `DELETE /api/user/dairy?id={dairyId}&otp={otp}`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Query Parameters**:
```
id: number     -- Database ID of dairy to delete
otp: string    -- OTP from email verification (only if BMCs exist)
```

**Request Body** (for transfer scenario):
```json
{
  "id": number,              -- Dairy database ID
  "newDairyId": number|null, -- Target dairy for BMC transfer (or null to delete all)
  "deleteAll": boolean,      -- If true, delete BMCs; if false, transfer them
  "otp": "string"           -- OTP verification code
}
```

**Response on Success** (200):
```json
{
  "success": true,
  "message": "Dairy deleted successfully",
  "data": {
    "deletedDairyId": 1,
    "transferredBMCs": 3  -- Number of BMCs transferred (if applicable)
  }
}
```

**Deletion Scenarios**:

1. **No BMCs** → Direct deletion with OTP
2. **Has BMCs** → Two options:
   - Transfer to another dairy (BMCs moved, original dairy deleted)
   - Delete all (BMCs and all related data cascade deleted)

---

### 6. Send Delete OTP (POST)

**Endpoint**: `POST /api/user/dairy/send-delete-otp`

**Authentication**: JWT token required  
**Authorization**: Admin only

**Request Body**:
```json
{
  "dairyId": number  -- Database ID of dairy to delete
}
```

**Response on Success** (200):
```json
{
  "success": true,
  "message": "OTP sent to your email address",
  "data": {
    "expiresIn": 600  -- OTP valid for 600 seconds (10 minutes)
  }
}
```

**Email Sent**:
- Subject: "⚠️ CRITICAL: Dairy Deletion Confirmation Required"
- Contains: 6-digit OTP, warning about cascading deletions, dairy name
- Styling: Red warning gradient, detailed list of what will be deleted
- Validity: 10 minutes

**OTP Storage**:
- Stored in-memory Map: `{adminId}_{dairyId}` → OTP
- Auto-cleanup: Expired OTPs removed when store checked
- One-time use: OTP deleted after successful verification

---

## ✏️ CRUD Operations

### Create Workflow

```
1. Admin fills form with dairy details
   ├─ Form validation (client-side)
   │  ├─ Name: Required, min 3 chars
   │  ├─ Dairy ID: Required, unique, auto-prefixed "D-"
   │  ├─ Phone: Optional, format validation
   │  └─ Email: Optional, email format validation
   │
2. Submit POST request to /api/user/dairy
   ├─ Server-side validation
   │  ├─ Token verification
   │  ├─ Admin authorization
   │  └─ Uniqueness check (dairyId, name)
   │
3. Insert into {schema}.dairy_farms
   │  └─ Password stored as plain text (used by devices)
   │
4. Return success/error response
   └─ Clear form, fetch fresh data, show success message
```

### Read Workflow

```
1. GET /api/user/dairy
   ├─ Token verification
   ├─ Admin authorization
   ├─ Get admin's schema name
   │
2. Query dairy_farms table
   ├─ Basic info (name, location, contact, status)
   ├─ BMC relationships
   │  └─ COUNT(*) as bmcCount
   ├─ Society relationships (through BMCs)
   │  └─ COUNT(DISTINCT) as societyCount
   ├─ 30-day statistics
   │  ├─ Milk collections
   │  ├─ Total quantity
   │  ├─ Total revenue
   │  ├─ Weighted averages (Fat, SNF, CLR, Water)
   └─ Daily trends
      └─ Group by collection date
```

### Update Workflow

```
1. Admin clicks Edit on dairy card
   ├─ Populate form with existing data
   └─ Prevent dairyId editing (can change name/location/etc)
   │
2. Admin modifies fields and submits
   │
3. PUT /api/user/dairy with changes
   ├─ Token verification
   ├─ Admin authorization
   ├─ Uniqueness check (if name changed)
   │
4. UPDATE dairy_farms SET ...
   │
5. Re-fetch and display updated dairy
```

### Delete Workflow

```
1. Admin clicks Delete on dairy card
   │
2. Check for BMCs
   ├─ If NO BMCs → Show OTP confirmation modal
   └─ If HAS BMCs → Show transfer modal
   │
3. User chooses action
   │
   ├─ Path A: Delete only (no BMCs)
   │  ├─ Click "Delete"
   │  ├─ POST /api/user/dairy/send-delete-otp
   │  ├─ Receive OTP email
   │  ├─ Enter OTP in modal
   │  ├─ DELETE /api/user/dairy?id={id}&otp={otp}
   │  └─ Cascade deletes all data
   │
   └─ Path B: Transfer then delete (has BMCs)
      ├─ Select target dairy OR delete all
      ├─ If transfer: DELETE with newDairyId
      │  └─ BMCs moved to new dairy, old deleted
      └─ If delete all: DELETE with deleteAll=true
         └─ Cascade deletes everything including BMCs
```

---

## 🔀 Data Flow

### Dairy Creation Flow

```
┌─ Admin Form ─────────────────────────────────┐
│                                              │
│ Input: name, dairyId, password, etc.       │
└──────────────┬──────────────────────────────┘
               │
               ▼
        ┌─────────────────┐
        │  Client-side    │
        │  Validation     │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ POST /api/user/ │
        │ dairy           │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────────────────┐
        │ Server: verifyToken()       │
        │ Server: authorizeRole()     │
        └────────┬────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────┐
        │ Validate fields:            │
        │ - name required             │
        │ - dairyId required/unique   │
        │ - password required         │
        └────────┬────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ Get admin's schema name      │
        │ {firstName}_{dbKey}          │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ INSERT INTO                  │
        │ {schema}.dairy_farms         │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ Return success response      │
        │ with created dairy data      │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ Client:                      │
        │ - Show success message       │
        │ - Close form                 │
        │ - Refresh dairy list         │
        └──────────────────────────────┘
```

### Dairy Details Flow

```
┌─ Admin clicks dairy row ──────┐
│                              │
│ Event: onClick(dairy.id)     │
└──────────┬───────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ GET /api/user/dairy/│
    │ {id}                │
    └──────────┬──────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 1. Get dairy basic info  │
    │    SELECT * FROM         │
    │    dairy_farms           │
    │    WHERE id = ?          │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 2. Get BMCs under dairy  │
    │    SELECT * FROM bmcs    │
    │    WHERE dairy_farm_id=?│
    │    + society counts      │
    │    + farmer counts       │
    │    + collection stats    │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 3. Get societies         │
    │    SELECT * FROM         │
    │    societies WHERE       │
    │    bmc_id IN (bmc_ids)   │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 4. Get farmers           │
    │    SELECT * FROM         │
    │    farmers WHERE         │
    │    society_id IN (...)   │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 5. Get machines          │
    │    Associated with BMCs  │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 6. Get collections (30d) │
    │    WHERE collection_date │
    │    >= DATE_SUB(NOW(),    │
    │    INTERVAL 30 DAY)      │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ 7. Calculate analytics   │
    │    - Counts (BMC,Society)│
    │    - Quantities, Revenue │
    │    - Weighted averages   │
    │    - Daily trends        │
    │    - Shift analysis      │
    │    - Top farmers/society │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Return all data as       │
    │ single comprehensive     │
    │ response                 │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Client: Display full     │
    │ dairy profile with:      │
    │ - Header info            │
    │ - Statistics cards       │
    │ - BMC list               │
    │ - Recent collections     │
    │ - Charts/trends          │
    └──────────────────────────┘
```

### Dairy Deletion Flow (No BMCs)

```
┌─ Admin clicks Delete on dairy ────────┐
│                                      │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌─────────────────────────┐
    │ Fetch BMCs for dairy    │
    │ GET /api/user/bmc       │
    │ Filter by dairy_farm_id │
    └──────────┬──────────────┘
               │
         ┌─────┴─────┐
         │           │
    Has BMCs?      No BMCs?
         │           │
         ▼           ▼
    Transfer    Direct Delete
     Modal       with OTP
         │           │
         │           ▼
         │    ┌──────────────────┐
         │    │ Store dairy ID   │
         │    │ window.selected  │
         │    │ DairyIdForDelete │
         │    └────────┬─────────┘
         │             │
         │             ▼
         │    ┌──────────────────┐
         │    │ Show Delete      │
         │    │ Modal            │
         │    │ (Step 1: Confirm)│
         │    └────────┬─────────┘
         │             │
         │             ▼
         │    ┌──────────────────┐
         │    │ Admin clicks     │
         │    │ "Send OTP"       │
         │    └────────┬─────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ POST /api/user/dairy/│
         │    │ send-delete-otp      │
         │    │ {dairyId}            │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Server:              │
         │    │ - Generate OTP       │
         │    │ - Store in Map       │
         │    │ - Send email         │
         │    │ - Return expires(600)│
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Modal switches to    │
         │    │ OTP input step       │
         │    │ 6 input fields       │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Admin enters OTP     │
         │    │ from email           │
         │    │ (auto-advances)      │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Admin clicks "Verify"│
         │    │                      │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Validate OTP length  │
         │    │ (must be 6 digits)   │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Call onConfirm()     │
         │    │ with OTP string      │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ DELETE /api/user/    │
         │    │ dairy?id={id}        │
         │    │ &otp={otp}           │
         │    └────────┬─────────────┘
         │             │
         │             ▼
         │    ┌──────────────────────┐
         │    │ Server verifies OTP  │
         │    │ from otpStore Map    │
         │    └────────┬─────────────┘
         │             │
         │    ┌────────┴─────────┐
         │    │                  │
         │ Valid?            Invalid?
         │    │                  │
         │    ▼                  ▼
         │ Delete Dairy    Error Response
         │    │                  │
         │    ▼                  ▼
         │ Cascade delete   Reset OTP
         │ all related      Show error
         │ data             Message
         │    │                  │
         │    ├──────────┬───────┘
         │    │          │
         │    ▼          ▼
         └──────────────────────────
              └─ Show success
                 Refresh list
```

### Dairy Deletion Flow (With BMCs)

```
┌─ Admin clicks Delete ───────┐
│                            │
└──────────┬─────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ Fetch BMCs for dairy│
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Has BMCs?           │
    │ YES ✓               │
    └──────────┬──────────┘
               │
               ▼
    ┌────────────────────────────┐
    │ Show Transfer Modal        │
    │ with options:              │
    │ 1. Transfer to another     │
    │    dairy                   │
    │ 2. Delete all (cascade)    │
    └──────────┬─────────────────┘
               │
         ┌─────┴──────────────┐
         │                    │
    Option 1:           Option 2:
    Transfer            Delete All
         │                    │
         ▼                    │
    ┌─────────────────┐      │
    │ Admin selects   │      │
    │ target dairy    │      │
    │ from dropdown   │      │
    │ (excludes      │      │
    │  current)       │      │
    └────────┬────────┘      │
             │               │
             ▼               │
    ┌──────────────────┐     │
    │ Click "Transfer" │     │
    │ & Delete         │     │
    └────────┬─────────┘     │
             │               │
             ▼               │
    ┌──────────────────────┐ │
    │ Send OTP for        │ │
    │ confirmation        │ │
    │ (same as above)     │ │
    └────────┬────────────┘ │
             │              │
             ▼              │
    ┌──────────────────────┐│
    │ DELETE /api/user/   ││
    │ dairy with:         ││
    │ - id: dairy.id      ││
    │ - newDairyId: {id}  ││
    │ - deleteAll: false  ││
    │ - otp: {otp}        ││
    └────────┬────────────┘│
             │             │
             ▼             │
    ┌──────────────────────┐│
    │ Server:            ││
    │ 1. Verify OTP      ││
    │ 2. Update all BMCs:││
    │    UPDATE bmcs SET ││
    │    dairy_farm_id   ││
    │    = newDairyId    ││
    │ 3. Delete dairy    ││
    │ 4. Return count of ││
    │    transferred     ││
    └────────┬────────────┘│
             │             │
             ▼             │
    ┌──────────────────────┐│
    │ Success:            ││
    │ "3 BMCs transferred"││
    │ "Dairy deleted"     ││
    │                     ││
    └─────────────────────┘│
                           │
                    Option 2
                           │
                           ▼
                    ┌──────────────────┐
                    │ Click "Delete All"│
                    │ (cascade)        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Send OTP         │
                    │ (same flow)      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ DELETE /api/user/dairy│
                    │ with:                │
                    │ - id: dairy.id       │
                    │ - newDairyId: null   │
                    │ - deleteAll: true    │
                    │ - otp: {otp}         │
                    └────────┬─────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ Server Cascade:      │
                    │ 1. DELETE all BMCs   │
                    │ 2. DELETE societies  │
                    │ 3. DELETE farmers    │
                    │ 4. DELETE machines   │
                    │ 5. DELETE collections│
                    │ 6. DELETE sales      │
                    │ 7. DELETE dispatches │
                    │ 8. DELETE rate charts│
                    │ 9. DELETE pulse data │
                    │ 10. DELETE dairy     │
                    └────────┬─────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ Success:             │
                    │ "Dairy & all data    │
                    │  deleted"           │
                    └─────────────────────┘
```

---

## 🔗 Relationships

### Entity Relationships

```
Dairy (1) ──── M (BMCs)
  ├─ Each dairy has multiple BMCs
  ├─ Foreign Key: bmcs.dairy_farm_id → dairy_farms.id
  └─ On Delete: CASCADE

BMC (1) ──── M (Societies)
  ├─ Each BMC has multiple societies
  ├─ Foreign Key: societies.bmc_id → bmcs.id
  └─ On Delete: CASCADE

Society (1) ──── M (Farmers)
  ├─ Each society has multiple farmers
  ├─ Foreign Key: farmers.society_id → societies.id
  └─ On Delete: CASCADE

Farmer (1) ──── M (Collections)
  ├─ Farmer has collection history
  ├─ Foreign Key: milk_collections.farmer_id → farmers.id
  └─ On Delete: CASCADE

Machine (1) ──── M (Collections)
  ├─ Collections recorded via machines
  ├─ Foreign Key: milk_collections.machine_id → machines.id
  └─ On Delete: CASCADE

Dairy (1) ──── M (Rate Charts)
  ├─ Dairy creates rate charts
  ├─ Assigned to societies
  └─ On Delete: CASCADE
```

### Data Aggregation Path

```
Dairy
  ├─ BMCs
  │   ├─ Count: COUNT(DISTINCT bmcs.id)
  │   └─ Filter: bmcs.dairy_farm_id = dairy.id
  │
  ├─ Societies (through BMCs)
  │   ├─ Count: COUNT(DISTINCT societies.id)
  │   └─ Filter: societies.bmc_id IN (bmc_ids)
  │
  ├─ Farmers (through Societies)
  │   ├─ Count: COUNT(DISTINCT farmers.id)
  │   └─ Filter: farmers.society_id IN (society_ids)
  │
  ├─ Machines (direct or through BMCs/Societies)
  │   └─ Filter: machines linked to this dairy
  │
  ├─ Collections (30-day)
  │   ├─ Query: milk_collections WHERE collection_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  │   ├─ Aggregate: SUM(quantity), SUM(amount), COUNT(*)
  │   ├─ Weighted Avg: SUM(fat * quantity) / SUM(quantity)
  │   └─ Also: SNF, CLR, Water content
  │
  ├─ Sales Records
  │   └─ Through machines → collections
  │
  └─ Dispatch Records
      └─ Through societies
```

---

## 🔐 Security & Validation

### Input Validation

**Dairy Name**:
- Required: Yes
- Min Length: 3 characters
- Max Length: 255 characters
- Unique: Yes (per schema)
- Validation: Trim whitespace, check uniqueness

**Dairy ID**:
- Required: Yes
- Format: Typically "D-{CODE}" (auto-prefixed)
- Max Length: 50 characters
- Unique: Yes (per schema)
- Validation: Auto-remove duplicates, enforce uniqueness

**Phone**:
- Required: No
- Format: Phone number with country code
- Validation: `formatPhoneInput()` and `validatePhoneOnBlur()`
- Pattern: Match valid Indian number pattern

**Email**:
- Required: No
- Format: Valid email address
- Validation: `validateEmailQuick()`
- Pattern: Standard email regex

**Password**:
- Required: Yes (at creation)
- Length: At least 8 characters
- Usage: Stored plain text for device authentication
- Note: Not changed during update unless explicitly set

**Capacity & Monthly Target**:
- Required: No
- Type: Positive integer
- Default: 5000 (liters)
- Validation: parseInt(), positive check

**Status**:
- Required: No
- Type: ENUM
- Values: 'active', 'inactive', 'maintenance'
- Default: 'active'

### Authorization Checks

```typescript
// Authentication
if (!token) return 401 Unauthorized;
const payload = verifyToken(token);

// Authorization
if (payload.role !== 'admin') return 403 Forbidden;

// Schema Access
const admin = await User.findByPk(payload.id);
const schemaName = `${admin.fullName}_{admin.dbKey}`;
// Query only from this schema
```

### OTP Security

**Generation**:
- 6-digit numeric OTP
- Generated with `generateOTP()` function
- Random selection from digits 0-9

**Storage**:
- Stored in-memory Map: `{adminId}_{dairyId}` → {otp, expires, dairyId}
- No database storage (in-memory only)
- Auto-cleanup of expired OTPs

**Validation**:
- Exact OTP match required
- Expiry check (10 minutes)
- Dairy ID match check
- One-time use (deleted after verification)

**Email Security**:
- OTP never exposed in response body
- Sent only to admin's registered email
- Clear warning about cascading deletions
- 10-minute validity window

---

## 🎨 UI/UX Implementation

### Dairy Management Page

**Location**: `src/app/admin/dairy/page.tsx`

**Key Components**:
1. **Page Header**
   - Title: "Dairy Management"
   - Refresh button
   - Icon: Milk bottle

2. **Top Performers Section**
   - 6 stat cards showing:
     - Top Collection (30d)
     - Top Revenue (30d)
     - Top Fat %
     - Top SNF %
     - Most Collections
     - Least Water %
   - Clickable cards → Open detailed graph modal

3. **Filter Controls**
   - Status filter: All / Active / Inactive / Maintenance
   - Real-time filtering

4. **Dairy Cards Grid**
   ```
   ┌─────────────────────────────┐
   │ Dairy Name         [Status] │
   │ ID: D-DAIRY001              │
   │                             │
   │ 📍 Location     📞 Phone    │
   │ BMCs: 3  Societies: 12      │
   │                             │
   │ Collections (30d): 450      │
   │ Quantity: 22500.50L         │
   │ Revenue: ₹450,010           │
   │                             │
   │ Quality Metrics:            │
   │ Fat: 4.25%  SNF: 8.15%      │
   │ Water: 2.30%  CLR: 1.05     │
   │                             │
   │ [View] [Edit] [Delete]      │
   └─────────────────────────────┘
   ```

5. **Action Buttons**
   - View Details: Open comprehensive detail view
   - Edit: Modify dairy information
   - Delete: Initiate deletion with transfer/cascade options
   - FAB: Add new dairy

### Dairy Form Modal

**Fields**:
- Dairy Name (text input)
- Dairy ID (text input, auto-prefixed "D-")
- Password (password input)
- Contact Person (text input)
- Phone (formatted input)
- Email (email input)
- Location (text input)
- Capacity (number input)
- Status (dropdown: active/inactive/maintenance)
- Monthly Target (number input)

**Validations Shown**:
- Real-time field error display
- Duplicate dairy ID check
- Duplicate name check
- Phone format validation
- Email format validation

**Actions**:
- Submit: Create/Update dairy
- Cancel: Close form without changes

### Delete Modal

**Step 1: Confirmation**
- Warning message with red gradient header
- Dairy name display
- List of all data to be deleted:
  - All BMCs
  - All societies
  - All farmers
  - All collection records
  - All machines
  - All rate charts
  - All sales data
  - All dispatch records

**Step 2: OTP Entry**
- 6 separate input fields (auto-advance)
- Paste support for full OTP
- Backspace navigation between fields
- Loading state during verification
- Error message display
- 10-minute validity indicator

**Colors & Icons**:
- Red gradient for warning
- AlertTriangle icon
- ShieldCheck icon for OTP step
- Trash2 icon for deletion

### Transfer Modal

**Display When**: Dairy has BMCs

**Options**:
1. **Transfer to Another Dairy**
   - Dropdown with other dairies (current dairy excluded)
   - Selected dairy name display
   - "Transfer & Delete" button

2. **Delete All (Cascade)**
   - Warning about cascading deletions
   - "Delete All Dairy & Data" button
   - Clear impact explanation

**Both Options Require**:
- OTP verification (same flow as delete)
- Admin confirmation

### Detail View Page

**Shows**:
- Basic dairy information
- List of all BMCs
- List of all societies
- List of all farmers
- List of all machines
- Recent collection records
- Comprehensive analytics:
  - Collection counts
  - Revenue metrics
  - Quality averages
  - Daily trends (line chart)
  - Shift-wise analysis
  - Top farmers ranking
  - Top societies ranking

---

## 🎯 Advanced Features

### 30-Day Statistics

**Calculation**:
```sql
WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
```

**Metrics**:

1. **totalCollections30d**
   - Count: Number of collection records
   - Type: INTEGER

2. **totalQuantity30d**
   - Sum: SUM(milk_collections.quantity)
   - Type: DECIMAL(12,2)
   - Unit: Liters

3. **totalAmount30d**
   - Sum: SUM(milk_collections.total_amount)
   - Type: DECIMAL(14,2)
   - Unit: Currency (₹)

4. **weightedFat30d**
   - Calculation: SUM(fat_percentage * quantity) / SUM(quantity)
   - Type: DECIMAL(5,2)
   - Range: 0-10%

5. **weightedSnf30d**
   - Calculation: SUM(snf_percentage * quantity) / SUM(quantity)
   - Type: DECIMAL(5,2)
   - Unit: %

6. **weightedClr30d**
   - Calculation: SUM(clr * quantity) / SUM(quantity)
   - Type: DECIMAL(5,2)
   - Unit: Clotting time

7. **weightedWater30d**
   - Calculation: SUM(water_percentage * quantity) / SUM(quantity)
   - Type: DECIMAL(5,2)
   - Unit: %

### Daily Trends

**Aggregation**:
```sql
SELECT 
  collection_date as date,
  SUM(quantity) as quantity,
  SUM(total_amount) as revenue,
  COUNT(*) as collections
FROM milk_collections
WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(collection_date)
ORDER BY collection_date DESC
```

**Visualization**: Line chart with recharts
- X-axis: Collection date
- Y-axis: Quantity (liters)
- Secondary Y: Revenue (₹)

### Shift Analysis

**Calculation**:
```sql
SELECT 
  shift_type,
  COUNT(*) as totalCollections,
  SUM(quantity) as totalQuantity,
  AVG(fat_percentage) as avgFat
FROM milk_collections
WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY shift_type
ORDER BY shift_type
```

**Shifts**:
- Morning (typically 4 AM - 12 PM)
- Evening (typically 12 PM - 8 PM)
- Night (typically 8 PM - 4 AM)

### Top Performers

**Top Farmers**:
```sql
SELECT farmer_id, name, SUM(quantity) as totalQuantity, COUNT(*) as totalCollections
FROM milk_collections
WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY farmer_id
ORDER BY totalQuantity DESC
LIMIT 5
```

**Top Societies**:
```sql
SELECT society_id, name, SUM(quantity) as totalQuantity, COUNT(*) as totalCollections
FROM milk_collections
WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY society_id
ORDER BY totalQuantity DESC
LIMIT 5
```

---

## 🗑️ Deletion & Cascading

### Deletion Paths

**Path 1: Simple Deletion (No BMCs)**
1. Admin clicks Delete
2. No BMCs found
3. Send OTP email
4. Admin enters OTP
5. Direct deletion of dairy
6. No cascade needed (no child records)

**Path 2: Transfer BMCs**
1. Admin clicks Delete
2. BMCs found
3. Show transfer modal
4. Select target dairy
5. Send OTP
6. UPDATE bmcs SET dairy_farm_id = newDairyId
7. DELETE dairy_farms WHERE id = ?
8. BMCs remain, now under new dairy

**Path 3: Cascade Deletion**
1. Admin clicks Delete
2. BMCs found
3. Show transfer modal
4. Choose "Delete All"
5. Send OTP
6. Cascade delete all:
   - DELETE bmcs
   - DELETE societies
   - DELETE farmers
   - DELETE machines
   - DELETE collections
   - DELETE dispatches
   - DELETE sales
   - DELETE rate_charts
   - DELETE machine_corrections
   - DELETE section_pulse
   - DELETE dairy

### Cascade Chain

```
DELETE dairy_farms (id=X)
  ├─ CASCADE DELETE bmcs
  │   WHERE dairy_farm_id = X
  │   └─ CASCADE DELETE societies
  │       WHERE bmc_id IN (...)
  │       └─ CASCADE DELETE farmers
  │           WHERE society_id IN (...)
  │           └─ CASCADE DELETE milk_collections
  │               WHERE farmer_id IN (...)
  │           └─ CASCADE DELETE machine_corrections
  │               WHERE farmer_id IN (...)
  │
  ├─ CASCADE DELETE machines
  │   WHERE dairy_farm_id = X (or linked to BMCs)
  │   └─ CASCADE DELETE machine_statistics
  │       WHERE machine_id IN (...)
  │   └─ CASCADE DELETE milk_sales
  │       WHERE machine_id IN (...)
  │   └─ CASCADE DELETE machine_passwords
  │       WHERE machine_id IN (...)
  │
  ├─ CASCADE DELETE rate_charts
  │   WHERE dairy_farm_id = X or societies IN (...)
  │   └─ CASCADE DELETE rate_chart_download_history
  │       WHERE rate_chart_id IN (...)
  │
  ├─ CASCADE DELETE milk_dispatches
  │   WHERE society_id IN (...)
  │
  └─ CASCADE DELETE section_pulse
      WHERE society_id IN (...)
```

### Data Safety Measures

1. **OTP Verification**
   - Required for any deletion
   - 10-minute validity
   - Sent to registered email
   - One-time use

2. **Warning Email**
   - Clear red gradient design
   - Explicit list of deletions
   - 10-minute OTP validity stated
   - "Cannot be undone" warning

3. **UI Warnings**
   - Modal warning about cascading deletions
   - Color-coded (red) for danger
   - List all affected data
   - Clear button text ("Delete", not "Yes/No")

4. **Option to Preserve Data**
   - Transfer BMCs to another dairy before deletion
   - Preserve farmer/machine data indirectly
   - Only deletes dairy record itself

---

## ⚠️ Error Handling

### Client-Side Errors

1. **Validation Errors**
   - Display below input field
   - Clear when user starts typing
   - Specific error message (e.g., "Dairy ID already exists")

2. **Network Errors**
   - Show snackbar with error message
   - Retry button or auto-retry after delay
   - Timeout handling (typically 30s)

3. **Duplicate Checks**
   - Field-level error: "This Dairy ID already exists"
   - "This Dairy name already exists"
   - Prevent form submission with duplicates

### Server-Side Errors

1. **Authentication Errors** (401)
   ```json
   { "error": "Access token required" }
   // Client redirects to login
   ```

2. **Authorization Errors** (403)
   ```json
   { "error": "Admin access required" }
   // User cannot access dairy management
   ```

3. **Validation Errors** (400)
   ```json
   { "error": "Name, password, and dairy ID are required" }
   ```

4. **Duplicate Errors** (409)
   ```json
   { "error": "Dairy ID already exists" }
   ```

5. **Not Found** (404)
   ```json
   { "error": "Dairy not found" }
   // Or "Admin schema not found"
   ```

6. **Internal Errors** (500)
   ```json
   { "error": "Failed to add dairy farm" }
   ```

7. **OTP Errors**
   ```json
   { "error": "Invalid or expired OTP" }
   { "error": "Failed to send OTP" }
   { "error": "Dairy ID not found" }
   ```

### Error Recovery

- **Automatic Retry**: For network timeouts
- **Manual Retry**: Visible retry button
- **Clear Messaging**: Specific error, not generic
- **State Cleanup**: Form cleared on error
- **User Guidance**: Suggestions for fixing (e.g., "Use unique ID")

---

## 📊 Performance Considerations

### Query Optimization

1. **Indexed Fields**:
   - dairy_id (unique)
   - status
   - created_at
   - dairy_farm_id (in related tables)

2. **JOIN Efficiency**:
   - LEFT JOINs for aggregations
   - GROUP BY with COUNT(DISTINCT)
   - WHERE clause filters before JOIN

3. **Pagination** (Future Enhancement):
   - Limit 50 dairies per page
   - Offset-based pagination
   - Total count query separate

### Caching Opportunities

1. **Client-Side Caching**:
   - Cache dairy list in state/context
   - Invalidate on CRUD operations
   - 5-minute stale-while-revalidate

2. **Server-Side Caching** (Future):
   - Redis for dairy lists
   - TTL: 5 minutes
   - Invalidate on mutations

### Batch Operations (Future)

- Bulk status update
- Bulk delete confirmation
- Batch capacity update
- CSV export/import

---

## 🔄 State Management

### Component State

```typescript
// Data
const [dairies, setDairies] = useState<Dairy[]>([]);
const [selectedDairy, setSelectedDairy] = useState<Dairy | null>(null);
const [formData, setFormData] = useState<DairyFormData>(initialFormData);

// UI
const [showAddForm, setShowAddForm] = useState(false);
const [showEditForm, setShowEditForm] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showTransferModal, setShowTransferModal] = useState(false);
const [showGraphModal, setShowGraphModal] = useState(false);

// Status
const [loading, setLoading] = useState(true);
const [formLoading, setFormLoading] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Messages
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

// Filtering
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');

// Modals
const [graphMetric, setGraphMetric] = useState<'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'water'>('quantity');
const [bmcsForTransfer, setBmcsForTransfer] = useState<BMC[]>([]);
```

### Context Integration

- **UserContext**: Get current admin info
- **LanguageContext**: Get translated labels
- **Custom Hooks**: useUser(), useLanguage()

---

## 🎓 Key Takeaways

1. **Dairy is the Primary Operational Unit**
   - Created by Admins
   - Aggregates BMCs, societies, farmers
   - Central point for monitoring

2. **Strong Cascade Relationships**
   - Deleting dairy deletes all dependent data
   - Option to transfer BMCs to preserve some data
   - OTP verification prevents accidental deletion

3. **Rich Analytics**
   - 30-day statistics automatically calculated
   - Weighted averages for quality metrics
   - Daily trends and shift analysis
   - Top performer ranking

4. **Secure Multi-Tenant Design**
   - Each dairy belongs to admin's schema
   - No data leakage between admins
   - OTP-based critical operations

5. **User-Friendly UI**
   - Card-based layout for easy scanning
   - Status filtering and search
   - Inline editing capabilities
   - Clear warning modals for destructive actions

6. **Scalable Architecture**
   - Support for unlimited dairies per admin
   - Efficient schema-scoped queries
   - Room for caching and optimization
   - Batch operations ready

---

**End of Dairy Management Study**

This detailed study covers every aspect of dairy management in the PSR-V4 system, from database structure to UI/UX implementation, data flows, security measures, and error handling.
