# Farmer Management Refactoring - Component Extraction

## Overview
This document details the extraction of hardcoded components and functions from the farmer management page into reusable components.

## Created Components

### 1. Management Components (src/components/management/)

#### **BulkDeleteConfirmModal.tsx**
- **Purpose**: Reusable confirmation modal for bulk delete operations
- **Props**:
  - `isOpen`: boolean
  - `onClose`: () => void
  - `onConfirm`: () => void
  - `itemCount`: number
  - `itemType`: string (e.g., 'farmer', 'BMC', 'society')
  - `isDeleting`: boolean (optional)
  - `hasFilters`: boolean (optional)
- **Features**:
  - Material Design 3 styling
  - Dark mode support
  - Loading state with FlowerSpinner
  - Warning icon from lucide-react
  - Disabled state during deletion

#### **LoadingSnackbar.tsx**
- **Purpose**: Bottom-right loading notification with progress bar
- **Props**:
  - `isVisible`: boolean
  - `message`: string
  - `submessage`: string (optional)
  - `progress`: number (0-100, optional)
  - `showProgress`: boolean (optional)
- **Features**:
  - Fixed bottom-right positioning
  - Progress bar with gradient
  - Percentage display
  - FlowerSpinner animation
  - Responsive design

#### **ViewModeToggle.tsx**
- **Purpose**: Toggle between folder/grouped and list views
- **Props**:
  - `viewMode`: 'folder' | 'list'
  - `onViewModeChange`: (mode: 'folder' | 'list') => void
  - `folderLabel`: string (optional)
  - `listLabel`: string (optional)
- **Features**:
  - Grid3x3 and List icons
  - Active state highlighting
  - Responsive labels (hidden on small screens)
  - Material Design toggle style

#### **BulkActionsToolbar.tsx**
- **Purpose**: Floating toolbar for bulk operations
- **Props**:
  - `selectedCount`: number
  - `onBulkDelete`: () => void
  - `onBulkDownload`: () => void
  - `onBulkStatusUpdate`: (status: string) => void (optional)
  - `onClearSelection`: () => void (optional)
  - `itemType`: string
  - `showStatusUpdate`: boolean (optional)
  - `currentBulkStatus`: string (optional)
  - `onBulkStatusChange`: (status: string) => void (optional)
- **Features**:
  - Fixed bottom-center positioning
  - Selection count badge
  - Status dropdown integration
  - Bulk delete, download, update actions
  - Clear selection button
  - Responsive layout

#### **FolderView.tsx**
- **Purpose**: Generic grouped/folder view component
- **Props**:
  - `items`: T[]
  - `groupByKey`: keyof T
  - `groupByLabel`: string
  - `groups`: Array<{id, name, identifier}>
  - `expandedGroups`: Set<number>
  - `selectedGroups`: Set<number>
  - `onToggleExpand`: (groupId: number) => void
  - `onToggleGroupSelection`: (groupId: number, itemIds: number[]) => void
  - `renderItem`: (item: T) => React.ReactNode
  - `getItemId`: (item: T) => number
  - `getGroupStats`: (groupId, items) => stats (optional)
  - `emptyMessage`: string (optional)
- **Features**:
  - Generic TypeScript implementation
  - Expandable folder groups
  - Group-level checkboxes
  - Stats display (active/inactive counts)
  - Folder/FolderOpen icons
  - Responsive grid layout
  - Empty state handling

#### **FolderControls.tsx**
- **Purpose**: Expand/collapse all folders controls
- **Props**:
  - `onExpandAll`: () => void
  - `onCollapseAll`: () => void
  - `expandedCount`: number (optional)
  - `totalCount`: number (optional)
- **Features**:
  - Expand all button
  - Collapse all button
  - Expanded count display
  - ChevronDown/ChevronRight icons

## Created Utilities (src/lib/utils/)

### **farmerUtils.ts**
Comprehensive utility functions for farmer management:

#### CSV Operations
- `downloadCSV(csvContent, filename)` - Download data as CSV file
- `convertToCSV(farmers)` - Convert farmers array to CSV format
- `parseCSVFile(file)` - Parse and validate CSV file upload

#### Data Filtering & Sorting
- `filterFarmers(farmers, searchQuery, statusFilter, bmcFilter, societyFilter)` - Filter farmers
- `sortFarmers(farmers, sortField, sortOrder)` - Sort farmers by field
- `groupFarmersBy(farmers, field)` - Group farmers by field

#### Statistics & Analysis
- `getFarmerStats(farmers)` - Get total, active, inactive, maintenance counts
- `calculateProgress(current, total)` - Calculate percentage progress

#### Validation
- `validateFarmerData(data)` - Validate farmer data with error messages

#### Formatting
- `formatPhoneNumber(phone)` - Format phone number for display
- `getStatusColor(status)` - Get Material Design color classes for status
- `generateFilename(prefix, extension)` - Generate timestamped filename

#### Batch Operations
- `batchItems(items, batchSize)` - Batch items for processing

## Type Definitions (src/types/)

### **farmer.ts**
Created comprehensive farmer type definitions:

```typescript
export interface Farmer {
  id: number;
  farmerId: string;
  rfId?: string;
  farmerName: string;
  fullName?: string;
  password?: string;
  contactNumber?: string;
  phoneNumber?: string;
  email?: string;
  smsEnabled: string;
  bonus: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bmcId?: number;
  bmcName?: string;
  bmcIdentifier?: string;
  societyId?: number;
  societyName?: string;
  societyIdentifier?: string;
  machineId?: number | string;
  machineName?: string;
  machineType?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FarmerFormData { ... }
export interface FarmerFilters { ... }
export interface FarmerStats { ... }
```

