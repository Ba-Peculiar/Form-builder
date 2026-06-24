# Dynamic Form Builder Engine

A configuration-driven form builder: forms are defined as JSON, validated dynamically against that JSON, and rendered dynamically from it — adding a new form or field never requires a code change.

Built as a Technical Assessment submission (Assignment A).

## Live Application

- **Frontend:** <https://form-builder-ebon-two.vercel.app>
- **Backend API:** <https://form-builder-production-22bf.up.railway.app/api>

No credentials are required — form creation, publishing, and submission are all open.

---

## Local Setup Instructions

### Prerequisites

- Node.js 20+
- A running PostgreSQL instance (local install, Homebrew, Docker — any of these work, as long as you have a connection string)

### 1. Database

Create an empty database for the project, e.g.:

```bash
createdb form_builder
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and point `DATABASE_URL` at the database from step 1 for example;
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:portNumber/databaseName?schema=public"
PORT=portNumber
```

Apply the schema and start the API:

```bash
npx prisma migrate dev
npm run dev
```

The API is now running at `http://localhost:portNumber/api` (verify with `GET /api/health`).

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
```

`.env` should point at the backend you just started:

```env
VITE_API_URL=http://localhost:portNumber/api
```

Start the dev server:

```bash
npm run dev
```

Open the printed local URL (Vite's default is `http://localhost:portNumber`).

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
  schema          jsonb                -- { title, fields: FieldConfig[] }
  created_at
  unique(form_id, version_number)

Submission
  id              uuid, PK
  form_id         FK -> Form
  form_version_id FK -> FormVersion     -- pinned to the exact version submitted against
  data            jsonb                -- the submitted answers, keyed by field id
  submitted_at
```

**Why JSONB for the form definition** — field count and field-specific constraints (min/max length, options, etc.) vary per form and per field type. Modeling that relationally would mean either a sparse `fields` table with a column per possible constraint, or a constraint sub-table — both add real schema complexity for no benefit, since nothing here needs to be queried *inside* the schema (we only ever read/write it as a whole). A single `schema jsonb` column keeps the relational tables (`Form`, `FormVersion`, `Submission`) simple and lets the field/constraint shape evolve without migrations.

**Versioning strategy** — a `Form` starts as `DRAFT` with exactly one `FormVersion` row (`version_number = 1`), which is updated in place every time the draft is saved. Publishing flips `Form.status` to `PUBLISHED` and sets `Form.current_version` — at that point the `FormVersion` row is frozen and the form can no longer be edited (enforced in `forms.service.ts`, not just in the UI). Every `Submission` stores `form_version_id` directly, so a submission's shape and validation rules can always be reconstructed exactly as they were the moment it was submitted, even if the form is later changed. (Since published forms are immutable, in practice every form currently has just one version — but the schema already supports multiple, and the design doesn't need to change to support a "republish as v2" flow later.)

---

## Key Design Decisions

- **PostgreSQL + JSONB, not a NoSQL store** — submissions and forms both benefit from real relational integrity (a submission must belong to a real form and a real version — foreign keys enforce that), while the variable-shape *content* of a form lives in a JSONB column. This gets both worlds without needing two databases.

- **AJV for validation, schema generated on the fly** — `FieldConfig[]` is translated into a JSON Schema object (`buildJsonSchema`) at validation time rather than stored as JSON Schema directly. This keeps the form's stored representation (`FieldConfig[]`) simple and UI-friendly, while still getting a real, spec-compliant validator (required fields, length/value bounds, email format, enum) instead of hand-rolled validation logic. `additionalProperties: false` rejects submission keys that don't correspond to a real field.

- **Publish-locks-the-form, no edit-after-publish** — once a form is published, both the `Form` and its `FormVersion` become read-only at the API level. This was a deliberate simplification: Locking is simple, defensible, and keeps versioning unambiguous.

- **Thin Express modules, one folder per concern** — `forms/`, `public/`, `submissions/`, `validation/` each have their own `*.controller.ts` / `*.service.ts` / `*.routes.ts`. Controllers parse the request and shape the response; services own the Prisma calls and business rules. This isn't was deliberate for consistence

- **Rendering driven entirely by configuration, in two layouts** — `FormRenderer` takes a `FieldConfig[]` and a `layout` (`standard` = vertical, `compact` = horizontal) and renders every supported field type without any per-form custom code. Validation is deliberately *not* duplicated client-side (beyond the native `required` attribute, which is presentational) — AJV on the backend is the single source of truth for what's valid, so there's exactly one place that logic can drift.

- **Number fields validate digit count, not numeric value — `min`/`max` on a number field validate digit count (`minLength`/`maxLength` against a `^[0-9]+$` pattern), and the value is kept as a string end-to-end so leading zeros survive. This was an explicit choice so that the number field can be used for things like phone numbers — see Trade-Offs.

---

## Trade-Off Analysis

### Simplifications made

- Published forms are permanently locked rather than supporting a "create new draft from published form" flow
- No authentication/authorization layer — anyone with the URL can create, publish, or view any form.
- No pagination on `GET /api/forms` or `GET /api/forms/:id/submissions` 

### Intentionally excluded

- Client-side validation duplication (see Key Design Decisions) — AJV on the backend is the single source of truth.
- A "checkbox group" (multi-value checkbox) field type — `checkbox` is defined as a single boolean toggle that can be used for things like "agree to terms and conditions"; a multi-choice list is already covered by `select`.

### What I'd add or change with more time

- Basic auth (even a single shared admin token) so the builder isn't fully public.
- A true "republish" flow — create version 2 of a form while preserving version 1 and its historical submissions, instead of locking forms permanently.
- Pagination and search on the forms list and submission list once either could realistically grow large.
- Export submissions as CSV from the Submission List page.

---

## AI Usage Disclosure

### Tools Used

- ChatGPT (Software architecture GPT)

### Usage

- Assessment understanding and idea polishing
- Architecture planning and phase-by-phase implementation planning, working from the assignment and a pre-written implementation plan I prepared

- Claude Code (Claude Sonnet 4.6)

### Usage

- Code generation for both backend (Express/Prisma/AJV) and frontend (React/TanStack Query/React Hook Form) following that plan
- Code pushing to github
- Error fixing - any errors encountered during testing were mostly redirected to claud cose to fix
- Documentation drafting, including this README

### Verification

Every phase was manually reviewed before moving to the next, and verified concretely rather than taken on faith:

- `tsc`/`tsc -b` and `vite build` run clean before any phase was considered done
- Every backend endpoint was exercised with real `curl` requests against a real PostgreSQL database (success and failure paths — wrong types, missing required fields, out-of-range values, 404s), with test data deleted afterward

