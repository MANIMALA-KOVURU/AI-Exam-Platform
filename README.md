# ExamAI — Intelligent Multilingual AI-Proctored Examination Platform

This monorepo contains the initial production-style foundation for an AI-powered exam platform. It includes a FastAPI backend, a Next.js frontend, multilingual shell support, PWA install support, and a database model layer matching the requested architecture.

## Features

- Student, examiner, and admin role foundation
- JWT auth and protected API routes
- SQLAlchemy models for users, exams, questions, sessions, and proctoring
- WebSocket heartbeat endpoint for proctoring signals
- Installable PWA shell with offline service worker
- Six-language UI foundation (English, Telugu, Hindi, Tamil, Malayalam, Kannada)
- Docker Compose and deployment config templates

## Project structure

- backend: FastAPI API, SQLAlchemy models, auth, and health endpoints
- frontend: Next.js app shell, landing page, dashboard routes, and PWA assets
- docker-compose.yml: local database and runtime services
- render.yaml: Render deployment configuration
- vercel.json: Vercel configuration

## Local development

1. Copy `.env.example` to `.env` in the project root.
2. Start PostgreSQL:
   docker compose up db -d
3. Backend:
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
4. Frontend:
   cd frontend
   npm install
   npm run dev
5. Visit:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API docs: http://localhost:8000/docs

## Environment variables

The project root `.env.example` includes backend and frontend values such as:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- OPENAI_API_KEY
- CORS_ORIGINS
- FRONTEND_URL
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_WS_URL

Never commit `.env` files or production secrets.

## Testing

Backend auth flow test:

cd backend
python -m pytest tests/test_auth_flow.py -q

## Deployment notes

- Deploy the `frontend` directory to Vercel and set `NEXT_PUBLIC_API_URL` to the Render API origin, for example `https://aiexamplatform-api.onrender.com`. The variable is embedded at build time, so redeploy after changing it.
- Deploy the root `render.yaml` blueprint to Render. Replace both `https://your-app.vercel.app` values with the Vercel production domain before creating the backend service. The blueprint creates a paid Render web service, persistent upload disk, and PostgreSQL database, then runs Alembic migrations before deploy.
- Render generates `JWT_SECRET`, `JWT_REFRESH_SECRET`, and the initial admin password. Retrieve `INITIAL_ADMIN_PASSWORD` from Render and sign in with `INITIAL_ADMIN_EMAIL` for the initial administrator account. Public registration supports student and examiner roles only; provision additional administrators through a controlled operator process because the current admin user page has no account-creation API.
- The Render upload disk preserves question attachments. Keep the web service and database in compatible Render regions, and enable backups for the PostgreSQL database in Render.
- For preview domains, add each permitted origin to `CORS_ORIGINS` as a comma-separated exact origin. `FRONTEND_URL` must also appear in that list. Use HTTPS origins in production.
- `NEXT_PUBLIC_WS_URL` is optional unless a frontend feature explicitly opens the proctoring websocket; when needed, set it to the Render API origin with `https://` changed to `wss://`.

## Supported languages

English, Telugu, Hindi, Tamil, Malayalam, and Kannada.
