# Time2Rate — Backend API

REST API for the Time2Rate researcher app. **Node + Express + Prisma + SQLite** —
runs with zero external services (no database server to install).

## Getting started

```bash
cd server
npm install
npm run prisma:migrate   # create the SQLite database (first time only)
npm run seed             # load demo data (studies, participants, prompt events)
npm run dev              # start API → http://localhost:4000
```

Demo login: **mariorossi@unimib.it / password123**

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the API with hot reload (tsx watch) |
| `npm run build` | Generate Prisma client + compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run prisma:migrate` | Apply migrations / create the DB |
| `npm run db:reset` | Drop and recreate the DB, then re-seed |
| `npm run seed` | Load demo data |

## API overview

All routes are under `/api`. Everything except `/auth/*` and `/health` requires a
`Authorization: Bearer <token>` header (obtained from login).

### Auth
- `POST /api/auth/register` — `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET  /api/auth/me` — current user

### Studies
- `GET    /api/studies` — list the current researcher's studies
- `POST   /api/studies` — create a draft (with default groups)
- `GET    /api/studies/:id` — full study (groups, schedules, notifications, consent, instructions, participants)
- `PATCH  /api/studies/:id` — update title/description/PI/status/dates
- `DELETE /api/studies/:id`
- `POST   /api/studies/:id/duplicate` — clone as a new draft
- `POST   /api/studies/:id/activate` — set active **and generate prompt events**

### Wizard sub-resources
- `POST/DELETE /api/studies/:id/schedules[/:scheduleId]` — scheduling rules + sampling windows
- `POST/DELETE /api/studies/:id/notifications[/:notifId]`
- `POST/DELETE /api/studies/:id/consent[/:docId]`
- `POST/DELETE /api/studies/:id/instructions[/:docId]`

### Participants
- `POST   /api/studies/:id/participants` — invite (`{ emails[], condition, isTester }`; condition = groupId or `"random"`)
- `GET    /api/studies/:id/participants/:pid` — details + response history
- `POST   /api/studies/:id/participants/:pid/responses` — simulate a response, recompute compliance
- `DELETE /api/studies/:id/participants/:pid`

## Scheduling engine

`src/modules/scheduling/scheduling.service.ts` is the core domain logic. On activation it
expands each **time-contingent** schedule rule (number-of-days or specific-dates, per group)
into one `PromptEvent` per participant per sampling window per day. **Compliance** is then
`responded / total` prompt events, mapped to Alta / Media / Bassa / Inattivo.

Event-contingent rules are participant-triggered, so no events are pre-generated.

## Not included in this version (stubbed)

Push notifications (Firebase) and email (SendGrid/Postmark) are logged, not sent —
see `src/modules/notifications/notifications.service.ts`. The scheduling engine runs
inline on activation rather than via a background queue (BullMQ/Redis).

## Moving to PostgreSQL

Change the `datasource` provider in `prisma/schema.prisma` to `postgresql`, set
`DATABASE_URL` to your Postgres connection string, and re-run `prisma migrate`. No app
code changes needed.
