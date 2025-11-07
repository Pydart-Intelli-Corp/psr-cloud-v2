# Poornasree Equipments Cloud Web Application (PSR-v4)

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/your-repo/psr-v4)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/your-repo/psr-v4)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Auto Deploy](https://img.shields.io/badge/deploy-automated-success.svg)](https://github.com/your-repo/psr-v4/actions)

A comprehensive, multi-tenant dairy equipment management platform built with modern web technologies. Features complete role-based authentication, dedicated database schemas per organization, and comprehensive entity management for dairy operations.

**Last Updated**: November 7, 2025

## 🎯 Quick Deploy (10 Minutes)

Get your production server running with **zero manual configuration**:

```bash
1. Add 5 GitHub Secrets → 2. Click "Run Workflow" → 3. Access your app!
```

**[📖 See QUICKSTART.md](QUICKSTART.md)** for the complete 3-step guide.

### What Gets Configured Automatically:
- ✅ **Ports 80 & 443** - HTTP/HTTPS with Nginx reverse proxy
- ✅ **SSL Certificate** - Free Let's Encrypt with auto-renewal
- ✅ **Firewall** - UFW configured with secure defaults
- ✅ **Process Manager** - PM2 with auto-restart
- ✅ **Continuous Deployment** - Auto-deploy on every push
- ✅ **Database Migrations** - Automatic on deployment

**Total Time**: ~10 minutes | **Manual Steps**: Add secrets + Click button

## ✨ Key Highlights

- 🏗️ **Multi-tenant Architecture** with complete data isolation
- 🔐 **6-Level Role Hierarchy** with granular permissions
- 📊 **Complete Entity Management** (Dairy, BMC, Society, Farmer, Machine)
- 📱 **Mobile-First Responsive Design** with Material Design 3
- 🔒 **Enterprise-Grade Security** with JWT and multi-factor auth
- 📧 **Comprehensive Email System** with automated workflows
- 📄 **Professional PDF Generation** with company branding
- 🌍 **Multi-Language Support** (English, Hindi, Malayalam)

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.0.0 with App Router
- **UI Library**: React 19.2.0 with TypeScript 5
- **Styling**: Tailwind CSS 3.4 + Material Design 3
- **Animations**: Framer Motion 12.23.24
- **Icons**: Heroicons 2.2.0 + Lucide React 0.546.0

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Framework**: Express.js 5.1.0
- **Database**: Azure MySQL 8.0 with SSL
- **ORM**: Sequelize 6.37.7 with TypeScript
- **Authentication**: JWT (jsonwebtoken 9.0.2) with bcryptjs 3.0.2
- **Email**: Nodemailer 7.0.9 with Gmail SMTP
- **Security**: Helmet 8.1.0, CORS 2.8.5, Rate Limiting
- **Validation**: Express-Validator 7.2.1

### Development
- **Language**: TypeScript 5 with strict configuration
- **Linting**: ESLint 9 with Next.js rules
- **Package Manager**: npm with lockfile v3
- **Migration System**: Custom TypeScript migration runner (tsx 4.20.6)
- **PDF Generation**: jsPDF 3.0.3 + jsPDF-AutoTable 5.0.2
- **File Upload**: Multer 2.0.2
- **Logging**: Winston 3.18.3

## 📁 Project Structure

```
psr-v4/
├── 📂 src/                           # Application source code
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── (auth)/                   # Authentication routes
│   │   ├── admin/                    # Admin dashboard routes
│   │   ├── api/                      # REST API endpoints
│   │   └── superadmin/               # Super admin interface
│   ├── components/                   # Reusable React components
│   │   ├── auth/                     # Authentication components
│   │   ├── forms/                    # Form components with validation
│   │   ├── layout/                   # Layout and navigation
│   │   └── management/               # Entity management components
│   ├── contexts/                     # React contexts (User, Theme, Language)
│   ├── lib/                          # Utility libraries and services
│   ├── middleware/                   # Authentication and validation
│   ├── models/                       # Database models (Sequelize)
│   └── types/                        # TypeScript type definitions
├── 📂 docs/                          # Comprehensive documentation
├── 📂 database/                      # Database migrations & seeders
├── 📂 config/                        # Configuration files
├── 📂 scripts/                       # Migration and utility scripts
└── 📂 public/                        # Static assets and company logo
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm 9+
- Azure MySQL database (or local MySQL 8.0+)
- Gmail account for SMTP (or other email service)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/psr-v4.git
cd psr-v4
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

4. **Database setup**
```bash
# Initialize database with migrations and seeders
npm run db:init

# Or run individually
npm run db:migrate    # Run migrations
npm run db:seed       # Seed initial data
```

5. **Start development server**
```bash
npm run dev
```

6. **Open application**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Super Admin: `admin` / `psr@2025`

## 👥 User Roles & Permissions

### Role Hierarchy
```
super_admin (Level 6) → admin (Level 5) → dairy (Level 4) → bmc (Level 3) → society (Level 2) → farmer (Level 1)
```

| Role | Description | Key Permissions | Database Access |
|------|-------------|----------------|-----------------|
| **Super Admin** | System administrator | Approve admins, system settings | All data (read-only) |
| **Admin** | Organization owner | Manage own organization | Dedicated schema (full CRUD) |
| **Dairy** | Dairy facility manager | Manage BMCs and lower levels | Own dairy scope |
| **BMC** | Bulk Milk Cooling Center | Manage societies and farmers | Own BMC scope |
| **Society** | Farmer society coordinator | Manage member farmers | Own society scope |
| **Farmer** | Individual farmer | View own data and profile | Personal data only |

### Default Credentials
- **Super Admin**: `admin` / `psr@2025`

## 📜 Available Scripts

### Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking
```

### Database Management
```bash
npm run db:init      # Initialize DB (migrate + seed)
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database (⚠️ deletes all data)
npm run db:status    # Check migration status

# Advanced migration commands
npm run migration:up    # Run all pending migrations
npm run migration:down  # Rollback last migration
```

### Custom Scripts
```bash
# Database utility scripts
node scripts/migrate.mjs init           # Full database initialization
node scripts/create-bmc-table.mjs      # Add BMC tables to admin schemas
node scripts/update-dairy-schema.mjs   # Update dairy schema structure
```

## 🎯 Core Features

### 🔐 Authentication & Security
- **JWT-based authentication** with 7-day access + 30-day refresh tokens
- **Multi-factor authentication** with OTP email verification
- **Role-based access control** with 6-level hierarchy
- **Account security** with login attempt limiting and lockout
- **Password security** with bcrypt hashing (10 rounds)

### 🏢 Multi-Tenant Architecture
- **Complete data isolation** with dedicated MySQL schemas per admin
- **Dynamic schema creation** on admin approval
- **Scalable design** supporting thousands of organizations
- **Admin-specific dbKey** generation (e.g., "JOH1234")

### 📊 Entity Management
- **Dairy Management**: Full CRUD with capacity tracking and analytics
- **BMC Operations**: Bulk Milk Cooling Center management with society links
- **Society Coordination**: Farmer society management with president tracking
- **Farmer Profiles**: Individual farmer data with livestock and production metrics
- **Machine Inventory**: Equipment tracking with maintenance status

### 📧 Communication System
- **Professional email templates** with responsive HTML design
- **Automated workflows**: Welcome, approval, rejection notifications
- **OTP verification** with 10-minute expiry and typo detection
- **Gmail SMTP integration** with app-specific passwords

### 📱 User Experience
- **Mobile-first responsive design** with Material Design 3
- **Dark mode support** with system preference detection
- **Multi-language support**: English, Hindi, Malayalam
- **Professional PDF generation** with company branding
- **Real-time form validation** with error handling

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory, organized into logical categories:

> � **[Complete Documentation Index](docs/README.md)** - Start here for full navigation guide

### 📖 Getting Started
- **[Project Summary](docs/01-getting-started/PROJECT_SUMMARY.md)** - Complete project overview and status
- **[Quick Reference](docs/01-getting-started/QUICK_REFERENCE.md)** - Essential commands and shortcuts
- **[Documentation Index](docs/01-getting-started/INDEX.md)** - Original documentation overview

### 🏗️ Architecture & Design
- **[System Architecture](docs/02-architecture/ARCHITECTURE.md)** - Technical architecture and design patterns
- **[Project Structure](docs/02-architecture/PROJECT_STRUCTURE.md)** - File organization and components

### � API Reference
- **[Complete API Documentation](docs/03-api-reference/API_DOCUMENTATION.md)** - Full REST API reference with examples

### 🎯 Features & Implementation
- **[Features Overview](docs/04-features/FEATURES.md)** - Complete feature documentation
- **[Dairy Management](docs/04-features/DAIRY_MANAGEMENT_IMPLEMENTATION.md)** - Dairy operations system
- **[BMC Management](docs/04-features/BMC_MANAGEMENT_IMPLEMENTATION.md)** - BMC operations system
- **[Email System](docs/04-features/EMAIL_VALIDATION_AND_STATUS_SYSTEM.md)** - Email validation and workflows

### 🎨 UI Design System
- **[UI Styling Guide](docs/05-ui-design/UI_STYLING_GUIDE.md)** - Complete design system
- **[Mobile Responsive Design](docs/05-ui-design/MOBILE_RESPONSIVE_DESIGN_GUIDE.md)** - Responsive patterns
- **[Dark Mode Implementation](docs/05-ui-design/DARK_MODE_IMPLEMENTATION.md)** - Theme system

### �‍💻 Development Workflows
- **[Development Protocol](docs/06-development/NEW_SCREEN_DEVELOPMENT_PROTOCOL.md)** - Development standards
- **[Daily Workflow](docs/06-development/DAILY_WORKFLOW.md)** - Best practices and workflows
- **[Update History](docs/06-development/UPDATE_LOG.md)** - Development changelog

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.local` with the following configuration:

```env
# Database Configuration (Azure MySQL)
DB_HOST=your-azure-mysql-endpoint
DB_PORT=3306
DB_NAME=psr_v4_c
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_SSL_CA=DigiCertGlobalRootCA.crt.pem

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-key

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-specific-password
FROM_EMAIL=noreply@yourcompany.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Super Admin Configuration
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=psr@2025
```

### SSL Certificate
- Download `DigiCertGlobalRootCA.crt.pem` for Azure MySQL SSL connection
- Place in project root directory

## 🚀 Deployment

### Azure Deployment (Recommended)
```bash
# Build for production
npm run build

# Deploy to Azure App Service
# (Configure through Azure portal or GitHub Actions)
```

### Alternative Platforms
- **Vercel**: One-click deployment with GitHub integration
- **Railway**: Database and app deployment
- **DigitalOcean**: Droplet with Docker deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database migrations completed
- [ ] Email service configured and tested
- [ ] Super admin account secured
- [ ] Application security headers enabled

## 🧪 Testing

### Manual Testing
```bash
# Test email verification flow
node tests/test-verification-redirect.mjs

# Test database models
node tests/test-models.js

# Test API endpoints
# Use Postman collection or cURL commands in API documentation
```

### Testing Checklist
- [ ] User registration and OTP verification
- [ ] Admin approval workflow
- [ ] Role-based access control
- [ ] Entity CRUD operations
- [ ] PDF generation functionality
- [ ] Email notifications
- [ ] Mobile responsiveness

## 🤝 Contributing

### Development Workflow
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Follow coding standards**: ESLint + Prettier configuration
4. **Test thoroughly**: Manual and automated testing
5. **Update documentation**: Keep docs in sync with changes
6. **Submit pull request**: Detailed description and screenshots

### Code Standards
- **TypeScript**: Strict mode with comprehensive typing
- **ESLint**: Next.js recommended rules
- **Commit Messages**: Conventional commits format
- **File Organization**: Follow existing structure patterns

## 📊 Project Status

### Current Version: 0.1.0 (Production Ready)

| Feature Category | Status | Completion |
|-----------------|--------|------------|
| Authentication System | ✅ Complete | 100% |
| Multi-Tenant Architecture | ✅ Complete | 100% |
| Dairy Management | ✅ Complete | 100% |
| BMC Management | ✅ Complete | 100% |
| Society Management | ✅ Complete | 100% |
| Farmer Management | ✅ Complete | 95% |
| Machine Management | ✅ Complete | 100% |
| PDF Generation | ✅ Complete | 100% |
| Email System | ✅ Complete | 100% |
| Mobile Responsive | ✅ Complete | 100% |
| API Documentation | ✅ Complete | 100% |

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Bulk operations support
- [ ] Mobile application (React Native)
- [ ] Advanced reporting system

## 📞 Support

### Getting Help
- **Documentation**: Check [`docs/`](docs/) directory first
- **Issues**: [GitHub Issues](https://github.com/your-repo/psr-v4/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/psr-v4/discussions)

### Contact
- **Development Team**: PSR-v4 Development Team
- **Email**: Contact through GitHub issues
- **Response Time**: 24-48 hours for issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for deployment platform
- **Azure** for cloud infrastructure
- **Material Design** for design system
- **Open Source Community** for libraries and tools

---

**Made with ❤️ by the PSR-v4 Development Team**  
**Last Updated**: December 28, 2024  
**Version**: 0.1.0
