# Portfolio

A modern, customizable personal portfolio website built with Next.js and Supabase. Features a sleek card-based design with an admin dashboard for easy content management.

## Summary

This portfolio application provides:

- **Public Portfolio** — A responsive, animated portfolio showcasing your profile, skills, experience, projects, and gallery
- **Admin Dashboard** — A protected interface to edit all portfolio content in real-time
- **Cloud Storage** — Supabase integration for persistent data storage and image uploads
- **Modern Stack** — Built with Next.js 16, React 19, TypeScript, and custom CSS

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   ADMIN_PASSWORD=your-secure-password
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase**
   
   Follow the instructions in `SUPABASE_SETUP.md` to:
   - Create the database table
   - Create the storage bucket for images
   - Configure storage policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Portfolio: http://localhost:3000
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard

---

## Architecture

```
Portfolio/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/login/         # Authentication endpoint
│   │   └── upload/             # Local file upload endpoint
│   ├── dashboard/              # Admin dashboard page
│   ├── lib/                    # Shared utilities
│   │   ├── auth.ts             # Client-side auth helpers
│   │   ├── portfolio-data.ts   # Data types & Supabase functions
│   │   └── supabase.ts         # Supabase client configuration
│   ├── login/                  # Login page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout with fonts
│   └── page.tsx                # Main portfolio page
├── public/
│   └── uploads/                # Local image uploads (git-ignored)
└── .env.local                  # Environment variables (git-ignored)
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Next.js   │────▶│  Supabase   │
│  (React)    │◀────│   Server    │◀────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Supabase   │
                    │   Storage   │
                    └─────────────┘
```

---

## Implementation Details

### Authentication

- **Password-based login** via `/api/auth/login`
- Password stored in `ADMIN_PASSWORD` environment variable
- Client-side token stored in localStorage
- Dashboard protected by auth check on page load

```typescript
// app/lib/auth.ts
export function isAuthenticated(): boolean {
  // Checks for valid auth token in localStorage
}
```

### Data Storage

Portfolio data is stored in Supabase with localStorage as a fallback cache:

| Layer | Purpose |
|-------|---------|
| Supabase Database | Primary persistent storage (JSON column) |
| localStorage | Offline cache & fallback |

```typescript
// Data structure (app/lib/portfolio-data.ts)
interface PortfolioData {
  personalInfo: { name, title, email, phone, location, about, social, stats }
  skills: Array<{ name, level }>
  experience: Array<{ title, company, period, description }>
  education: Array<{ degree, school, period }>
  projects: Array<{ title, description, tags, link, imageUrl }>
  gallery: Array<{ title, description, imageUrl }>
}
```

### Image Uploads

Images are uploaded to Supabase Storage:

1. User selects file in dashboard
2. `uploadImageToSupabase()` uploads to `portfolio-images` bucket
3. Public URL is returned and saved to portfolio data
4. Images are served directly from Supabase CDN

### Styling

- Custom CSS in `globals.css` (no Tailwind utility classes in components)
- CSS custom properties for theming (colors, shadows, transitions)
- Responsive design with mobile-first breakpoints
- Dark theme with gradient accents

Key CSS sections:
- `#SIDEBAR` — Profile card styling
- `#NAVBAR` — Navigation tabs
- `#PORTFOLIO` — Project cards grid
- `#GALLERY` — 3D card hover effects
- `#ADMIN DASHBOARD` — Dashboard-specific styles

### Pages

| Route | Description |
|-------|-------------|
| `/` | Public portfolio with tabbed sections |
| `/login` | Admin login form |
| `/dashboard` | Content management interface |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Validate admin password, return token |
| `/api/upload` | POST | Upload image to local filesystem (fallback) |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Password for dashboard access |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Supabase | 2.93.3 | Database & file storage |
| DOMPurify | 3.3.1 | HTML sanitization |

---

## License

MIT
