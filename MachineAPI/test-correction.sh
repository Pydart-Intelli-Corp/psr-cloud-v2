#!/bin/bash
# Test Machine Correction Web API Endpoint

BASE_URL="http://localhost:5000"
ENDPOINT="$BASE_URL/api/MachineCorrection/SaveFromWeb"

echo -e "\033[36mTesting Machine Correction Web API...\033[0m"
echo -e "\033[33mEndpoint: $ENDPOINT\033[0m"
echo ""

# Sample 1: Machine M13 with all channels
echo -e "\033[32mSample 1: Machine M13 - All Channels\033[0m"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "M13",
    "societyId": "S-001",
    "channel1_fat": 0.10,
    "channel1_snf": 0.05,
    "channel1_clr": 0.02,
    "channel1_temp": 0.00,
    "channel1_water": 0.00,
    "channel1_protein": 0.03,
    "channel2_fat": 0.15,
    "channel2_snf": 0.08,
    "channel2_clr": 0.01,
    "channel2_temp": 0.00,
    "channel2_water": 0.00,
    "channel2_protein": 0.04,
    "channel3_fat": 0.12,
    "channel3_snf": 0.06,
    "channel3_clr": 0.00,
    "channel3_temp": 0.00,
    "channel3_water": 0.00,
    "channel3_protein": 0.02
  }'
echo -e "\n"

# Sample 2: Machine M14 with channel 1 only
echo -e "\033[32mSample 2: Machine M14 - Channel 1 Only\033[0m"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "M14",
    "channel1_fat": 0.20,
    "channel1_snf": 0.10,
    "channel1_clr": 0.05,
    "channel1_temp": 1.00,
    "channel1_water": 0.00,
    "channel1_protein": 0.05
  }'
echo -e "\n"

# Sample 3: Machine M15 with channels 1 and 2
echo -e "\033[32mSample 3: Machine M15 - Channels 1 & 2\033[0m"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "M15",
    "societyId": "S-002",
    "channel1_fat": 0.08,
    "channel1_snf": 0.04,
    "channel2_fat": 0.12,
    "channel2_snf": 0.06
  }'
echo -e "\n"

echo -e "\033[36mTest completed!\033[0m"
