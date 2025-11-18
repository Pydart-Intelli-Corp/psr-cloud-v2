# Farmer Module Localization - Complete Analysis

## Files Requiring Localization

### 1. **src/app/admin/farmer/[id]/page.tsx** (Farmer Detail Page)

#### Hardcoded Text Found:

**Line 225**: `'Are you sure you want to delete this farmer?'`
**Line 258**: `'Farmer Not Found'`
**Line 260**: `'The requested farmer could not be found.'`
**Line 264**: `'Back to Farmers'`

**Line 247-250**: Tab Labels
```typescript
const tabs = [
  { id: 'details', label: 'Basic Details', icon: User },
  { id: 'contact', label: 'Contact & Society', icon: Phone },
  { id: 'banking', label: 'Banking Details', icon: CreditCard },
  { id: 'additional', label: 'Additional Info', icon: MessageSquare }
];
```

**Line 300-304**: Status Options
```typescript
{ status: 'active', label: 'Active', ... },
{ status: 'inactive', label: 'Inactive', ... },
{ status: 'suspended', label: 'Suspended', ... },
{ status: 'maintenance', label: 'Maintenance', ... }
```

**Line 330-336**: Form Labels (Edit Mode)
```typescript
<FormInput label="Farmer ID" .../>
<FormInput label="RF-ID" .../>
<FormInput label="Farmer Name" .../>
<FormSelect label="Status" .../>
```

**Line 340-362**: Display Labels (View Mode)
```typescript
<p className="text-sm text-gray-600 dark:text-gray-400">Farmer ID</p>
<p className="text-sm text-gray-600 dark:text-gray-400">RF-ID</p>
<p className="text-sm text-gray-600 dark:text-gray-400">Farmer Name</p>
<p className="text-sm text-gray-600 dark:text-gray-400">Bonus</p>
```

**Line 371**: Section Heading
```typescript
<h3>Contact & Society Information</h3>
```

**Line 377-387**: Contact Form Labels
```typescript
<FormInput label="Contact Number" .../>
<FormSelect label="SMS Enabled" .../>
<FormSelect label="Society" .../>
```

**Line 398-408**: Contact Display Labels
```typescript
<p className="text-sm text-gray-600 dark:text-gray-400">Contact Number</p>
<p className="text-sm text-gray-600 dark:text-gray-400">SMS Enabled</p>
<p className="text-sm text-gray-600 dark:text-gray-400">Society</p>
```

**Line 419**: `'N/A'` (repeated multiple times)

**Line 424**: Form Label
```typescript
<FormTextarea label="Address" .../>
```

**Line 431**: `'Address'`

**Line 442**: Section Heading
```typescript
<h3>Banking Details</h3>
```

**Line 447-458**: Banking Form Labels
```typescript
<FormInput label="Bank Name" .../>
<FormInput label="Account Number" .../>
<FormInput label="IFSC Code" .../>
<FormInput label="Bonus" .../>
```

**Line 463-478**: Banking Display Labels
```typescript
<p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
<p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
<p className="text-sm text-gray-600 dark:text-gray-400">IFSC Code</p>
<p className="text-sm text-gray-600 dark:text-gray-400">Bonus Amount</p>
```

**Line 491**: Section Heading
```typescript
<h3>Additional Information</h3>
```

**Line 495-500**: Form Label
```typescript
<FormTextarea 
  label="Notes" 
  placeholder="Add any additional notes about this farmer..."
/>
```

**Line 505**: `'Notes'`
**Line 509**: `'No additional notes available.'`

**Line 515**: `'Created At'`
**Line 524**: `'Last Updated'`

**Line 328**: `'Save'`
**Line 326**: `'Saving...'`
**Line 334**: `'Edit'`
**Line 339**: `'Delete'`

**Line 368**: `'Basic Details'`

---

### 2. **src/app/admin/farmer/page.tsx** (Farmer List/Management Page)

#### Hardcoded Text Found:

