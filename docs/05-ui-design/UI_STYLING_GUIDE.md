# PSR-V4 UI Styling Guide

## Overview
This document outlines the comprehensive styling system for the Poornasree Equipments Cloud application, including global CSS classes, best practices, and solutions to common issues.

---

## Global CSS Classes

### 1. Input Fields

#### Basic Input
```tsx
<input className="psr-input" />
```

**Features:**
- Automatic light/dark mode support
- Reduced placeholder opacity (gray-300 light, gray-600 dark)
- Green focus ring
- Autofill-safe styling
- Forced text colors to prevent browser override

**Properties:**
- Light mode: White background (#ffffff), dark text (#111827)
- Dark mode: Dark gray background (#1f2937), light text (#f3f4f6)
- Placeholder: Light gray with reduced opacity
- Focus: Green border with subtle ring

#### Textarea
```tsx
<textarea className="psr-textarea" />
```

Same features as `psr-input` with resize disabled.

---

### 2. Select Dropdowns

#### Basic Select
```tsx
<select className="psr-select">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

**Features:**
- Forced background/text colors for both select and options
- Light/dark mode support
- Green focus ring
- Consistent styling across all browsers

**Usage Note:** Always add explicit classes to option elements:
```tsx
<select className="psr-select">
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    Option 1
  </option>
</select>
```

---

### 3. Buttons

#### Primary Button
```tsx
<button className="psr-button-primary">
  Add Dairy
</button>
```
- Green gradient background
- White text
- Hover effects
- Shadow with green tint

#### Secondary Button
```tsx
<button className="psr-button-secondary">
  Cancel
</button>
```
- White/gray background
- Border
- Subtle hover effect

#### Danger Button
```tsx
<button className="psr-button-danger">
  Delete
</button>
```
- Red background
- White text
- Hover effects

---

### 4. Modals

#### Modal Structure
```tsx
<div className="psr-modal-overlay">
  <div className="psr-modal-content">
    {/* Modal content */}
  </div>
</div>
```

**Features:**
- Fixed positioning (z-index: 9999)
- Dark overlay (50% black light, 70% black dark)
- Centered content
- Scrollable content area
- Auto-closes on overlay click

**Important:** Place modals outside main content containers using React Fragments:
```tsx
return (
  <>
    <div className="main-content">
      {/* Page content */}
    </div>
    
    {/* Modal outside main container */}
    {showModal && (
      <div className="psr-modal-overlay">
        <div className="psr-modal-content">
          {/* Content */}
        </div>
      </div>
    )}
  </>
);
```

---

### 5. Search Inputs

```tsx
<input type="search" className="psr-search" />
```

**Features:**
- Icon-ready padding
- White/dark background
- Forced text colors
- Autofill-safe

---

### 6. Cards

```tsx
<div className="psr-card">
  {/* Card content */}
</div>
```

**Features:**
- White background with border
- Shadow effects
- Hover shadow increase
- Green border on hover

---

## Common Issues & Solutions

### Issue 1: Placeholder Text Too Dark
**Problem:** Placeholder text has same color as input text

**Solution:**
```tsx
// Use global psr-input class (already fixed)
<input className="psr-input" />

// OR add explicit placeholder classes
<input className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600" />
```

---

### Issue 2: Autofill White Text on White Background
**Problem:** Browser autofill makes text unreadable

**Solution:**
All `psr-input` classes handle this automatically. For custom inputs:
```css
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset !important;
  -webkit-text-fill-color: #111827 !important;
  color: #111827 !important;
}

.dark input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #1f2937 inset !important;
  -webkit-text-fill-color: #f3f4f6 !important;
  color: #f3f4f6 !important;
}
```

**Best Practice:**
```tsx
// Add autocomplete control and text color override
<input 
  className="psr-input !text-gray-900 dark:!text-gray-100"
  autoComplete="off"
