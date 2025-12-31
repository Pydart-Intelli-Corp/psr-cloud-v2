# Password Access Permission Update

## Overview
Removed OTP verification for password viewing/editing and integrated it with the existing master access permission system. Users now need the same admin-approved 15-minute access window to both change master machines AND view/edit passwords.

## Changes Made

### 1. Flutter Frontend (Mobile App)

#### `lib/screens/dashboard/dashboard_screen.dart`
**Lines 388-436** - Replaced OTP verification with master access check:
- **Before**: Required OTP verification before viewing passwords
- **After**: Checks for active master access permission
- If no active access, prompts user to request access from admin
- Reuses existing `_handleMasterAccessRequest()` flow

**Lines 30-33** - Added deprecation comment for OTP methods:
- Marked OTP cache methods as deprecated
- Kept for backward compatibility
- No longer actively used in password flow

**Lines 705, 731** - Updated status dialog messages:
- "Check your email and click 'Start Access' to begin the 15-minute timer **for master changes and password access**"
- "You can now change the master machine **and access passwords**"

#### `lib/widgets/dialogs/request_access_dialog.dart`
**Line 80** - Updated description:
- Changed: "change the master machine"
- To: "change the master machine **and access passwords**"

### 2. Backend API (Next.js)

#### `src/app/api/external/auth/machines/[id]/password/route.ts`

**PUT Method (Lines 86-113)** - Added access verification for password editing:
```typescript
// For society users, verify active master access permission for password editing
const [accessCheck] = await sequelize.query(`
  SELECT mar.id, mar.status, mar.expires_at 
  FROM \`${schemaName}\`.machine_access_requests mar
  INNER JOIN \`${schemaName}\`.machines m ON mar.machine_id = m.id
  WHERE m.society_id = ? AND mar.user_id = ? AND mar.status = 'active' 
  AND mar.expires_at > NOW()
`, { replacements: [machineCheck[0].society_id, payload.id] });

if (!accessCheck || accessCheck.length === 0) {
  return createErrorResponse('Access denied. You need active master access permission to edit passwords. Please request access from admin.', 403);
}
```

**GET Method (Lines 210-237)** - Added access verification for password viewing:
```typescript
// For society users, verify active master access permission for password viewing
const [accessCheck] = await sequelize.query(`
  SELECT mar.id, mar.status, mar.expires_at 
  FROM \`${schemaName}\`.machine_access_requests mar
  INNER JOIN \`${schemaName}\`.machines m ON mar.machine_id = m.id
  WHERE m.society_id = ? AND mar.user_id = ? AND mar.status = 'active' 
  AND mar.expires_at > NOW()
`, { replacements: [machineCheck[0].society_id, payload.id] });

