# PSR-V4 Quick Reference Guide

**Last Updated**: October 25, 2025

---

## 🚀 Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run migrations
node scripts/migrate.mjs
```

---

## Common CSS Classes - Quick Copy/Paste

### Input Fields
```tsx
// Text Input
<input className="psr-input !text-gray-900 dark:!text-gray-100" autoComplete="off" />

// Password Input
<input type="password" className="psr-input !text-gray-900 dark:!text-gray-100" autoComplete="new-password" />

// Number Input
<input type="number" className="psr-input !text-gray-900 dark:!text-gray-100" autoComplete="off" />

// Email Input
<input type="email" className="psr-input !text-gray-900 dark:!text-gray-100" autoComplete="off" />

// Textarea
<textarea className="psr-textarea !text-gray-900 dark:!text-gray-100" />
```

### Select Dropdowns
```tsx
<select className="psr-select !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-gray-100">
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Option 1</option>
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Option 2</option>
</select>
```

### Buttons
```tsx
// Primary
<button className="psr-button-primary">Action</button>

// Secondary
<button className="psr-button-secondary">Cancel</button>

// Danger
<button className="psr-button-danger">Delete</button>
```

### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
  <input 
    type="search" 
    className="psr-search !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100"
    placeholder="Search..."
  />
</div>
```

### Modal
```tsx
{showModal && (
  <div className="psr-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
    <div className="psr-modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Content */}
    </div>
  </div>
)}
```

---

## Common Patterns

