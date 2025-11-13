import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface CSVRow {
  CLR: string;
  FAT: string;
  SNF: string;
  RATE: string;
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
    const societyIdsStr = formData.get('societyIds') as string; // Changed to accept multiple
    const channel = formData.get('channel') as string;

    if (!file) {
      return createErrorResponse('CSV file is required', 400);
    }

    if (!societyIdsStr) {
      return createErrorResponse('Society ID(s) required', 400);
    }

    // Parse society IDs (can be single or comma-separated)
    const societyIds = societyIdsStr.split(',').map(id => id.trim()).filter(id => id);

    if (societyIds.length === 0) {
      return createErrorResponse('At least one society ID is required', 400);
    }

    if (!channel || !['COW', 'BUF', 'MIX'].includes(channel)) {
      return createErrorResponse('Valid channel (COW, BUF, or MIX) is required', 400);
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

    // Validate CSV format
    const requiredHeaders = ['CLR', 'FAT', 'SNF', 'RATE'];
    const missingRequired = requiredHeaders.filter(h => !header.includes(h));
    
    if (missingRequired.length > 0) {
      return createErrorResponse(
        `Missing required CSV headers: ${missingRequired.join(', ')}. Required: ${requiredHeaders.join(', ')}`, 
        400
      );
    }

    // Parse CSV rows
    const rateData: CSVRow[] = [];
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
      if (!row.CLR || !row.FAT || !row.SNF || !row.RATE) {
        errors.push(`Row ${i + 1}: All fields (CLR, FAT, SNF, RATE) are required`);
        continue;
      }

      // Validate numeric values
      if (isNaN(Number(row.CLR)) || isNaN(Number(row.FAT)) || isNaN(Number(row.SNF)) || isNaN(Number(row.RATE))) {
        errors.push(`Row ${i + 1}: All values must be numeric`);
        continue;
      }

      rateData.push(row as unknown as CSVRow);
    }

    if (errors.length > 0) {
      return createErrorResponse(`CSV validation errors: ${errors.join('; ')}`, 400);
    }

    if (rateData.length === 0) {
      return createErrorResponse('No valid rate data found in CSV', 400);
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

    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // For single society upload: check if it was using a shared chart
      if (societyIds.length === 1) {
        const [existingChart] = await sequelize.query(`
          SELECT id, shared_chart_id FROM ${schemaName}.rate_charts
          WHERE society_id = ${societyIds[0]} AND channel = :channel
        `, {
          replacements: { channel },
          transaction
        });

        // If society has a shared chart, only delete its chart record (not the shared data)
        if (existingChart && existingChart.length > 0) {
          const chart = (existingChart as Array<{ id: number; shared_chart_id: number | null }>)[0];
          
          if (chart.shared_chart_id !== null) {
            // Society was using a shared chart - only delete its chart record
            await sequelize.query(`
              DELETE FROM ${schemaName}.rate_charts
              WHERE id = ${chart.id}
            `, { transaction });
          } else {
            // Society had its own chart - delete both chart and data
            await sequelize.query(`
              DELETE FROM ${schemaName}.rate_chart_data
              WHERE rate_chart_id = ${chart.id}
            `, { transaction });

            await sequelize.query(`
              DELETE FROM ${schemaName}.rate_charts
              WHERE id = ${chart.id}
            `, { transaction });
          }
        }
      } else {
        // Multi-society upload: delete all their charts and data as before
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_data
          WHERE rate_chart_id IN (
            SELECT id FROM ${schemaName}.rate_charts
            WHERE society_id IN (${societyIds.join(',')}) AND channel = :channel
          )
        `, {
          replacements: { channel },
          transaction
        });

        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_charts
          WHERE society_id IN (${societyIds.join(',')}) AND channel = :channel
        `, {
          replacements: { channel },
          transaction
        });
      }

      // Insert rate chart records for all selected societies in one query
      const chartValues = societyIds.map(id => 
        `(${id}, '${channel}', NOW(), '${user.fullName.replace(/'/g, "''")}', '${file.name.replace(/'/g, "''")}', ${rateData.length})`
      ).join(',');

      await sequelize.query(`
        INSERT INTO ${schemaName}.rate_charts 
        (society_id, channel, uploaded_at, uploaded_by, file_name, record_count)
        VALUES ${chartValues}
      `, { transaction });

      // Get the FIRST inserted rate chart ID (master chart)
      const [firstChartResult] = await sequelize.query(`
        SELECT id FROM ${schemaName}.rate_charts
        WHERE society_id = ${societyIds[0]} AND channel = :channel
        ORDER BY id DESC
        LIMIT 1
      `, {
        replacements: { channel },
        transaction
      });

      const masterChartId = (firstChartResult as Array<{ id: number }>)[0].id;

      // Insert rate data ONCE for the master chart only
      if (rateData.length > 0) {
        const values = rateData.map(data => 
          `(${masterChartId}, ${data.CLR}, ${data.FAT}, ${data.SNF}, ${data.RATE})`
        ).join(',');

        await sequelize.query(`
          INSERT INTO ${schemaName}.rate_chart_data 
          (rate_chart_id, clr, fat, snf, rate)
          VALUES ${values}
        `, { transaction });
      }

      // Update other societies' rate_charts to reference the master chart
      if (societyIds.length > 1) {
        await sequelize.query(`
          UPDATE ${schemaName}.rate_charts
          SET shared_chart_id = ${masterChartId}
          WHERE society_id IN (${societyIds.slice(1).join(',')}) AND channel = :channel
        `, {
          replacements: { channel },
          transaction
        });
      }

      await transaction.commit();

      console.log(`📊 Rate chart uploaded: ${rateData.length} records for ${channel} channel, ${societyIds.length} societies`);

      return createSuccessResponse('Rate chart uploaded successfully', {
        recordCount: rateData.length,
        channel,
        societyCount: societyIds.length,
        societyIds
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('CSV upload error:', error);
    return createErrorResponse('Failed to process CSV upload', 500);
  }
}
