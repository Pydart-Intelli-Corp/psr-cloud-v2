# New Screen Development Protocol

**Poornasree Equipments Cloud - Screen Development Guide**  
*Version: 1.0.0 | Last Updated: October 25, 2025*

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Development Checklist](#pre-development-checklist)
3. [Project Architecture](#project-architecture)
4. [Design System](#design-system)
5. [Mobile-First Responsive Design](#mobile-first-responsive-design)
6. [Theme & Dark Mode](#theme--dark-mode)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Component Development](#component-development)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Reusable Components](#reusable-components)
12. [Testing & Validation](#testing--validation)
13. [Code Examples](#code-examples)

---

## Overview

This protocol document provides comprehensive guidelines for developing new screens in the PSR-v4 application. Follow these standards to ensure consistency, maintainability, and adherence to project design principles.

### Core Principles
- **Mobile-First**: Design for mobile, enhance for desktop
- **Responsive**: Adapt to all screen sizes (320px - 2560px+)
- **Accessible**: WCAG 2.1 AA compliance, 44px touch targets
- **Themeable**: Full dark mode support
- **International**: Multi-language support (English, Hindi, Malayalam)
- **Performant**: Optimized loading, lazy loading, code splitting

---

## Pre-Development Checklist

Before starting any new screen development:

### 1. Requirements Analysis
- [ ] Define user role access (SuperAdmin, Admin, Dairy, BMC, Society, Farmer)
- [ ] Identify required data/API endpoints
- [ ] List all user interactions and workflows
- [ ] Determine CRUD operations needed
- [ ] Define success/error states

### 2. Design Review
- [ ] Review existing similar screens for consistency
- [ ] Check color system documentation (`PSR_COLOR_SYSTEM_IMPLEMENTATION.md`)
- [ ] Review mobile responsive guide (`MOBILE_RESPONSIVE_DESIGN_GUIDE.md`)
- [ ] Verify dark mode patterns (`DARK_MODE_IMPLEMENTATION.md`)
- [ ] Check UI styling guide (`UI_STYLING_GUIDE.md`)

### 3. Technical Setup
- [ ] Determine route structure (App Router convention)
- [ ] Identify reusable components
- [ ] Plan state management approach
- [ ] Define TypeScript interfaces
- [ ] Plan error handling strategy

---

## Project Architecture

### Technology Stack
```
Frontend:
├── Next.js 15 (App Router)
├── React 19 (Client Components)
├── TypeScript 5
├── Tailwind CSS 3
└── Framer Motion (Animations)

Backend:
├── Node.js / Express.js
├── MySQL (Azure with SSL)
├── Sequelize ORM
└── JWT Authentication

Styling:
├── Material Design 3 Principles
├── PSR Green/Emerald/Teal Theme
├── Dark Mode Support
└── Mobile-First Responsive
```

### Directory Structure
```
src/
├── app/
│   ├── (auth)/           # Auth routes (login, register, etc.)
│   ├── admin/            # Admin role routes
│   ├── dairy/            # Dairy role routes
│   ├── bmc/              # BMC role routes
│   ├── society/          # Society role routes
│   ├── farmer/           # Farmer role routes
│   └── api/              # API routes
│
├── components/
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── forms/            # Form components
│   ├── management/       # Entity management components
│   └── auth/             # Authentication components
│
├── contexts/
│   ├── LanguageContext.tsx    # i18n context
│   └── ThemeContext.tsx       # Dark mode context
│
├── lib/
│   ├── database.ts       # Database utilities
│   ├── auth.ts           # Auth utilities
│   └── emailService.ts   # Email utilities
│
├── models/               # Sequelize models
├── types/                # TypeScript types
└── locales/              # Translation files
    ├── en.ts             # English
    ├── hi.ts             # Hindi
    └── ml.ts             # Malayalam
```

### Route Naming Convention
```
✅ CORRECT:
/admin/dairy              # List page
/admin/dairy/[id]         # Detail page
/admin/dairy/create       # Create page
/admin/dairy/[id]/edit    # Edit page

❌ INCORRECT:
/admin/dairyList
/admin/dairy-detail/123
/admin/addDairy
```

---

## Design System

### Color Palette

#### Primary Colors (PSR Green Theme)
```typescript
// From globals.css - Use these CSS variables
--md-sys-color-primary: #059669           // Green-600
--md-sys-color-secondary: #0d9488         // Teal-600
--md-sys-color-tertiary: #16a34a          // Green-700

// Gradients
--psr-gradient-primary: linear-gradient(135deg, #059669 0%, #10b981 50%, #0d9488 100%)
--psr-gradient-secondary: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #059669 100%)
```

#### Tailwind Usage
```tsx
// Primary Actions
className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"

// Secondary Actions
className="bg-gradient-to-r from-teal-600 to-cyan-600"

// Hover States
className="hover:from-green-700 hover:via-emerald-700 hover:to-green-800"
```

#### Role-Based Colors
```tsx
const roleColors = {
  'Super Admin': 'from-green-600 to-emerald-600',
  'Admin': 'from-green-500 to-emerald-500',
  'Dairy': 'from-teal-600 to-cyan-600',
  'BMC': 'from-emerald-600 to-green-600',
  'Society': 'from-green-700 to-teal-700',
  'Farmer': 'from-emerald-500 to-green-500'
};
```

### Typography Scale
```tsx
// Headings - Progressive sizing
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
<h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
<h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">

// Body Text
<p className="text-sm sm:text-base">                    // Regular
<p className="text-xs sm:text-sm">                      // Small
<span className="text-gray-600 dark:text-gray-400">    // Muted
```

### Spacing System
```tsx
// Container Padding - Progressive enhancement
className="p-4 sm:p-6 lg:p-8"           // Page containers
className="px-3 py-2 sm:px-4 sm:py-3"   // Form inputs
className="space-y-4 sm:space-y-6"      // Vertical spacing
className="gap-4 sm:gap-6"              // Grid gaps
```

### Shadow & Elevation
```tsx
className="shadow-sm"                    // Subtle elevation
className="shadow-md"                    // Standard cards
className="shadow-lg shadow-green-500/25" // Buttons/CTAs
className="shadow-xl"                    // Modals/overlays
```

---

## Mobile-First Responsive Design

### Breakpoints (Tailwind CSS)
```javascript
{
  'base': '0px',      // Mobile (default, no prefix)
  'sm': '640px',      // Tablet portrait
  'md': '768px',      // Tablet landscape
  'lg': '1024px',     // Desktop
  'xl': '1280px',     // Large desktop
  '2xl': '1536px'     // Extra large desktop
}
```

### Layout Patterns

#### 1. Page Container
```tsx
<div className="
  min-h-screen
  p-4 sm:p-6 lg:p-8              // Progressive padding
  space-y-4 sm:space-y-6         // Vertical spacing
  max-w-7xl mx-auto              // Center on large screens
">
  {/* Page content */}
</div>
```

#### 2. Header Section
```tsx
<div className="
  flex flex-col sm:flex-row       // Stack mobile, row desktop
  items-start sm:items-center     // Align items
  justify-between
  gap-3 sm:gap-4                  // Responsive gap
  mb-6 sm:mb-8
">
  {/* Title */}
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">
    {title}
  </h1>
  
  {/* Actions */}
  <div className="
    flex flex-wrap
    gap-2 sm:gap-3
    w-full sm:w-auto               // Full width mobile
  ">
    {/* Buttons */}
  </div>
</div>
```

#### 3. Grid Layouts
```tsx
// Statistics Cards (1 → 2 → 4 columns)
<div className="
  grid
  grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-4       // Desktop: 4 columns
  gap-4 sm:gap-6
">

// Content Cards (1 → 2 → 3 columns)
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  gap-4 sm:gap-6
">

// Information Display (Single column mobile)
<div className="
  grid
  grid-cols-1          // Always single column
  gap-3 sm:gap-4
">
```

#### 4. Navigation Patterns
```tsx
// Desktop Sidebar (Hidden on mobile)
<aside className="
  hidden lg:flex              // Show only on desktop
  lg:w-64
  flex-col
  bg-white dark:bg-gray-800
">

// Mobile Bottom Navigation
<nav className="
  fixed bottom-0 left-0 right-0
  lg:hidden                   // Hide on desktop
  bg-white dark:bg-gray-800
  border-t border-gray-200 dark:border-gray-700
  safe-area-pb                // iOS notch support
">
```

#### 5. Touch Targets
```tsx
// Minimum 44px for all interactive elements
<button className="
  min-h-[44px]                // Minimum height
  min-w-[44px]                // Minimum width
  px-4 py-2
">

// Icon-only buttons
<button className="
  w-10 h-10 sm:w-auto sm:h-auto  // Fixed size mobile, auto desktop
  p-2 sm:px-4 sm:py-2
">
  <Icon className="w-5 h-5" />
  <span className="hidden sm:inline ml-2">Text</span>
</button>
```

#### 6. Horizontal Scrolling (Tabs/Tags)
```tsx
<div className="
  flex
  overflow-x-auto
  scrollbar-hide              // Custom utility - hide scrollbar
  whitespace-nowrap
  gap-2
  -mx-4 px-4                  // Bleed to edges
">
  {/* Tab items */}
</div>
```

### Custom CSS Utilities
```css
/* Add to globals.css if not present */

/* Hide scrollbars */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* iOS Safe Area Support */
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.safe-area-pl { padding-left: env(safe-area-inset-left); }
.safe-area-pr { padding-right: env(safe-area-inset-right); }

/* Touch Targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Responsive Testing Checklist
- [ ] iPhone SE (375×667) - Smallest modern mobile
- [ ] iPhone 13 Pro (390×844) - Standard mobile
- [ ] iPad (768×1024) - Tablet portrait
- [ ] iPad Pro (1024×1366) - Large tablet
- [ ] Desktop (1920×1080) - Standard desktop
- [ ] Large Desktop (2560×1440) - QHD/4K

---

## Theme & Dark Mode

### Implementation Pattern

#### 1. Theme Context Usage
```tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function MyScreen() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Content */}
    </div>
  );
}
```

#### 2. Color Classes
```tsx
// Backgrounds
className="bg-white dark:bg-gray-900"              // Page background
className="bg-gray-50 dark:bg-gray-800"            // Surface/cards
className="bg-gray-100 dark:bg-gray-700"           // Secondary surface

// Text
className="text-gray-900 dark:text-gray-100"      // Primary text
className="text-gray-600 dark:text-gray-400"      // Secondary text
className="text-gray-500 dark:text-gray-500"      // Muted text

// Borders
className="border-gray-200 dark:border-gray-700"  // Default border
className="border-gray-300 dark:border-gray-600"  // Stronger border

// Hover States
className="hover:bg-gray-100 dark:hover:bg-gray-800"

// Form Elements
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
```

#### 3. Component Pattern
```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl
      shadow-sm
      p-4 sm:p-6
    ">
      {children}
    </div>
  );
}
```

#### 4. Dark Mode Best Practices
- **Always pair**: Background with text color
- **Test contrast**: Ensure readability in both modes
- **Icons**: Use currentColor for automatic adaptation
- **Images**: Consider separate dark mode variants if needed
- **Shadows**: Reduce or remove in dark mode

```tsx
// Good contrast pairing
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// Icons adapt automatically
<Icon className="text-green-600 dark:text-green-500" />

// Conditional shadows
<div className="shadow-lg dark:shadow-none">
```

---

## Internationalization (i18n)

### Language System Architecture

#### 1. Supported Languages
- **English** (en) - Default
- **Hindi** (hi) - हिन्दी
- **Malayalam** (ml) - മലയാളം

#### 2. Context Usage
```tsx
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function MyScreen() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t.admin.dashboard.title}</h1>
      <p>{t.admin.dashboard.welcome}</p>
    </div>
  );
}
```

#### 3. Translation File Structure
```typescript
// src/locales/en.ts
export const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    loading: 'Loading...',
    success: 'Success!',
    error: 'Error occurred'
  },
  admin: {
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome to Admin Dashboard',
      statistics: {
        totalDairies: 'Total Dairies',
        activeBMCs: 'Active BMCs',
        totalSocieties: 'Total Societies'
      }
    },
    dairy: {
      title: 'Dairy Management',
      addNew: 'Add New Dairy',
      editDairy: 'Edit Dairy',
      deleteDairy: 'Delete Dairy',
      confirmDelete: 'Are you sure you want to delete this dairy?'
    }
  }
} as const;

