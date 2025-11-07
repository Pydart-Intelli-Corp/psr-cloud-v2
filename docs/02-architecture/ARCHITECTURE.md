# PSR-v4 System Architecture

**Poornasree Equipments Cloud - Technical Architecture Documentation**

---

## 📋 Architecture Overview

PSR-v4 is built as a modern, scalable, multi-tenant web application using a hybrid Server-Side Rendering (SSR) and Client-Side Rendering (CSR) approach with Next.js 16. The system implements a role-based hierarchy with complete data isolation between organizations through dedicated database schemas.

**Architecture Pattern**: Multi-tenant SaaS with Schema Isolation  
**Deployment Model**: Cloud-native (Azure)  
**Scale Target**: 10,000+ organizations, 100,000+ users  
**Last Updated**: November 5, 2025

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Web Browsers (Desktop/Mobile)  │  Progressive Web App      │
│  - React 19.2.0 Components      │  - Service Workers (TBD)  │
│  - TypeScript 5                 │  - Offline Capabilities   │
│  - Tailwind CSS + Material 3    │  - Push Notifications     │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/HTTP2
┌─────────────────▼───────────────────────────────────────────┐
│                 Application Layer                            │
├─────────────────────────────────────────────────────────────┤
│              Next.js 16.0.0 App Router                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Pages     │ │ API Routes  │ │ Middleware  │          │
│  │   (SSR)     │ │   (REST)    │ │   (Auth)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────┬───────────────────────────────────────────┘
                  │ Internal API Calls
┌─────────────────▼───────────────────────────────────────────┐
│                 Business Logic Layer                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │Authentication│ │ Multi-Tenant│ │   Email     │           │
│ │   Service   │ │  Management │ │  Service    │           │
│ │ (JWT 9.0.2) │ │  (Sequelize)│ │(Nodemailer) │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   Entity    │ │    PDF      │ │  Validation │           │
│ │ Management  │ │ Generation  │ │  Service    │           │
│ │  (CRUD)     │ │  (jsPDF)    │ │(Validator)  │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────┬───────────────────────────────────────────┘
                  │ Sequelize ORM 6.37.7
┌─────────────────▼───────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│                 Azure MySQL 8.0 Database                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Master Database (psr_v4_c)                 │ │
│  │  ┌─────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│  │  │  users  │ │admin_schemas │ │ audit_logs   │        │ │
│  │  │machinetype│              │ │              │        │ │
│  │  └─────────┘ └──────────────┘ └──────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Admin Schemas (Multi-tenant)                 │ │
│  │  admin1_schema │ admin2_schema │ ... │ adminN_schema   │ │
│  │  ├─dairy_farms │ ├─dairy_farms │     │ ├─dairy_farms  │ │
│  │  ├─bmcs       │ ├─bmcs       │     │ ├─bmcs        │ │
│  │  ├─societies  │ ├─societies  │     │ ├─societies   │ │
│  │  ├─farmers    │ ├─farmers    │     │ ├─farmers     │ │
│  │  └─admin_machines│└─admin_machines│  │└─admin_machines││
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Architecture (React 19 + Next.js 15)

```
src/app/
├── (auth)/                    # Authentication routes
│   ├── login/
│   ├── register/
│   └── verify-otp/
├── admin/                     # Admin dashboard routes
│   ├── dashboard/
│   ├── dairy/
│   ├── bmc/
│   ├── society/
│   ├── farmer/
│   └── machine/
├── api/                       # API route handlers
│   ├── auth/                  # Authentication endpoints
│   ├── user/                  # User data endpoints
│   └── superadmin/            # Super admin endpoints
└── globals.css                # Global styles

src/components/
├── auth/                      # Authentication components
├── forms/                     # Reusable form components
├── layout/                    # Layout components
├── management/                # Entity management components
├── LoadingSpinner.tsx         # Loading animations
├── ThemeToggle.tsx           # Dark mode toggle
└── index.ts                  # Component exports

src/contexts/
├── UserContext.tsx           # Global user state
├── ThemeContext.tsx          # Theme management
└── LanguageContext.tsx       # Internationalization

src/lib/
├── auth.ts                   # JWT utilities
├── database.ts               # Database connection
├── emailService.ts           # Email templates and sending
├── adminSchema.ts            # Multi-tenant schema management
└── utils/                    # Utility functions

src/middleware/
└── auth.ts                   # Request authentication

src/models/
├── index.ts                  # Model exports and associations
├── User.ts                   # User model
└── AdminSchema.ts            # Admin schema model
```

