# 📅 Daily Development Workflow - PSR-v4

> **Essential checklist for developers after making changes**

This document outlines the daily routine every developer should follow after making code changes to maintain a clean, organized, and well-documented codebase for Poornasree Equipments Cloud.

---

## ✅ Daily Checklist (After Making Changes)

### 1. 🗂️ **Organize New Files**

**Before committing, ensure all new files are properly placed:**

#### Check File Locations
```powershell
# List all new/untracked files
git status
```

#### Proper File Organization

| File Type | Correct Location | Example |
|-----------|------------------|---------|
| **Pages** | `/src/app/(route-group)/` | `src/app/(auth)/login/page.tsx` |
| **API Routes** | `/src/app/api/` | `src/app/api/auth/login/route.ts` |
| **React Components** | `/src/components/` | `FlowerSpinner.tsx`, `DairyCard.tsx` |
| **Atomic Components** | `/src/components/atoms/` | `Button.tsx`, `Input.tsx`, `Badge.tsx` |
| **Form Components** | `/src/components/forms/` | `InputField.tsx`, `SelectField.tsx` |
| **Layout Components** | `/src/components/layout/` | `Sidebar.tsx`, `DashboardLayout.tsx` |
| **Management Components** | `/src/components/management/` | `DairyForm.tsx`, `EntityList.tsx` |
| **Database Models** | `/src/models/` | `User.ts`, `AdminSchema.ts` |
| **Utilities** | `/src/lib/` | `auth.ts`, `database.ts`, `emailService.ts` |
| **Middleware** | `/src/middleware/` | `auth.ts` |
| **Types** | `/src/types/` | `user.ts`, `api.ts`, `auth.ts` |
| **Contexts** | `/src/contexts/` | `UserContext.tsx`, `AuthContext.tsx` |
| **Database Migrations** | `/database/migrations/` | `20241025000001-add-feature.js` |
| **Database Seeders** | `/database/seeders/` | `20241025000001-seed-data.js` |
| **Scripts** | `/scripts/` | `migrate.mjs`, `backup-db.js` |
| **Configuration** | `/config/` | `database.js` |
| **Documentation** | `/docs/` | `NEW_FEATURE.md`, `API_GUIDE.md` |
| **Global Styles** | `/src/app/` | `globals.css` |
| **Public Assets** | `/public/` | `logo.png`, `favicon.ico` |

#### Actions to Take
- [ ] Move misplaced files to correct directories
- [ ] Rename files following naming conventions:
  - PascalCase for components: `UserCard.tsx`
  - camelCase for utilities: `emailService.ts`
  - kebab-case for migrations: `20241025000001-create-users.js`
- [ ] Update import paths in files that reference moved files
- [ ] Test that application still works after moving files
- [ ] Update `index.ts` exports if moving components

---

### 2. 🗑️ **Remove Unwanted Files**

**Clean up temporary, test, and unused files:**

#### Common Unwanted Files
```
❌ test.tsx (unless in proper test folder)
❌ temp.ts
❌ copy_of_Component.tsx
❌ Component_old.tsx
❌ Component_backup.tsx
❌ debug.log
❌ .DS_Store (Mac)
❌ thumbs.db (Windows)
❌ *.swp, *.swo (vim temp files)
❌ console.log files
❌ backup_* files (unless intentional)
❌ node_modules (should be in .gitignore)
❌ .next (should be in .gitignore)
❌ .env.local (should be in .gitignore - NEVER COMMIT!)
❌ DigiCertGlobalRootCA.crt.pem.* (backup copies)
```

#### How to Check
```powershell
# Find duplicate or backup files
Get-ChildItem -Recurse -Include "*old*", "*copy*", "*temp*", "*test*", "*backup*" | Select-Object FullName

# Find large unnecessary files
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB} | Select-Object FullName, Length

# Check for .env files (SHOULD ONLY BE .env.example)
Get-ChildItem -Recurse -Include ".env", ".env.local" | Select-Object FullName
```

