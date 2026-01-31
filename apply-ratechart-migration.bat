@echo off
REM Rate Chart Upload Migration Script
REM This script applies the database migration for rate chart upload functionality

echo 🚀 Starting Rate Chart Upload Migration...

REM Navigate to MachineAPI directory
cd /d "%~dp0MachineAPI"

REM Check if dotnet CLI is available
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ .NET CLI not found. Please install .NET SDK.
    pause
    exit /b 1
)

REM Apply the migration
echo 📦 Applying migration: AddRateChartUploadTables...
dotnet ef database update --verbose

if %errorlevel% equ 0 (
    echo ✅ Migration applied successfully!
    echo 📊 Rate chart upload tables are now ready:
    echo    - rate_chart_data (new table^)
    echo    - rate_charts (updated with upload columns^)
    echo 🎉 Rate chart upload functionality is now available!
) else (
    echo ❌ Migration failed. Please check the error messages above.
    pause
    exit /b 1
)

pause