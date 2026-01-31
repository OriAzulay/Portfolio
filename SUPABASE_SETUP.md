# Supabase Setup Guide

Follow these steps to set up Supabase for your portfolio.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project (choose a name and password)
4. Wait for the project to be ready (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste this SQL and click "Run":

```sql
-- Create the portfolio table
CREATE TABLE portfolio (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable Row Level Security
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the portfolio data (public website)
CREATE POLICY "Allow public read" ON portfolio
  FOR SELECT USING (true);

-- Allow authenticated users to update (for admin dashboard)
-- For simplicity, we'll allow all updates (protected by your admin password)
CREATE POLICY "Allow all updates" ON portfolio
  FOR ALL USING (true);

-- Insert default data
INSERT INTO portfolio (id, data, updated_at) VALUES (
  1,
  '{
    "personalInfo": {
      "name": "Your Name",
      "title": "Software Developer",
      "avatarUrl": "",
      "email": "your.email@example.com",
      "phone": "+1 234 567 8900",
      "location": "Your City, Country",
      "about": "I am a passionate Software Developer with expertise in building modern web applications.",
      "social": {
        "github": "https://github.com/yourusername",
        "linkedin": "https://linkedin.com/in/yourusername",
        "twitter": "",
        "instagram": ""
      },
      "stats": {
        "yearsExperience": "3+",
        "projectsCompleted": "15+",
        "certificationsAwards": "5+"
      }
    },
    "skills": [
      {"name": "JavaScript", "level": 90},
      {"name": "TypeScript", "level": 85},
      {"name": "React", "level": 90},
      {"name": "Next.js", "level": 80}
    ],
    "experience": [
      {
        "title": "Software Developer",
        "company": "Company Name",
        "period": "2023 - Present",
        "description": "Developing and maintaining web applications."
      }
    ],
    "education": [
      {
        "degree": "Bachelor in Computer Science",
        "school": "University Name",
        "period": "2017 - 2021"
      }
    ],
    "projects": [],
    "gallery": []
  }'::jsonb,
  NOW()
);
```

## Step 4: Create Storage Bucket for Images

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Name it: `portfolio-images`
4. Check "Public bucket" ✅
5. Click "Create bucket"

After creating, set the policy:
1. Click on the `portfolio-images` bucket
2. Go to **Policies** tab
3. Click "New Policy" → "For full customization"
4. Create these policies:

**Policy 1 - Allow public read:**
- Name: `Allow public read`
- Allowed operation: SELECT
- Target roles: (leave empty for all)
- Policy definition: `true`

**Policy 2 - Allow uploads:**
- Name: `Allow uploads`
- Allowed operation: INSERT
- Target roles: (leave empty for all)
- Policy definition: `true`

## Step 5: Update Your Environment Variables

Add these to your `.env.local` file:

```
ADMIN_PASSWORD=ori1019
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase project URL and anon key.

## Step 6: For Vercel Deployment

In your Vercel project settings, add these environment variables:
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Done! 🎉

Your portfolio will now persist data in Supabase. Changes made in the admin dashboard will be saved to the database and visible to all visitors.


