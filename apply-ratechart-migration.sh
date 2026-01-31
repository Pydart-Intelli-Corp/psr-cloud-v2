#!/bin/bash

# Rate Chart Upload Migration Script
# This script applies the database migration for rate chart upload functionality

echo "🚀 Starting Rate Chart Upload Migration..."

# Navigate to MachineAPI directory
cd "$(dirname "$0")/MachineAPI"

# Check if dotnet CLI is available
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET CLI not found. Please install .NET SDK."
    exit 1
fi

# Apply the migration
echo "📦 Applying migration: AddRateChartUploadTables..."
dotnet ef database update --verbose

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "📊 Rate chart upload tables are now ready:"
    echo "   - rate_chart_data (new table)"
    echo "   - rate_charts (updated with upload columns)"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

echo "🎉 Rate chart upload functionality is now available!"