---

## 🔐 Authentication & Authorization Architecture

### JWT Token Flow

```
┌─────────────┐    1. Login Request    ┌─────────────────┐
│   Client    │──────────────────────▶│  Auth Service   │
│             │                       │                 │
│             │◀──────────────────────│                 │
│             │    2. JWT Tokens      │                 │
└─────────────┘                       └─────────────────┘
       │                                        │
       │ 3. Store Tokens                        │ 4. Verify & Generate
       ▼                                        ▼
┌─────────────┐                       ┌─────────────────┐
│localStorage │                       │   JWT Service   │
│+ HttpOnly   │                       │  - Access: 7d   │
│  Cookies    │                       │  - Refresh: 30d │
└─────────────┘                       └─────────────────┘
       │                                        │
       │ 5. API Request + Bearer Token          │
       ▼                                        ▼
┌─────────────┐    6. Token Validation  ┌─────────────────┐
│ API Request │──────────────────────▶│  Auth Middleware│
│             │                       │                 │
│             │◀──────────────────────│                 │
│             │    7. Authorized      │                 │
└─────────────┘       Response        └─────────────────┘
```

### Role-Based Access Control (RBAC)

```typescript
interface UserHierarchy {
  super_admin: {
    permissions: ['manage_all_admins', 'system_settings'];
    access_level: 6;
  };
  admin: {
    permissions: ['manage_own_schema', 'user_management'];
    access_level: 5;
    schema: 'dedicated_schema_{dbKey}';
  };
  dairy: {
    permissions: ['manage_bmcs', 'view_analytics'];
    access_level: 4;
    scope: 'dairy_facilities';
  };
  bmc: {
    permissions: ['manage_societies', 'collection_data'];
    access_level: 3;
    scope: 'bmc_operations';
  };
  society: {
    permissions: ['manage_farmers', 'member_data'];
    access_level: 2;
    scope: 'society_members';
  };
  farmer: {
    permissions: ['view_own_data', 'update_profile'];
    access_level: 1;
    scope: 'personal_data';
  };
}
```

---

## 🗄️ Database Architecture

### Multi-Tenant Schema Design

#### Master Database Structure
```sql
-- psr_v4_c (Master Database)
CREATE DATABASE psr_v4_c;

-- Core tables in master database
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uid VARCHAR(50) UNIQUE NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
  dbKey VARCHAR(10) NULL,
  status ENUM('pending_email_verification', 'pending_approval', 'active', 'suspended'),
  emailVerified BOOLEAN DEFAULT FALSE,
  lastLoginAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Company information for admin users
  companyName VARCHAR(255) NULL,
  companyPincode VARCHAR(10) NULL,
  companyCity VARCHAR(100) NULL,
  companyState VARCHAR(100) NULL,
  -- Security fields
  passwordResetToken VARCHAR(255) NULL,
  emailVerificationToken VARCHAR(255) NULL,
  otpCode VARCHAR(6) NULL,
  otpExpiry TIMESTAMP NULL,
  loginAttempts INT DEFAULT 0,
  lockedUntil TIMESTAMP NULL
);

admin_schemas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  adminId INT NOT NULL,
  dbKey VARCHAR(10) NOT NULL,
  schemaName VARCHAR(50) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(id)
);

audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NULL,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(50) NULL,
  entityId VARCHAR(50) NULL,
  oldData JSON NULL,
  newData JSON NULL,
  ipAddress VARCHAR(45) NULL,
  userAgent TEXT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### Admin-Specific Schema Structure
```sql
-- {adminName}_{dbKey} (Example: john_JOH1234)
CREATE SCHEMA `john_JOH1234`;

-- Tables in each admin schema
USE `john_JOH1234`;

dairy_farms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  dairyId VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  capacity INT DEFAULT 0,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  monthlyTarget DECIMAL(15,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

bmcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  bmcId VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dairyFarmId INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  capacity INT DEFAULT 0,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  monthlyTarget DECIMAL(15,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dairyFarmId) REFERENCES dairy_farms(id)
);

societies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  societyId VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  presidentName VARCHAR(255) NOT NULL,
  contactPhone VARCHAR(20) NOT NULL,
  bmcId INT NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bmcId) REFERENCES bmcs(id)
);

