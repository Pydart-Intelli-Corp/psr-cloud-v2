# PSR Code API Management System

## Overview

The PSR Code API Management system allows Super Admins to generate unique PSR (Poornasree) codes for machines and create deployable API packages with built-in authentication.

## Features

### 1. PSR Code Generation
- Generate unique codes in format: `PSR-{SOCIETYID}-{MODEL}-{MACHINEID}`
- Example: `PSR-SOC001-LACT-M001`
- Bulk generation from comma or line-separated machine IDs
- Support for multiple machine models (Lactosure, Ekomilk, Ultrasonic, Master)

### 2. Automated API Package Creation
- Builds .NET API with PSR code validation
- Creates deployable publish package
- Includes configuration files
- Generates deployment documentation

### 3. PSR Code Validation
- Built-in validation middleware
- Machine-specific authentication
- Reverse lookup support (Code → Machine ID)
- Optional: Can operate without PSR codes (open mode)

## Usage

### Step 1: Access API Management (Super Admin Only)

1. Login as Super Admin
2. Navigate to **API Management** from sidebar
3. Access the PSR Code Generator

### Step 2: Generate PSR Codes

1. **Enter Society ID**
   ```
   Example: SOC001, DAIRY_KOCHI, BMC_TVM
   ```

2. **Select Machine Model**
   - Lactosure
   - Ekomilk
   - Ultrasonic
   - Master

3. **Enter Machine IDs (Bulk)**
   ```
   Comma-separated: M001, M002, M003
   Or line-separated:
   M001
   M002
   M003
   ```

4. **Click Generate**
   - System generates unique PSR codes
   - Creates API package with configurations
   - Prepares deployment files

### Step 3: Download & Deploy

1. **Download JSON Configuration**
   - Contains all PSR code mappings
   - Use for record-keeping

2. **Download API Publish Package**
   - Complete .NET API ready for deployment
   - Includes PSR validation
   - Pre-configured with generated codes

## API Package Contents

```
psr-api-{societyId}-{timestamp}/
├── publish/                    # Compiled .NET API
│   ├── MachineAPI.dll
│   ├── appsettings.json
│   ├── appsettings.PSR.json   # PSR configuration
│   ├── psr-config.json        # PSR code mappings
│   └── ...
├── psr-config.json            # Configuration backup
├── appsettings.PSR.json       # Settings template
├── README.md                  # Deployment guide
└── deploy.sh                  # Linux deployment script
```

## PSR Code Format

```
PSR-{SOCIETYID}-{MODEL_PREFIX}-{MACHINE_ID}
│   │           │               │
│   │           │               └─ Original Machine ID
│   │           └───────────────── 4-letter Model Code
│   └───────────────────────────── Society Identifier
└───────────────────────────────── PSR Prefix
```

### Examples

| Society | Model | Machine ID | PSR Code |
|---------|-------|------------|----------|
| SOC001 | Lactosure | M001 | PSR-SOC001-LACT-M001 |
| DAIRY_KOC | Ekomilk | MACHINE_05 | PSR-DAIRY_KOC-EKOM-MACHINE_05 |
| BMC_TVM | Ultrasonic | ULTRA_01 | PSR-BMC_TVM-ULTR-ULTRA_01 |

## Deployment

### Quick Deploy (Linux)

```bash
# 1. Extract package
unzip psr-api-SOC001-*.zip
cd psr-api-SOC001-*/

# 2. Run deployment script
sudo ./deploy.sh

# 3. Configure database (edit this file)
sudo nano /var/www/machineapi/appsettings.Production.json

# 4. Set up systemd service (see DEPLOYMENT.md in package)
sudo systemctl start machineapi
sudo systemctl enable machineapi

# 5. Verify
curl http://localhost:5000/health
curl http://localhost:5000/api/psr/config
```

### Manual Deploy

```bash
# 1. Copy publish folder to server
scp -r publish/* user@server:/var/www/machineapi/

# 2. SSH to server
ssh user@server

# 3. Configure environment
export ConnectionStrings__DefaultConnection="Server=localhost;..."
export Jwt__Secret="YOUR_SECRET"
export ASPNETCORE_ENVIRONMENT="Production"

# 4. Run API
cd /var/www/machineapi
./MachineAPI
```

## PSR Code Validation

### API Endpoints

#### 1. Check PSR Configuration
```bash
GET /api/psr/config
```

Response:
```json
{
  "configured": true,
  "societyId": "SOC001",
  "machineModel": "lactosure",
  "totalMachines": 10,
  "generatedAt": "2026-01-28T...",
  "message": "PSR codes are active"
}
```

#### 2. Validate PSR Code
```bash
POST /api/psr/validate
Content-Type: application/json

{
  "machineId": "M001",
  "psrCode": "PSR-SOC001-LACT-M001"
}
```

Response:
```json
{
  "valid": true,
  "machineId": "M001",
  "psrCode": "PSR-SOC001-LACT-M001",
  "message": "PSR code is valid"
}
```

