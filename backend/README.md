# InterviewIQ AI

InterviewIQ AI is a production-ready AI-powered interview preparation platform designed to help students, freshers, and professionals prepare for technical and HR interviews. The platform provides secure user authentication, comprehensive profile management, resume management, AI-driven interview practice, coding assessments, performance analytics, and recruiter tools.

The backend is built using Node.js, Express.js, and MongoDB following enterprise-level architecture with a focus on scalability, security, and maintainability.


## 📖 Overview

InterviewIQ AI is an intelligent interview preparation platform that simulates real interview experiences using Artificial Intelligence. It enables users to build professional profiles, upload resumes, participate in mock interviews, analyze interview performance, and receive personalized feedback for continuous improvement.

The project follows a modular and scalable backend architecture based on the MVC design pattern, making it easy to maintain and extend with new features.

The primary objective of InterviewIQ AI is to bridge the gap between academic learning and real-world interview expectations by providing an interactive, AI-assisted learning environment.


## ✨ Features

### 🔐 Authentication & Authorization
- User Registration
- Secure Login & Logout
- JWT Authentication
- Refresh Token Authentication
- Password Hashing using bcrypt
- Forgot Password
- Reset Password
- Email Verification
- Role-Based Access Control (RBAC)

### 👤 Profile Management
- Personal Information
- Profile Image Upload
- Skills Management
- Education Management
- Experience Management
- Social Links
- Resume Upload
- Profile Completion Percentage

### 🛡️ Security
- JWT Protected APIs
- HTTP-Only Cookies
- Input Validation
- Centralized Error Handling
- Secure Password Storage
- Security Headers (Helmet)
- Request Logging
- CORS Protection

### 🚀 Upcoming Features
- AI Resume Analysis
- AI Mock Interview
- Coding Assessment
- AI Performance Evaluation
- Dashboard & Analytics
- Recruiter Portal
- Admin Panel


## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcryptjs

### Validation
- express-validator

### File Storage
- Cloudinary

### Email Service
- Nodemailer

### Security
- Helmet
- CORS
- Cookie Parser
- Compression

### Logging
- Morgan

### Development Tools
- Nodemon
- dotenv
- UUID


## 🔒 Security Features

InterviewIQ AI follows industry-standard security practices to ensure secure authentication, authorization, and data handling.

- JWT Access Token Authentication
- Refresh Token Mechanism
- HTTP-Only Secure Cookies
- Password Hashing with bcrypt
- Role-Based Access Control (RBAC)
- Centralized Error Handling
- Input Validation using express-validator
- Secure HTTP Headers with Helmet
- Cross-Origin Resource Sharing (CORS) Protection
- Request Logging with Morgan
- Environment Variable Configuration using dotenv
- Secure Password Reset Workflow
- Email Verification System
- Protection against Unauthorized Access
- Modular Authentication Middleware