farmers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  farmerId VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  societyId INT NOT NULL,
  bmcId INT NOT NULL,
  cattleCount INT DEFAULT 0,
  buffaloCount INT DEFAULT 0,
  avgMilkPerDay DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (societyId) REFERENCES societies(id),
  FOREIGN KEY (bmcId) REFERENCES bmcs(id)
);

machines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machineId VARCHAR(50) NOT NULL,
  machineType VARCHAR(100) NOT NULL,
  societyId INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  installationDate DATE NULL,
  operatorName VARCHAR(255) NULL,
  contactPhone VARCHAR(20) NULL,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  notes TEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (societyId) REFERENCES societies(id)
);
```

### Connection Management

```typescript
// Database connection configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync('DigiCertGlobalRootCA.crt.pem')
    },
    connectTimeout: 30000
  },
  pool: {
    max: 10,      // Maximum connections in pool
    min: 0,       // Minimum connections in pool
    acquire: 30000, // Maximum time to acquire connection
    idle: 300000    // Maximum idle time before release
  },
  logging: false  // Disable SQL logging in production
});
```

---

## 📡 API Architecture

### RESTful API Design

```
/api/
├── auth/
│   ├── register        POST   # User registration
│   ├── verify-otp      POST   # Email verification
│   ├── login          POST   # Authentication
│   ├── logout         POST   # Session termination
│   ├── check-status   GET    # Account status
│   └── reset-password POST   # Password reset
├── user/
│   ├── profile        GET/PUT # User profile
│   ├── dairy          CRUD   # Dairy management
│   ├── bmc           CRUD   # BMC management
│   ├── society       CRUD   # Society management
│   ├── farmer        CRUD   # Farmer management
│   └── machine       CRUD   # Machine management
└── superadmin/
    ├── approvals     GET/POST # Admin approval
    ├── database      GET/POST # DB operations
    └── auth/login    POST     # Super admin auth
```

### Request/Response Flow

```
Client Request
     │
     ▼
┌─────────────────┐
│   Middleware    │
├─────────────────┤
│ 1. CORS Headers │
│ 2. Rate Limiting│
│ 3. Body Parsing │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Authentication  │
├─────────────────┤
│ 1. JWT Verify   │
│ 2. User Context │
│ 3. Role Check   │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Authorization   │
├─────────────────┤
│ 1. Permission   │
│ 2. Resource     │
│ 3. Scope Check  │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Business Logic  │
├─────────────────┤
│ 1. Validation   │
│ 2. Processing   │
│ 3. Database Ops │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│   Response      │
├─────────────────┤
│ 1. Format Data  │
│ 2. Status Code  │
│ 3. Headers      │
└─────────────────┘
```

---

## 🔄 Data Flow Architecture

### User Registration & Approval Flow

```
┌─────────────┐   1. Register    ┌─────────────────┐
│   User      │──────────────────▶│ Registration    │
│             │                  │ Service         │
└─────────────┘                  └─────────────────┘
                                          │
                                          │ 2. Validate & Store
                                          ▼
                                 ┌─────────────────┐
                                 │ User Database   │
                                 │ (Pending Status)│
                                 └─────────────────┘
                                          │
                                          │ 3. Generate OTP
                                          ▼
┌─────────────┐  4. OTP Email   ┌─────────────────┐
│   User      │◀─────────────────│ Email Service   │
│             │                  │                 │
└─────────────┘                  └─────────────────┘
       │
       │ 5. Verify OTP
       ▼
┌─────────────┐  6. Verification ┌─────────────────┐
│ OTP Service │◀─────────────────│ User            │
│             │                  │                 │
└─────────────┘                  └─────────────────┘
       │
       │ 7. Update Status (if Admin: Pending Approval)
       ▼
┌─────────────┐  8. Approval     ┌─────────────────┐
│Super Admin  │  Notification    │ Email Service   │
│             │◀─────────────────│                 │
└─────────────┘                  └─────────────────┘
       │
       │ 9. Approve/Reject
       ▼
