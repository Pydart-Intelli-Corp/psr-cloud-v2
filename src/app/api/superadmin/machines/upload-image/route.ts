import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { connectDB } from '@/lib/database';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const machineId = formData.get('machineId') as string;

    if (!image) {
      return createErrorResponse('No image file provided', 400);
    }

    if (!machineId) {
      return createErrorResponse('Machine ID is required', 400);
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return createErrorResponse('File must be an image', 400);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (image.size > maxSize) {
      return createErrorResponse('Image size must be less than 5MB', 400);
    }

    await connectDB();
    const { Machine } = getModels();

    // Check if machine exists
    const machine = await Machine.findByPk(parseInt(machineId));
    if (!machine) {
      return createErrorResponse('Machine not found', 404);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = image.name.split('.').pop();
    const fileName = `machine-${machineId}-${timestamp}.${fileExt}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'machines');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Save file
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Update machine record with image URL
    // Use full URL with domain from environment variables
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL || '';
    const imageUrl = baseUrl ? `${baseUrl}/uploads/machines/${fileName}` : `/uploads/machines/${fileName}`;
    await machine.update({ imageUrl });

    console.log(`✅ Image uploaded successfully for machine ${machineId}: ${imageUrl}`);

    return createSuccessResponse({
      imageUrl,
      machineId: machine.id,
      machineType: machine.machineType
    }, 'Image uploaded successfully');

  } catch (error) {
    console.error('Error uploading image:', error);
    return createErrorResponse('Failed to upload image', 500);
  }
}

// DELETE - Remove machine image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    if (!machineId) {
      return createErrorResponse('Machine ID is required', 400);
    }

    await connectDB();
    const { Machine } = getModels();

    const machine = await Machine.findByPk(parseInt(machineId));
    if (!machine) {
      return createErrorResponse('Machine not found', 404);
    }

    // Update machine to remove image URL
    await machine.update({ imageUrl: undefined });

    console.log(`✅ Image removed for machine ${machineId}`);

    return createSuccessResponse(null, 'Image removed successfully');

  } catch (error) {
    console.error('Error removing image:', error);
    return createErrorResponse('Failed to remove image', 500);
  }
}
