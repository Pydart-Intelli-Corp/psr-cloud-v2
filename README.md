# PSR Cloud V2 - Dairy Equipment Management Platform

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/your-repo/psr-cloud-v2)
[![Status](https://img.shields.io/badge/status-production-green.svg)](https://github.com/your-repo/psr-cloud-v2)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Multi-tenant dairy equipment management platform with complete data isolation, role-based access control, and comprehensive entity management.

**🟢 Production Ready** | **Version 2.1.0** | **Last Updated: January 2026**

---

## 🚀 Quick Start

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

**Access**: http://localhost:3000  
**Super Admin**: `admin` / `psr@2025`

---

## ✨ Key Features

- 🏗️ **Multi-Tenant Architecture** - Dedicated schemas per organization
- 🔐 **6-Level Role Hierarchy** - Super Admin → Admin → Dairy → BMC → Society → Farmer
- 👨‍🌾 **Unique Farmer IDs** - Auto-generated `LLNN-DDDD` format
- 📊 **Complete Entity Management** - Dairy, BMC, Society, Farmer, Machine
- 📱 **Mobile App Integration** - Flutter app with OTP authentication
- 📧 **Automated Emails** - Professional templates with workflows
- 📄 **PDF Reports** - Collection, sales, dispatch reports
- 🌍 **Multi-Language** - English, Hindi, Malayalam

---

## 🛠️ Tech Stack

**Frontend**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS  
**Backend**: Node.js + Express + Sequelize ORM  
**Database**: Azure MySQL 8.0 with SSL  
**Mobile**: Flutter 3.10.4+  
**Auth**: JWT + bcryptjs  

---

## 📚 Documentation

**📖 [DOCUMENTATION.md](DOCUMENTATION.md)** - Complete system guide (start here)

### Specialized Docs (docs/)

- [FARMERUID_QUICK_REFERENCE.md](docs/FARMERUID_QUICK_REFERENCE.md) - FarmerUID system
- [SCRIPTS_REFERENCE_GUIDE.md](docs/SCRIPTS_REFERENCE_GUIDE.md) - Database scripts
- [DATABASE_MANAGEMENT.md](docs/DATABASE_MANAGEMENT.md) - Database operations
- [EXTERNAL_AUTH_API.md](docs/EXTERNAL_AUTH_API.md) - Mobile app API
- [MACHINE_MANAGEMENT_DEEP_DIVE.md](docs/MACHINE_MANAGEMENT_DEEP_DIVE.md) - Machine system
- [manual-deploy-commands.md](docs/manual-deploy-commands.md) - Deployment commands

---

## 📜 Available Commands

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

## 👥 User Roles

```
Level 6: super_admin  → System administrator
Level 5: admin        → Organization owner (dedicated schema)
Level 4: dairy        → Dairy facility manager
Level 3: bmc          → Bulk Milk Cooling Center
Level 2: society      → Farmer society coordinator
Level 1: farmer       → Individual farmer
```

---

## 🗄️ Database Architecture

**Main Database** (`psr_v4_main`)
- All user accounts
- Schema metadata
- System configuration

**Admin Schemas** (Dynamic per organization)
- Format: `{adminname}_{dbkey}`
- 17+ tables per schema
- Complete data isolation

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/verify-otp        # Email OTP verification
```

### Farmer Management
```http
GET    /api/user/farmer          # List farmers
POST   /api/user/farmer          # Create farmer (auto-generates farmeruid)
PUT    /api/user/farmer          # Update farmer
DELETE /api/user/farmer          # Delete farmer
```

### Reports
```http
GET  /api/user/reports/collections  # Collection reports
GET  /api/user/reports/sales        # Sales reports
POST /api/user/reports/send-email   # Email report with PDF/CSV
```

**[Full API Documentation](DOCUMENTATION.md#api-reference)** | **[Troubleshooting Guide](DOCUMENTATION.md#troubleshooting)**

---

## 📞 Support

- **Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/psr-cloud-v2/issues)
- **Email**: Contact through GitHub

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Next.js Team
- Azure Cloud
- Material Design
- Open Source Community

---

**Made with ❤️ by PSR-v4 Development Team**  
**Version 2.1.0** | **Status: 🟢 Production Ready**
