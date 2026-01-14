# PSR Cloud V2 - Complete System Documentation

**Version**: 2.1.0  
**Last Updated**: January 2026  
**Status**: 🟢 Production Ready

---

## 📋 Quick Navigation

- [🎯 Overview](#overview)
- [🚀 Quick Start](#quick-start)
- [🏗️ Architecture](#architecture)
- [👥 User Roles](#user-roles)
- [🗄️ Database](#database)
- [📡 API Reference](#api-reference)
- [🎯 Features](#features)
- [💻 Development](#development)
- [🚀 Deployment](#deployment)
- [🔧 Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What is PSR Cloud V2?

Multi-tenant dairy equipment management platform with complete data isolation, role-based access control, and comprehensive entity management.

### Key Features

- 🏗️ Multi-tenant architecture with dedicated schemas
- 🔐 6-level role hierarchy (Super Admin → Farmer)
- 📊 Complete entity management (Dairy, BMC, Society, Farmer, Machine)
- 👨‍🌾 Unique Farmer UID system (LLNN-DDDD format)
- 📱 Mobile app integration (Flutter)
- 📧 Automated email workflows
- 📄 Professional PDF reports
- 🌍 Multi-language (English, Hindi, Malayalam)

### Tech Stack

**Frontend**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS  
**Backend**: Node.js + Express + Sequelize ORM  
**Database**: Azure MySQL 8.0 with SSL  
**Mobile**: Flutter 3.10.4+  
**Auth**: JWT + bcryptjs  
**Email**: Nodemailer + Gmail SMTP

---

## 🚀 Quick Start

### Installation

```bash
# Clone and install
git clone https://github.com/your-repo/psr-cloud-v2.git
cd psr-cloud-v2
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
npm run db:init

# Start development
npm run dev
```

### Default Credentials

- **Super Admin**: `admin` / `psr@2025`
- **URL**: http://localhost:3000

### Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build production
npm run start            # Start production

# Database
npm run db:init          # Initialize DB
npm run db:migrate       # Run migrations
npm run db:backup        # Create backup
npm run db:reset         # Reset DB (⚠️ DESTRUCTIVE)

# Utilities
npm run lint             # Code linting
npm run type-check       # TypeScript check
```

---

## 🏗️ Architecture

### Multi-Tenant Design

**Main Database** (`psr_v4_main`)
- `users` - All system users
- `admin_schemas` - Schema metadata
- `machinetype` - Machine definitions
- `otps` - OTP tracking

**Admin Schemas** (Dynamic per organization)
- Format: `{adminname}_{dbkey}` (e.g., `john_joh1234`)
- 17+ tables per schema
- Complete data isolation
- Independent CRUD operations

### Database Schema Generation

```typescript
// Admin approval triggers schema creation
dbKey = generateDbKey(adminName); // e.g., "JOH1234"
schemaName = `${cleanName}_${dbKey.toLowerCase()}`; // "john_joh1234"
createAdminSchema(schemaName);
```

---

## 👥 User Roles

### Role Hierarchy

```
Level 6: super_admin  → System administrator
Level 5: admin        → Organization owner (dedicated schema)
Level 4: dairy        → Dairy facility manager
Level 3: bmc          → Bulk Milk Cooling Center
Level 2: society      → Farmer society coordinator
Level 1: farmer       → Individual farmer
```

### Permissions Matrix

| Role | Create Users | Manage Entities | View Reports | Database Access |
|------|--------------|-----------------|--------------|-----------------|
| Super Admin | ✅ Approve admins | ❌ Read-only | ✅ All | All schemas (read) |
| Admin | ✅ All below | ✅ Full CRUD | ✅ Own org | Own schema (full) |
| Dairy | ✅ BMC, Society | ✅ Own dairy | ✅ Own dairy | Own dairy scope |
| BMC | ✅ Society, Farmer | ✅ Own BMC | ✅ Own BMC | Own BMC scope |
| Society | ✅ Farmer | ✅ Own society | ✅ Own society | Own society scope |
| Farmer | ❌ None | ❌ View only | ✅ Personal | Personal data only |

---

## 🗄️ Database

### Main Tables

**users** - All user accounts
```sql
id, uid, email, password, fullName, role, status, dbKey, 
companyName, isEmailVerified, otpCode, otpExpires, 
loginAttempts, lockUntil, createdAt, updatedAt
```

**admin_schemas** - Schema metadata
```sql
id, adminId, schemaKey, schemaName, status, configuration
```

### Admin Schema Tables (17 tables)

**Core Entities**
- `dairy_farms` - Dairy facilities
- `bmcs` - Bulk Milk Cooling Centers
- `societies` - Farmer societies
- `farmers` - Individual farmers (with farmeruid)
- `machines` - Equipment tracking

**Operations**
- `milk_collections` - Daily collection records
- `milk_dispatches` - Dispatch tracking
- `milk_sales` - Sales records
- `rate_charts` - Pricing tables
- `rate_chart_download_history` - Download tracking

**Advanced**
- `machine_statistics` - Performance metrics
- `machine_corrections` - ESP32 corrections
- `machine_access_requests` - Master machine access
- `section_pulse` - Real-time pulse tracking

### FarmerUID System

**Format**: `LLNN-DDDD` (e.g., `AB12-3456`)
- **L**: Random uppercase letter
- **N**: Random digit
- **D**: Random digit
- **Unique**: Per admin schema
- **Auto-generated**: On farmer creation
- **Collision detection**: 100-retry mechanism

```typescript
// Generation example
farmeruid = await generateUniqueFarmerUID(schemaName, sequelize);
// Returns: "AB12-3456"
```

### Database Scripts

```bash
# State Management
node scripts/check-database-state.js      # Check current state
node scripts/backup-database.js           # Create timestamped backup
node scripts/reset-database.js            # Complete reset (⚠️)

# FarmerUID Management
node scripts/add-farmeruid-column.js      # Add to existing schemas
node scripts/check-farmeruid-status.js    # Verify implementation

# Performance
node scripts/add-admin-schema-indexes.js  # Add performance indexes

# Utilities
node scripts/find-farmer.js               # Search farmers
node scripts/check-farmer-society.js      # Verify relationships
```

---

## 📡 API Reference

### Authentication

```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/verify-otp        # Email OTP verification
POST /api/auth/forgot-password   # Password reset request
POST /api/auth/reset-password    # Password reset completion
POST /api/superadmin/auth/login  # Super admin login
```

### Farmer Management

```http
GET    /api/user/farmer          # List all farmers
GET    /api/user/farmer?id=X     # Get farmer by ID
POST   /api/user/farmer          # Create farmer (auto-generates farmeruid)
PUT    /api/user/farmer          # Update farmer
DELETE /api/user/farmer?id=X     # Delete farmer
POST   /api/user/farmer/upload   # CSV bulk upload
```

**Create Farmer Request**:
```json
{
  "farmerId": "FARM001",
  "farmeruid": "AB12-3456",
  "farmerName": "John Doe",
  "contactNumber": "9876543210",
  "email": "john@example.com",
  "societyId": 1,
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Farmer created successfully",
  "data": {
    "farmerId": "FARM001",
    "farmeruid": "AB12-3456",
    "name": "John Doe"
  }
}
```

### Society Management

```http
GET    /api/user/society         # List societies
POST   /api/user/society         # Create society
PUT    /api/user/society         # Update society
DELETE /api/user/society         # Delete society
```

### Machine Management

```http
GET    /api/user/machine                    # List machines
POST   /api/user/machine                    # Create machine
PUT    /api/user/machine                    # Update machine
DELETE /api/user/machine                    # Delete machine
PUT    /api/user/machine/[id]/password      # Update passwords
PUT    /api/user/machine/[id]/set-master    # Set master machine
POST   /api/superadmin/machines/upload-image # Upload machine image
```

### Reports

```http
GET /api/user/reports/collections  # Collection reports
GET /api/user/reports/sales        # Sales reports
GET /api/user/reports/dispatches   # Dispatch reports
POST /api/user/reports/send-email  # Email report with PDF/CSV
```

### External API (Mobile App)

```http
POST /api/external/auth/send-otp       # Send OTP to email
POST /api/external/auth/verify-otp     # Verify OTP and login
GET  /api/external/auth/dashboard      # Get dashboard data
GET  /api/external/auth/machines       # Get machines list
GET  /api/external/farmer/[farmeruid]  # Get farmer by UID
```

---

## 🎯 Features

### 1. FarmerUID System ✅

**Status**: Production Ready

Automatic unique identifier generation for farmers.

**Features**:
- Format: `LLNN-DDDD` (9 characters)
- Auto-generation on creation
- Collision detection (100 retries)
- Batch optimization for bulk uploads
- Database UNIQUE constraint
- Multi-tenant safe (unique per schema)

**Usage**:
```typescript
// Single farmer
const farmeruid = await generateUniqueFarmerUID(schemaName, sequelize);

// Bulk upload
const farmeruids = await generateUniqueFarmerUIDsBatch(count, schemaName, sequelize);
```

### 2. Machine Management ✅

**Master Machine Concept**:
- One master machine per society
- Master distributes passwords to other machines
- Rate chart synchronization
- Performance tracking

**Password Management**:
1. Admin sets password in web app
2. Status: "pending injection"
3. ESP32 downloads password
4. Status: "injected"

**Features**:
- Image upload and display
- Rate chart assignment
- Performance analytics
- Bulk operations
- Access request system

### 3. Report Management ✅

**Report Types**:
- **Collections**: Daily milk collection records
- **Sales**: Milk sales transactions
- **Dispatches**: Dispatch tracking

**Features**:
- Real-time data (1-second refresh)
- Advanced filtering (date, society, machine, farmer)
- Multi-field search
- Bulk delete with password confirmation
- Export to CSV/PDF
- Email reports with attachments
- Column selection for exports
- Weighted averages calculation

**Statistics**:
- Total collections/quantity/amount
- Average rate per liter
- Weighted FAT/SNF/CLR percentages

### 4. Multi-Language Support ✅

**Languages**: English, Hindi, Malayalam

**Implementation**:
```typescript
// Context-based switching
const { t } = useLanguage();
<Text>{t('dashboard')}</Text>
```

### 5. Email System ✅

**Templates**:
- OTP verification
- Welcome email
- Password reset
- Admin approval/rejection
- Machine maintenance reminders
- Collection reports

**Configuration**: Gmail SMTP with app-specific passwords

### 6. PDF Generation ✅

**Reports**:
- Sales reports with tables & charts
- Collection summaries
- Dispatch documents
- Custom receipts

**Libraries**: jsPDF 3.0.3 + jsPDF-AutoTable 5.0.2

---

## 💻 Development

### Project Structure

```
psr-cloud-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API endpoints
│   │   ├── superadmin/        # Super admin panel
│   │   └── farmer/            # Farmer portal
│   ├── components/            # React components
│   │   ├── auth/              # Auth components
│   │   ├── forms/             # Form components
│   │   ├── management/        # Entity management
│   │   └── reports/           # Report components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # Auth utilities
│   │   ├── database.ts        # DB connection
│   │   ├── emailService.ts    # Email service
│   │   └── farmeruid-generator.ts # UID generation
│   ├── models/                # Sequelize models
│   │   ├── User.ts
│   │   └── AdminSchema.ts
│   └── types/                 # TypeScript types
│       └── farmer.ts
├── database/
│   ├── migrations/            # DB migrations
│   └── seeders/               # DB seeders
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
└── public/                    # Static assets
```

### Code Standards

- **TypeScript**: Strict mode
- **ESLint**: Next.js rules
- **Commits**: Conventional format
- **Components**: Functional with hooks
- **API**: RESTful design

### Adding New Features

1. **Database**: Create migration
2. **Models**: Define Sequelize model
3. **API**: Add route handler
4. **Frontend**: Create components
5. **Types**: Define TypeScript interfaces
6. **Docs**: Update documentation

---

## 🚀 Deployment

### Environment Variables

```env
# Database
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=psr_v4_main
DB_USER=your-user
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Super Admin
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=psr@2025
```

### Production Deployment

```bash
# Build
npm run build

# Run migrations
npm run migration:up

# Start with PM2
pm2 start ecosystem.config.js
```

### Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database migrations completed
- [ ] Email service tested
- [ ] Super admin secured
- [ ] Firewall configured
- [ ] Backups automated

---

## 🔧 Troubleshooting

### Database Connection

**Issue**: Cannot connect to MySQL

**Solution**:
```bash
# Verify credentials
DB_HOST=correct-host
DB_USER=correct-user
DB_PASSWORD=correct-password

# Test connection
npm run db:check
```

### Authentication

**Issue**: Invalid token

**Solution**:
- Clear browser cookies/localStorage
- Regenerate JWT secrets
- Check token expiry (7 days access, 30 days refresh)

### Email Not Sending

**Issue**: SMTP authentication failed

**Solution**:
1. Enable 2FA on Gmail
2. Generate app-specific password
3. Use app password in `SMTP_PASS`

### FarmerUID Issues

**Issue**: Duplicate farmeruid

**Solution**:
```bash
# Check status
node scripts/check-farmeruid-status.js

# Add to existing schemas
node scripts/add-farmeruid-column.js
```

### Performance Issues

**Issue**: Slow queries

**Solution**:
```bash
# Add indexes
node scripts/add-admin-schema-indexes.js

# Check query execution
# Monitor database connection pool
```

---

## 📊 Status

### Version 2.1.0 - Production Ready ✅

| Feature | Status | Completion |
|---------|--------|------------|
| Authentication | ✅ | 100% |
| Multi-Tenant | ✅ | 100% |
| FarmerUID | ✅ | 100% |
| Farmer Management | ✅ | 100% |
| Society Management | ✅ | 100% |
| Machine Management | ✅ | 100% |
| Report Management | ✅ | 100% |
| Email System | ✅ | 100% |
| PDF Generation | ✅ | 100% |
| Mobile App API | ✅ | 100% |
| Super Admin Panel | ✅ | 100% |

### Recent Updates

**January 2026**:
- ✅ FarmerUID system complete
- ✅ External API for mobile
- ✅ Documentation consolidated

**December 2025**:
- ✅ Machine image upload
- ✅ Master machine access
- ✅ Performance optimizations

---

## 📚 Additional Resources

- **GitHub**: [PSR Cloud V2](https://github.com/your-repo/psr-cloud-v2)
- **Mobile App**: [Poornasree Connect](https://github.com/your-repo/poornasree-connect)
- **Support**: GitHub Issues
- **License**: MIT

---

**Made with ❤️ by PSR-v4 Development Team**  
**Version**: 2.1.0 | **Status**: 🟢 Production Ready
