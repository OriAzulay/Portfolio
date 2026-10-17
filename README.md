# ✨ Portfolio Playground

Welcome to your **personal portfolio** built with Next.js — styled to match the sleek, card-based layout you wanted.  
Edit it through the admin dashboard, then show it off to the world. 🚀

## What’s inside

- **Sidebar + Tabs layout** inspired by iabhinav.me  
- **Admin dashboard** to edit everything (About, Resume, Projects, Contact, Gallery)
- **Local image uploads** for profile + projects
- **Data saved in Supabase** (database + storage)
- **Unique visitor counter** (hashed IPs, no duplicates)

---

## Quick Start

```bash
npm run dev
```

Then open:
- **Portfolio:** http://localhost:3000  
- **Admin login:** http://localhost:3000/login  
- **Dashboard:** http://localhost:3000/dashboard

---

## Admin Login

Create a `.env.local` file:

```bash
ADMIN_PASSWORD=your-secure-password
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=portfolio-assets
```

Use that password on the login page to edit your portfolio.
It’s also used to authorize image uploads.

---

## Where to edit

- Main UI: `app/page.tsx`
- Dashboard: `app/dashboard/page.tsx`
- Styles: `app/globals.css`
- Data schema: `app/lib/portfolio-data.ts`
- Upload API: `app/api/upload/route.ts`

---

## Fonts & Assets

The CSS expects fonts at:

```
public/assets/fonts/courgette/
public/assets/fonts/poppins/
```

If you don’t add them, it will fall back to system fonts.

---

## Image uploads

Uploads from the dashboard are saved to Supabase Storage:

```
portfolio-assets/{avatar|project|gallery}/
```

Local `public/uploads/` is ignored in git for development artifacts.

---

## Supabase setup (free tier)

1. Create a Supabase project.
2. Create a Storage bucket named `portfolio-assets` (public).
3. Create a table:

```sql
create table if not exists public.portfolio_data (
  id bigint primary key,
  data jsonb not null
);
```

4. Create a visitors table:

```sql
create table if not exists public.visits (
  ip_hash text primary key,
  created_at timestamptz default now()
);
```

5. Insert a default row:

```sql
insert into public.portfolio_data (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
```

6. Add env vars in production (Vercel):
   - `ADMIN_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_BUCKET`

---

## Bonus

Want to publish? Deploy on [Vercel](https://vercel.com/new).

Enjoy building your portfolio! 💼✨