/>
```

---

### Issue 3: Modal Overlay Not Covering Full Screen
**Problem:** Modal overlay stops at container boundaries

**Solution:**
1. Use React Fragment to render modal outside main container
2. Apply `psr-modal-overlay` class (already has fixed positioning)
3. Add inline styles as backup:
```tsx
<div 
  className="psr-modal-overlay"
  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
>
```

---

### Issue 4: Search Bar Turns Black in Light Mode
**Problem:** Search input background turns black when focused

**Solution:**
```tsx
<input
  type="search"
  className="psr-search !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100"
/>
```

Always use `!important` flags for forced colors.

---

### Issue 5: Dropdown Options Have Dark Background in Light Mode
**Problem:** Select options appear with dark background

**Solution:**
```tsx
<select className="psr-select">
  {/* Add explicit classes to each option */}
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    Option 1
  </option>
</select>
```

---

### Issue 6: ID Prefix Not Auto-Applied
**Problem:** Need to manually type "D-" for dairy ID

**Solution:**
```tsx
const handleInputChange = (field: string, value: string) => {
  // Auto-prefix dairy ID with "D-"
  if (field === 'dairyId') {
    const cleanValue = value.replace(/^D-/i, '');
    value = `D-${cleanValue}`;
  }
  
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

---

### Issue 7: API Returns snake_case, Frontend Expects camelCase
**Problem:** Database returns `dairy_id` but TypeScript expects `dairyId`

**Solution:**
Map columns in SQL query:
```typescript
const [results] = await sequelize.query(`
  SELECT 
    id,
    dairy_id as dairyId,
    contact_person as contactPerson,
    created_at as createdAt,
    updated_at as updatedAt
  FROM dairy_farms
`);
```

---

### Issue 8: Invalid Date Display
**Problem:** Shows "Invalid Date" in UI

**Solution:**
```tsx
<span>
  {dairy.createdAt 
    ? new Date(dairy.createdAt).toLocaleDateString() 
    : 'N/A'
  }
</span>
```

Always check for null/undefined before creating Date objects.

---

### Issue 9: Blue Colors in Dropdowns (Browser Native Styling)
**Problem:** Native browser dropdown shows blue highlight on hover that cannot be overridden with CSS

**Solution:**
Use `accent-color` property to change browser's default highlight color:
```css
select {
  accent-color: #059669 !important; /* emerald-600 */
  color-scheme: light;
}

.dark select {
  accent-color: #10b981 !important; /* emerald-500 */
  color-scheme: dark;
}
```

**Note:** Browser native dropdown hover colors are controlled by the OS/browser and cannot be fully styled with CSS. The `accent-color` property provides partial control in modern browsers. For complete control over all colors including hover states, use custom dropdown components instead of native `<select>`.

---

### Issue 10: Blue/Purple Colors Throughout Application
**Problem:** Purple/blue colors appearing in scrollbars, role badges, and UI elements

**Solution:**
Changed all blue/purple color references to green palette:

**Scrollbar Gradient:**
```css
/* Before */
background: linear-gradient(180deg, #6750a4, #7c4dff);

/* After */
background: linear-gradient(180deg, #059669, #10b981);
```

**Role-Dairy Badge:**
```css
/* Before */
background: linear-gradient(135deg, #4834d4, #686de0);

/* After */
background: linear-gradient(135deg, #059669, #10b981);
```

**Dark Theme Inverse Primary:**
```css
/* Before */
--md-sys-color-inverse-primary: #6750a4;

/* After */
--md-sys-color-inverse-primary: #059669;
```

**Info Badge:**
```css
/* Before */
@apply bg-blue-100 text-blue-800;

/* After */
@apply bg-emerald-100 text-emerald-800;
```

**Focus States for All Forms:**
```css
input:focus, textarea:focus, select:focus {
  border-color: #059669 !important;
  outline: 2px solid #059669 !important;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
}
```

---

## Best Practices

### 1. Form Inputs
✅ **DO:**
- Use `psr-input` class for all text inputs
- Add `autoComplete="off"` for sensitive fields
- Use `!text-gray-900 dark:!text-gray-100` for text color override
- Add placeholder classes explicitly if needed

❌ **DON'T:**
- Use generic Tailwind classes without dark mode variants
- Rely on browser default autofill styles
- Forget to handle null/undefined values

### 2. Select Dropdowns
✅ **DO:**
- Use `psr-select` class
- Add explicit classes to option elements
- Use `!important` flags for critical colors

❌ **DON'T:**
- Use `bg-gray-50` for light mode (too dark)
- Forget option element styling

### 3. Modals
✅ **DO:**
- Render outside main container using fragments
- Use `psr-modal-overlay` and `psr-modal-content` classes
- Add click-to-close on overlay
- Stop propagation on modal content

❌ **DON'T:**
- Render modal inside padded containers
- Use z-index lower than 9999
- Forget exit animations

### 4. Date Handling
✅ **DO:**
- Map database timestamps to camelCase in API
- Add null checks before Date conversion
- Provide fallback values ("N/A", "Not set", etc.)

❌ **DON'T:**
- Directly use `new Date()` without validation
- Leave "Invalid Date" visible to users

### 5. API Responses
✅ **DO:**
- Map snake_case to camelCase in SQL queries
- Add default values for optional fields
- Include status fields even if static

❌ **DON'T:**
- Return raw database column names
- Assume all fields exist

---

## Component Templates

### Basic Form
```tsx
<form onSubmit={handleSubmit}>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Field Name
    </label>
    <input
      type="text"
      className="psr-input !text-gray-900 dark:!text-gray-100"
      placeholder="Enter value"
      autoComplete="off"
      required
    />
  </div>
  
  <button type="submit" className="psr-button-primary">
    Submit
  </button>
</form>
```

### Modal Form
```tsx
{showModal && (
  <div 
    className="psr-modal-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowModal(false);
    }}
  >
    <div 
      className="psr-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">Modal Title</h2>
      </div>
      
      <div className="p-6">
        {/* Form content */}
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button 
          className="psr-button-secondary"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button className="psr-button-primary">
          Submit
        </button>
      </div>
    </div>
  </div>
)}
```

### Filter Dropdown
```tsx
<select 
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="psr-select !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-gray-100"
>
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    All
  </option>
  <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    Active
  </option>
</select>
```

---

## Color Reference

### Light Mode
- Background: `#ffffff` (white)
- Text: `#111827` (gray-900)
- Border: `#d1d5db` (gray-300)
- Placeholder: `#d1d5db` (gray-300)
- Primary: `#059669` (green-600)

### Dark Mode
- Background: `#1f2937` (gray-800)
- Text: `#f3f4f6` (gray-100)
- Border: `#4b5563` (gray-600)
- Placeholder: `#6b7280` (gray-500)
- Primary: `#10b981` (green-500)

---

## Migration Checklist

When adding new forms/pages:

- [ ] All inputs use `psr-input` or custom with `!text-gray-900 dark:!text-gray-100`
- [ ] All selects use `psr-select` with option styling
- [ ] All buttons use `psr-button-*` classes
- [ ] Modals use `psr-modal-*` classes and render outside containers
- [ ] Date fields have null checks and fallbacks
- [ ] API responses map snake_case to camelCase
- [ ] Autocomplete attributes added where needed
- [ ] Placeholder colors explicitly defined
- [ ] Dark mode variants included for all custom styles
- [ ] Touch targets meet 44x44px minimum

---

## Testing Checklist

Before deployment:

- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test browser autofill (Chrome, Firefox, Safari)
- [ ] Test select dropdowns in both modes
- [ ] Test modal overlay on different screen sizes
- [ ] Test form validation and error states
- [ ] Test with empty/null database values
- [ ] Test responsive breakpoints (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

---

## Version History

- **v1.0.0** (Oct 25, 2025) - Initial styling guide created
  - Global CSS classes for inputs, selects, buttons, modals
  - Comprehensive autofill solutions
  - Dark mode support throughout
  - Common issue solutions documented
