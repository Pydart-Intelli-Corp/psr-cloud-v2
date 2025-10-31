# PSR-v4 Project Structure

**Poornasree Equipments Cloud Web Application**  
*Version: 0.1.0 | Last Updated: October 25, 2025*

---

## 📁 Directory Structure

```
psr-v4/
├── 📄 Configuration Files
│   ├── package.json                    # Project dependencies and scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── next.config.ts                  # Next.js configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.mjs              # PostCSS configuration
│   ├── eslint.config.mjs               # ESLint configuration
│   ├── next-env.d.ts                   # Next.js TypeScript declarations
│   └── .env.local                      # Environment variables (not in git)
│
├── 📂 config/
│   └── database.js                     # Sequelize database configuration
│
├── 📂 database/
│   ├── migrations/                     # Database migration files
│   │   ├── 20241022000001-create-users.js
│   │   ├── 20241022000002-create-admin-schemas.js
│   │   ├── 20241022000003-create-audit-logs.js
│   │   ├── 20241023000004-update-admin-company-fields.js
│   │   ├── 20241023000005-update-users-fullname.js
│   │   └── 20241023000006-add-pending-approval-status.js
│   └── seeders/                        # Database seed files
│       └── 20241022000001-super-admin-user.js
│
├── 📂 docs/                            # Project documentation
│   ├── FEATURES.md                     # Complete feature list
│   ├── README.md                       # Documentation index
│   ├── ADMIN_APPROVAL_WORKFLOW_TEST_GUIDE.md
│   ├── EMAIL_VALIDATION_AND_STATUS_SYSTEM.md
│   ├── DAIRY_MANAGEMENT_IMPLEMENTATION.md
│   └── PSR_COLOR_SYSTEM_IMPLEMENTATION.md
│
├── 📂 public/                          # Static assets
│   ├── favicon.ico
│   ├── fulllogo.png
│   └── [other static files]
│
├── 📂 scripts/
│   └── migrate.mjs                     # Custom migration runner
│
├── 📂 src/                             # Source code
│   ├── 📂 app/                         # Next.js App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles
│   │   ├── icon.tsx                    # Dynamic favicon
│   │   ├── apple-icon.tsx              # Apple touch icon
│   │   │
│   │   ├── 📂 (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx            # Registration page
│   │   │   ├── verify-otp/
│   │   │   │   └── page.tsx            # OTP verification page
│   │   │   └── status/
│   │   │       └── page.tsx            # Account status checker
│   │   │
│   │   ├── 📂 superadmin/              # Super Admin routes
│   │   │   ├── page.tsx                # Super Admin home
│   │   │   ├── layout.tsx              # Super Admin layout
│   │   │   ├── middleware.ts           # Route protection
│   │   │   └── dashboard/
│   │   │       └── page.tsx            # Super Admin dashboard
│   │   │
│   │   ├── 📂 admin/                   # Admin routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Admin dashboard
│   │   │   ├── dairy/
│   │   │   │   ├── page.tsx            # Dairy management list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Dairy detail view
│   │   │   └── profile/
│   │   │       └── page.tsx            # Admin profile
│   │   │
│   │   ├── 📂 api/                     # API Routes
│   │   │   ├── 📂 auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts        # POST - User registration
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts        # POST - User login
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts        # POST - User logout
│   │   │   │   ├── verify-otp/
│   │   │   │   │   └── route.ts        # POST - OTP verification
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── route.ts        # GET - Email verification
│   │   │   │   ├── resend-otp/
│   │   │   │   │   └── route.ts        # POST - Resend OTP
│   │   │   │   ├── resend-verification/
│   │   │   │   │   └── route.ts        # POST - Resend verification
│   │   │   │   ├── check-status/
│   │   │   │   │   └── route.ts        # GET/POST - Check account status
│   │   │   │   ├── validate-email/
│   │   │   │   │   └── route.ts        # POST - Email validation
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── route.ts        # POST - Password reset request
│   │   │   │   └── reset-password/
│   │   │   │       └── route.ts        # POST - Reset password
│   │   │   │
│   │   │   ├── 📂 superadmin/
│   │   │   │   ├── approvals/
│   │   │   │   │   └── route.ts        # GET/POST - Admin approvals
│   │   │   │   ├── auth/
│   │   │   │   │   └── route.ts        # Super Admin auth
│   │   │   │   └── database/
│   │   │   │       └── route.ts        # Database operations
│   │   │   │
│   │   │   ├── 📂 user/
│   │   │   │   ├── dairy/
│   │   │   │   │   └── route.ts        # GET/POST/DELETE - Dairy CRUD
│   │   │   │   ├── bmc/
│   │   │   │   │   └── route.ts        # BMC operations
│   │   │   │   ├── society/
│   │   │   │   │   └── route.ts        # Society operations
│   │   │   │   └── profile/
│   │   │   │       └── route.ts        # User profile
│   │   │   │
│   │   │   └── 📂 pincode/
│   │   │       └── route.ts            # GET - Pincode lookup
│   │   │
│   │   ├── 📂 color-system/
│   │   │   └── page.tsx                # Color system showcase
│   │   ├── 📂 diagnostic/
│   │   │   └── page.tsx                # System diagnostics
│   │   └── 📂 splash/
│   │       └── page.tsx                # Splash screen
│   │
│   ├── 📂 components/                  # React components
│   │   ├── index.ts                    # Component exports
│   │   ├── LandingPage.tsx             # Main landing page
│   │   ├── FlowerSpinner.tsx           # Loading spinner
│   │   ├── LoadingSpinner.tsx          # Alternative spinner
│   │   ├── LoadingOverlay.tsx          # Full-page loading
│   │   ├── PageLoading.tsx             # Page transition loading
│   │   ├── DashboardLoadingOverlay.tsx # Dashboard loading
│   │   ├── LoadingButton.tsx           # Button with loading state
│   │   ├── LoadingProvider.tsx         # Loading context provider
│   │   ├── LoadingDemo.tsx             # Loading component demo
│   │   ├── Skeleton.tsx                # Skeleton loader
│   │   ├── PSRColorShowcase.tsx        # Color system demo
│   │   ├── LOADING_COMPONENTS_GUIDE.md # Loading components docs
│   │   │
│   │   ├── 📂 auth/
│   │   │   ├── LoginForm.tsx           # Login form component
│   │   │   ├── RegisterForm.tsx        # Registration form
│   │   │   └── OTPVerification.tsx     # OTP input component
│   │   │
│   │   ├── 📂 forms/
│   │   │   ├── InputField.tsx          # Reusable input field
│   │   │   ├── SelectField.tsx         # Reusable select field
│   │   │   └── FormButton.tsx          # Form submit button
│   │   │
│   │   ├── 📂 layout/
│   │   │   ├── Sidebar.tsx             # Dashboard sidebar
│   │   │   ├── DashboardLayout.tsx     # Dashboard layout wrapper
│   │   │   ├── Header.tsx              # Page header
│   │   │   └── Footer.tsx              # Page footer
│   │   │
│   │   └── 📂 management/
│   │       ├── DairyCard.tsx           # Dairy display card
│   │       ├── DairyForm.tsx           # Dairy form
│   │       └── EntityList.tsx          # Generic entity list
│   │
│   ├── 📂 contexts/
│   │   └── UserContext.tsx             # User context (empty placeholder)
│   │
│   ├── 📂 lib/                         # Utility libraries
│   │   ├── database.ts                 # Database connection & utilities
│   │   ├── auth.ts                     # JWT & authentication utilities
│   │   ├── emailService.ts             # Email sending service
│   │   ├── emailValidation.ts          # Email validation utilities
│   │   ├── adminSchema.ts              # Admin schema management
│   │   ├── pincodeService.ts           # Indian pincode lookup
│   │   ├── migrations.mjs              # Migration runner utilities
│   │   └── utils/
│   │       ├── cn.ts                   # Class name utilities
│   │       └── validators.ts           # Input validators
│   │
│   ├── 📂 middleware/
│   │   └── auth.ts                     # Authentication middleware
│   │
│   ├── 📂 models/                      # Sequelize models
│   │   ├── index.ts                    # Model exports & associations
│   │   ├── User.ts                     # User model
│   │   ├── AdminSchema.ts              # AdminSchema model
│   │   └── AuditLog.ts                 # AuditLog model
│   │
│   └── 📂 types/
│       ├── index.ts                    # Type exports
│       ├── auth.ts                     # Authentication types
│       ├── user.ts                     # User types
│       └── api.ts                      # API response types
│
├── 📄 Documentation Files
│   ├── README.md                       # Main project README
│   ├── PROJECT_STRUCTURE.md            # This file
│   ├── UPDATE_LOG.md                   # Development update log
│   ├── PROJECT_SUMMARY.md              # Project summary
│   ├── DAIRY_MANAGEMENT_IMPLEMENTATION.md
│   ├── PSR_COLOR_SYSTEM_IMPLEMENTATION.md
│   ├── DigiCertGlobalRootCA.crt.pem   # Azure MySQL SSL certificate
│   └── psr-v4.code-workspace          # VS Code workspace
│
└── 📄 Other Files
    ├── .gitignore                      # Git ignore rules
    ├── .env.local.example              # Environment variables template
    └── vercel.json                     # Vercel deployment config
```

