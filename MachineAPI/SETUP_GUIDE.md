# Machine API Setup & Run Guide

## 🎯 Complete Setup Instructions

### Step 1: Navigate to Project Directory
```powershell
cd p:\psr-cloud-v2\MachineAPI
```

### Step 2: Restore NuGet Packages
```powershell
dotnet restore
```

### Step 3: Create MySQL Database
Open MySQL and run:
```sql
CREATE DATABASE psr_machine_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Build the Project
```powershell
dotnet build
```

### Step 5: Run the Application
```powershell
dotnet run
```

The API will automatically:
- ✅ Create database tables
- ✅ Set up indexes
- ✅ Start the server
- ✅ Open Swagger UI in browser

### Access Points:
- 🌐 **Swagger UI**: http://localhost:5000
- 🔒 **HTTPS**: https://localhost:5001
- 📡 **API Base**: http://localhost:5000/api

---

## 🧪 Quick Test Commands

### 1. Create a Machine
```powershell
$body = @{
    machineId = "M001"
    machineType = "Lactosure"
    societyId = 1
    location = "Main Society Hall"
    operatorName = "John Doe"
    contactPhone = "9876543210"
    status = "active"
    isMasterMachine = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/machines" -Method Post -Body $body -ContentType "application/json"
```

### 2. Create a Collection
```powershell
$collection = @{
    farmerId = "F001"
    societyId = 1
    machineId = 1
    collectionDate = "2026-01-28"
    collectionTime = "06:30:00"
    shiftType = "morning"
    farmerName = "Test Farmer"
    channel = "COW"
    quantity = 10.5
    fatPercentage = 4.2
    snfPercentage = 8.5
    ratePerLiter = 35.00
    totalAmount = 367.50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/collections" -Method Post -Body $collection -ContentType "application/json"
```

### 3. Get All Machines
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/machines" -Method Get
```

### 4. Get Collections with Filters
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/collections?societyId=1&page=1&pageSize=10" -Method Get
```

### 5. Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/collections/statistics?societyId=1" -Method Get
```

---

## 🗂️ Database Tables Created

The API automatically creates these tables:

### `machines`
- Machine registration and management
- Password storage for user/supervisor access
- Status tracking (active, inactive, maintenance)

### `milk_collections`
- Daily milk collection records
- Quality parameters (FAT, SNF, CLR, Protein, Lactose)
- Farmer and society tracking
- Rate and amount calculations

### `milk_dispatches`
- Dispatch records from machines to collection centers
- Batch quality tracking
- Society-wise dispatch management

### `milk_sales`
- Retail milk sales
- Customer information
- Sales tracking per machine

---

## 📊 API Features

### ✅ Implemented Features
1. **CRUD Operations** for all entities
2. **Bulk Insert** for collections, dispatches, sales
3. **Advanced Filtering** with query parameters
4. **Pagination** with headers
5. **Statistics & Reports** 
6. **Machine Statistics** (30-day summary)
7. **Daily Sales Reports**
8. **Password Management** for machines
9. **Status Updates** for machines
10. **Related Data Loading** (with Include)

### 🔍 Query Capabilities
- Filter by date ranges
- Filter by society/machine
- Search by farmer/customer
- Pagination support
- Sorting by date/time

### 📈 Statistics Endpoints
- Collection statistics (quantity, quality, farmers)
- Dispatch statistics (quantity, quality)
- Sales statistics (quantity, revenue, customers)
- Machine-specific statistics

---

## 🎨 Swagger UI Features

When you open http://localhost:5000, you'll see:
- ✅ Interactive API documentation
- ✅ Try out each endpoint
- ✅ See request/response models
- ✅ Copy curl commands
- ✅ Test authentication (if added later)

---

## 🔧 Troubleshooting

### Database Connection Error
```
Error: Unable to connect to MySQL
```
**Solution**: Check MySQL is running and credentials are correct in `appsettings.json`

### Port Already in Use
```
Error: Address already in use
```
**Solution**: Change port in `Properties/launchSettings.json` or stop the process using port 5000

### Missing Dependencies
```
Error: Package restore failed
```
**Solution**: Run `dotnet restore` again with internet connection

---

## 🚀 Production Deployment

### 1. Update Connection String
Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=your-server;Database=psr_machine_api;User=user;Password=pass;"
}
```

### 2. Build for Release
```powershell
dotnet publish -c Release -o ./publish
```

### 3. Run in Production
```powershell
cd publish
dotnet MachineAPI.dll
```

---

## 📞 API Support

For issues or questions:
- Check Swagger UI documentation
- Review error logs in console
- Check database connectivity
- Verify request format matches models

---

## 🎯 Next Steps

1. ✅ API is ready to use
2. 📱 Integrate with Flutter/React apps
3. 🔐 Add JWT authentication (optional)
4. 📊 Add more analytics endpoints
5. 🔔 Add real-time notifications
6. 📧 Add email alerts
7. 📱 Add mobile-specific endpoints
