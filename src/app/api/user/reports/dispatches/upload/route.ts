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
    dateStr = dateStr.trim();
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parts[2];
      
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

// Helper function to normalize shift type
function normalizeShift(shift: string): string {
  const shiftUpper = shift.toUpperCase().trim();
  if (shiftUpper === 'MR' || shiftUpper === 'MOR' || shiftUpper === 'MORNING') {
    return 'MOR';
  } else if (shiftUpper === 'ER' || shiftUpper === 'EVE' || shiftUpper === 'EVENING') {
    return 'EVE';
  }
  return shiftUpper;
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 5) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }

    // Extract machine serial from first line
    let machineSerial = machineSerialFromForm;
    const firstLine = lines[0];
    const serialMatch = firstLine.match(/Machine Serial:(\d+)/i);
    if (serialMatch) {
      machineSerial = serialMatch[1].trim();
    }

    if (!machineSerial) {
      return NextResponse.json({ error: 'Machine serial not found in CSV' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'CSV header not found' }, { status: 400 });
    }

    // Verify machine exists and get its details
    const machineQuery = `
      SELECT m.id, m.machine_id, m.machine_type, m.machine_model, m.society_id, s.name as society_name, s.society_id as society_code
      FROM \`${schemaName}\`.machines m
      LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
      WHERE m.machine_id = ?
      LIMIT 1
    `;

    const [machines] = await sequelize.query(machineQuery, {
      replacements: [machineSerial]
    });

    if (!machines || machines.length === 0) {
      return NextResponse.json({ 
        error: `Machine with serial ${machineSerial} not found. Please register the machine first.` 
      }, { status: 404 });
    }

    const machine: any = machines[0];

    // Parse data rows
    const dispatches: DispatchRow[] = [];
    const headers = lines[headerIndex].split(',').map(h => h.trim().toLowerCase());
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip summary lines
      if (line.toLowerCase().includes('avg.') || 
          line.toLowerCase().includes('total') ||
          line.toLowerCase().includes('liters') ||
          line.toLowerCase().includes('amount') ||
          line.toLowerCase().includes('rate')) {
        continue;
      }

      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 7) continue; // Skip incomplete rows

      try {
        const row: DispatchRow = {
          date: parseDate(values[0]),
          time: values.length > 8 ? values[1] : '00:00:00',
          shift: normalizeShift(values.length > 8 ? values[2] : values[1]),
          fat: parseFloat(values.length > 8 ? values[3] : values[2]) || 0,
          snf: parseFloat(values.length > 8 ? values[4] : values[3]) || 0,
          clr: parseFloat(values.length > 8 ? values[5] : values[4]) || 0,
          quantity: parseFloat(values.length > 8 ? values[6] : values[5]) || 0,
          rate: parseFloat(values.length > 8 ? values[7] : values[6]) || 0,
          amount: parseFloat(values.length > 8 ? values[8] : values[7]) || 0,
          channel: values.length > 9 ? normalizeChannel(values[9]) : 'MIXED'
        };

        dispatches.push(row);
      } catch (error) {
        console.error('Error parsing row:', line, error);
      }
    }

    if (dispatches.length === 0) {
      return NextResponse.json({ error: 'No valid dispatch records found in CSV' }, { status: 400 });
    }

    // Insert dispatches into database
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const dispatch of dispatches) {
      try {
        const insertQuery = `
          INSERT INTO \`${schemaName}\`.milk_dispatches (
            society_id, machine_id, dispatch_date, dispatch_time,
            shift_type, channel, fat_percentage, snf_percentage, clr_value,
            quantity, rate_per_liter, total_amount,
            machine_type, machine_version, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await sequelize.query(insertQuery, {
          replacements: [
            machine.society_id,
            machine.machine_id,
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
            machine.machine_model || 'V1',
          ]
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push(`Date ${dispatch.date}: ${error.message}`);
        console.error('Error inserting dispatch:', error);
      }
    }

    return NextResponse.json({
      message: 'Upload completed',
      machineSerial,
      societyName: machine.society_name,
      totalRows: dispatches.length,
      successCount,
      errorCount,
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