---

## 🗂️ Key Directories Explained

### `/src/app` - Next.js App Router
- Uses Next.js 15's App Router architecture
- File-based routing with support for layouts and nested routes
- Route groups (auth) for logical organization without URL nesting
- API routes colocated with the application

### `/src/components` - React Components
- Reusable UI components
- Organized by feature/domain
- Material Design 3 implementation
- Loading states and animations

### `/src/lib` - Business Logic & Utilities
- Database connection and queries
- Authentication and authorization
- Email services
- Third-party integrations

### `/src/models` - Database Models
- Sequelize ORM models
- Type-safe database schema
- Model associations and relationships

### `/database` - Database Management
- Sequelize migrations for schema versioning
- Seeders for initial data
- Separated from application code for clarity

### `/docs` - Documentation
- Feature documentation
- Implementation guides
- Testing procedures
- API documentation

---

## 📊 File Categories

### Configuration (8 files)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler settings
- `next.config.ts` - Next.js framework settings
- `tailwind.config.js` - Styling framework
- `eslint.config.mjs` - Code quality rules
- `postcss.config.mjs` - CSS processing
- `.env.local` - Environment variables
- `config/database.js` - Database connection config

### Source Code (~80+ files)
- **Pages**: 15+ page components
- **API Routes**: 20+ API endpoints
- **Components**: 25+ React components
- **Models**: 3 database models
- **Utilities**: 10+ helper libraries
- **Middleware**: Authentication and validation