### Auto-Prefix Input (like D-001)
```tsx
const handleInputChange = (field: string, value: string) => {
  if (field === 'dairyId') {
    const cleanValue = value.replace(/^D-/i, '');
    value = `D-${cleanValue}`;
  }
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

### Date Display with Fallback
```tsx
{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
```

### API Column Mapping
```sql
SELECT 
  id,
  dairy_id as dairyId,
  contact_person as contactPerson,
  created_at as createdAt
FROM table_name
```

---

## 📱 Mobile-First Responsive Patterns

### Container with Progressive Padding
```tsx
<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
```

### Responsive Typography
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
<p className="text-sm sm:text-base lg:text-lg">
```

### Responsive Grid (1 → 2 → 4 columns)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

### Icon-Only Mobile, Text Desktop
```tsx
<button className="w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2">
  <Icon className="w-5 h-5" />
  <span className="hidden sm:inline ml-2">Text</span>
</button>
```

### Horizontal Scrolling Tabs
```tsx
<div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap gap-2 -mx-4 px-4">
  {/* Tab items */}
</div>
```

### Touch Targets (44px minimum)
```tsx
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
```

---

## 🌙 Dark Mode Patterns

### Basic Element
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Card Component
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
```

### Input Field
```tsx
<input className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
```

---

## 🌐 Multi-Language (i18n)

### Using Translations
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return <h1>{t.admin.dashboard.title}</h1>;
}
```

### Language Switcher
```tsx
import { languages, type Language } from '@/contexts/LanguageContext';

<select 
  value={language}
  onChange={(e) => setLanguage(e.target.value as Language)}
  className="psr-select"
>
  {Object.entries(languages).map(([code, config]) => (
    <option key={code} value={code}>
      {config.flag} {config.nativeName}
    </option>
  ))}
</select>
```

---

## 🏢 Status Management Patterns

### Status Display Component
```tsx
// Safe status display with capitalization and fallback
{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
```

### Status Color System
```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    case 'inactive':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
    case 'maintenance':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};
```

### Status Change Handler
```tsx
const handleStatusChange = async (item: any, newStatus: 'active' | 'inactive' | 'maintenance') => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/user/entity', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: item.id,
        name: item.name, // Required field
        // Include all existing fields to avoid partial updates
        ...item,
        status: newStatus
      })
    });

    if (response.ok) {
      setSuccess(`Status updated to ${newStatus}!`);
      await fetchData(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    } else {
      const errorResponse = await response.json();
      setError(errorResponse.error || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    setError('Failed to update status');
    setTimeout(() => setError(''), 5000);
  }
};
```

### Status Filter Dropdown
```tsx
<select 
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="psr-select"
>
  <option value="all">All Status</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="maintenance">Maintenance</option>
</select>
```

### Database Schema Pattern
```sql
-- Status column with proper ENUM and indexing
`status` ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
INDEX `idx_status` (`status`)
```

---

## 📱 Profile UI Responsive Patterns

### Desktop Dropdown Structure
```tsx
{/* Desktop/Tablet: Simple dropdown */}
<div className="hidden lg:block relative">
  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
    <div className="p-2 space-y-1">
      {/* Essential actions only */}
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center space-x-2">
        <User className="w-4 h-4" />
        <span>Profile</span>
      </button>
    </div>
  </div>
</div>
```

### Mobile Right-Side Drawer
```tsx
{/* Mobile: Right-side sliding drawer */}
<div className="lg:hidden">
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          duration: 0.3
        }}
        className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Full navigation content */}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

## Color Palette Quick Reference

```tsx
// Light Mode
bg-white           // #ffffff
text-gray-900      // #111827
border-gray-300    // #d1d5db

// Dark Mode  
dark:bg-gray-800   // #1f2937
dark:text-gray-100 // #f3f4f6
dark:border-gray-600 // #4b5563

// Primary Green
bg-green-600       // #059669
text-green-600     // #059669
```

---

## Troubleshooting One-Liners

| Issue | Quick Fix |
|-------|-----------|
| White text on white background | Add `!text-gray-900 dark:!text-gray-100` |
| Dark dropdown in light mode | Add `!bg-white dark:!bg-gray-900` |
| Placeholder too dark | Already fixed in `psr-input` |
| Modal doesn't cover screen | Use `psr-modal-overlay` and render outside container |
| Invalid Date showing | Add `{value ? new Date(value).toLocaleDateString() : 'N/A'}` |
| Autofill makes text invisible | Already fixed in `psr-input` |

---

## 📚 Key Documentation Links

### Must-Read Guides
- **[NEW_SCREEN_DEVELOPMENT_PROTOCOL.md](NEW_SCREEN_DEVELOPMENT_PROTOCOL.md)** - ⭐ Complete guide for building new screens
- [MOBILE_RESPONSIVE_DESIGN_GUIDE.md](MOBILE_RESPONSIVE_DESIGN_GUIDE.md) - Mobile-first design system
- [DARK_MODE_IMPLEMENTATION.md](DARK_MODE_IMPLEMENTATION.md) - Dark mode patterns
- [UI_STYLING_GUIDE.md](UI_STYLING_GUIDE.md) - Global CSS classes and styling
- [PSR_COLOR_SYSTEM_IMPLEMENTATION.md](PSR_COLOR_SYSTEM_IMPLEMENTATION.md) - Color palette

### Workflow Guides
- [DEVELOPER_RESPONSIVE_WORKFLOW.md](DEVELOPER_RESPONSIVE_WORKFLOW.md) - Responsive development workflow
- [DAILY_WORKFLOW.md](DAILY_WORKFLOW.md) - Daily development workflow

### Reference
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File structure
- [FEATURES.md](FEATURES.md) - Complete feature list
- [UPDATE_LOG.md](UPDATE_LOG.md) - Development changelog

---

## Must-Have Imports
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
```

---

## Standard Form Structure
```tsx
<form onSubmit={handleSubmit} className="p-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Field Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        className="psr-input !text-gray-900 dark:!text-gray-100"
        placeholder="Enter value"
        autoComplete="off"
        required
      />
    </div>
  </div>
  
  <div className="flex justify-end gap-3 mt-6">
    <button type="button" className="psr-button-secondary">
      Cancel
    </button>
    <button type="submit" className="psr-button-primary">
      Submit
    </button>
  </div>
</form>
```
