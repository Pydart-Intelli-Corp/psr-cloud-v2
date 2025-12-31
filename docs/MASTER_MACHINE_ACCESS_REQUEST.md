# Master Machine Access Request System

## Overview
Replaced OTP-based master machine changes with an email approval workflow. When a society user wants to change the master machine, an access request is sent to the admin for approval via email.

## Features

### 1. Request Access Dialog
- **Location**: `lib/widgets/dialogs/request_access_dialog.dart`
- **Purpose**: Shows admin details and allows society users to request access
- **Display**: Admin name, email, society, machine, and 15-minute access duration info
- **Actions**: Request Access / Cancel buttons

### 2. Service Method
- **Location**: `lib/services/api/machine_service.dart`
- **Method**: `requestMasterAccess(machineId, societyName, machineName, token)`
- **Endpoint**: POST `/api/user/machine/:id/request-master-access`
- **Response**: Success/failure message

### 3. Dashboard Integration
- **Location**: `lib/screens/dashboard/dashboard_screen.dart`
- **Method**: `_handleChangeMaster()`
- **Flow**:
  1. Get admin name and email from AuthProvider
  2. Show RequestAccessDialog with admin details
  3. On "Request Access" click, call `machineService.requestMasterAccess()`
  4. Show success message confirming email sent to admin

## Backend Implementation

### 1. Request Access API
- **Endpoint**: `/api/user/machine/[id]/request-master-access/route.ts`
- **Method**: POST
- **Authentication**: JWT token (society role)
- **Process**:
  1. Verify token and extract user details
  2. Get admin email from main database
  3. Get machine and society details from admin schema
  4. Generate 15-minute access token
  5. Store request in `machine_access_requests` table
  6. Send email to admin with Accept/Reject buttons
- **Email Content**:
  - Society name and ID
  - Machine ID and type
  - Requesting user username
  - Accept/Reject buttons with embedded tokens
  - 15-minute access duration notice

### 2. Access Response API
- **Endpoint**: `/api/user/machine/[id]/access-response/route.ts`
- **Method**: GET (called from email links)
- **Parameters**: `token` (access token), `action` (accept/reject)
- **Process**:
  1. Verify access token (15-minute expiry)
  2. Check request exists and is pending
  3. Update request status to 'approved' or 'rejected'
  4. Return HTML success/error page
- **Response Pages**:
  - Token expired: Shows expiry message
  - Invalid token: Shows error message
  - Already processed: Shows current status
  - Success: Shows green (accepted) or red (rejected) confirmation

### 3. Set Master API Update
- **Endpoint**: `/api/user/machine/[id]/set-master/route.ts`
- **Enhancement**: Added access verification for society role
- **Verification**:
  - Checks `machine_access_requests` table for approved request
  - Verifies request hasn't expired (15-minute window)
  - Rejects if no valid approval found
- **Error**: "Access not approved or expired. Please request access from admin."

## Database Schema

### machine_access_requests Table
```sql
CREATE TABLE machine_access_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  user_id INT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_machine_user (machine_id, user_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at),
  
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
)
```

**Migration Script**: `scripts/add-access-requests-table.js`

## User Flow

### Society User Perspective
1. Click on master machine badge in dashboard
2. See dialog with admin name and email
3. Click "Request Access" button
4. Receive confirmation that email was sent to admin
5. Wait for admin approval (receives notification when approved/rejected)
6. Once approved, has 15 minutes to change master machine

### Admin Perspective
1. Receive email with subject "🔐 Master Machine Access Request"
2. See request details:
   - Society name and ID
   - Machine ID and type
   - Requesting user
3. Review the request
4. Click "✓ Accept Request" or "✗ Reject Request"
5. See confirmation page
6. User receives access for 15 minutes (if accepted)

## Security Features

