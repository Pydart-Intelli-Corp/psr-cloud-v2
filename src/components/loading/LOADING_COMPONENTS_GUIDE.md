# Loading Components Documentation

## Overview
This documentation covers the comprehensive loading system created for the Poornasree Equipments Cloud application. The system uses a rotating `flower.png` animation and provides various loading states for different UI scenarios.

## Components

### 1. LoadingSpinner
Basic rotating flower spinner with customizable sizes and text.

```tsx
import { LoadingSpinner } from '@/components';

// Basic usage
<LoadingSpinner />

// Custom size and text
<LoadingSpinner 
  size="large" 
  text="Processing..." 
  showText={true}
/>

// Full screen loading
<LoadingSpinner 
  fullScreen={true} 
  text="Initializing application..." 
/>
```

**Props:**
- `size`: 'small' | 'medium' | 'large' | 'xl' (default: 'medium')
- `className`: Additional CSS classes
- `showText`: boolean (default: true)
- `text`: Loading text (default: 'Loading...')
- `fullScreen`: boolean (default: false)

### 2. LoadingOverlay
Wraps content and shows loading overlay when needed.

```tsx
import { LoadingOverlay } from '@/components';

<LoadingOverlay 
  isLoading={isSubmitting} 
  text="Saving changes..."
>
  <form>
    {/* Form content */}
  </form>
</LoadingOverlay>
```

### 3. PageLoading
Full page loading screen with branding.

```tsx
import { PageLoading } from '@/components';

// Show during route changes or app initialization
<PageLoading text="Loading dashboard..." />
```

### 4. LoadingButton
Button with integrated loading state.

```tsx
import { LoadingButton } from '@/components';

<LoadingButton
  isLoading={isSubmitting}
  onClick={handleSubmit}
  variant="primary"
  size="medium"
  loadingText="Submitting..."
>
  Submit Form
</LoadingButton>
```

### 5. Skeleton Components
Loading placeholders with shimmer effect.

```tsx
import { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton } from '@/components';

// Basic skeleton
<Skeleton variant="text" lines={3} />

// Predefined layouts
<CardSkeleton />
<TableSkeleton rows={5} columns={4} />
<ListSkeleton items={8} />
```

### 6. LoadingProvider & useLoading
Global loading state management.

```tsx
// Wrap your app with LoadingProvider
import { LoadingProvider } from '@/components';

function App() {
  return (
    <LoadingProvider>
      <YourAppContent />
    </LoadingProvider>
  );
}

// Use in any component
import { useLoading } from '@/components';

function MyComponent() {
  const { showPageLoading, hidePageLoading } = useLoading();
  
  const handleAsyncOperation = async () => {
    showPageLoading('Processing data...');
    try {
      await someAsyncOperation();
    } finally {
      hidePageLoading();
    }
  };
}
```

## Usage Examples

### Form Submission
```tsx
function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <LoadingOverlay isLoading={isSubmitting} text="Saving...">
      <form>
        <input type="text" placeholder="Name" />
        <LoadingButton
          isLoading={isSubmitting}
          onClick={handleSubmit}
          loadingText="Submitting..."
        >
          Submit
        </LoadingButton>
      </form>
    </LoadingOverlay>
  );
}
```

### Data Table Loading
```tsx
function DataTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  if (loading) {
    return <TableSkeleton rows={10} columns={5} />;
  }
  
  return (
    <table>
      {/* Table content */}
    </table>
  );
}
```

### Page Navigation
```tsx
function Dashboard() {
  const { showPageLoading, hidePageLoading } = useLoading();
  
  useEffect(() => {
    const loadDashboard = async () => {
      showPageLoading('Loading dashboard...');
      try {
        await fetchDashboardData();
      } finally {
        hidePageLoading();
      }
    };
    
    loadDashboard();
  }, []);
}
```

## CSS Classes Available

### Animation Classes
- `.animate-flower-spin`: Rotating flower animation
- `.animate-loading-pulse`: Pulsing effect
- `.animate-loading-shimmer`: Shimmer effect for skeletons

### Utility Classes
- `.loading-overlay`: Semi-transparent overlay with blur
- `.loading-card`: Styled loading container
- `.skeleton`: Base skeleton styling
- `.loading-responsive`: Responsive scaling on mobile

## Customization

### Custom Sizes
You can extend the size configurations by modifying the `sizeConfig` in each component or adding CSS custom properties.

### Custom Colors
The loading components inherit from your Material Design 3 color system defined in `globals.css`.

### Performance Considerations
- All components use `next/image` for optimized loading
- Animations are GPU-accelerated using CSS transforms
- Components are tree-shakeable when imported individually

## Best Practices

1. **Use appropriate loading states**: 
   - Page-level: `PageLoading` or `useLoading`
   - Component-level: `LoadingOverlay`
   - Button actions: `LoadingButton`
   - Data placeholders: `Skeleton` components

2. **Provide meaningful loading text** that describes what's happening

3. **Use skeleton loaders** for better perceived performance during data fetching

4. **Avoid nested loading states** that can confuse users

5. **Test loading states** on slow connections to ensure good UX