#### Actions to Take
- [ ] Delete test files not in `/tests` directory
- [ ] Remove commented-out code blocks (use Git history instead)
- [ ] Delete unused components/functions
- [ ] Remove console.log statements (or replace with proper logging)
- [ ] Clean up empty directories
- [ ] Verify .env.local is NOT staged for commit

#### Safe Deletion Commands
```powershell
# Review before deleting
git clean -n -d  # Dry run (shows what will be deleted)

# Actually delete untracked files
git clean -f -d  # Use with caution!
```

---

### 3. 🔍 **Check for Duplicates**

**Identify and eliminate duplicate code and files:**

#### A. Check for Duplicate Files

```powershell
# Find files with similar names
Get-ChildItem -Recurse *.tsx | Group-Object Name | Where-Object {$_.Count -gt 1}
Get-ChildItem -Recurse *.ts | Group-Object Name | Where-Object {$_.Count -gt 1}

# Find duplicate components
Get-ChildItem -Path "src\components" -Recurse *.tsx | Group-Object Name | Where-Object {$_.Count -gt 1}
```

**Common duplicates in PSR-v4:**
- Same component in different locations
- Utility functions repeated in multiple files (formatDate, validateEmail, etc.)
- Type definitions scattered across files
- Email templates with similar content
- Database query patterns repeated
- Authentication checks duplicated

#### B. Check for Duplicate Code

**Manual Review Checklist:**
- [ ] Search for repeated utility functions
- [ ] Look for similar components that could be combined
- [ ] Check for duplicate type definitions
- [ ] Find repeated API call patterns (fetch with auth token)
- [ ] Identify similar validation logic
- [ ] Check for duplicate email template sections
- [ ] Look for repeated database queries
- [ ] Find duplicate form validation

**Tools to Help:**
```powershell
# Search for specific function names
git grep "export function formatDate"
git grep "export const generateOTP"
git grep "export async function"

# Find files with similar content
# Use VS Code's "Find in Files" (Ctrl+Shift+F)
```

#### Actions to Take

**For Duplicate Files:**
1. Compare the files (use VS Code compare feature)
2. Merge the best parts into one file
3. Update all imports to reference the single file
4. Delete the duplicate
5. Test thoroughly (especially API routes)

**For Duplicate Code:**
1. Extract to a shared utility function
2. Place in appropriate location:
   - Auth utilities → `/src/lib/auth.ts`
   - Email utilities → `/src/lib/emailService.ts`
   - Database utilities → `/src/lib/database.ts`
   - Validation → `/src/lib/validators.ts`
   - General utilities → `/src/lib/utils/`
3. Replace all instances with function call
4. Add proper JSDoc documentation
5. Update type definitions

#### Example: Consolidating Duplicates

