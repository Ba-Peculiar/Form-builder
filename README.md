# Dynamic Form Builder Engine

A configuration-driven form builder: forms are defined as JSON, validated dynamically against that JSON, and rendered dynamically from it — adding a new form or field never requires a code change.

Built as a Technical Assessment submission (Assignment A).

## Live Application

- **Frontend:** <https://form-builder-git-main-bapeculiars-projects.vercel.app/>
- **Backend API:** <https://form-builder-production-22bf.up.railway.app/api\\>

No credentials are required — form creation, publishing, and submission are all open.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State / Data fetching | TanStack Query (React Query), React Hook Form |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable |
| Backend | Node.js, Express, TypeScript |
| ORM / Database | Prisma, PostgreSQL |
| Validation | AJV (JSON Schema validation) |
| Deployment | Vercel (frontend), Railway (backend + database) |

---

## Local Setup Instructions

Two options are provided.

---

### Option A — Docker 

#### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running. No Node.js or PostgreSQL needed.

#### Step 1 — Clone and enter the project

```bash
git clone <repo-url>
cd form-builder
```

#### Step 2 — Start all services

From the project root (the directory that contains `docker-compose.yml`):

```bash
docker compose up --build
```

This command builds and starts three containers:

| Container | What it does | Port |
|---|---|---|
| `postgres` | PostgreSQL 16 database | internal only |
| `backend` | Express API — runs DB migrations then starts the server | 4000 |
| `frontend` | Vite production build served by nginx | 5173 |

The first build downloads base images and installs npm dependencies. **Expect 3–5 minutes** on a first run. Subsequent `docker compose up` (without `--build`) starts in seconds.

#### Step 3 — Verify everything is running

You will see logs from all three containers in your terminal. Look for these lines, which confirm each service is healthy:

```
postgres   | database system is ready to accept connections
backend    | Server listening on port 4000
frontend   | nginx started
```

Then confirm the API is reachable:

```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok"}
```

#### Step 4 — Open the app

Navigate to **<http://localhost:5173>** in your browser. You should see the form builder dashboard.

From there you can:
- Create a new form and add fields
- Publish the form
- share form's public form link and and people whom you share the link to can fill and submit a response
- View the response in the Responses tab

#### Stopping the stack

To stop the containers without deleting data:

```bash
docker compose down
```

To stop and wipe the database volume (full clean slate):

```bash
docker compose down -v
```

---

### Option B — Manual setup

#### Prerequisites

