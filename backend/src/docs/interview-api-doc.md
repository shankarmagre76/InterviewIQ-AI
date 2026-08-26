# InterviewIQ AI - AI Mock Interview API Documentation (Phase 7)

Complete technical documentation for the **AI Mock Interview Module** of **InterviewIQ AI**, built with Node.js, Express.js, MongoDB, Mongoose, Google Gemini AI, and Repository-Service-Controller Architecture.

---

## 1. Folder & Module Architecture

```
backend/src/
├── interview/
│   ├── interview.model.js               # Interview Mongoose Schema (Enums, validation, indexes, voice settings)
│   ├── interviewQuestion.model.js       # InterviewQuestion Schema (Question text, expected answer, audio subdocument)
│   ├── interviewResult.model.js         # InterviewResult Schema (Composite scores, strengths, weaknesses, summary)
│   ├── interview.repository.js          # Pure DB access layer for Interview entity
│   ├── interviewQuestion.repository.js  # Pure DB access layer for InterviewQuestion entity
│   ├── interviewResult.repository.js    # Pure DB access layer for InterviewResult entity
│   ├── interview.service.js             # Core Service Layer orchestrating sessions, answers, and progress
│   ├── aiInterview.service.js           # Gemini AI Question Generation service with exponential backoff retries
│   ├── evaluation.service.js            # Gemini AI Answer Evaluation engine scoring 6 core dimensions
│   ├── interviewFlow.service.js         # State machine, time limit tracking, idempotency, and session recovery
│   ├── interview.controller.js          # HTTP Controller Layer handling Express requests/responses
│   ├── interview.routes.js              # Express REST router endpoints (JWT protected)
│   ├── interview.validation.js          # express-validator middleware for input payloads and ObjectIds
│   ├── questionGeneration.prompt.js     # Versioned (v1.0.0) Gemini Question Generation prompt template
│   ├── answerEvaluation.prompt.js       # Versioned (v1.0.0) Gemini Answer Evaluation prompt template (6 dimensions)
│   ├── interview.prompt.js              # Unified prompt exports index
│   ├── interviewSchema.test.js          # Schema validation test suite
│   ├── interviewPrompts.test.js         # Prompt engineering test suite
│   ├── aiInterviewService.test.js       # Question generation test suite
│   ├── evaluationService.test.js        # Answer evaluation test suite
│   ├── interviewRepositories.test.js    # Repository layer test suite
│   ├── interviewService.test.js         # Service layer test suite
│   ├── interviewController.test.js      # Controller layer test suite
│   ├── interviewFlow.test.js            # Flow management test suite
│   └── interviewRoutes.test.js          # REST API router test suite
├── models/                              # Re-export bridge files (Interview.js, InterviewQuestion.js, InterviewResult.js)
├── repositories/                        # Re-export bridge files for repository layer
├── services/                            # Re-export bridge files for service layer
├── controllers/                         # Re-export bridge files for controller layer
└── routes/
    └── index.js                         # Main Express API Router mounting /api/v1/interviews
```

---

## 2. Authentication & Headers

All endpoints are protected by JWT Bearer token authentication.

```http
Authorization: Bearer <YOUR_JWT_ACCESS_TOKEN>
Content-Type: application/json
```

---

## 3. API Endpoints Reference

### 3.1 Start New Interview Session
- **HTTP Method**: `POST`
- **Route**: `/api/v1/interviews/start` (also `/api/v1/interviews`)
- **Access**: Private (JWT Protected)

#### cURL Request Example:
```bash
curl -X POST https://api.interviewiq.ai/api/v1/interviews/start \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Full Stack Engineer",
    "interviewType": "Technical",
    "difficulty": "Intermediate",
    "totalQuestions": 5,
    "estimatedDuration": 30,
    "mode": "Text"
  }'
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Interview session started successfully",
  "data": {
    "interview": {
      "_id": "67a301b2c4e9a20011f8e9a1",
      "user": "67a1fb20d4e9a20011c7e4a1",
      "role": "Full Stack Engineer",
      "company": null,
      "interviewType": "Technical",
      "difficulty": "Intermediate",
      "status": "Pending",
      "totalQuestions": 5,
      "completedQuestions": 0,
      "estimatedDuration": 30,
      "mode": "Text",
      "voiceSettings": {
        "language": "en-US",
        "voiceId": "default",
        "speechRate": 1.0,
        "audioQuality": "standard"
      },
      "startedAt": null,
      "completedAt": null,
      "createdAt": "2026-08-07T23:40:00.000Z",
      "updatedAt": "2026-08-07T23:40:00.000Z"
    },
    "questions": [
      {
        "_id": "67a301b2c4e9a20011f8e9a2",
        "interview": "67a301b2c4e9a20011f8e9a1",
        "question": "What are the core architectural principles you consider when designing scalable Node.js microservices?",
        "expectedAnswer": "Candidate should mention modularity, asynchronous event loops, database indexing, caching strategies, and circuit breakers.",
        "score": 0,
        "sequenceNumber": 1,
        "answer": "",
        "aiFeedback": {},
        "audioResponse": {},
        "createdAt": "2026-08-07T23:40:00.100Z"
      }
    ]
  }
}
```

