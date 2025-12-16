# Dairy Delete Unification - Line-by-Line Changes

## File: `src/app/admin/dairy/[id]/page.tsx`

### Change 1: Import Statement (Lines 30-38)

**Location:** Component imports section

**Before:**
```typescript
import { 
  FlowerSpinner,
  LoadingSpinner,
  StatusMessage,
  EmptyState,
  ConfirmDeleteModal  // ← REMOVED
} from '@/components';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferBMCsModal from '@/components/modals/TransferBMCsModal';
```

**After:**
```typescript
import { 
  FlowerSpinner,
  LoadingSpinner,
  StatusMessage,
  EmptyState
} from '@/components';
import DeleteDairyModal from '@/components/modals/DeleteDairyModal';  // ← ADDED
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferBMCsModal from '@/components/modals/TransferBMCsModal';
```

**What Changed:**
- Removed: `ConfirmDeleteModal` from barrel import
- Added: `DeleteDairyModal` from modal components directory

---

### Change 2: handleDeleteClick Function (Lines 329-351)

**Location:** Main component body, after `fetchDairyDetails` function

**Before:**
```typescript
  // Handle delete click
  const handleDeleteClick = async () => {
    if (!dairyData?.dairy) return;
    
    // Fetch BMCs for this dairy
    const bmcs = await fetchBMCsForDairy(dairyData.dairy.id);
    setBmcsForTransfer(bmcs);
    
    if (bmcs.length > 0) {
      // Fetch all dairies for transfer dropdown
      await fetchDairies();
      setShowTransferModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };
```

**After:**
```typescript
  // Handle delete click
  const handleDeleteClick = async () => {
    if (!dairyData?.dairy) return;
    
    // Fetch BMCs for this dairy
    const bmcs = await fetchBMCsForDairy(dairyData.dairy.id);
    setBmcsForTransfer(bmcs);
    
    if (bmcs.length > 0) {
      // Fetch all dairies for transfer dropdown
      await fetchDairies();
      setShowTransferModal(true);
    } else {
      // Store dairy ID for OTP modal (used by DeleteDairyModal component)  // ← NEW COMMENT
      (window as any).selectedDairyIdForDelete = dairyData.dairy.id;  // ← NEW LINE
      setShowDeleteModal(true);
    }
  };
```

**What Changed:**
- Added 2 lines before `setShowDeleteModal(true)`
- Line 1: Comment explaining the purpose
- Line 2: Store dairy ID in window object for DeleteDairyModal to access

---

### Change 3: handleConfirmDelete Function (Lines 405-437)

**Location:** Main component body, after `handleTransferAndDelete` function

**Before:**
```typescript
  // Handle simple delete (no BMCs)
  const handleConfirmDelete = async () => {  // ← No parameter
    if (!dairyData?.dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: dairyData.dairy.id })  // ← No OTP
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to dairy list after 2 seconds
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 2000);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };
```

**After:**
```typescript
  // Handle simple delete (no BMCs)
  const handleConfirmDelete = async (otp?: string) => {  // ← WITH OTP PARAMETER
    if (!dairyData?.dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const body: {  // ← NEW: Build dynamic body
        id: number;
        otp?: string;
      } = { id: dairyData.dairy.id };
      
      if (otp) {  // ← NEW: Add OTP if provided
        body.otp = otp;
      }

      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)  // ← CHANGED: Use body variable
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to dairy list after 2 seconds
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 2000);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };
```

**What Changed:**
- Line 405: Added `(otp?: string)` parameter to function signature
- Lines 410-415: Added code to build dynamic request body
- Line 415: Changed from static object to dynamic `body` variable in JSON.stringify

---

### Change 4: Modal JSX (Lines 1628-1632)

**Location:** Component return JSX, in footer section with modals

**Before:**
```typescript
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemName={dairyData?.dairy.name || 'this dairy'}
        itemType="Dairy"
      />
```

**After:**
```typescript
      {/* Delete Confirmation Modal */}
      <DeleteDairyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        dairyName={dairyData?.dairy.name || 'this dairy'}
      />
```

**What Changed:**
- Line 1: Component name: `ConfirmDeleteModal` → `DeleteDairyModal`
- Line 4: Prop name: `itemName` → `dairyName`
- Line 5: Removed `itemType="Dairy"` prop (not used by DeleteDairyModal)

---

## Summary of All Changes

| Line | Type | Old | New | Reason |
|------|------|-----|-----|--------|
| 31 | Import Remove | `ConfirmDeleteModal` | — | Switching modal component |
| 36 | Import Add | — | `DeleteDairyModal` | New modal with OTP |
| 348 | Code Add | — | `// Store dairy ID...` | Comment for clarity |
| 349 | Code Add | — | `(window as any).selectedDairyIdForDelete...` | OTP modal needs dairy ID |
| 405 | Signature Change | `async ()` | `async (otp?: string)` | Accept OTP parameter |
| 410-415 | Code Add | — | Body building logic | Support optional OTP |
| 419 | Variable Change | `{ id: ... }` | `body` | Use dynamic body |
| 1628 | Component Change | `ConfirmDeleteModal` | `DeleteDairyModal` | Use OTP-enabled modal |
| 1631 | Prop Change | `itemName=` | `dairyName=` | Correct prop name |
| 1632 | Prop Remove | `itemType="Dairy"` | — | Not needed for DeleteDairyModal |

---

## Impact Analysis

### Direct Impact
- ✅ Detail page delete now uses OTP verification
- ✅ Detail page delete behavior matches card delete
- ✅ Consistent user experience across both views

### Indirect Impact
- ✅ No changes needed in parent components
- ✅ No changes needed in child components
- ✅ No changes needed in API endpoints
- ✅ No changes needed in other pages

### Testing Impact
- ✅ Detail page delete behavior must be tested
- ✅ OTP verification must be tested
- ✅ BMC transfer flow must be tested (with detail view)
- ✅ Cascade delete must be tested (with detail view)

---

## Rollback Guide (if needed)

If you need to revert these changes:

1. **Restore Import:**
   ```typescript
   // Change back
   import { ConfirmDeleteModal } from '@/components';
   // Remove
   import DeleteDairyModal from '@/components/modals/DeleteDairyModal';
   ```

2. **Restore handleDeleteClick:**
   ```typescript
   // Remove these 2 lines
   (window as any).selectedDairyIdForDelete = dairyData.dairy.id;
   // Before setShowDeleteModal(true)
   ```

3. **Restore handleConfirmDelete:**
   ```typescript
   const handleConfirmDelete = async () => {  // Remove (otp?: string)
     // Remove the body building code
     // Change back to:
     body: JSON.stringify({ id: dairyData.dairy.id })
   ```

4. **Restore Modal JSX:**
   ```typescript
   <ConfirmDeleteModal
     isOpen={showDeleteModal}
     onClose={() => setShowDeleteModal(false)}
     onConfirm={handleConfirmDelete}
     itemName={dairyData?.dairy.name || 'this dairy'}
     itemType="Dairy"
   />
   ```

---

## Verification Checklist

After making these changes, verify:

- [ ] No TypeScript compilation errors
- [ ] No unused variable warnings
- [ ] Import statement correctly references DeleteDairyModal
- [ ] handleDeleteClick stores dairy ID before showing modal
- [ ] handleConfirmDelete accepts OTP parameter
- [ ] Modal JSX passes correct props to DeleteDairyModal
- [ ] Application compiles without errors
- [ ] No console errors on page load
- [ ] Delete from card still works
- [ ] Delete from detail page now shows OTP modal
- [ ] OTP verification works from detail page

---

**All changes are minimal and focused on unifying the delete experience.**
