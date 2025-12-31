import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse, validateRequiredFields } from '@/middleware/auth';

// GET - Fetch all machines
export async function GET() {
  try {
    await connectDB();
    const { Machine } = getModels();

    const machines = await Machine.findAll({
      order: [['machineType', 'ASC']],
      attributes: ['id', 'machineType', 'description', 'isActive', 'imageUrl']
    });

    return createSuccessResponse({
      machines,
      total: machines.length
    }, 'Machines fetched successfully');

  } catch (error) {
    console.error('Error fetching machines:', error);
    return createErrorResponse('Failed to fetch machines', 500);
  }
}

// POST - Create new machine or bulk upload
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { Machine } = getModels();
    
    const body = await request.json();
    
    // Check if this is bulk upload
    if (body.bulkData && Array.isArray(body.bulkData)) {
      const results = {
        success: 0,
        failed: 0,
        duplicates: 0,
        errors: [] as string[]
      };

      for (const machineData of body.bulkData) {
        try {
          if (!machineData.machineType || typeof machineData.machineType !== 'string') {
            results.failed++;
            results.errors.push(`Invalid machine type: ${machineData.machineType || 'empty'}`);
            continue;
          }

          const machineType = machineData.machineType.trim();
          if (!machineType) {
            results.failed++;
            results.errors.push('Empty machine type');
            continue;
          }

          // Check for duplicates
          const existing = await Machine.findOne({
            where: { machineType }
          });

          if (existing) {
            results.duplicates++;
            continue;
          }

          await Machine.create({
            machineType,
            description: machineData.description || '',
            isActive: machineData.isActive !== false
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error creating ${machineData.machineType}: ${error}`);
        }
      }

      return createSuccessResponse(results, 
        `Bulk upload completed: ${results.success} created, ${results.duplicates} duplicates, ${results.failed} failed`
      );
    }

    // Single machine creation
    const validation = validateRequiredFields(body, ['machineType']);
    if (!validation.success) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    const { machineType, description, isActive } = body;

    // Check for existing machine type
    const existingMachine = await Machine.findOne({
      where: { machineType: machineType.trim() }
    });

    if (existingMachine) {
      return createErrorResponse('Machine type already exists', 409);
    }

    const machine = await Machine.create({
      machineType: machineType.trim(),
      description: description || '',
      isActive: isActive !== false
    });

    return createSuccessResponse(machine, 'Machine created successfully');

  } catch (error) {
    console.error('Error creating machine:', error);
    return createErrorResponse('Failed to create machine', 500);
  }
}

// PUT - Update machine
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { Machine } = getModels();
    
    const body = await request.json();
    
    const validation = validateRequiredFields(body, ['id']);
    if (!validation.success) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }

    const { id, machineType, description, isActive } = body;

    const machine = await Machine.findByPk(id);
    if (!machine) {
      return createErrorResponse('Machine not found', 404);
    }

    // Check for duplicate machine type if changing
    if (machineType && machineType !== machine.machineType) {
      const existingMachine = await Machine.findOne({
        where: { machineType: machineType.trim() }
      });

      if (existingMachine) {
        return createErrorResponse('Machine type already exists', 409);
      }
    }

    const updateData: Partial<typeof body> = {};
    if (machineType) updateData.machineType = machineType.trim();
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    await machine.update(updateData);

    return createSuccessResponse(machine, 'Machine updated successfully');

  } catch (error) {
    console.error('Error updating machine:', error);
    return createErrorResponse('Failed to update machine', 500);
  }
}

// DELETE - Delete machine
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { Machine } = getModels();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return createErrorResponse('Machine ID is required', 400);
    }

    const machine = await Machine.findByPk(id);
    if (!machine) {
      return createErrorResponse('Machine not found', 404);
    }

    await machine.destroy();

    return createSuccessResponse(null, 'Machine deleted successfully');

  } catch (error) {
    console.error('Error deleting machine:', error);
    return createErrorResponse('Failed to delete machine', 500);
  }
}