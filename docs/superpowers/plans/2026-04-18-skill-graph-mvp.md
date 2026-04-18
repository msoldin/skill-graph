# Skill Graph MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Dockerized MVP learning platform with a roadmap catalog, interactive React Flow roadmaps, roadmap-specific topic content, and filesystem-backed study assets loaded on demand.

**Architecture:** Use a modular monolith: Next.js frontend, Quarkus backend, PostgreSQL metadata store, and disk-backed content assets. Keep canonical `topics`, roadmap-scoped `roadmap_topics` and `roadmap_edges`, and serve one React Flow-ready graph payload per roadmap plus one content bundle payload per clicked topic.

**Tech Stack:** Next.js App Router, React, TypeScript, React Flow, Quarkus, Java 21, PostgreSQL, Flyway, Hibernate/Panache or plain repositories, Docker, Docker Compose, `react-markdown`

---

## File Structure

- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `frontend/Dockerfile`
- Create: `frontend/package.json`
- Create: `frontend/src/app/roadmaps/page.tsx`
- Create: `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx`
- Create: `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`
- Create: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`
- Create: `frontend/src/features/topics/components/TopicContent.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `backend/Dockerfile`
- Create: `backend/pom.xml`
- Create: `backend/src/main/resources/application.properties`
- Create: `backend/src/main/resources/db/migration/V1__init.sql`
- Create: `backend/src/main/java/com/skillgraph/catalog/...`
- Create: `backend/src/main/java/com/skillgraph/roadmaps/...`
- Create: `backend/src/main/java/com/skillgraph/content/...`
- Create: `backend/src/main/java/com/skillgraph/assets/...`
- Create: `content/`
- Reference only: `plan.md`

## Architecture Decisions Locked In

- Backend: one Quarkus service, split internally by modules
- API style: REST
- Metadata source of truth: Postgres
- Content source of truth: filesystem, loaded only when topic content is requested
- Shared topics: yes
- Relationships: roadmap-scoped, not canonical
- Content: roadmap-scoped, not canonical
- Topic tree: no recursive hierarchy in MVP
- SEO: catalog and topic pages SSR/shareable; roadmap canvas client-heavy
- Layout: hybrid; stored `x/y` wins, otherwise backend computes fallback positions
- Position editing: DB-only in MVP
- Authoring: manual DB edits plus manual filesystem edits
- No auth in MVP, but keep an auth seam in backend/frontend structure

## Task 1: Scaffold Runtime

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `frontend/Dockerfile`
- Create: `backend/Dockerfile`
- Create: `.gitignore`

- [ ] **Step 1: Define the three-service runtime**
  Use three containers only: `frontend`, `backend`, `db`.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: skill_graph
      POSTGRES_USER: skill_graph
      POSTGRES_PASSWORD: skill_graph
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://db:5432/skill_graph
      QUARKUS_DATASOURCE_USERNAME: skill_graph
      QUARKUS_DATASOURCE_PASSWORD: skill_graph
      CONTENT_ROOT: /app/content
    volumes:
      - ./content:/app/content:ro
    depends_on: [db]
    ports: ["8080:8080"]

  frontend:
    build: ./frontend
    environment:
      BACKEND_BASE_URL: http://backend:8080
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080
    depends_on: [backend]
    ports: ["3000:3000"]

volumes:
  pgdata:
```

- [ ] **Step 2: Keep `content/` mounted read-only into backend**
  This enforces the chosen model: backend reads assets; frontend never touches disk directly.

- [ ] **Step 3: Add local env documentation**
  Put DB credentials and base URLs in `.env.example`, but keep it small.

## Task 2: Create Backend Skeleton

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/resources/application.properties`
- Create: `backend/src/main/java/com/skillgraph/...`

- [ ] **Step 1: Use a small Quarkus dependency set**
  Recommended dependencies:
  - RESTEasy Reactive
  - Jackson
  - JDBC PostgreSQL
  - Flyway
  - Hibernate ORM with Panache or plain repositories
  - SmallRye Health

- [ ] **Step 2: Lay out modules by domain responsibility**
  Recommended package shape:

```text
com.skillgraph.catalog
com.skillgraph.roadmaps
com.skillgraph.topics
com.skillgraph.content
com.skillgraph.assets
com.skillgraph.shared
```

