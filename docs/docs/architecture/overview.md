---
sidebar_position: 1
---

# Architecture

## System Overview

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     SQL      ┌──────────────┐
│  Next.js (3001) │ ─────────────► │  NestJS (3000)   │ ───────────► │   Supabase   │
│  (Frontend)     │                │  (Backend API)   │              │  (Postgres)  │
└─────────────────┘                └──────────────────┘              └──────────────┘
        │                                   │                                │
        │ Supabase Auth SDK                 │ JWT validation                 │ RLS policies
        └───────────────────────────────────┴────────────────────────────────┘
```

## Authentication Flow

1. User signs up/in via **Supabase Auth** directly from the frontend
2. Supabase returns a **JWT access token**
3. Frontend attaches the token as `Authorization: Bearer <token>` on every API request
4. NestJS validates the JWT using `passport-jwt` with the `SUPABASE_JWT_SECRET`
5. Supabase **Row Level Security (RLS)** policies enforce data ownership at the database level

## Monorepo Structure

```
mern-monorepo/
├── apps/
│   ├── backend/          # NestJS API
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # JWT strategy + auth endpoints
│   │       │   ├── projects/   # CRUD for projects
│   │       │   └── tasks/      # CRUD for tasks
│   │       └── database/       # Supabase client
│   └── frontend/         # Next.js App Router
│       ├── app/
│       │   ├── (auth)/         # Login / Signup pages
│       │   ├── dashboard/      # Projects list
│       │   └── project/[id]/   # Task board
│       └── lib/
│           ├── api-client.ts   # Typed fetch wrapper
│           ├── auth.ts         # Session helpers
│           └── supabase.ts     # Supabase client
├── docs/                 # Docusaurus site
└── supabase/
    └── migrations/       # SQL schema
```

## Data Model

```sql
projects (id, user_id, name, description, created_at, updated_at)
tasks    (id, project_id, title, description, status, created_at, updated_at)
```

Tasks are cascade-deleted when their parent project is deleted.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/projects | List user's projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project + tasks |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/tasks?projectId= | List tasks for project |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