- Node.js 20+
- A running PostgreSQL instance (local install, Homebrew, or a Docker one-liner: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine`)

#### Step 1 — Database

Create an empty database:

```bash
createdb form_builder
```

#### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

The `.env.example` defaults work as-is if your Postgres is on `localhost:5432` with user `postgres` and password `postgres`. Edit `.env` if your setup differs:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/form_builder?schema=public"
PORT=4000
```

Apply migrations and start the API:

```bash
npx prisma migrate dev
npm run dev
```

Confirm it started:

```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok"}
```

#### Step 3 — Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

The `.env.example` already points at `http://localhost:4000/api`. No edits needed unless you changed the backend port.

Start the dev server:

```bash
npm run dev
```

Open **<http://localhost:5173>** in your browser.

---

## Data Model

Three tables, all in PostgreSQL:

```text
Form
  id              uuid, PK
  title           text
  description     text, nullable
  status          enum: DRAFT | PUBLISHED
  current_version int, nullable        -- set only once published
  created_at, updated_at

FormVersion
  id              uuid, PK
  form_id         FK -> Form
  version_number  int
  schema          jsonb                -- { title, fields: FieldConfig[], groups?: FieldGroup[] }
  created_at
  unique(form_id, version_number)

Submission
  id              uuid, PK
  form_id         FK -> Form
  form_version_id FK -> FormVersion    -- pinned to the exact version submitted against
  data            jsonb                -- submitted answers, keyed by field id
  submitted_at
```

### Why JSONB for the form schema

Field count and field-specific constraints (min/max length, options list, email format, etc.) vary per form and per field type. Modelling that relationally would mean either a sparse `fields` table with a column per possible constraint, or a constraint sub-table — both add schema complexity for no benefit, since nothing here needs to be queried *inside* the schema (it is always read and written as a whole). A single `schema jsonb` column keeps the relational tables simple and lets the field/constraint shape evolve without migrations.

### Field groups (sections)

The schema column embeds an optional `groups: FieldGroup[]` array alongside `fields: FieldConfig[]`. Each `FieldConfig` carries an optional `groupId` pointing at a group and a `globalOrder` for its position in the unified sequence of sections and standalone fields. Groups are stored inside the JSONB blob rather than in a separate table because they have no independent lifecycle — a group only exists in the context of a specific form version. Keeping them in the blob means no extra join, no orphan cleanup, and no migration when the grouping model changes.

### Versioning strategy

A `Form` starts as `DRAFT` with exactly one `FormVersion` row (`version_number = 1`), updated in place every time the draft is saved. Publishing flips `Form.status` to `PUBLISHED` and freezes the `FormVersion` — the form cannot be edited afterward (enforced in `forms.service.ts`, not just the UI). Every `Submission` stores `form_version_id` directly, so a submission's shape and validation rules can always be reconstructed exactly as they were at submission time, even if the we later decide to allow editing forms.

---

## Key Design Decisions

**PostgreSQL + JSONB, not a NoSQL store** — submissions and forms both benefit from relational integrity (a submission must belong to a real form and a real version — foreign keys enforce that), while the variable-shape *content* of a form lives in JSONB. This gets the benefits of both without needing two databases.

**AJV for validation, schema generated on the fly** — `FieldConfig[]` is translated into a JSON Schema object at validation time rather than stored as JSON Schema directly. This keeps the stored representation simple and UI-friendly, while still getting a real spec-compliant validator (required fields, length/value bounds, email format, enum options, no unknown keys). `additionalProperties: false` rejects submission keys that don't correspond to a real field.

**Publish locks the form** — once a form is published, both the `Form` and its `FormVersion` become read-only at the API level. This was a deliberate simplification: locking is unambiguous, easy to reason about, and keeps versioning clean.

**Thin Express modules, one folder per concern** — `forms/`, `public/`, `submissions/`, `validation/` each have their own `*.controller.ts`, `*.service.ts`, and `*.routes.ts`. Controllers parse the request and shape the response; services own the Prisma calls and business rules.

**Rendering driven entirely by configuration, in two layouts** — `FormRenderer` takes a `FieldConfig[]` and a `layout` prop (`standard` = vertical cards, `compact` = horizontal grid) and renders every supported field type without any per-form custom code. Validation is deliberately not duplicated client-side (beyond the native `required` attribute, which is presentational) — AJV on the backend is the single source of truth.

**Number fields validate digit count, not numeric range** — `min`/`max` on a number field validate digit count against a `^[0-9]+$` pattern, and the value is kept as a string end-to-end so leading zeros survive. This lets the number field handle things like phone numbers and ID numbers, not just quantities.

---

## Trade-Off Analysis

### Simplifications made

- Published forms are permanently locked rather than supporting a "create a new draft from a published form" flow.
- No authentication or authorization layer — anyone with the URL can create, publish, or view any form.
- No pagination on `GET /api/forms` or `GET /api/forms/:id/submissions`.
- Client-side validation duplication — AJV on the backend is the single source of truth for what is valid, so there is exactly one place that logic can drift.
- A "checkbox group" (multi-value checkbox) field type — `checkbox` is a single boolean toggle; a multi-choice list is already covered by `select`.

### What I'd add or change with more time

- Basic authentication (even a single shared admin token) so the builder is not fully public.
- A true "republish" flow — create version 2 of a form while preserving version 1 and its historical submissions, instead of locking forms permanently.
- Pagination and search on the forms list and submission list.
- Export submissions as CSV or PDF from the Submission List page.
- Conditional field logic (show/hide a field based on the answer to another).
- Team collaboration and shared ownership of forms.
- Email notifications to the form creator on each new submission.

### Scaling to production

The architecture is already structured for horizontal growth — here is how each layer would be scaled:

**API (Express)** — the server is fully stateless (no in-memory session, no local file storage). Multiple instances can run behind a load balancer (AWS ALB, Railway replicas, etc.) without coordination. The only shared state is the database.

**Database connections** — `@prisma/adapter-pg` opens a connection pool per API instance. Under high concurrency, many instances competing for Postgres connections becomes the bottleneck. The fix is to put a connection pooler in front of Postgres — PgBouncer in transaction mode, or AWS RDS Proxy — so the database sees a bounded number of connections regardless of how many API instances are running.

**Read vs write load** — form submissions (`POST /api/public/forms/:id/submit`) are write-heavy; viewing submissions and form configurations are read-heavy. At scale these would be separated: writes go to the primary Postgres instance, reads are routed to a read replica. The `formVersionId` pin on every submission means the read replica is always consistent enough for safe reads.

**Frontend** — already solved. The Vite production build is a static bundle deployed to Vercel's CDN. It is distributed globally at the edge with no additional work required.

**Background work** — features like email notifications, CSV export, or webhook delivery should not block the HTTP request. In production these would be pushed onto a job queue (BullMQ backed by Redis, or AWS SQS) and processed by a separate worker process, keeping API response times fast and predictable.

**Observability** — at production scale you would add structured JSON logging (Pino), a metrics endpoint (Prometheus), and distributed tracing (OpenTelemetry) so you can identify slow queries or error spikes before users notice them.

---

## AI Usage Disclosure

### ChatGPT (Software Architecture GPT)

Used during the planning phase, before writing any code:

- Clarifying and refining the assessment requirements.
- Producing a phase-by-phase implementation plan from the assignment brief and a pre-written architecture outline I prepared.
- Reviewing the architecture for gaps before implementation began.

### Claude Code (Claude Sonnet 4.6)

Used throughout the full implementation as an AI pair programmer:

- **Backend implementation** — Express routes, Prisma schema and migrations, AJV-based validation service, versioning and submission logic.
- **Frontend implementation** — React component architecture, TanStack Query data-fetching layer, React Hook Form integration, and the full `FieldEditor` / `FormRenderer` pipeline.
- **Feature iteration** — the field grouping (sections) system, unified section/field ordering, drag-and-drop within sections, and ungrouped fields as first-class individually-movable entities were all designed and implemented iteratively through back-and-forth conversation: I described the desired behaviour, reviewed the generated code, tested it, and gave fed back what needed to change.
- **Responsive design** — systematic pass across all pages and components to handle mobile, tablet, and desktop layouts.
- **Bug fixes** — issues found during manual testing (focus loss on label edit, ordering edge cases, deployment timing) were diagnosed and fixed in conversation.
- **Documentation** — this README was drafted with Claude Code based on the actual codebase and decisions made during the build.

### Verification

Every phase was manually reviewed before moving to the next, and verified concretely rather than taken on faith:

- `tsc -b` and `vite build` run clean before any phase was considered done.
- Every backend endpoint was exercised with real `curl` requests against a real PostgreSQL database — success and failure paths (wrong types, missing required fields, out-of-range values, 404s) — with test data deleted afterward.
- All UI features were manually tested in-browser on both the local dev server and the deployed Vercel/Railway environment.