┌─────────────┐ 10. Schema       ┌─────────────────┐
│Admin Schema │  Creation        │ Database        │
│Generator    │──────────────────▶│ Service         │
└─────────────┘                  └─────────────────┘
```

### Multi-Tenant Data Access Flow

```
┌─────────────┐   1. API Request  ┌─────────────────┐
│   Client    │──────────────────▶│ API Endpoint    │
│ (Admin User)│                   │                 │
└─────────────┘                   └─────────────────┘
                                          │
                                          │ 2. Extract JWT
                                          ▼
                                 ┌─────────────────┐
                                 │ Auth Middleware │
                                 │ - Get user.dbKey│
                                 └─────────────────┘
                                          │
                                          │ 3. Schema Resolution
                                          ▼
                                 ┌─────────────────┐
                                 │ Schema Context  │
                                 │ "admin_ABC1234" │
                                 └─────────────────┘
                                          │
                                          │ 4. Query with Schema
                                          ▼
                                 ┌─────────────────┐
                                 │ Database Query  │
                                 │ USE admin_ABC123│
                                 │ SELECT * FROM..│
                                 └─────────────────┘
                                          │
                                          │ 5. Return Data
                                          ▼
┌─────────────┐  6. JSON Response ┌─────────────────┐
│   Client    │◀──────────────────│ API Response    │
│             │                   │ (Filtered Data) │
└─────────────┘                   └─────────────────┘
```

---

## 🏢 Deployment Architecture

### Azure Cloud Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Azure Cloud                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │    CDN      │    │   App       │    │   Database  │     │
│  │   (Future)  │    │  Service    │    │   (MySQL)   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │          │
│         │ Static Assets     │ Application       │ Data     │
│         │                   │ Runtime           │ Storage  │
│         ▼                   ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Global Load Balancer (Future)               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/HTTP2
                              ▼
                    ┌─────────────────┐
                    │   End Users     │
                    │ Web Browsers    │
                    └─────────────────┘
```

### Current Infrastructure

```yaml
# Azure Resources
Resource Group: PSR-v4-Production
Location: Southeast Asia

App Service:
  - Name: psr-v4-app
  - Tier: Basic B1 (Scalable to Standard/Premium)
  - Runtime: Node.js 18 LTS
  - OS: Linux
  - Features: 
    - Custom domains
    - SSL certificates
    - Deployment slots
    - Application logs

Database:
  - Service: Azure Database for MySQL
  - Tier: General Purpose
  - Version: 8.0
  - Storage: 100GB (Auto-grow enabled)
  - Backup: 7-day retention
  - Security:
    - SSL/TLS encryption
    - VNet integration
    - Firewall rules
    - Advanced threat protection

Monitoring:
  - Application Insights
  - Azure Monitor
  - Log Analytics
  - Alert rules
```

### Environment Configuration

```typescript
// Environment variables structure
interface EnvironmentConfig {
  // Database
  DB_HOST: string;           // Azure MySQL endpoint
  DB_PORT: string;           // 3306
  DB_NAME: string;           // psr_v4_c
  DB_USER: string;           // Database username
  DB_PASSWORD: string;       // Database password
  DB_SSL_CA: string;         // SSL certificate path

  // JWT Configuration
  JWT_SECRET: string;        // JWT signing secret
  JWT_REFRESH_SECRET: string; // Refresh token secret

  // Email Configuration
  SMTP_HOST: string;         // Gmail SMTP
  SMTP_PORT: string;         // 587
  SMTP_USER: string;         // Email username
  SMTP_PASS: string;         // App password
  FROM_EMAIL: string;        // Sender email

  // Application
  NEXT_PUBLIC_APP_URL: string; // Application URL
  NODE_ENV: string;          // production/development
  
  // Super Admin
  SUPER_ADMIN_USERNAME: string; // Super admin email
  SUPER_ADMIN_PASSWORD: string; // Super admin password
}
```

---

## 🔒 Security Architecture

### Defense in Depth Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Network Security                                   │
│ ├─ HTTPS/TLS 1.3 encryption                               │
│ ├─ Firewall rules (Azure NSG)                             │
│ └─ DDoS protection                                         │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Application Security                               │
│ ├─ OWASP security headers                                  │
│ ├─ Rate limiting (5 req/min auth)                         │
│ ├─ Input validation & sanitization                        │
│ └─ CORS policy enforcement                                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Authentication & Authorization                     │
│ ├─ JWT tokens (RS256 signing)                             │
│ ├─ Role-based access control                              │
│ ├─ Multi-factor authentication (OTP)                      │
│ └─ Session management                                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Data Security                                      │
│ ├─ Schema-level isolation                                  │
│ ├─ Parameterized queries (SQL injection prevention)       │
│ ├─ Password hashing (bcrypt)                              │
│ └─ Sensitive data encryption                               │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Infrastructure Security                            │
│ ├─ Azure security baseline                                 │
│ ├─ Database encryption at rest                            │
│ ├─ Backup encryption                                       │
│ └─ Audit logging                                           │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Security Flow

