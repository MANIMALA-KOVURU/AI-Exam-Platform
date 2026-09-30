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

- Frontend deploys to Vercel with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` configured.
- Backend deploys to Render using `render.yaml` and PostgreSQL managed service.
- The app is designed to route through HTTPS and expose health checks for production readiness.

## Supported languages

English, Telugu, Hindi, Tamil, Malayalam, and Kannada.

## Global language preference

The locale provider persists the selected language in `localStorage` for anonymous use and synchronizes it to the authenticated user's `preferred_language`. UI labels are translated from the shared frontend phrase catalog; examiner-authored questions, options, and result content are not translated.

## PWA and notifications

- Production builds generate `/manifest.json` and `/sw.js`; the app opens in standalone mode and uses the SVG icons under `frontend/public/icons`.
- Static JavaScript, CSS, and font assets may be cached. API calls and page navigations are network-only; failed navigations use the localized `/offline` page. Exam answers, candidate data, uploads, and proctoring media are not cached.
- Push prompts are opt-in and explain their purpose before requesting permission. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the frontend deployment to enable browser subscription. Apply database migrations with `cd backend && alembic upgrade head` to create the authenticated subscription store.
- The service worker can display push payloads and open same-origin links. An event publisher using the deployment's VAPID private key is still required to deliver exam reminders, results, or proctoring alerts; do not expose that private key to the frontend.

Build the frontend with `cd frontend && npm run build`. Push subscriptions require HTTPS in deployed environments (localhost is accepted by modern browsers for development).