**Line 1482**: Form Labels in Add Farmer Modal
```typescript
<FormInput label="Farmer ID" placeholder="Enter unique farmer ID (e.g., F001, FA-2024-001)" />
<FormInput label="Farmer Name" placeholder="Enter farmer's full name" />
<FormSelect label="Society" placeholder="Select Society" />
<FormSelect label="Machine" placeholder="Select Machine" />
<FormInput label="Contact Number" placeholder="Enter mobile number" />
<FormSelect label="SMS Enabled" placeholder="Select Status" />
<FormInput label="RF ID" placeholder="Enter RF ID (optional)" />
<FormInput label="Bonus" placeholder="Enter bonus amount" />
<FormSelect label="Status" placeholder="Select status" />
<FormInput label="Bank Name" placeholder="Enter bank name" />
<FormInput label="Bank Account Number" placeholder="Enter account number" />
<FormInput label="IFSC Code" placeholder="Enter IFSC code" />
<FormInput label="Address" placeholder="Enter farmer's address" />
<FormInput label="Notes" placeholder="Enter additional notes (optional)" />
```

**Line 1540**: Warning Message
```typescript
<p className="text-sm text-yellow-700 dark:text-yellow-300">
  No machines found for this society. You can <strong>add machines first</strong> from the Machine Management section, or proceed without assigning a machine.
</p>
```

**Line 1558**: Form Actions
```typescript
<FormActions
  submitText="Create Farmer"
  isLoading={isSubmitting}
  isSubmitDisabled={!formData.societyId || !formData.machineId || !formData.farmerId || !formData.farmerName}
/>
```

**Line 1572**: Edit Farmer Modal Title (from `t.farmerManagement.editFarmer`)

**Line 1578-1649**: Edit Form Labels (same as Add Form)

**Line 1661**: Form Actions
```typescript
<FormActions submitText="Update Farmer" .../>
```

**Line 1673**: Bulk Upload Modal Title
```typescript
title="Bulk Upload Farmers"
```

**Line 1676-1683**: Bulk Upload Form
```typescript
<FormSelect label="Default Society" placeholder="Select Society" />
<p>This society will be assigned to all farmers that don't have a society_id in the CSV</p>
<label>CSV File</label>
```

**Line 1693-1704**: CSV Format Requirements
```typescript
<p className="font-medium mb-2">CSV Format Requirements:</p>
<ul>
  <li>Headers: ID, RF-ID, NAME, MOBILE, SMS, BONUS (minimum)</li>
  <li>Optional: ADDRESS, BANK_NAME, ACCOUNT_NUMBER, IFSC_CODE, SOCIETY_ID, MACHINE-ID</li>
  <li>SMS values: ON or OFF</li>
  <li>MACHINE-ID should be a valid machine ID (optional)</li>
  <li>All farmers must have a society - either from CSV SOCIETY_ID or the default above</li>
  <li>File should be UTF-8 encoded</li>
</ul>
```

**Line 1710**: Form Actions
```typescript
<FormActions submitText="Upload Farmers" .../>
```

**Line 1312**: View Details Link
```typescript
viewText="View Details"
```

---

### 3. **src/components/forms/CSVUploadModal.tsx** (CSV Upload Component)

#### Hardcoded Text Found:

**Line 200**: Modal Header
```typescript
<h2>Upload Farmers CSV</h2>
```

**Line 220**: Close Button

**Line 230**: Default Society Section
```typescript
<h3>Default Society</h3>
<p>Society for all farmers in CSV</p>
<FormSelect placeholder="Select Society" />
```

**Line 250**: Default Machine Section
```typescript
<h3>Default Machine</h3>
<p>Machine for all farmers in CSV</p>
<FormSelect placeholder="Select Machine" />
```

**Line 270**: File Selection
```typescript
<label>Select CSV File</label>
<p>Click to upload CSV file or drag and drop</p>
```

**Line 290**: CSV Format Requirements
```typescript
<div>
  <h4>CSV Format Requirements</h4>
  <ul>
    <li>Headers: ID, RF-ID, NAME, MOBILE, SMS, BONUS</li>
    <li>SMS values: ON or OFF</li>
    <li>File should be UTF-8 encoded</li>
  </ul>
</div>
```

**Line 320**: Download Template Button
```typescript
<button>Download Sample Template</button>
```

**Line 340**: Upload Button
```typescript
<button>Upload Farmers</button>
```

**Line 360**: Cancel Button
```typescript
<button>Cancel</button>
```