export type TranslationKeys = typeof en;
```

#### 4. Adding New Translations

**Step 1**: Update `src/locales/en.ts`
```typescript
export const en = {
  // ... existing translations
  myNewScreen: {
    title: 'My New Screen',
    subtitle: 'Screen description',
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Enter name...',
      submitButton: 'Submit'
    }
  }
};
```

**Step 2**: Update `src/locales/hi.ts`
```typescript
export const hi = {
  // ... existing translations
  myNewScreen: {
    title: 'मेरी नई स्क्रीन',
    subtitle: 'स्क्रीन विवरण',
    form: {
      nameLabel: 'नाम',
      namePlaceholder: 'नाम दर्ज करें...',
      submitButton: 'जमा करें'
    }
  }
};
```

**Step 3**: Update `src/locales/ml.ts`
```typescript
export const ml = {
  // ... existing translations
  myNewScreen: {
    title: 'എൻ്റെ പുതിയ സ്ക്രീൻ',
    subtitle: 'സ്ക്രീൻ വിവരണം',
    form: {
      nameLabel: 'പേര്',
      namePlaceholder: 'പേര് നൽകുക...',
      submitButton: 'സമർപ്പിക്കുക'
    }
  }
};
```

#### 5. Usage in Components
```tsx
function MyNewScreen() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t.myNewScreen.title}</h1>
      <p>{t.myNewScreen.subtitle}</p>
      
      <form>
        <label>{t.myNewScreen.form.nameLabel}</label>
        <input placeholder={t.myNewScreen.form.namePlaceholder} />
        <button>{t.myNewScreen.form.submitButton}</button>
      </form>
    </div>
  );
}
```

#### 6. Language Switcher
```tsx
import { useLanguage, languages, type Language } from '@/contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
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
  );
}
```

---

## Component Development

### 1. File Structure Template
```tsx
'use client'; // Required for client components

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Icon1, Icon2 } from 'lucide-react';
import { motion } from 'framer-motion';

