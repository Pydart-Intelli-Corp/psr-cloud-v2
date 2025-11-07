# PSR-v4 Component Library - Management Components

**Document Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Status**: ✅ Production Ready  
**Location**: `src/components/management/`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Component Catalog](#component-catalog)
3. [Loading & Feedback Components](#loading--feedback-components)
4. [Bulk Operation Components](#bulk-operation-components)
5. [View Mode Components](#view-mode-components)
6. [UI Components](#ui-components)
7. [Management Components](#management-components)
8. [Usage Patterns](#usage-patterns)
9. [Integration Guide](#integration-guide)

---

## 🎯 Overview

The PSR-v4 management component library contains **24 reusable components** extracted from farmer, machine, society, BMC, and dairy management pages. These components follow Material Design 3 principles and provide consistent UI/UX across all entity management interfaces.

### Key Features

- ✅ **24 Production-Ready Components**
- ✅ **Full TypeScript Support** with strict type checking
- ✅ **Material Design 3** styling with dark mode
- ✅ **Responsive Design** for mobile, tablet, desktop
- ✅ **Accessibility** compliant with WCAG 2.1
- ✅ **Reusable Patterns** for bulk operations, loading states, forms
- ✅ **Customizable** with flexible props and configurations

### Component Categories

| Category | Components | Purpose |
|----------|-----------|---------|
| **Loading & Feedback** | 2 | Loading states, status messages |
| **Bulk Operations** | 3 | Selection, deletion, actions toolbar |
| **View Modes** | 3 | Folder/list views, view toggle |
| **UI Components** | 6 | Headers, cards, stats, buttons |
| **Filters & Search** | 5 | Dropdowns, filters, search |
| **Entity Management** | 5 | CRUD operations, entity-specific |

---

## 📦 Component Catalog

### Complete List (24 Components)

```typescript
src/components/management/
├── ActionButtons.tsx             // CRUD action buttons
├── BulkActionsToolbar.tsx        // Floating bulk operations toolbar
├── BulkDeleteConfirmModal.tsx    // Bulk delete confirmation
├── BulkSelectionBar.tsx          // Selection count bar
├── ConfirmDeleteModal.tsx        // Single delete confirmation
├── EmptyState.tsx                // Empty data state
├── EntityManager.tsx             // Generic entity CRUD
├── FilterControls.tsx            // Filter controls panel
├── FilterDropdown.tsx            // Generic filter dropdown
├── FilterSection.tsx             // Filter section wrapper
├── FloatingActionButton.tsx      // FAB with actions
├── FolderControls.tsx            // Expand/collapse folders
├── FolderView.tsx                // Grouped folder view
├── index.ts                      // Barrel export
├── ItemCard.tsx                  // Generic item card
├── LoadingSnackbar.tsx           // Top-right loading notification
├── MachineManager.tsx            // Machine-specific operations
├── ManagementPageHeader.tsx      // Page header with actions
├── PageHeader.tsx                // Simple page header
├── SearchAndFilter.tsx           // Combined search/filter
├── StatsCard.tsx                 // Statistics card
├── StatsGrid.tsx                 // Stats grid layout
├── StatusDropdown.tsx            // Status selection dropdown
├── StatusMessage.tsx             // Success/error messages
└── ViewModeToggle.tsx            // Folder/list toggle
```

---

## 🔄 Loading & Feedback Components

### 1. LoadingSnackbar

**Purpose**: Top-right loading notification with progress tracking for async operations

**Location**: `src/components/management/LoadingSnackbar.tsx`

**Props**:
```typescript
interface LoadingSnackbarProps {
  isVisible: boolean;        // Show/hide the snackbar
  message: string;           // Main message (e.g., "Adding farmer...")
  submessage?: string;       // Optional sub-message (e.g., "Please wait")
  progress?: number;         // 0-100 progress percentage
  showProgress?: boolean;    // Show/hide progress bar
}
```

**Features**:
- ✅ Fixed top-right positioning (z-index: 50)
- ✅ Progress bar with gradient (green → emerald)
- ✅ Percentage display
- ✅ FlowerSpinner animation
- ✅ Responsive design (min-w-320px, max-w-sm)
- ✅ Smooth slide-down animation
- ✅ Dark mode support

**Usage**:
```typescript
<LoadingSnackbar
  isVisible={isSubmitting || isDeletingBulk || isBulkUpdatingStatus}
  message={
    isSubmitting ? 'Adding farmer...' :
    isDeletingBulk ? 'Deleting farmers...' :
    'Updating farmers...'
  }
  submessage="Please wait"
  progress={updateProgress}
  showProgress
/>
```

**Use Cases**:
- ✅ Form submissions (add/edit operations)
- ✅ Bulk deletions with progress tracking
- ✅ Bulk status updates
- ✅ CSV uploads
- ✅ PDF generation
- ✅ Any async operation requiring user feedback

---

### 2. StatusMessage

**Purpose**: Success/error message display with auto-dismiss

**Location**: `src/components/management/StatusMessage.tsx`

**Props**:
```typescript
interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoDismiss?: boolean;
  duration?: number;  // Auto-dismiss duration in ms
}
```

**Features**:
- ✅ Color-coded by type (green, red, yellow, blue)
- ✅ Auto-dismiss timer
- ✅ Close button
- ✅ Icon indicators
- ✅ Slide-in animation

**Usage**:
```typescript
{success && (
  <StatusMessage 
    type="success" 
    message={success} 
    onClose={() => setSuccess('')}
    autoDismiss
    duration={3000}
  />
)}

{error && (
  <StatusMessage 
    type="error" 
    message={error} 
    onClose={() => setError('')}
  />
)}
```

---

## 🗑️ Bulk Operation Components

### 3. BulkDeleteConfirmModal

**Purpose**: Confirmation modal for bulk delete operations

**Location**: `src/components/management/BulkDeleteConfirmModal.tsx`

**Props**:
```typescript
interface BulkDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemType: string;        // 'farmer', 'BMC', 'society', etc.
  hasFilters?: boolean;    // Show "from filtered results" message
}
```

**Features**:
- ✅ Warning icon and red theme
- ✅ Item count display
- ✅ Filter awareness ("from filtered results")
- ✅ Disabled during deletion (handled by parent)
- ✅ Modal overlay (z-index: 50)
- ✅ Responsive mobile layout

**Usage**:
```typescript
<BulkDeleteConfirmModal
  isOpen={showBulkDeleteConfirm}
  onClose={() => setShowBulkDeleteConfirm(false)}
  onConfirm={handleBulkDelete}
  itemCount={selectedFarmers.size}
  itemType="farmer"
  hasFilters={statusFilter !== 'all' || societyFilter !== 'all'}
/>
```

**Note**: Loading state is handled by `LoadingSnackbar` in parent component, not in the modal itself.

---

### 4. BulkActionsToolbar

**Purpose**: Floating toolbar for bulk operations (delete, download, status update)

**Location**: `src/components/management/BulkActionsToolbar.tsx`

**Props**:
```typescript
interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  onBulkStatusUpdate?: (status: string) => void;
  onClearSelection?: () => void;
  itemType: string;
  showStatusUpdate?: boolean;
  currentBulkStatus?: string;
  onBulkStatusChange?: (status: string) => void;
}
```

**Features**:
- ✅ Fixed bottom-center positioning
- ✅ Selection count badge
- ✅ Status dropdown integration (StatusDropdown)
- ✅ Bulk delete, download, update actions
- ✅ Clear selection button (X icon)
- ✅ Responsive layout (hidden on small screens)
- ✅ Material Design shadow and elevation

**Usage**:
```typescript
{selectedFarmers.size > 0 && (
  <BulkActionsToolbar
    selectedCount={selectedFarmers.size}
    onBulkDelete={() => setShowBulkDeleteConfirm(true)}
    onBulkDownload={handleBulkDownload}
    onBulkStatusUpdate={handleBulkStatusUpdate}
    onClearSelection={() => setSelectedFarmers(new Set())}
    itemType="farmer"
    showStatusUpdate
    currentBulkStatus={bulkStatus}
    onBulkStatusChange={setBulkStatus}
  />
)}
```

---

### 5. BulkSelectionBar

**Purpose**: Selection count bar with clear all button

**Location**: `src/components/management/BulkSelectionBar.tsx`

**Props**:
```typescript
interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  itemType: string;
}
```

**Features**:
- ✅ Compact horizontal bar
- ✅ Selection count / total count
- ✅ Clear selection button
- ✅ Responsive text sizing

**Usage**:
```typescript
<BulkSelectionBar
  selectedCount={selectedFarmers.size}
  totalCount={filteredFarmers.length}
  onClearSelection={() => {
    setSelectedFarmers(new Set());
    setSelectAll(false);
  }}
  itemType="farmer"
/>
```

---

## 👁️ View Mode Components

### 6. ViewModeToggle

**Purpose**: Toggle between folder/grouped and list views

**Location**: `src/components/management/ViewModeToggle.tsx`

**Props**:
```typescript
interface ViewModeToggleProps {
  viewMode: 'folder' | 'list';
  onViewModeChange: (mode: 'folder' | 'list') => void;
  folderLabel?: string;
  listLabel?: string;
}
```

**Features**:
- ✅ Grid3x3 and List icons (from lucide-react)
- ✅ Active state highlighting
- ✅ Responsive labels (hidden on small screens: sm:inline)
- ✅ Material Design toggle style
- ✅ Dark mode support

**Usage**:
```typescript
<ViewModeToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  folderLabel="Grid View"
  listLabel="List View"
/>
```

**Localization Support**:
```typescript
<ViewModeToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  folderLabel={t.farmerManagement.gridView}
  listLabel={t.farmerManagement.listView}
/>
```

---

### 7. FolderView

**Purpose**: Generic grouped/folder view component for displaying items organized by groups

**Location**: `src/components/management/FolderView.tsx`

**Props**:
```typescript
interface FolderViewProps<T> {
  items: T[];
  groupByKey: keyof T;
  groupByLabel: string;
  groups: Array<{ id: number; name: string; identifier?: string }>;
  expandedGroups: Set<number>;
  selectedGroups: Set<number>;
  onToggleExpand: (groupId: number) => void;
  onToggleGroupSelection: (groupId: number, itemIds: number[]) => void;
  renderItem: (item: T) => React.ReactNode;
  getItemId: (item: T) => number;
  getGroupStats?: (groupId: number, items: T[]) => {
    total: number;
    active: number;
    inactive: number;
  };
  emptyMessage?: string;
}
```

**Features**:
- ✅ **Generic TypeScript** implementation (works with any entity type)
- ✅ Expandable folder groups
- ✅ Group-level checkboxes (select all in group)
- ✅ Stats display (active/inactive counts)
- ✅ Folder/FolderOpen icons (lucide-react)
- ✅ Responsive grid layout (1/2/3 columns)
- ✅ Empty state handling
- ✅ Smooth expand/collapse animations

**Usage**:
```typescript
<FolderView
  items={filteredFarmers}
  groupByKey="societyId"
  groupByLabel="Society"
  groups={societies.map(s => ({ 
    id: s.id, 
    name: s.societyName, 
    identifier: s.societyIdentifier 
  }))}
  expandedGroups={expandedSocieties}
  selectedGroups={selectedSocieties}
  onToggleExpand={(id) => {
    const newExpanded = new Set(expandedSocieties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSocieties(newExpanded);
  }}
  onToggleGroupSelection={(societyId, farmerIds) => {
    const newSelected = new Set(selectedFarmers);
    if (selectedSocieties.has(societyId)) {
      farmerIds.forEach(id => newSelected.delete(id));
    } else {
      farmerIds.forEach(id => newSelected.add(id));
    }
    setSelectedFarmers(newSelected);
  }}
  renderItem={(farmer) => (
    <FarmerCard 
      key={farmer.id} 
      farmer={farmer} 
      onEdit={() => handleEdit(farmer)}
      onDelete={() => handleDelete(farmer.id)}
    />
  )}
  getItemId={(farmer) => farmer.id}
  getGroupStats={(societyId, items) => {
    const societyFarmers = items.filter(f => f.societyId === societyId);
    return {
      total: societyFarmers.length,
      active: societyFarmers.filter(f => f.status === 'active').length,
      inactive: societyFarmers.filter(f => f.status !== 'active').length
    };
  }}
  emptyMessage="No farmers found"
/>
```

---

### 8. FolderControls

**Purpose**: Expand/collapse all folders controls

**Location**: `src/components/management/FolderControls.tsx`

**Props**:
```typescript
interface FolderControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  groupLabel: string;  // e.g., "Societies", "Machines"
}
```

**Features**:
- ✅ Expand All / Collapse All buttons
- ✅ ChevronDown / ChevronUp icons
- ✅ Responsive layout
- ✅ Dark mode support

**Usage**:
```typescript
<FolderControls
  onExpandAll={() => setExpandedSocieties(new Set(societies.map(s => s.id)))}
  onCollapseAll={() => setExpandedSocieties(new Set())}
  groupLabel="Societies"
/>
```

---

## 🎨 UI Components

### 9. ManagementPageHeader

**Purpose**: Comprehensive page header with title, subtitle, and action buttons

**Location**: `src/components/management/ManagementPageHeader.tsx`

**Props**:
```typescript
interface ManagementPageHeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  onUpload?: () => void;
  addLabel?: string;
  uploadLabel?: string;
  showRefresh?: boolean;
  showAdd?: boolean;
  showUpload?: boolean;
}
```

**Features**:
- ✅ Responsive title (text-xl → text-2xl → text-3xl)
- ✅ Subtitle with dark mode support
- ✅ Action buttons (Refresh, Add, Upload)
- ✅ Icon integration (RefreshCw, Plus, Upload)
- ✅ Hover states and transitions
- ✅ Flexible button visibility

**Usage**:
```typescript
<ManagementPageHeader
  title="Farmer Management"
  subtitle="Manage farmers and their information"
  onRefresh={loadFarmers}
  onAdd={() => setShowAddForm(true)}
  onUpload={() => setShowUploadModal(true)}
  addLabel="Add Farmer"
  uploadLabel="Upload CSV"
  showRefresh
  showAdd
  showUpload
/>
```

**Localization**:
```typescript
<ManagementPageHeader
  title={t.farmerManagement.title}
  subtitle={t.farmerManagement.subtitle}
  onRefresh={loadFarmers}
  onAdd={() => setShowAddForm(true)}
  onUpload={() => setShowUploadModal(true)}
  addLabel={t.farmerManagement.addFarmer}
  uploadLabel={t.farmerManagement.uploadCSV}
  showRefresh
  showAdd
  showUpload
/>
```

---

### 10. StatsCard

**Purpose**: Single statistics card with icon, label, and value

**Location**: `src/components/management/StatsCard.tsx`

**Props**:
```typescript
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}
```

**Features**:
- ✅ Color-coded backgrounds
- ✅ Large value display (text-2xl → text-3xl)
- ✅ Icon container with color matching
- ✅ Hover effect (lift and shadow)
- ✅ Optional click handler
- ✅ Responsive padding and sizing

**Usage**:
```typescript
<StatsCard
  icon={<Users className="w-6 h-6" />}
  label="Total Farmers"
  value={farmers.length}
  color="blue"
  onClick={() => setStatusFilter('all')}
/>

<StatsCard
  icon={<CheckCircle2 className="w-6 h-6" />}
  label="Active"
  value={activeFarmers}
  color="green"
  onClick={() => setStatusFilter('active')}
/>
```

---

### 11. StatsGrid

**Purpose**: Responsive grid layout for multiple stats cards

**Location**: `src/components/management/StatsGrid.tsx`

**Props**:
```typescript
interface StatsGridProps {
  children: React.ReactNode;
}
```

**Features**:
- ✅ Responsive grid (grid-cols-2 → grid-cols-3 → grid-cols-5)
- ✅ Consistent gap spacing (gap-4 → gap-6)
- ✅ Flexible child support
- ✅ Auto-adjusting columns

**Usage**:
```typescript
<StatsGrid>
  <StatsCard icon={<Users />} label="Total" value={100} color="blue" />
  <StatsCard icon={<CheckCircle2 />} label="Active" value={80} color="green" />
  <StatsCard icon={<XCircle />} label="Inactive" value={15} color="yellow" />
  <StatsCard icon={<AlertCircle />} label="Suspended" value={3} color="red" />
  <StatsCard icon={<Wrench />} label="Maintenance" value={2} color="purple" />
</StatsGrid>
```

---

### 12. EmptyState

**Purpose**: Display when no data is available or no search results

**Location**: `src/components/management/EmptyState.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}
```

**Features**:
- ✅ Centered layout
- ✅ Large icon (w-16 h-16 → w-20 h-20)
- ✅ Title and message text
- ✅ Optional action button
- ✅ Gray theme (empty/neutral state)
- ✅ Dark mode support

**Usage**:
```typescript
<EmptyState
  icon={<Users className="w-20 h-20" />}
  title="No farmers found"
  message="Get started by adding your first farmer"
  actionText="Add Farmer"
  onAction={() => setShowAddForm(true)}
/>
```

---

### 13. FloatingActionButton (FAB)

**Purpose**: Fixed bottom-right floating action button with action menu

**Location**: `src/components/management/FloatingActionButton.tsx`

**Props**:
```typescript
interface FloatingActionButtonProps {
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: 'primary' | 'secondary';
  }>;
  mainIcon?: React.ReactNode;
}
```

**Features**:
- ✅ Fixed bottom-right positioning (bottom-6 right-6)
- ✅ Expandable action menu
- ✅ Smooth animations (expand/collapse)
- ✅ Backdrop blur effect
- ✅ Material Design elevation
- ✅ Multiple action support

**Usage**:
```typescript
<FloatingActionButton
  actions={[
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Add Farmer',
      onClick: () => setShowAddForm(true),
      color: 'primary'
    },
    {
      icon: <Upload className="w-5 h-5" />,
      label: 'Upload CSV',
      onClick: () => setShowUploadModal(true),
      color: 'secondary'
    }
  ]}
  mainIcon={<Plus className="w-6 h-6" />}
/>
```

---

### 14. ItemCard

**Purpose**: Generic card component for displaying entity items

**Location**: `src/components/management/ItemCard.tsx`

**Props**:
```typescript
interface ItemCardProps {
  title: string;
  subtitle?: string;
  fields: Array<{ label: string; value: string | number }>;
  status?: {
    value: string;
    color: 'green' | 'yellow' | 'red' | 'gray';
  };
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: 'blue' | 'red' | 'green';
  }>;
  onSelect?: (selected: boolean) => void;
  isSelected?: boolean;
}
```

**Features**:
- ✅ Checkbox selection
- ✅ Status badge
- ✅ Field grid layout
- ✅ Action buttons
- ✅ Hover effects
- ✅ Responsive design

**Usage**:
```typescript
<ItemCard
  title={farmer.farmerName}
  subtitle={`ID: ${farmer.farmerId}`}
  fields={[
    { label: 'Contact', value: farmer.contactNumber || 'N/A' },
    { label: 'Society', value: farmer.societyName || 'Unassigned' },
    { label: 'Machine', value: farmer.machineName || 'Unassigned' }
  ]}
  status={{
    value: farmer.status,
    color: getStatusColor(farmer.status)
  }}
  actions={[
    {
      icon: <Edit2 />,
      label: 'Edit',
      onClick: () => handleEdit(farmer),
      color: 'blue'
    },
    {
      icon: <Trash2 />,
      label: 'Delete',
      onClick: () => handleDelete(farmer.id),
      color: 'red'
    }
  ]}
  onSelect={(selected) => handleSelection(farmer.id, selected)}
  isSelected={selectedFarmers.has(farmer.id)}
/>
```

---

## 🔍 Filter & Search Components

### 15. FilterDropdown

**Purpose**: Generic dropdown for filtering by entity attributes

**Location**: `src/components/management/FilterDropdown.tsx`

**Props**:
```typescript
interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; count?: number }>;
  label: string;
  icon?: React.ReactNode;
}
```

**Features**:
- ✅ Icon support
- ✅ Option count badges
- ✅ "All" option handling
- ✅ Dark mode support
- ✅ Responsive width

**Usage**:
```typescript
<FilterDropdown
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { value: 'all', label: 'All Statuses', count: farmers.length },
    { value: 'active', label: 'Active', count: activeFarmers },
    { value: 'inactive', label: 'Inactive', count: inactiveFarmers },
    { value: 'suspended', label: 'Suspended', count: suspendedFarmers }
  ]}
  label="Status"
  icon={<Filter className="w-4 h-4" />}
/>
```

---

### 16. StatusDropdown

**Purpose**: Status selection dropdown for entities (active, inactive, suspended, maintenance)

**Location**: `src/components/management/StatusDropdown.tsx`

**Props**:
```typescript
interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'compact';
}
```

**Features**:
- ✅ Pre-defined status options
- ✅ Color-coded status badges
- ✅ Compact variant for toolbars
- ✅ Default variant for forms
- ✅ Icon indicators

**Usage**:
```typescript
// In form
<StatusDropdown
  value={formData.status}
  onChange={(status) => setFormData({ ...formData, status })}
  variant="default"
/>

// In bulk toolbar
<StatusDropdown
  value={bulkStatus}
  onChange={setBulkStatus}
  variant="compact"
/>
```

---

### 17. FilterSection

**Purpose**: Wrapper component for filter controls section

**Location**: `src/components/management/FilterSection.tsx`

**Props**:
```typescript
interface FilterSectionProps {
  children: React.ReactNode;
  title?: string;
}
```

**Features**:
- ✅ Consistent filter section styling
- ✅ Optional title
- ✅ Flex layout for filters
- ✅ Responsive gap spacing

**Usage**:
```typescript
<FilterSection title="Filters">
  <FilterDropdown {...statusProps} />
  <FilterDropdown {...societyProps} />
  <FilterDropdown {...machineProps} />
</FilterSection>
```

---

### 18. SearchAndFilter

**Purpose**: Combined search input and filter controls

**Location**: `src/components/management/SearchAndFilter.tsx`

**Props**:
```typescript
interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterComponents: React.ReactNode;
  placeholder?: string;
}
```

**Features**:
- ✅ Search input with icon
- ✅ Clear button
- ✅ Filter section integration
- ✅ Responsive layout

**Usage**:
```typescript
<SearchAndFilter
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  placeholder="Search farmers..."
  filterComponents={
    <>
      <FilterDropdown {...statusProps} />
      <FilterDropdown {...societyProps} />
    </>
  }
/>
```

---

### 19. FilterControls

**Purpose**: Complete filter controls panel with search and filters

**Location**: `src/components/management/FilterControls.tsx`

**Props**:
```typescript
interface FilterControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: Array<{
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    label: string;
  }>;
  placeholder?: string;
}
```

**Features**:
- ✅ Integrated search and filters
- ✅ Dynamic filter generation
- ✅ Responsive grid layout
- ✅ Consistent styling

**Usage**:
```typescript
<FilterControls
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  filters={[
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
      label: 'Status'
    },
    {
      value: societyFilter,
      onChange: setSocietyFilter,
      options: societyOptions,
      label: 'Society'
    }
  ]}
  placeholder="Search farmers..."
/>
```

---

## 🛠️ Management Components

### 20. EntityManager

**Purpose**: Generic CRUD operations manager for entities

**Location**: `src/components/management/EntityManager.tsx`

**Props**:
```typescript
interface EntityManagerProps<T> {
  entity: T | null;
  onSave: (entity: T) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCancel: () => void;
  fields: Array<{
    key: keyof T;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
  entityType: string;
}
```

**Features**:
- ✅ Generic TypeScript implementation
- ✅ Form generation from field config
- ✅ Validation handling
- ✅ Loading states
- ✅ Error display

**Usage**:
```typescript
<EntityManager
  entity={selectedFarmer}
  onSave={handleSaveFarmer}
  onDelete={handleDeleteFarmer}
  onCancel={() => setSelectedFarmer(null)}
  fields={[
    { key: 'farmerName', label: 'Name', type: 'text', required: true },
    { key: 'farmerId', label: 'Farmer ID', type: 'text', required: true },
    { key: 'contactNumber', label: 'Contact', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ]}
  entityType="farmer"
/>
```

---

### 21. MachineManager

**Purpose**: Machine-specific operations and management

**Location**: `src/components/management/MachineManager.tsx`

**Props**:
```typescript
interface MachineManagerProps {
  machines: Machine[];
  onAssign: (machineId: number, farmerId: number) => Promise<void>;
  onUnassign: (machineId: number) => Promise<void>;
  onUpdatePassword: (machineId: number, password: string) => Promise<void>;
}
```

**Features**:
- ✅ Machine assignment
- ✅ Password management
- ✅ Status tracking
- ✅ Bulk operations

**Usage**:
```typescript
<MachineManager
  machines={machines}
  onAssign={handleAssignMachine}
  onUnassign={handleUnassignMachine}
  onUpdatePassword={handleUpdateMachinePassword}
/>
```

---

### 22. ActionButtons

**Purpose**: Standard CRUD action buttons for entity cards

**Location**: `src/components/management/ActionButtons.tsx`

**Props**:
```typescript
interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  variant?: 'default' | 'compact';
}
```

**Features**:
- ✅ Edit, Delete, View actions
- ✅ Icon buttons
- ✅ Compact variant
- ✅ Color-coded (blue edit, red delete, gray view)

**Usage**:
```typescript
<ActionButtons
  onEdit={() => handleEdit(farmer)}
  onDelete={() => handleDelete(farmer.id)}
  onView={() => router.push(`/admin/farmer/${farmer.id}`)}
  variant="default"
/>
```

---

### 23. ConfirmDeleteModal

**Purpose**: Single entity delete confirmation

**Location**: `src/components/management/ConfirmDeleteModal.tsx`

**Props**:
```typescript
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}
```

**Features**:
- ✅ Warning icon
- ✅ Entity name display
- ✅ Confirmation buttons
- ✅ Modal overlay

**Usage**:
```typescript
<ConfirmDeleteModal
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={confirmDelete}
  itemName={selectedFarmer?.farmerName || ''}
  itemType="farmer"
/>
```

---

### 24. PageHeader

**Purpose**: Simple page header with title only

**Location**: `src/components/management/PageHeader.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}
```

**Features**:
- ✅ Minimal design
- ✅ Responsive typography
- ✅ Dark mode support

**Usage**:
```typescript
<PageHeader
  title="Dashboard"
  subtitle="Overview of your operations"
/>
```

---

## 📘 Usage Patterns

### Pattern 1: Complete Entity Management Page

```typescript
'use client';

import {
  ManagementPageHeader,
  StatsGrid,
  StatsCard,
  FilterControls,
  ViewModeToggle,
  FolderView,
  LoadingSnackbar,
  BulkActionsToolbar,
  BulkDeleteConfirmModal,
  EmptyState,
  FloatingActionButton
} from '@/components/management';

export default function FarmerManagementPage() {
  // State management
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('list');
  const [selectedFarmers, setSelectedFarmers] = useState<Set<number>>(new Set());
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Operation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Loading Snackbar */}
      <LoadingSnackbar
        isVisible={isSubmitting || isDeletingBulk}
        message={isSubmitting ? 'Adding farmer...' : 'Deleting farmers...'}
        submessage="Please wait"
        progress={updateProgress}
        showProgress
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ManagementPageHeader
          title="Farmer Management"
          subtitle="Manage farmers and their information"
          onRefresh={loadFarmers}
          onAdd={() => setShowAddForm(true)}
          onUpload={() => setShowUploadModal(true)}
          showRefresh
          showAdd
          showUpload
        />
        
        {/* Stats */}
        <StatsGrid>
          <StatsCard icon={<Users />} label="Total" value={farmers.length} color="blue" />
          <StatsCard icon={<CheckCircle2 />} label="Active" value={activeFarmers} color="green" />
          {/* More stats... */}
        </StatsGrid>
        
        {/* Filters & View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <FilterControls
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filterConfigs}
          />
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
        
        {/* Data Display */}
        {filteredFarmers.length === 0 ? (
          <EmptyState
            title="No farmers found"
            message="Get started by adding your first farmer"
            actionText="Add Farmer"
            onAction={() => setShowAddForm(true)}
          />
        ) : viewMode === 'folder' ? (
          <FolderView {...folderViewProps} />
        ) : (
          <div className="grid gap-4">
            {filteredFarmers.map(farmer => (
              <FarmerCard key={farmer.id} farmer={farmer} />
            ))}
          </div>
        )}
      </div>
      
      {/* Bulk Actions Toolbar */}
      {selectedFarmers.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedFarmers.size}
          onBulkDelete={() => setShowBulkDeleteConfirm(true)}
          itemType="farmer"
        />
      )}
      
      {/* Bulk Delete Confirmation */}
      <BulkDeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedFarmers.size}
        itemType="farmer"
      />
      
      {/* FAB */}
      <FloatingActionButton
        actions={[
          { icon: <Plus />, label: 'Add Farmer', onClick: () => setShowAddForm(true) }
        ]}
      />
    </div>
  );
}
```

---

### Pattern 2: Localized Management Page

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function LocalizedFarmerPage() {
  const { t } = useLanguage();
  
  return (
    <>
      <ManagementPageHeader
        title={t.farmerManagement.title}
        subtitle={t.farmerManagement.subtitle}
        addLabel={t.farmerManagement.addFarmer}
      />
      
      <LoadingSnackbar
        isVisible={isSubmitting}
        message={t.farmerManagement.addingFarmer}
        submessage={t.farmerManagement.pleaseWait}
      />
      
      <ViewModeToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        folderLabel={t.farmerManagement.gridView}
        listLabel={t.farmerManagement.listView}
      />
    </>
  );
}
```

---

## 🔗 Integration Guide

### Step 1: Import Components

```typescript
import {
  ManagementPageHeader,
  LoadingSnackbar,
  StatsGrid,
  StatsCard,
  BulkActionsToolbar,
  BulkDeleteConfirmModal,
  ViewModeToggle,
  FolderView
} from '@/components/management';
```

### Step 2: Set Up State

```typescript
// Data state
const [items, setItems] = useState<T[]>([]);
const [loading, setLoading] = useState(true);

// UI state
const [viewMode, setViewMode] = useState<'folder' | 'list'>('list');
const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

// Filter state
const [statusFilter, setStatusFilter] = useState('all');
const [searchQuery, setSearchQuery] = useState('');

// Operation state
const [isSubmitting, setIsSubmitting] = useState(false);
const [updateProgress, setUpdateProgress] = useState(0);
```

### Step 3: Implement Handlers

```typescript
const handleBulkDelete = async () => {
  setIsDeletingBulk(true);
  const selectedList = Array.from(selectedItems);
  
  let completed = 0;
  for (const id of selectedList) {
    await deleteItem(id);
    completed++;
    setUpdateProgress((completed / selectedList.length) * 100);
  }
  
  setIsDeletingBulk(false);
  setSelectedItems(new Set());
  loadItems();
};
```

### Step 4: Render Components

```typescript
return (
  <>
    <LoadingSnackbar
      isVisible={isSubmitting || isDeletingBulk}
      message={isSubmitting ? 'Saving...' : 'Deleting...'}
      progress={updateProgress}
      showProgress
    />
    
    <ManagementPageHeader {...headerProps} />
    <StatsGrid>{statsCards}</StatsGrid>
    {/* More components... */}
  </>
);
```

---

## 📊 Component Statistics

### Total Components: 24

| Category | Count | Components |
|----------|-------|-----------|
| **Loading & Feedback** | 2 | LoadingSnackbar, StatusMessage |
| **Bulk Operations** | 3 | BulkDeleteConfirmModal, BulkActionsToolbar, BulkSelectionBar |
| **View Modes** | 3 | ViewModeToggle, FolderView, FolderControls |
| **UI Components** | 6 | ManagementPageHeader, StatsCard, StatsGrid, EmptyState, FloatingActionButton, ItemCard |
| **Filters & Search** | 5 | FilterDropdown, StatusDropdown, FilterSection, SearchAndFilter, FilterControls |
| **Entity Management** | 5 | EntityManager, MachineManager, ActionButtons, ConfirmDeleteModal, PageHeader |

### Lines of Code

| Component | Lines | Complexity |
|-----------|-------|-----------|
| LoadingSnackbar | 67 | Low |
| BulkDeleteConfirmModal | 67 | Low |
| BulkActionsToolbar | 120+ | Medium |
| ViewModeToggle | 80+ | Low |
| FolderView | 250+ | High |
| ManagementPageHeader | 100+ | Medium |

**Total Library Size**: ~2,500 lines of reusable component code

---

## ✅ Benefits

### Code Reusability
- ✅ **DRY Principle**: Extract once, use everywhere
- ✅ **Consistency**: Same UI/UX across all management pages
- ✅ **Maintainability**: Update in one place, reflect everywhere

### Development Speed
- ✅ **Faster Development**: Build new pages in minutes, not hours
- ✅ **Less Boilerplate**: No repetitive code
- ✅ **Focus on Logic**: Spend time on business logic, not UI

### Quality
- ✅ **Tested**: Components battle-tested in production
- ✅ **Accessible**: WCAG 2.1 compliant
- ✅ **Responsive**: Works on all devices
- ✅ **Type-Safe**: Full TypeScript support

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **Virtualized Lists**: Handle 10,000+ items efficiently
- [ ] **Advanced Filtering**: Multi-select, date ranges, numeric ranges
- [ ] **Export Templates**: Pre-configured export templates
- [ ] **Theming System**: Multiple color themes
- [ ] **Animation Library**: Standardized animations
- [ ] **Accessibility Improvements**: Enhanced screen reader support

### Component Additions
- [ ] **DataTable**: Advanced table with sorting, filtering, pagination
- [ ] **ChartComponents**: Reusable chart components
- [ ] **FormBuilder**: Dynamic form generation
- [ ] **WizardFlow**: Multi-step form wizard

---

## 📚 Related Documentation

- [Farmer Management Implementation](../04-features/FARMER_MANAGEMENT_IMPLEMENTATION.md)
- [Farmer Refactoring Summary](../../FARMER_REFACTORING_SUMMARY.md)
- [Localization Implementation](../04-features/LOCALIZATION_IMPLEMENTATION.md)
- [Architecture Guide](../02-architecture/ARCHITECTURE.md)

---

**Last Updated**: November 6, 2025  
**Maintained By**: PSR-v4 Development Team  
**Version**: 1.0.0
