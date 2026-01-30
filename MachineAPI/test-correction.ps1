# Test Machine Correction Web API Endpoint
# Run this script when the MachineAPI server is running

$baseUrl = "http://localhost:5000"
$endpoint = "$baseUrl/api/MachineCorrection/SaveFromWeb"

Write-Host "Testing Machine Correction Web API..." -ForegroundColor Cyan
Write-Host "Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Sample 1: Machine M13 with all channels
$sample1 = @{
    machineId = "M13"
    societyId = "S-001"
    channel1_fat = 0.10
    channel1_snf = 0.05
    channel1_clr = 0.02
    channel1_temp = 0.00
    channel1_water = 0.00
    channel1_protein = 0.03
    channel2_fat = 0.15
    channel2_snf = 0.08
    channel2_clr = 0.01
    channel2_temp = 0.00
    channel2_water = 0.00
    channel2_protein = 0.04
    channel3_fat = 0.12
    channel3_snf = 0.06
    channel3_clr = 0.00
    channel3_temp = 0.00
    channel3_water = 0.00
    channel3_protein = 0.02
} | ConvertTo-Json

Write-Host "Sample 1: Machine M13 - All Channels" -ForegroundColor Green
try {
    $response1 = Invoke-RestMethod -Uri $endpoint -Method Post -Body $sample1 -ContentType "application/json"
    Write-Host "Response: $($response1 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Sample 2: Machine M14 with channel 1 only
$sample2 = @{
    machineId = "M14"
    channel1_fat = 0.20
    channel1_snf = 0.10
    channel1_clr = 0.05
    channel1_temp = 1.00
    channel1_water = 0.00
    channel1_protein = 0.05
} | ConvertTo-Json

Write-Host "Sample 2: Machine M14 - Channel 1 Only" -ForegroundColor Green
try {
    $response2 = Invoke-RestMethod -Uri $endpoint -Method Post -Body $sample2 -ContentType "application/json"
    Write-Host "Response: $($response2 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Sample 3: Machine M15 with channels 1 and 2
$sample3 = @{
    machineId = "M15"
    societyId = "S-002"
    channel1_fat = 0.08
    channel1_snf = 0.04
    channel2_fat = 0.12
    channel2_snf = 0.06
} | ConvertTo-Json

Write-Host "Sample 3: Machine M15 - Channels 1 & 2" -ForegroundColor Green
try {
    $response3 = Invoke-RestMethod -Uri $endpoint -Method Post -Body $sample3 -ContentType "application/json"
    Write-Host "Response: $($response3 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Test completed!" -ForegroundColor Cyan
