# Task Manager Monorepo

## Project Overview
Task Manager is a production-ready full-stack assignment app with secure authentication and stage-based task workflow:
- `TODO`
- `IN_PROGRESS`
- `DONE`

It includes a premium SaaS-style frontend (dashboard, Kanban, list view, settings) and a secure TypeScript backend with Prisma + PostgreSQL.

## Live Links
- Frontend (Vercel): `https://your-frontend-url.vercel.app` _(placeholder)_
- Backend (Render): `https://task-manager-6aq1.onrender.com`

## Features
- Authentication:
  - Register
  - Login
  - Google OAuth login
  - Forgot password (email reset link)
  - Reset password with secure token
  - JWT session persistence (localStorage)
  - Protected routes and auth redirects
  - Logout flow
- Tasks:
  - Create, update, delete
  - Stage update endpoint for Kanban movement
  - Priority support (`LOW`, `MEDIUM`, `HIGH`)
  - Due dates and tags
  - Search, filtering, sorting
  - Paginated list view
- Dashboard:
  - Stats summary cards
  - Completion progress bar
  - Upcoming deadlines
  - Recent activity feed
- UX:
  - Mobile-first responsive layout
  - Dark/light mode toggle
  - Premium violet + white SaaS interface with high-contrast typography
  - Centered auth card layout for stable readability
  - Solid card surfaces with consistent borders/shadows
  - Skeleton loading states
  - Empty and error states
  - Toast notifications
  - Delete confirmation dialogs
  - Framer Motion transitions
  - Keyboard shortcut: `N` opens create-task modal on dashboard/task pages
  - OAuth callback flow with loading and error states

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, React Hot Toast, Framer Motion, Lucide React, @hello-pangea/dnd
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt, Passport.js (Google), express-session, Nodemailer (SMTP), Zod, Helmet, CORS, Express Rate Limit, Morgan

## Architecture
- `frontend/`
  - `pages/`: Login, Register, Dashboard, Kanban, List View, Settings, 404
  - `layouts/`: AuthLayout, AppLayout
  - `components/ui/`: design primitives + modal + toast
  - `components/tasks/`: task domain UI
  - `hooks/`: auth/theme/task/business hooks
  - `services/`: Axios API clients
- `backend/`
  - `config/`, `controllers/`, `middleware/`, `routes/`, `schemas/`, `utils/`
  - `prisma/schema.prisma`, `prisma/seed.ts`

## Technical Decisions
- REST API over GraphQL for faster assignment delivery and simpler debugging.
- Prisma + PostgreSQL for type-safe DB access and straightforward migrations.
- Zod validation on both frontend and backend for safer input handling.
- `useTasks` hook centralizes task querying/mutation and metadata refresh logic.
- Stage changes persisted through dedicated `PATCH /tasks/:id/stage` endpoint for Kanban compatibility.
- Auth pages use reusable `AuthCard`, `AuthToggle`, `FormInput`, `PasswordInput`, `GlassFeatureCard`, and `LogoMark` components to keep premium UI modular.
- Tailwind theme uses a violet + white palette (`#3323cc` brand) with green highlight CTA (`#16a34a`) and semantic tokens.
- Removed font CDN dependency from the global stylesheet to avoid runtime typography failures and improve rendering stability.

## Screenshots
Add screenshots here after deployment:
- `dashboard.png`
- `kanban.png`
- `list-view.png`
- `settings.png`

## Local Setup
### 1. Clone
```bash
git clone <your-repo-url>
cd task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed   # optional demo data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
### Backend (`backend/.env`)
```env
DATABASE_URL=
DB_SSL=true
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
CLIENT_URLS=
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="TaskFlow Pro <your-email@gmail.com>"
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
# Production example:
# VITE_API_BASE_URL=https://task-manager-6aq1.onrender.com/api
```

## API Documentation
Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/test-smtp`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/me` (protected)

### Health
- `GET /api/health`
  - Success:
    - `{ "success": true, "status": "ok", "message": "TaskFlow Pro API is running", "timestamp": "2026-06-01T12:00:00.000Z" }`
- `GET /api/health/db`
  - Success:
    - `{ "success": true, "status": "ok", "message": "Database connection is healthy", "timestamp": "2026-06-01T12:00:00.000Z", "database": "connected" }`
  - Failure:
    - `{ "success": false, "status": "error", "timestamp": "2026-06-01T12:00:00.000Z", "database": "disconnected", "message": "Database connectivity check failed", "error": "PrismaClientInitializationError" }`

### Tasks (all protected)
- `GET /tasks`
  - Query: `search`, `stage`, `priority`, `sortBy`, `sortOrder`, `page`, `limit`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/stage`
- `GET /tasks/stats/summary`
- `GET /tasks/activity/recent`

## Database Schema Summary
- `User`: profile + auth fields (`passwordHash`, provider, role)
  - Password reset fields: `resetPasswordTokenHash`, `resetPasswordExpires`
- `Task`: stage, priority, due date, tags, user relation
- `ActivityLog`: per-user task activity history

## Assumptions
- Single-session JWT auth is sufficient for assignment scope.
- Avatar upload/storage is out of scope (field supported as URL).
- Database is PostgreSQL locally and in production.

