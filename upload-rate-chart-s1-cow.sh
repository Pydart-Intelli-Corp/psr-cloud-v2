#!/bin/bash

# Upload Rate Chart for Society S1, Machine M12, Channel COW using HTTP POST
# Endpoint: POST /api/RateCharts/UploadRateChartDetails

echo "📊 Uploading rate chart for Society S1, Machine M12, Channel COW..."

curl -X POST http://localhost:5000/api/RateCharts/UploadRateChartDetails \
  -F "file=@P:/psr-cloud-v2/public/sample_datas/small.csv" \
  -F "societyIds=S1" \
  -F "machineIds=M12" \
  -F "channel=COW" \
  -H "Content-Type: multipart/form-data"

echo ""
echo "✅ Rate chart upload completed!"