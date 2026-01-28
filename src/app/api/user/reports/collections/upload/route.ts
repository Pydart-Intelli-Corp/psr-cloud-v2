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

interface CollectionRow {
  date: string;
  time: string;
  shift: string;
  farmerId: string;
  channel: string;
  fat: number;
  snf: number;
  clr: number;
  water: number;
  quantity: number;
  rate: number;
  incentive: number;
  amount: number;
}

// Helper function to parse date in DD-M-YY or DD/M/YY format to YYYY-MM-DD
function parseDate(dateStr: string): string {
  try {
    // Remove any whitespace
    dateStr = dateStr.trim();
    
    // Handle formats like "19-1-26", "19/1/26"
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
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

// Helper function to parse time from 12-hour to 24-hour format
function parseTime(timeStr: string): string {
  try {
    timeStr = timeStr.trim();
    
    // Check if already in 24-hour format (no AM/PM)
    if (!/AM|PM/i.test(timeStr)) {
      return timeStr;
    }
    
    // Parse 12-hour format: "02:07:14PM" or "02:07:14 PM"
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

    const firstLine = lines[0];

    // Extract machine serial from first line or use machineId from form
    let machineSerial = '';
    let machineDbId: number | null = null;
    
    // Check if machineId is provided from the form (new upload dialog)
    if (machineIdFromForm) {
      // Could be either database ID or machine_id (serial)
      if (/^\d+$/.test(machineIdFromForm)) {
        machineDbId = parseInt(machineIdFromForm);
      } else {
        machineSerial = machineIdFromForm;
      }
    } else {
      // Try to extract from CSV (old method)
      
      // Check for standard format: "Machine Serial:XXXXX"
      const serialMatch = firstLine.match(/Machine Serial:(\d+)/i);
      if (serialMatch) {
        machineSerial = serialMatch[1].trim();
      } else {
        // Check for ECOD format: "Station :" with serial on next line
        if (firstLine.toLowerCase().includes('station') && lines.length > 1) {
          machineSerial = lines[1].trim();
        }
      }
    }

    if (!machineSerial && !machineDbId) {
      return NextResponse.json({ error: 'Machine serial not found in CSV or form data' }, { status: 400 });
    }

    // Find the header line (contains "Date,Time,Shift")
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('date') && lines[i].toLowerCase().includes('time')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      return NextResponse.json({ error: 'CSV header not found' }, { status: 400 });
    }

    // Verify machine exists and get its details
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

    // Detect if ECOD format
    const isEcodFormat = machine.machine_type?.toLowerCase().includes('ecod') || 
                         firstLine.toLowerCase().includes('station');
    
    console.log('\n=== CSV Upload Debug ===');
    console.log('Machine:', machine.machine_id, '|', machine.machine_type);
    console.log('Format:', isEcodFormat ? 'ECOD' : 'Standard');
    console.log('Header Index:', headerIndex);
    console.log('Header Line:', lines[headerIndex]);
    console.log('Total Lines:', lines.length);

    // Parse data rows
    const collections: CollectionRow[] = [];
    const headers = lines[headerIndex].split(',').map(h => h.trim().toLowerCase());
    
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
      
      if (values.length < 12) {
        console.log('Skipping incomplete row:', values.length, 'columns');
        continue;
      }

      try {
        let row: CollectionRow;
        
        if (isEcodFormat) {
          // ECOD Format: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total
          row = {
            date: parseDate(values[0]),
            time: parseTime(values[1] || '00:00:00'),
            shift: normalizeShift(values[2]),
            farmerId: stripLeadingZeros(values[3] || '0'),
            channel: normalizeChannel(values[5] || 'COW'), // Milk type becomes channel
            fat: parseFloat(values[6]) || 0,
            snf: parseFloat(values[7]) || 0,
            clr: parseFloat(values[8]) || 0,
            water: parseFloat(values[9]) || 0,
            quantity: parseFloat(values[12]) || 0, // Qty column
            rate: parseFloat(values[10]) || 0,
            incentive: parseFloat(values[11]) || 0, // Bonus becomes incentive
            amount: parseFloat(values[13]) || 0 // Total column
          };
          
          if (collections.length < 3) {
            console.log(`\nRow ${i - headerIndex}: ECOD Format`);
            console.log('Raw values:', values);
            console.log('Parsed:', row);
          }
        } else {
          // Standard Format: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount
          row = {
            date: parseDate(values[0]),
            time: parseTime(values[1] || '00:00:00'),
            shift: normalizeShift(values[2]),
            farmerId: stripLeadingZeros(values[3] || '0'),
            channel: normalizeChannel(values[4]),
            fat: parseFloat(values[5]) || 0,
            snf: parseFloat(values[6]) || 0,
            clr: parseFloat(values[7]) || 0,
            water: parseFloat(values[8]) || 0,
            quantity: parseFloat(values[9]) || 0,
            rate: parseFloat(values[10]) || 0,
            incentive: parseFloat(values[11]) || 0,
            amount: parseFloat(values[12]) || 0
          };
          
          if (collections.length < 3) {
            console.log(`\nRow ${i - headerIndex}: Standard Format`);
            console.log('Raw values:', values);
            console.log('Parsed:', row);
          }
        }

        collections.push(row);
      } catch (error) {
        console.error('Error parsing row:', line, error);
      }
    }
    
    console.log('Parsed Collections:', collections.length);
    if (collections.length > 0) {
      console.log('Sample Row:', JSON.stringify(collections[0], null, 2));
    }

    if (collections.length === 0) {
      return NextResponse.json({ error: 'No valid collection records found in CSV' }, { status: 400 });
    }

    // Insert collections into database
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log('\n=== Starting Database Inserts ===');
    
    // Debug: Check existing shift types in database
    try {
      const [shiftTypes] = await sequelize.query(`
        SELECT DISTINCT shift_type FROM \`${schemaName}\`.milk_collections 
        WHERE shift_type IS NOT NULL 
        LIMIT 10
      `);
      console.log('Existing shift types in DB:', shiftTypes);
    } catch (e) {
      console.log('Could not query existing shift types');
    }

    for (const collection of collections) {
      try {
        // Check if farmer exists in society
        const farmerQuery = `
          SELECT id, farmer_id, name 
          FROM \`${schemaName}\`.farmers 
          WHERE farmer_id = ? AND society_id = ?
          LIMIT 1
        `;
        
        const [farmers] = await sequelize.query(farmerQuery, {
          replacements: [collection.farmerId, machine.society_id]
        });

        let farmerDbId = null;
        if (farmers && farmers.length > 0) {
          farmerDbId = (farmers[0] as any).id;
        }

        // Insert collection record
        const insertQuery = `
          INSERT INTO \`${schemaName}\`.milk_collections (
            society_id, farmer_id, machine_id, collection_date, collection_time,
            shift_type, channel, fat_percentage, snf_percentage, clr_value,
            water_percentage, quantity, rate_per_liter, bonus, total_amount,
            machine_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await sequelize.query(insertQuery, {
          replacements: [
            machine.society_id || null,
            collection.farmerId,
            machine.id, // Use database ID, not machine_id string
            collection.date,
            collection.time,
            collection.shift,
            collection.channel,
            collection.fat,
            collection.snf,
            collection.clr,
            collection.water,
            collection.quantity,
            collection.rate,
            collection.incentive,
            collection.amount,
            machine.machine_type || 'UNKNOWN'
          ]
        });

        successCount++;
        
        if (successCount <= 5) {
          console.log(`✅ Saved: Farmer ${collection.farmerId} | Date ${collection.date} | Qty ${collection.quantity} | Amt ${collection.amount}`);
        } else if (successCount === 6) {
          console.log('... (remaining successful inserts not shown)');
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Farmer ${collection.farmerId}: ${error.message}`;
        errors.push(errorMsg);
        
        if (errorCount <= 5) {
          console.error(`❌ Failed: ${errorMsg}`);
        }
      }
    }

    console.log('\n=== Upload Summary ===');
    console.log('Total Rows:', collections.length);
    console.log('Success:', successCount);
    console.log('Errors:', errorCount);
    console.log('=====================\n');

    return NextResponse.json({
      message: 'Upload completed',
      machineSerial: machine.machine_id,
      societyName: machine.society_name,
      totalRows: collections.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Return first 10 errors
    });

  } catch (error) {
    console.error('Error uploading collection data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload collection data' },
      { status: 500 }
    );
  }
}
