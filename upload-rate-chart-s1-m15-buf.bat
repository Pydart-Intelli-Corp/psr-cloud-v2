@echo off
echo 📊 Uploading BUF rate chart for Society S1, Machines M12, M15...

curl -X POST http://localhost:5000/api/RateCharts/UploadRateChartDetails -F "file=@P:/psr-cloud-v2/public/sample_datas/COW.csv" -F "societyIds=S1" -F "machineIds=M10,M11" -F "channel=BUF" -H "Content-Type: multipart/form-data"

echo.
echo ✅ BUF rate chart upload completed!
pause
