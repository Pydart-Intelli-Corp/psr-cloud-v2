import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
  dbKey?: string;
}

interface DispatchRow {
  dispatchId: string;
  date: string;
  time: string;
  shift: string;
  fat: number;
  snf: number;
  clr: number;
  quantity: number;
  rate: number;
  amount: number;
  channel?: string;
}

// Helper function to parse date in DD-M-YY or DD/M/YY format to YYYY-MM-DD
function parseDate(dateStr: string): string {
  try {
    // Remove any whitespace
    dateStr = dateStr.trim();
    
    // Check if already in YYYY-MM-DD format (4-digit year at start)
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
      // Already in correct format, just ensure 2-digit month and day
      const parts = dateStr.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Handle formats like "19-1-26", "19/1/26" (DD-M-YY or DD/M/YY)
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      // Check if first part is a 4-digit year (YYYY-MM-DD or YYYY/MM/DD)
      if (parts[0].length === 4) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      // Otherwise treat as DD-M-YY format
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parts[2];
      
      // Convert 2-digit year to 4-digit (assume 20xx for years < 50, 19xx otherwise)
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum < 50 ? `20${year}` : `19${year}`;
      }
      
      return `${year}-${month}-${day}`;
    }
    
    return dateStr;
  } catch (error) {
    console.error('Date parse error:', error);
    return dateStr;
  }
}

// Helper function to parse time from 12-hour to 24-hour format
function parseTime(timeStr: string): string {
  try {
    timeStr = timeStr.trim();
    
    // Check if it's already in 24-hour format (HH:MM:SS)
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    
    // Parse 12-hour format with AM/PM (e.g., "02:07:14PM")
    const match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const seconds = match[3];
      const period = match[4].toUpperCase();
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    }
    
    return timeStr;
  } catch (error) {
    console.error('Time parse error:', error);
    return '00:00:00';
  }
}

// Helper function to remove leading zeros from farmer ID
function stripLeadingZeros(id: string): string {
  // Remove all leading zeros: "000001" → "1", "0001" → "1", "01" → "1"
  const stripped = id.replace(/^0+/, '');
  // If all zeros, return "0"
  return stripped || '0';
}

// Helper function to normalize shift type
function normalizeShift(shift: string): string {
  const shiftUpper = shift.toUpperCase().trim();
  const firstChar = shiftUpper.charAt(0);
  
  // If starts with M (MR, MOR, MORNING, MX, etc.) → morning
  if (firstChar === 'M') {
    return 'morning';
  }
  // If starts with E (ER, EVE, EVENING, EV, EX, etc.) → evening
  else if (firstChar === 'E') {
    return 'evening';
  }
  
  return 'morning'; // Default to morning
}

