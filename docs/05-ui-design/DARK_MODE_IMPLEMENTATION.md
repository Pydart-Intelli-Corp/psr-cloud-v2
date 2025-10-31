# Dark Mode Implementation Guide

## Overview
Complete dark mode system implementation for Poornasree Equipments Cloud application using Tailwind CSS dark mode classes and React Context API.

## Architecture

### 1. Theme Context (`src/contexts/ThemeContext.tsx`)
Centralized theme management with localStorage persistence and system preference detection.

**Features**:
- `theme` state: 'light' | 'dark'
- `toggleTheme()`: Switch between themes
- `setTheme(theme)`: Set specific theme
- Auto-load from localStorage
- Respects system preferences on first visit
- Persists theme selection across sessions

**Usage**:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function Component() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### 2. Tailwind Configuration (`tailwind.config.js`)
Enabled class-based dark mode:
```js
module.exports = {
  darkMode: 'class', // Uses .dark class on <html> element
  // ... rest of config
}
```

### 3. Root Layout (`src/app/layout.tsx`)
Wrapped application with ThemeProvider:
```tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </body>
</html>
```

### 4. Theme Toggle Component (`src/components/ThemeToggle.tsx`)
Reusable button with animated icon transitions:
- Sun icon for light mode
- Moon icon for dark mode
- Smooth rotation animations
- Accessible with aria-label and title

## Dark Mode Class Pattern

### Standard Elements
Apply dark mode styles using Tailwind's `dark:` variant:

```tsx
// Background colors
className="bg-white dark:bg-gray-900"

// Text colors
className="text-gray-900 dark:text-gray-100"

// Border colors
className="border-gray-200 dark:border-gray-700"

// Hover states
className="hover:bg-gray-100 dark:hover:bg-gray-800"

// Combined example
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
```

### Component Patterns

#### Cards
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
  <h3 className="text-gray-900 dark:text-gray-100">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

#### Buttons
```tsx
// Primary button
<button className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
  Primary Action
</button>

// Secondary button
<button className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
  Secondary Action
</button>
```

#### Inputs
```tsx
<input
  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
  placeholder="Enter text..."
/>
```

#### Modals/Overlays
```tsx
<div className="fixed inset-0 bg-black/50 dark:bg-black/70">
  <div className="bg-white dark:bg-gray-900 rounded-xl">
    {/* Modal content */}
  </div>
</div>
```

## Color Scheme Reference

