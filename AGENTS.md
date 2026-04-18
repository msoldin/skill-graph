# AGENTS.md

## Stack

- **Backend:** Java 21 + Quarkus 3.20.2, Maven, PostgreSQL 16, Flyway migrations
- **Frontend:** Next.js 14 (App Router, standalone output), React 18, TypeScript (strict), React Flow
- **Infra:** Docker Compose orchestrates db + backend + frontend

## Project layout

```
backend/          Java Quarkus REST API (hexagonal/DDD per domain)
frontend/         Next.js app (feature-based under src/features/, shared in src/lib/)
content/          Static markdown/PDF assets served by backend, organized by roadmap/topic slug
```

Backend domains: `roadmaps`, `content`, `catalog`, `assets`, `shared` — each with `api/`, `application/`, `domain/`, `infrastructure/` subpackages.

Frontend proxies all `/api/*` calls to backend via `src/app/api/[...path]/route.ts` using `BACKEND_BASE_URL`.

## Commands

### Full stack

```bash
docker compose up     # db :5432, backend :8080, frontend :3000
```

### Backend (from `backend/`)

```bash
mvn quarkus:dev                         # Dev mode with hot reload
mvn test                                # All tests (JUnit 5)
mvn test -Dtest=LayoutResolverTest      # Single test class
```

No Maven wrapper (`mvnw`) is checked in — use system `mvn`.

### Frontend (from `frontend/`)

```bash
npm install
npm run dev       # Dev server :3000
npm run build     # Production build
npm run test      # Runs: tsx --test src/lib/api.test.ts src/app/api/proxy-route.test.ts
```

No lint, format, or typecheck scripts are configured.

## Environment

Copy `.env.example` for Docker Compose defaults (`skill_graph` / `skill_graph` / `skill_graph`).

Key env vars:
- `BACKEND_BASE_URL` — frontend proxy target (default `http://backend:8080` in Docker)
- `CONTENT_ROOT` — where backend reads static assets (default `/app/content`)
- `QUARKUS_DATASOURCE_*` — DB connection for backend outside Docker

## Database

Flyway runs migrations on startup (`quarkus.flyway.migrate-at-start=true`).
Migration files: `backend/src/main/resources/db/migration/V{n}__*.sql`.

## Testing

- Backend: JUnit 5 via Maven Surefire. Test classes in `backend/src/test/java/`.
- Frontend: Node built-in test runner via `tsx --test`. Only two test files exist.

## Conventions

- Backend uses Java records for domain types
- Frontend path alias: `@/*` maps to `./src/*`
- CORS allows `localhost:3000` only (`application.properties`)
- No CI, no linter, no formatter, no pre-commit hooks
