# InterviewIQ AI — Phase 10 Admin API Postman Collection & Testing Guide

This documentation details the complete administrative API suite (`/api/v1/admin/*`) ready for Postman environment importing and security testing.

## Environment Variables

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:5000/api/v1` | Backend API base URL |
| `adminToken` | `Bearer eyJhbGciOi...` | JWT Bearer token for an authenticated Admin user (`role: "Admin"`) |
| `userToken` | `Bearer eyJhbGciOi...` | JWT Bearer token for a normal Student user (`role: "Student"`) |
| `companyId` | `67ab1234567890abcdef1234` | MongoDB ObjectId for testing company endpoints |
| `jobId` | `67ab1234567890abcdef5678` | MongoDB ObjectId for testing job endpoints |
| `userId` | `67ab1234567890abcdef9012` | MongoDB ObjectId for testing user endpoints |
| `notificationId` | `67ab1234567890abcdef3456` | MongoDB ObjectId for testing notification endpoints |
| `auditLogId` | `67ab1234567890abcdef7890` | MongoDB ObjectId for testing audit log endpoints |

---

## Postman Request Collection

### 1. Authorization & Health Checks

#### 1.1 Admin Authorization Check
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/health`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`
- **Response Schema**:
```json
{
  "success": true,
  "message": "Admin system authorization verified successfully",
  "data": {
    "adminUser": {
      "id": "67ab1234567890abcdef1234",
      "email": "admin@interviewiq.ai",
      "role": "Admin"
    },
    "status": "HEALTHY",
    "timestamp": "2026-08-11T12:00:00.000Z"
  }
}
```

#### 1.2 Forbidden Access Check (Normal User)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/health`
- **Headers**:
  - `Authorization`: `{{userToken}}`
- **Expected Status**: `403 Forbidden`
- **Response Schema**:
```json
{
  "success": false,
  "message": "Access denied. Role 'Student' is not authorized to access this resource."
}
```

---

### 2. User Management

#### 2.1 List Users
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/users?page=1&limit=10&search=alice&role=Student&status=active`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`

#### 2.2 Update User Status (Deactivate)
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/admin/users/{{userId}}/status`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "status": "deactivated"
}
```
- **Expected Status**: `200 OK`

#### 2.3 Attempt Admin Self-Deletion Guard
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/admin/users/{{adminUserId}}`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `400 Bad Request`
- **Response**:
```json
{
  "success": false,
  "message": "Admin cannot delete their own account"
}
```

---

### 3. Company Management

#### 3.1 Create Company Profile
- **Method**: `POST`
- **URL**: `{{baseUrl}}/admin/companies`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "companyName": "Acme Innovations Inc",
  "industry": "Artificial Intelligence",
  "website": "https://acmeai.example.com",
  "description": "Leading artificial intelligence and career acceleration technology company.",
  "location": "San Francisco, CA"
}
```
- **Expected Status**: `201 Created`

#### 3.2 Company Deletion with Job Safety Guard
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/admin/companies/{{companyId}}`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `400 Bad Request` (when force is omitted and active jobs exist)

---

### 4. Job Management

#### 4.1 Create Job Posting
- **Method**: `POST`
- **URL**: `{{baseUrl}}/admin/jobs`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "title": "Senior AI Backend Engineer",
  "company": "{{companyId}}",
  "description": "Building scalable backend services for AI mock interviews and career telemetry.",
  "requirements": ["Node.js", "MongoDB", "Express", "System Design"],
  "location": "Remote",
  "workMode": "Remote",
  "employmentType": "Full-time",
  "status": "Active"
}
```
- **Expected Status**: `201 Created`

---

### 5. Application Monitoring

#### 5.1 Platform Application Conversion Statistics
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/applications/statistics`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`

---

### 6. AI Usage Telemetry Monitoring

#### 6.1 Overall AI Usage
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/ai/usage`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`

---

### 7. Platform Analytics & Dashboard

#### 7.1 Dashboard Overview
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/dashboard`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`

---

### 8. Audit Logging

#### 8.1 List Audit Trail Records
- **Method**: `GET`
- **URL**: `{{baseUrl}}/admin/audit-logs?page=1&limit=10&action=DEACTIVATE_USER`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
- **Expected Status**: `200 OK`

---

### 9. System Announcements & Notifications

#### 9.1 Broadcast Announcement to ALL Active Users
- **Method**: `POST`
- **URL**: `{{baseUrl}}/admin/notifications`
- **Headers**:
  - `Authorization`: `{{adminToken}}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "title": "Platform Scheduled Maintenance",
  "message": "InterviewIQ will be undergo scheduled maintenance tonight at 11 PM UTC.",
  "type": "SYSTEM",
  "priority": "HIGH",
  "audience": "ALL"
}
```
- **Expected Status**: `201 Created`