// Helper function to normalize channel
function normalizeChannel(channel: string): string {
  const channelUpper = channel.toUpperCase().trim();
  if (channelUpper === 'COW' || channelUpper === 'CH1') {
    return 'COW';
  } else if (channelUpper === 'BUFFALO' || channelUpper === 'BUF' || channelUpper === 'CH2') {
    return 'BUFFALO';
  } else if (channelUpper === 'MIXED' || channelUpper === 'MIX' || channelUpper === 'CH3') {
    return 'MIXED';
  }
  return channelUpper;
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin schema not found' }, { status: 404 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const machineSerialFromForm = formData.get('machineSerial') as string;
    const machineIdFromForm = formData.get('machineId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 5) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }

    // Extract machine serial from first line or CSV content
    let machineSerial = machineSerialFromForm;
    let machineDbId = machineIdFromForm;
    const firstLine = lines[0];
    
    // Check for machine serial in CSV
    if (lines.length > 1 && !machineSerial && !machineDbId) {
      const secondLine = lines[1];
      if (/^\d+$/.test(secondLine)) {
        machineSerial = secondLine.trim();
      }
    }

    if (!machineSerial && !machineDbId) {
      return NextResponse.json({ error: 'Machine serial not found in CSV or form data' }, { status: 400 });
    }

    // Verify machine exists and get its details FIRST (before header check for better error messages)
    const machineQuery = machineDbId
      ? `SELECT m.id, m.machine_id, m.machine_type, m.society_id, s.name as society_name, s.society_id as society_code
         FROM \`${schemaName}\`.machines m
         LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
         WHERE m.id = ?
         LIMIT 1`
      : `SELECT m.id, m.machine_id, m.machine_type, m.society_id, s.name as society_name, s.society_id as society_code
         FROM \`${schemaName}\`.machines m
         LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
         WHERE m.machine_id = ?
         LIMIT 1`;

    const [machines] = await sequelize.query(machineQuery, {
      replacements: [machineDbId || machineSerial]
    });

    if (!machines || machines.length === 0) {
      return NextResponse.json({ 
        error: `Machine not found. Please register the machine first.` 
      }, { status: 404 });
    }

    const machine: any = machines[0];
    const expectedFormat = machine.machine_type?.toLowerCase().includes('ecod') ? 'ECOD' : 'LSE/SD';

    // Find the header line
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('date') && 
          (lines[i].toLowerCase().includes('time') || lines[i].toLowerCase().includes('shift'))) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      const ecodExample = expectedFormat === 'ECOD' 
        ? 'Date&Time, ID, Milk, Fat, SNF, CLR, Qty, Rate, Amount'
        : 'Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount';
      
      return NextResponse.json({ 
        error: `❌ Header Row Not Found in Dispatch CSV`,
        reportType: 'Dispatch Report',
        machineType: machine.machine_type,
        expectedFormat: expectedFormat,
        help: `Your CSV file is missing a proper header row.\n\nFor ${expectedFormat} format Dispatch reports, the header should include:\n• ${ecodExample}\n\nPlease check:\n1. First few lines contain machine info/metadata\n2. Header row comes after metadata\n3. Header contains column names separated by commas`,
        suggestion: '💡 Tip: Open your CSV file and ensure it has a row with column names like Date, Time, Shift, etc.'
      }, { status: 400 });
    }

    // Determine expected format based on machine type (already set above, now detect CSV format)
    const csvFormatExpected = expectedFormat.toLowerCase() === 'ecod' ? 'ecod' : 'standard';
    
    // Detect actual CSV format
    const csvFormatIsEcod = firstLine.toLowerCase().includes('station');
    const detectedFormat = csvFormatIsEcod ? 'ecod' : 'standard';
    
    // Check for format mismatch
    if (csvFormatExpected !== detectedFormat) {
      const errorMessage = csvFormatExpected === 'ecod' 
        ? `❌ Format Mismatch: Selected machine is ECOD type, but CSV file is in LSE/SD format`
        : `❌ Format Mismatch: Selected machine is LSE/SD type, but CSV file is in ECOD format`;
      
      const helpMessage = csvFormatExpected === 'ecod'
        ? `Expected ECOD format:\n• First line: "Station :"\n• Columns for dispatch: Date&Time, ID, Milk, Fat, SNF, CLR, Qty, Rate, Amount\n\nFound LSE/SD format:\n• First line: "Machine Serial:XXX"\n• Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount`
        : `Expected LSE/SD format:\n• First line: "Machine Serial:XXX"\n• Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount\n\nFound ECOD format:\n• First line: "Station :"\n• Columns for dispatch: Date&Time, ID, Milk, Fat, SNF, CLR, Qty, Rate, Amount`;
      
      return NextResponse.json({ 
        error: errorMessage,
        help: helpMessage,
        detectedFormat: detectedFormat.toUpperCase(),
        expectedFormat: expectedFormat.toUpperCase(),
        machineType: machine.machine_type,
        suggestion: csvFormatExpected === 'ecod' 
          ? '💡 Solution: Either upload an ECOD format CSV file, or select a different machine (LSE/SD type) for this upload.'
          : '💡 Solution: Either upload an LSE/SD format CSV file, or select an ECOD machine if you have ECOD format data.'
      }, { status: 400 });
    }
    
    const isEcodFormat = detectedFormat === 'ecod';
    
    console.log('\n=== CSV Dispatch Upload Debug ===');
    console.log('Machine:', machine.machine_id, '|', machine.machine_type);
    console.log('Format:', isEcodFormat ? 'ECOD' : 'LSE/SD');

    // Parse data rows
    const dispatches: DispatchRow[] = [];
    const headers = lines[headerIndex].split(',').map(h => h.trim().replace(/[^a-zA-Z0-9&]/g, '').toLowerCase());
    
    console.log('Header Index:', headerIndex);
    console.log('Header Line:', lines[headerIndex]);
    console.log('Total Lines:', lines.length);
    console.log('Headers:', headers);
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and summary lines
      if (!line || 
          line.toLowerCase().includes('avg.') || 
          line.toLowerCase().includes('total') ||
          line.toLowerCase().includes('liters') ||
          line.toLowerCase().includes('amount') ||
          line.toLowerCase().includes('rate')) {
        continue;
      }

      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 7) {
        console.log('Skipping incomplete row:', values.length, 'columns');
        continue;
      }

      try {
        let row: DispatchRow;
        
        if (isEcodFormat) {
          // ECOD Format: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total
          // For dispatch, we don't have farmer ID/Name, but structure is similar
          row = {
            dispatchId: stripLeadingZeros(values[3] || '1'), // ID column with leading zeros removed
            date: parseDate(values[0]),
            time: parseTime(values[1] || '00:00:00'),
            shift: normalizeShift(values[2]),
            channel: normalizeChannel(values[5] || 'MIXED'), // Milk type becomes channel
            fat: parseFloat(values[6]) || 0,
            snf: parseFloat(values[7]) || 0,
            clr: parseFloat(values[8]) || 0,
            quantity: parseFloat(values[12]) || 0, // Qty column
            rate: parseFloat(values[10]) || 0,
            amount: parseFloat(values[13]) || 0 // Total column
          };
          
          if (dispatches.length < 3) {
            console.log(`\nRow ${i - headerIndex}: ECOD Format`);
            console.log('Raw values:', values);
            console.log('Parsed:', row);
          }
        } else {
          // ===== LSE/SD FORMAT =====
          // Used by: LSE, SD, and other standard format machines
          // Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount
          // Example: 2026-01-28,14:32:20,MR,1001,COW,10.00,0.00,0,99,10.00,0.00,0.00,0.00
          row = {
            dispatchId: stripLeadingZeros(values[3] || '1'), // Column 4: ID
            date: parseDate(values[0]),                      // Column 1: Date
            time: parseTime(values[1] || '00:00:00'),       // Column 2: Time
            shift: normalizeShift(values[2]),                // Column 3: Shift
            channel: normalizeChannel(values[4]),            // Column 5: Channel
            fat: parseFloat(values[5]) || 0,                 // Column 6: Fat
            snf: parseFloat(values[6]) || 0,                 // Column 7: SNF
            clr: parseFloat(values[7]) || 0,                 // Column 8: CLR
            // Note: values[8] is Water (not used in dispatch)
            quantity: parseFloat(values[9]) || 0,            // Column 10: Qty
            rate: parseFloat(values[10]) || 0,               // Column 11: Rate
            // Note: values[11] is Incentive (not used in dispatch)
            amount: parseFloat(values[12]) || 0              // Column 13: Amount
          };
          
          if (dispatches.length < 3) {
            console.log(`\nRow ${i - headerIndex}: LSE/SD Format`);
            console.log('Raw values:', values);
            console.log('Parsed:', row);
          }
        }

        dispatches.push(row);
      } catch (error) {
        console.error('Error parsing row:', line, error);
      }
    }
    
    console.log('Parsed Dispatches:', dispatches.length);
    if (dispatches.length > 0) {
      console.log('Sample Row:', JSON.stringify(dispatches[0], null, 2));
    }

    if (dispatches.length === 0) {
      return NextResponse.json({ error: 'No valid dispatch records found in CSV' }, { status: 400 });
    }

    // Insert dispatches into database
    let insertCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const duplicates: string[] = [];

    console.log('\n=== Starting Database Inserts ===');
    
    // Check table structure to see if dispatch_id needs to be generated
    const [tableInfo] = await sequelize.query(`
      DESCRIBE \`${schemaName}\`.milk_dispatches
    `);
    console.log('Table structure:', tableInfo);

    for (let idx = 0; idx < dispatches.length; idx++) {
      const dispatch = dispatches[idx];
      try {
        const insertQuery = `
          INSERT INTO \`${schemaName}\`.milk_dispatches (
            dispatch_id, society_id, machine_id, dispatch_date, dispatch_time,
            shift_type, channel, fat_percentage, snf_percentage, clr_value,
            quantity, rate_per_liter, total_amount, machine_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            channel = VALUES(channel),
            fat_percentage = VALUES(fat_percentage),
            snf_percentage = VALUES(snf_percentage),
            clr_value = VALUES(clr_value),
            quantity = VALUES(quantity),
            rate_per_liter = VALUES(rate_per_liter),
            total_amount = VALUES(total_amount),
            machine_type = VALUES(machine_type)
        `;

        const [result]: any = await sequelize.query(insertQuery, {
          replacements: [
            dispatch.dispatchId,
            machine.society_id,
            machine.id,
            dispatch.date,
            dispatch.time,
            dispatch.shift,
            dispatch.channel || 'MIXED',
            dispatch.fat,
            dispatch.snf,
            dispatch.clr,
            dispatch.quantity,
            dispatch.rate,
            dispatch.amount,
            machine.machine_type || 'UNKNOWN',
          ]
        });

        const affectedRows = result.affectedRows || 0;
        
        if (affectedRows === 1) {
          insertCount++;
          if (insertCount <= 3) {
            console.log(`✅ New: Dispatch ${dispatch.dispatchId} | ${dispatch.date} ${dispatch.shift} | ${dispatch.quantity}L @ ₹${dispatch.rate}`);
          }
        } else if (affectedRows === 2) {
          updateCount++;
          duplicates.push(`${dispatch.dispatchId} on ${dispatch.date} (${dispatch.shift})`);
          if (updateCount <= 3) {
            console.log(`🔄 Updated: Dispatch ${dispatch.dispatchId} | ${dispatch.date} ${dispatch.shift} | Already existed, data synced`);
          }
        }
      } catch (error: any) {
        errorCount++;
        errors.push(`Row ${idx + 1} (${dispatch.date}): ${error.message}`);
        if (errorCount <= 3) {
          console.error(`❌ Failed: Row ${idx + 1} |`, error.message);
        }
      }
    }
    
    console.log('\n=== Upload Summary ===');
    console.log('Total Rows:', dispatches.length);
    console.log('New Records:', insertCount);
    console.log('Duplicates Updated:', updateCount);
    console.log('Errors:', errorCount);
    console.log('=====================\n');

    let message = 'Upload completed';
    if (insertCount > 0 && updateCount > 0) {
      message = `Synced ${insertCount} new records and updated ${updateCount} existing records`;
    } else if (insertCount > 0) {
      message = `Successfully uploaded ${insertCount} new records`;
    } else if (updateCount > 0) {
      message = `All ${updateCount} records already exist - data synced`;
    }

    return NextResponse.json({
      message,
      machineSerial: machine.machine_id,
      societyName: machine.society_name,
      totalRows: dispatches.length,
      insertCount,
      updateCount,
      duplicateCount: updateCount,
      errorCount,
      duplicates: duplicates.slice(0, 5),
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Error uploading dispatch data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload dispatch data' },
      { status: 500 }
    );
  }
}
