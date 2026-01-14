import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { sendMachineUpdateEmail } from '@/lib/emailService';
import { QueryTypes } from 'sequelize';

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
    const assignmentType = formData.get('assignmentType') as string || 'society';
    const societyIdsStr = formData.get('societyIds') as string;
    const bmcIdsStr = formData.get('bmcIds') as string;
    const channel = formData.get('channel') as string;

    if (!file) {
      return createErrorResponse('CSV file is required', 400);
    }

    // Validate assignment type and get IDs
    let targetIds: string[] = [];
    let isBmcAssignment = false;
    
    if (assignmentType === 'bmc') {
      if (!bmcIdsStr) {
        return createErrorResponse('BMC ID(s) required', 400);
      }
      targetIds = bmcIdsStr.split(',').map(id => id.trim()).filter(id => id);
      isBmcAssignment = true;
    } else {
      if (!societyIdsStr) {
        return createErrorResponse('Society ID(s) required', 400);
      }
      targetIds = societyIdsStr.split(',').map(id => id.trim()).filter(id => id);
    }

    if (targetIds.length === 0) {
      return createErrorResponse(`At least one ${isBmcAssignment ? 'BMC' : 'society'} ID is required`, 400);
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
      // Delete existing charts for the target entities
      if (isBmcAssignment) {
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_data
          WHERE rate_chart_id IN (
            SELECT id FROM ${schemaName}.rate_charts
            WHERE bmc_id IN (${targetIds.join(',')}) AND channel = :channel AND is_bmc_assigned = 1
          )
        `, { replacements: { channel }, transaction });

        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_charts
          WHERE bmc_id IN (${targetIds.join(',')}) AND channel = :channel AND is_bmc_assigned = 1
        `, { replacements: { channel }, transaction });
      } else {
        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_chart_data
          WHERE rate_chart_id IN (
            SELECT id FROM ${schemaName}.rate_charts
            WHERE society_id IN (${targetIds.join(',')}) AND channel = :channel AND is_bmc_assigned = 0
          )
        `, { replacements: { channel }, transaction });

        await sequelize.query(`
          DELETE FROM ${schemaName}.rate_charts
          WHERE society_id IN (${targetIds.join(',')}) AND channel = :channel AND is_bmc_assigned = 0
        `, { replacements: { channel }, transaction });
      }

      // Insert rate chart records
      const idColumn = isBmcAssignment ? 'bmc_id' : 'society_id';
      const chartValues = targetIds.map(id => 
        `(${id}, '${channel}', NOW(), '${user.fullName.replace(/'/g, "''")}', '${file.name.replace(/'/g, "''")}', ${rateData.length}, 1, ${isBmcAssignment ? 1 : 0})`
      ).join(',');

      await sequelize.query(`
        INSERT INTO ${schemaName}.rate_charts 
        (${idColumn}, channel, uploaded_at, uploaded_by, file_name, record_count, status, is_bmc_assigned)
        VALUES ${chartValues}
      `, { transaction });

      // Get the FIRST inserted rate chart ID (master chart)
      const [firstChartResult] = await sequelize.query(`
        SELECT id FROM ${schemaName}.rate_charts
        WHERE ${idColumn} = ${targetIds[0]} AND channel = :channel
        ORDER BY id DESC
        LIMIT 1
      `, { replacements: { channel }, transaction });

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

      // Update other entities' rate_charts to reference the master chart
      if (targetIds.length > 1) {
        await sequelize.query(`
          UPDATE ${schemaName}.rate_charts
          SET shared_chart_id = ${masterChartId}
          WHERE ${idColumn} IN (${targetIds.slice(1).join(',')}) AND channel = :channel
        `, { replacements: { channel }, transaction });
      }

      await transaction.commit();

      console.log(`📊 Rate chart uploaded: ${rateData.length} records for ${channel} channel, ${targetIds.length} ${isBmcAssignment ? 'BMCs' : 'societies'}`);

      // Send email notifications only for society assignments
      if (!isBmcAssignment) {
      const [societyMachines] = await sequelize.query<{
        society_id: number;
        society_name: string;
        society_email: string;
        machine_type: string;
        machine_id: string;
      }>(`
        SELECT s.id as society_id, s.name as society_name, s.email as society_email,
               m.machine_type, m.machine_id
        FROM ${schemaName}.societies s
        INNER JOIN ${schemaName}.machines m ON m.society_id = s.id
        WHERE s.id IN (${targetIds.join(',')}) AND s.email IS NOT NULL AND s.email != ''
      `, { type: QueryTypes.SELECT });

      if (Array.isArray(societyMachines) && societyMachines.length > 0) {
        // Group by society to send one email per society
        const societyMap = new Map<string, { societyName: string; email: string; machines: Array<{ type: string; id: string }> }>();
        
        for (const row of societyMachines) {
          if (!societyMap.has(row.society_email)) {
            societyMap.set(row.society_email, {
              societyName: row.society_name,
              email: row.society_email,
              machines: []
            });
          }
          societyMap.get(row.society_email)!.machines.push({
            type: row.machine_type,
            id: row.machine_id
          });
        }

        // Send emails to each society
        for (const [email, data] of societyMap) {
          for (const machine of data.machines) {
            sendMachineUpdateEmail(email, {
              machineName: machine.type || `Machine ${machine.id}`,
              machineId: machine.id,
              societyName: data.societyName,
              updateType: 'ratechart',
              channel,
              recordCount: rateData.length,
              updatedBy: user.fullName
            }).catch(err => console.error(`Failed to send rate chart email to ${email}:`, err));
          }
        }
      }
    }
    } catch (error) {
      await transaction.rollback();
      console.error('Rate chart upload error:', error);
      return createErrorResponse('Failed to process rate chart upload', 500);
    }

    return createSuccessResponse(`Successfully uploaded ${rateData.length} rate records for ${channel} channel to ${targetIds.length} ${isBmcAssignment ? 'BMC(s)' : 'society/societies'}`, {
      recordCount: rateData.length,
      targetCount: targetIds.length,
      channel,
      assignmentType
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return createErrorResponse('Failed to process rate chart upload', 500);
  }
}
