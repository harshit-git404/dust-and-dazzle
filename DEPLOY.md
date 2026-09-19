# Dust and Dazzle — Deployment Guide (Vercel & Supabase)

A step-by-step guide for deploying the **Dust and Dazzle** literary web application to **Vercel** with **Supabase**.

---

## 1. Prerequisites
- A **GitHub** account with access to the `dust-and-dazzle` repository.
- A **Vercel** account ([vercel.com](https://vercel.com)).
- A **Supabase** project ([supabase.com](https://supabase.com)) with:
  - Database migrations applied (`supabase/migrations/`).
  - Storage bucket `story-media` created (Public read, author write).
  - Your author user ID added to the `public.authors` table.

---

## 2. Supabase Authentication URL Configuration
Before deploying, configure the redirect and site URLs in Supabase so author authentication works on production:

1. Go to your **Supabase Dashboard** -> Select your Project.
2. Navigate to **Authentication** -> **URL Configuration**.
3. Set **Site URL** to your production domain (e.g., `https://dust-and-dazzle.vercel.app`).
4. Under **Redirect URLs**, add:
   - `https://dust-and-dazzle.vercel.app/**`
   - `https://dust-and-dazzle.vercel.app/admin`
   - `http://localhost:3000/**` (for local development)
5. Click **Save**.

---

## 3. Importing the Repository into Vercel

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select your Git provider (GitHub) and find the `dust-and-dazzle` repository. Click **"Import"**.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js` (automatically detected).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `npm run build` (leave default).
   - **Output Directory**: `.next` (leave default).
   - **Install Command**: `npm install` (leave default).

---

## 4. Environment Variables Configuration
Expand the **Environment Variables** section in Vercel and add the following keys (**do NOT commit real values to Git**):

| Variable Name | Description | Where to Find It |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard -> Project Settings -> API -> **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key | Supabase Dashboard -> Project Settings -> API -> Project API Keys -> **anon public** |
| `NEXT_PUBLIC_SITE_URL` | Production web application URL | Your Vercel domain (e.g., `https://dust-and-dazzle.vercel.app`) |
| `SITE_INDEXABLE` | Search engine indexing toggle | Set to `false` during preview/staging; set to `true` when ready for public search indexing |
| `IP_HASH_SALT` | Secret salt for rate-limiting IP hashing | Any random 32-character secret string (e.g. generated via `openssl rand -hex 16`) |

> ⚠️ **CRITICAL SECURITY NOTE**:
> **DO NOT** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables. The service role key is strictly for offline local administrative CLI scripts and must never exist in the production runtime.

---

## 5. Deploying the Project
1. Click the **"Deploy"** button.
2. Vercel will build the application, optimize assets, generate OpenGraph images, and deploy serverless routes globally.
3. Once the build finishes, you will receive your production URL.

---

## 6. Post-Deployment Verification Checklist

- [ ] **Frontispiece Page**: Visit `/` and ensure the book cover, typography, and dedication render cleanly.
- [ ] **Table of Contents**: Visit `/toc` and confirm all published chapters appear in correct sequence.
- [ ] **Story Reading**: Click on a chapter (e.g. `/story/the-forgotten-pillar`) and verify reading experience, drop caps, and theme toggle (Daylight / Candlelight).
- [ ] **Reader Reflections**: Test submitting a comment on a story page and verify it enters the pending queue.
- [ ] **Author Studio Login**:
  - Visit `/login` and sign in with your author email and password.
  - Verify redirection to `/admin`.
- [ ] **Story Editor & Photo Upload**:
  - Open a story in the editor (`/admin/story/[id]`).
  - Test uploading a photograph; verify client compression and that the archival photo plate displays correctly.
- [ ] **Health Check & Supabase Keep-Alive Cron**:
  - Visit `https://your-domain.vercel.app/api/health` in your browser.
  - Verify JSON response: `{"status":"healthy","database":"connected"}`.
  - In Vercel Dashboard -> **Settings** -> **Cron Jobs**, confirm that the daily cron `/api/health` (`0 5 * * *`) is registered.
- [ ] **Security Headers**: Check your domain with [securityheaders.com](https://securityheaders.com) to verify CSP, HSTS, and X-Content-Type-Options headers.

---

## 7. Backups and Disaster Recovery
See [README.md](file:///c:/Users/harsh/Desktop/Web%20Dev/dust-and-dazzle/README.md) for instructions on creating one-click JSON/Markdown backups from the Author Studio and restoring them to the database.
