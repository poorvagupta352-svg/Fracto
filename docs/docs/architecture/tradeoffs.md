---
sidebar_position: 2
---

# Tradeoffs & Decisions

## Supabase Auth on the Frontend

**Decision:** Auth is handled directly by the Supabase JS SDK on the frontend rather than proxied through NestJS.

**Why:** Supabase Auth is a managed service — routing it through the backend adds latency and complexity with no security benefit. The backend validates the JWT on every request anyway.

**Tradeoff:** The frontend has a direct dependency on Supabase. If you switch auth providers, both frontend and backend need updating.

---

## NestJS as a Thin API Layer

**Decision:** The NestJS backend is a thin REST API that validates ownership and delegates all persistence to Supabase.

**Why:** Supabase RLS policies already enforce row-level ownership. The backend adds a second layer of validation (project ownership checks before task operations) and is the right place for business logic as the app grows.

**Tradeoff:** Two layers of auth checks (JWT + RLS) add slight overhead but significantly improve security.

---

## No Redux / Zustand

**Decision:** State is managed with `useState` + `useEffect` in each page component.

**Why:** The app has two pages with simple, non-shared state. A global store would be over-engineering at this scale.

**Tradeoff:** If the app grows (e.g., shared task counts in the header), a store like Zustand would be easy to add.

---

## Kanban Board Layout

**Decision:** Tasks are displayed in a 3-column kanban layout (todo / in-progress / done) rather than a flat list.

**Why:** Provides immediate visual progress tracking without extra UI complexity.

---

## How to Scale

1. **Database:** Supabase scales Postgres vertically and supports read replicas. Add indexes on `projects.user_id` and `tasks.project_id` for large datasets.
2. **Backend:** Deploy NestJS on AWS ECS with auto-scaling. Stateless design means horizontal scaling is trivial.
3. **Frontend:** Deploy on AWS Amplify or Vercel with CDN edge caching for static assets.
4. **Auth:** Supabase Auth handles millions of users. No changes needed.
5. **Real-time:** Add Supabase Realtime subscriptions to push task updates to all project members without polling.
6. **Multi-tenancy:** Add an `organizations` table and update RLS policies to support team-based access.
