# InterviewIQ AI API Specification

## System Endpoints

### 1. Root Endpoint
- **URL:** `/`
- **Method:** `GET`
- **Access:** Public
- **Description:** Returns welcoming API metadata and available utility endpoints.

### 2. Base API Directory
- **URL:** `/api`
- **Method:** `GET`
- **Access:** Public
- **Description:** Returns base API metadata.

### 3. System Health Check
- **URL:** `/api/health`
- **Method:** `GET`
- **Access:** Public
- **Description:** Returns health status of backend server.
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "InterviewIQ AI Backend Running",
    "status": "OK",
    "timestamp": "2026-07-22T01:30:00.000Z"
  }
  ```

### 4. API Version
- **URL:** `/api/version`
- **Method:** `GET`
- **Access:** Public
- **Description:** Returns version, environment, and uptime metrics.
