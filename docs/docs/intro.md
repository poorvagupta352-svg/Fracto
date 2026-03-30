# ProjectFlow Documentation

ProjectFlow is a full-stack project management application built with Next.js, NestJS, and Supabase.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <repo-url>
cd mern-monorepo
pnpm install
```

### 2. Configure environment variables

**Backend** (`apps/backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3001
PORT=3000
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Run the database migration

In your Supabase dashboard → SQL Editor, run the contents of:
```
supabase/migrations/20240329000000_init_schema.sql
```

### 4. Start the development servers

```bash
pnpm dev
```

- Frontend: http://localhost:3001
- Backend: http://localhost:3000/api

### 5. Run tests

```bash
# Backend unit tests
cd apps/backend && pnpm test

# Frontend E2E tests (requires running dev server)
cd apps/frontend && pnpm test:e2e
```
