import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { generateUniqueFarmerUID } from '@/lib/farmeruid-generator';

interface CSVRowFromFile {
  ID: string;
  'RF-ID': string;
  NAME: string;
  MOBILE: string;
  SMS: string;
  BONUS: string;
  'MACHINE-ID': string;
}



export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return createErrorResponse('Invalid token', 401);
    }

    if (decoded.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const societyId = formData.get('societyId') as string;
    const machineId = formData.get('machineId') as string;

    if (!file) {
      return createErrorResponse('CSV file is required', 400);
    }

    if (!societyId) {
      return createErrorResponse('Society ID is required', 400);
    }

    if (!machineId) {
      return createErrorResponse('Machine ID is required', 400);
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return createErrorResponse('Only CSV files are allowed', 400);
    }

    // Read and parse CSV content
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return createErrorResponse('CSV file must contain header and at least one data row', 400);
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Header:', header);

    // Validate CSV format - MACHINE-ID is optional in CSV since we can use the selected machine from UI
    const requiredHeaders = ['ID', 'RF-ID', 'NAME', 'MOBILE', 'SMS', 'BONUS'];
    const optionalHeaders = ['MACHINE-ID'];
    const allValidHeaders = [...requiredHeaders, ...optionalHeaders];
    
    // Check if all required headers are present
    const missingRequired = requiredHeaders.filter(h => !header.includes(h));
    if (missingRequired.length > 0) {
      return createErrorResponse(
        `Missing required CSV headers: ${missingRequired.join(', ')}. Required: ${requiredHeaders.join(', ')}`, 
        400
      );
    }
    
    // Check if any invalid headers are present
    const invalidHeaders = header.filter(h => !allValidHeaders.includes(h));
    if (invalidHeaders.length > 0) {
      return createErrorResponse(
        `Invalid CSV headers: ${invalidHeaders.join(', ')}. Valid headers: ${allValidHeaders.join(', ')}`, 
        400
      );
    }

    // Parse CSV rows
    const farmers: CSVRowFromFile[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== header.length) {
        errors.push(`Row ${i + 1}: Invalid number of columns`);
        continue;
      }

      const row: Record<string, string> = {};
      header.forEach((h, index) => {
        row[h] = values[index];
      });

      // Validate required fields
      if (!row.ID || !row.NAME) {
        errors.push(`Row ${i + 1}: ID and NAME are required`);
        continue;
      }

      farmers.push(row as unknown as CSVRowFromFile);
    }

    if (errors.length > 0) {
      return createErrorResponse(`CSV validation errors: ${errors.join('; ')}`, 400);
    }

    if (farmers.length === 0) {
      return createErrorResponse('No valid farmer data found in CSV', 400);
    }

    // Connect to database
    const sequelize = await connectDB();
    if (!sequelize) {
      return createErrorResponse('Database connection failed', 500);
    }

    const { User } = await import('@/models').then(m => m.getModels());
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Create schema name
    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    // Process farmers in batches
    const successCount = { value: 0 };
    const failedFarmers: Array<{ row: number; farmer: CSVRowFromFile; error: string }> = [];

    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      
      try {
        let rfIdToUse = farmer['RF-ID'] || null;
        
        // Check if RF-ID already exists globally (if provided)
        if (rfIdToUse && rfIdToUse.trim()) {
          const [existingRfId] = await sequelize.query(`
            SELECT id FROM \`${schemaName}\`.farmers 
            WHERE rf_id = ?
          `, { replacements: [rfIdToUse.trim()] });

          if ((existingRfId as unknown[]).length > 0) {
            console.log(`⚠️ RF-ID '${rfIdToUse}' already exists, skipping RF-ID for farmer ${farmer.ID}`);
            rfIdToUse = null; // Skip RF-ID to avoid conflict, but still create farmer
          }
        }
        
        // Generate unique farmer UID
        const farmeruid = await generateUniqueFarmerUID(schemaName, sequelize);
        
        // Insert farmer
        await sequelize.query(`
          INSERT INTO \`${schemaName}\`.farmers 
          (farmer_id, rf_id, farmeruid, name, phone, sms_enabled, bonus, society_id, machine_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `, {
          replacements: [
            farmer.ID,
            rfIdToUse,
            farmeruid,
            farmer.NAME,
            farmer.MOBILE || null,
            farmer.SMS || 'OFF',
            parseFloat(farmer.BONUS) || 0,
            parseInt(societyId),
            (farmer['MACHINE-ID'] && farmer['MACHINE-ID'].trim()) ? parseInt(farmer['MACHINE-ID']) : parseInt(machineId)
          ]
        });

        successCount.value++;
        
        // Log if RF-ID was skipped
        if (farmer['RF-ID'] && farmer['RF-ID'].trim() && !rfIdToUse) {
          console.log(`✅ Farmer '${farmer.ID}' created successfully but RF-ID '${farmer['RF-ID']}' was skipped (already exists)`);
        }

      } catch (error: unknown) {
        console.error('Error inserting farmer:', error);
        
        let errorMessage = 'Database insertion failed';
        
        // Handle constraint violations with user-friendly messages
        if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeUniqueConstraintError') {
          if (error && typeof error === 'object' && 'original' in error && error.original && typeof error.original === 'object') {
            const originalError = error.original as { sqlMessage?: string };
            if (originalError.sqlMessage) {
              if (originalError.sqlMessage.includes('unique_farmer_per_society')) {
                errorMessage = `Farmer ID '${farmer.ID}' already exists in society ${societyId}`;
              } else if (originalError.sqlMessage.includes('unique_rf_id')) {
                errorMessage = `RF-ID '${farmer['RF-ID']}' already exists globally. RF-IDs must be unique across all societies.`;
              } else if (originalError.sqlMessage.includes('rf_id')) {
                errorMessage = `RF-ID '${farmer['RF-ID']}' already exists`;
              } else {
                errorMessage = `Duplicate entry: ${originalError.sqlMessage}`;
              }
            }
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        failedFarmers.push({
          row: i + 2, // +2 because array is 0-indexed and we skip header
          farmer,
          error: errorMessage
        });
      }
    }

    // Prepare response
    const result = {
      totalProcessed: farmers.length,
      successCount: successCount.value,
      failedCount: failedFarmers.length,
      failedFarmers: failedFarmers.map(f => ({
        row: f.row,
        farmerId: f.farmer.ID,
        name: f.farmer.NAME,
        error: f.error
      }))
    };

    console.log(`📊 CSV Upload Results: ${successCount.value}/${farmers.length} farmers imported successfully`);

    let message = `Successfully imported ${successCount.value} out of ${farmers.length} farmers`;
    if (failedFarmers.length > 0) {
      message += `. ${failedFarmers.length} farmers failed to import.`;
    }
    
    return createSuccessResponse(message, result);

  } catch (error) {
    console.error('CSV upload error:', error);
    return createErrorResponse('Failed to process CSV upload', 500);
  }
}