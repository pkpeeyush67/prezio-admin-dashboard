# Prezio User Management

A small React single-page application with a Python FastAPI backend, SQLAlchemy, SQLite, admin authentication, user management, CSV upload, and one-container Docker deployment.

## Features

- Administrator registration and login with frontend and backend validation
- Argon2 password hashing and 30-minute JWT sessions
- Protected dashboard and logout
- Total, active, inactive, and last-30-days user KPIs
- Create, view, edit, and delete users
- Client-side search and status filtering
- CSV dataset upload
- Responsive loading, success, error, and empty states
- FastAPI Swagger documentation

## Architecture

```text
Browser → React SPA → FastAPI REST API → SQLAlchemy → SQLite
```

The production Docker image builds React first and copies the compiled SPA into the FastAPI image. FastAPI serves both the UI and API from port 8000. The database has two tables: `admins` and `users`.

## Run with Docker

```powershell
Copy-Item .env.example .env
docker build -t prezio-admin .
docker run --name prezio-admin -p 8000:8000 -v prezio_data:/app/data --env-file .env prezio-admin
```

Open:

- Application: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Stop and remove the container:

```powershell
docker stop prezio-admin
docker rm prezio-admin
```

## Local development

Start the backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The local frontend runs at http://localhost:5173 and connects to the API at http://localhost:8000/api.

## CSV upload

Use `sample_users.csv` as a template. Its required header is:

```csv
name,email,company,status
```

Status must be `active` or `inactive`. Duplicate emails and invalid rows are skipped, and the UI reports the imported and skipped counts.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register an administrator |
| POST | `/api/auth/login` | Validate credentials and return a JWT |
| GET | `/api/auth/me` | Validate the current session |
| GET | `/api/dashboard/stats` | Return user KPIs |
| GET | `/api/users` | Return managed users |
| GET | `/api/users/{id}` | Return one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/{id}` | Update a user |
| DELETE | `/api/users/{id}` | Delete a user |
| POST | `/api/users/import` | Upload a CSV dataset |

## Project structure

```text
Dockerfile              Builds and serves the complete application
frontend/src            React UI and API integration
backend/app/routers     Authentication, dashboard, and user APIs
backend/app/models.py   SQLAlchemy tables
backend/app/schemas.py  Pydantic validation models
sample_users.csv        Import template and sample dataset
```

SQLite keeps the assessment easy to run. SQLAlchemy separates the database layer, so the application can later move to PostgreSQL through configuration and migrations. The implementation uses small modules and direct names so each part is easy to explain during the interview.