**Before (Duplicate):**
```typescript
// src/app/api/auth/register/route.ts
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// src/app/api/auth/resend-otp/route.ts  
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

**After (Consolidated):**
```typescript
// src/lib/auth.ts
/**
 * Generate a 6-digit OTP code
 * @returns 6-digit numeric string
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// src/app/api/auth/register/route.ts
import { generateOTP } from '@/lib/auth';

// src/app/api/auth/resend-otp/route.ts
import { generateOTP } from '@/lib/auth';
```

---

### 4. 📝 **Update All Documentation**

**Keep documentation synchronized with code changes:**

#### A. Update Existing Documentation

| Document | When to Update | What to Update |
|----------|---------------|----------------|
| **README.md** | New features, setup changes | Quick start, features list, scripts, getting started |
| **PROJECT_SUMMARY.md** | Significant additions | Features completed, progress %, component count, metrics |
| **PROJECT_STRUCTURE.md** | New directories/files | File tree, route mapping, API endpoints |
| **UPDATE_LOG.md** | Every code change | Date, changes made, migrations, version |
| **docs/FEATURES.md** | Feature additions | Complete feature list with status |
| **docs/ADMIN_APPROVAL_WORKFLOW_TEST_GUIDE.md** | Workflow changes | Testing procedures, new steps |
| **docs/EMAIL_VALIDATION_AND_STATUS_SYSTEM.md** | Email/status changes | Status types, email templates |
| **docs/DAIRY_MANAGEMENT_IMPLEMENTATION.md** | Dairy features | Implementation details |
| **docs/PSR_COLOR_SYSTEM_IMPLEMENTATION.md** | Design changes | Color palette, component styles |
| **DAILY_WORKFLOW.md** | Process changes | Workflow updates, new tools |
| **Component README** | Component changes | Props, usage examples |
| **API Documentation** | New/modified endpoints | Request/response formats, auth requirements |

#### B. Check for Duplicate Documentation

**Common duplicates:**
- Same setup instructions in multiple files
- Feature descriptions repeated across docs
- Authentication flow explained in multiple places
- Email template examples duplicated
- Database schema descriptions repeated
- Color system guidelines duplicated

**How to Find:**
```powershell
# Search for similar content across docs
Select-String -Path "docs\*.md" -Pattern "Quick Start" -List
Select-String -Path "docs\*.md" -Pattern "Installation" -List
Select-String -Path "*.md" -Pattern "User Hierarchy" -List
Select-String -Path "*.md" -Pattern "Email Verification" -List
```

#### C. Consolidate & Remove Duplicate Docs

**Process:**
1. **Identify overlapping content**
   - Read through all documentation files
   - Note sections with similar information
   - Check for outdated/conflicting information

2. **Decide on canonical location**
   - Setup info → `README.md`
   - Architecture → `PROJECT_STRUCTURE.md`
   - Features → `docs/FEATURES.md`
   - Workflow → `docs/ADMIN_APPROVAL_WORKFLOW_TEST_GUIDE.md`
   - Daily workflow → `DAILY_WORKFLOW.md`
   - Updates → `UPDATE_LOG.md`
   - Summary → `PROJECT_SUMMARY.md`

3. **Merge duplicate content**
   - Combine best parts from duplicates
   - Add cross-references between docs
   - Remove redundant sections

4. **Update links**
   - Find all links to removed docs
   - Update to point to consolidated location
   - Test all documentation links

5. **Remove duplicate files**
   ```powershell
   git rm docs/OLD_DUPLICATE.md
   ```

#### D. Update Code Comments

- [ ] Add JSDoc comments to new functions
- [ ] Update comments that no longer match code
- [ ] Remove outdated TODOs
- [ ] Add inline explanations for complex logic (especially in auth flows)
- [ ] Document component props with TypeScript interfaces
- [ ] Add usage examples in component files
- [ ] Document API route parameters and responses
- [ ] Add database model relationship documentation

**Example JSDoc for PSR-v4:**
```typescript
/**
 * Generates a unique database key for admin users
 * Format: 3 letters from name + 4 random digits
 * @param fullName - Admin's full name
 * @returns Unique database key (e.g., "JOH1234")
 * @throws Error if unable to generate unique key after 10 attempts
 * @example
 * generateDbKey("John Doe") // "JOH1234"
 * generateDbKey("Mary Smith") // "MAR5678"
 */
export async function generateUniqueDbKey(fullName: string): Promise<string> {
  // Implementation
}
```

**Example Component Documentation:**
```typescript
/**
 * Dairy card component displaying dairy facility information
 * 
 * @example
 * ```tsx
 * <DairyCard 
 *   dairy={{
 *     id: 1,
 *     name: "Green Valley Dairy",
 *     dairyId: "GVD001",
 *     status: "active"
 *   }}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
interface DairyCardProps {
  /** Dairy facility data */
  dairy: Dairy;
  /** Edit handler */
  onEdit?: (id: number) => void;
  /** Delete handler */
  onDelete?: (id: number) => void;
}
```

**Example API Route Documentation:**
```typescript
/**
 * POST /api/auth/register
 * 
 * Register a new user with email verification
 * 
 * @body {string} fullName - User's full name
 * @body {string} email - Valid email address
 * @body {string} password - Strong password (8+ chars)
 * @body {UserRole} role - User role in hierarchy
 * @body {number} [parentId] - Parent user ID (required for non-admin)
 * @body {string} companyName - Company/organization name
 * @body {string} companyPincode - Indian postal code
 * 
 * @returns {201} User created, OTP sent
 * @returns {400} Validation error
 * @returns {409} Email already exists
 * @returns {500} Server error
 */
