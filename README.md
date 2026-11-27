# Portfolio

A personal portfolio site with an admin dashboard, built with **Next.js 16 (App Router)**, **TypeScript** and **SQLite (libSQL)**.
All content, uploaded images and contact-form messages live in one SQLite database: a local file during development, and a free [Turso](https://turso.tech) database (SQLite in the cloud) in production on Vercel.

## Features

- Public portfolio: About, Resume, Projects, Contact and Gallery tabs
- Admin dashboard at `/dashboard` to edit every section, upload images and reorder items
- Contact form with client- and server-side validation, a honeypot field and per-IP rate limiting. Messages go to a **Messages** inbox in the dashboard.
- Images are compressed on upload and stored in the database, served from `/api/images/<id>` and cached by the CDN
- Unique-visitor counter. Raw IPs are never stored, only keyed hashes.
- Signed, httpOnly session cookie for the admin (no tokens in localStorage)

## Quick start

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/login

Locally the database is the file `data/portfolio.db` (created automatically on first request, no account needed).

### Environment variables

| Variable         | Required        | Description                                                                 |
| ---------------- | --------------- | --------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | yes             | Password for `/login`                                                       |
| `SESSION_SECRET` | yes (prod)      | 32+ random characters; signs the session cookie and salts IP hashes         |
| `TURSO_DATABASE_URL` | prod       | Turso database URL (set automatically by the Vercel ↔ Turso integration)  |
| `TURSO_AUTH_TOKEN` | prod         | Turso auth token (same)                                                     |
| `DATABASE_PATH`  | no              | Local SQLite file when no Turso URL is set. Defaults to `./data/portfolio.db` |
| `RESEND_API_KEY` | no              | Also email new contact messages via [Resend](https://resend.com)            |
| `CONTACT_NOTIFY_EMAIL` | no        | Where those emails go (defaults to the email on your profile)             |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

| Script                        | What it does                                         |
| ----------------------------- | ---------------------------------------------------- |
| `npm run dev`                 | Dev server                                           |
| `npm run build` / `npm start` | Production build / server                            |
| `npm run lint`                | ESLint                                               |
| `npm run typecheck`           | TypeScript check                                     |
| `npm test` / `npm run test:ci` | Vitest (watch / single run)                        |
| `npm run db:optimize-images`  | Re-compress images already stored in the database    |
| `npm run db:push-remote`      | Copy all local data (`data/portfolio.db`) to Turso   |

## Tests & CI

Tests live in `__tests__/` (Vitest) and cover validation, sanitizing, the contact form (honeypot, rate limit), image processing and the GitHub mapping. Each test file uses its own throwaway SQLite database.
GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests and build on every push and pull request to `main`.

## Architecture

There is one Next.js app with strict layers. The backend code lives in `src/server` and can't be imported by client components (`server-only`). The frontend lives in `src/components`.

```
src/
├── app/                    # Routes only (thin)
│   ├── page.tsx            #   public portfolio (server component)
│   ├── login/, dashboard/  #   admin pages (session-checked on the server)
│   └── api/                #   HTTP handlers -> call services, map errors
├── server/                 # BACKEND (server-only)
│   ├── config.ts           #   env access
│   ├── db/                 #   libSQL client (local file or Turso) + migrations
│   ├── repositories/       #   SQL only (portfolio, images, messages, visits)
│   ├── services/           #   business logic, validation, sanitizing
│   ├── auth/               #   signed session cookie (jose)
│   └── http/               #   error mapping, client IP hashing, rate limit
├── components/             # FRONTEND
│   ├── ui/                 #   shared primitives (Panel, forms, icons...)
│   ├── portfolio/          #   public site (Sidebar, tabs, sections)
│   ├── dashboard/          #   admin editors + messages inbox
│   └── auth/               #   login form
├── lib/                    # Shared by both sides: zod schemas, API client, defaults
├── types/                  # Shared TypeScript types
└── styles/                 # tokens.css (design tokens) + globals.css (reset)
```

**Request flow:** `route.ts` → `services/*` (validate with zod, apply rules) → `repositories/*` (SQL) → SQLite.

**Styling:** each component has a co-located `*.module.css` (CSS Modules), so class names can't clash. Colors, fonts, sizes and shadows are CSS variables in `src/styles/tokens.css`. Change a token there and every component picks it up. Fonts (Poppins, Courgette) come from `next/font`.

### Database

The tables are `portfolio_sections` (one JSON row per section), `images` (BLOB + MIME type), `contact_messages`, `visits`, `settings` and `rate_limits`.
The same code talks to a local SQLite file (`file:`) or to Turso over HTTP, depending on whether `TURSO_DATABASE_URL` is set.
Schema changes go in `src/server/db/migrations.ts`. Append a new entry: it runs once, automatically, on the first request after a deploy (tracked in `schema_migrations`; statements are idempotent).

**Backup:** locally, copy `data/portfolio.db` while the app is stopped. On Turso, use `turso db shell <db> .dump > backup.sql` or Turso's point-in-time restore.

## Deployment (Vercel + Turso, free)

Vercel runs the site as serverless functions, which have no permanent disk, so production uses **Turso**: a hosted SQLite database with a free plan.

### 1. Create the database and connect it to Vercel

1. In the [Vercel dashboard](https://vercel.com/dashboard), open your project → **Storage** → **Create Database** (or **Browse Marketplace**) → choose **Turso** and follow the steps (free plan).
2. Connect it to this project (all environments). This adds `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to the project's environment variables automatically.
   *Alternative:* sign up at [turso.tech](https://turso.tech), create a database, and add those two variables by hand (Project → **Settings → Environment Variables**).

### 2. Add the other environment variables

Project → **Settings → Environment Variables**:

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | a strong password for `/login` |
| `SESSION_SECRET` | 64 random hex characters (command above) |
| `RESEND_API_KEY` | optional - email notifications for the contact form |

Optional for the GitHub tab: save a personal access token in the dashboard itself (it's stored encrypted with `SESSION_SECRET`, so keep that value stable).

### 3. Copy your local content to Turso

Create `.env.turso.local` (git-ignored) with the two Turso values from Vercel:

```bash
TURSO_DATABASE_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<token>
```

Then run:

```bash
npm run db:push-remote
```

It creates the tables on Turso and copies all content, images, messages and settings. It is safe to run again; nothing secret is printed.

### 4. Deploy

Merge to `main` (or redeploy in Vercel). The tables are created automatically on first request, and the site reads from Turso.

**Limits to know:**
- **Uploads:** Vercel rejects request bodies over about 4.5 MB. The dashboard shrinks bigger photos in the browser before uploading, and the server compresses them further, to WebP under about 500 KB.
- **Image caching:** images are served with long-lived cache headers, so repeat views are answered by Vercel's CDN without touching the database.

## Troubleshooting

- **API routes return 404 in `npm run dev` right after `npm run build`:** delete the `.next` folder and restart the dev server.
- **`SESSION_SECRET must be set` in production:** add a secret of at least 32 characters (see above).
