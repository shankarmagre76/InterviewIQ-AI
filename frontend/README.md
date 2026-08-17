# InterviewIQ AI — Frontend Setup & Environment Guide

Modern AI Career SaaS Client Application for Technical Candidates & Recruiters.

## 🚀 Environment Configuration

The frontend uses Vite for bundling and environment variable management.

### Environment Variable Security Rules
1. **Prefix Rule**: Only variables starting with `VITE_` are exposed to the browser bundle via `import.meta.env`.
2. **Zero Secret Policy**: **NEVER** put backend credentials (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_PASS`) into frontend `.env` files.
3. **Ignored Files**: All `.env` and `.env.local` files containing actual values are ignored by `.gitignore`.

---

### Available Environment Variables

| Variable Name | Description | Default (Dev) | Default (Prod) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend Express API v1 Endpoint | `http://localhost:5000/api/v1` | `/api/v1` |
| `VITE_APP_NAME` | Public Application Brand Name | `InterviewIQ AI (Dev)` | `InterviewIQ AI` |
| `VITE_APP_ENV` | Application Environment | `development` | `production` |

---

### Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Adjust `VITE_API_BASE_URL` if your backend Express server runs on a non-default port.
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

### Production Build

To build the static bundle for production deployment:
```bash
npm run build
```
Vite will automatically load `.env.production` during the production build.
