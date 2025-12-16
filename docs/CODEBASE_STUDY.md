# PSR-V4: Complete Codebase Study

**Last Updated**: December 16, 2025  
**Project Version**: 0.1.0  
**Status**: Production-Ready

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [User Hierarchy & Roles](#user-hierarchy--roles)
5. [Database Structure](#database-structure)
6. [Key Features](#key-features)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Authentication & Security](#authentication--security)
10. [File Structure](#file-structure)
11. [Core Services](#core-services)
12. [Deployment & DevOps](#deployment--devops)

---

## 🎯 Project Overview

**Poornasree Equipments Cloud (PSR-V4)** is a comprehensive, multi-tenant dairy equipment management platform designed for complex organizational hierarchies. It handles complete lifecycle management of dairy operations including machines, collections, dispatches, sales, and rate charts.

### Key Characteristics:
- **Multi-tenant architecture** with dedicated database schemas per organization
- **6-level role hierarchy** with granular permission control
- **Responsive Material Design 3 UI** for all screen sizes
- **Real-time pulse monitoring** for section status tracking
- **Automated email notifications** for all critical actions
- **Professional PDF generation** with company branding
- **Role-based data visibility** ensuring proper access control

---

## 🛠️ Technology Stack

### Frontend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js with App Router | 16.0.0 |
| Library | React | 19.2.0 |
| Language | TypeScript | 5.0 |
| Styling | Tailwind CSS | 3.4.18 |
| Design System | Material Design 3 | - |
| Animations | Framer Motion | 12.23.24 |
| Icons | Heroicons + Lucide React | 2.2.0 / 0.546.0 |
| Charts | Recharts | 3.5.0 |
| PDF Export | jsPDF + jsPDF-AutoTable | 3.0.4 / 5.0.2 |

### Backend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | Latest LTS |
| Framework | Express.js | 5.1.0 |
| ORM | Sequelize | 6.37.7 |
| Authentication | JWT (jsonwebtoken) | 9.0.2 |
| Hashing | bcryptjs | 3.0.2 |
| Email | Nodemailer | 7.0.9 |
| File Upload | Multer | 2.0.2 |
| Validation | Express-Validator | 7.2.1 |
| Security | Helmet + CORS | 8.1.0 / 2.8.5 |
| Rate Limiting | rate-limiter-flexible | 8.1.0 |
| Scheduling | node-cron | 4.2.1 |
| Logging | Winston | 3.18.3 |

### Database
| Aspect | Technology |
|--------|-----------|
| Database | Azure MySQL 8.0 |
| Connection | SSL with certificate |
| Timezone | IST (UTC+5:30) |
| Connection Pooling | Sequelize pool |
| Migration System | Custom TypeScript runner |

---

## 🏗️ Architecture

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Main Database (psr_v4_main)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ users (Super Admin, Admins, Dairy, BMC, etc.)   │   │
│  │ machines (Machine types)                         │   │
│  │ audit_logs (System-wide logging)                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                              │
                              │ One Admin per Schema
                              ▼
        ┌─────────────────────────────────────┐
        │  Admin-Specific Schema               │
        │  (Generated Name: tester_TST1234)   │
        ├─────────────────────────────────────┤
        │ dairy                                │
        │ bmc                                  │
        │ society                              │
        │ farmer                               │
        │ machines (Admin-specific)            │
        │ milk_collections                     │
        │ milk_dispatches                      │
        │ milk_sales                           │
        │ price_chart (Rate chart)             │
        │ rate_chart_download_history          │
        │ machine_corrections                  │
        │ machine_statistics                   │
        │ section_pulse                        │
        │ esp32_corrections                    │
        │ machine_passwords                    │
        └─────────────────────────────────────┘
```

### Request Flow

```
Client (React + Next.js Frontend)
    │
    ├─ Authentication: JWT Token in Header
    │
    ▼
Next.js API Route (/api/...)
    │
    ├─ Middleware: authenticateToken()
    │
    ├─ Authorization: authorizeRole()
    │
    ├─ Route Handler (TypeScript)
    │
    ├─ Database Query (Sequelize ORM)
    │
    └─ Response (JSON)
```

---

## 👥 User Hierarchy & Roles

### Role Hierarchy (Top to Bottom)

```
1. SUPER_ADMIN (Highest)
   └─ Can create/manage all Admins
   └─ Access system-wide monitoring
   └─ Can approve registrations
   
2. ADMIN
   └─ Has dedicated database schema
   └─ Can create Dairy, BMC, Society users
   └─ Can manage machines in their schema
   └─ Full control within their organization
   
3. DAIRY
   └─ Can manage BMC and Society users
   └─ Can view machines in their organization
   └─ Can manage milk collections/dispatches/sales
   
4. BMC (Bulk Milk Cooler)
   └─ Can manage Society users
   └─ Limited machine management
   
5. SOCIETY
   └─ Can manage Farmer users
   └─ Can view their own data
   
6. FARMER (Lowest)
   └─ Can only view/manage their own data
   └─ Read-only access mostly
```

### Authorization Middleware

Located in [src/middleware/auth.ts](src/middleware/auth.ts):

- `authenticateToken()`: Verifies JWT token validity
- `authorizeRole()`: Checks if user has required role
- `requireSuperAdmin()`: Strict super admin check
- `requireAdmin()`: Admin or higher required
- `requireHierarchyAccess()`: Validates parent-child relationships

### User Model

**File**: [src/models/User.ts](src/models/User.ts)

```typescript
interface UserAttributes {
  id: number;
  uid: string;                           // Unique identifier
  email: string;                          // Email address
  password: string;                       // Hashed password
  fullName: string;                       // Full name
  role: UserRole;                         // Role enum
  status: UserStatus;                     // Account status
  dbKey?: string;                         // Admin's schema key
  companyName?: string;                   // Organization name
  companyPincode?: string;                // Pincode
  companyCity?: string;                   // City
  companyState?: string;                  // State
  parentId?: number;                      // Reference to parent user
  isEmailVerified: boolean;               // Email verification flag
  loginAttempts: number;                  // Failed login counter
  lockUntil?: Date;                       // Account lock timestamp
  lastLogin?: Date;                       // Last login time
}
```

**User Status**:
- `pending`: Initial state
- `pending_approval`: Email verified, awaiting super admin approval
- `active`: Fully activated
- `inactive`: Disabled account
- `suspended`: Suspended account
- `rejected`: Registration rejected

---

## 📊 Database Structure

### Main Schema Tables (psr_v4_main)

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uid VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  fullName VARCHAR(200),
  role ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
  status ENUM('pending_approval', 'active', 'inactive', 'suspended', 'rejected'),
  dbKey VARCHAR(50),
  companyName VARCHAR(255),
  companyPincode VARCHAR(10),
  companyCity VARCHAR(100),
  companyState VARCHAR(100),
  parentId INT,
  isEmailVerified BOOLEAN,
  emailVerificationToken VARCHAR(255),
  emailVerificationExpires DATETIME,
  passwordResetToken VARCHAR(255),
  passwordResetExpires DATETIME,
  otpCode VARCHAR(10),
  otpExpires DATETIME,
  lastLogin DATETIME,
  loginAttempts INT DEFAULT 0,
  lockUntil DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Machine Types Table
```sql
CREATE TABLE machinetype (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_type VARCHAR(100) UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### Admin-Specific Schema Tables

Each admin gets a dedicated schema (e.g., `tester_tst1234`) with:

#### Dairy Table
- Stores dairy organization records
- Linked to admin schema
- Contains dairy-specific information

#### BMC Table
- Bulk Milk Cooler records
- Managed by Dairy users
- Location and capacity information

#### Society Table
- Society/group records
- Contains collection center info
- Linked to machines

#### Farmer Table
- Individual farmer records
- Contact information
- Bank details for payments

#### Machines Table (Schema-Specific)
- ESPs (Milk meters)
- Chillers
- Other equipment
- Real-time status tracking

#### Milk Collections
```sql
CREATE TABLE milk_collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT,
  society_id INT,
  machine_id INT,
  collection_date DATE,
  collection_time TIME,
  quantity DECIMAL(10,2),
  fat DECIMAL(5,2),
  snf DECIMAL(5,2),
  milk_type VARCHAR(50),
  status VARCHAR(50),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Milk Dispatches
```sql
CREATE TABLE milk_dispatches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  society_id INT,
  dispatch_date DATE,
  dispatch_time TIME,
  quantity DECIMAL(10,2),
  destination VARCHAR(255),
  vehicle_number VARCHAR(50),
  status VARCHAR(50),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Milk Sales
```sql
CREATE TABLE milk_sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT,
  machine_type VARCHAR(100),
  machine_version VARCHAR(50),
  sale_date DATE,
  sale_time TIME,
  quantity DECIMAL(10,2),
  rate DECIMAL(10,2),
  amount DECIMAL(12,2),
  shift_type VARCHAR(50),
  buyer_id INT,
  status VARCHAR(50),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Price Chart (Rate Chart)
```sql
CREATE TABLE price_chart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chart_date DATE,
  milk_type VARCHAR(50),
  fat_level DECIMAL(5,2),
  snf_level DECIMAL(5,2),
  rate DECIMAL(10,2),
  status VARCHAR(50),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Section Pulse
```sql
CREATE TABLE section_pulse (
  id INT PRIMARY KEY AUTO_INCREMENT,
  society_id INT,
  pulse_date DATE,
  pulse_status VARCHAR(50),  -- active, paused, ended
  section_start_time DATETIME,
  section_end_time DATETIME,
  last_collection_time DATETIME,
  last_checked DATETIME,
  pause_reason VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Machine Corrections
```sql
CREATE TABLE esp32_machine_corrections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT,
  correction_date DATE,
  correction_type VARCHAR(50),
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  reason VARCHAR(255),
  applied_by INT,
  status VARCHAR(50),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Machine Statistics
```sql
CREATE TABLE machine_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT,
  statistics_date DATE,
  total_collections INT,
  total_quantity DECIMAL(12,2),
  average_fat DECIMAL(5,2),
  average_snf DECIMAL(5,2),
  status VARCHAR(50),
  is_master_machine BOOLEAN,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

---

## ✨ Key Features

### 1. Authentication & Registration

**Endpoints**:
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login` - Login with JWT token generation
- `POST /api/auth/verify-otp` - OTP verification for registration
- `POST /api/auth/verify-email` - Email address verification
- `POST /api/auth/forgot-password` - Password reset flow
- `POST /api/auth/reset-password` - Complete password reset
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/verify-session` - Session validation

**Flow**:
1. User registers with email
2. OTP sent to email (valid 10 minutes)
3. User verifies OTP
4. Email verified, status = `pending_approval`
5. Super admin approves
6. Status = `active`
7. User can login

**Security**:
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens with 7-day expiry
- Refresh tokens with 30-day expiry
- Account lockout after 5 failed attempts (2 hours)
- OTP for sensitive operations

### 2. Role-Based Access Control (RBAC)

**Hierarchy Enforced**:
- Each role can only manage roles below it
- Admins have isolated schema access
- Data visibility based on role hierarchy

**Implementation**:
```typescript
// File: src/lib/auth.ts
export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const roleHierarchy = [SUPER_ADMIN, ADMIN, DAIRY, BMC, SOCIETY, FARMER];
  const currentIndex = roleHierarchy.indexOf(userRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);
  return currentIndex < targetIndex;
};
```

### 3. Multi-Tenant Schema Generation

**Function**: `generateUniqueDbKey()` in [src/lib/adminSchema.ts](src/lib/adminSchema.ts)

```
Format: AAA#### (e.g., TST1234)
- AAA: First 3 letters of admin name (uppercase)
- ####: 4 random digits

Schema Name: {adminName}_{dbKey}
Example: tester_tst1234
```

**Schema Creation**:
- When admin user is created
- Unique schema per admin
- All tables created with this schema
- Complete data isolation

### 4. Email Service

**File**: [src/lib/emailService.ts](src/lib/emailService.ts)

**Features**:
- OTP delivery for verification
- Welcome emails
- Password reset emails
- Approval/rejection notifications
- Dairy/BMC/Society creation notifications
- Farmer registration notifications

**Configuration**:
- SMTP via Gmail or custom server
- HTML-formatted emails
- Professional branding with gradient headers
- Supports both `SMTP_*` and `EMAIL_*` env vars

**Example Email Features**:
```
- Personalized greeting
- Clear call-to-action (OTP display)
- Validity period information
- Company branding
- Support contact info
```

### 5. Milk Collection Management

**Related Endpoints**:
- `GET /api/user/reports/collections` - View collection history
- `POST /api/user/reports/collections/delete` - Delete collections
- `POST /api/[db-key]/Collection/SaveCollectionDetails` - ESP32 device endpoint

**Data Fields**:
- Farmer identification
- Society/collection center
- Machine/meter reading
- Collection time and date
- Milk quantity
- Quality metrics (Fat, SNF)
- Milk type (cow/buffalo)

### 6. Milk Dispatch Management

**Related Endpoints**:
- `GET /api/user/reports/dispatches` - View dispatch history
- `POST /api/user/reports/dispatches/delete` - Delete dispatches
- `POST /api/[db-key]/Dispatch/SaveDispatchDetails` - Device endpoint

**Tracking**:
- Society-level collections
- Dispatch timing and quantity
- Vehicle assignment
- Destination tracking
- Status workflow

### 7. Milk Sales Management

**Related Endpoints**:
- `GET /api/user/reports/sales` - View sales reports
- `POST /api/[db-key]/Sales/SaveSalesDetails` - Device endpoint

**Metrics**:
- Machine-wise sales tracking
- Rate application
- Quantity and amount
- Shift-wise categorization
- Buyer identification

### 8. Rate Chart Management (Price Chart)

**Endpoints**:
- `GET /api/user/ratechart` - List rate charts
- `POST /api/user/ratechart` - Create rate chart
- `POST /api/user/ratechart/upload` - CSV upload
- `POST /api/user/ratechart/assign` - Assign to societies
- `POST /api/user/ratechart/download-status` - Check download status
- `POST /api/user/ratechart/reset-download` - Reset device status
- `POST /api/user/ratechart/remove-society` - Unassign society

**Features**:
- CSV import for bulk rate updates
- Society-level assignment
- Download tracking to devices
- Version control
- Status management

### 9. Machine Management

**Endpoints**:
- `GET /api/user/machine` - List machines
- `POST /api/user/machine` - Create machine
- `GET /api/user/machine/[id]/status` - Machine status
- `POST /api/user/machine/[id]/password` - Update credentials
- `POST /api/user/machine/[id]/set-master` - Designate master machine
- `GET /api/user/machine/all-statistics` - Statistical data
- `GET /api/user/machine/by-society` - Society-wise machines

**Features**:
- Master machine designation
- Password management
- Real-time status monitoring
- Statistics aggregation
- Correction tracking

### 10. Machine Corrections

**Endpoints**:
- `POST /api/user/machine-correction` - Add correction
- `GET /api/user/machine/correction/[machineId]` - View corrections

**Use Cases**:
- Meter reading corrections
- Parameter adjustments
- Maintenance logs
- Quality adjustments

### 11. Section Pulse Monitoring

**Purpose**: Real-time monitoring of milk collection sections

**Endpoints**:
- `GET /api/user/pulse` - Current pulse status
- `GET /api/admin/notifications/paused-sections` - Paused sections list

**Status Types**:
- `active`: Section collecting milk
- `paused`: Section temporarily inactive
- `ended`: Collection session completed

**Features**:
- Real-time status updates
- Pause/resume functionality
- Automatic end-of-day closure
- Notification system
- Inactivity tracking

**Scheduler Service** ([src/lib/pulseSchedulerService.ts](src/lib/pulseSchedulerService.ts)):
- Runs every 2 minutes to check pulse status
- Daily check at midnight for inactivity
- Automatic section ending
- Updates across all admin schemas

### 12. Analytics Dashboard

**Endpoints**:
- `GET /api/user/analytics` - Dashboard analytics

**Metrics Tracked**:
- Total collections
- Total dispatches
- Revenue metrics
- Machine utilization
- Quality averages (Fat, SNF)
- Farmer participation
- Time-based trends

### 13. File Upload & CSV Import

**Capabilities**:
- Rate chart CSV upload
- Farmer bulk upload
- Machine data import
- History tracking

**File Processing**:
- Validation before import
- Batch processing
- Error reporting
- Download history maintenance

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/resend-verification` | Resend verification |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/reset-password` | Complete password reset |
| GET | `/api/auth/verify-session` | Validate session |
| POST | `/api/auth/check-status` | Check registration status |

### User Management Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/profile` | Get user profile |
| GET | `/api/user/dairy` | List dairies |
| GET | `/api/user/dairy/[id]` | Get dairy details |
| POST | `/api/user/dairy` | Create dairy |
| POST | `/api/user/dairy/send-delete-otp` | OTP for dairy deletion |
| GET | `/api/user/bmc` | List BMCs |
| POST | `/api/user/bmc` | Create BMC |
| POST | `/api/user/bmc/send-delete-otp` | OTP for BMC deletion |
| GET | `/api/user/society` | List societies |
| GET | `/api/user/society/[id]` | Get society details |
| POST | `/api/user/society` | Create society |
| POST | `/api/user/society/delete` | Delete society |
| GET | `/api/user/farmer` | List farmers |
| POST | `/api/user/farmer` | Create farmer |
| POST | `/api/user/farmer/upload` | Bulk farmer upload |

### Machine Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/machine` | List machines |
| POST | `/api/user/machine` | Create machine |
| GET | `/api/user/machine/[id]/status` | Get machine status |
| GET | `/api/user/machine/[id]/show-password` | Show machine password |
| POST | `/api/user/machine/[id]/password` | Update machine password |
| POST | `/api/user/machine/[id]/set-master` | Designate master |
| GET | `/api/user/machine/all-statistics` | All machine stats |
| GET | `/api/user/machine/by-society` | Society machines |
| POST | `/api/user/machine/statistics` | Save statistics |
| POST | `/api/user/machine/statistics/delete` | Delete statistics |
| POST | `/api/user/machine-correction` | Add correction |
| GET | `/api/user/machine/correction/[machineId]` | View corrections |

### Rate Chart Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/ratechart` | List rate charts |
| GET | `/api/user/ratechart/[id]` | Get chart details |
| POST | `/api/user/ratechart` | Create rate chart |
| POST | `/api/user/ratechart/upload` | CSV upload |
| POST | `/api/user/ratechart/assign` | Assign to societies |
| POST | `/api/user/ratechart/remove-society` | Remove assignment |
| POST | `/api/user/ratechart/download-status` | Check status |
| POST | `/api/user/ratechart/reset-download` | Reset status |
| POST | `/api/user/ratechart/cleanup` | Cleanup old charts |
| GET | `/api/user/ratechart/data` | Get chart data |
| GET | `/api/user/ratechart/status` | Chart status |

### Reports Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/reports/collections` | Collection history |
| POST | `/api/user/reports/collections/delete` | Delete collection |
| GET | `/api/user/reports/dispatches` | Dispatch history |
| POST | `/api/user/reports/dispatches/delete` | Delete dispatch |
| GET | `/api/user/reports/sales` | Sales history |

### Device/ESP32 Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/[db-key]/Collection/SaveCollectionDetails` | Save milk collection |
| POST | `/api/[db-key]/Dispatch/SaveDispatchDetails` | Save dispatch |
| POST | `/api/[db-key]/Sales/SaveSalesDetails` | Save sales |
| GET | `/api/[db-key]/PriceChartUpdation/GetLatestPriceChart` | Get rate chart |
| POST | `/api/[db-key]/PriceChartUpdation/SavePriceChartUpdationHistory` | Download tracking |
| POST | `/api/[db-key]/PriceChartUpdation/DownloadRateChart` | Download chart |
| GET | `/api/[db-key]/FarmerInfo/GetLatestFarmerInfo` | Get farmer data |
| GET | `/api/[db-key]/Machine/CloudTest` | Device connectivity test |
| GET | `/api/[db-key]/MachinePassword/GetLatestMachinePassword` | Get credentials |
| POST | `/api/[db-key]/MachinePassword/UpdateMachinePasswordStatus` | Update status |
| GET | `/api/[db-key]/MachineCorrection/GetLatestMachineCorrection` | Get corrections |
| POST | `/api/[db-key]/MachineCorrection/SaveMachineCorrectionFromMachine` | Save from device |
| POST | `/api/[db-key]/MachineNewupdate/FromMachine` | Device updates |
| GET | `/api/[db-key]/MachineStatistics/SaveMachineStatisticsFromMachine` | Save statistics |

### Monitoring Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/pulse` | Get pulse status |
| GET | `/api/admin/notifications/paused-sections` | Paused sections |
| GET | `/api/user/analytics` | Analytics data |

### Super Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/superadmin/auth/login` | Super admin login |
| POST | `/api/superadmin/approvals` | Approve users |
| GET | `/api/superadmin/database` | Database info |
| GET | `/api/superadmin/machines` | All machines |
| POST | `/api/superadmin/machines/upload` | Machine bulk import |
| POST | `/api/superadmin/machines/download` | Download machines |
| GET | `/api/superadmin/monitoring/stats` | System stats |
| GET | `/api/superadmin/monitoring/requests` | Request logs |
| GET | `/api/superadmin/monitoring/stream` | Real-time stream |

### Utility Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/pincode` | Pincode validation/lookup |
| POST | `/api/auth/validate-email` | Email validation |

---

## 🎨 Frontend Components

### Layout Components ([src/components/layout/](src/components/layout/))

| Component | Purpose |
|-----------|---------|
| `Header.tsx` | Main navigation header |
| `AdminHeader.tsx` | Admin-specific header |
| `Sidebar.tsx` | Navigation sidebar |
| `DashboardLayout.tsx` | Dashboard wrapper |
| `AdminLayout.tsx` | Admin page wrapper |
| `ProfileButton.tsx` | User profile menu |
| `ProfileDrawer.tsx` | Profile details drawer |

### Authentication Components ([src/components/auth/](src/components/auth/))

| Component | Purpose |
|-----------|---------|
| `EmailVerificationPrompt.tsx` | Email verification UI |

### Form Components ([src/components/forms/](src/components/forms/))

Reusable form components with validation

### Management Components ([src/components/management/](src/components/management/))

- Dairy management
- BMC management
- Society management
- Farmer management
- Machine management

### Report Components ([src/components/reports/](src/components/reports/))

- Collection reports
- Dispatch reports
- Sales reports
- Analytics reports

### Rate Chart Components ([src/components/ratechart/](src/components/ratechart/))

- Chart creation/editing
- CSV upload interface
- Society assignment
- Download status tracking

### Dialog Components ([src/components/dialogs/](src/components/dialogs/))

Reusable dialog/modal components

### UI Components ([src/components/ui/](src/components/ui/))

| Component | Purpose |
|-----------|---------|
| `Badge.tsx` | Status badges |
| `Skeleton.tsx` | Loading skeletons |
| `ThemeToggle.tsx` | Dark/light mode toggle |
| `PSRColorShowcase.tsx` | Design system colors |

### Analytics Components ([src/components/analytics/](src/components/analytics/))

Dashboard and chart components

### Pages

**Main App Pages**:
- `(auth)/login` - Login page
- `admin/dashboard` - Admin dashboard
- `admin/dairy` - Dairy management
- `admin/ratechart` - Rate chart management
- `admin/reports` - Reports dashboard

**Admin Sub-Pages**:
- `admin/analytics` - Analytics
- `admin/bmc` - BMC management
- `admin/dairy` - Dairy management
- `admin/farmer` - Farmer management
- `admin/machine` - Machine management
- `admin/profile` - User profile
- `admin/ratechart` - Rate chart
- `admin/reports` - Reports
- `admin/society` - Society management

### Material Design 3 Implementation

**Color Palette**:
- Primary colors with gradients
- Success, warning, error colors
- Neutral grays
- Custom BTCBot24-inspired patterns

**Components**:
- Material buttons with ripple effects
- Card-based layouts
- Snackbars for notifications
- Dialogs/modals
- Bottom sheets
- Chips and badges
- Text fields with validation

**Responsive Design**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔐 Authentication & Security

### JWT Token Structure

```typescript
interface JWTPayload {
  id: number;           // User ID
  uid: string;          // Unique user identifier
  email: string;        // Email address
  role: UserRole;       // User role
  dbKey?: string;       // Admin's schema key
}
```

### Token Configuration

```
Access Token:
- Expiry: 7 days
- Secret: process.env.JWT_SECRET
- Issuer: 'poornasree-equipments-cloud'
- Audience: 'psr-client'

Refresh Token:
- Expiry: 30 days
- Secret: process.env.JWT_REFRESH_SECRET
```

### Security Best Practices

1. **Password Security**:
   - Hashed with bcryptjs (salt rounds: 10)
   - Account lockout after 5 failed attempts
   - 2-hour lockout duration
   - Password reset token expiry: 1 hour

2. **Token Security**:
   - JWT with issuer/audience validation
   - Refresh token separate secret
   - No sensitive data in token
   - Token stored in localStorage (client)

3. **Email Verification**:
   - OTP with 10-minute validity
   - Email verification required before activation
   - Super admin approval workflow
   - Registration token expiry

4. **API Security**:
   - Helmet for HTTP headers
   - CORS configured
   - Rate limiting (flexible)
   - Input validation with express-validator
   - SQL injection prevention (Sequelize parameterized queries)

5. **Database Security**:
   - SSL connection to Azure MySQL
   - Connection pooling
   - Prepared statements
   - Row-level security via role hierarchy

6. **Additional Security**:
   - Timezone handling (IST)
   - Request logging
   - Error handling (no stack traces in response)
   - Audit logging for sensitive operations
   - Data isolation per admin schema

---

## 📁 File Structure

```
psr-v4/
├── 📂 src/
│   ├── 📂 app/                          # Next.js App Router
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page
│   │   ├── 📂 (auth)/                   # Auth routes
│   │   │   └── 📂 login/
│   │   ├── 📂 admin/                    # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── analytics/
│   │   │   ├── bmc/
│   │   │   ├── dairy/
│   │   │   ├── dashboard/
│   │   │   ├── farmer/
│   │   │   ├── machine/
│   │   │   ├── profile/
│   │   │   ├── ratechart/
│   │   │   ├── reports/
│   │   │   └── society/
│   │   ├── 📂 api/                      # API routes
│   │   │   ├── 📂 auth/                 # Authentication
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── verify-otp/route.ts
│   │   │   │   ├── verify-email/route.ts
│   │   │   │   ├── forgot-password/route.ts
│   │   │   │   ├── reset-password/route.ts
│   │   │   │   └── ...
│   │   │   ├── 📂 user/                 # User endpoints
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── dairy/route.ts
│   │   │   │   ├── bmc/route.ts
│   │   │   │   ├── society/route.ts
│   │   │   │   ├── farmer/route.ts
│   │   │   │   ├── machine/route.ts
│   │   │   │   ├── pulse/route.ts
│   │   │   │   ├── ratechart/route.ts
│   │   │   │   ├── reports/
│   │   │   │   └── analytics/route.ts
│   │   │   ├── 📂 superadmin/           # Super admin endpoints
│   │   │   │   ├── auth/
│   │   │   │   ├── approvals/route.ts
│   │   │   │   ├── database/route.ts
│   │   │   │   ├── machines/
│   │   │   │   └── monitoring/
│   │   │   ├── 📂 admin/                # Admin endpoints
│   │   │   │   └── notifications/
│   │   │   ├── 📂 [db-key]/             # Device endpoints
│   │   │   │   ├── Collection/
│   │   │   │   ├── Dispatch/
│   │   │   │   ├── Sales/
│   │   │   │   ├── PriceChartUpdation/
│   │   │   │   ├── FarmerInfo/
│   │   │   │   ├── Machine/
│   │   │   │   ├── MachinePassword/
│   │   │   │   ├── MachineCorrection/
│   │   │   │   └── MachineStatistics/
│   │   │   ├── pincode/route.ts
│   │   │   └── ...
│   │   ├── 📂 superadmin/               # Super admin pages
│   │   ├── 📂 diagnostic/               # Diagnostic pages
│   │   └── 📂 color-system/             # Design system pages
│   │
│   ├── 📂 components/                   # Reusable React components
│   │   ├── index.ts                     # Component exports
│   │   ├── NavigationConfirmModal.tsx
│   │   ├── SectionPulseIndicator.tsx
│   │   ├── 📂 auth/
│   │   ├── 📂 forms/
│   │   ├── 📂 dialogs/
│   │   ├── 📂 management/
│   │   ├── 📂 pages/
│   │   ├── 📂 reports/
│   │   ├── 📂 ratechart/
│   │   ├── 📂 analytics/
│   │   ├── 📂 layout/
│   │   ├── 📂 modals/
│   │   ├── 📂 loading/
│   │   ├── 📂 dairy/
│   │   └── 📂 ui/
│   │
│   ├── 📂 contexts/                     # React contexts
│   │   └── UserContext.tsx              # User state management
│   │
│   ├── 📂 lib/                          # Utilities and services
│   │   ├── auth.ts                      # JWT handling
│   │   ├── clientAuth.ts                # Client-side auth
│   │   ├── database.ts                  # Database connection
│   │   ├── adminSchema.ts               # Schema generation
│   │   ├── emailService.ts              # Email sending
│   │   ├── emailValidation.ts           # Email validation
│   │   ├── pincodeService.ts            # Pincode lookup
│   │   ├── pulseSchedulerService.ts     # Pulse monitoring
│   │   ├── sectionPulseTracker.ts       # Pulse tracking
│   │   ├── migrations.ts                # Migration runner
│   │   ├── migrations.mjs               # Migration definitions
│   │   ├── responsive.ts                # Responsive utilities
│   │   ├── 📂 monitoring/               # Monitoring utilities
│   │   ├── 📂 external-api/             # External API integrations
│   │   ├── 📂 utils/                    # Helper utilities
│   │   └── 📂 validation/               # Validation utilities
│   │
│   ├── 📂 middleware/                   # Middleware functions
│   │   └── auth.ts                      # Authentication middleware
│   │
│   ├── 📂 models/                       # Database models
│   │   ├── User.ts                      # User model
│   │   ├── Machine.ts                   # Machine type model
│   │   ├── AuditLog.ts                  # Audit logging
│   │   ├── AdminSchema.ts               # Schema info
│   │   └── index.ts                     # Model exports
│   │
│   ├── 📂 types/                        # TypeScript types
│   │   └── user.ts                      # User types
│   │
│   ├── 📂 locales/                      # i18n translations
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── ml.json
│   │
│   └── 📂 contexts/                     # React contexts
│       └── UserContext.tsx
│
├── 📂 database/
│   ├── 📂 migrations/                   # Database migrations
│   │   ├── 20251107073654-create-all-tables.js
│   │   ├── 20251115000001-add-status-to-rate-charts.js
│   │   ├── 20251117000001-create-esp32-machine-corrections.js
│   │   ├── 20251121000001-update-milk-collections-table.js
│   │   └── ...
│   └── 📂 seeders/                      # Database seeders
│       ├── 20241022000001-super-admin-user.js
│       └── 20241027000001-seed-machine-types.js
│
├── 📂 config/
│   └── database.js                      # Database configuration
│
├── 📂 public/
│   └── 📂 sample_datas/                 # Sample CSV files
│
├── Configuration Files
│   ├── next.config.ts                   # Next.js config
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── tsconfig.json                    # TypeScript config
│   ├── eslint.config.mjs                # ESLint config
│   ├── postcss.config.mjs               # PostCSS config
│   ├── package.json                     # Dependencies
│   ├── ecosystem.config.js              # PM2 config
│   └── psr-v4.code-workspace           # VS Code workspace
│
├── 📄 README.md                         # Main documentation
├── 📄 CODEBASE_STUDY.md                 # This file
├── 📄 pulse-scheduler.js                # Pulse scheduler
└── instrumentation.ts                   # Next.js instrumentation
```

---

## 🔧 Core Services

### 1. Database Service ([src/lib/database.ts](src/lib/database.ts))

**Responsibilities**:
- Initialize Sequelize connection
- Handle Azure MySQL SSL configuration
- Connection pooling
- Timezone management (IST)
- Test database connectivity

**Key Functions**:
- `createSequelizeInstance()` - Create DB connection
- `testConnection()` - Validate connectivity
- `initDatabase()` - Initialize with migrations

### 2. Authentication Service ([src/lib/auth.ts](src/lib/auth.ts))

**Responsibilities**:
- JWT token generation and verification
- OTP generation
- Token hashing
- Role hierarchy validation
- Refresh token handling

**Key Functions**:
- `generateTokens(user)` - Create JWT pair
- `verifyToken(token)` - Validate access token
- `verifyRefreshToken(token)` - Validate refresh token
- `generateOTP(length)` - Generate numeric OTP
- `canManageRole(userRole, targetRole)` - Check hierarchy

### 3. Client Auth Service ([src/lib/clientAuth.ts](src/lib/clientAuth.ts))

**Responsibilities**:
- Client-side token management
- Local storage handling
- Session persistence
- Auto-logout on token expiry

### 4. Email Service ([src/lib/emailService.ts](src/lib/emailService.ts))

**Responsibilities**:
- Send OTP emails
- Send verification emails
- Send welcome emails
- Send notification emails
- HTML email templates

**Key Functions**:
- `sendOTPEmail(email, otp, name)` - Send OTP
- `sendWelcomeEmail(email, name)` - Send welcome
- `sendApprovalEmail()` - Send approval notification
- `sendPasswordResetEmail()` - Send reset link

### 5. Admin Schema Service ([src/lib/adminSchema.ts](src/lib/adminSchema.ts))

**Responsibilities**:
- Generate unique dbKey
- Create admin schemas
- Initialize schema tables
- Manage schema lifecycle

**Key Functions**:
- `generateDbKey(fullName)` - Create db key
- `generateUniqueDbKey(fullName)` - Ensure uniqueness
- `createAdminSchema(adminUser, dbKey)` - Create schema
- `isDbKeyUnique(dbKey)` - Check uniqueness

### 6. Pulse Scheduler Service ([src/lib/pulseSchedulerService.ts](src/lib/pulseSchedulerService.ts))

**Responsibilities**:
- Monitor section pulse status
- Check collection inactivity
- Automatic section closure
- Cross-schema pulse checking

**Scheduling**:
- Every 2 minutes: Check pulse status
- Daily at midnight: Check inactivity
- Auto-ends sections from previous days

**Key Functions**:
- `getAllAdminSchemas()` - Get all schemas
- `checkSectionPauseAndEnd(schemaName)` - Check status
- `initPulseScheduler()` - Start scheduler

### 7. Pincode Service ([src/lib/pincodeService.ts](src/lib/pincodeService.ts))

**Responsibilities**:
- Pincode validation
- City/state lookup
- Address information

### 8. Email Validation Service ([src/lib/emailValidation.ts](src/lib/emailValidation.ts))

**Responsibilities**:
- Email format validation
- Domain verification
- Duplicate check

### 9. Middleware ([src/middleware/auth.ts](src/middleware/auth.ts))

**Functions**:
- `authenticateToken(req)` - Extract and verify JWT
- `authorizeRole(requiredRoles)` - Check user role
- `requireSuperAdmin(user)` - Super admin only
- `requireAdmin(user)` - Admin or higher
- `requireHierarchyAccess(targetId, user)` - Hierarchy check

---

## 🚀 Deployment & DevOps

### Environment Variables

**Required Variables**:
```
# Database
DB_HOST=              # Azure MySQL host
DB_PORT=3306          # MySQL port
DB_USER=psr_admin     # Database user
DB_PASSWORD=          # Database password
DB_NAME=psr_v4_main   # Main database name
DB_SSL_CA=            # SSL certificate path
DB_REJECT_UNAUTHORIZED=false

# Authentication
JWT_SECRET=           # Secret for access tokens
JWT_REFRESH_SECRET=   # Secret for refresh tokens

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=           # Email address
EMAIL_PASSWORD=       # App password
EMAIL_SECURE=false

# Super Admin
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_EMAIL=admin@psr.com

# Environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Database Migrations

**Running Migrations**:
```bash
npm run db:migrate        # Run all pending migrations
npm run db:migrate:undo   # Rollback last migration
npm run db:migrate:undo:all # Rollback all migrations
npm run db:seed           # Run seeders
npm run migration:up      # Custom up
npm run migration:down    # Custom down
```

### PM2 Configuration

**File**: [ecosystem.config.js](ecosystem.config.js)

Runs Next.js application with:
- Auto restart
- Memory limits
- Logging
- Cluster mode (optional)

### Build & Start

```bash
npm install             # Install dependencies
npm run build          # Build Next.js
npm start              # Start production server
npm run dev            # Development server
```

### GitHub Actions Workflow

Auto-deployment on push (requires setup via SETUP_FIRST.md):
- Build application
- Run migrations
- Start PM2 process
- SSL certificate management

---

## 📊 Data Flow Examples

### Registration Flow

```
User Registration Request
  ├─ Validation (email, password, etc.)
  ├─ Check email uniqueness
  ├─ Hash password (bcryptjs)
  ├─ Create user with status = 'pending_approval'
  ├─ Generate OTP (6 digits, 10 min validity)
  ├─ Send OTP email
  └─ Return: "OTP sent to email"

OTP Verification
  ├─ Validate OTP
  ├─ Check expiry
  ├─ Set isEmailVerified = true
  ├─ Update status = 'pending_approval' (waiting for super admin)
  └─ Return: "Email verified, awaiting admin approval"

Super Admin Approval
  ├─ Super admin reviews pending users
  ├─ Approve/Reject user
  ├─ If approve: status = 'active'
  ├─ Send approval/rejection email
  └─ User can now login
```

### Login Flow

```
Login Request
  ├─ Find user by email
  ├─ Check if account is locked
  ├─ Verify password (bcryptjs)
  ├─ If failed: increment loginAttempts
  ├─ If 5+ attempts: lock account for 2 hours
  ├─ If success:
  │   ├─ Reset loginAttempts to 0
  │   ├─ Generate JWT pair
  │   ├─ Update lastLogin timestamp
  │   └─ Return tokens
  └─ Client stores token in localStorage
```

### Machine Data Collection (Device → Cloud)

```
ESP32 Device
  ├─ Collects milk collection data
  ├─ POSTs to /api/[db-key]/Collection/SaveCollectionDetails
  ├─ Includes: timestamp, quantity, fat, SNF, machine_id
  │
  ▼
API Endpoint
  ├─ Extracts dbKey from URL
  ├─ Authenticates device (via shared secret/key)
  ├─ Validates data
  ├─ Saves to admin-specific schema
  ├─ Updates related statistics
  ├─ Triggers pulse status update
  │
  ▼
Backend Processing
  ├─ Update machine statistics
  ├─ Aggregate daily metrics
  ├─ Check section pulse status
  ├─ Send notifications if needed
  └─ Return: Success/Error response
```

---

## 🎓 Key Learnings

### 1. Multi-Tenant Architecture
- Each admin gets isolated schema
- Complete data separation
- Schema name generation with uniqueness
- DDL operations for schema creation

### 2. Role-Based Hierarchy
- 6-level hierarchy enforced at application level
- `canManageRole()` checks before operations
- Parent-child relationships via `parentId`
- Database-level isolation per schema

### 3. Real-Time Monitoring
- Pulse scheduler runs independently
- Cron jobs for background tasks
- Direct MySQL connection for scheduler
- Real-time status updates

### 4. JWT Authentication
- Stateless authentication
- No server-side session storage
- Token contains minimal user info
- Refresh tokens for extended sessions

### 5. Email Integration
- Template-based HTML emails
- OTP delivery and verification
- Automated workflows
- Notification system

### 6. Data Isolation
- Schema-level separation
- Row-level security via role
- Device-specific data access
- Role-based view restrictions

### 7. Device Integration
- Unique API endpoint per admin (`[db-key]`)
- Device authentication via shared secret
- Data validation before storage
- Status tracking and error handling

---

## 🔮 Future Enhancements

Based on the codebase structure, potential improvements:

1. **Analytics Enhancement**
   - Real-time dashboards
   - Predictive analytics
   - Advanced reporting

2. **Machine Learning**
   - Anomaly detection
   - Quality prediction
   - Demand forecasting

3. **Mobile App**
   - React Native app
   - Same backend API
   - Offline capabilities

4. **Blockchain Integration**
   - Immutable audit logs
   - Smart contracts for transactions
   - Supply chain transparency

5. **AI-Powered Features**
   - Automated data categorization
   - Intelligent notifications
   - Chatbot support

6. **Advanced Monitoring**
   - Real-time device health
   - Predictive maintenance
   - IoT dashboard

---

## 📞 Support & References

- **Documentation**: See README.md, QUICKSTART.md, SETUP_FIRST.md
- **Database Setup**: Check database/migrations/
- **API Documentation**: Swagger/OpenAPI (if available)
- **Deployment Guide**: docs/VPS_AUTO_SETUP.md

---

**End of Study Document**

This document provides a comprehensive overview of the PSR-V4 codebase structure, architecture, and implementation patterns. For specific implementation details, refer to the source files mentioned throughout this document.
