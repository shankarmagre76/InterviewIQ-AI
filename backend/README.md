# InterviewIQ AI - Backend API Foundation

A production-ready Node.js and Express.js backend infrastructure for **InterviewIQ AI**, an intelligent AI-powered interview preparation platform. Built following clean architecture, MVC patterns, modular routing, centralized error handling, and security best practices.

---

## 🚀 Project Overview

InterviewIQ AI Backend provides the foundational server infrastructure to support:
- AI-driven interview question generation & response evaluation
- User authentication & role-based access control
- Media asset uploads & resume parsing pipeline
- Email notifications & interview analytics tracking

This base repository initializes all security, logging, routing, error handling, database connection, and utility modules without hardcoded dependencies.

---

## ✨ Features

- **Modular MVC Architecture:** Clean separation of concerns across controllers, models, routes, middleware, and services.
- **ES Modules Support:** Native modern `import`/`export` syntax using `"type": "module"`.
- **Database Connection:** Asynchronous Mongoose connection setup targeting MongoDB with graceful shutdown handlers.
- **Security Hardened:** Powered by `helmet`, strict `cors` white-listing, and input sanitization helpers.
- **Performance Optimized:** Includes `compression` for payload optimization and streaming JSON parsing.
- **Centralized Error Handling:** Custom `ApiError` class and global error handling middleware catching async exceptions, JWT errors, and Mongoose Cast/Duplicate key errors.
- **Standardized API Responses:** `ApiResponse` class guaranteeing consistent response envelopes across all endpoints.
- **Logger Utility:** Structured colorful console logging with ISO timestamps.
- **Cloud & Utility Integration:** Pre-configured placeholders for Cloudinary file uploads and Nodemailer email delivery.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/) (v4.21+)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Security:** `helmet`, `cors`, `bcryptjs`, `jsonwebtoken`
- **Utilities:** `dotenv`, `morgan`, `cookie-parser`, `compression`, `express-validator`, `multer`, `cloudinary`, `nodemailer`, `uuid`
- **Dev Tooling:** `nodemon`

---

## 📁 Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js             # MongoDB connection setup
│   │   ├── cloudinary.js     # Cloudinary configuration
│   │   └── mail.js           # Nodemailer transport configuration
│   ├── controllers/
│   │   └── health.controller.js # Health check & status endpoints
│   ├── models/               # Mongoose schema definitions (placeholder)
│   ├── routes/
│   │   ├── index.js          # Master route aggregator
│   │   └── health.routes.js  # System status routes
│   ├── middleware/
│   │   ├── error.middleware.js   # Centralized error handler
│   │   ├── async.middleware.js   # Promise rejection wrapper
│   │   ├── notFound.middleware.js# 404 handler
│   │   ├── auth.middleware.js    # JWT authentication guard
│   │   └── role.middleware.js    # Role-based authorization
│   ├── services/             # Business logic & AI service layers
│   ├── validations/          # Express-validator schema rules
│   ├── utils/
│   │   ├── ApiResponse.js    # Standard JSON response builder
│   │   ├── ApiError.js       # Operational error class
│   │   ├── logger.js         # Console logger with timestamps
│   │   ├── jwt.js            # Access & Refresh token utility
│   │   └── password.js       # Bcrypt hash/compare helper
│   ├── constants/            # Global enums and HTTP codes
│   ├── helpers/              # Reusable helper functions
│   ├── docs/                 # API Specification docs
│   ├── app.js                # Express app configuration
│   └── server.js             # Server listener & process signals
├── uploads/                  # Local media uploads storage
├── package.json
├── .env.example              # Sample environment variables
├── .env                      # Local environment file
├── .gitignore
└── README.md
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/interviewiq_db
JWT_SECRET=your_super_secret_jwt_access_key
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_super_secret_jwt_refresh_key
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_user@example.com
EMAIL_PASS=your_email_app_password
```

---

## ⚡ Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   ```

---

## 🚦 Running the Project

### Development Mode (with Nodemon hot-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Linting Check:
```bash
npm run lint
```

---

## 🌐 Baseline API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Root Welcome Message | Public |
| `GET` | `/api` | Base API Index Directory | Public |
| `GET` | `/api/health` | System Health Check | Public |
| `GET` | `/api/version` | API Version Metrics | Public |

### Health Check Sample Response (`GET /api/health`)
```json
{
  "success": true,
  "message": "InterviewIQ AI Backend Running",
  "status": "OK",
  "timestamp": "2026-07-22T01:30:00.000Z"
}
```