### Light Mode
- **Background**: white (#ffffff)
- **Surface**: gray-50 (#f9fafb)
- **Border**: gray-200 (#e5e7eb)
- **Text Primary**: gray-900 (#111827)
- **Text Secondary**: gray-600 (#4b5563)
- **Text Muted**: gray-500 (#6b7280)

### Dark Mode
- **Background**: gray-900 (#111827)
- **Surface**: gray-800 (#1f2937)
- **Border**: gray-700 (#374151)
- **Text Primary**: gray-100 (#f3f4f6)
- **Text Secondary**: gray-300 (#d1d5db)
- **Text Muted**: gray-400 (#9ca3af)

### Brand Colors (Same in Both Modes)
- **Primary Green**: green-600 (#16a34a)
- **Emerald**: emerald-600 (#059669)
- **Teal**: teal-600 (#0d9488)

## Implementation Checklist

### Core Infrastructure ✅
- [x] ThemeContext created
- [x] ThemeProvider integrated in root layout
- [x] Tailwind dark mode enabled
- [x] ThemeToggle component created
- [x] localStorage persistence
- [x] System preference detection

### Components to Update

#### Layout Components
- [ ] **Sidebar** (`src/components/layout/Sidebar.tsx`)
  - Navigation items
  - Logo container
  - Collapse button
  - Logout button
  
- [x] **Header** (`src/components/layout/Header.tsx`)
  - Main container
  - Search bar
  - Notification bell
  - Profile dropdown
  - Theme toggle integrated

- [ ] **DashboardLayout** (`src/components/layout/DashboardLayout.tsx`)
  - Main container
  - Content area

#### Page Components
- [ ] **Landing Page** (`src/components/LandingPage.tsx`)
  - Hero section
  - Feature cards
  - Testimonials
  - Footer
  
- [ ] **Login Page** (`src/app/(auth)/login/page.tsx`)
  - Form container
  - Input fields
  - Buttons
  
- [ ] **Admin Dashboard** (`src/app/admin/dashboard/page.tsx`)
  - Stats cards
  - Entity lists
  - Modals
  
- [ ] **Dairy Management** (`src/app/admin/dairy/page.tsx`)
  - Dairy cards
  - Form modals
  - Search/filter bars

#### Shared Components
- [ ] **FlowerSpinner** (`src/components/FlowerSpinner.tsx`)
  - Petal colors
  
- [ ] **Forms** (`src/components/forms/`)
  - AddEntityModal
  - Input components
  
- [ ] **Cards** (various)
  - All card components

## Update Guidelines

### Step-by-Step Process

1. **Identify Background Elements**
   ```tsx
   // Before
   className="bg-white"
   
   // After
   className="bg-white dark:bg-gray-900"
   ```

2. **Update Text Colors**
   ```tsx
   // Before
   className="text-gray-900"
   
   // After
   className="text-gray-900 dark:text-gray-100"
   ```

3. **Update Borders**
   ```tsx
   // Before
   className="border-gray-200"
   
   // After
   className="border-gray-200 dark:border-gray-700"
   ```

4. **Update Hover States**
   ```tsx
   // Before
   className="hover:bg-gray-100"
   
   // After
   className="hover:bg-gray-100 dark:hover:bg-gray-800"
   ```

5. **Test Both Modes**
   - Toggle theme and verify all elements are visible
   - Check contrast ratios
   - Ensure brand colors remain consistent

## Best Practices

### 1. Consistent Color Usage
- Always pair background with appropriate text color
- Use same shade level for both modes (e.g., gray-200 → gray-700)
- Maintain brand color consistency

### 2. Accessibility
- Ensure sufficient contrast ratios (WCAG AA: 4.5:1)
- Test with screen readers
- Provide clear visual feedback

### 3. Performance
- Avoid inline styles for theme colors
- Use Tailwind classes for better tree-shaking
- Leverage CSS custom properties for complex scenarios

### 4. User Experience
- Persist theme choice in localStorage
- Respect system preferences on first visit
- Smooth transitions between themes
- Clear toggle indicator

## Advanced Features

### 1. Theme-Specific Images
```tsx
<Image 
  src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
  alt="Logo"
/>
```

### 2. Conditional Rendering
```tsx
{theme === 'dark' ? (
  <DarkModeComponent />
) : (
  <LightModeComponent />
)}
```

### 3. CSS Variables
```css
/* globals.css */
:root {
  --color-bg: #ffffff;
  --color-text: #111827;
}

.dark {
  --color-bg: #111827;
  --color-text: #f3f4f6;
}
```

## Testing Checklist

### Visual Testing
- [ ] All text is readable in both modes
- [ ] No invisible elements (text on same-color background)
- [ ] Images/icons visible in both modes
- [ ] Proper contrast for interactive elements
- [ ] Shadows visible but not overwhelming
- [ ] Gradients work in both modes

### Functional Testing
- [ ] Theme toggle works
- [ ] Theme persists on page reload
- [ ] System preference detected on first visit
- [ ] Theme applies to all pages
- [ ] Modals/popups styled correctly
- [ ] Forms maintain usability

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Migration Strategy

### Phase 1: Core Infrastructure ✅
- ThemeContext
- Root layout integration
- Tailwind configuration
- ThemeToggle component

### Phase 2: Layout Components (Current)
- Sidebar
- Header ✅
- DashboardLayout

### Phase 3: Page Components
- Landing page
- Auth pages
- Dashboard pages

### Phase 4: Shared Components
- Forms
- Modals
- Cards
- Buttons

### Phase 5: Testing & Polish
- Visual QA
- Accessibility audit
- Performance optimization
- Documentation updates

## Component Update Template

```tsx
// Before
export default function ComponentName() {
  return (
    <div className="bg-white border border-gray-200">
      <h1 className="text-gray-900">Title</h1>
      <p className="text-gray-600">Description</p>
      <button className="bg-green-600 hover:bg-green-700 text-white">
        Action
      </button>
    </div>
  );
}

// After
export default function ComponentName() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <h1 className="text-gray-900 dark:text-gray-100">Title</h1>
      <p className="text-gray-600 dark:text-gray-400">Description</p>
      <button className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
        Action
      </button>
    </div>
  );
}
```

## Troubleshooting

### Theme Not Applying
1. Check ThemeProvider is in root layout
2. Verify `suppressHydrationWarning` on `<html>` tag
3. Check dark class is being added to `<html>` element
4. Ensure Tailwind dark mode is set to 'class'

### Flash of Unstyled Content
1. Use `suppressHydrationWarning` on html tag
2. Initialize theme from localStorage in useState
3. Apply theme class before first render

### Performance Issues
1. Avoid excessive re-renders
2. Use memo for expensive components
3. Optimize theme application logic

## Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Next.js Themes](https://nextjs.org/docs/pages/building-your-application/configuring/theme)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Next Steps

1. Update Sidebar component with dark mode styles
2. Update DashboardLayout component
3. Update all page components systematically
4. Add dark mode support to custom components
5. Test thoroughly in both modes
6. Optimize performance
7. Update user documentation

---

**Status**: Core infrastructure complete, component updates in progress
**Last Updated**: Current Session
**Maintained By**: Development Team
