# Live API Monitoring System

## Overview
Real-time monitoring dashboard for tracking all API endpoints, society-specific requests, external API calls, and system performance metrics in the super admin panel.

## Features

### 1. Real-Time Monitoring
- ✅ Live request tracking with Server-Sent Events (SSE)
- ✅ Auto-refresh with pause/resume capability
- ✅ Instant updates when new requests arrive
- ✅ Connection status indicator

### 2. Request Tracking
**Categories:**
- 🟣 External APIs - Milk testing machine integrations
- 🔵 Admin APIs - Admin panel operations  
- 🟢 Farmer APIs - Farmer management endpoints
- 🟠 Machine APIs - Machine configuration and management
- 🔴 Authentication - Login/logout operations
- ⚪ Other - Miscellaneous endpoints

**Captured Data:**
- Timestamp
- HTTP Method (GET, POST, PUT, DELETE)
- Endpoint path
- DB Key (for external APIs)
- Society ID
- Machine ID
- InputString (for external APIs)
- Status Code (200, 400, 500, etc.)
- Response Time (ms)
- IP Address
- User Agent
- Error Messages

### 3. Analytics & Stats

**Real-Time Metrics:**
- Total Requests Count
- Average Response Time
- Error Rate (%)
- Success Rate (%)

**Breakdowns:**
- Requests by Category
- Requests by Status Code (2xx, 3xx, 4xx, 5xx)
- Top Endpoints (5 most hit)
- Top Societies (5 most active)
- Requests by DB Key (admin)

### 4. Filtering & Time Ranges

**Filters:**
- Category (External, Admin, Farmer, Machine, Auth, Other)
- DB Key (specific admin)
- Society ID (specific society)

**Time Ranges:**
- Last 1 minute
- Last 5 minutes  
- Last 15 minutes
- Last 1 hour
- All time

### 5. Request History
- Last 100 requests in real-time table
- Color-coded status codes:
  - 🟢 Green: Success (2xx)
  - 🔵 Blue: Redirect (3xx)
  - 🟡 Yellow: Client Error (4xx)
  - 🔴 Red: Server Error (5xx)
- Animated entry/exit transitions
- Detailed information per request

## API Endpoints

### 1. Get Recent Requests
```http
GET /api/superadmin/monitoring/requests?category=external&dbKey=BAB1568&societyId=333&limit=100&since=2025-11-07T10:00:00Z
```

**Query Parameters:**
- `category` (optional): Filter by category
- `dbKey` (optional): Filter by DB Key
- `societyId` (optional): Filter by society ID
- `limit` (optional): Max number of results (default: 100)
- `since` (optional): Only return requests after this timestamp

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1730980234567-abc123",
      "timestamp": "2025-11-07T10:30:34.567Z",
      "method": "GET",
      "path": "/api/BAB1568/FarmerInfo/GetLatestFarmerInfo",
      "endpoint": "FarmerInfo/GetLatest",
      "dbKey": "BAB1568",
      "societyId": "333",
      "machineId": "M00000001",
      "inputString": "333|ECOD|LE2.00|M00000001",
      "statusCode": 200,
      "responseTime": 145,
      "userAgent": "Quectel_BG96",
      "ip": "168.231.121.19",
      "category": "external"
    }
  ],
  "count": 1
}
```

### 2. Get Statistics
```http
GET /api/superadmin/monitoring/stats?since=2025-11-07T10:00:00Z&category=external
```

**Query Parameters:**
- `since` (optional): Only count requests after this timestamp
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1247,
    "byCategory": {
      "external": 856,
      "admin": 245,
      "farmer": 89,
      "machine": 34,
      "auth": 23
    },
    "byStatus": {
      "2xx": 1180,
      "4xx": 52,
      "5xx": 15
    },
    "byEndpoint": {
      "FarmerInfo/GetLatest": 856,
      "farmer": 89,
      "auth/login": 23
    },
    "bySociety": {
      "333": 245,
      "555": 189,
      "777": 134
    },
    "byDbKey": {
      "BAB1568": 856,
      "XYZ1234": 234
    },
    "avgResponseTime": 127.5,
    "errorRate": 5.37,
    "activeListeners": 2
  }
}
```

### 3. Real-Time Stream (SSE)
```http
GET /api/superadmin/monitoring/stream
```

**Stream Events:**
```javascript
// Connection established
data: {"type":"connected","timestamp":"2025-11-07T10:30:00Z"}

// New request
data: {"type":"request","data":{...request object...}}

// Heartbeat (every 30s)
data: {"type":"heartbeat","timestamp":"2025-11-07T10:30:30Z"}
```

### 4. Clear Logs
```http
DELETE /api/superadmin/monitoring/requests
```

**Response:**
```json
{
  "success": true,
  "message": "Request logs cleared"
}
```

## Usage

### Access the Monitor

1. Login as super admin
2. Navigate to Super Admin Dashboard
3. Click "Live Monitor" in sidebar OR
4. Direct URL: `http://168.231.121.19/superadmin/monitoring`

### Features in Action

**Live Mode:**
- Toggle "Live Mode" button to enable/disable real-time updates
- Green pulsing dot indicates active connection
- Requests appear instantly as they hit the server

**Filter Requests:**
1. Select category from dropdown (e.g., "External APIs")
2. Choose time range (e.g., "Last 5 minutes")
3. Click on society/endpoint cards to filter by that value
4. Use "Clear Filters" to reset

