# External Authentication API Documentation

**Base URL (Production)**: `https://v4.poornasreecloud.com`  
**Base URL (Development)**: `http://localhost:3000`

> **Note**: This documentation uses the production URL. If testing locally, replace the base URL with `http://localhost:3000`.

This API allows external entities (Societies, Farmers, BMCs, Dairies) to authenticate via OTP and access their data.

---

## 1. Send OTP
Initiates the login process by sending a One-Time Password (OTP) to the user's registered email address. The system automatically detects the user's role and organization.

- **Endpoint**: `/api/external/auth/send-otp`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "OTP sent successfully to your email address",
  "data": {
    "email": "user@example.com",
    "entityType": "society",
    "entityName": "Nandini Society",
    "adminName": "Admin Name",
    "message": "OTP sent to user@example.com. Please check your email and enter the 6-digit code."
  }
}
```

### Error Responses
- **400 Bad Request**: Email is required or invalid.
- **404 Not Found**: Email address not found in the system.

---

## 2. Verify OTP
Verifies the OTP and returns authentication tokens.

- **Endpoint**: `/api/external/auth/verify-otp`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "type": "society",
      "id": 1,
      "societyId": "S-001",
      "name": "Nandini Society",
      "email": "user@example.com",
      "status": "active",
      "adminName": "Admin Name",
      "schema": "admin_schema_key"
    }
  }
}
```

### Error Responses
- **400 Bad Request**: Invalid OTP or expired OTP.
- **404 Not Found**: OTP session not found (request a new OTP).

---

## 3. Refresh Token
Obtains a new access token using a valid refresh token.

- **Endpoint**: `/api/external/auth/refresh`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_access_token...",
    "refreshToken": "new_refresh_token...",
    "expiresIn": "7d"
  }
}
```

### Error Responses
- **401 Unauthorized**: Invalid or expired refresh token.

---

## 4. Get Profile
Retrieves the detailed profile of the authenticated user.

- **Endpoint**: `/api/external/auth/profile`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer <access_token>`

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Nandini Society",
    "society_id": "S-001",
    "email": "user@example.com",
    "location": "Bangalore",
    "president_name": "John Doe",
    "contact_phone": "9876543210",
    "status": "active",
    "bmc_name": "Main BMC",
    "dairy_name": "Central Dairy",
    "active_farmers_count": 50,
    "collections_last_30d": 1200
  }
}
```

### Error Responses
- **401 Unauthorized**: Invalid or missing token.

---

## 5. Get Dashboard
Retrieves statistical data and recent activities relevant to the user's role.

- **Endpoint**: `/api/external/auth/dashboard`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer <access_token>`

### Success Response (200 OK) - Example for Society
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "type": "society",
    "stats": {
      "total_farmers": 50,
      "active_farmers": 45,
      "collections_today": 40,
      "quantity_today": 500.5,
      "amount_today": 15000,
      "collections_last_30d": 1200,
      "quantity_last_30d": 15000,
      "amount_last_30d": 450000
    },
    "recentCollections": [
      {
        "id": 101,
        "collection_date": "2025-12-22",
        "collection_time": "06:30:00",
        "quantity": 10.5,
        "fat_percentage": 4.2,
        "snf_percentage": 8.5,
        "total_amount": 350,
        "farmer_name": "Ramesh"
      }
    ]
  }
}
```

### Error Responses
- **401 Unauthorized**: Invalid or missing token.

---

## 6. Logout
Invalidates the user session.

- **Endpoint**: `/api/external/auth/logout`
- **Method**: `POST`
- **Headers**: 
  - `Authorization`: `Bearer <access_token>`

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "You have been successfully logged out"
  }
}
```