- [ ] **Step 3: Keep hexagonal boundaries pragmatic**
  Inside each module, use:
  - `api`
  - `application`
  - `domain`
  - `infrastructure`

- [ ] **Step 4: Add backend config**
  Keep config limited to DB, content root, CORS, and logging.

```properties
quarkus.http.port=8080
quarkus.flyway.migrate-at-start=true
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=${QUARKUS_DATASOURCE_JDBC_URL}
quarkus.datasource.username=${QUARKUS_DATASOURCE_USERNAME}
quarkus.datasource.password=${QUARKUS_DATASOURCE_PASSWORD}
app.content-root=${CONTENT_ROOT}
quarkus.http.cors=true
```

## Task 3: Define Database Schema

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__init.sql`

- [ ] **Step 1: Create canonical topic and roadmap tables**

```sql
create table roadmaps (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table topics (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);
```

- [ ] **Step 2: Create roadmap-local projection tables**

```sql
create table roadmap_topics (
  id bigserial primary key,
  roadmap_id bigint not null references roadmaps(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete restrict,
  label_override text,
  x numeric(10,2),
  y numeric(10,2),
  group_key text,
  is_entrypoint boolean not null default false,
  unique (roadmap_id, topic_id)
);

create table roadmap_edges (
  id bigserial primary key,
  roadmap_id bigint not null references roadmaps(id) on delete cascade,
  source_roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  target_roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  edge_type text not null check (edge_type in ('prerequisite', 'related', 'recommended'))
);
```

- [ ] **Step 3: Create asset reference table**

```sql
create table roadmap_topic_assets (
  id bigserial primary key,
  roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  asset_type text not null check (asset_type in ('markdown', 'pdf', 'json', 'yaml')),
  file_path text not null,
  title text not null,
  sort_order integer not null default 0
);
```

- [ ] **Step 4: Add critical indexes**

```sql
create index idx_roadmap_topics_roadmap on roadmap_topics (roadmap_id);
create index idx_roadmap_edges_source on roadmap_edges (roadmap_id, source_roadmap_topic_id);
create index idx_roadmap_edges_target on roadmap_edges (roadmap_id, target_roadmap_topic_id);
create index idx_assets_roadmap_topic on roadmap_topic_assets (roadmap_topic_id, sort_order);
```

## Task 4: Build Catalog and Roadmap Graph Read Model

**Files:**
- Create: `backend/src/main/java/com/skillgraph/catalog/api/CatalogResource.java`
- Create: `backend/src/main/java/com/skillgraph/roadmaps/api/RoadmapResource.java`
- Create: `backend/src/main/java/com/skillgraph/roadmaps/application/GetRoadmapGraphService.java`
- Create: `backend/src/main/java/com/skillgraph/roadmaps/infrastructure/...`

- [ ] **Step 1: Implement `GET /api/roadmaps`**
  Return only catalog metadata needed for SSR listing.

```json
[
  {
    "slug": "java-backend",
    "title": "Java Backend",
    "description": "Core backend concepts and tools"
  }
]
```

- [ ] **Step 2: Implement `GET /api/roadmaps/{roadmapSlug}`**
  Return roadmap shell metadata only, not nodes and edges.

- [ ] **Step 3: Implement `GET /api/roadmaps/{roadmapSlug}/graph`**
  Load in bulk:
  - roadmap row
  - all `roadmap_topics` joined to `topics`
  - all `roadmap_edges`
  - asset summary per `roadmap_topic`

- [ ] **Step 4: Shape one React Flow-ready payload**
  Use `roadmap_topic.id` as `node.id`.

```json
{
  "roadmap": { "slug": "java-backend", "title": "Java Backend" },
  "nodes": [
    {
      "id": "101",
      "type": "topic",
      "position": { "x": 240, "y": 120 },
      "data": {
        "topicSlug": "http-basics",
        "label": "HTTP Basics",
        "groupKey": "foundations",
        "isEntrypoint": true,
        "contentAvailable": true,
        "contentTypes": ["markdown", "pdf"],
        "href": "/roadmaps/java-backend/topics/http-basics"
      }
    }
  ],
  "edges": [
    {
      "id": "501",
      "source": "101",
      "target": "102",
      "type": "prerequisite",
      "data": { "relationship": "prerequisite" }
    }
  ]
}
```

- [ ] **Step 5: Keep graph fetch N+1-free**
  Do not query per node. Assemble from bulk result sets in memory.

## Task 5: Add Hybrid Layout Fallback

**Files:**
- Create: `backend/src/main/java/com/skillgraph/roadmaps/application/LayoutResolver.java`

- [ ] **Step 1: Respect manual `x/y` first**
  If a node has stored coordinates, return them unchanged.

- [ ] **Step 2: Compute fallback positions only when coordinates are missing**
  Use a simple DAG-friendly algorithm:
  - derive layers from `prerequisite` edges
  - stack nodes vertically within a layer
  - use fixed spacing constants

```java
if (storedX != null && storedY != null) {
    return new Position(storedX, storedY);
}
return fallbackLayout.compute(nodeId, graph);
```

- [ ] **Step 3: Keep fallback deterministic**
  Sort within layers by label or slug so the graph does not jump between requests.

- [ ] **Step 4: Do not persist auto-layout in MVP**
  Return computed values only. Manual DB edits remain the persistence mechanism.

## Task 6: Build Content Resolution and Safe Filesystem Access

**Files:**
- Create: `backend/src/main/java/com/skillgraph/content/api/TopicContentResource.java`
- Create: `backend/src/main/java/com/skillgraph/content/application/GetRoadmapTopicContentService.java`
- Create: `backend/src/main/java/com/skillgraph/assets/infrastructure/FilesystemAssetReader.java`

- [ ] **Step 1: Implement `GET /api/roadmaps/{roadmapSlug}/topics/{topicSlug}`**
  Resolve:
  - roadmap by slug
  - `roadmap_topic` by roadmap + topic slug
  - asset rows by `roadmap_topic.id`

- [ ] **Step 2: Resolve file paths safely against `CONTENT_ROOT`**
  Never trust raw client input.

```java
Path resolved = contentRoot.resolve(filePath).normalize();
if (!resolved.startsWith(contentRoot)) {
    throw new IllegalArgumentException("Asset path escapes content root");
}
```

- [ ] **Step 3: Return roadmap-scoped content bundle payload**

```json
{
  "roadmap": { "slug": "java-backend", "title": "Java Backend" },
  "topic": {
    "slug": "http-basics",
    "title": "HTTP Basics",
    "summary": "Requests, responses, methods, and status codes"
  },
  "assets": [
    { "id": "1", "type": "markdown", "title": "Study Notes", "body": "# HTTP Basics\n..." },
    { "id": "2", "type": "pdf", "title": "RFC Excerpt", "url": "/api/assets/pdf/2" }
  ]
}
```

- [ ] **Step 4: Stream PDFs from a dedicated endpoint**
  Add `GET /api/assets/pdf/{assetId}` and verify that the asset type is actually `pdf` before streaming.

- [ ] **Step 5: Keep `json` and `yaml` internal**
  Use them only as structured support inputs if needed later. Do not expose a raw generic file viewer in MVP.

## Task 7: Create Frontend Base App and API Client

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/app/roadmaps/page.tsx`
- Create: `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx`
- Create: `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`

- [ ] **Step 1: Use App Router and server components by default**
  Keep pages SSR unless they need browser interactivity.

- [ ] **Step 2: Centralize typed API fetches**
  One small client is enough.

```ts
export async function getRoadmaps() { /* fetch /api/roadmaps */ }
export async function getRoadmap(slug: string) { /* fetch /api/roadmaps/:slug */ }
export async function getRoadmapGraph(slug: string) { /* fetch /graph */ }
export async function getTopicContent(roadmapSlug: string, topicSlug: string) { /* fetch topic */ }
```

- [ ] **Step 3: Build the catalog page**
  `app/roadmaps/page.tsx` should SSR the roadmap list and link to `/roadmaps/[roadmapSlug]`.

- [ ] **Step 4: Build the topic detail page as a shareable SSR route**
  This is the SEO-friendly content surface.

## Task 8: Integrate React Flow Roadmap Canvas

**Files:**
- Create: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`
- Modify: `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx`

- [ ] **Step 1: Make the roadmap page fetch metadata on the server**
  Then render a client component for the interactive graph.

- [ ] **Step 2: Fetch graph payload from backend in the client component**
  Keep graph loading independent from page metadata.

- [ ] **Step 3: On node click, route to the shareable topic page**
  Start with route-backed navigation first. That is the cleanest MVP.

```ts
router.push(`/roadmaps/${roadmapSlug}/topics/${topicSlug}`)
```

- [ ] **Step 4: Keep node UI minimal**
  Show:
  - label
  - entrypoint marker
  - content availability
  - maybe edge color by relationship type

- [ ] **Step 5: Defer side-panel UX**
  Do not start with parallel routes or intercepted modal routes. Add them only after end-to-end flow works.

## Task 9: Render Topic Content Cleanly

**Files:**
- Create: `frontend/src/features/topics/components/TopicContent.tsx`
- Modify: `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`

- [ ] **Step 1: Render Markdown with `react-markdown`**
  Keep it plain and readable first.

- [ ] **Step 2: Render PDFs as links or embedded viewer**
  Default recommendation: link first, embed later if needed.

- [ ] **Step 3: Render asset bundle in deterministic order**
  Sort by `sort_order`, then `title`.

- [ ] **Step 4: Add basic empty and error states**
  Handle:
  - missing topic
  - no assets
  - missing file on disk
  - unsupported asset type

## Task 10: Add Operational Guardrails

**Files:**
- Modify: backend error handling classes
- Modify: frontend error/loading states
- Optional: `backend/src/main/java/com/skillgraph/shared/api/...`

- [ ] **Step 1: Return clear 404s**
  For:
  - unknown roadmap
  - topic not in roadmap
  - missing asset

- [ ] **Step 2: Fail loudly on broken DB-to-file references**
  A missing file should be observable and debuggable, not silently swallowed.

- [ ] **Step 3: Add lightweight graph caching**
  Cache `GET /graph` responses per roadmap slug with a short in-process TTL only if profiling shows benefit.

- [ ] **Step 4: Keep auth behind a seam**
  Add no auth behavior yet, but avoid scattering access assumptions through controllers.

## Task 11: Bootstrap Minimal Demo Data

**Files:**
- No required committed files beyond schema
- Manual DB inserts during setup are acceptable, matching your MVP authoring model

- [ ] **Step 1: Insert one roadmap**
- [ ] **Step 2: Insert 5-10 topics**
- [ ] **Step 3: Insert matching `roadmap_topics` with a mix of manual and null positions**
- [ ] **Step 4: Insert `prerequisite`, `related`, and `recommended` edges**
- [ ] **Step 5: Insert 1-2 assets per roadmap topic**
- [ ] **Step 6: Place corresponding Markdown and PDF files under `content/`**

This gives you a real vertical slice without first building authoring tools.

## Task 12: Verify the First End-to-End Milestone

**Files:**
- Verify only

- [ ] **Step 1: Start the stack**
  Run: `docker compose up --build`

- [ ] **Step 2: Verify catalog SSR**
  Expected:
  - `http://localhost:3000/roadmaps` lists available roadmaps

- [ ] **Step 3: Verify roadmap graph**
  Expected:
  - roadmap page renders
  - graph nodes appear
  - manually positioned nodes stay fixed
  - nodes with null positions get deterministic fallback positions

- [ ] **Step 4: Verify topic content**
  Expected:
  - clicking a node navigates to `/roadmaps/{roadmapSlug}/topics/{topicSlug}`
  - markdown content renders
  - pdf link/stream works
  - bad file references return clear errors

- [ ] **Step 5: Verify performance**
  Expected:
  - graph endpoint does not execute per-node queries
  - topic content loads only when requested

## MVP Exclusions

Do not build these in the first pass:

- user accounts
- progress tracking
- admin UI
- drag-and-drop node editor
- content sync/import daemon
- GraphQL
- Redis
- background jobs
- deep recursive topic trees
- cross-roadmap recommendation engine
- graph database

## Recommended Build Order

1. Runtime and Docker
2. DB schema
3. Backend catalog and graph API
4. Filesystem asset resolution
5. Frontend catalog and topic SSR pages
6. React Flow roadmap page
7. Error handling and polish

## Residual Risk

The main non-code risk is authoring ergonomics:

- graph metadata lives in Postgres
- content files live on disk
- positions are edited manually in DB

That is acceptable for MVP, but it should stay visible as the first likely post-MVP pain point. The natural next feature after MVP is a tiny internal authoring surface for positions and asset references.