```

---

## 🔄 Complete Daily Routine

### Morning (Before Starting Work)
```powershell
# 1. Pull latest changes
git pull origin main

# 2. Check for dependency updates
npm install

# 3. Check if any migrations need to run
npm run db:status

# 4. Run pending migrations (if any)
npm run migration:up

# 5. Start development server
npm run dev

# 6. Open browser to verify app loads
# Navigate to: http://localhost:3000

# 7. Check for TypeScript errors
npx tsc --noEmit
```

### During Development
- Write clean, documented code
- Create files in correct locations
- Avoid duplicate code/files
- Test changes frequently (especially API routes)
- Keep email templates consistent
- Follow Material Design 3 color system
- Use absolute imports with `@/` alias

### End of Day (Before Committing)

#### Step 1: Organize (5 min)
```powershell
# Check new files
git status

# Move misplaced files
# Example: Move-Item src/file.ts src/lib/file.ts

# Update imports after moving
# Use VS Code Find & Replace (Ctrl+Shift+H)

# Test application
npm run dev
# Open http://localhost:3000
# Test changed features
```

#### Step 2: Clean Up (5 min)
```powershell
# Find unwanted files
git status | Select-String "test", "temp", "old", "backup"

# Check for .env files (CRITICAL!)
git status | Select-String ".env"

# Remove unwanted files
Remove-Item path/to/unwanted/file.ts

# Remove console.log statements
# Search: console.log
# Use VS Code Find in Files (Ctrl+Shift+F)

# Clean unused imports
# VS Code: Shift+Alt+O (Organize Imports)
```

#### Step 3: Check Duplicates (10 min)
```powershell
# Search for duplicate functions
git grep "export function generateOTP"
git grep "export const validateEmail"
git grep "export async function sendEmail"

# Check for duplicate components
Get-ChildItem -Path "src\components" -Recurse *.tsx | Group-Object Name | Where-Object {$_.Count -gt 1}

# Consolidate if found
# 1. Extract to shared location (/src/lib/)
# 2. Update all imports
# 3. Delete duplicates
# 4. Test changes
```

#### Step 4: Update Documentation (10 min)
```powershell
# Update relevant docs
code UPDATE_LOG.md         # Add today's changes
code PROJECT_SUMMARY.md    # Update metrics if significant changes
code PROJECT_STRUCTURE.md  # Update if new files/routes added
code README.md             # Update if setup changed

# Update feature docs if applicable
code docs/FEATURES.md
code docs/DAIRY_MANAGEMENT_IMPLEMENTATION.md

# Check for duplicate content
Select-String -Path "*.md" -Pattern "your recent change"

# Consolidate if needed
# Update links
```

#### Step 5: Database Checks (5 min)
```powershell
# If you created migrations
npm run db:status

# Verify migration ran correctly
npm run db:migrate

# Check if seed data updated
# npm run db:seed (if applicable)

# Verify database schema
# Review migration files in /database/migrations/
```

#### Step 6: Final Checks (5 min)
```powershell
# Check TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint

# Check for build errors
npm run build

# Verify dev server works
npm run dev
# Open http://localhost:3000 and test:
# - Login/Register flow
# - Admin approval (if changed)
# - Dairy management (if changed)
# - Email sending (check logs)
```

#### Step 7: Test Critical Flows (10 min)
```powershell
# Start dev server
npm run dev

# Test based on what you changed:

# If changed authentication:
# 1. Register new user
# 2. Verify OTP email received
# 3. Verify OTP code
# 4. Login with credentials
# 5. Check JWT token set

# If changed admin approval:
# 1. Register admin user
# 2. Verify OTP
# 3. Login as Super Admin (admin/psr@2025)
# 4. Check pending approvals
# 5. Approve admin
# 6. Verify dbKey generated
# 7. Check welcome email sent

# If changed dairy management:
# 1. Login as admin
# 2. Navigate to /admin/dairy
# 3. Add new dairy
# 4. Search/filter dairies
# 5. Edit dairy
# 6. View dairy details
# 7. Delete dairy

# If changed email system:
# 1. Check SMTP configuration
# 2. Test email sending
# 3. Verify templates render correctly
# 4. Check email logs
```

#### Step 8: Commit (5 min)
```powershell
# Review changes
git status
git diff

# Stage changes
git add .

# VERIFY .env.local NOT STAGED!
git status | Select-String ".env"

# Commit with descriptive message (use conventional commits)
git commit -m "feat: Add dairy statistics dashboard

- Created statistics cards component
- Added BMC/Society/Farmer count tracking
- Implemented monthly production metrics
- Updated DairyDetailPage with stats tab
- Added API endpoint for dairy statistics
- Updated DAIRY_MANAGEMENT_IMPLEMENTATION.md
- Updated PROJECT_SUMMARY.md (metrics)
- Updated UPDATE_LOG.md"

# Push to remote (use feature branch)
git push origin feature/dairy-statistics

