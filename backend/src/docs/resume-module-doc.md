# InterviewIQ AI - Resume Module Documentation

Production-grade Resume Management Module for the **InterviewIQ AI** platform.

---

## 📁 Module Folder Structure

The Resume module follows a modular **Repository-Service-Controller** architecture. All domain logic is self-contained inside `src/resume/`, while central export bridges exist in root layer directories (`models/`, `routes/`, `controllers/`, `services/`, `repositories/`, `validations/`) for developer convenience and architectural flexibility.

```
backend/
├── src/
│   ├── resume/                         # Primary Resume Domain Module
│   │   ├── resume.model.js             # Mongoose Schema, Indexes & AI Analysis Subdocument
│   │   ├── resume.repository.js        # Data Access Layer (Pure MongoDB operations)
│   │   ├── resume.service.js           # Domain Business Logic & Cloudinary Stream Handling
│   │   ├── resume.controller.js        # HTTP Request Handlers & ApiResponse Wrapper
│   │   ├── resume.routes.js            # Express Router & Middleware Pipeline Definition
│   │   ├── resume.validation.js        # File Filter, PDF Magic Bytes & Express Validator
│   │   └── resume.test.js              # Integration & Security Test Suite
│   ├── models/
│   │   └── Resume.js                   # Bridge Export -> ../resume/resume.model.js
│   ├── routes/
│   │   └── resume.routes.js            # Bridge Export -> ../resume/resume.routes.js
│   ├── controllers/
│   │   └── resume.controller.js        # Bridge Export -> ../resume/resume.controller.js
│   ├── services/
│   │   └── resume.service.js           # Bridge Export -> ../resume/resume.service.js
│   ├── repositories/
│   │   └── resume.repository.js        # Bridge Export -> ../resume/resume.repository.js
│   └── validations/
│       └── resume.validation.js        # Bridge Export -> ../resume/resume.validation.js
```

---

## 🏛️ Architectural Layer Responsibilities

```
[ Express Router ] ──(JWT & File Validation)──► [ Controller ]
                                                     │
                                                     ▼
                                              [ Service Layer ]
                                             ┌───────┴───────┐
                                             ▼               ▼
                                    [ Cloudinary SDK ]  [ Repository ]
                                                             │
                                                             ▼
                                                        [ MongoDB ]
```

1. **Routes Layer (`resume.routes.js`)**: Defines REST endpoints and wires middleware (`authenticate`, `handleResumeUpload`, `validateResumeFile`).
2. **Validation Layer (`resume.validation.js`)**: Enforces PDF file restriction, 5MB size limit, content magic-bytes check (`%PDF-`), and parameter sanitization.
3. **Controller Layer (`resume.controller.js`)**: Extracts request params, delegates to Service, formats output with `ApiResponse`, and handles HTTP status codes.
4. **Service Layer (`resume.service.js`)**: Encapsulates business logic: checks active resumes, handles Cloudinary raw file replacement/deletions, enforces candidate ownership security, and syncs candidate Profile document.
5. **Repository Layer (`resume.repository.js`)**: Encapsulates database operations (`create`, `findOne`, `findById`, `update`, `delete`, `updateMany`). Zero business logic.
6. **Model Layer (`resume.model.js`)**: Mongoose schema with partial unique index for single active resume, indexes for search, and extensible `aiAnalysis` subdocument.

---

## 📑 API Endpoints Specification

