# Dairy Delete Functionality Unification

## Summary
Successfully unified the delete functionality across dairy management views (card delete and detail view delete) to use the same OTP-verified deletion process.

## Changes Made

### 1. Detail Page Import Update
**File:** `src/app/admin/dairy/[id]/page.tsx`

- **Before:** Used `ConfirmDeleteModal` from `@/components` (simple confirmation without OTP)
- **After:** Uses `DeleteDairyModal` from `@/components/modals/DeleteDairyModal` (2-step OTP verification)

```diff
- import { ConfirmDeleteModal } from '@/components';
+ import DeleteDairyModal from '@/components/modals/DeleteDairyModal';
```

### 2. Detail Page Delete Handler Update
**File:** `src/app/admin/dairy/[id]/page.tsx` - `handleDeleteClick()` function

- **Added:** Storage of dairy ID for OTP modal component
- **Purpose:** Allows `DeleteDairyModal` to retrieve the dairy ID when sending OTP

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
    // Store dairy ID for OTP modal (used by DeleteDairyModal component)
    (window as any).selectedDairyIdForDelete = dairyData.dairy.id;
    setShowDeleteModal(true);
  }
};
```

### 3. Detail Page Confirm Delete Handler Update
**File:** `src/app/admin/dairy/[id]/page.tsx` - `handleConfirmDelete()` function

- **Before:** Simple DELETE request without OTP
- **After:** Accepts OTP parameter from `DeleteDairyModal` and includes it in the request

```typescript
// Handle simple delete (no BMCs)
const handleConfirmDelete = async (otp?: string) => {
  if (!dairyData?.dairy) return;

  try {
    const token = localStorage.getItem('authToken');
    const body: {
      id: number;
      otp?: string;
    } = { id: dairyData.dairy.id };
    
    if (otp) {
      body.otp = otp;
    }

    const response = await fetch('/api/user/dairy', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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

### 4. Detail Page Modal Component Update
**File:** `src/app/admin/dairy/[id]/page.tsx` - Modal JSX rendering

- **Before:** `<ConfirmDeleteModal>` with simple confirmation only
- **After:** `<DeleteDairyModal>` with 2-step OTP verification

```diff
- <ConfirmDeleteModal
+ <DeleteDairyModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={handleConfirmDelete}
-   itemName={dairyData?.dairy.name || 'this dairy'}
-   itemType="Dairy"
+   dairyName={dairyData?.dairy.name || 'this dairy'}
  />
```

## Delete Flow - Now Unified

### Card Delete (from dairy list) → Detail Delete (from dairy detail page)

Both now follow the SAME flow:

```
1. User clicks Delete button
   ↓
2. handleDeleteClick() is called
   ↓
3. Fetch BMCs for the dairy
   ↓
4. Decision Point:
   ├─ If BMCs exist (count > 0):
   │  └─ Show TransferBMCsModal
   │     ├─ Transfer to another dairy + Delete
   │     └─ Cascade delete all (delete BMCs too)
   │        ↓
   │     handleTransferAndDelete(newDairyId, deleteAll, otp)
   │        ↓
   │     Delete request to API
   │        ↓
   │     Redirect to dairy list
   │
   └─ If NO BMCs (count = 0):
      └─ Show DeleteDairyModal (2-step OTP)
         ├─ Step 1: Confirm deletion intent
         │  └─ User clicks "Send OTP"
         │     ↓
         │  API sends OTP to registered email
         │
         └─ Step 2: Verify OTP
            └─ User enters 6-digit OTP
               ↓
            handleConfirmDelete(otp)
               ↓
            DELETE request with OTP to API
               ↓
            Redirect to dairy list
```

## Components Used

### DeleteDairyModal
**Purpose:** 2-step OTP verification for dairy deletion

**Features:**
- Step 1: Shows warning + list of data to be deleted + "Send OTP" button
- Step 2: 6 separate OTP input fields with:
  - Auto-advance between fields
  - Paste support for full OTP
  - Validates all digits entered
  - "Verify" button to confirm deletion

**File:** `src/components/modals/DeleteDairyModal.tsx`

### TransferBMCsModal
**Purpose:** When dairy has associated BMCs, allows transfer or cascade delete

**Features:**
- Transfer path: Select target dairy, transfer BMCs & delete original dairy
- Delete all path: Cascade delete all BMCs and the dairy

**File:** `src/components/modals/TransferBMCsModal.tsx`

## Consistency Achieved

### Before Unification
- **Card Delete:** Used `DeleteDairyModal` with OTP verification
- **Detail Delete:** Used `ConfirmDeleteModal` without OTP verification
- ❌ **Result:** Inconsistent delete experience

### After Unification
- **Card Delete:** Uses `DeleteDairyModal` with OTP verification
- **Detail Delete:** Uses `DeleteDairyModal` with OTP verification
- ✅ **Result:** Consistent delete experience across both views

## Testing Checklist

- [ ] Delete from card (dairy list) triggers OTP modal
- [ ] Delete from detail page triggers OTP modal
- [ ] OTP modal sends OTP when "Send OTP" is clicked
- [ ] OTP modal accepts 6-digit OTP with auto-advance
- [ ] OTP modal supports paste functionality
- [ ] Delete with OTP verification succeeds
- [ ] Delete with invalid OTP shows error
- [ ] Redirect to dairy list after successful delete
- [ ] Delete with BMCs shows transfer modal instead (both views)
- [ ] Transfer dairy + Delete works correctly
- [ ] Cascade delete (delete all BMCs) works correctly

## API Endpoints Used

1. **Send OTP for Delete:**
   ```
   POST /api/user/dairy/send-delete-otp
   Body: { dairyId: number }
   ```

2. **Confirm Delete with OTP (No BMCs):**
   ```
   DELETE /api/user/dairy
   Body: { id: number, otp: string }
   ```

3. **Delete with BMC Transfer:**
   ```
   DELETE /api/user/dairy
   Body: { id: number, newDairyId: number, otp: string }
   ```

4. **Cascade Delete (Delete All):**
   ```
   DELETE /api/user/dairy
   Body: { id: number, deleteAll: true, otp: string }
   ```

5. **Fetch BMCs for Dairy:**
   ```
   GET /api/user/bmc
   Returns: { data: Array of BMCs filtered by dairyFarmId }
   ```

## Implementation Notes

1. **selectedDairyIdForDelete Window Property:**
   - Used to store dairy ID before showing delete modal
   - Allows `DeleteDairyModal` component to access dairy ID when sending OTP
   - Same pattern used in both main page and detail page

2. **OTP Requirement:**
   - All dairy deletions now require OTP verification
   - OTP is sent to the registered email associated with the dairy
   - User has time window to enter OTP (configured on backend)

3. **BMC Handling:**
   - If dairy has associated BMCs, transfer modal is shown first
   - User must choose transfer destination or cascade delete
   - OTP is still required even for transfer operations

4. **State Management:**
   - Both pages maintain: `showDeleteModal`, `showTransferModal`, `selectedDairy`, `bmcsForTransfer`
   - Same state handling logic for consistency

## Benefits of This Change

1. **Consistency:** Same delete flow and UX everywhere
2. **Security:** OTP verification prevents accidental deletions
3. **User Experience:** Familiar delete workflow across all dairy management screens
4. **Maintainability:** Single delete modal component used everywhere
5. **Data Integrity:** BMC transfer logic ensures no orphaned data
