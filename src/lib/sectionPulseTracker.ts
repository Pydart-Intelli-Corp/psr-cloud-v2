import { Sequelize, QueryTypes } from 'sequelize';

/**
 * Section Pulse Tracker
 * 
 * Tracks first and last milk collections per society per day
 * Manages section start/end pulse and inactivity periods
 */

interface PulseUpdateResult {
  societyId: number;
  pulseDate: string;
  firstCollectionTime: Date | null;
  lastCollectionTime: Date | null;
  sectionEndTime: Date | null;
  pulseStatus: 'not_started' | 'active' | 'paused' | 'ended' | 'inactive';
  totalCollections: number;
  inactiveDays: number;
  createdAt?: Date | string | null;
}

export class SectionPulseTracker {
  /**
   * Update pulse on new milk collection
   * - Records first collection time (section start pulse)
   * - Updates last collection time
   * - Increments total collections counter (only for new collections)
   * 
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   * @param societyId Society database ID
   * @param collectionDateTime Collection datetime (YYYY-MM-DD HH:MM:SS)
   * @param isNewCollection Whether this is a new collection (not a duplicate update)
   */
  static async updatePulseOnCollection(
    sequelize: Sequelize,
    schemaName: string,
    societyId: number,
    collectionDateTime: Date | string,
    isNewCollection: boolean = true
  ): Promise<void> {
    try {
      // Parse collection datetime - handle both string and Date
      // Store as string to preserve IST timezone when passing to MySQL
      let collectionDateStr: string;
      let dateStr: string;
      
      if (typeof collectionDateTime === 'string') {
        // If it's a string like "2025-12-02 01:00:26", use it directly
        collectionDateStr = collectionDateTime;
        dateStr = collectionDateTime.split(' ')[0]; // Get "2025-12-02"
      } else {
        // Convert Date to IST string format: YYYY-MM-DD HH:MM:SS
        const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istDate = new Date(collectionDateTime.getTime() + offset);
        collectionDateStr = istDate.toISOString().slice(0, 19).replace('T', ' ');
        dateStr = collectionDateStr.split(' ')[0];
      }

      console.log(`📍 Updating pulse for society ${societyId} on ${dateStr} at ${collectionDateStr}`);
      console.log(`   🔢 isNewCollection flag: ${isNewCollection} (will ${isNewCollection ? 'INCREMENT' : 'NOT INCREMENT'} total_collections)`);

      // Check if pulse record exists for today
      const existingPulse = await sequelize.query<{
        id: number;
        first_collection_time: Date | null;
        total_collections: number;
        pulse_status: string;
      }>(`
        SELECT id, first_collection_time, total_collections, pulse_status
        FROM \`${schemaName}\`.section_pulse
        WHERE society_id = ? AND DATE(pulse_date) = ?
      `, {
        replacements: [societyId, dateStr],
        type: QueryTypes.SELECT
      });

      console.log(`🔍 Query result:`, { length: existingPulse?.length, data: existingPulse });

      if (!existingPulse || existingPulse.length === 0) {
        // First collection of the day - create new pulse record
        await sequelize.query(`
          INSERT INTO \`${schemaName}\`.section_pulse (
            society_id,
            pulse_date,
            first_collection_time,
            last_collection_time,
            pulse_status,
            total_collections,
            inactive_days,
            last_checked,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, 'active', 1, 0, NOW(), CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
        `, {
          replacements: [
            societyId,
            dateStr,
            collectionDateStr,
            collectionDateStr
          ]
        });

        console.log(`🟢 Section start pulse recorded at ${collectionDateStr}`);
      } else {
        // Update existing pulse record - restart if paused or ended
        const currentStatus = existingPulse[0].pulse_status;
        
        // Only increment total_collections if this is a new collection (not a duplicate update)
        const updateQuery = isNewCollection 
          ? `UPDATE \`${schemaName}\`.section_pulse
             SET 
               last_collection_time = ?,
               total_collections = total_collections + 1,
               pulse_status = 'active',
               section_end_time = NULL,
               last_checked = NOW(),
               updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
             WHERE society_id = ? AND DATE(pulse_date) = ?`
          : `UPDATE \`${schemaName}\`.section_pulse
             SET 
               last_collection_time = ?,
               pulse_status = 'active',
               section_end_time = NULL,
               last_checked = NOW(),
               updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
             WHERE society_id = ? AND DATE(pulse_date) = ?`;
        
        await sequelize.query(updateQuery, {
          replacements: [collectionDateStr, societyId, dateStr]
        });

        if (currentStatus === 'paused') {
          console.log(`▶️ Section restarted from pause - collection at ${collectionDateStr}`);
        } else if (currentStatus === 'ended') {
          console.log(`🔄 Section restarted from ended state - collection at ${collectionDateStr}`);
        } else {
          console.log(`🔵 Pulse updated - last collection at ${collectionDateStr}${isNewCollection ? '' : ' (duplicate, count unchanged)'}`);
        }
      }

      // Reset inactive days counter since we have activity
      await this.resetInactiveDays(sequelize, schemaName, societyId, dateStr);

    } catch (error) {
      console.error('❌ Error updating pulse on collection:', error);
      throw error;
    }
  }

