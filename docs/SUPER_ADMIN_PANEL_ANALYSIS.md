# Super Admin Panel - Complete Analysis

## Overview
The Super Admin Panel is the highest-level administrative interface for Poornasree Equipments Cloud, providing complete control over the entire system including user management, database operations, approvals, and live monitoring.

## Authentication & Access

### Credentials
- **Username**: Defined in `SUPER_ADMIN_USERNAME` environment variable (default: `admin`)
- **Password**: Defined in `SUPER_ADMIN_PASSWORD` environment variable (default: `psr@2025`)
- **Role**: `super_admin`
- **Email**: `admin@poornasree.com`

### Login Flow
1. **Login Page**: `/superadmin` ([page.tsx](../src/app/superadmin/page.tsx))
2. **API Endpoint**: `/api/superadmin/auth/login` ([route.ts](../src/app/api/superadmin/auth/login/route.ts))
3. **Token Generation**: JWT with payload:
   ```typescript
   {
     id: 1,
     uid: 'super-admin',
     email: 'admin@poornasree.com',
     role: 'super_admin',
     dbKey: 'master',
     type: 'admin'
   }
   ```
4. **Storage**: 
   - `localStorage`: `adminToken`, `adminRefreshToken`, `userRole`, `adminUser`
   - HTTP-only cookies: `authToken`, `authRefreshToken` (for middleware)

5. **Redirect**: After successful login → `/superadmin/dashboard`

### Authorization Middleware
- Location: `src/middleware/auth.ts`
- Function: `requireSuperAdmin(user: JWTPayload)`
- Checks: 
  - `user.role === UserRole.SUPER_ADMIN`
  - OR `user.email === SUPER_ADMIN_USERNAME`

## Dashboard Features

### 1. Overview Tab (Default)
**File**: `src/app/superadmin/dashboard/page.tsx`

#### Statistics Cards
- **Total Users**: Shows aggregate count with +12.5% growth indicator
- **Farmers**: Total farmers with +8.2% growth
- **Societies**: Society count with +15.3% growth
- **BMC Units**: BMC count with +5.7% growth

#### User Hierarchy Breakdown
```
Super Admin (1)
├── Admin (5)
│   ├── Dairy (15)
│   │   ├── BMC (45)
│   │   │   ├── Society (150)
│   │   │   │   └── Farmer (1031)
```

#### System Status
- Database Status: Online/Offline indicator
- Active Connections: Real-time connection count
- Last Backup: Date of most recent backup

#### Quick Actions
- Create New Admin
- View All Users
- Database Backup

### 2. Live Monitor Tab
**File**: `src/app/superadmin/monitoring/page.tsx`

#### Real-time API Monitoring
- **Server-Sent Events (SSE)**: Live stream of API requests
- **Endpoint**: `/api/superadmin/monitoring/stream`

#### Features:
1. **Request Tracking**:
   - Method (GET, POST, PUT, DELETE)
   - Path & Endpoint
   - Status Code
   - Response Time
   - User Agent & IP
   - Error messages (if any)

2. **Categories**:
   - External API
   - Admin Operations
   - Farmer Requests
   - Machine Operations
   - Authentication
   - Other

3. **Statistics**:
   - Total requests
   - Requests by category
   - Requests by status code
   - Requests by endpoint
   - Requests by society
   - Requests by dbKey
   - Average response time
   - Error rate
   - Active listeners

4. **Filters**:
   - By category
   - By dbKey
   - By societyId
   - Time range: 1m, 5m, 15m, 1h, all

5. **Actions**:
   - Auto-refresh toggle
   - Manual refresh
   - Clear all requests
   - View individual request details

#### API Endpoints:
- `GET /api/superadmin/monitoring/requests` - Fetch historical requests
- `GET /api/superadmin/monitoring/stats` - Get aggregated statistics
- `GET /api/superadmin/monitoring/stream` - SSE stream for real-time updates

### 3. Approvals Tab
**File**: `src/app/superadmin/dashboard/page.tsx` (activeTab === 'approvals')
**API**: `src/app/api/superadmin/approvals/route.ts`