```typescript
class SecurityManager {
  // Password security
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10); // 10 rounds
  }

  // JWT security
  static generateJWT(payload: JWTPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
      algorithm: 'HS256'
    });
  }

  // Rate limiting
  static rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });

  // Account lockout
  static async checkAccountLockout(user: User): Promise<boolean> {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return true; // Account is locked
    }
    return false;
  }
}
```

---

## 📊 Performance Architecture

### Caching Strategy (Planned)

```
┌─────────────┐    1. Request     ┌─────────────────┐
│   Client    │──────────────────▶│ Next.js App     │
│             │                   │                 │
└─────────────┘                   └─────────────────┘
                                          │
                                          │ 2. Check Cache
                                          ▼
                                 ┌─────────────────┐
                                 │ Redis Cache     │
                                 │ (Planned)       │
                                 └─────────────────┘
                                          │
                                   Cache Miss │
                                          ▼
                                 ┌─────────────────┐
                                 │ Database Query  │
                                 │ (MySQL)         │
                                 └─────────────────┘
                                          │
                                          │ 3. Store Result
                                          ▼
                                 ┌─────────────────┐
                                 │ Update Cache    │
                                 │ (TTL: 5 min)    │
                                 └─────────────────┘
```

### Database Performance Optimization

```sql
-- Indexing strategy for admin schemas
CREATE INDEX idx_dairy_farms_status ON dairy_farms(status);
CREATE INDEX idx_dairy_farms_created_at ON dairy_farms(createdAt);
CREATE INDEX idx_bmcs_dairy_farm_id ON bmcs(dairyFarmId);
CREATE INDEX idx_societies_bmc_id ON societies(bmcId);
CREATE INDEX idx_farmers_society_id ON farmers(societyId);
CREATE INDEX idx_farmers_bmc_id ON farmers(bmcId);
CREATE INDEX idx_machines_society_id ON machines(societyId);

-- Query optimization
-- Use EXPLAIN to analyze query performance
EXPLAIN SELECT * FROM farmers 
WHERE societyId = 1 AND status = 'active' 
ORDER BY createdAt DESC 
LIMIT 10;
```

### Scalability Considerations

```typescript
// Connection pool optimization
const sequelize = new Sequelize({
  pool: {
    max: 15,        // Increase for high load
    min: 5,         // Maintain minimum connections
    acquire: 30000, // Connection timeout
    idle: 10000,    // Idle timeout (reduced)
    evict: 1000     // Eviction check interval
  },
  // Query optimization
  benchmark: true,  // Log query execution time
  logging: (sql, timing) => {
    if (timing > 1000) { // Log slow queries
      console.warn(`Slow query (${timing}ms): ${sql}`);
    }
  }
});
```

---

## 🚀 Scalability Architecture

### Horizontal Scaling Plan

```
Current Architecture (Single Instance):
┌─────────────┐
│   App       │──────┐
│ Instance 1  │      │
└─────────────┘      │
                     │    ┌─────────────┐
                     └───▶│   MySQL     │
                          │  Database   │
                          └─────────────┘

Future Architecture (Load Balanced):
┌─────────────┐      ┌─────────────────┐    ┌─────────────┐
│   App       │────┐ │   Load          │    │   MySQL     │
│ Instance 1  │    │ │  Balancer       │    │  Database   │
└─────────────┘    └▶│   (Azure)       │───▶│  (Primary)  │
┌─────────────┐    ┌▶│                 │    └─────────────┘
│   App       │────┘ └─────────────────┘           │
│ Instance 2  │            │                       │ Replication
└─────────────┘            │                       ▼
┌─────────────┐            │                ┌─────────────┐
│   App       │────────────┘                │   MySQL     │
│ Instance N  │                             │ (Read Only) │
└─────────────┘                             └─────────────┘
       │                                           │
       │ Session Store                             │ Read Queries
       ▼                                           │
┌─────────────┐                                   │
│    Redis    │──────────── Cache Layer ──────────┘
│   Cluster   │
└─────────────┘
```

### Microservices Evolution (Future)