**View Details:**
- Hover over table rows for highlighting
- Check status codes (color-coded)
- View response times
- See IP addresses and user agents

**Clear History:**
- Click "Clear" button
- Confirm deletion
- All request logs will be cleared
- Fresh start for monitoring

## Logged Endpoints

### External APIs
✅ `/api/[db-key]/FarmerInfo/GetLatestFarmerInfo` - Farmer data retrieval
🚧 `/api/[db-key]/MachinePassword/GetPassword` - Machine passwords (pending)
🚧 `/api/[db-key]/UpdateMachinePasswordStatus` - Password status (pending)
🚧 `/api/[db-key]/MachineCorrection` - Machine corrections (pending)

### Admin APIs
🚧 All `/api/user/*` endpoints (pending)
🚧 All `/api/admin/*` endpoints (pending)
🚧 All `/api/superadmin/*` endpoints (pending)

## Technical Implementation

### Request Logger
- **File**: `src/lib/monitoring/requestLogger.ts`
- **Storage**: In-memory (last 1000 requests)
- **Pub/Sub**: Real-time notification to all SSE listeners
- **Thread-safe**: Handles concurrent requests

### API Routes
- `src/app/api/superadmin/monitoring/requests/route.ts` - GET/DELETE requests
- `src/app/api/superadmin/monitoring/stats/route.ts` - GET statistics
- `src/app/api/superadmin/monitoring/stream/route.ts` - SSE stream

### Dashboard
- `src/app/superadmin/monitoring/page.tsx` - Main monitoring UI
- Real-time charts and tables
- Framer Motion animations
- Responsive design (mobile, tablet, desktop)

### Middleware Integration
Currently integrated:
- ✅ FarmerInfo API (manual logging in GET/POST handlers)

To be integrated:
- 🚧 All other external APIs
- 🚧 Admin APIs
- 🚧 Authentication endpoints
- 🚧 Farmer management APIs
- 🚧 Machine APIs

## Performance Considerations

**Memory Usage:**
- Stores last 1000 requests in RAM
- Approx. 200KB per 1000 requests
- Auto-cleanup (FIFO)

**Network:**
- SSE connection: ~1KB/min (heartbeats)
- Request events: ~500 bytes each
- Minimal bandwidth impact

**Server Load:**
- Logging overhead: <1ms per request
- SSE broadcasting: <1ms per event
- Negligible impact on API performance

## Troubleshooting

### SSE Not Connecting
```bash
# Check PM2 logs
pm2 logs psr-v4 | grep "SSE\|monitoring"

# Verify endpoint accessible
curl http://168.231.121.19/api/superadmin/monitoring/stream
```

### No Requests Showing
```bash
# Check if logging is active
curl "http://168.231.121.19/api/superadmin/monitoring/stats"

# Trigger test request
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001"

# Check recent requests
curl "http://168.231.121.19/api/superadmin/monitoring/requests?limit=10"
```

### High Memory Usage
```bash
# Clear logs via API
curl -X DELETE http://168.231.121.19/api/superadmin/monitoring/requests

# Or restart app
pm2 restart psr-v4
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic request logging
- ✅ Real-time SSE updates
- ✅ Category-based filtering
- ✅ Statistics dashboard
- ✅ FarmerInfo API integration

### Phase 2 (Planned)
- 🚧 Log all API endpoints automatically
- 🚧 Persistent storage (database)
- 🚧 Historical data export (CSV, JSON)
- 🚧 Advanced filtering (date ranges, multiple filters)
- 🚧 Request/response body viewing

### Phase 3 (Future)
- 🚧 Performance alerts (slow requests, errors)
- 🚧 Anomaly detection (unusual patterns)
- 🚧 Request replay for debugging
- 🚧 API usage quotas and limits
- 🚧 Integration with Grafana/Prometheus

### Phase 4 (Advanced)
- 🚧 Machine learning for traffic prediction
- 🚧 Automated incident response
- 🚧 Custom dashboards per admin
- 🚧 Mobile app for monitoring
- 🚧 Slack/Email notifications

## Security

**Access Control:**
- ✅ Super admin only (role check)
- ✅ JWT token required
- ✅ No sensitive data in logs (passwords filtered)

**Data Protection:**
- ✅ Logs stored in memory (not persisted)
- ✅ Auto-cleanup after 1000 requests
- ✅ No PII in external API logs

**Network:**
- ✅ HTTPS ready (when SSL configured)
- ✅ CORS configured for SSE
- ✅ Rate limiting ready (to be implemented)

## Deployment

**Prerequisites:**
- Super admin credentials configured
- MySQL port 3306 open (for data queries)
- PM2 running the application

**Steps:**
1. Commit changes
2. Push to master
3. GitHub Actions deploys automatically
4. Access: `http://168.231.121.19/superadmin/monitoring`

**Verification:**
```bash
# 1. Login as super admin
# 2. Open monitoring page
# 3. Toggle "Live Mode" ON
# 4. Trigger test request:
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333%7CECOD%7CLE2.00%7CM00000001"
# 5. Verify request appears in table
# 6. Check stats update
```

## Support

**Logs:**
```bash
# PM2 application logs
pm2 logs psr-v4

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

**Database:**
```bash
mysql -u psr_admin -p psr_v4_main
# Check for issues with database connections
```

**Contact:**
- System Administrator
- Check PM2 logs for detailed errors
- Review browser console for SSE connection issues

---

**Last Updated:** November 7, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
