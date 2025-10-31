import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { getModels } from '@/models';

// GET - Download machines as CSV template or export existing data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'template';

    if (type === 'template') {
      // Return empty template
      const csvContent = 'Machine Type\nECOD\nLSE-V3\nLSES-V3';
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="machine_types_template.csv"'
        }
      });
    }

    if (type === 'export') {
      await connectDB();
      const { Machine } = getModels();

      const machines = await Machine.findAll({
        order: [['machineType', 'ASC']],
        attributes: ['machineType']
      });

      let csvContent = 'Machine Type\n';
      machines.forEach(machine => {
        const machineData = machine.toJSON();
        const machineType = machineData.machineType || '';
        if (machineType) {
          csvContent += `${machineType}\n`;
        }
      });

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="machine_types_export.csv"'
        }
      });
    }

    return new Response('Invalid type parameter', { status: 400 });

  } catch (error) {
    console.error('Error downloading CSV:', error);
    return new Response('Failed to download CSV', { status: 500 });
  }
}