#### 3. Get PSR Code for Machine
```bash
GET /api/psr/machine/M001
```

Response:
```json
{
  "machineId": "M001",
  "psrCode": "PSR-SOC001-LACT-M001",
  "message": "PSR code found"
}
```

#### 4. Get Machine ID from PSR Code
```bash
GET /api/psr/code/PSR-SOC001-LACT-M001
```

Response:
```json
{
  "psrCode": "PSR-SOC001-LACT-M001",
  "machineId": "M001",
  "message": "Machine ID found"
}
```

#### 5. Get All Mappings
```bash
GET /api/psr/mappings
```

Response:
```json
{
  "configured": true,
  "societyId": "SOC001",
  "machineModel": "lactosure",
  "mappings": {
    "M001": "PSR-SOC001-LACT-M001",
    "M002": "PSR-SOC001-LACT-M002",
    "M003": "PSR-SOC001-LACT-M003"
  },
  "totalMachines": 3
}
```

## Using PSR Codes in Operations

### Collections API

```bash
POST /api/collections
Content-Type: application/json

{
  "machineId": "M001",
  "psrCode": "PSR-SOC001-LACT-M001",  # Required when PSR is configured
  "farmerId": "F001",
  "quantity": 10.5,
  "fat": 4.2,
  "snf": 8.5
}
```

### Dispatches API

```bash
POST /api/dispatches
Content-Type: application/json

{
  "machineId": "M001",
  "psrCode": "PSR-SOC001-LACT-M001",  # Required
  "quantity": 100.5,
  "fat": 4.0,
  "snf": 8.3
}
```

## Security Features

### PSR Code Benefits

1. **Machine Authentication**
   - Each machine has a unique code
   - Prevents unauthorized data submission
   - Tracks machine-specific activity

2. **Society Isolation**
   - Codes include society identifier
   - Easy to segregate data by society
   - Multi-tenant support

3. **Model-Specific Validation**
   - Code includes machine model
   - Helps in analytics and reporting
   - Model-specific configurations

### Operating Modes

#### 1. PSR Mode (Configured)
- PSR codes required for all operations
- Strict validation
- Enhanced security

#### 2. Open Mode (Not Configured)
- No PSR code requirement
- Backward compatible
- For testing/development

Check mode:
```bash
curl http://your-api/api/psr/config
```

## Configuration Files

### psr-config.json
```json
{
  "societyId": "SOC001",
  "machineModel": "lactosure",
  "machines": [
    {
      "machineId": "M001",
      "psrCode": "PSR-SOC001-LACT-M001"
    }
  ],
  "generatedAt": "2026-01-28T..."
}
```

### appsettings.PSR.json
```json
{
  "PSRCodes": {
    "SocietyId": "SOC001",
    "MachineModel": "lactosure",
    "Mappings": {
      "M001": "PSR-SOC001-LACT-M001",
      "M002": "PSR-SOC001-LACT-M002"
    },
    "GeneratedAt": "2026-01-28T..."
  }
}
```

## Troubleshooting

### Issue: PSR codes not working

**Check 1: Configuration loaded?**
```bash
curl http://your-api/api/psr/config
```

**Check 2: Files present?**
```bash
ls -la /var/www/machineapi/psr-config.json
ls -la /var/www/machineapi/appsettings.PSR.json
```

**Check 3: Logs**
```bash
sudo journalctl -u machineapi | grep "PSR"
```

Should see:
```
PSR Code Service initialized. Society: SOC001, Model: lactosure, Machines: 10
```

### Issue: "Machine ID not found in PSR configuration"

**Solution:**
1. Verify machine ID spelling (case-sensitive)
2. Check PSR mappings: `GET /api/psr/mappings`
3. Regenerate PSR codes if needed

### Issue: API operates in open mode (should be PSR mode)

**Solution:**
1. Ensure `psr-config.json` is in API root folder
2. Or configure in `appsettings.json`:
```json
{
  "PSRCodes": {
    "Mappings": { ... }
  }
}
```
3. Restart API

## Best Practices

1. **One Society Per Package**
   - Generate separate packages for each society
   - Easier management and deployment

2. **Document PSR Codes**
   - Save JSON configuration
   - Keep backup of generated codes
   - Share with society admins

3. **Version Control**
   - Track PSR code changes
   - Document when machines are added/removed

4. **Regular Audits**
   - Check `/api/psr/config` periodically
   - Verify all machines have valid codes

5. **Secure Distribution**
   - Share PSR codes securely
   - Use encrypted channels
   - Don't commit to public repos

## Support

For issues or questions:
- Check logs: `journalctl -u machineapi`
- Verify configuration: `GET /api/psr/config`
- Review DEPLOYMENT.md in API package
- Contact system administrator

---

**Generated by PSR Cloud Platform**  
**Version:** 1.0.0  
**Last Updated:** January 28, 2026