# Or push to main (if working directly on main)
git push origin main
```

**Commit Message Format (Conventional Commits):**
- `feat:` - New feature (e.g., "feat: Add email validation system")
- `fix:` - Bug fix (e.g., "fix: Correct OTP expiration time")
- `docs:` - Documentation changes (e.g., "docs: Update API endpoint list")
- `style:` - Code style/formatting (e.g., "style: Format with Prettier")
- `refactor:` - Code refactoring (e.g., "refactor: Extract email utilities")
- `test:` - Adding tests (e.g., "test: Add user registration tests")
- `chore:` - Maintenance (e.g., "chore: Update dependencies")
- `perf:` - Performance improvement (e.g., "perf: Optimize database queries")
- `build:` - Build system (e.g., "build: Update Next.js config")
- `ci:` - CI/CD changes (e.g., "ci: Add GitHub Actions workflow")

---

## 📋 Weekly Tasks (Every Friday)

### Documentation Review
- [ ] Read through all documentation
- [ ] Fix broken links
- [ ] Remove outdated information
- [ ] Consolidate duplicate sections
- [ ] Update statistics:
  - File counts in PROJECT_STRUCTURE.md
  - Feature completion % in PROJECT_SUMMARY.md
  - Component counts
  - API endpoint counts
  - Lines of code estimates
- [ ] Verify all dates are current
- [ ] Update version numbers if applicable
- [ ] Review and update FEATURES.md

### Code Review
- [ ] Review for unused code
- [ ] Check for duplicate utilities/functions
- [ ] Look for performance issues (especially database queries)
- [ ] Verify error handling (try-catch blocks)
- [ ] Check security (SQL injection, XSS, auth checks)
- [ ] Update dependencies (`npm outdated`, `npm update`)
- [ ] Review component library for consistency
- [ ] Check for console.log statements
- [ ] Verify email templates are consistent
- [ ] Review Material Design 3 color usage

### Database Review
- [ ] Review migration files for consistency
- [ ] Check for orphaned records in database
- [ ] Verify foreign key relationships
- [ ] Test database backup/restore (if applicable)
- [ ] Review seed data for accuracy
- [ ] Check database connection pool settings
- [ ] Verify SSL certificate validity (Azure MySQL)

### Organization
- [ ] Archive old branches (`git branch -d branch-name`)
- [ ] Clean up old migrations (if needed - BE CAREFUL!)
- [ ] Review .gitignore (ensure no sensitive files tracked)
- [ ] Update scripts documentation
- [ ] Review and organize component exports
- [ ] Check for unused imports across codebase
- [ ] Organize email templates
- [ ] Review and update color system documentation

### Security Review
- [ ] Check for exposed API keys (.env.local NOT committed)
- [ ] Review JWT token expiration settings
- [ ] Verify password hashing is working
- [ ] Check rate limiting on API routes
- [ ] Review user role permissions
- [ ] Test admin approval workflow security
- [ ] Verify email validation is working
- [ ] Check for SQL injection vulnerabilities

---

## 🎯 Quality Checklist

Before marking work as complete, ensure:

### Code Quality
- [ ] No console.log statements (use proper logging if needed)
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint warnings addressed (`npm run lint`)
- [ ] Functions documented with JSDoc (especially public APIs)
- [ ] Complex logic has inline comments
- [ ] Async functions have error handling (try-catch)
- [ ] Database queries are optimized
- [ ] No hardcoded credentials (use environment variables)

### File Organization
- [ ] All files in correct directories (see file structure above)
- [ ] Naming conventions followed:
  - Components: PascalCase (`UserCard.tsx`)
  - Utilities: camelCase (`emailService.ts`)
  - API routes: kebab-case folders (`/api/auth/verify-otp/`)
- [ ] No duplicate files
- [ ] No temporary files committed
- [ ] Import paths use aliases (`@/` instead of relative paths)
- [ ] Components exported from index.ts files

### Documentation
- [ ] README.md up to date
- [ ] New features documented in:
  - UPDATE_LOG.md (with date)
  - PROJECT_SUMMARY.md (if significant)
  - FEATURES.md (if new feature)
- [ ] API changes documented (request/response formats)
- [ ] Database migrations documented
- [ ] No duplicate documentation
- [ ] All links work (test manually)
- [ ] Code comments are current

### Testing
- [ ] Application runs without errors (`npm run dev`)
- [ ] All features work as expected
- [ ] Database migrations successful (`npm run migration:up`)
- [ ] Email sending works (check SMTP logs)
- [ ] Authentication flows work:
  - Registration → OTP → Verification
  - Login → JWT token → Protected routes
  - Admin approval workflow
- [ ] Dairy management CRUD works (if changed)
- [ ] No breaking changes (or documented with migration guide)
- [ ] Tested in multiple browsers (Chrome, Firefox, Edge)

### PSR-v4 Specific Checks
- [ ] JWT tokens generated correctly (7-day access, 30-day refresh)
- [ ] HTTP-only cookies set properly
- [ ] Email templates render correctly (test in email client)
- [ ] OTP generation works (6-digit, 10-minute expiry)
- [ ] Admin schema creation works (dbKey generation)
- [ ] Multi-tenant data isolation verified
- [ ] Material Design 3 colors used consistently
- [ ] FlowerSpinner used for loading states
- [ ] Sidebar navigation updated if new routes
- [ ] Role-based access control working

---

## 🛠️ Helpful Commands

### File Organization
```powershell
# Find recently modified files
Get-ChildItem -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}

# List files by size
Get-ChildItem -Recurse -File | Sort-Object Length -Descending | Select-Object FullName, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}} -First 20

# Count files by type
Get-ChildItem -Recurse *.tsx | Measure-Object
Get-ChildItem -Recurse *.ts | Measure-Object
Get-ChildItem -Recurse *.md | Measure-Object

# Count components
Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" | Measure-Object

# List all component files
Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" | Select-Object Name, Directory

# Count API routes
Get-ChildItem -Path "src\app\api" -Recurse -Filter "route.ts" | Measure-Object

# Count pages
Get-ChildItem -Path "src\app" -Recurse -Filter "page.tsx" | Measure-Object
```

### Duplicate Detection
```powershell
# Find duplicate file names
Get-ChildItem -Recurse | Group-Object Name | Where-Object {$_.Count -gt 1} | Select-Object Name, Count

