# Wedding Invitation (Armenian) — Fullstack

Frontend: React + TanStack Start + Vite + Tailwind
Backend: NestJS + TypeORM + PostgreSQL
Run: Docker Compose (Postgres + NestJS), npm dev (Vite frontend)

---

## 1. Prerequisites

- Node.js 20+
- Docker + Docker Compose
- bun (or npm/pnpm)

## 2. First run

```bash
# 1. Create env files
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Start database
docker compose up -d --build postgres
# This starts:
#   - postgres on localhost:5432
# On first start the seed runs automatically and creates an admin:
#   email:    admin@example.com
#   password: changeme123
# (change these in .env BEFORE first start, or change them later in DB)

# 3. Start backend (choose one)
# Option A: via Docker (recommended)
#   docker compose up -d --build backend
# Option B: run locally (requires Postgres from step 2)
#   npm --prefix backend install
#   npm --prefix backend run seed
#   npm --prefix backend run start:dev

# 4. Start frontend
bun install
bun dev
# Open http://localhost:3000
```

## 3. Admin

1. Open http://localhost:3000/admin
2. Login: admin@example.com / changeme123 (or whatever you set in `.env`)
3. Edit settings, events; view RSVPs.

To create extra admins, sign up via the admin page and then promote in DB:

```bash
docker compose exec postgres psql -U wedding -d wedding -c \
  "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

## 4. Project layout

```
/                  Vite + TanStack Start frontend
/backend           NestJS API (own package.json, own Dockerfile)
docker-compose.yml Postgres + backend
```

The frontend talks to the backend over REST. Configure `VITE_API_URL`
in `.env` (default: `http://localhost:3001/api`).

## 4.1 Run frontend and backend separately

Frontend (from repo root):

```bash
npm install
npm run dev:frontend
```

Backend (from repo root):

```bash
npm --prefix backend install
npm run dev:backend
```

## 5. API endpoints

Public:
- `GET  /api/settings`     — wedding settings
- `GET  /api/events`       — list events
- `POST /api/rsvps`        — submit an RSVP
- `POST /api/auth/login`   — `{ email, password }` → `{ token, user }`
- `POST /api/auth/signup`  — `{ email, password }` → `{ token, user }`
- `GET  /api/auth/me`      — current user (Bearer token)

Admin (require `Authorization: Bearer <token>` and `role=admin`):
- `PUT    /api/settings/:id`
- `POST   /api/events`
- `PUT    /api/events/:id`
- `DELETE /api/events/:id`
- `GET    /api/rsvps`
- `DELETE /api/rsvps/:id`

## 6. Deploy to your VPS

1. SSH into your server, install Docker and Docker Compose.
2. `git clone` the repo.
3. Edit `.env` and `backend/.env` — set strong `JWT_SECRET`, `DB_PASSWORD`,
   `SEED_ADMIN_PASSWORD`, and `CORS_ORIGIN=https://your-frontend-domain`.
4. `docker compose up -d --build`
5. Build the frontend and serve it from any static host (Nginx, Caddy, Vercel, etc.):

   ```bash
   bun install
   VITE_API_URL=https://api.your-domain.com/api bun run build
   # output is in dist/ — serve it with nginx/caddy
   ```

6. Point your domain at the static frontend, and `api.your-domain.com` →
   `localhost:3001` (reverse proxy, e.g. nginx or Caddy).

## 7. Notes

- Database schema is auto-synchronized by TypeORM (`synchronize: true`) on startup.
  For real production, switch to migrations.
- `gallery_images` is a JSON array of image URLs — use any image host (S3, ImgBB, etc.).
- The `src/integrations/supabase/` folder is not used and can be deleted if
  you don't need it. It's left in place to keep the Lovable sandbox happy.
