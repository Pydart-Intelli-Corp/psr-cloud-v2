# Reusable Form Components

This guide explains how to use the reusable form components across dairy, BMC, society, and machine management forms.

## Components Overview

### 1. FormModal
A consistent modal wrapper with mobile-friendly design and animations.

```tsx
<FormModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Add New Entity"
  maxWidth="lg" // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
>
  {/* Form content here */}
</FormModal>
```

### 2. FormGrid
A responsive grid container for form fields.

```tsx
<FormGrid columns={2}> {/* 1 or 2 columns */}
  {/* Form fields here */}
</FormGrid>
```

### 3. FormInput
A consistent input field with validation and error states.

```tsx
<FormInput
  label="Name"
  type="text" // 'text' | 'email' | 'tel' | 'date' | 'number' | 'password'
  value={formData.name}
  onChange={(value) => setFormData({...formData, name: value})}
  placeholder="Enter name"
  required={true}
  disabled={false}
  error={fieldErrors.name}
  colSpan={2} // 1 or 2 for grid span
/>
```

### 4. FormSelect
A consistent select dropdown with options.

```tsx
<FormSelect
  label="Type"
  value={formData.type}
  onChange={(value) => setFormData({...formData, type: value})}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
  required={true}
  disabled={false}
  error={fieldErrors.type}
  colSpan={1}
/>
```

### 5. FormTextarea
A consistent textarea field.

```tsx
<FormTextarea
  label="Description"
  value={formData.description}
  onChange={(value) => setFormData({...formData, description: value})}
  placeholder="Enter description"
  rows={3}
  required={false}
  disabled={false}
  error={fieldErrors.description}
  colSpan={2}
/>
```

### 6. FormError
A consistent error message display.

```tsx
<FormError error={generalError} />
```

### 7. FormActions
Consistent form buttons with loading states.

```tsx
<FormActions
  onCancel={() => setShowForm(false)}
  submitText="Add Entity"
  isLoading={isSubmitting}
  cancelText="Cancel" // optional
  submitType="submit" // 'submit' | 'button'
  onSubmit={() => handleSubmit()} // only if submitType="button"
/>
```

## Complete Example: Machine Form

```tsx
<FormModal
  isOpen={showAddForm}
  onClose={() => setShowAddForm(false)}
  title="Add New Machine"
  maxWidth="lg"
>
  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
    <FormGrid>
      <FormInput
        label="Machine ID"
        value={formData.machineId}
        onChange={(value) => setFormData({ ...formData, machineId: value })}
        placeholder="e.g., M2232"
        required
        error={fieldErrors.machineId}
        colSpan={2}
      />

      <FormSelect
        label="Machine Type"
        value={formData.machineType}
        onChange={(value) => setFormData({ ...formData, machineType: value })}
        options={machineTypes.map(type => ({ 
          value: type.machineType, 
          label: type.machineType 
        }))}
        placeholder="Select Machine Type"
        required
        disabled={machineTypesLoading}
        error={fieldErrors.machineType}
      />

      <FormInput
        label="Location"
        value={formData.location}
        onChange={(value) => setFormData({ ...formData, location: value })}
        placeholder="Installation location"
      />

      <FormTextarea
        label="Notes"
        value={formData.notes}
        onChange={(value) => setFormData({ ...formData, notes: value })}
        placeholder="Additional notes..."
        rows={3}
        colSpan={2}
      />
    </FormGrid>

    <FormError error={error} />

    <FormActions
      onCancel={() => setShowAddForm(false)}
      submitText="Add Machine"
      isLoading={formLoading}
    />
  </form>
</FormModal>
```

## Benefits

1. **Consistency**: All forms use the same styling and behavior
2. **Maintainability**: Changes to form styling only need to be made in one place
3. **Accessibility**: Built-in accessibility features across all forms
4. **Responsive**: Mobile-first design with consistent breakpoints
5. **Dark Mode**: Automatic dark mode support
6. **Validation**: Consistent error handling and display
7. **Loading States**: Built-in loading indicators and disabled states

## Migration Guide

To migrate existing forms to use these components:

1. Replace modal wrapper with `<FormModal>`
2. Replace form grid with `<FormGrid>`
3. Replace individual inputs with `<FormInput>`, `<FormSelect>`, or `<FormTextarea>`
4. Replace error displays with `<FormError>`
5. Replace action buttons with `<FormActions>`
6. Update imports to include the new components

This approach eliminates code duplication and ensures consistent user experience across all management forms in the application.