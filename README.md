# ✨ Portfolio Playground

Welcome to your **personal portfolio** built with Next.js — styled to match the sleek, card-based layout you wanted.  
Edit it through the admin dashboard, then show it off to the world. 🚀

## What’s inside

- **Sidebar + Tabs layout** inspired by iabhinav.me  
- **Admin dashboard** to edit everything (About, Resume, Projects, Contact, Gallery)
- **Local image uploads** for profile + projects
- **Data saved in your browser** (localStorage)

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

Uploads from the dashboard are saved to:

```
public/uploads/{avatar|project|gallery}/
```

These files are ignored in git (see `.gitignore`).

Note: If you deploy to a serverless host, local disk can be ephemeral.  
For production storage, use S3 or another object store.

---

## Bonus

Want to publish? Deploy on [Vercel](https://vercel.com/new).

Enjoy building your portfolio! 💼✨
