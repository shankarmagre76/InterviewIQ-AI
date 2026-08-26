# InterviewIQ AI - Resume Analysis API Documentation (Phase 5)

Complete technical documentation for the **Resume Analysis & AI Evaluation Module** of **InterviewIQ AI**, built with Node.js, Express.js, MongoDB, Mongoose, Google Gemini AI, and Repository-Service-Controller architecture.

---

## 1. Folder & File Structure

```
backend/src/
├── resume/
│   ├── resumeAnalysis.model.js        # Mongoose Schema (ATS scores, section feedback, token usage, indexes)
│   ├── resumeAnalysis.repository.js   # Pure database access layer (Mongoose CRUD operations)
│   ├── resumeAnalysis.service.js      # Business logic layer (PDF text extraction, AI call, re-analysis history)
│   ├── resumeAnalysis.controller.js   # HTTP transport layer (Response formatting & status codes)
│   ├── resumeAnalysis.routes.js       # Express router endpoints (JWT protected)
│   ├── resumeAnalysis.validation.js   # Express-validator input validation middleware
│   ├── resumeAnalysis.prompt.js       # Versioned (v1.0.0) AI system & user prompt builder
│   ├── ai.service.js                  # Gemini AI SDK provider & exponential backoff retries
│   ├── pdfParser.service.js           # pdf-parse text extraction & scanned PDF detector
│   ├── aiResponseParser.service.js    # Markdown fence stripping & JSON normalizer
│   ├── resumeAnalysis.test.js         # Integration test suite
│   ├── ai.test.js                     # AI service test runner
│   ├── pdfParser.test.js              # PDF parser test runner
│   └── resumeAnalysisApi.test.js      # API error & security test runner
├── models/
│   ├── ResumeAnalysis.js              # Bridge export for ResumeAnalysis model
│   └── resumeAnalysis.model.js        # Bridge export alias
├── repositories/
│   └── resumeAnalysis.repository.js   # Bridge export for ResumeAnalysisRepository
├── services/
│   ├── resumeAnalysis.service.js      # Bridge export for ResumeAnalysisService
│   ├── ai.service.js                  # Bridge export for AiService
│   ├── pdfParser.service.js           # Bridge export for PdfParserService
│   └── aiResponseParser.service.js    # Bridge export for AiResponseParserService
├── controllers/
│   └── resumeAnalysis.controller.js   # Bridge export for ResumeAnalysisController
├── validations/
│   └── resumeAnalysis.validation.js   # Bridge export for ResumeAnalysis Validation
└── routes/
    └── resumeAnalysis.routes.js       # Bridge export for ResumeAnalysis Router
```

---

## 2. API Endpoints Reference

### 2.1 Postman Authorization Header
All endpoints require a valid JWT bearer token obtained from POST `/api/v1/auth/login`.

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

### 2.2 Endpoint Details & Examples

#### Endpoint 1: Initiate AI Resume Analysis
- **Route**: `POST /api/v1/profile/resume/analyze` (also `/api/v1/resumes/analyze`)
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`

##### Postman Request Example (cURL):
```bash
curl -X POST https://api.interviewiq.ai/api/v1/profile/resume/analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Backend Engineer",
    "experienceLevel": "Senior-Level",
    "provider": "Gemini"
  }'
```

##### Success Response (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resume analyzed successfully by AI",
  "data": {
    "id": "67a213e4b78a9c0012e8f9a2",
    "user": "67a1fb20d4e9a20011c7e4a1",
    "resume": "67a201b2a9d8120013f9c1b4",
    "atsScore": 85,
    "summary": "Strong technical profile with extensive Node.js and database architecture experience. Clear formatting and section hierarchy.",
    "strengths": [
      "Demonstrates practical experience with Node.js, Express, and MongoDB",
      "Clean bullet points highlighting backend system design",
      "Strong section hierarchy and typography"
    ],
    "weaknesses": [
      "Lacks quantifiable metrics and percentage impact data",
      "Missing modern cloud deployment and CI/CD keywords"
    ],
    "missingSkills": ["Docker", "AWS", "CI/CD Pipelines", "TypeScript"],
    "recommendedSkills": ["Docker", "AWS", "Jest", "Redis"],
    "grammarFeedback": [
      "Use strong active verbs at the start of bullet points (e.g. 'Engineered', 'Architected')"
    ],
    "formattingFeedback": [
      "Ensure consistent date formatting across all experience entries"
    ],
    "keywordFeedback": [
      "Increase density of REST API and database optimization terms"
    ],
    "sectionFeedback": {
      "summary": { "score": 85, "feedback": ["Concise summary statement"], "suggestions": ["Include target career objective"] },
      "experience": { "score": 80, "feedback": ["Solid tech stack mentioned"], "suggestions": ["Add percentage achievements"] },
      "education": { "score": 90, "feedback": ["Degree clearly listed"], "suggestions": [] },
      "skills": { "score": 84, "feedback": ["Well-grouped skills"], "suggestions": ["Group by category"] },
      "projects": { "score": 82, "feedback": ["Good project descriptions"], "suggestions": ["Add GitHub links"] }
    },
    "recommendations": [
      "Quantify achievements in work experience using percentage metrics",
      "Add high-demand DevOps keywords such as Docker and AWS",
      "Include active GitHub repository links"
    ],
    "aiProvider": "Gemini",
    "aiModel": "gemini-2.5-flash",
    "promptVersion": "1.0.0",
    "isLatest": true,
    "analyzedAt": "2026-08-05T07:37:58.200Z",
    "createdAt": "2026-08-05T07:37:58.200Z",
    "updatedAt": "2026-08-05T07:37:58.200Z"
  }
}
```

