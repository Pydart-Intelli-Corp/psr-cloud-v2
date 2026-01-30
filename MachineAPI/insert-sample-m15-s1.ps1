# Insert Sample Correction Data
# Machine: m15, Society: s1

$baseUrl = "http://localhost:5000"
$endpoint = "$baseUrl/api/MachineCorrection/SaveFromWeb"

$sampleData = @{
    machineId = "m15"
    societyId = "s1"
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

Write-Host "Inserting sample data for Machine: m15, Society: s1" -ForegroundColor Cyan
Write-Host "Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $sampleData -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Red
    }
}
