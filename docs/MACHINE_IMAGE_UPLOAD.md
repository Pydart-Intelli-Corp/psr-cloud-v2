# Machine Image Upload Feature

## Overview
Added machine image upload functionality to the Super Admin panel's Machine Management section. Super admins can now upload images for each machine type.

## Features Implemented

### 1. Frontend Updates
**File**: `src/components/management/MachineManager.tsx`

#### New State Variables:
- `showImageUploadModal`: Controls image upload modal visibility
- `selectedMachineForImage`: Stores the machine selected for image upload
- `imageFile`: Stores the selected image file
- `imagePreview`: Stores base64 preview of selected image
- `imageUploadLoading`: Loading state for upload operation

#### New UI Components:
1. **Image Column** in machine table:
   - Displays machine image thumbnail (12x12)
   - Placeholder icon when no image
   - "Upload" or "Change" button to open upload modal

2. **Image Upload Modal**:
   - Shows selected machine name
   - Image preview before upload
   - File validation (type and size)
   - Upload progress indicator
   - Remove preview button

#### Image Validation:
- **Accepted formats**: PNG, JPG, JPEG, WEBP
- **Maximum size**: 5MB
- **Validation location**: Both frontend and backend

### 2. Backend API
**File**: `src/app/api/superadmin/machines/upload-image/route.ts`

#### Endpoints:

##### POST `/api/superadmin/machines/upload-image`
Upload image for a machine.

**Request**:
```typescript
FormData {
  image: File,
  machineId: string
}
```

**Response**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/machines/machine-1-1735689600000.jpg",
    "machineId": 1,
    "machineType": "ECOD-G"
  }
}
```

**Process**:
1. Validate image file and machine ID
2. Check machine exists in database
3. Generate unique filename: `machine-{id}-{timestamp}.{ext}`
4. Create uploads directory if needed
5. Save file to `public/uploads/machines/`
6. Update machine record with imageUrl
7. Return success response

##### DELETE `/api/superadmin/machines/upload-image?machineId={id}`
Remove machine image.

**Response**:
```json
{
  "success": true,
  "message": "Image removed successfully"
}
```

### 3. Database Schema Update
**File**: `src/models/Machine.ts`

#### Added Field:
```typescript
imageUrl: {
  type: DataTypes.STRING(500),
  allowNull: true,
  field: 'image_url',
  comment: 'URL path to machine image'
}
```

#### Migration SQL:
**File**: `database/migrations/add_machine_image_url.sql`

```sql
ALTER TABLE `machinetype` 
ADD COLUMN `image_url` VARCHAR(500) NULL 
COMMENT 'URL path to machine image' 
AFTER `is_active`;
```

### 4. File Storage
**Directory**: `public/uploads/machines/`

- Images are stored with unique filenames
- Format: `machine-{machineId}-{timestamp}.{extension}`
- Publicly accessible via `/uploads/machines/` URL path
- Directory created automatically if doesn't exist

## Usage

### For Super Admin:

1. **Navigate** to Super Admin Dashboard → Machines tab
2. **View** machine list with image column
3. **Click** "Upload" button next to any machine
4. **Select** image file (PNG, JPG, WEBP, max 5MB)
5. **Preview** image before upload
6. **Click** "Upload Image" button
7. **View** uploaded image in machine table

### Image Management:
- **Change image**: Click "Change" button, select new image
- **Remove image**: Use DELETE API endpoint (UI can be added)

## Technical Details

### File Handling:
- Uses Next.js `FormData` API
- Node.js `fs/promises` for file operations
- Buffer conversion for file writing

### Security:
- File type validation
- File size limits
- Filename sanitization (timestamp-based)
- Directory traversal prevention

### Performance:
- Image preview uses `FileReader` API
- No image processing/optimization (add later if needed)
- Direct file system storage (consider cloud storage for production)

## Future Enhancements

### Recommended:
1. **Image Optimization**:
   - Resize/compress images on upload
   - Generate thumbnails
   - Use Sharp or similar library

2. **Cloud Storage**:
   - Integrate AWS S3, Azure Blob, or Cloudinary
   - Better scalability for production

3. **Image Gallery**:
   - View full-size image in modal
   - Image zoom functionality
   - Multiple images per machine

4. **Drag & Drop**:
   - Drag and drop upload interface
   - Bulk image upload

5. **Image Editing**:
   - Crop/rotate images
   - Apply filters

6. **CDN Integration**:
   - Serve images via CDN for faster loading
   - Cache optimization

## Testing

### Manual Testing Checklist:
- [ ] Upload PNG image
- [ ] Upload JPG image
- [ ] Upload WEBP image
- [ ] Try uploading file > 5MB (should fail)
- [ ] Try uploading non-image file (should fail)
- [ ] Upload image for machine without existing image
- [ ] Change image for machine with existing image
- [ ] Verify image displays in table
- [ ] Verify image URL is correct
- [ ] Check database record updated
- [ ] Verify file saved in correct directory

### API Testing:
```bash
# Upload image
curl -X POST http://localhost:3000/api/superadmin/machines/upload-image \
  -F "image=@/path/to/image.jpg" \
  -F "machineId=1"

# Remove image
curl -X DELETE "http://localhost:3000/api/superadmin/machines/upload-image?machineId=1"
```

## Database Migration

### Run Migration:
```sql
-- Connect to your MySQL database
mysql -u your_username -p your_database

-- Run the migration
source database/migrations/add_machine_image_url.sql
```

### Verify:
```sql
DESCRIBE machinetype;
```

Expected output should include:
```
image_url | varchar(500) | YES | | NULL |
```

## Files Modified/Created

### Modified:
1. `src/components/management/MachineManager.tsx`
2. `src/models/Machine.ts`
3. `src/app/api/superadmin/machines/route.ts`

### Created:
1. `src/app/api/superadmin/machines/upload-image/route.ts`
2. `database/migrations/add_machine_image_url.sql`
3. `public/uploads/machines/.gitkeep`
4. `docs/MACHINE_IMAGE_UPLOAD.md` (this file)

## Troubleshooting

### Issue: Upload fails with 500 error
**Solution**: Check directory permissions, ensure `public/uploads/machines/` exists and is writable

### Issue: Image doesn't display after upload
**Solution**: 
- Check imageUrl in database
- Verify file exists in `public/uploads/machines/`
- Check browser console for 404 errors
- Ensure Next.js static file serving is working

### Issue: "Machine not found" error
**Solution**: Verify machineId is correct and machine exists in database

### Issue: File size too large
**Solution**: Image must be under 5MB. Compress image before uploading.

## Support
For issues or questions, contact the development team or create an issue in the project repository.

---

**Last Updated**: December 31, 2025
**Version**: 1.0.0
**Author**: Development Team
