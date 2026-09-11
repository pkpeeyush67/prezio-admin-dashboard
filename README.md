# Prezio Admin Dashboard

A small full-stack assessment project built as a React single-page application with a Python FastAPI backend, SQLAlchemy, SQLite, and Docker Compose.

## Features

- Administrator registration and login
- Password hashing and 30-minute JWT sessions
- Protected dashboard and logout
- Total, active, inactive, and last-30-days customer KPIs
- Customer table with server-side search, status filtering, sorting, and pagination
- Responsive loading, error, and empty states
- FastAPI Swagger documentation
- Backend and frontend tests

## Architecture

```text
React SPA :3000 → REST API → FastAPI :8000 → SQLAlchemy → SQLite
```

The database contains two small tables: `admins` for authentication and `customers` for dashboard data. Sample customers are inserted only when the customer table is empty.

## Run with Docker

Docker is the recommended setup. Node, Python, and SQLite do not need to be installed locally.

```bash
cp .env.example .env
docker compose up --build
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Register the first administrator through the UI, then sign in. The dashboard loads the seeded customer metrics and table through protected APIs.

To stop the application:

```bash
docker compose down
```

To also remove the persisted SQLite database:

```bash
docker compose down -v
```

## Local development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend, in another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
pytest -q
```

```bash
cd frontend
npm test
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register an administrator |
| POST | `/api/auth/login` | Validate credentials and return a JWT |
| GET | `/api/auth/me` | Validate the current session |
| GET | `/api/dashboard/stats` | Return the four customer KPIs |
| GET | `/api/customers` | Search, filter, sort, and paginate customers |

## Design decisions

- SQLite keeps the approved, time-boxed exercise easy to run. SQLAlchemy isolates database access so a later PostgreSQL change mainly requires a new database URL and migration setup.
- The customer API applies pagination in SQL. React never downloads every record to paginate locally.
- JWT keeps protected API calls simple and easy to demonstrate. For a public production application, the token would normally be held in a secure HTTP-only cookie.
- The implementation uses small modules with direct names so each part is easy to explain during review.

## Project structure

```text
frontend/src/components  Reusable UI pieces
frontend/src/pages       Dashboard screen
frontend/src/services    API integration
backend/app/routers      Authentication, dashboard, and customer endpoints
backend/app/models.py    SQLAlchemy tables
backend/app/schemas.py   Pydantic request and response models
backend/tests            Meaningful API tests
architecture             System flow
```
