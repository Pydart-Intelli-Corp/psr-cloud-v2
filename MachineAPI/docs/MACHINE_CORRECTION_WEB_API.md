# Machine Correction Web API

## Endpoint: POST /api/MachineCorrection/SaveFromWeb

Save machine correction values from web application.

### Request Body (JSON)
```json
{
  "machineId": "M13",
  "societyId": "S-001",
  "channel1_fat": 0.10,
  "channel1_snf": 0.05,
  "channel1_clr": 0.00,
  "channel1_temp": 0.00,
  "channel1_water": 0.00,
  "channel1_protein": 0.00,
  "channel2_fat": 0.15,
  "channel2_snf": 0.08,
  "channel2_clr": 0.00,
  "channel2_temp": 0.00,
  "channel2_water": 0.00,
  "channel2_protein": 0.00,
  "channel3_fat": 0.00,
  "channel3_snf": 0.00,
  "channel3_clr": 0.00,
  "channel3_temp": 0.00,
  "channel3_water": 0.00,
  "channel3_protein": 0.00
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Machine correction saved successfully"
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Machine not found"
}
```

### Features
- ✅ Uses original machine_id (e.g., "M13") and society_id (e.g., "S-001")
- ✅ Validates machine existence
- ✅ Deactivates previous corrections (status = 0)
- ✅ Saves new correction with status = 1
- ✅ Keeps only last 5 records per machine
- ✅ Uses transactions for data consistency
- ✅ No dbKey required (uses machine's society_id)

### Database Table
Table: `machine_corrections`
- Status: 1 = active, 0 = inactive
- Only one active record per machine at a time
- Automatically maintains last 5 records per machine

### cURL Example
```bash
curl -X POST http://localhost:5000/api/MachineCorrection/SaveFromWeb \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "M13",
    "societyId": "S-001",
    "channel1_fat": 0.10,
    "channel1_snf": 0.05
  }'
```