## Updated Files

### **src/components/management/index.ts**
Added exports for new components:
```typescript
export { default as BulkDeleteConfirmModal } from './BulkDeleteConfirmModal';
export { default as BulkActionsToolbar } from './BulkActionsToolbar';
export { default as LoadingSnackbar } from './LoadingSnackbar';
export { default as ViewModeToggle } from './ViewModeToggle';
export { default as FolderView } from './FolderView';
export { default as FolderControls } from './FolderControls';
```

### **src/types/index.ts**
Added farmer type exports:
```typescript
export * from './farmer';
```

## Usage Examples

### 1. Using BulkDeleteConfirmModal
```typescript
<BulkDeleteConfirmModal
  isOpen={showBulkDeleteModal}
  onClose={() => setShowBulkDeleteModal(false)}
  onConfirm={handleBulkDelete}
  itemCount={selectedFarmers.length}
  itemType="farmer"
  isDeleting={isDeleting}
  hasFilters={hasActiveFilters}
/>
```

### 2. Using LoadingSnackbar
```typescript
<LoadingSnackbar
  isVisible={isUploading}
  message="Uploading farmers..."
  submessage={`Processing ${processedCount}/${totalCount}`}
  progress={calculateProgress(processedCount, totalCount)}
/>
```

### 3. Using ViewModeToggle
```typescript
<ViewModeToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  folderLabel="Folder View"
  listLabel="List View"
/>
```

### 4. Using BulkActionsToolbar
```typescript
<BulkActionsToolbar
  selectedCount={selectedFarmers.length}
  onBulkDelete={() => setShowBulkDeleteModal(true)}
  onBulkDownload={handleBulkDownload}
  onBulkStatusUpdate={handleBulkStatusUpdate}
  onClearSelection={clearSelection}
  itemType="farmer"
  currentBulkStatus={bulkStatus}
  onBulkStatusChange={setBulkStatus}
/>
```

### 5. Using FolderView
```typescript
<FolderView
  items={filteredFarmers}
  groupByKey="societyId"
  groupByLabel="Society"
  groups={societies}
  expandedGroups={expandedSocieties}
  selectedGroups={selectedSocieties}
  onToggleExpand={toggleSocietyExpand}
  onToggleGroupSelection={toggleSocietySelection}
  renderItem={(farmer) => <FarmerCard farmer={farmer} />}
  getItemId={(farmer) => farmer.id}
  getGroupStats={getSocietyStats}
/>
```

### 6. Using Utility Functions
```typescript
import {
  filterFarmers,
  sortFarmers,
  convertToCSV,
  downloadCSV,
  getFarmerStats,
  validateFarmerData,
  getStatusColor
} from '@/lib/utils/farmerUtils';

// Filter farmers
const filtered = filterFarmers(farmers, searchQuery, statusFilter, bmcFilter, societyFilter);

// Sort farmers
const sorted = sortFarmers(filtered, 'farmerName', 'asc');

// Get statistics
const stats = getFarmerStats(filtered);

// Download CSV
const csvContent = convertToCSV(selected);
downloadCSV(csvContent, generateFilename('farmers', 'csv'));

// Validate data
const { isValid, errors } = validateFarmerData(formData);

// Get status colors
const { bg, text, border } = getStatusColor(farmer.status);
```

## Benefits of Refactoring

### Code Reusability
- All components can be used across BMC, Society, Machine, and other management pages
- Utility functions can be shared across the application
- Type definitions ensure consistency

### Maintainability
- Single source of truth for UI components
- Centralized logic for common operations
- Easier to update and fix bugs

### Type Safety
- Strong TypeScript typing throughout
- Compile-time error detection
- Better IDE autocomplete

### Consistency
- Uniform UI/UX across all management pages
- Consistent error handling and validation
- Material Design 3 compliance

### Performance
- Smaller bundle sizes (no code duplication)
- Tree-shaking friendly exports
- Optimized re-renders with proper prop handling

## Next Steps

To complete the farmer page refactoring:

1. **Import Components** - Replace inline components with new reusable ones
2. **Import Utilities** - Replace inline functions with imported utilities
3. **Update State Management** - Use new type definitions
4. **Remove Duplicated Code** - Delete old inline implementations
5. **Test Functionality** - Ensure all features work correctly
6. **Update Other Pages** - Apply same refactoring to BMC, Society, Machine pages

## File Structure

```
src/
├── components/
│   └── management/
│       ├── BulkDeleteConfirmModal.tsx ✅ NEW
│       ├── BulkActionsToolbar.tsx ✅ NEW
│       ├── LoadingSnackbar.tsx ✅ NEW
│       ├── ViewModeToggle.tsx ✅ NEW
│       ├── FolderView.tsx ✅ NEW
│       ├── FolderControls.tsx ✅ NEW
│       └── index.ts ✅ UPDATED
├── lib/
│   └── utils/
│       └── farmerUtils.ts ✅ NEW
└── types/
    ├── farmer.ts ✅ NEW
    └── index.ts ✅ UPDATED
```

## Estimated Impact

Before refactoring:
- farmer/page.tsx: **2,230 lines**
- Duplicated code across multiple management pages
- Difficult to maintain and update

After refactoring:
- farmer/page.tsx: **~500-800 lines** (estimated)
- 6 reusable components available
- 16+ utility functions available
- Type-safe implementations
- 60-70% code reduction in the page file