#### Purpose
Manage pending admin registrations that require super admin approval.

#### Workflow:
1. **Admin Registration**: Admin signs up at `/register`
2. **Email Verification**: Admin verifies email
3. **Status Change**: `PENDING_VERIFICATION` → `PENDING_APPROVAL`
4. **Super Admin Review**: View in Approvals tab
5. **Decision**:
   - **Approve**:
     - Generate unique `dbKey` (e.g., "ALI2657")
     - Create dedicated MySQL schema: `{firstName}_{dbKey}`
     - Send welcome email with dbKey
     - Status: `ACTIVE`
   - **Reject**:
     - Send rejection email (optional reason)
     - Status: `INACTIVE`

#### Displayed Information:
- Full Name
- Email
- UID
- Company Name
- Company Address (City, State, Pincode)
- Registration Date

#### API Endpoints:
- `GET /api/superadmin/approvals` - Get pending approvals
- `POST /api/superadmin/approvals` - Approve/reject admin
  ```json
  {
    "adminId": 1,
    "action": "approve" | "reject",
    "reason": "Optional rejection reason"
  }
  ```

#### Schema Creation Process:
1. Generate unique dbKey: `generateUniqueDbKey(fullName)`
2. Create schema: `createAdminSchema(adminUser, dbKey)`
3. Tables created:
   - `dairy_farms`
   - `bmcs`
   - `societies`
   - `farmers`
   - `machines`
   - `milk_collections`
   - `rate_charts`
   - `payments`
   - `notifications`

### 4. Machines Tab
**Component**: `MachineManager` ([src/components](../src/components))
**API**: `/api/superadmin/machines`

#### Features:
1. **View All Machines**: Across all admins
2. **Upload Machine Data**: CSV/Excel upload
3. **Download Machine Data**: Export to CSV
4. **Search & Filter**: By admin, society, machine ID
5. **Machine Details**: View specifications, status, location

### 5. User Management Tab
**Status**: Coming Soon

**Planned Features**:
- View all users (all roles)
- Create/Edit/Delete users
- Reset passwords
- Change user status
- Assign roles
- View user activity logs

### 6. Database Tab
**Status**: Coming Soon
**API**: `/api/superadmin/database`

**Planned Features**:
- Database backup/restore
- Schema management
- Query executor
- Database statistics
- Connection pool monitoring

### 7. Settings Tab
**Status**: Coming Soon

**Planned Features**:
- System configuration
- Email settings
- Backup schedules
- Security settings
- API rate limits

## UI/UX Design

### Theme
- **Primary Color**: Green gradient (from-green-800 to-emerald-900)
- **Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Layout
1. **Sidebar** (Left):
   - Logo & Title
   - Navigation items
   - User info (bottom)
   - Logout button

2. **Top Bar**:
   - Page title
   - Live Monitor button
   - User profile

3. **Main Content**:
   - Tab-based content
   - Responsive grid layout
   - Card-based design

### Responsive Design
- Mobile: Collapsible sidebar with overlay
- Tablet: Side-by-side layout
- Desktop: Full sidebar visible

## Security Features

### 1. Authentication
- JWT-based authentication
- Separate token storage for super admin
- HTTP-only cookies for middleware
- Refresh token rotation

### 2. Authorization
- Role-based access control (RBAC)
- Super admin-only routes
- API endpoint protection
- Middleware validation

### 3. Session Management
- Token expiration: 7 days (access), 30 days (refresh)
- Automatic token refresh
- Logout on token expiry

### 4. Data Protection
- Sensitive data not exposed in logs
- Database credentials in environment variables
- Password hashing (bcrypt)

## Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MySQL (Azure)
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)

### Real-time
- **Protocol**: Server-Sent Events (SSE)
- **Monitoring**: Custom middleware integration

## Environment Variables