  /**
   * Check for section pause (5 minutes of inactivity) and section end (60 minutes)
   * Should be called periodically (e.g., every 1-2 minutes)
   * 
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   */
  static async checkSectionPauseAndEnd(
    sequelize: Sequelize,
    schemaName: string
  ): Promise<void> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 1. End all active/paused sections from previous days
      const [oldPulses] = await sequelize.query<{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }>(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${schemaName}\`.section_pulse
        WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) < ?
        AND section_end_time IS NULL
      `, {
        replacements: [today],
        type: QueryTypes.SELECT
      }) as unknown as [{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }[]];

      // Mark old sections as ended
      for (const pulse of (oldPulses || [])) {
        const sectionEndTime = pulse.last_collection_time ? 
          new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000) : null;

        await sequelize.query(`
          UPDATE \`${schemaName}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = NOW(),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `, {
          replacements: [sectionEndTime, pulse.id]
        });

        console.log(`🔴 Old section ended for society ${pulse.society_id} (date: ${pulse.pulse_date})`);
      }

      // 2. Check for sections to pause (5 minutes inactive, currently active, TODAY only)
      const [activePulses] = await sequelize.query<{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }>(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${schemaName}\`.section_pulse
        WHERE pulse_status = 'active'
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND last_collection_time > ?
      `, {
        replacements: [today, fiveMinutesAgo, sixtyMinutesAgo],
        type: QueryTypes.SELECT
      }) as unknown as [{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }[]];

      // Mark sections as paused
      for (const pulse of (activePulses || [])) {
        await sequelize.query(`
          UPDATE \`${schemaName}\`.section_pulse
          SET 
            pulse_status = 'paused',
            last_checked = NOW(),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `, {
          replacements: [pulse.id]
        });

        console.log(`⏸️ Section paused for society ${pulse.society_id} - no collection for 5 minutes`);
      }

      // 3. Check for sections to end (60 minutes inactive, currently active or paused, TODAY only)
      const [inactivePulses] = await sequelize.query<{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }>(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${schemaName}\`.section_pulse
        WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND section_end_time IS NULL
      `, {
        replacements: [today, sixtyMinutesAgo],
        type: QueryTypes.SELECT
      }) as unknown as [{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }[]];

      // Mark sections as ended
      for (const pulse of (inactivePulses || [])) {
        const sectionEndTime = new Date(pulse.last_collection_time.getTime() + 60 * 60 * 1000);

        await sequelize.query(`
          UPDATE \`${schemaName}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `, {
          replacements: [sectionEndTime, pulse.id]
        });

        console.log(`🔴 Section end pulse recorded for society ${pulse.society_id} at ${sectionEndTime.toISOString()}`);
      }
    } catch (error) {
      console.error('❌ Error checking section pause and end:', error);
      throw error;
    }
  }

  /**
   * Check for section end (60 minutes of inactivity after last collection)
   * Should be called periodically (e.g., every 10-15 minutes)
   * 
   * @deprecated Use checkSectionPauseAndEnd instead for better granularity
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   */
  static async checkSectionEnd(
    sequelize: Sequelize,
    schemaName: string
  ): Promise<void> {
    try {
      const now = new Date();
      const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Find active pulses where last collection was > 60 minutes ago
      const [activePulses] = await sequelize.query<{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }>(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${schemaName}\`.section_pulse
        WHERE pulse_status = 'active'
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND section_end_time IS NULL
      `, {
        replacements: [sixtyMinutesAgo],
        type: QueryTypes.SELECT
      }) as unknown as [{
        id: number;
        society_id: number;
        pulse_date: string;
        last_collection_time: Date;
      }[]];

      for (const pulse of (activePulses || [])) {
        const sectionEndTime = new Date(pulse.last_collection_time.getTime() + 60 * 60 * 1000);

        await sequelize.query(`
          UPDATE \`${schemaName}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `, {
          replacements: [sectionEndTime, pulse.id]
        });

        console.log(`🔴 Section end pulse recorded for society ${pulse.society_id} at ${sectionEndTime.toISOString()}`);
      }
    } catch (error) {
      console.error('❌ Error checking section end:', error);
      throw error;
    }
  }

  /**
   * Check for multi-day inactivity
   * Updates inactive_days counter for societies without collections
   * 
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   */
  static async checkInactivity(
    sequelize: Sequelize,
    schemaName: string
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get all societies
      const [societies] = await sequelize.query<{ id: number }>(`
        SELECT id FROM \`${schemaName}\`.societies
        WHERE status = 'active'
      `, {
        type: QueryTypes.SELECT
      }) as unknown as [{ id: number }[]];

      for (const society of (societies || [])) {
        // Check if society has pulse record for today
        const [todayPulse] = await sequelize.query<{ id: number }>(`
          SELECT id FROM \`${schemaName}\`.section_pulse
          WHERE society_id = ? AND DATE(pulse_date) = ?
        `, {
          replacements: [society.id, today],
          type: QueryTypes.SELECT
        }) as unknown as [{ id: number }[]];

        if (!todayPulse || todayPulse.length === 0) {
          // No pulse today - check yesterday's pulse
          const [yesterdayPulse] = await sequelize.query<{
            inactive_days: number;
            pulse_status: string;
          }>(`
            SELECT inactive_days, pulse_status
            FROM \`${schemaName}\`.section_pulse
            WHERE society_id = ? AND DATE(pulse_date) = ?
          `, {
            replacements: [society.id, yesterday],
            type: QueryTypes.SELECT
          }) as unknown as [{
            inactive_days: number;
            pulse_status: string;
          }[]];

          let inactiveDays = 1;
          if (yesterdayPulse && yesterdayPulse.length > 0) {
            inactiveDays = (yesterdayPulse[0].inactive_days || 0) + 1;
          }

          // Create today's pulse record with inactive status
          await sequelize.query(`
            INSERT INTO \`${schemaName}\`.section_pulse (
              society_id,
              pulse_date,
              pulse_status,
              inactive_days,
              last_checked,
              created_at,
              updated_at
            ) VALUES (?, ?, 'inactive', ?, NOW(), CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
            ON DUPLICATE KEY UPDATE
              pulse_status = 'inactive',
              inactive_days = ?,
              last_checked = NOW(),
              updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          `, {
            replacements: [society.id, today, inactiveDays, inactiveDays]
          });

          console.log(`⚪ No pulse for society ${society.id} - ${inactiveDays} day(s) inactive`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking inactivity:', error);
      throw error;
    }
  }

  /**
   * Reset inactive days counter
   */
  private static async resetInactiveDays(
    sequelize: Sequelize,
    schemaName: string,
    societyId: number,
    pulseDate: string
  ): Promise<void> {
    await sequelize.query(`
      UPDATE \`${schemaName}\`.section_pulse
      SET inactive_days = 0
      WHERE society_id = ? AND DATE(pulse_date) = ?
    `, {
      replacements: [societyId, pulseDate]
    });
  }

  /**
   * Get pulse status for a society
   * 
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   * @param societyId Society database ID
   * @param date Date string (YYYY-MM-DD) - defaults to today
   */
  static async getPulseStatus(
    sequelize: Sequelize,
    schemaName: string,
    societyId: number,
    date?: string
  ): Promise<PulseUpdateResult | null> {
    try {
      const pulseDate = date || new Date().toISOString().split('T')[0];

      const pulseRecords = await sequelize.query(`
        SELECT 
          society_id,
          pulse_date,
          first_collection_time,
          last_collection_time,
          section_end_time,
          pulse_status,
          total_collections,
          inactive_days,
          created_at
        FROM \`${schemaName}\`.section_pulse
        WHERE society_id = ? AND DATE(pulse_date) = ?
      `, {
        replacements: [societyId, pulseDate],
        type: QueryTypes.SELECT
      }) as {
        society_id: number;
        pulse_date: string;
        first_collection_time: Date | null;
        last_collection_time: Date | null;
        section_end_time: Date | null;
        pulse_status: 'not_started' | 'active' | 'paused' | 'ended' | 'inactive';
        total_collections: number;
        inactive_days: number;
        created_at: Date | null;
      }[];

      if (!pulseRecords || pulseRecords.length === 0) {
        // No pulse record exists - section not started
        return {
          societyId,
          pulseDate,
          firstCollectionTime: null,
          lastCollectionTime: null,
          sectionEndTime: null,
          pulseStatus: 'not_started',
          totalCollections: 0,
          inactiveDays: 0,
          createdAt: null
        };
      }

      const pulse = pulseRecords[0];
      return {
        societyId: pulse.society_id,
        pulseDate: pulse.pulse_date,
        firstCollectionTime: pulse.first_collection_time,
        lastCollectionTime: pulse.last_collection_time,
        sectionEndTime: pulse.section_end_time,
        pulseStatus: pulse.pulse_status,
        totalCollections: pulse.total_collections,
        inactiveDays: pulse.inactive_days,
        createdAt: pulse.created_at
      };
    } catch (error) {
      console.error('❌ Error getting pulse status:', error);
      throw error;
    }
  }

  /**
   * Get pulse status for all societies
   * 
   * @param sequelize Sequelize instance
   * @param schemaName Admin schema name
   * @param date Date string (YYYY-MM-DD) - defaults to today
   */
  static async getAllPulseStatuses(
    sequelize: Sequelize,
    schemaName: string,
    date?: string
  ): Promise<PulseUpdateResult[]> {
    try {
      const pulseDate = date || new Date().toISOString().split('T')[0];

      const pulseRecords = await sequelize.query(`
        SELECT 
          s.id as society_id,
          s.name as society_name,
          COALESCE(sp.pulse_date, ?) as pulse_date,
          sp.first_collection_time,
          sp.last_collection_time,
          sp.section_end_time,
          COALESCE(sp.pulse_status, 'not_started') as pulse_status,
          COALESCE(sp.total_collections, 0) as total_collections,
          COALESCE(sp.inactive_days, 0) as inactive_days,
          sp.created_at
        FROM \`${schemaName}\`.societies s
        LEFT JOIN \`${schemaName}\`.section_pulse sp 
          ON s.id = sp.society_id AND DATE(sp.pulse_date) = ?
        WHERE s.status = 'active'
        ORDER BY s.name
      `, {
        replacements: [pulseDate, pulseDate],
        type: QueryTypes.SELECT
      }) as {
        society_id: number;
        society_name: string;
        pulse_date: string;
        first_collection_time: Date | null;
        last_collection_time: Date | null;
        section_end_time: Date | null;
        pulse_status: 'not_started' | 'active' | 'ended' | 'inactive';
        total_collections: number;
        inactive_days: number;
        created_at: Date | null;
      }[];

      return (pulseRecords || []).map(pulse => ({
        societyId: pulse.society_id,
        pulseDate: pulse.pulse_date,
        firstCollectionTime: pulse.first_collection_time,
        lastCollectionTime: pulse.last_collection_time,
        sectionEndTime: pulse.section_end_time,
        pulseStatus: pulse.pulse_status,
        totalCollections: pulse.total_collections,
        inactiveDays: pulse.inactive_days,
        createdAt: pulse.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting all pulse statuses:', error);
      throw error;
    }
  }
}
