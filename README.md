# ProjectFlow

A full-stack project management application. Create projects, manage tasks, track progress.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (TypeScript, App Router, Tailwind CSS) |
| Backend | NestJS (TypeScript, Passport JWT) |
| Database | Supabase (Postgres + Auth + RLS) |
| Testing | Jest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions + AWS ECS / Amplify |
| Docs | Docusaurus |

## Monorepo Structure

```
apps/
  backend/    NestJS REST API (port 3000)
  frontend/   Next.js app (port 3001)
docs/         Docusaurus documentation site
supabase/
  migrations/ Database schema
```

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Run the Supabase migration in your project's SQL editor
#    supabase/migrations/20240329000000_init_schema.sql

# 4. Start both servers
pnpm dev
```

- Frontend → http://localhost:3001
- Backend API → http://localhost:3000/api
- Docs → `cd docs && pnpm start`

## Tests

```bash
# Backend unit tests
cd apps/backend && pnpm test

# E2E tests
cd apps/frontend && pnpm test:e2e
```

## CI/CD

GitHub Actions runs on every push:
- `ci.yml` — lint, unit tests, E2E tests
- `deploy.yml` — builds Docker image → ECR → ECS (backend) and triggers Amplify (frontend)

See `.github/workflows/` and `docs/docs/architecture/` for details.