## Tradeoffs
- Activity feed stores textual action history for simplicity rather than event sourcing.
- Kanban cross-column drag persists stage changes, not within-column custom ordering.
- No global state library (Redux/Zustand) to keep architecture lightweight.

## Deployment Instructions
### Frontend (Vercel)
1. Import `frontend/` into Vercel.
2. Set env var exactly (Production + Preview) and redeploy:
   - `VITE_API_BASE_URL=https://task-manager-6aq1.onrender.com/api`
   - Important: the value must include `/api` and must not be localhost.
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render)
1. Create PostgreSQL instance.
2. Create Web Service for `backend/`.
3. Build command:
   - `npm install && npx prisma generate && npm run build`
4. Start command:
   - `npm run start`
5. Add env vars:
   - `DATABASE_URL`
   - `DB_SSL=true`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
   - `CLIENT_URL` (example: `https://your-frontend.vercel.app`)
   - `CLIENT_URLS` (optional comma-separated allowlist for preview URLs)
   - `BACKEND_URL` (`https://task-manager-6aq1.onrender.com`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` (`https://task-manager-6aq1.onrender.com/api/auth/google/callback`)
   - `SESSION_SECRET`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `SMTP_TEST_SECRET` (required only if you want to call `/api/auth/test-smtp` in production)
   - `NODE_ENV=production`
6. Run migrations in deploy shell or post-deploy command:
   - `npx prisma migrate deploy`
7. Required database URL format for Supabase:
   - `postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require`
   - Optional for transaction pooler (`:6543`): append `&pgbouncer=true`

## Google OAuth Setup
Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client ID:
- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `https://YOUR_FRONTEND_VERCEL_URL.vercel.app`
- Authorized redirect URIs:
  - `http://localhost:5000/api/auth/google/callback`
  - `https://task-manager-6aq1.onrender.com/api/auth/google/callback`

Important:
- Redirect URI must be backend URL, not frontend URL.
- URI must include `/api/auth/google/callback`.
- URI must exactly match the `redirect_uri` shown in Google error output.
- Do not add trailing slash.
- Do not use `/auth/google/callback` without `/api`.

Required backend envs:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

Expected backend values on Render:
```env
BACKEND_URL=https://task-manager-6aq1.onrender.com
GOOGLE_CALLBACK_URL=https://task-manager-6aq1.onrender.com/api/auth/google/callback
CLIENT_URL=https://YOUR_FRONTEND_VERCEL_URL.vercel.app
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Production Troubleshooting
### "Unable to reach backend. Please check deployment configuration."
1. Verify backend health is reachable:
   - `https://task-manager-6aq1.onrender.com/api/health`
   - `https://task-manager-6aq1.onrender.com/api/health/db`
2. Verify frontend env in Vercel:
   - `VITE_API_BASE_URL=https://task-manager-6aq1.onrender.com/api`
3. Redeploy frontend after env updates (Vite envs are baked at build time).
4. Verify backend CORS env:
   - `CLIENT_URL=https://YOUR_FRONTEND_VERCEL_URL.vercel.app`

### "Error 400: redirect_uri_mismatch"
1. Confirm Google authorized redirect URI includes:
   - `https://task-manager-6aq1.onrender.com/api/auth/google/callback`
2. Confirm backend env value matches exactly:
   - `GOOGLE_CALLBACK_URL=https://task-manager-6aq1.onrender.com/api/auth/google/callback`
3. Confirm backend is initiating OAuth from:
   - `GET https://task-manager-6aq1.onrender.com/api/auth/google`

## Forgot Password + SMTP Setup
How it works:
1. `POST /api/auth/forgot-password` always returns a generic success message.
2. If the user exists, backend creates a 32-byte reset token, stores only its SHA-256 hash, and expiry (15 minutes).
3. Reset email is sent with hash-router link: `CLIENT_URL/#/reset-password?token=<raw-token>`.
4. `POST /api/auth/reset-password` validates token hash + expiry, updates password, and clears token fields.

Security decisions:
- Token expires in 15 minutes.
- Only hashed token is stored in DB.
- Forgot-password route is rate-limited.
- API does not reveal whether an email exists.
- Used token is cleared after successful password reset.

SMTP envs:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Example (Gmail):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="TaskFlow Pro <your-email@gmail.com>"
SMTP_TEST_SECRET=replace_with_random_secret_for_prod_smtp_test_endpoint
```

For Gmail SMTP:
1. Enable Google 2-Step Verification.
2. Create an App Password under Google Account -> Security -> App Passwords.
3. Use the 16-character App Password as `SMTP_PASS` (no spaces).
4. Keep `SMTP_PORT=587` and `SMTP_SECURE=false`.
5. Use your full Gmail as `SMTP_USER`.

SMTP test endpoint:
- `POST /api/auth/test-smtp` with body `{ "email": "recipient@example.com" }`
- In non-production, the route is open for quick diagnostics.
- In production, pass header `x-test-secret: <SMTP_TEST_SECRET>`.

## QA Checklist
- Register + Login
- Google OAuth login + callback
- Forgot password email request
- Reset password with valid token
- Reuse/expired token failure handling
- Protected route redirects
- Task create/edit/delete
- Kanban drag and stage update
- Search/filter/sort
- Pagination in list view
- Dark/light mode toggle
- Refresh with persisted auth session
- Logout

