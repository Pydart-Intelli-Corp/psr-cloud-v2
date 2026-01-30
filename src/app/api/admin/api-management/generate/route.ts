import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MachineInput {
  id: string;
  machineId: string;
}

interface ModelConfig {
  id: string;
  modelName: string;
  machineCount: number;
  machines: MachineInput[];
}

interface RequestConfig {
  societyId: string;
  modelConfigs: ModelConfig[];
  psrCode: string;
  totalMachines: number;
}

export async function POST(request: NextRequest) {
  try {
    const config: RequestConfig = await request.json();

    // Validate input
    if (!config.societyId || !config.psrCode || !config.modelConfigs?.length) {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      );
    }

    // Define paths
    const machineApiPath = path.join(process.cwd(), 'MachineAPI');
    const outputDir = path.join(process.cwd(), 'public', 'api-packages');
    const timestamp = Date.now();
    const packageName = `psr-api-${timestamp}`;
    const packagePath = path.join(outputDir, packageName);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(packagePath, { recursive: true });

    const appSettingsContent = {
      Logging: {
        LogLevel: {
          Default: 'Information',
          'Microsoft.AspNetCore': 'Warning',
          'Microsoft.EntityFrameworkCore': 'Warning'
        }
      },
      AllowedHosts: '*',
      ConnectionStrings: {
        DefaultConnection: 'USE_ENVIRONMENT_VARIABLE_OR_APPSETTINGS_PRODUCTION'
      },
      Jwt: {
        Secret: 'USE_ENVIRONMENT_VARIABLE_OR_USER_SECRETS',
        Issuer: 'poornasree-machine-api',
        Audience: 'psr-machines',
        ExpirationDays: 7
      },
      MachineSettings: {
        DefaultTimeZone: 'Asia/Kolkata',
        AllowedMachineTypes: config.modelConfigs.map(m => m.modelName),
        MaxCollectionsPerDay: 1000,
        EnableAutoDispatch: false
      },
      RateLimiting: {
        EnableRateLimiting: true,
        PermitLimit: 100,
        WindowSeconds: 60
      },
      Cors: {
        AllowedOrigins: ['https://yourdomain.com']
      },
      PSRCodes: {
        MasterPSRCode: config.psrCode
      }
    };

    // Write configuration file (only encrypted PSR code)
    const configFilePath = path.join(packagePath, 'psr-config.json');
    await fs.writeFile(
      configFilePath,
      JSON.stringify({
        MasterPSRCode: config.psrCode,
        TotalModels: config.modelConfigs.length,
        TotalMachines: config.totalMachines
      }, null, 2),
      'utf-8'
    );

    // Write appsettings file
    const appSettingsPath = path.join(packagePath, 'appsettings.PSR.json');
    await fs.writeFile(
      appSettingsPath,
      JSON.stringify(appSettingsContent, null, 2),
      'utf-8'
    );

    // 2. Check if MachineAPI exists and is buildable
    try {
      await fs.access(machineApiPath);
      
      // Build the .NET API in Release mode
      console.log('Building .NET API...');
      const publishPath = path.join(packagePath, 'publish');
      
      await execAsync(
        `dotnet publish -c Release -o "${publishPath}"`,
        { cwd: machineApiPath }
      );

      console.log('API built successfully');

      // Copy the PSR config to the publish folder
      await fs.copyFile(
        configFilePath,
        path.join(publishPath, 'psr-config.json')
      );
      await fs.copyFile(
        appSettingsPath,
        path.join(publishPath, 'appsettings.PSR.json')
      );

      // Create README for deployment
      const readmeContent = `# PSR Machine API Package

**Generated:** ${new Date().toLocaleString()}
**Total Models:** ${config.totalMachines}
**Total Machines:** ${config.totalMachines}

## Master PSR Code

This package contains a single encrypted PSR code for all ${config.modelConfigs.length} models (${config.totalMachines} machines) in the society.
All machines will use this master code for secure authentication.

**Configuration Files:**
- \`psr-config.json\` - Encrypted PSR code for reference
- \`appsettings.PSR.json\` - Internal API configuration (do not share publicly)

## Deployment Instructions

1. **Configure Database Connection**
   Edit \`appsettings.Production.json\` or set environment variable:
   \`\`\`
   ConnectionStrings__DefaultConnection="Server=YOUR_DB;Port=3306;Database=psr_machine_api;User=YOUR_USER;Password=YOUR_PASSWORD;SslMode=Required;"
   \`\`\`

2. **Configure JWT Secret**
   Set environment variable:
   \`\`\`
   Jwt__Secret="YOUR_SECURE_256_BIT_SECRET"
   \`\`\`

3. **Deploy Files**
   Copy the \`publish\` folder to your server:
   - Linux: \`/var/www/machineapi\`
   - Windows: \`C:\\inetpub\\wwwroot\\machineapi\`

4. **Run the API**
   \`\`\`bash
   cd publish
   ./MachineAPI  # Linux
   MachineAPI.exe  # Windows
   \`\`\`

5. **Verify Deployment**
   \`\`\`bash
   curl https://your-domain.com/health
   \`\`\`

## PSR Code Usage

The API will automatically validate PSR codes for all operations:
- Collections
- Dispatches
- Sales
- Corrections

Each machine must use its assigned PSR code for authentication.

## Configuration Files

- \`psr-config.json\` - PSR code mappings
- \`appsettings.PSR.json\` - Pre-configured settings
- \`appsettings.Production.json\` - Production overrides (create this)

## Support

For deployment assistance, refer to:
- DEPLOYMENT.md
- SECURITY.md
- PRODUCTION_READY.md

---
Generated by PSR Cloud API Management
`;

      await fs.writeFile(
        path.join(packagePath, 'README.md'),
        readmeContent,
        'utf-8'
      );

      // Create a simple deployment script
      const deployScriptLinux = `#!/bin/bash
# PSR Machine API Deployment Script

echo "PSR Machine API - Society: ${config.societyId}"
echo "==========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

# Set deployment directory
DEPLOY_DIR="/var/www/machineapi"

# Create directory if it doesn't exist
mkdir -p $DEPLOY_DIR

# Copy files
echo "Copying files to $DEPLOY_DIR..."
cp -r publish/* $DEPLOY_DIR/

# Set permissions
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR

echo ""
echo "Deployment complete!"
echo "Next steps:"
echo "1. Configure database connection in appsettings.Production.json"
echo "2. Set JWT secret"
echo "3. Set up systemd service (see DEPLOYMENT.md)"
echo "4. Start the API"
`;

      await fs.writeFile(
        path.join(packagePath, 'deploy.sh'),
        deployScriptLinux,
        'utf-8'
      );

      // Make deploy script executable (on Linux)
      try {
        await fs.chmod(path.join(packagePath, 'deploy.sh'), 0o755);
      } catch (chmodError) {
        // Ignore on Windows
      }

    } catch (buildError) {
      console.error('Build error:', buildError);
      
      // If build fails, still provide the configuration files
      const errorReadme = `# PSR Configuration Package

**Generated:** ${new Date().toLocaleString()}
**Total Models:** ${config.modelConfigs.length}
**Total Machines:** ${config.totalMachines}

## Master PSR Code

This package contains a single encrypted PSR code for all ${config.modelConfigs.length} models (${config.totalMachines} machines).

## Note

The .NET API build was not available. This package contains only the PSR configuration files.
Use these files with your existing MachineAPI deployment.

## Files Included

- psr-config.json - Encrypted PSR code
- appsettings.PSR.json - Internal API configuration
- appsettings.PSR.json - Configuration template

Copy these files to your MachineAPI deployment folder.
`;

      await fs.writeFile(
        path.join(packagePath, 'README.md'),
        errorReadme,
        'utf-8'
      );
    }

    // Create a ZIP archive (if possible)
    // For now, we'll return the directory path
    // In production, you might want to use a library like archiver to create a ZIP

    const downloadUrl = `/api-packages/${packageName}/publish`;
    
    // Return success response
    return NextResponse.json({
      success: true,
      packageName,
      downloadUrl,
      config: {
        totalMachines: config.totalMachines,
        totalModels: config.modelConfigs.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate API package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Management endpoint',
    methods: ['POST'],
    description: 'Generate PSR codes and API packages for machines'
  });
}
