# Test GetLatestMachineCorrection Endpoint

$baseUrl = "http://localhost:5000"
$endpoint = "$baseUrl/api/MachineCorrection/GetLatestMachineCorrection"

Write-Host "Testing GetLatestMachineCorrection API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Get correction for m15
$inputString = "S1|LSE-SVWTBQ-12AH|LE3.36|m15"
Write-Host "Test 1: Machine m15" -ForegroundColor Green
Write-Host "InputString: $inputString" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$endpoint?InputString=$inputString" -Method Get
    Write-Host "Response: $response" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get correction for m14
$inputString2 = "S1|LSE-SVWTBQ-12AH|LE3.36|m14"
Write-Host "Test 2: Machine m14" -ForegroundColor Green
Write-Host "InputString: $inputString2" -ForegroundColor Yellow

try {
    $response2 = Invoke-RestMethod -Uri "$endpoint?InputString=$inputString2" -Method Get
    Write-Host "Response: $response2" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Test completed!" -ForegroundColor Cyan
