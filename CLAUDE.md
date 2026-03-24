# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run test-db  # Test database connection
```

No test suite exists (`npm test` exits with error). No linter configured.

## Required `.env` Variables

```
PORT=5000
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:3000
MAIL_USERNAME=
MAIL_PASSWORD=
NODE_ENV=development
```

SSL is auto-disabled for `localhost`/`127.0.0.1` DB hosts and enabled for all others (RDS).

## API Routes

```
POST   /api/users/register
GET    /api/users/
GET    /api/users/:id
PUT    /api/users/:id          (requireAuth)
DELETE /api/users/:id          (requireAuth)

POST   /api/auth/login
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/request-password-reset
POST   /api/auth/reset-password
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/logout
GET    /api/auth/current-user

GET    /api/health
```

## Field Name Mismatch: DB vs API

The `GET /api/auth/current-user` response uses **legacy frontend field names**, not the DB column names:

| DB column         | API response key  |
|-------------------|-------------------|
| `full_name`       | `name`            |
| `programme`       | `program`         |
| `experience_level`| `level`           |

All other endpoints (register, update, etc.) use the DB field names (`full_name`, `programme`, `experience_level`).

## Legacy Compatibility Middleware

`src/middleware/compatibility.js` runs on every request and handles two concerns:

1. **Route aliasing** — rewrites old `/users/*` and `/oauth2/*` paths to the canonical `/api/*` paths (e.g. `POST /users/login` → `/api/auth/login`).
2. **Payload transformation** — for `POST /users/new_member` (old registration endpoint), maps `name→full_name`, `program→programme`, and `LOW/MID/HIGH→Beginner/Intermediate/Advanced`.

## Auth Flow

**Email/password:** Register → 6-digit code emailed (15 min TTL, stored in `verification_code` + `verification_code_expires`) → verify → auto-login session created.

**Google OAuth:** The callback URL is built dynamically from the `Host` header at request time (supports Amplify preview URLs + custom domain simultaneously). Passport config is in `src/config/passport.js`. After OAuth, users with incomplete profiles (`programme` or `experience_level` null) are redirected to `dashboard.html?action=complete_profile`.

**Sessions:** Stored in PostgreSQL `session` table via `connect-pg-simple`. `createTableIfMissing: true` auto-creates the table on startup. Session cookie is 30 days, `sameSite: 'lax'`, `secure: false` (proxy handles HTTPS termination).

## Database Sync

`server.js` calls `sequelize.sync()` (no `alter`/`force`) on startup — safe for production but won't apply schema changes. Use `{ alter: true }` locally when adding columns. The commented-out line is intentional.

## Middleware Auth Guards

- `requireAuth` — 401 if not authenticated (Passport session check)
- `requireVerified` — 403 if `is_verified` is false
- `checkProfileComplete` — 403 if `programme` or `experience_level` is null (used for profile-gate scenarios)