```
Current Monolithic Architecture:
┌─────────────────────────────────────┐
│          Next.js Application        │
├─────────────────────────────────────┤
│ Auth | User | Dairy | BMC | Society │
│      | Mgmt | Mgmt  | Mgmt| Mgmt    │
└─────────────────────────────────────┘

Future Microservices Architecture:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Auth     │  │    User     │  │   Entity    │
│  Service    │  │ Management  │  │ Management  │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────────┐
              │    API      │
              │  Gateway    │
              └─────────────┘
                        │
              ┌─────────────┐
              │   Client    │
              │    Apps     │
              └─────────────┘
```

---

## 🔧 DevOps Architecture

### CI/CD Pipeline (Planned)

```yaml
# GitHub Actions Workflow
name: PSR-v4 CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Type check
        run: npm run type-check
      - name: Lint
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build application
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'psr-v4-app'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

### Monitoring & Observability

```typescript
// Application monitoring setup
class MonitoringService {
  static setupApplicationInsights() {
    // Azure Application Insights integration
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .start();
  }

  static trackCustomEvent(name: string, properties?: any) {
    appInsights.defaultClient.trackEvent({
      name,
      properties
    });
  }

  static trackError(error: Error, properties?: any) {
    appInsights.defaultClient.trackException({
      exception: error,
      properties
    });
  }
}
```

---

## 📈 Analytics Architecture

### User Activity Tracking

```typescript
interface UserActivity {
  userId: number;
  action: string;
  entityType: 'dairy' | 'bmc' | 'society' | 'farmer' | 'machine';
  entityId: string;
  timestamp: Date;
  metadata: {
    userAgent: string;
    ipAddress: string;
    sessionId: string;
  };
}

class AnalyticsService {
  static async trackUserAction(activity: UserActivity) {
    // Store in audit_logs table
    await AuditLog.create({
      userId: activity.userId,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      timestamp: activity.timestamp,
      ipAddress: activity.metadata.ipAddress,
      userAgent: activity.metadata.userAgent
    });
  }

