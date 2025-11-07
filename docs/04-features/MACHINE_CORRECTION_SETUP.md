# Machine Correction Feature - Setup Guide

## 📋 Quick Start

The Machine Correction feature has been successfully implemented! Here's how to set it up:

### 1. Create the Table in Your Admin Schema

Run this command with your admin schema name:

```bash
node scripts/create-machine-corrections-for-schema.mjs <your_schema_name>
```

**Example:**
```bash
node scripts/create-machine-corrections-for-schema.mjs admin_test_db
```

Replace `admin_test_db` with your actual admin schema name (e.g., `admin_john_psr2024`).

### 2. Access the Feature

1. Log in as an Admin user
2. Navigate to **Machines** page
3. Click on any machine to view details
4. Click the **"Correction"** tab
5. Enter correction values for the 3 channels
6. Click **"Save Correction Data"**

---

## 📊 Database Schema

The `machine_corrections` table will be created with:

### Columns:
- **id** - Primary key (auto-increment)
- **machineId** - Links to admin_machines table
- **societyId** - Links to societies table
- **Channel 1** (6 fields): fat, snf, clr, temp, water, protein
- **Channel 2** (6 fields): fat, snf, clr, temp, water, protein  
- **Channel 3** (6 fields): fat, snf, clr, temp, water, protein
- **status** - TINYINT(1): `1` = Active/Current, `0` = Inactive/Old
- **createdAt** - Timestamp
- **updatedAt** - Timestamp

### Indexes:
- `machineId` - For fast lookups by machine
- `societyId` - For filtering by society
- `createdAt` - For sorting by date
- `status` - For finding active corrections

---

## 🔧 How It Works

### Status Management
- When you save a new correction:
  1. All previous corrections for that machine are set to `status = 0` (inactive)
  2. The new correction is saved with `status = 1` (active)
  3. Only one active correction per machine at any time

### Data Validation
- All values are stored as `DECIMAL(5,2)` (e.g., 3.45, 12.50)
- Empty fields are automatically saved as `0.00`
- Frontend validates numeric input with 2 decimal places

---

## 📝 API Endpoints

### POST - Save Correction
```
POST /api/user/machine-correction
```

**Body:**
```json
{
  "machineId": 123,
  "societyId": 456,
  "channel1_fat": "3.50",
  "channel1_snf": "8.20",
  ...
}
```

### GET - View Correction History
```
GET /api/user/machine-correction?machineId=123
```

Returns last 50 corrections for the specified machine.

---

## 🎨 UI Features

- **3 Channels** - Each with distinct color coding:
  - Channel 1: Blue
  - Channel 2: Green
  - Channel 3: Purple

- **6 Fields per Channel:**
  - Fat
  - SNF (Solid Not Fat)
  - CLR
  - Temp (Temperature)
  - Water
  - Protein

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Real-time Validation** - Only numbers with 2 decimal places
- **Loading States** - Visual feedback while saving
- **Success/Error Messages** - Clear user feedback

---

## 🚀 Migration Files

### Created Files:
1. **Migration**: `database/migrations/20241105000001-create-machine-corrections.js`
2. **Script**: `scripts/create-machine-corrections-for-schema.mjs`
3. **API**: `src/app/api/user/machine-correction/route.ts`
4. **UI**: Updated `src/app/admin/machine/[id]/page.tsx`

---

## ✅ Testing Checklist

After running the migration:

- [ ] Table `machine_corrections` exists in your admin schema
- [ ] Navigate to a machine detail page
- [ ] "Correction" tab appears between "Analytics" and "Activity"
- [ ] All 18 input fields render correctly (3 channels × 6 fields)
- [ ] Can enter numeric values with decimals
- [ ] Cannot enter non-numeric characters
- [ ] Save button shows loading state
- [ ] Success message appears after saving
- [ ] Data is saved to database
- [ ] Previous correction status changed to 0
- [ ] New correction has status 1

---

## 🔍 Troubleshooting

### Schema doesn't exist?
Make sure your admin schema has been created. Check with:
```sql
SHOW DATABASES LIKE 'admin_%';
```

### Table already exists?
The script will skip creation if the table already exists.

### Permission denied?
Ensure your database user has CREATE TABLE permissions on the admin schema.

### Can't save corrections?
Check browser console for errors and verify the API endpoint is accessible.

---

## 📞 Support

For issues or questions:
1. Check the browser console for JavaScript errors
2. Check the terminal for API errors
3. Verify database connection settings in `.env.local`

---

**Last Updated**: November 5, 2025  
**Version**: 1.0.0  
**Feature**: Machine Correction System