if (!accessCheck || accessCheck.length === 0) {
  return createErrorResponse('Access denied. You need active master access permission to view passwords. Please request access from admin.', 403);
}
```

**Key Features**:
- Uses society-wide access (same as master machine changes)
- Verifies timer is still active (`expires_at > NOW()`)
- Returns 403 error if no active access
- Admin users bypass this check (only applies to societies)

### 3. Email Templates

#### `src/app/api/user/machine/[id]/request-master-access/route.ts`
**Lines 193-195, 217, 247** - Updated to mention both permissions:
- Email header: "🔐 Master **& Password** Access Request"
- Description: "change the master machine setting **and view/edit passwords**"
- Warning: "15 minutes to change the master machine setting **and view/edit passwords**"
- Subject: "🔐 Master **& Password** Access Request"

#### `src/app/api/user/machine/[id]/access-response/route.ts`
**Lines 269, 283, 289, 361** - Updated approval email:
- Description: "change the master machine **and access passwords**"
- Timer info: "15 minutes to change the master machine **and view/edit passwords**"
- Warning: "change the master machine **and/or access passwords**"
- Subject: "✅ Master **& Password** Access Approved"

#### `src/app/api/user/machine/[id]/start-access/route.ts`
**Lines 330, 369, 382** - Updated start confirmation:
- Header: "Master **& Password** Access Activated"
- Description: "change the master machine setting **and access passwords**"
- Warning: "change the master machine setting **and view/edit passwords**"
- Subject: "🚀 Master **& Password** Access Activated"

## Flow Diagram

### Before (Separate OTP)
```
┌─────────────────────────────────────────────┐
│ User clicks Password Settings              │
├─────────────────────────────────────────────┤
│ OTP Verification Dialog                     │
│  → Send OTP to email                        │
│  → Enter OTP code                           │
│  → Verify OTP                               │
├─────────────────────────────────────────────┤
│ Show Password Settings Dialog               │
│  → View passwords                           │
│  → Edit passwords                           │
└─────────────────────────────────────────────┘
```

### After (Unified Permission)
```
┌──────────────────────────────────────────────────────────┐
│ User clicks Password Settings OR Master Badge           │
├──────────────────────────────────────────────────────────┤
│ Check Master Access Status                               │
│  ✓ Active & Not Expired → Show Dialog                   │
│  ✗ Expired/None → Request Access                         │
├──────────────────────────────────────────────────────────┤
│ Request Access Flow                                      │
│  1. Send email to admin                                  │
│  2. Admin clicks Accept                                  │
│  3. Society receives email with Start button             │
│  4. Society clicks Start → 15-minute timer begins        │
├──────────────────────────────────────────────────────────┤
│ During 15-minute window:                                 │
│  • Can change ANY machine in society                     │
│  • Can view/edit passwords for ANY machine               │
│  • Timer countdown shown in dialog                       │
└──────────────────────────────────────────────────────────┘
```

## Benefits

### 1. **Unified Security Model**
- Single approval process for both critical operations
- Consistent 15-minute time-limited access
- Reduces admin overhead (one approval instead of two)

### 2. **Better User Experience**
- No separate OTP for passwords
- Single request for all sensitive operations
- Timer shows remaining time for both features

### 3. **Enhanced Security**
- Admin awareness of password access attempts
- Traceable audit trail in database
- Time-limited access window
- Email notifications for all parties

### 4. **Simplified Code**
- Removed duplicate verification logic
- Reused existing access check infrastructure
- Consistent error messages and flows

## Database Schema
Uses existing `machine_access_requests` table:
```sql
CREATE TABLE machine_access_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  user_id INT NOT NULL,
  access_token VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'active'),
  expires_at DATETIME,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  UNIQUE KEY unique_machine_user (machine_id, user_id)
);
```

## API Behavior

### Society Users
- **GET/PUT** `/api/external/auth/machines/[id]/password`
  - Requires: Active master access permission
  - Error: 403 "Access denied. You need active master access permission"
  - Timer: Must have `status='active' AND expires_at > NOW()`
  - Scope: Society-wide (any machine in society)

### Admin Users
- **Bypass**: No access check required
- **Full Control**: Can view/edit passwords anytime
- **No Timer**: Not subject to 15-minute limit

## Testing Checklist

- [ ] Society requests access from password settings
- [ ] Admin receives email with both permissions mentioned
- [ ] Admin approves request
- [ ] Society receives "Start Access" email
- [ ] Society clicks Start button
- [ ] Timer starts (15 minutes)
- [ ] Society can view passwords during timer
- [ ] Society can edit passwords during timer
- [ ] Society can change master during timer
- [ ] Access expires after 15 minutes
- [ ] Attempting password access after expiry shows error
- [ ] Request again flow works for passwords
- [ ] Email mentions both master and password access

## Migration Notes

### No Database Changes Required
- Reuses existing `machine_access_requests` table
- No new tables or columns needed
- Existing access requests work for both features

### Backward Compatibility
- Admin password access unchanged
- Existing OTP methods kept but deprecated
- No breaking changes to other features

### Deployment
1. Deploy backend changes first
2. Deploy Flutter app update
3. Restart Next.js server (clear `.next` cache if needed)
4. No database migration required

## Error Messages

### Password Access Denied (403)
```
Access denied. You need active master access permission to view passwords. Please request access from admin.
```

### Password Edit Denied (403)
```
Access denied. You need active master access permission to edit passwords. Please request access from admin.
```

### Flutter Prompt
```
Access Required

To view/edit passwords, you need active master access permission. 
Would you like to request access from admin?

[Request Access] [Cancel]
```

## Conclusion

This update successfully unifies the security model for both master machine changes and password access. Users now have a single, streamlined approval process with clear time-limited access that covers all sensitive operations. The implementation reuses existing infrastructure, requires no database changes, and provides better user experience with enhanced security.
