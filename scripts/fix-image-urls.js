#!/usr/bin/env node

/**
 * Fix Image URLs Script
 * Updates relative image URLs to full URLs with domain
 * Run this after configuring domain in .env
 */

require('dotenv').config();
const { connectDB } = require('../src/lib/database');
const { getModels } = require('../src/models');

async function fixImageUrls() {
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
    await connectDB();
    const { Machine } = getModels();

    // Find all machines with relative image URLs
    const machines = await Machine.findAll({
      where: {
        imageUrl: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    console.log(`Found ${machines.length} machine(s) with images\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const machine of machines) {
      const currentUrl = machine.imageUrl;

      // Skip if already a full URL
      if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
        console.log(`✓ Skipped: ${machine.machineType} - Already full URL`);
        skippedCount++;
        continue;
      }

      // Convert relative to full URL
      const newUrl = `${baseUrl}${currentUrl.startsWith('/') ? '' : '/'}${currentUrl}`;

      await machine.update({ imageUrl: newUrl });
      console.log(`✅ Updated: ${machine.machineType}`);
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

    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    process.exit(1);
  }
}

// Run the script
fixImageUrls();
