import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return createErrorResponse('Email parameter required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE (TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%' OR TABLE_SCHEMA LIKE 'tishnu_%') 
      ORDER BY TABLE_SCHEMA
    `);
    
    const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
    
    let results = [];
    
    for (const schema of adminSchemas) {
      try {
        // Check farmers
        const [farmers] = await sequelize.query(`
          SELECT 'farmer' as type, farmer_id as id, name, email, '${schema}' as schema_name
          FROM \`${schema}\`.farmers WHERE email = ?
        `, { replacements: [email.toLowerCase()] });
        
        if (Array.isArray(farmers) && farmers.length > 0) {
          results.push(...farmers);
        }
        
        // Check societies
        const [societies] = await sequelize.query(`
          SELECT 'society' as type, society_id as id, name, email, '${schema}' as schema_name
          FROM \`${schema}\`.societies WHERE email = ?
        `, { replacements: [email.toLowerCase()] });
        
        if (Array.isArray(societies) && societies.length > 0) {
          results.push(...societies);
        }
        
      } catch (error) {
        console.log(`Schema ${schema} not accessible or incomplete`);
      }
    }

    return createSuccessResponse('Email search completed', {
      email,
      found: results.length > 0,
      results,
      totalSchemas: adminSchemas.length
    });

  } catch (error: unknown) {
    console.error('Error searching email:', error);
    return createErrorResponse('Failed to search email', 500);
  }
}