---

#### Endpoint 2: Get Latest Active Resume Analysis
- **Route**: `GET /api/v1/profile/resume/analysis` (also `/api/v1/profile/resume/analysis/latest`)
- **Headers**: `Authorization: Bearer <token>`

##### Postman Request Example (cURL):
```bash
curl -X GET https://api.interviewiq.ai/api/v1/profile/resume/analysis \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Latest resume analysis report retrieved successfully",
  "data": {
    "id": "67a213e4b78a9c0012e8f9a2",
    "user": "67a1fb20d4e9a20011c7e4a1",
    "atsScore": 85,
    "summary": "Strong technical profile...",
    "isLatest": true,
    "analyzedAt": "2026-08-05T07:37:58.200Z"
  }
}
```

---

#### Endpoint 3: Get Complete Analysis History
- **Route**: `GET /api/v1/profile/resume/analysis/history`
- **Headers**: `Authorization: Bearer <token>`

##### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resume analysis history retrieved successfully",
  "data": [
    {
      "id": "67a213e4b78a9c0012e8f9a2",
      "atsScore": 85,
      "aiProvider": "Gemini",
      "isLatest": true,
      "createdAt": "2026-08-05T07:37:58.200Z"
    },
    {
      "id": "67a1ff1a9b2c8a0011e4f3a1",
      "atsScore": 72,
      "aiProvider": "Gemini",
      "isLatest": false,
      "createdAt": "2026-08-04T14:20:00.000Z"
    }
  ]
}
```

---

## 3. Error Scenarios & Postman Test Payloads

### Scenario 1: Invalid / Missing JWT Token (`401 Unauthorized`)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Access denied. No authentication token provided.",
  "errors": null
}
```

### Scenario 2: Candidate Has No Uploaded Resume (`404 Not Found`)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "No active resume document found for analysis. Please upload a PDF resume first.",
  "errors": null
}
```

### Scenario 3: Scanned Image or Empty PDF Detected (`400 Bad Request`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Scanned image or unreadable PDF detected. No extractable text found. Please upload a text-based PDF document.",
  "errors": null
}
```

### Scenario 4: Gemini API Rate Limit / Failure (`429` / `500 Internal Error`)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Gemini AI service unavailable after 3 attempts: Rate limit exceeded (429).",
  "errors": null
}
```

### Scenario 5: Malformed AI Output / JSON Parse Failure (`500 Internal Error`)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Failed to parse AI provider response. The AI output is not valid JSON format.",
  "errors": null
}
```

### Scenario 6: Database Connection Failure (`500 Internal Error`)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Database timeout: Mongoose connection buffer timed out after 10000ms.",
  "errors": null
}
```

---

## 4. Test Suite Execution Verification

Run the automated test runner locally:
```powershell
node src/resume/resumeAnalysisApi.test.js
```

### Verified Output:
```
=== INTERVIEWIQ RESUME ANALYSIS API & SECURITY SUITE ===

[PASS] Test 1: Invalid JWT (401)
       Status: 401 | Message: Access denied. No authentication token provided.

[PASS] Test 2: No Resume Found (404)
       Status: 404 | Message: No active resume document found for analysis. Please upload a PDF resume first.

[PASS] Test 3: Empty / Scanned Resume (400)
       Status: 400 | Message: Scanned image or unreadable PDF detected. No extractable text found.

[PASS] Test 4: Gemini API Failure / Rate Limit (429 / 500)
       Status: 500 | Message: Gemini AI service unavailable after 3 attempts: Rate limit exceeded (429).

[PASS] Test 5: Malformed AI Response (500)
       Status: 500 | Message: Failed to parse AI provider response. The AI output is not valid JSON format.

[PASS] Test 6: Database Failure (500)
       Status: 500 | Message: Database timeout: Mongoose connection buffer timed out after 10000ms.

[PASS] Test 7: Success Case - AI Analysis Execution (201 Created)
       Status: 201 | Message: Resume analyzed successfully by AI
       ATS Score: 85 | Provider: Gemini | Version: 1.0.0

=== ALL RESUME ANALYSIS API TESTS COMPLETED ===
```
