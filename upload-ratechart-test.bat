@echo off
echo 📊 Uploading COW rate chart for Society S1, Machine M12...

curl -X POST http://localhost:5000/api/RateChart/UploadRateChart -F "file=@P:/psr-cloud-v2/public/sample_datas/small.csv" -F "societyId=S1" -F "machineId=M12" -F "channel=COW"

echo.
echo ✅ Rate chart upload completed!
pause