```env
# Super Admin Credentials
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=psr@2025

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Database (Azure MySQL)
DB_HOST=your-mysql-server.mysql.database.azure.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=psr_v4_main
DB_PORT=3306

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## File Structure

```
src/app/
├── superadmin/
│   ├── page.tsx                    # Login page
│   ├── layout.tsx                  # Super admin layout
│   ├── middleware.ts               # Super admin middleware
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard
│   └── monitoring/
│       └── page.tsx               # Live monitor
├── api/
│   └── superadmin/
│       ├── auth/
│       │   └── login/
│       │       └── route.ts       # Login API
│       ├── approvals/
│       │   └── route.ts          # Admin approvals API
│       ├── machines/
│       │   ├── route.ts          # Machines CRUD
│       │   ├── upload/
│       │   │   └── route.ts      # Upload machines
│       │   └── download/
│       │       └── route.ts      # Download machines
│       ├── monitoring/
│       │   ├── stream/
│       │   │   └── route.ts      # SSE stream
│       │   ├── requests/
│       │   │   └── route.ts      # Request history
│       │   └── stats/
│       │       └── route.ts      # Statistics
│       └── database/
│           └── route.ts          # Database operations
```

## Known Issues & Fixes

### 1. Login Redirect Issue
**Issue**: Super admin redirecting to admin screen instead of super admin dashboard
**Fixed**: SUPERADMIN_LOGIN_FIX.md
- Unified token storage
- Middleware authentication updated
- Public routes configured

### 2. Token Storage Mismatch
**Issue**: Different keys used for admin vs user tokens
**Fixed**: Standardized to `authToken` and `authRefreshToken`

## Future Enhancements

### Planned Features:
1. **Advanced Analytics**:
   - Revenue trends
   - User growth charts
   - System performance metrics

2. **Audit Logs**:
   - Track all super admin actions
   - User activity monitoring
   - System changes history

3. **Bulk Operations**:
   - Bulk user creation
   - Bulk machine upload
   - Batch approvals

4. **Advanced Monitoring**:
   - Performance metrics
   - Error tracking
   - Alert system

5. **System Health**:
   - CPU/Memory usage
   - Database performance
   - API latency tracking

## Testing Credentials

**Super Admin Login**:
- URL: `http://localhost:3000/superadmin`
- Username: `admin`
- Password: `psr@2025`

**Test Admin** (for approval testing):
- Create via: `http://localhost:3000/register`
- Role: Admin
- Status: Will appear in Approvals after email verification

## API Documentation

### Authentication
```typescript
POST /api/superadmin/auth/login
Body: { username, password }
Response: { success, message, data: { token, refreshToken, user } }
```

### Approvals
```typescript
GET /api/superadmin/approvals
Response: { success, data: PendingAdmin[] }

POST /api/superadmin/approvals
Body: { adminId, action: 'approve' | 'reject', reason? }
Response: { success, message, data }
```

### Monitoring
```typescript
GET /api/superadmin/monitoring/requests?category&dbKey&societyId&limit&since
Response: { success, data: APIRequest[] }

GET /api/superadmin/monitoring/stats?category
Response: { success, data: Stats }

GET /api/superadmin/monitoring/stream
Response: EventStream (SSE)
```

### Machines
```typescript
GET /api/superadmin/machines
Response: { success, data: Machine[] }

POST /api/superadmin/machines/upload
Body: FormData with CSV file
Response: { success, message, data: { imported, failed } }

GET /api/superadmin/machines/download
Response: CSV file download
```

## Maintenance

### Regular Tasks:
1. **Weekly**: Review pending approvals
2. **Weekly**: Check system logs
3. **Monthly**: Database backup
4. **Monthly**: Review user access
5. **Quarterly**: Security audit

### Troubleshooting:
1. **Login Issues**: Check environment variables, JWT secrets
2. **Approval Failures**: Check email service, database connection
3. **Monitoring Not Working**: Verify SSE connection, check middleware
4. **Database Errors**: Check Azure MySQL connection, schema permissions

---

## Summary

The Super Admin Panel is a comprehensive, secure, and scalable administrative interface that provides:
- Complete system oversight
- Real-time monitoring
- User management capabilities
- Admin approval workflow
- Database operations
- Machine management

It follows modern web development practices with TypeScript, Next.js 15, and a secure JWT-based authentication system.
