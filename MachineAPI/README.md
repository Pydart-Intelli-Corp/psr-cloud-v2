# Machine API - ASP.NET Core

Complete REST API for Poornasree Machine features including Collections, Dispatches, Sales, and Farmer Management with ESP32 compatibility and automatic machine ID normalization.

## 🔧 Key Features

### Machine ID Normalization
- **Automatic Processing**: ESP32 machine IDs like `MM15`, `MM8` are normalized to `M15`, `M8` for consistent database storage
- **Transparent Operation**: All endpoints handle normalization automatically
- **Cross-Endpoint Consistency**: Normalized IDs work across Statistics, Collections, Dispatches, Sales, and Farmer APIs
- **Session Validation**: SessionManager uses normalized IDs for proper authorization

### ESP32 Compatibility
- **Text/Plain Responses**: All endpoints return simple text responses compatible with ESP32 parsing
- **Multiple Input Methods**: Support for GET query parameters and POST form data
- **Error Handling**: Simple error messages suitable for embedded systems

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- MySQL Server (localhost)
- Database credentials:
  - User: `root`
  - Password: `Access@404`

### Installation

1. **Restore dependencies**
```bash
cd MachineAPI
dotnet restore
```

2. **Create database** (if not exists)
```sql
CREATE DATABASE psr_machine_api;
```

3. **Run the API**
```bash
dotnet run
```

The API will start at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000` or `https://localhost:5001`

## 📚 API Endpoints

### ESP32 Machine Endpoints (with ID Normalization)
- `GET/POST /api/MachineStatistics/SaveMachineStatisticsFromMachine` - Save machine statistics (MM13 → M13)
- `GET/POST /api/Collections/SaveCollectionDetailsFromMachine` - Save milk collections (MM15 → M15)
- `GET/POST /api/Dispatches/SaveDispatchDetailsFromMachine` - Save dispatches (MM8 → M8)
- `GET/POST /api/Sales/SaveSalesDetailsFromMachine` - Save sales data
- `GET/POST /api/FarmerInfo/GetLatestFarmerInfo` - Get farmer data (with machine verification)
- `GET/POST /api/FarmerInfo/UploadFarmerDetails` - Upload CSV farmer data
- `GET/POST /api/Machine/CloudTest` - Connectivity test

### Machine Correction APIs
- `GET/POST /api/Machine/MachineCorrection/GetLatestMachineCorrection` - Get correction values
- `GET/POST /api/Machine/MachineCorrection/SaveMachineCorrectionFromMachine` - Save corrections
- `GET/POST /api/Machine/MachineCorrection/SaveMachineCorrectionUpdationHistory` - Save history

### Admin Interface APIs
- `GET /api/MachineCorrection/GetMachineCorrections` - List all corrections
- `POST /api/MachineCorrection/SaveMachineCorrection` - Admin save correction
- `GET /api/MachineCorrection/GetMachineCorrectionHistory` - View history

## 🔍 Query Parameters

### Common Filters
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50)
- `societyId` - Filter by society
- `machineId` - Filter by machine
- `fromDate` - Start date (format: YYYY-MM-DD)
- `toDate` - End date (format: YYYY-MM-DD)

### Response Headers
- `X-Total-Count` - Total number of records
- `X-Page` - Current page number
- `X-Page-Size` - Items per page

## 📊 Database Schema

### Tables Created Automatically
- `machines` - Machine information
- `milk_collections` - Milk collection records
- `milk_dispatches` - Milk dispatch records
- `milk_sales` - Milk sales records

All tables include:
- Auto-increment `id` primary key
- `created_at` and `updated_at` timestamps
- Proper indexes for performance
- Foreign key relationships

## 🔧 Configuration

Edit `appsettings.json` to configure:
- Database connection strings
- JWT settings (if authentication needed)
- Machine-specific settings
- Logging levels

## 📝 Example Requests

### ESP32 Machine Statistics (Auto-normalized)
```bash
# ESP32 sends MM13, database stores as M13
curl "http://localhost:5000/api/MachineStatistics/SaveMachineStatisticsFromMachine?InputString=S1|LSE-SVPWTBQ-12AH|LE3.36|MM13|T450|D6|W6|S80|G6|DISABLE|D2026-12-27_09:00:00"
```

### Farmer Info with Machine Verification
```bash
# Requires machine MM8 to exist and belong to society S1
curl "http://localhost:5000/api/FarmerInfo/GetLatestFarmerInfo?InputString=S1|LSE-SVPWTBQ-12AH|LE2.00|MM8|C00001"
```

### Upload Farmer CSV
```bash
curl -X POST "http://localhost:5000/api/FarmerInfo/UploadFarmerDetails" \
  -F "societyId=S1" \
  -F "machineId=MM8" \
  -F "file=@farmers.csv"
```

### Machine Correction
```bash
# Save correction for channel 1 (COW)
curl "http://localhost:5000/api/Machine/MachineCorrection/SaveMachineCorrectionFromMachine?input=S1|LSE-SVPWTBQ-12AH|LE3.36|MM15|1|3.8|8.2|120|25|5.5|D2026-01-29_10:30:00"
```

## 🛠️ Development

### Build for Production
```bash
dotnet publish -c Release -o ./publish
```

### Run Tests (add later)
```bash
dotnet test
```

### Database Migrations (if using EF migrations)
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 📦 NuGet Packages Used
- `Pomelo.EntityFrameworkCore.MySql` - MySQL provider for EF Core
- `Microsoft.EntityFrameworkCore.Design` - EF Core tools
- `Swashbuckle.AspNetCore` - Swagger/OpenAPI documentation

## 🌐 CORS
Currently configured to allow all origins. In production, restrict to specific origins in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
    {
        builder.WithOrigins("https://yourapp.com")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

## 📄 License
Poornasree Equipments © 2026