  static async getDashboardMetrics(adminId: number) {
    // Aggregate metrics for admin dashboard
    const metrics = await sequelize.query(`
      SELECT 
        COUNT(CASE WHEN action = 'CREATE_DAIRY' THEN 1 END) as dairy_created,
        COUNT(CASE WHEN action = 'CREATE_BMC' THEN 1 END) as bmc_created,
        COUNT(CASE WHEN action = 'CREATE_SOCIETY' THEN 1 END) as society_created,
        COUNT(CASE WHEN action = 'CREATE_FARMER' THEN 1 END) as farmer_created
      FROM audit_logs 
      WHERE userId = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, { replacements: [adminId] });
    
    return metrics[0];
  }
}
```

---

## � External API Architecture ⭐ **NEW**

### Overview

The PSR-v4 system provides a dual authentication architecture supporting both internal JWT-based APIs and external db-key authenticated APIs. This separation enables secure third-party integration while maintaining strict internal security.

### Authentication Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                Authentication Layer                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐   │
│  │   JWT Authentication │         │  db-key Authentication│   │
│  │  (Internal APIs)     │         │  (External APIs)     │   │
│  ├─────────────────────┤         ├──────────────────────┤   │
│  │ • Role-based access │         │ • Organization-level │   │
│  │ • User-level auth   │         │ • System integration │   │
│  │ • 7-day expiry      │         │ • No expiry          │   │
│  │ • Refresh tokens    │         │ • Rate limiting      │   │
│  └─────────────────────┘         └──────────────────────┘   │
│           │                                  │               │
│           ▼                                  ▼               │
│  ┌─────────────────────┐         ┌──────────────────────┐   │
│  │  35+ Internal       │         │  5 External          │   │
│  │  Endpoints          │         │  Endpoints           │   │
│  │  - User Management  │         │  - Machine Correction│   │
│  │  - Entity CRUD      │         │  - Farmer Info       │   │
│  │  - Admin Functions  │         │  - Machine Passwords │   │
│  └─────────────────────┘         └──────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### External API Endpoint Structure

```
/api/[db-key]/[Module]/[Action]

Examples:
- /api/JOH1234/MachineCorrection/GetLatestMachineCorrection
- /api/JOH1234/FarmerInfo/GetLatestFarmerInfo
- /api/JOH1234/MachinePassword/GetLatestMachinePassword
```

### External API Request Flow

```
┌──────────────────┐
│  External System │
│  (Dairy Machine) │
└────────┬─────────┘
         │ 1. HTTP Request with db-key
         ▼
┌──────────────────────────────────┐
│   Next.js API Route Handler      │
│   /api/[db-key]/[Module]/[Action]│
└────────┬─────────────────────────┘
         │ 2. Extract db-key from URL
         ▼
┌──────────────────────────────────┐
│   db-key Validation Service      │
│   - Verify db-key exists         │
│   - Get admin schema name        │
│   - Check rate limits            │
└────────┬─────────────────────────┘
         │ 3. Valid db-key
         ▼
┌──────────────────────────────────┐
│   Schema Context Switch          │
│   - Switch to admin schema       │
│   - Set Sequelize context        │
└────────┬─────────────────────────┘
         │ 4. Execute in admin schema
         ▼
┌──────────────────────────────────┐
│   Business Logic Layer           │
│   - Validate request parameters  │
│   - Process machine ID variants  │
│   - Query database               │
└────────┬─────────────────────────┘
         │ 5. Return data
         ▼
┌──────────────────────────────────┐
│   Response Formatter             │
│   - Format JSON response         │
│   - Add metadata                 │
│   - Log activity                 │
└────────┬─────────────────────────┘
         │ 6. HTTP Response
         ▼
┌──────────────────┐
│  External System │
└──────────────────┘
```

### Alphanumeric Machine ID Architecture

#### Storage Strategy

```
Machine ID Formats:

Numeric:
  Input:    M00001
  Storage:  machine_id (INT) = 1
  Lookup:   WHERE machine_id = 1

Alphanumeric:
  Input:    M0000df
  Storage:  machine_id (VARCHAR) = 'M0000df'
            machine_id_variants (JSON) = ['0000df', 'df']
  Lookup:   WHERE machine_id = 'M0000df'
            OR JSON_CONTAINS(machine_id_variants, '"0000df"')
            OR JSON_CONTAINS(machine_id_variants, '"df"')
```

#### Variant Matching Logic

```typescript
// Variant Generation Algorithm
function generateMachineIdVariants(machineId: string): string[] {
  // Input: M0000df
  
  // Step 1: Remove 'M' prefix
  const withoutPrefix = machineId.slice(1); // "0000df"
  
  // Step 2: Generate variants
  const variants: string[] = [];
  
  // Variant 1: Full ID without prefix
  variants.push(withoutPrefix); // "0000df"
  
  // Variant 2: Remove leading zeros
  const withoutZeros = withoutPrefix.replace(/^0+/, ''); // "df"
  if (withoutZeros !== withoutPrefix) {
    variants.push(withoutZeros); // "df"
  }
  
  // Step 3: Add lowercase versions
  variants.push(withoutPrefix.toLowerCase()); // "0000df"
  variants.push(withoutZeros.toLowerCase()); // "df"
  
  // Return unique variants
  return [...new Set(variants)];
}

// Matching Algorithm
async function findMachineByVariant(machineId: string) {
  const variants = generateMachineIdVariants(machineId);
  
  // Try numeric match first
  if (/^\d+$/.test(machineId.slice(1))) {
    const numericId = parseInt(machineId.slice(1), 10);
    const machine = await Machine.findOne({
      where: { machine_id: numericId }
    });
    if (machine) return machine;
  }
  
  // Try alphanumeric variant matching
  for (const variant of variants) {
    const machine = await sequelize.query(`
      SELECT * FROM admin_machines 
      WHERE machine_id = :variant
      OR JSON_CONTAINS(machine_id_variants, :variantJson)
    `, {
      replacements: { 
        variant, 
        variantJson: JSON.stringify(variant) 
      }
    });
    if (machine[0].length > 0) return machine[0][0];
  }
  
  return null;
}
```

### Machine Correction Data Architecture

#### Database Schema

```sql
CREATE TABLE machine_corrections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id VARCHAR(50) NOT NULL,
  machine_id_variants JSON,
  
  -- Channel 1 Corrections
  fat_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  snf_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  clr_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  temp_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  water_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  protein_ch1 DECIMAL(10,4) DEFAULT 0.0000,
  
  -- Channel 2 Corrections
  fat_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  snf_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  clr_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  temp_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  water_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  protein_ch2 DECIMAL(10,4) DEFAULT 0.0000,
  
  -- Channel 3 Corrections
  fat_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  snf_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  clr_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  temp_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  water_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  protein_ch3 DECIMAL(10,4) DEFAULT 0.0000,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_machine_id (machine_id),
  INDEX idx_updated_at (updated_at)
);
```

#### Data Flow for GetLatestMachineCorrection

```
┌──────────────────────────┐
│  External Request        │
│  GET /api/JOH1234/...    │
│  { machineId: "M0000df" }│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Parse Machine ID        │
│  Input: M0000df          │
│  Variants: [0000df, df]  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Query Database          │
│  - Check numeric ID      │
│  - Check variant matches │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Format Response         │
│  {                       │
│    status: "success",    │
│    data: {               │
│      machine_id: "M0000df",
│      corrections: {      │
│        channel1: {...},  │
│        channel2: {...},  │
│        channel3: {...}   │
│      }                   │
│    }                     │
│  }                       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Return to External      │
│  System                  │
└──────────────────────────┘
```

### Security Architecture for External APIs

```
┌──────────────────────────────────────────────────────────┐
│              Security Layer - External APIs              │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. db-key Validation                                    │
│     ✅ Verify db-key exists in AdminSchemas table        │
│     ✅ Check admin account status (ACTIVE only)          │
│     ✅ Validate db-key format (3 letters + 4 digits)     │
│                                                           │
│  2. Rate Limiting                                        │
│     ✅ Per db-key rate limit (100 requests/minute)       │
│     ✅ Per IP rate limit (1000 requests/hour)            │
│     ✅ Burst protection (10 requests/second)             │
│                                                           │
│  3. Input Validation                                     │
│     ✅ Machine ID format validation                      │
│     ✅ Parameter sanitization                            │
│     ✅ SQL injection prevention                          │
│                                                           │
│  4. CORS Configuration                                   │
│     ✅ Allowed origins whitelist                         │
│     ✅ Preflight request handling                        │
│     ✅ Credentials policy                                │
│                                                           │
│  5. Audit Logging                                        │
│     ✅ Log all external API requests                     │
│     ✅ Track machine ID lookups                          │
│     ✅ Record response status and timing                 │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### API Versioning Strategy

```
Current Implementation: /api/[db-key]/[Module]/[Action]

Future Versioning:
- v1: /api/v1/[db-key]/[Module]/[Action]
- v2: /api/v2/[db-key]/[Module]/[Action]

Version Management:
- Backwards compatibility for 2 major versions
- Deprecation notices 6 months in advance
- Clear migration guides between versions
```

---

## �🔮 Future Architecture Considerations

### Planned Enhancements

1. **Real-time Features**
   - WebSocket integration for live updates
   - Server-Sent Events (SSE) for notifications
   - Real-time dashboard metrics

2. **Advanced Security**
   - OAuth 2.0 integration
   - SAML SSO support
   - Advanced threat detection

3. **Performance Optimization**
   - Redis caching layer
   - CDN integration
   - Database read replicas

4. **Mobile Support**
   - React Native mobile app
   - Progressive Web App (PWA)
   - Offline synchronization

5. **AI Integration**
   - Predictive analytics
   - Anomaly detection
   - Automated insights

---

## 📚 Architecture Documentation

### Key Architectural Decisions

1. **Multi-Tenant Strategy**: Schema isolation for complete data separation
2. **Authentication**: JWT-based stateless authentication
3. **Database Choice**: MySQL for ACID compliance and Azure integration
4. **Frontend Framework**: Next.js for SSR and developer experience
5. **Deployment Platform**: Azure for enterprise security and compliance

### Trade-offs and Considerations

| Decision | Pros | Cons | Mitigation |
|----------|------|------|------------|
| Schema Isolation | Complete data separation, scalable | Complex queries across tenants | Admin-level reporting APIs |
| JWT Authentication | Stateless, scalable | Token management complexity | Refresh token rotation |
| MySQL Database | ACID, mature ecosystem | Horizontal scaling challenges | Read replicas, sharding plan |
| Next.js Framework | Full-stack, SEO-friendly | Learning curve, vendor lock-in | Standard React patterns |

---

## 📞 Support & Maintenance

### Architecture Review Process
- **Monthly**: Performance metrics review
- **Quarterly**: Security audit and updates
- **Annually**: Architecture evolution planning

### Key Metrics to Monitor
- **Response Time**: < 2 seconds (95th percentile)
- **Availability**: > 99.9% uptime
- **Error Rate**: < 0.1% of requests
- **Database Performance**: < 100ms average query time

---

**Architecture Documentation Version**: 2.0  
**Last Updated**: November 5, 2025  
**Architecture Team**: PSR-v4 Development Team  
**Next Review**: February 5, 2026