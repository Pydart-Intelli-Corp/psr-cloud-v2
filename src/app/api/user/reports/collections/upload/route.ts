import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { processCollectionInvoice } from '@/lib/services/invoiceService';

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

// Helper function to detect CSV format from file structure
function detectCSVFormat(lines: string[]): { format: 'ecod' | 'standard' | 'unknown'; confidence: number; details: string } {
  if (lines.length < 5) {
    return { format: 'unknown', confidence: 0, details: 'File too short' };
  }

  const firstLine = lines[0].toLowerCase();
  const secondLine = lines.length > 1 ? lines[1].toLowerCase() : '';
  
  // Find header line
  let headerLine = '';
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('date') && line.includes('time')) {
      headerLine = lines[i];
      headerIndex = i;
      break;
    }
  }

  if (!headerLine) {
    return { format: 'unknown', confidence: 0, details: 'No header line found with Date and Time columns' };
  }

  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
  
  // ECOD Format Detection
  // - First line contains "station"
  // - Headers include: date, time, shift, id, name, milk, fat, snf, clr, water, rate, bonus, qty, total
  if (firstLine.includes('station')) {
    const hasNameColumn = headers.some(h => h === 'name');
    const hasMilkColumn = headers.some(h => h === 'milk');
    const hasBonusColumn = headers.some(h => h === 'bonus');
    const hasTotalColumn = headers.some(h => h === 'total');
    
    if (hasNameColumn && hasMilkColumn && hasBonusColumn && hasTotalColumn) {
      return { 
        format: 'ecod', 
        confidence: 100, 
        details: 'ECOD format: Station header, Name/Milk/Bonus/Total columns present' 
      };
    }
    return { 
      format: 'ecod', 
      confidence: 70, 
      details: 'ECOD format: Station header found but some expected columns missing' 
    };
  }

  // Standard Format Detection
  // - First line contains "machine serial:"
  // - Headers include: date, time, shift, id, channel, fat, snf, clr, water, qty, rate, incentive, amount
  if (firstLine.includes('machine serial')) {
    const hasChannelColumn = headers.some(h => h === 'channel');
    const hasQtyColumn = headers.some(h => h === 'qty');
    const hasIncentiveColumn = headers.some(h => h === 'incentive');
    const hasAmountColumn = headers.some(h => h === 'amount');
    
    if (hasChannelColumn && hasQtyColumn && hasIncentiveColumn && hasAmountColumn) {
      return { 
        format: 'standard', 
        confidence: 100, 
        details: 'Standard format: Machine Serial header, Channel/Qty/Incentive/Amount columns present' 
      };
    }
    return { 
      format: 'standard', 
      confidence: 70, 
      details: 'Standard format: Machine Serial header found but some expected columns missing' 
    };
  }

  // Try to determine from columns alone
  const hasNameColumn = headers.some(h => h === 'name');
  const hasChannelColumn = headers.some(h => h === 'channel');
  const hasMilkColumn = headers.some(h => h === 'milk');
  const hasBonusColumn = headers.some(h => h === 'bonus');
  const hasIncentiveColumn = headers.some(h => h === 'incentive');
  const hasTotalColumn = headers.some(h => h === 'total');
  const hasAmountColumn = headers.some(h => h === 'amount');

  if (hasNameColumn && hasMilkColumn && hasBonusColumn && hasTotalColumn) {
    return { 
      format: 'ecod', 
      confidence: 60, 
      details: 'Likely ECOD format based on Name/Milk/Bonus/Total columns (missing Station header)' 
    };
  }

  if (hasChannelColumn && hasIncentiveColumn && hasAmountColumn && !hasNameColumn) {
    return { 
      format: 'standard', 
      confidence: 60, 
      details: 'Likely Standard format based on Channel/Incentive/Amount columns (missing Machine Serial header)' 
    };
  }

  return { 
    format: 'unknown', 
    confidence: 0, 
    details: `Could not determine format. Headers found: ${headers.join(', ')}` 
  };
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

    // Find the header line (contains "Date,Time,Shift")
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('date') && lines[i].toLowerCase().includes('time')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      const ecodExample = expectedFormat === 'ECOD' 
        ? 'Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total'
        : 'Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount';
      
      return NextResponse.json({ 
        error: `❌ Header Row Not Found in Collection CSV`,
        reportType: 'Collection Report',
        machineType: machine.machine_type,
        expectedFormat: expectedFormat,
        help: `Your CSV file is missing a proper header row.\n\nFor ${expectedFormat} format Collection reports, the header should include:\n• ${ecodExample}\n\nPlease check:\n1. First few lines contain machine info/metadata\n2. Header row comes after metadata\n3. Header contains column names separated by commas`,
        suggestion: '💡 Tip: Open your CSV file and ensure it has a row with column names like Date, Time, Shift, ID, etc.'
      }, { status: 400 });
    }

    // Detect actual CSV format from file structure
    const detectedFormat = detectCSVFormat(lines);
    
    // Determine expected format based on machine type (already set above)
    const csvFormatExpected = expectedFormat.toLowerCase() === 'ecod' ? 'ecod' : 'standard';
    const isEcodMachine = csvFormatExpected === 'ecod';
    
    console.log('\n=== CSV Upload Format Validation ===');
    console.log('Machine:', machine.machine_id, '|', machine.machine_type);
    console.log('Society:', machine.society_name, '|', machine.society_code);
    console.log('Expected Format:', csvFormatExpected.toUpperCase());
    console.log('Detected Format:', detectedFormat.format.toUpperCase(), `(${detectedFormat.confidence}% confidence)`);
    console.log('Detection Details:', detectedFormat.details);
    console.log('First Line:', firstLine);
    console.log('Header Line:', lines[headerIndex]);
    
    // Validate format match
    if (detectedFormat.format === 'unknown') {
      return NextResponse.json({ 
        error: 'Unable to detect CSV format',
        details: detectedFormat.details,
        help: 'Please ensure your CSV file matches either ECOD or LSE/SD format. See documentation for examples.',
        expectedFormat: csvFormatExpected.toUpperCase(),
        machineType: machine.machine_type
      }, { status: 400 });
    }
    
    // Check if detected format matches expected format for this machine
    if (detectedFormat.format !== csvFormatExpected && detectedFormat.confidence >= 60) {
      const errorMessage = expectedFormat === 'ECOD' 
        ? `❌ Format Mismatch: Selected machine is ECOD type, but CSV file is in LSE/SD format`
        : `❌ Format Mismatch: Selected machine is LSE/SD type, but CSV file is in ECOD format`;
      
      const helpMessage = expectedFormat === 'ECOD'
        ? `Expected ECOD format:\n• First line: "Station :"\n• Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total\n\nFound LSE/SD format:\n• First line: "Machine Serial:XXX"\n• Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount`
        : `Expected LSE/SD format:\n• First line: "Machine Serial:XXX"\n• Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount\n\nFound ECOD format:\n• First line: "Station :"\n• Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total`;
      
      return NextResponse.json({ 
        error: errorMessage,
        details: detectedFormat.details,
        help: helpMessage,
        detectedFormat: detectedFormat.format.toUpperCase(),
        expectedFormat: expectedFormat.toUpperCase(),
        machineType: machine.machine_type,
        suggestion: expectedFormat === 'ECOD' 
          ? '💡 Solution: Either upload an ECOD format CSV file, or select a different machine (LSE/SD type) for this upload.'
          : '💡 Solution: Either upload an LSE/SD format CSV file, or select an ECOD machine if you have ECOD format data.'
      }, { status: 400 });
    }
    
    // Use detected format for parsing
    const isEcodFormat = detectedFormat.format === 'ecod';
    
    console.log('Format Validation: PASSED');
    console.log('Using Parser:', isEcodFormat ? 'ECOD' : 'LSE/SD');
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
      
      // Validate minimum column count based on format
      const minColumns = isEcodFormat ? 14 : 13;
      if (values.length < minColumns) {
        console.log(`⚠️ Skipping incomplete row (line ${i + 1}): ${values.length} columns, expected ${minColumns}`);
        console.log('Row data:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
        continue;
      }

      try {
        let row: CollectionRow;
        
        if (isEcodFormat) {
          // ===== ECOD FORMAT =====
          // Used by: ECOD machines
          // Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total
          // Example: 28/01/26,09:07:14AM,EVE,000001,FARMER NAME,COW,00.30,03.60,12.00,56,010.00,00.00,00000.00,00000.00
          row = {
            date: parseDate(values[0]),
            time: parseTime(values[1] || '00:00:00'),
            shift: normalizeShift(values[2]),
            farmerId: stripLeadingZeros(values[3] || '0'),
            channel: normalizeChannel(values[5] || 'COW'), // "Milk" column becomes channel
            fat: parseFloat(values[6]) || 0,
            snf: parseFloat(values[7]) || 0,
            clr: parseFloat(values[8]) || 0,
            water: parseFloat(values[9]) || 0,
            quantity: parseFloat(values[12]) || 0, // "Qty" column
            rate: parseFloat(values[10]) || 0,
            incentive: parseFloat(values[11]) || 0, // "Bonus" column
            amount: parseFloat(values[13]) || 0 // "Total" column
          };
          
          if (collections.length < 3) {
            console.log(`\nRow ${i - headerIndex}: ECOD Format`);
            console.log('Raw values:', values);
            console.log('Parsed:', row);
          }
        } else {
          // ===== LSE/SD FORMAT =====
          // Used by: LSE, SD, and other standard format machines
          // Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount
          // Example: 2026-01-19,14:31:03,MR,1,COW,0.00,0.00,0,99,10.00,0.00,0.00,0.00
          row = {
            date: parseDate(values[0]),
            time: parseTime(values[1] || '00:00:00'),
            shift: normalizeShift(values[2]),
            farmerId: stripLeadingZeros(values[3] || '0'),
            channel: normalizeChannel(values[4]), // Direct "Channel" column
            fat: parseFloat(values[5]) || 0,
            snf: parseFloat(values[6]) || 0,
            clr: parseFloat(values[7]) || 0,
            water: parseFloat(values[8]) || 0,
            quantity: parseFloat(values[9]) || 0, // Direct "Qty" column
            rate: parseFloat(values[10]) || 0,
            incentive: parseFloat(values[11]) || 0, // Direct "Incentive" column
            amount: parseFloat(values[12]) || 0 // Direct "Amount" column
          };
          
          if (collections.length < 3) {
            console.log(`\nRow ${i - headerIndex}: LSE/SD Format`);
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
    let insertCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const duplicates: string[] = [];

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
          SELECT id, farmer_id, name, email 
          FROM \`${schemaName}\`.farmers 
          WHERE farmer_id = ? AND society_id = ?
          LIMIT 1
        `;
        
        const [farmers] = await sequelize.query(farmerQuery, {
          replacements: [collection.farmerId, machine.society_id]
        });

        let farmerDbId = null;
        let farmerName = '';
        let farmerEmail = '';
        
        if (farmers && farmers.length > 0) {
          const farmer = farmers[0] as any;
          farmerDbId = farmer.id;
          farmerName = farmer.name || '';
          farmerEmail = farmer.email || '';
        }

        // Insert collection record with duplicate handling
        const insertQuery = `
          INSERT INTO \`${schemaName}\`.milk_collections (
            society_id, farmer_id, machine_id, collection_date, collection_time,
            shift_type, channel, fat_percentage, snf_percentage, clr_value,
            water_percentage, quantity, rate_per_liter, bonus, total_amount,
            machine_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            channel = VALUES(channel),
            fat_percentage = VALUES(fat_percentage),
            snf_percentage = VALUES(snf_percentage),
            clr_value = VALUES(clr_value),
            water_percentage = VALUES(water_percentage),
            quantity = VALUES(quantity),
            rate_per_liter = VALUES(rate_per_liter),
            bonus = VALUES(bonus),
            total_amount = VALUES(total_amount),
            machine_type = VALUES(machine_type)
        `;

        const [result]: any = await sequelize.query(insertQuery, {
          replacements: [
            machine.society_id || null,
            collection.farmerId,
            machine.id,
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

        const affectedRows = result.affectedRows || 0;
        
        if (affectedRows === 1) {
          insertCount++;
          
          // Generate and send invoice for new collection (non-blocking)
          if (farmerEmail) {
            processCollectionInvoice({
              farmerId: collection.farmerId,
              farmerName: farmerName,
              farmerEmail: farmerEmail,
              societyName: machine.society_name || '',
              date: collection.date,
              shift: collection.shift,
              quantity: collection.quantity,
              fat: collection.fat,
              snf: collection.snf,
              rate: collection.rate,
              amount: collection.amount,
              machineId: machine.machine_id,
              machineType: machine.machine_type || 'UNKNOWN',
              time: collection.time
            }, {
              adminSchema: schemaName
            }).then(result => {
              if (result.success) {
                console.log(`📧 Invoice sent: Farmer ${collection.farmerId} - ${result.invoiceNumber}`);
              } else {
                console.warn(`⚠️ Invoice failed: Farmer ${collection.farmerId} - ${result.message}`);
              }
            }).catch(err => {
              console.error(`❌ Invoice error: Farmer ${collection.farmerId}`, err);
            });
          }
        } else if (affectedRows === 2) {
          updateCount++;
          duplicates.push(`Farmer ${collection.farmerId} on ${collection.date} (${collection.shift})`);
        }
        
        if (insertCount + updateCount <= 3) {
          const status = affectedRows === 1 ? '✅ New' : '🔄 Updated';
          console.log(`${status}: Farmer ${collection.farmerId} | ${collection.date} ${collection.shift} | ${collection.quantity}L @ ₹${collection.rate}`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Farmer ${collection.farmerId}: ${error.message}`;
        errors.push(errorMsg);
        
        if (errorCount <= 3) {
          console.error(`❌ Failed: ${errorMsg}`);
        }
      }
    }

    console.log('\n=== Upload Summary ===');
    console.log('Total Rows:', collections.length);
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
      totalRows: collections.length,
      insertCount,
      updateCount,
      duplicateCount: updateCount,
      errorCount,
      duplicates: duplicates.slice(0, 5),
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Error uploading collection data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload collection data' },
      { status: 500 }
    );
  }
}