**Line 380**: Upload Results
```typescript
<div>
  <h3>Upload Complete</h3>
  <p>Total Processed: {totalProcessed}</p>
  <p>Successful: {successCount}</p>
  <p>Failed: {failedCount}</p>
</div>
```

**Line 410**: Failed Farmers Table
```typescript
<table>
  <thead>
    <tr>
      <th>Row</th>
      <th>Farmer ID</th>
      <th>Name</th>
      <th>Error</th>
    </tr>
  </thead>
</table>
```

**Line 440**: Action Buttons
```typescript
<button>Try Again</button>
<button>Upload Another</button>
<button>Close</button>
```

**Line 470**: Error Messages
```typescript
'Please select a CSV file'
'Please select a CSV file, society, and machine'
'Upload failed'
'Failed to upload CSV. Please try again.'
```

**Line 490**: Loading States
```typescript
'Uploading...'
'Loading machines...'
```

---

## Localization Keys Already Added to `en.ts`

All the required translations have been added to `src/locales/en.ts` under `farmerManagement` section:

### Available Keys:
- `title`, `subtitle`, `addFarmer`, `editFarmer`, `deleteFarmer`
- `uploadCSV`, `downloadData`, `bulkActions`
- `farmerId`, `farmerName`, `rfId`, `contactNumber`, `smsEnabled`, `bonus`
- `address`, `bankName`, `bankAccountNumber`, `ifscCode`
- `society`, `machine`, `status`, `notes`
- `active`, `inactive`, `suspended`, `maintenance`, `all`
- `loading`, `saving`, `uploading`
- `enterFarmerId`, `enterFarmerName`, `enterRfId`, etc.
- `enterUniqueFarmerId`, `enterFarmerFullName`, `enterFarmerAddress`
- `confirmDelete`, `confirmDeleteThis`, `confirmBulkDelete`, `deleteWarning`
- `csvUploadTitle`, `csvFormatRequirements`, `selectDefaultSociety`
- `defaultSociety`, `defaultMachine`, `societyForFarmers`, `machineForFarmers`
- `uploadResults`, `totalProcessed`, `successful`, `failed`
- `farmerDetails`, `basicDetails`, `contactAndSocietyInfo`, `bankingDetails`
- `additionalInfo`, `backToFarmers`, `farmerNotFound`
- `edit`, `delete`, `save`, `cancel`, `saveChanges`
- `createFarmer`, `updateFarmer`
- And many more...

---

## Implementation Steps Required:

### Step 1: Update Farmer Detail Page (`src/app/admin/farmer/[id]/page.tsx`)
1. Import locale hook: `import { useLocale } from '@/contexts/LocaleContext';`
2. Add hook: `const { t } = useLocale();`
3. Replace all hardcoded text with `t.farmerManagement.*` keys

### Step 2: Update Farmer List Page (`src/app/admin/farmer/page.tsx`)
1. Already using `t.farmerManagement.*` for most text
2. Update remaining hardcoded placeholders and messages
3. Fix form labels in modals to use translations

### Step 3: Update CSV Upload Modal (`src/components/forms/CSVUploadModal.tsx`)
1. Import locale hook
2. Replace all hardcoded text with translations
3. Update button labels, section headers, and messages

### Step 4: Test All Screens
1. Verify all text is properly localized
2. Check that no hardcoded English text remains
3. Prepare for Hindi and Malayalam translations

---

## Summary Statistics:

- **Total Files**: 3 main files
- **Total Hardcoded Strings**: ~150+ strings
- **Localization Keys Added**: ~100+ keys
- **Files Ready**: `en.ts` (English locale)
- **Files Pending**: `hi.ts` (Hindi), `ml.ts` (Malayalam)

---

## Next Actions:

1. ✅ English translations added to `src/locales/en.ts`
2. ⏳ Update `src/app/admin/farmer/[id]/page.tsx` with localization
3. ⏳ Update `src/components/forms/CSVUploadModal.tsx` with localization
4. ⏳ Review and fix `src/app/admin/farmer/page.tsx` remaining hardcoded text
5. ⏳ Add Hindi translations to `src/locales/hi.ts`
6. ⏳ Add Malayalam translations to `src/locales/ml.ts`

---

**Note**: This comprehensive analysis ensures that ALL farmer-related screens, components, forms, dropdowns, buttons, and text elements are identified for complete localization across the entire Farmer Management module.
