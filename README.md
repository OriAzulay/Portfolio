# Portfolio

A personal portfolio site with an admin dashboard, built with **Next.js 16 (App Router)**, **TypeScript** and **SQLite**.
All content, uploaded images and contact-form messages are stored in a single SQLite file, so you don't need any external database service.

## Features

- Public portfolio: About, Resume, Projects, Contact and Gallery tabs
- Admin dashboard at `/dashboard` to edit every section, upload images and reorder items
- Contact form with client- and server-side validation, a honeypot field and per-IP rate limiting. Messages go to a **Messages** inbox in the dashboard.
- Images are stored in SQLite and served from `/api/images/<id>` with long-lived cache headers
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

The database (`data/portfolio.db`) is created automatically on first request.

### Environment variables

| Variable         | Required        | Description                                                                 |
| ---------------- | --------------- | --------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | yes             | Password for `/login`                                                       |
| `SESSION_SECRET` | yes (prod)      | 32+ random characters; signs the session cookie and salts IP hashes         |
| `DATABASE_PATH`  | no              | Path to the SQLite file. Defaults to `./data/portfolio.db`                  |

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
| `npm run db:migrate-supabase` | One-time import from the old Supabase setup (below)  |

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
│   ├── db/                 #   SQLite connection + versioned migrations
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

The tables are `portfolio_sections` (one JSON row per section), `images` (BLOB + MIME type), `contact_messages` and `visits`.
Schema changes go in `src/server/db/migrations.ts`. Append a new entry and it runs once on startup (tracked with `PRAGMA user_version`).

**Backup:** copy `data/portfolio.db` while the app is stopped, or run `sqlite3 data/portfolio.db ".backup backup.db"`.

## Deployment (Railway, recommended)

SQLite needs a **persistent disk**, so deploy to a host that gives you one.

1. Push this repo to GitHub.
2. On [railway.com](https://railway.com): **New Project → Deploy from GitHub repo**, and pick this repo.
   Railway reads `railway.json`, which sets the build to `npm run build`, the start command to `npm run start` and a healthcheck on `/`. The Node version comes from `.nvmrc` (22).
3. **Add a Volume** to the service (right-click the service → *Attach volume*) and set its mount path to `/data`.
4. Under **Variables**, set:
   - `DATABASE_PATH=/data/portfolio.db`
   - `ADMIN_PASSWORD=<your password>`
   - `SESSION_SECRET=<64 random hex chars>`
5. Under **Settings → Networking**, click *Generate Domain* (or add your own domain).
6. Deploy, open `/login`, and fill in your content.

Keep the service at **1 replica**. SQLite is a single file on a single volume.

### Alternative: Render

Create a **Web Service** from the repo with build command `npm install && npm run build` and start command `npm start`.
Add a **Persistent Disk** mounted at `/data`. Persistent disks require a paid instance; the free tier wipes the filesystem on every deploy.
Set the same variables as on Railway.

### Why not Vercel?

Vercel runs the app as serverless functions with a temporary, read-only filesystem. A SQLite file there would be lost on every deploy and cold start, and wouldn't be shared between instances. To use Vercel you'd have to switch to a hosted database (e.g. Turso, Neon) and object storage for images. That's possible, but it's exactly the external-service setup this project avoids.

## Migrating from the old Supabase version

If your content is still in Supabase, run this once with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` still in `.env.local`:

```bash
npm run db:migrate-supabase
```

It copies the portfolio content and visitor rows. It also downloads every image (from Supabase Storage or `public/uploads/`) into SQLite.
Afterwards you can remove the `SUPABASE_*` lines from `.env.local` and delete `public/uploads/`.
Visitor hashes from Supabase used a different salt, so a returning visitor may be counted once more.

## Troubleshooting

- **API routes return 404 in `npm run dev` right after `npm run build`:** delete the `.next` folder and restart the dev server.
- **`SESSION_SECRET must be set` in production:** add a secret of at least 32 characters (see above).
