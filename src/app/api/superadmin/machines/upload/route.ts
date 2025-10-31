import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { getModels } from '@/models';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';

// POST - Upload CSV for machines
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { Machine } = getModels();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return createErrorResponse('Only CSV files are allowed', 400);
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length === 0) {
      return createErrorResponse('CSV file is empty', 400);
    }

    // Skip header if it exists
    const hasHeader = lines[0].toLowerCase().includes('model') || lines[0].toLowerCase().includes('type');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const lineNumber = hasHeader ? i + 2 : i + 1;

      try {
        // Handle CSV parsing - could be comma or other delimiter
        const machineType = line.split(/[,;|\t]/)[0]?.trim();
        
        if (!machineType) {
          results.failed++;
          results.errors.push(`Line ${lineNumber}: Empty machine type`);
          continue;
        }

        // Check for duplicates in database
        const existing = await Machine.findOne({
          where: { machineType }
        });

        if (existing) {
          results.duplicates++;
          continue;
        }

        await Machine.create({
          machineType,
          description: `Imported from CSV`,
          isActive: true
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Line ${lineNumber}: Error processing ${line} - ${error}`);
      }
    }

    return createSuccessResponse(results, 
      `CSV upload completed: ${results.success} created, ${results.duplicates} duplicates, ${results.failed} failed`
    );

  } catch (error) {
    console.error('Error uploading CSV:', error);
    return createErrorResponse('Failed to upload CSV', 500);
  }
}