---

### 3.2 Submit Answer for Evaluation
- **HTTP Method**: `POST`
- **Route**: `/api/v1/interviews/:id/answers` (also `/api/v1/interviews/:id/questions/:questionId/answer`)
- **Access**: Private (JWT Protected)

#### cURL Request Example:
```bash
curl -X POST https://api.interviewiq.ai/api/v1/interviews/67a301b2c4e9a20011f8e9a1/answers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "67a301b2c4e9a20011f8e9a2",
    "answer": "I design microservices by decoupling domains, using event-driven communication via RabbitMQ or Kafka, implementing Redis caching, and indexing MongoDB queries."
  }'
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Answer submitted and evaluated successfully",
  "data": {
    "question": {
      "_id": "67a301b2c4e9a20011f8e9a2",
      "interview": "67a301b2c4e9a20011f8e9a1",
      "question": "What are the core architectural principles you consider when designing scalable Node.js microservices?",
      "answer": "I design microservices by decoupling domains...",
      "score": 88,
      "aiFeedback": {
        "comments": "Candidate provided a clear and structured answer highlighting domain decoupling and message queues.",
        "keyPointsCovered": [
          "Decoupled domain architecture",
          "Event-driven messaging (Kafka/RabbitMQ)",
          "Redis caching strategies"
        ],
        "keyPointsMissed": [
          "Circuit breaker pattern and fault tolerance"
        ],
        "clarityScore": 90,
        "relevanceScore": 92
      }
    },
    "evaluation": {
      "score": 88,
      "technicalScore": 90,
      "communicationScore": 88,
      "confidenceScore": 86,
      "completenessScore": 85,
      "problemSolvingScore": 88,
      "practicalKnowledgeScore": 90,
      "strengths": ["Clear architectural vision", "Mentioned production messaging queues"],
      "weaknesses": ["Omitted circuit breakers"],
      "suggestions": ["Elaborate on resilience patterns like Hystrix or resilience4j."],
      "overallFeedback": "Strong technical delivery."
    },
    "completedQuestions": 1,
    "totalQuestions": 5,
    "isCompleted": false,
    "result": null
  }
}
```

---

### 3.3 Get Candidate Interview History
- **HTTP Method**: `GET`
- **Route**: `/api/v1/interviews`
- **Access**: Private (JWT Protected)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interview history retrieved successfully",
  "data": [
    {
      "_id": "67a301b2c4e9a20011f8e9a1",
      "role": "Full Stack Engineer",
      "interviewType": "Technical",
      "difficulty": "Intermediate",
      "status": "Completed",
      "totalQuestions": 5,
      "completedQuestions": 5,
      "createdAt": "2026-08-07T23:40:00.000Z"
    }
  ]
}
```

---

### 3.4 Get Full Interview Details
- **HTTP Method**: `GET`
- **Route**: `/api/v1/interviews/:id`
- **Access**: Private (JWT Protected)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interview details retrieved successfully",
  "data": {
    "interview": {
      "_id": "67a301b2c4e9a20011f8e9a1",
      "role": "Full Stack Engineer",
      "status": "Completed"
    },
    "questions": [
      {
        "_id": "67a301b2c4e9a20011f8e9a2",
        "question": "What are the core architectural principles...",
        "answer": "I design microservices...",
        "score": 88
      }
    ],
    "result": {
      "_id": "67a305f8c4e9a20011f8e9f9",
      "interview": "67a301b2c4e9a20011f8e9a1",
      "overallScore": 86,
      "technicalScore": 88,
      "communicationScore": 85,
      "hrScore": 84,
      "strengths": ["Decoupled architecture expertise", "Clear articulation"],
      "weaknesses": ["Omitted circuit breakers"],
      "recommendations": ["Review fault tolerance pattern implementations."],
      "summary": "Candidate completed a Intermediate level Technical interview for Full Stack Engineer with 86/100."
    }
  }
}
```