### Documentation (10+ files)
- Technical documentation
- Feature guides
- Testing procedures
- Implementation notes

### Database (7 files)
- 6 migration files
- 1 seeder file

---

## 🔑 Critical Files

### Application Entry Points
1. **`src/app/layout.tsx`** - Root layout, metadata, fonts
2. **`src/app/page.tsx`** - Landing page (home)
3. **`src/middleware.ts`** - Global middleware (if exists)

### Authentication Core
1. **`src/lib/auth.ts`** - JWT generation, verification, validation
2. **`src/middleware/auth.ts`** - Request authentication
3. **`src/models/User.ts`** - User data model

### Database Core
1. **`src/lib/database.ts`** - Connection pooling, schema creation
2. **`src/models/index.ts`** - Model initialization & associations
3. **`config/database.js`** - Sequelize configuration

### Email System
1. **`src/lib/emailService.ts`** - Email templates and sending
2. **`src/lib/emailValidation.ts`** - Email validation logic

### Admin Management
1. **`src/lib/adminSchema.ts`** - Schema creation and management
2. **`src/app/api/superadmin/approvals/route.ts`** - Approval workflow

---

## 🎯 Route Mapping

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/verify-otp` - Email verification
- `/status` - Account status checker

### Protected Routes (Authentication Required)
- `/superadmin/dashboard` - Super Admin dashboard
- `/admin/dashboard` - Admin dashboard
- `/admin/dairy` - Dairy management
- `/admin/dairy/[id]` - Dairy details

### API Routes
- **Auth**: `/api/auth/*` - Authentication endpoints
- **User**: `/api/user/*` - User data and operations
- **Super Admin**: `/api/superadmin/*` - Admin management
- **Utilities**: `/api/pincode` - Helper services

---

## 📦 Dependencies Breakdown

### Frontend Core
- **next** (16.0.0) - React framework
- **react** (19.2.0) - UI library
- **react-dom** (19.2.0) - React DOM renderer

### Styling
- **tailwindcss** (3.4.18) - Utility-first CSS
- **framer-motion** (12.23.24) - Animations
- **@heroicons/react** (2.2.0) - Icons
- **lucide-react** (0.546.0) - Additional icons

### Backend
- **express** (5.1.0) - API server
- **sequelize** (6.37.7) - ORM
- **mysql2** (3.15.3) - MySQL driver

### Authentication
- **jsonwebtoken** (9.0.2) - JWT tokens
- **bcryptjs** (3.0.2) - Password hashing

### Email
- **nodemailer** (7.0.9) - Email sending

### Security
- **helmet** (8.1.0) - Security headers
- **cors** (2.8.5) - CORS handling
- **express-validator** (7.2.1) - Input validation
- **rate-limiter-flexible** (8.1.0) - Rate limiting

### Utilities
- **dotenv** (17.2.3) - Environment variables
- **winston** (3.18.3) - Logging
- **multer** (2.0.2) - File uploads

---

## 🏗️ Architecture Patterns

### Frontend
- **Component-based architecture** - Reusable React components
- **File-based routing** - Next.js App Router
- **Server-side rendering** - Next.js SSR capabilities
- **API routes** - Backend logic in Next.js

### Backend
- **RESTful API** - Standard HTTP methods
- **Middleware pattern** - Request processing pipeline
- **Repository pattern** - Database abstraction
- **Service layer** - Business logic separation

### Database
- **Multi-tenant** - Schema per admin
- **Migration-based** - Version-controlled schema
- **ORM pattern** - Sequelize models

### Security
- **JWT authentication** - Stateless auth
- **Role-based access control** - Hierarchical permissions
- **Input validation** - Express-validator
- **SQL injection prevention** - Parameterized queries

---

## 📈 Code Statistics (Approximate)

- **Total Files**: ~120+
- **TypeScript Files**: ~60
- **JavaScript Files**: ~15
- **React Components**: ~30
- **API Endpoints**: ~20
- **Database Models**: 3
- **Migrations**: 6
- **Lines of Code**: ~15,000+

---

## 🔄 Update Tracking

**Last Structure Update**: October 25, 2025  
**Version**: 0.1.0  
**Major Changes**: Initial project structure documentation

---

## 📝 Notes

1. **Environment Variables**: Never commit `.env.local` to version control
2. **SSL Certificate**: `DigiCertGlobalRootCA.crt.pem` required for Azure MySQL
3. **Build Output**: `.next/` directory generated during build (gitignored)
4. **Node Modules**: `node_modules/` managed by npm (gitignored)
5. **Migration Order**: Migrations run in chronological order by timestamp

---

*This structure reflects the current state of the PSR-v4 project as of October 25, 2025.*