### 1. Upload or Replace Active Resume
- **Endpoint**: `POST /api/v1/profile/resume` (also `POST /api/v1/resumes`)
- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `resume`: PDF file binary stream (Max size: 5MB)
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Resume uploaded successfully",
    "data": {
      "_id": "67a213e4b78a9c0012e8f9a2",
      "user": "67a1fb20d4e9a20011c7e4a1",
      "originalName": "john_doe_resume.pdf",
      "publicId": "interviewiq/resumes/resume_1707110400000_a1b2c3d4",
      "url": "https://res.cloudinary.com/demo/raw/upload/v1707110400/interviewiq/resumes/resume_1707110400000_a1b2c3d4.pdf",
      "fileSize": 1572864,
      "mimeType": "application/pdf",
      "isActive": true,
      "parsingStatus": "pending",
      "aiAnalysis": {
        "overallScore": 0,
        "atsScore": 0,
        "summary": "",
        "skillsExtracted": [],
        "strengths": [],
        "improvements": [],
        "suggestedRoles": [],
        "analyzedAt": null
      },
      "uploadedAt": "2026-08-05T11:00:00.000Z",
      "createdAt": "2026-08-05T11:00:00.000Z",
      "updatedAt": "2026-08-05T11:00:00.000Z"
    }
  }
  ```

---

### 2. Get Active Resume
- **Endpoint**: `GET /api/v1/profile/resume` (also `GET /api/v1/resumes`)
- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Resume retrieved successfully",
    "data": {
      "_id": "67a213e4b78a9c0012e8f9a2",
      "user": "67a1fb20d4e9a20011c7e4a1",
      "originalName": "john_doe_resume.pdf",
      "publicId": "interviewiq/resumes/resume_1707110400000_a1b2c3d4",
      "url": "https://res.cloudinary.com/demo/raw/upload/v1707110400/interviewiq/resumes/resume_1707110400000_a1b2c3d4.pdf",
      "fileSize": 1572864,
      "mimeType": "application/pdf",
      "isActive": true,
      "parsingStatus": "pending"
    }
  }
  ```

---

### 3. Replace Resume / Update Metadata
- **Endpoint**: `PUT /api/v1/profile/resume`
- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Payload**:
  - Multipart file attachment (`resume` field) to replace resume file OR JSON `{ "originalName": "New_CV.pdf" }` to update metadata.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Resume document replaced successfully",
    "data": { ...resumeObject }
  }
  ```

---

### 4. Delete Active Resume
- **Endpoint**: `DELETE /api/v1/profile/resume`
- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Resume deleted successfully",
    "data": {
      "message": "Resume deleted successfully from storage and database",
      "deletedResumeId": "67a213e4b78a9c0012e8f9a2"
    }
  }
  ```

---

### 5. Get Upload History
- **Endpoint**: `GET /api/v1/profile/resume/history`
- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Resume upload history retrieved successfully",
    "data": [ { ...activeResume }, { ...historicalResume } ]
  }
  ```

---

## 🛑 Standardized Error Responses

### `400 Bad Request` (Validation / File Restriction Error)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid file format. Only PDF documents are allowed.",
  "errors": [
    {
      "field": "resume",
      "message": "Invalid MIME type 'image/png'. Allowed MIME type: application/pdf"
    }
  ]
}
```

### `401 Unauthorized` (Authentication Required)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Access denied. No authentication token provided.",
  "errors": []
}
```

### `403 Forbidden` (Ownership Violation)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to access this resume",
  "errors": []
}
```

### `404 Not Found` (Resource Missing)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "No active resume found for this user. Please upload a resume.",
  "errors": []
}
```

---

## 🚀 Future Scalability & AI Integration Architecture

1. **Async AI Resume Parsing & Vector Embeddings**:
   - `parsingStatus` (`pending` → `processing` → `completed` → `failed`) enables asynchronous queue workers (RabbitMQ / BullMQ) to consume resumes and parse text via LLMs (Gemini / OpenAI).
   - `parsedText` is marked `select: false` so heavy raw text is not sent in default API payloads.

2. **Database Engine Partial Indexing**:
   - Partial unique index `{ user: 1, isActive: 1 }` guarantees atomic single-active resume enforcement at database level.

3. **Storage Abstraction**:
   - `uploadRawToCloudinary` and `deleteRawFromCloudinary` decouple file storage from domain logic, making it easy to swap or augment with S3/GCS.
