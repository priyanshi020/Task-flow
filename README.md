# TaskFlow

A small full-stack task board (Trello-lite) built for the TaskFlow take-home assignment.

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)

## Project structure

```
taskflow/
  server/     Express API + SQLite database
  client/     React + TypeScript frontend
```

## Prerequisites

- Node.js 18+ and npm

## Setup (from a fresh clone)

Open two terminals — one for the backend, one for the frontend.

### 1. Backend

```bash
cd server
npm install
npm run setup      # creates the schema and loads seed data
npm run dev        # starts the API on http://localhost:4000
```

`npm run setup` runs the schema (`src/db/schema.sql`) against a fresh SQLite file at
`server/src/db/taskflow.sqlite` and loads demo data (one board, three columns, seven tasks).
Safe to re-run any time you want to reset to a clean state.

### 2. Frontend

```bash
cd client
npm install
npm run dev         # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` requests to the backend
on port 4000 (see `client/vite.config.ts`), so there's no CORS setup needed locally.

### Running backend tests

```bash
cd server
npm test
```

Tests run against a separate `test.sqlite` file (auto-created and cleaned up), so they never
touch your dev data.

## Database schema

See [`server/src/db/schema.sql`](server/src/db/schema.sql). Summary:

- `boards(id, name, created_at)`
- `columns(id, board_id → boards.id, name, position, created_at)`
- `tasks(id, column_id → columns.id, title NOT NULL, description, priority CHECK IN (Low/Medium/High), created_at)`

Foreign keys cascade on delete, and are enforced via `PRAGMA foreign_keys = ON` in
`server/src/db/connection.js` (SQLite has this off by default).

### The two required non-trivial queries

Both live in [`server/src/db/queries.js`](server/src/db/queries.js) and are exercised directly
in `server/tests/db.test.js`:

1. **`taskCountsPerColumn(boardId)`** — count of tasks per column on a board, using a
   `LEFT JOIN` + `GROUP BY` so empty columns still show up with count 0 (an `INNER JOIN` would
   silently drop them).
2. **`tasksByPriority(boardId, priority)`** — tasks with a given priority on a board, newest
   first, joining through `columns` to scope to one board and ordering by `created_at DESC`.

## API overview

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/boards/:id` | Board with columns and each column's tasks |
| GET | `/api/boards/:id/task-counts` | Task count per column (query #1) |
| GET | `/api/boards/:id/tasks?priority=High` | Tasks filtered by priority, newest first (query #2) |
| POST | `/api/tasks` | Create a task (`{ columnId, title, description?, priority? }`) |
| PUT | `/api/tasks/:id` | Edit a task's title/description/priority |
| PATCH | `/api/tasks/:id/move` | Move a task to a different column (`{ columnId }`) |
| DELETE | `/api/tasks/:id` | Delete a task |

## Decisions & assumptions

- **Single fixed board.** Multi-board support was out of scope, so the frontend hardcodes
  `BOARD_ID = 1` and the seed script always creates that board first. A "board list" screen
  would be the natural next step if that scope grew.
- **Move via dropdown, not drag-and-drop.** The brief explicitly said a working dropdown beats
  a broken drag-and-drop, so each task card has a `<select>` to move it between columns. This
  was a deliberate trade-off to keep the core rock solid within the time budget.
- **Priority defaults to Medium** if not supplied on create, since the requirement only made
  title mandatory.
- **Optimistic UI updates** for move/delete, with rollback + an error banner if the backend
  request fails — this keeps the board feeling responsive while still handling failures
  honestly rather than pretending they didn't happen.
- **Validation is duplicated client + server side.** The client blocks empty titles for instant
  feedback; the server re-validates independently (and is the actual source of truth — the
  test suite calls the API directly, not through the UI).
- **Search box** (filter by title) was implemented as the low-effort nice-to-have alongside the
  required priority filter, since it reuses the same filtering logic.

## What I'd improve with more time

- Drag-and-drop as the stretch goal, once the dropdown-based core was confirmed solid.
- A "task count per column" badge is already shown in each column header using the live task
  list length; wiring the header count to actually call the `/task-counts` endpoint (rather than
  deriving it from already-fetched data) would better showcase that query in the UI.
- Pagination/virtualization if a column ever holds hundreds of tasks.
- Basic frontend component tests (React Testing Library) alongside the backend test suite.

##Live Deployed URL-
https://taskflow-client-aroa.onrender.com