// TypeScript interfaces
interface MyScreenProps {
  userId: number;
  mode?: 'view' | 'edit';
}

interface DataType {
  id: number;
  name: string;
  // ... other fields
}

export default function MyScreen({ userId, mode = 'view' }: MyScreenProps) {
  // Hooks
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, [userId]);
  
  // Handlers
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data/${userId}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAction = () => {
    // Action logic
  };
  
  // Render conditions
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  // Main render
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Content */}
    </div>
  );
}
```

### 2. Component Naming Conventions
```
✅ CORRECT:
- DairyManagement.tsx
- UserProfile.tsx
- StatisticsCard.tsx

❌ INCORRECT:
- dairy-management.tsx
- user_profile.tsx
- statisticscard.tsx
```

### 3. Props Pattern
```tsx
// Define clear interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// Use destructuring with defaults
export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = ''
}: ButtonProps) {
  // Component logic
}
```

---

## State Management

### 1. Local State (useState)
```tsx
// Simple component state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

// Form handling
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
```

### 2. Side Effects (useEffect)
```tsx
// Fetch data on mount
useEffect(() => {
  fetchData();
}, []);

// Fetch when dependency changes
useEffect(() => {
  if (userId) {
    fetchUserData(userId);
  }
}, [userId]);

// Cleanup
useEffect(() => {
  const subscription = subscribeToUpdates();
  return () => subscription.unsubscribe();
}, []);
```

### 3. Complex State (useReducer)
```tsx
interface State {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: DataType[] }
  | { type: 'FETCH_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Usage
const [state, dispatch] = useReducer(reducer, {
  data: [],
  loading: false,
  error: null
});
```

---

## API Integration

### 1. API Route Structure
```typescript
// src/app/api/dairy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Dairy } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await verifyToken(token);
    
    // Fetch data
    const dairies = await Dairy.findAll({
      where: { adminId: user.id }
    });
    
    return NextResponse.json({ dairies });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create record
    const dairy = await Dairy.create(body);
    
    return NextResponse.json(
      { dairy, message: 'Dairy created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create dairy' },
      { status: 500 }
    );
  }
}
```

### 2. Client-Side API Calls
```tsx
// GET request
async function fetchDairies() {
  try {
    setLoading(true);
    const response = await fetch('/api/dairy', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    setDairies(data.dairies);
  } catch (error) {
    setError('Failed to load dairies');
  } finally {
    setLoading(false);
  }
}

// POST request
async function createDairy(formData: DairyFormData) {
  try {
    setSubmitting(true);
    const response = await fetch('/api/dairy', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    setSuccess(result.message);
    router.push('/admin/dairy');
  } catch (error) {
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
}

// DELETE request
async function deleteDairy(id: number) {
  if (!confirm('Are you sure?')) return;
  
  try {
    const response = await fetch(`/api/dairy/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      setDairies(prev => prev.filter(d => d.id !== id));
      setSuccess('Dairy deleted successfully');
    }
  } catch (error) {
    setError('Failed to delete dairy');
  }
}
```

### 3. Error Handling Pattern
```tsx
interface APIError {
  message: string;
  field?: string;
}

async function handleAPICall<T>(
  promise: Promise<Response>
): Promise<{ data?: T; error?: APIError }> {
  try {
    const response = await promise;
    const result = await response.json();
    
    if (!response.ok) {
      return { error: result };
    }
    
    return { data: result };
  } catch (error) {
    return { 
      error: { 
        message: 'Network error occurred' 
      } 
    };
  }
}

// Usage
const { data, error } = await handleAPICall<DairyResponse>(
  fetch('/api/dairy')
);

if (error) {
  setError(error.message);
} else if (data) {
  setDairies(data.dairies);
}
```

---

## Reusable Components

### 1. Loading Components

#### FlowerSpinner (Brand Loader)
```tsx
import FlowerSpinner from '@/components/FlowerSpinner';

<FlowerSpinner size={24} className="text-green-600" />
```

#### LoadingButton
```tsx
import LoadingButton from '@/components/LoadingButton';

<LoadingButton
  isLoading={submitting}
  variant="primary"
  size="medium"
  onClick={handleSubmit}
  loadingText="Saving..."
>
  Save Changes
</LoadingButton>
```

#### PageLoading (Full Page)
```tsx
import PageLoading from '@/components/PageLoading';

if (loading) return <PageLoading />;
```

#### Skeleton Loader
```tsx
import Skeleton from '@/components/Skeleton';

<Skeleton className="h-8 w-48 mb-4" />
<Skeleton className="h-64 w-full" />
```

### 2. Form Components

#### Input Field (PSR Styled)
```tsx
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  placeholder={t.form.namePlaceholder}
  className="psr-input"
  required
/>
```

#### Textarea
```tsx
<textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={4}
  className="psr-textarea"
/>
```

#### Select Dropdown
```tsx
<select
  name="type"
  value={formData.type}
  onChange={handleChange}
  className="psr-select"
>
  <option value="" className="bg-white dark:bg-gray-900">
    Select type...
  </option>
  <option value="type1" className="bg-white dark:bg-gray-900">
    Type 1
  </option>
</select>
```

### 3. Button Components

#### Primary Button
```tsx
<button className="psr-button-primary">
  <Icon className="w-5 h-5 mr-2" />
  Add New
</button>
```

#### Secondary Button
```tsx
<button className="psr-button-secondary">
  Cancel
</button>
```

#### Danger Button
```tsx
<button className="psr-button-danger">
  <Trash2 className="w-5 h-5 mr-2" />
  Delete
</button>
```

#### Icon-Only Button (Mobile Responsive)
```tsx
<button className="
  w-10 h-10 sm:w-auto sm:h-auto
  p-2 sm:px-4 sm:py-2
  bg-gradient-to-r from-green-600 to-emerald-600
  hover:from-green-700 hover:to-emerald-700
  text-white
  rounded-lg
  flex items-center justify-center
  transition-all
">
  <Icon className="w-5 h-5" />
  <span className="hidden sm:inline ml-2">Action</span>
</button>
```

### 4. Card Components

#### Basic Card
```tsx
<div className="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-xl
  shadow-sm
  p-4 sm:p-6
">
  <h3 className="text-lg sm:text-xl font-semibold mb-3">
    Card Title
  </h3>
  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
    Card content
  </p>
</div>
```

#### Statistics Card
```tsx
<div className="
  bg-gradient-to-br from-green-50 to-emerald-50
  dark:from-green-900/20 dark:to-emerald-900/20
  border border-green-200 dark:border-green-800
  rounded-xl
  p-4 sm:p-6
">
  <div className="flex items-center justify-between mb-3">
    <div className="
      w-10 h-10 sm:w-12 sm:h-12
      bg-gradient-to-r from-green-600 to-emerald-600
      rounded-xl
      flex items-center justify-center
    ">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
  </div>
  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
    {value}
  </p>
  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
    {label}
  </p>
</div>
```

### 5. Layout Components

#### DashboardLayout (Already exists)
```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout user={user}>
      {/* Page content */}
    </DashboardLayout>
  );
}
```

#### Header Component
```tsx
<div className="
  sticky top-0 z-10
  bg-white dark:bg-gray-900
  border-b border-gray-200 dark:border-gray-700
  px-4 sm:px-6 lg:px-8
  py-4 sm:py-5
">
  {/* Header content */}
</div>
```

### 6. Modal/Dialog Components

#### Modal Pattern
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              fixed inset-0 z-50
              bg-black/50 dark:bg-black/70
              flex items-center justify-center
              p-4
            "
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                rounded-xl
                shadow-2xl
                w-full max-w-md
                max-h-[90vh]
                overflow-y-auto
              "
            >
              {/* Header */}
              <div className="
                flex items-center justify-between
                p-4 sm:p-6
                border-b border-gray-200 dark:border-gray-700
              ">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="
                    text-gray-400 hover:text-gray-600
                    dark:hover:text-gray-300
                    transition-colors
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 7. Notification/Toast Components

#### Success Notification
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    fixed top-4 left-4 right-4 sm:left-auto sm:right-4
    sm:w-96
    bg-green-50 dark:bg-green-900/20
    border border-green-200 dark:border-green-800
    rounded-xl
    p-4
    shadow-lg
    z-50
  "
>
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm sm:text-base font-medium text-green-900 dark:text-green-100 break-words">
        {message}
      </p>
    </div>
  </div>
</motion.div>
```

#### Error Notification
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    fixed top-4 left-4 right-4 sm:left-auto sm:right-4
    sm:w-96
    bg-red-50 dark:bg-red-900/20
    border border-red-200 dark:border-red-800
    rounded-xl
    p-4
    shadow-lg
    z-50
  "
>
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm sm:text-base font-medium text-red-900 dark:text-red-100 break-words">
        {error}
      </p>
    </div>
  </div>
</motion.div>
```

---

## Testing & Validation

### Pre-Launch Checklist

#### 1. Visual Testing
- [ ] Test on mobile (375px - 430px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px - 1920px)
- [ ] Test on ultra-wide (2560px+)
- [ ] Verify dark mode appearance
- [ ] Check all three languages

#### 2. Functional Testing
- [ ] All forms submit correctly
- [ ] Validation works properly
- [ ] Error messages display
- [ ] Success notifications show
- [ ] Navigation works
- [ ] Back button functions
- [ ] Authentication persists
- [ ] Role-based access works

#### 3. Performance Testing
- [ ] Page loads under 3 seconds
- [ ] Images are optimized
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Fast API responses

#### 4. Accessibility Testing
- [ ] All interactive elements ≥44px
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus states visible
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Color contrast sufficient

#### 5. Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Proper error handling
- [ ] Clean console output
- [ ] Commented complex logic
- [ ] Consistent naming
- [ ] Follows file structure

---

## Code Examples

### Example 1: List Screen with CRUD
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLoading from '@/components/PageLoading';
import LoadingButton from '@/components/LoadingButton';

interface Dairy {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: 'active' | 'inactive';
}

export default function DairyManagementScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [dairies, setDairies] = useState<Dairy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchDairies();
  }, []);
  
  const fetchDairies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dairy');
      const data = await response.json();
      setDairies(data.dairies);
    } catch (error) {
      console.error('Failed to fetch dairies:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm(t.admin.dairy.confirmDelete)) return;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/dairy/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setDairies(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      alert('Failed to delete dairy');
    } finally {
      setDeletingId(null);
    }
  };
  
  const filteredDairies = dairies.filter(dairy =>
    dairy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) return <PageLoading />;
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="
        flex flex-col sm:flex-row
        items-start sm:items-center
        justify-between
        gap-3 sm:gap-4
      ">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          {t.admin.dairy.title}
        </h1>
        
        <button
          onClick={() => router.push('/admin/dairy/create')}
          className="
            psr-button-primary
            w-full sm:w-auto
          "
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="sm:inline">{t.admin.dairy.addNew}</span>
        </button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.common.search}
          className="psr-input pl-10"
        />
      </div>
      
      {/* Grid */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-4 sm:gap-6
      ">
        {filteredDairies.map((dairy) => (
          <motion.div
            key={dairy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl
              p-4 sm:p-6
              shadow-sm
              hover:shadow-md
              transition-shadow
            "
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate">
              {dairy.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {dairy.location}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/admin/dairy/${dairy.id}`)}
                className="flex-1 psr-button-secondary text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              
              <button
                onClick={() => router.push(`/admin/dairy/${dairy.id}/edit`)}
                className="flex-1 psr-button-secondary text-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <LoadingButton
                isLoading={deletingId === dairy.id}
                onClick={() => handleDelete(dairy.id)}
                variant="outline"
                size="small"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </LoadingButton>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredDairies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t.common.noResults}
          </p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Detail/View Screen
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Edit2, Trash2, MapPin, Users } from 'lucide-react';
import PageLoading from '@/components/PageLoading';

interface DairyDetail {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export default function DairyDetailScreen() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  
  const [dairy, setDairy] = useState<DairyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (params.id) {
      fetchDairyDetail(Number(params.id));
    }
  }, [params.id]);
  
  const fetchDairyDetail = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dairy/${id}`);
      const data = await response.json();
      setDairy(data.dairy);
    } catch (error) {
      console.error('Failed to fetch dairy:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <PageLoading />;
  if (!dairy) return <div>Not found</div>;
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="
        flex flex-col sm:flex-row
        items-start sm:items-center
        justify-between
        gap-3 sm:gap-4
      ">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="
              w-10 h-10
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              rounded-lg
              flex items-center justify-center
              transition-colors
            "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">
              {dairy.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {dairy.location}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/admin/dairy/${dairy.id}/edit`)}
            className="flex-1 sm:flex-none psr-button-primary"
          >
            <Edit2 className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">{t.common.edit}</span>
          </button>
          
          <button
            onClick={() => {/* Delete logic */}}
            className="flex-1 sm:flex-none psr-button-danger"
          >
            <Trash2 className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">{t.common.delete}</span>
          </button>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-4 sm:gap-6
      ">
        <div className="
          bg-gradient-to-br from-green-50 to-emerald-50
          dark:from-green-900/20 dark:to-emerald-900/20
          border border-green-200 dark:border-green-800
          rounded-xl
          p-4 sm:p-6
        ">
          <div className="flex items-center justify-between mb-3">
            <div className="
              w-10 h-10 sm:w-12 sm:h-12
              bg-gradient-to-r from-green-600 to-emerald-600
              rounded-xl
              flex items-center justify-center
            ">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">
            {dairy.capacity}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Capacity
          </p>
        </div>
        
        {/* More stat cards */}
      </div>
      
      {/* Information Cards */}
      <div className="
        grid
        grid-cols-1
        gap-3 sm:gap-4
      ">
        <div className="
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl
          p-4 sm:p-6
        ">
          <h3 className="text-lg font-semibold mb-4">
            Contact Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                Contact Person
              </span>
              <span className="text-sm font-medium break-words flex-1">
                {dairy.contactPerson}
              </span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                Phone
              </span>
              <a 
                href={`tel:${dairy.phone}`}
                className="text-sm font-medium text-green-600 hover:underline break-words flex-1"
              >
                {dairy.phone}
              </a>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                Email
              </span>
              <a 
                href={`mailto:${dairy.email}`}
                className="text-sm font-medium text-green-600 hover:underline break-words flex-1"
              >
                {dairy.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Summary

### Quick Reference

**Always Remember:**
1. ✅ Mobile-first responsive design
2. ✅ Dark mode support on all elements
3. ✅ Multi-language using `useLanguage()`
4. ✅ Use PSR color system (green/emerald/teal)
5. ✅ Minimum 44px touch targets
6. ✅ Progressive padding (p-4 → p-6 → p-8)
7. ✅ Responsive typography (text-sm → text-base → text-lg)
8. ✅ Use reusable components
9. ✅ TypeScript interfaces for all data
10. ✅ Proper error handling

**File Naming:**
- Components: `MyComponent.tsx`
- Pages: `page.tsx`
- Routes: `/admin/entity/[id]/page.tsx`

**Class Pattern:**
```tsx
className="
  [mobile-base-styles]
  sm:[tablet-styles]
  lg:[desktop-styles]
  dark:[dark-mode-styles]
"
```

**Import Order:**
1. React/Next imports
2. Context imports
3. Component imports
4. Icon imports
5. Type imports

---

**End of Protocol Document**  
*For questions or clarifications, refer to project documentation in `/docs` folder*