# Search for duplicate code patterns
git grep "export function generateOTP"
git grep "export const hashToken"
git grep "export async function sendEmail"

# Find duplicate utility functions
git grep -n "formatDate\s*=\s*\("
git grep -n "validateEmail\s*=\s*\("
```

### Documentation
```powershell
# Count documentation pages
Get-ChildItem *.md | Measure-Object
Get-ChildItem docs\*.md | Measure-Object

# List all documentation files with size
Get-ChildItem *.md, docs\*.md | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}, LastWriteTime

# Find broken links (manual check recommended)
Select-String -Path "*.md", "docs\*.md" -Pattern "\[.*\]\(.*\)" | Select-Object Line

# Search across all docs
Select-String -Path "*.md", "docs\*.md" -Pattern "your search term"

# Count total lines of documentation
(Get-Content *.md, docs\*.md | Measure-Object -Line).Lines
```

### Development Server
```powershell
# Start dev server (Next.js)
npm run dev
# Runs on: http://localhost:3000

# Check which ports are in use
netstat -ano | findstr :3000

# Kill process on port (if needed)
# Find PID from netstat output, then:
Stop-Process -Id PID -Force

# Alternative: Use taskkill
taskkill /F /PID PID
```

### Database Management
```powershell
# Check migration status
npm run db:status

# Run migrations (up)
npm run migration:up
# Or: npm run db:migrate

# Rollback last migration
npm run migration:down
# Or: npm run db:migrate:undo

# Run seeders
npm run db:seed

# Reset database (DROP, CREATE, MIGRATE, SEED)
npm run db:reset
# ⚠️ WARNING: This deletes all data!

# Create new migration
# Format: YYYYMMDDHHMMSS-description.js
# Example: 20241025120000-add-feature.js
# Create manually in /database/migrations/
```

### Git Operations
```powershell
# Check status
git status

# View recent commits
git log --oneline -10

# View changes
git diff

# View changes for specific file
git diff src/app/api/auth/login/route.ts

# Search commit history
git log --grep="dairy management"

# Find when a line was changed
git blame src/models/User.ts

# List all branches
git branch -a

# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name
```

### TypeScript & Linting
```powershell
# Check TypeScript errors
npx tsc --noEmit

# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint --fix

