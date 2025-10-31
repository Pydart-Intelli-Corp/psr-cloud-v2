# Mobile Responsive Design Guide

## Overview
This guide outlines the mobile-first responsive design system for the Poornasree Equipments Cloud application. All components and screens must follow these guidelines to ensure consistent, responsive behavior across all devices.

## Design Philosophy

### Mobile-First Approach
- **Start with mobile** (320px width minimum)
- **Progressive enhancement** for larger screens
- **Touch-friendly** interfaces (minimum 44px touch targets)
- **Performance-optimized** for mobile networks

## Breakpoint System

### Standard Breakpoints (Tailwind CSS)
```javascript
{
  'sm': '640px',   // Small tablets (portrait)
  'md': '768px',   // Tablets (portrait)
  'lg': '1024px',  // Tablets (landscape) / Small laptops
  'xl': '1280px',  // Laptops / Desktops
  '2xl': '1536px'  // Large desktops
}
```

### Usage Pattern
```tsx
// Mobile-first: Base styles are for mobile
<div className="
  p-4           // Mobile: 16px padding
  sm:p-6        // Tablet: 24px padding
  lg:p-8        // Desktop: 32px padding
">
```

## Layout Patterns

### 1. Container Patterns

#### Dashboard Layout
```tsx
// Mobile: Stack vertically, full width
// Desktop: Sidebar + Content
<div className="flex flex-col lg:flex-row min-h-screen">
  {/* Sidebar */}
  <aside className="
    fixed bottom-0 left-0 right-0    // Mobile: Bottom nav
    lg:static lg:w-64                // Desktop: Side nav
  ">
    {/* Navigation */}
  </aside>
  
  {/* Main Content */}
  <main className="
    flex-1 
    pb-20 lg:pb-0                    // Mobile: Space for bottom nav
    p-4 sm:p-6 lg:p-8                // Responsive padding
  ">
    {/* Content */}
  </main>
</div>
```

#### Page Content
```tsx
<div className="
  p-4 sm:p-6 lg:p-8                  // Responsive padding
  space-y-4 sm:space-y-6             // Responsive spacing
  max-w-7xl mx-auto                  // Center content on large screens
">
  {/* Page content */}
</div>
```

### 2. Grid Patterns

#### Stats Cards
```tsx
<div className="
  grid 
  grid-cols-1          // Mobile: Single column
  sm:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-4       // Desktop: 4 columns
  gap-4 sm:gap-6       // Responsive gap
">
  {/* Cards */}
</div>
```

#### Content Cards
```tsx
<div className="
  grid 
  grid-cols-1                // Mobile: Single column
  md:grid-cols-2             // Medium: 2 columns
  xl:grid-cols-3             // Large: 3 columns
  gap-4 sm:gap-6             // Responsive gap
">
  {/* Cards */}
</div>
```

### 3. Typography

#### Heading Scales
```tsx
// H1
<h1 className="
  text-2xl sm:text-3xl lg:text-4xl  // Responsive size
  font-bold
  text-gray-900 dark:text-gray-100
">

// H2
<h2 className="
  text-xl sm:text-2xl lg:text-3xl
  font-semibold
">

// H3
<h3 className="
  text-lg sm:text-xl lg:text-2xl
  font-semibold
">

// Body
<p className="
  text-sm sm:text-base              // Responsive body text
  text-gray-600 dark:text-gray-400
">
```

### 4. Navigation Patterns

#### Desktop: Sidebar Navigation
```tsx
<aside className="
  hidden lg:flex                     // Hidden on mobile
  lg:w-64 lg:flex-col
  bg-white dark:bg-gray-800
">
  {/* Desktop sidebar */}
</aside>
```

#### Mobile: Bottom Navigation
```tsx
<nav className="
  fixed bottom-0 left-0 right-0      // Mobile bottom bar
  lg:hidden                          // Hide on desktop
  bg-white dark:bg-gray-800
  border-t border-gray-200
  safe-area-pb                       // Account for iPhone notch
">
  <div className="
    flex justify-around
    px-2 py-3
  ">
    {/* Nav items */}
  </div>
</nav>
```

### 5. Form Patterns

#### Form Layout
```tsx
<form className="space-y-4 sm:space-y-6">
  {/* Single column on mobile, 2 columns on desktop */}
  <div className="
    grid grid-cols-1 md:grid-cols-2
    gap-4 sm:gap-6
  ">
    <div>
      <label className="
        block text-sm font-medium
        mb-2
      ">
        {/* Label */}
      </label>
      <input className="
        w-full
        px-3 py-2 sm:px-4 sm:py-3    // Responsive padding
        text-sm sm:text-base          // Responsive text
        rounded-lg
      " />
    </div>
  </div>
</form>
```

#### Input Fields
```tsx
<input className="
  w-full
  px-3 py-2.5 sm:px-4 sm:py-3        // Touch-friendly height
  text-sm sm:text-base
  border border-gray-300
  rounded-lg
  focus:ring-2 focus:ring-green-500
  transition-all
" />
```

