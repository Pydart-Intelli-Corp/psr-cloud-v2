#!/usr/bin/env node

/**
 * Fix Image URLs Script
 * Updates relative image URLs to full URLs with domain
 * Run this after configuring domain in .env
 */

const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixImageUrls() {
  let connection;
  
  try {
    console.log('🔧 Fixing image URLs in database...\n');

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL;
    if (!baseUrl) {
      console.error('❌ Error: NEXT_PUBLIC_APP_URL or CLIENT_URL not set in .env');
      console.log('Please add: NEXT_PUBLIC_APP_URL=https://v4.poornasreecloud.com');
      process.exit(1);
    }

    console.log(`Base URL: ${baseUrl}`);
    console.log('Connecting to database...\n');

    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'psr_v4_main'
    });

    console.log('✅ Connected to database\n');

    // Find all machines with image URLs
    const [machines] = await connection.execute(
      'SELECT id, machine_type, image_url FROM machinetype WHERE image_url IS NOT NULL'
    );

    console.log(`Found ${machines.length} machine(s) with images\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const machine of machines) {
      const currentUrl = machine.image_url;

      // Skip if already a full URL
      if (currentUrl && (currentUrl.startsWith('http://') || currentUrl.startsWith('https://'))) {
        console.log(`✓ Skipped: ${machine.machine_type} - Already full URL`);
        skippedCount++;
        continue;
      }

      // Convert relative to full URL
      const newUrl = `${baseUrl}${currentUrl.startsWith('/') ? '' : '/'}${currentUrl}`;

      await connection.execute(
        'UPDATE machinetype SET image_url = ? WHERE id = ?',
        [newUrl, machine.id]
      );
      
      console.log(`✅ Updated: ${machine.machine_type}`);
      console.log(`   Old: ${currentUrl}`);
      console.log(`   New: ${newUrl}\n`);
      updatedCount++;
    }

    console.log('==========================================');
    console.log(`✅ Image URLs fixed successfully!`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${machines.length}`);
    console.log('==========================================\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the script
fixImageUrls();
