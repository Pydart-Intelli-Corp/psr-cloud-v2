import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { masterChartId, societyIds, replaceExisting } = body;

    if (!masterChartId || !societyIds || !Array.isArray(societyIds) || societyIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Master chart ID and society IDs are required' },
        { status: 400 }
      );
    }

    const sequelize = await connectDB();
    if (!sequelize) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { User } = await import('@/models').then(m => m.getModels());
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.dbKey) {
      return NextResponse.json(
        { success: false, message: 'Admin schema not found' },
        { status: 404 }
      );
    }

    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    // Verify the master chart exists and is indeed a master chart
    const [masterChartRows] = await sequelize.query(`
      SELECT * FROM ${schemaName}.rate_charts WHERE id = ? AND shared_chart_id IS NULL
    `, { replacements: [masterChartId] }) as [Record<string, unknown>[], unknown];

    if (!masterChartRows || masterChartRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Master chart not found' },
        { status: 404 }
      );
    }

    const master = masterChartRows[0];

    // Check for conflicts: societies that already have a chart for this channel
    const [conflictingAssignments] = await sequelize.query(`
      SELECT 
        rc.id,
        rc.society_id as societyId,
        s.name as societyName,
        rc.channel,
        rc.file_name as fileName,
        CASE 
          WHEN rc.shared_chart_id IS NULL THEN rc.id
          ELSE rc.shared_chart_id
        END as masterChartId
      FROM ${schemaName}.rate_charts rc
      LEFT JOIN ${schemaName}.societies s ON rc.society_id = s.id
      WHERE rc.society_id IN (?) AND rc.channel = ?
    `, { replacements: [societyIds, master.channel] }) as [Record<string, unknown>[], unknown];

    if (conflictingAssignments.length > 0 && !replaceExisting) {
      // Return conflict information for user confirmation
      const conflicts = conflictingAssignments.map(row => ({
        societyId: row.societyId,
        societyName: row.societyName,
        currentFileName: row.fileName,
        currentMasterChartId: row.masterChartId
      }));

      return NextResponse.json({
        success: false,
        requiresConfirmation: true,
        message: `${conflicts.length} ${conflicts.length === 1 ? 'society' : 'societies'} already have a ${master.channel} chart assigned`,
        conflicts
      }, { status: 409 });
    }

    // If replaceExisting is true, handle the old assignments properly
    if (replaceExisting && conflictingAssignments.length > 0) {
      const transaction = await sequelize.transaction();
      
      try {
        for (const conflict of conflictingAssignments) {
          const conflictChartId = conflict.id as number;
          const conflictSocietyId = conflict.societyId as number;
          const conflictMasterChartId = conflict.masterChartId as number;
          const isConflictMaster = conflict.shared_chart_id === null;

          if (isConflictMaster) {
            // Check if other societies are using this master chart
            const [sharedUsage] = await sequelize.query(`
              SELECT COUNT(*) as count FROM ${schemaName}.rate_charts
              WHERE shared_chart_id = ?
            `, { 
              replacements: [conflictChartId],
              transaction 
            });

            const sharedCount = (sharedUsage[0] as { count: number }).count;

            if (sharedCount > 0) {
              // Transfer ownership to first shared society
              const [firstShared] = await sequelize.query(`
                SELECT id FROM ${schemaName}.rate_charts
                WHERE shared_chart_id = ?
                ORDER BY id ASC LIMIT 1
              `, { 
                replacements: [conflictChartId],
                transaction 
              });

              const newMasterId = (firstShared[0] as { id: number }).id;

              // Transfer data ownership
              await sequelize.query(`
                UPDATE ${schemaName}.rate_chart_data
                SET rate_chart_id = ?
                WHERE rate_chart_id = ?
              `, { 
                replacements: [newMasterId, conflictChartId],
                transaction 
              });

              // Promote shared chart to master
              await sequelize.query(`
                UPDATE ${schemaName}.rate_charts
                SET shared_chart_id = NULL
                WHERE id = ?
              `, { 
                replacements: [newMasterId],
                transaction 
              });

              // Update other shared charts
              await sequelize.query(`
                UPDATE ${schemaName}.rate_charts
                SET shared_chart_id = ?
                WHERE shared_chart_id = ? AND id != ?
              `, { 
                replacements: [newMasterId, conflictChartId, newMasterId],
                transaction 
              });
            } else {
              // No shared usage - delete data
              await sequelize.query(`
                DELETE FROM ${schemaName}.rate_chart_data
                WHERE rate_chart_id = ?
              `, { 
                replacements: [conflictChartId],
                transaction 
              });
            }
          }

          // Delete download history
          await sequelize.query(`
            DELETE FROM ${schemaName}.rate_chart_download_history
            WHERE rate_chart_id = ?
          `, { 
            replacements: [conflictChartId],
            transaction 
          });

          // Delete the chart record
          await sequelize.query(`
            DELETE FROM ${schemaName}.rate_charts
            WHERE id = ?
          `, { 
            replacements: [conflictChartId],
            transaction 
          });
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    // Check which societies already have this exact chart assigned (after potential deletions)
    const [existingAssignments] = await sequelize.query(`
      SELECT society_id as societyId FROM ${schemaName}.rate_charts 
       WHERE (id = ? OR shared_chart_id = ?) AND society_id IN (?)
    `, { replacements: [masterChartId, masterChartId, societyIds] }) as [Record<string, unknown>[], unknown];

    const existingSocietyIds = existingAssignments.map((row) => (row as { societyId: number }).societyId);
    const newSocietyIds = societyIds.filter((id: number) => !existingSocietyIds.includes(id));

    if (newSocietyIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'All selected societies already have this chart assigned' },
        { status: 400 }
      );
    }

    // Get society details for new assignments
    const [societies] = await sequelize.query(`
      SELECT id, name, society_id FROM ${schemaName}.societies WHERE id IN (?)
    `, { replacements: [newSocietyIds] }) as [Record<string, unknown>[], unknown];

    // Create shared chart records for each new society
    const insertPromises = societies.map((society) => {
      const soc = society as { id: number; name: string; society_id: string };
      return sequelize.query(
        `INSERT INTO ${schemaName}.rate_charts 
         (society_id, channel, uploaded_at, uploaded_by, file_name, record_count, shared_chart_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            soc.id,
            master.channel,
            new Date(),
            user.fullName,
            master.file_name,
            master.record_count,
            masterChartId,
            1
          ]
        }
      );
    });

    await Promise.all(insertPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned chart to ${newSocietyIds.length} new ${newSocietyIds.length === 1 ? 'society' : 'societies'}`,
      data: {
        assignedCount: newSocietyIds.length,
        skippedCount: existingSocietyIds.length
      }
    });

  } catch (error) {
    console.error('Error assigning chart to societies:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