### 6. Modal Patterns

#### Responsive Modal
```tsx
<motion.div className="
  fixed inset-0
  bg-black/50
  flex items-end sm:items-center      // Bottom on mobile, center on desktop
  justify-center
  z-50
  p-0 sm:p-4                          // No padding on mobile
">
  <motion.div className="
    bg-white dark:bg-gray-800
    w-full sm:max-w-lg md:max-w-2xl   // Full width mobile, max width desktop
    max-h-[90vh]
    overflow-y-auto
    rounded-t-2xl sm:rounded-xl        // Rounded top mobile, all sides desktop
  ">
    {/* Modal content */}
  </motion.div>
</motion.div>
```

### 7. Button Patterns

#### Primary Button
```tsx
<button className="
  w-full sm:w-auto                   // Full width mobile, auto desktop
  px-4 py-2.5 sm:px-6 sm:py-3       // Responsive padding
  text-sm sm:text-base               // Responsive text
  font-medium
  rounded-lg
  transition-all
">
```

#### Action Buttons (Header)
```tsx
{/* Mobile-optimized header buttons */}
<div className="
  flex flex-col xs:flex-row 
  gap-1.5 xs:gap-2 sm:gap-3 
  w-full sm:w-auto
">
  <button className="
    w-full xs:w-auto 
    flex items-center justify-center 
    px-2.5 xs:px-3 sm:px-4 
    py-1.5 xs:py-2 sm:py-2 
    text-xs xs:text-sm sm:text-sm 
    font-medium
    bg-green-100 dark:bg-green-900/30
    text-green-700 dark:text-green-300
    border border-green-300 dark:border-green-600
    rounded-md xs:rounded-lg
    hover:bg-green-200 dark:hover:bg-green-900/50
    transition-colors
  ">
    <Upload className="w-3 h-3 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
    <span className="xs:inline">Upload CSV</span>
  </button>
</div>
```

#### Button Group
```tsx
<div className="
  flex flex-col sm:flex-row          // Stack mobile, row desktop
  gap-3 sm:gap-4
  w-full sm:w-auto
">
  <button className="w-full sm:w-auto">Cancel</button>
  <button className="w-full sm:w-auto">Submit</button>
</div>
```

### 8. Filter Controls

#### Professional Filter Layout
```tsx
<div className="
  flex flex-col sm:flex-row gap-3 sm:gap-0 
  sm:items-center sm:justify-between 
  bg-white dark:bg-gray-800 
  p-3 sm:p-4 
  rounded-lg sm:rounded-xl 
  border border-gray-200 dark:border-gray-700
">
  {/* Info Section */}
  <div className="
    flex flex-col sm:flex-row sm:items-center 
    space-y-1 sm:space-y-0 sm:space-x-2 
    text-xs sm:text-sm text-gray-600 dark:text-gray-400
  ">
    <div className="flex items-center space-x-2">
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>Showing {count} results</span>
    </div>
  </div>
  
  {/* Filter Controls */}
  <div className="
    flex flex-col sm:flex-row 
    items-start sm:items-center 
    gap-2 sm:gap-3
  ">
    {/* Status Filter */}
    <div className="flex items-center space-x-2">
      <label className="text-xs sm:text-sm font-medium">Status:</label>
      <select className="
        px-2 sm:px-3 py-1.5 sm:py-2 
        text-xs sm:text-sm
        bg-white dark:bg-gray-900 
        border rounded-lg
        min-w-[100px] sm:min-w-[120px]
      ">
        <option>All Status</option>
      </select>
    </div>
    
    {/* Machine Filter */}
    <div className="flex items-center space-x-2">
      <label className="text-xs sm:text-sm font-medium">Machine:</label>
      <select className="
        px-2 sm:px-3 py-1.5 sm:py-2 
        text-xs sm:text-sm
        bg-white dark:bg-gray-900 
        border rounded-lg
        min-w-[120px] sm:min-w-[150px]
      ">
        <option>All Machines</option>
        <option>Unassigned</option>
      </select>
    </div>
  </div>
</div>
```

### 9. Table Patterns

#### Responsive Table (Card View on Mobile)
```tsx
{/* Desktop: Table */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>

{/* Mobile: Card list */}
<div className="md:hidden space-y-4">
  {items.map(item => (
    <div className="
      bg-white dark:bg-gray-800
      p-4 rounded-lg
      border border-gray-200
    ">
      {/* Card content */}
    </div>
  ))}
</div>
```

## Component Guidelines

### 1. Card Components
```tsx
export function Card({ children, className = '' }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg sm:rounded-xl
      p-4 sm:p-6
      shadow-sm hover:shadow-md
      transition-all
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### 2. Icon Sizing
```tsx
// Mobile: Smaller icons
// Desktop: Standard icons
<Icon className="
  w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6