# Check specific file
npx eslint src/app/api/auth/login/route.ts
```

---

## 📚 References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Sequelize ORM Documentation](https://sequelize.org/docs/v6/)
- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Git Best Practices](https://git-scm.com/doc)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 💡 Pro Tips

1. **Commit Often**: Small, frequent commits are better than large ones
2. **Write Descriptive Messages**: Use conventional commits format
3. **Document While Fresh**: Don't wait until the end of the day
4. **Use VS Code Features**: 
   - Auto-organize imports: `Shift+Alt+O`
   - Format document: `Shift+Alt+F`
   - Find in files: `Ctrl+Shift+F`
   - Replace in files: `Ctrl+Shift+H`
5. **Review Your Own Code**: Before committing, review your changes
6. **Keep a Daily Log**: Note what you worked on in UPDATE_LOG.md
7. **Test Email Flows**: Use real email accounts to test OTP delivery
8. **Use Absolute Imports**: Always use `@/` instead of `../../../`
9. **Check Database**: Verify migrations ran correctly
10. **Update Metrics**: Keep component counts and progress % current
11. **Test Multi-Tenancy**: Ensure admin schemas are isolated
12. **Verify Auth Flows**: Test complete registration → login cycle
13. **Check Email Templates**: Preview in email client, not just browser
14. **Use Material Colors**: Stick to PSR green/emerald/teal palette
15. **Document API Changes**: Update API route comments with request/response

---

## ⚠️ Common Mistakes to Avoid

❌ Committing .env or .env.local files (CHECK EVERY TIME!)  
❌ Leaving console.log statements in production code  
❌ Creating duplicate utilities/components  
❌ Not updating documentation (especially UPDATE_LOG.md)  
❌ Leaving commented-out code (use git history)  
❌ Creating files in wrong locations  
❌ Not testing after reorganizing/moving files  
❌ Forgetting to update imports after moving files  
❌ Not testing complete authentication flow  
❌ Hardcoding credentials (use environment variables)  
❌ Not checking TypeScript errors before committing  
❌ Creating API routes without authentication middleware  
❌ Not testing email sending in development  
❌ Forgetting to run migrations after creating them  
❌ Not verifying dbKey generation works  
❌ Committing with merge conflicts  
❌ Not updating component exports in index.ts  
❌ Using relative imports instead of `@/` alias  
❌ Not checking CORS settings for API routes  
❌ Forgetting to set HTTP-only cookies for auth  

---

## 📊 Current Project Status (October 25, 2025)

### Completed Features

**✅ Authentication & Authorization (95%)**
- Multi-tier role-based access control (6 levels)
- JWT token authentication (7-day access, 30-day refresh)
- Email verification with OTP (6-digit, 10-minute expiry)
- Admin approval workflow
- Password reset functionality
- Login attempt limiting (5 attempts = 2-hour lock)

**✅ Email System (100%)**
- SMTP integration with Gmail
- 6 professional HTML email templates
- Email validation with DNS MX checking
- Domain typo detection
- Automated notifications

**✅ Dairy Management (100%)**
- Complete CRUD operations
- Search and filtering
- Status management (Active, Inactive, Maintenance)
- Detailed view with tabs (Overview, Analytics, Activity)
- Statistics dashboard

**✅ Database & Infrastructure (90%)**
- Multi-tenant architecture (schema per admin)
- Azure MySQL integration with SSL
- 6 database migrations
- Sequelize ORM
- Connection pooling
- Automated schema creation

**✅ User Interface (90%)**
- Material Design 3 implementation
- Responsive design (mobile/tablet/desktop)
- Custom color system (green/emerald/teal)
- 30+ React components
- FlowerSpinner loading animation
- Dynamic sidebar navigation

### In Progress

**🔄 BMC Management (0%)**
- CRUD operations
- Relationship to dairies
- Status tracking

**🔄 Society Management (0%)**
- CRUD operations
- Relationship to BMCs
- Farmer coordination

**🔄 Farmer Management (0%)**
- CRUD operations
- Profile management
- Production tracking

**🔄 Analytics Dashboard (30%)**
- Production charts
- Performance metrics
- Trend analysis

### Overall Progress
- **Phase 1 (Foundation)**: 100% Complete ✅
- **Phase 2 (Core Features)**: 100% Complete ✅
- **Phase 3 (Entity Management)**: 25% Complete 🔄
- **Phase 4 (Advanced Features)**: 0% Planned 🎯

**Total Project Progress**: ~60% Complete

---

## 🎯 Next Sprint Goals

### This Week
- [ ] Implement BMC management system (similar to Dairy)
- [ ] Create BMC CRUD API endpoints
- [ ] Design BMC UI components
- [ ] Add BMC-Dairy relationship handling
- [ ] Update documentation for BMC features

### Next Week
- [ ] Implement Society management system
- [ ] Create Society CRUD API endpoints
- [ ] Design Society UI components
- [ ] Add Society-BMC relationship handling

### This Month
- [ ] Complete Farmer management system
- [ ] Implement profile editing for all users
- [ ] Add password change functionality
- [ ] Enhance analytics dashboard with real charts
- [ ] Add export/import functionality

---

**Remember**: A clean, organized codebase is easier to maintain, debug, and scale. Taking 40-50 minutes each day to organize and document saves hours of confusion later!

🎯 **Goal**: Leave the codebase better than you found it!

---

**Last Updated**: October 25, 2025  
**Project**: Poornasree Equipments Cloud (PSR-v4)  
**Current Phase**: Phase 3 - Entity Management  
**Version**: 0.1.0