---

### 3.5 Get Final Evaluation Result Report
- **HTTP Method**: `GET`
- **Route**: `/api/v1/interviews/:id/result`
- **Access**: Private (JWT Protected)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interview evaluation result retrieved successfully",
  "data": {
    "_id": "67a305f8c4e9a20011f8e9f9",
    "interview": "67a301b2c4e9a20011f8e9a1",
    "overallScore": 86,
    "technicalScore": 88,
    "communicationScore": 85,
    "hrScore": 84,
    "strengths": ["Decoupled architecture expertise", "Clear articulation"],
    "weaknesses": ["Omitted circuit breakers"],
    "recommendations": ["Review fault tolerance pattern implementations."],
    "summary": "Candidate completed a Intermediate level Technical interview for Full Stack Engineer with 86/100."
  }
}
```

---

### 3.6 Resume Interrupted Session
- **HTTP Method**: `POST`
- **Route**: `/api/v1/interviews/:id/resume`
- **Access**: Private (JWT Protected)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interview session resumed successfully",
  "data": {
    "isExpired": false,
    "interview": {
      "_id": "67a301b2c4e9a20011f8e9a1",
      "status": "In Progress"
    },
    "flowStatus": {
      "completedCount": 2,
      "totalCount": 5,
      "progressPercentage": 40
    },
    "currentQuestion": {
      "_id": "67a301b2c4e9a20011f8e9a4",
      "sequenceNumber": 3,
      "question": "Explain database indexing strategies in MongoDB."
    }
  }
}
```

---

### 3.7 Delete / Cancel Interview Session
- **HTTP Method**: `DELETE`
- **Route**: `/api/v1/interviews/:id`
- **Access**: Private (JWT Protected)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interview session concluded successfully",
  "data": {
    "interview": {
      "_id": "67a301b2c4e9a20011f8e9a1",
      "status": "Cancelled",
      "completedAt": "2026-08-07T23:45:00.000Z"
    },
    "result": null
  }
}
```

---

## 4. Testing Scenarios & Error Payloads

### 4.1 Scenario 1: No JWT Provided (`401 Unauthorized`)
- **Trigger**: Request missing `Authorization` header.
- **Expected Response**:
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Access denied. No authentication token provided.",
  "errors": null
}
```

---

### 4.2 Scenario 2: Invalid or Expired JWT (`401 Unauthorized`)
- **Trigger**: Request sending invalid token signature.
- **Expected Response**:
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid or expired authentication token.",
  "errors": null
}
```

---

### 4.3 Scenario 3: Interview Session Not Found (`404 Not Found`)
- **Trigger**: Non-existent `interviewId` provided in URL parameter.
- **Expected Response**:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Interview session 67a999999999999999999999 not found",
  "errors": null
}
```

---

### 4.4 Scenario 4: Duplicate Answer Submission (Idempotent Handling)
- **Trigger**: Candidate re-submits answer for a question already containing a response.
- **Behavior & Output**: System updates answer text and score without double-incrementing `completedQuestions` count.
- **Expected Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Answer submitted and evaluated successfully",
  "data": {
    "isDuplicateSubmission": true,
    "completedQuestions": 2,
    "totalQuestions": 5
  }
}
```

---

### 4.5 Scenario 5: Gemini AI Service Rate Limit / Quota Failure
- **Trigger**: Live Gemini API quota exhausted or key unconfigured.
- **Behavior & Output**: System logs warning and seamlessly triggers deterministic fallback question and evaluation generators.
- **Expected Output**: Returns simulated structured questions and evaluation metrics without throwing HTTP 500 crashes.

---

### 4.6 Scenario 6: Database Connection Failure (`500 Internal Server Error`)
- **Trigger**: MongoDB timeout or buffering error.
- **Expected Response**:
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Database timeout: Mongoose connection buffer timed out after 10000ms.",
  "errors": null
}
```

---

### 4.7 Scenario 7: Invalid Input Payload Validation (`400 Bad Request`)
- **Trigger**: Request body sending invalid `difficulty` enum (`"SuperHard"`).
- **Expected Response**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Difficulty level must be one of: Beginner, Intermediate, Advanced",
  "errors": [
    {
      "field": "difficulty",
      "message": "Difficulty level must be one of: Beginner, Intermediate, Advanced"
    }
  ]
}
```