" />
```

### 3. Spacing
```tsx
// Consistent spacing scale
space-y-2 sm:space-y-3    // Tight spacing
space-y-4 sm:space-y-6    // Normal spacing
space-y-6 sm:space-y-8    // Loose spacing
```

## Accessibility

### Touch Targets
- **Minimum size**: 44×44px (iOS) / 48×48px (Android)
- **Recommended**: 48×48px for all interactive elements

```tsx
<button className="
  min-h-[44px] sm:min-h-auto        // Ensure minimum touch target
  px-4 py-2.5
">
```

### Safe Areas (iOS Notch)
```css
/* Add to globals.css */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-pt {
  padding-top: env(safe-area-inset-top);
}
```

## Performance

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={false}  // Set true for above-fold images
/>
```

### Lazy Loading
```tsx
'use client';
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <FlowerSpinner />,
  ssr: false  // Disable SSR for client-only components
});
```

## Testing Checklist

### Device Testing
- [ ] iPhone SE (375×667) - Smallest modern mobile
- [ ] iPhone 13 Pro (390×844) - Standard mobile
- [ ] iPad (768×1024) - Tablet portrait
- [ ] iPad Pro (1024×1366) - Tablet landscape
- [ ] Desktop (1920×1080) - Standard desktop

### Viewport Meta Tag
```html
<!-- Already in layout.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

## Common Patterns Quick Reference

### Hide on Mobile, Show on Desktop
```tsx
className="hidden lg:block"
```

### Hide on Desktop, Show on Mobile
```tsx
className="lg:hidden"
```

### Responsive Flex Direction
```tsx
className="flex flex-col lg:flex-row"
```

### Responsive Text Alignment
```tsx
className="text-center sm:text-left"
```

### Responsive Width
```tsx
className="w-full sm:w-auto"
```

### Responsive Positioning
```tsx
// Mobile: Fixed bottom
// Desktop: Static sidebar
className="fixed bottom-0 lg:static"
```

## Dark Mode Considerations

Always include dark mode variants:
```tsx
className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
"
```

## Animation Performance

Use CSS transforms for smooth animations:
```tsx
// Good: Hardware accelerated
className="transform transition-transform hover:scale-105"

// Avoid: Paint-heavy
className="transition-all hover:margin-left-4"
```

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Implementation Examples

### Dairy Detail Screen (Reference Implementation)

The dairy detail screen (`src/app/admin/dairy/[id]/page.tsx`) serves as a complete example of mobile-responsive design following all protocols:

#### Header Section
```tsx
{/* Mobile: Stack layout, Desktop: Row layout */}
<div className="px-4 sm:px-6 py-3 sm:py-4">
  <div className="flex flex-col gap-3 sm:gap-4">
    {/* Back button with touch target */}
    <button className="p-2 rounded-lg min-h-[44px] min-w-[44px]">
      <ArrowLeft className="w-5 h-5" />
    </button>
    
    {/* Title with responsive text */}
    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
      {dairy.name}
    </h1>
    
    {/* Action buttons - Icon only on mobile, text on desktop */}
    <button className="px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px]">
      <Edit3 className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">Edit</span>
    </button>
  </div>
</div>
```

#### Tabs with Horizontal Scroll
```tsx
{/* Horizontal scroll on mobile, normal on desktop */}
<div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
  <div className="flex gap-1 sm:gap-2 min-w-max sm:min-w-0">
    {tabs.map(tab => (
      <button className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base whitespace-nowrap">
        <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm">{tab.label}</span>
      </button>
    ))}
  </div>
</div>
```

#### Statistics Cards
```tsx
{/* 1 column mobile, 2 columns tablet */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600">Connected BMCs</p>
        <p className="text-2xl sm:text-3xl font-bold">{count}</p>
      </div>
      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
    </div>
  </div>
</div>
```

#### Contact Information
```tsx
{/* Single column stack on mobile */}
<div className="grid grid-cols-1 gap-3 sm:gap-4">
  <div className="flex items-start gap-3">
    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm text-gray-600">Location</p>
      <p className="text-sm sm:text-base font-medium break-words">{location}</p>
    </div>
  </div>
</div>
```

#### Key Features Implemented
- ✅ 44px minimum touch targets
- ✅ Mobile-first breakpoints (base → sm → md → lg)
- ✅ Horizontal scrolling tabs with `scrollbar-hide`
- ✅ Responsive typography (text-xs → text-sm → text-base → text-lg)
- ✅ Responsive spacing (gap-2 → gap-3 → gap-4)
- ✅ Responsive padding (p-3 → p-4 → p-6)
- ✅ Icon-only buttons on mobile, full text on desktop
- ✅ Truncation and word-breaking for long text
- ✅ `flex-shrink-0` for icons to prevent squishing
- ✅ `flex-1 min-w-0` for flexible text containers
- ✅ Success/error messages responsive to screen width
- ✅ Bottom padding for mobile nav (pb-20 lg:pb-8)

### Updated CSS Utilities

The following utilities are available in `globals.css`:

```css
/* Hide scrollbar while allowing scroll */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Safe area for notched devices */
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.safe-area-pl { padding-left: env(safe-area-inset-left); }
.safe-area-pr { padding-right: env(safe-area-inset-right); }

/* Touch target minimum */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