1. **Time-Limited Access**: Tokens expire after 15 minutes
2. **JWT Verification**: All tokens are JWT signed and verified
3. **Status Tracking**: Requests can only be processed once (pending → approved/rejected)
4. **Email Verification**: Access links sent only to verified admin email
5. **Schema Isolation**: Each admin's data isolated in their own schema
6. **Audit Trail**: All requests logged in database with timestamps

## Email Template Features

- **Responsive Design**: Mobile-friendly HTML email
- **Material Design 3**: Consistent with app design
- **Color-Coded Actions**: Green for accept, red for reject
- **Clear Information**: Displays all relevant details
- **Warning Notice**: 15-minute access duration highlighted
- **Professional Branding**: Poornasree Equipments Cloud branding

## Environment Variables Required

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or production URL
JWT_SECRET=your-secret-key
```

## Testing

### 1. Test Request Flow
```bash
# In Flutter app
1. Login as society user
2. Navigate to dashboard
3. Click on any master badge
4. Verify RequestAccessDialog shows admin details
5. Click "Request Access"
6. Verify success message appears
```

### 2. Test Email Delivery
```bash
# Check admin email inbox
- Subject should be "🔐 Master Machine Access Request"
- Email should contain society and machine details
- Accept and Reject buttons should be visible
```

### 3. Test Approval Flow
```bash
# Click Accept in email
- Should redirect to success page with green checkmark
- Should show 15-minute access notice
- Database should update status to 'approved'

# Click Reject in email
- Should redirect to error page with red X
- Should show rejection message
- Database should update status to 'rejected'
```

### 4. Test Access Verification
```bash
# After approval, in Flutter app
1. Try to change master machine
2. Should succeed if within 15 minutes
3. Should fail with "Access not approved or expired" after 15 minutes
```

## Migration Steps

### For Existing Installations
1. Run database migration:
   ```bash
   node scripts/add-access-requests-table.js
   ```

2. Update Flutter app dependencies (if needed):
   ```bash
   flutter pub get
   ```

3. Configure SMTP settings in `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. Deploy backend API changes:
   ```bash
   npm run build
   pm2 restart ecosystem.config.js
   ```

5. Update Flutter app:
   ```bash
   flutter build apk --release
   ```

## Files Changed

### Flutter (Mobile App)
- ✅ `lib/widgets/dialogs/request_access_dialog.dart` (NEW)
- ✅ `lib/services/api/machine_service.dart` (Added requestMasterAccess method)
- ✅ `lib/screens/dashboard/dashboard_screen.dart` (Updated _handleChangeMaster)
- ✅ `lib/widgets/dialogs/dialogs.dart` (Export new dialog)

### Backend (Web API)
- ✅ `src/app/api/user/machine/[id]/request-master-access/route.ts` (NEW)
- ✅ `src/app/api/user/machine/[id]/access-response/route.ts` (NEW)
- ✅ `src/app/api/user/machine/[id]/set-master/route.ts` (Added access verification)

### Database
- ✅ `database/migrations/add_machine_access_requests_table.sql` (NEW)
- ✅ `scripts/add-access-requests-table.js` (NEW - Migration script)

## Future Enhancements

1. **Push Notifications**: Send push notification to admin when request arrives
2. **In-App Approval**: Allow admin to approve from web dashboard
3. **Request History**: Show history of all access requests in admin panel
4. **Custom Duration**: Allow admin to set custom access duration
5. **Auto-Cleanup**: Cron job to clean up expired requests
6. **Rate Limiting**: Limit number of requests per user per day
7. **Delegation**: Allow admin to delegate approval to other admins

## Troubleshooting

### Email Not Received
- Check SMTP credentials in `.env`
- Verify Gmail app password is correct
- Check spam folder
- Test SMTP connection separately

### Token Expired Error
- Verify server time is correct
- Check JWT_SECRET is same across all servers
- Ensure 15-minute window is sufficient for admin response

### Access Denied After Approval
- Check `expires_at` in database is in future
- Verify request status is 'approved'
- Ensure user_id and machine_id match

### Database Migration Failed
- Check database credentials
- Verify admin schema exists
- Run migration script manually with error logging
