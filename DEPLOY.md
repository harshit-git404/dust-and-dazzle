# Dust and Dazzle — Deployment Guide (Vercel & Supabase)

A step-by-step guide for deploying the **Dust and Dazzle** literary web application to **Vercel** with **Supabase**.

🌐 **Production URL**: [https://dust-and-dazzle.vercel.app](https://dust-and-dazzle.vercel.app)

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
| `SMTP_HOST` | SMTP server host | e.g. `smtp.resend.com`, `smtp.gmail.com`, or your SMTP provider |
| `SMTP_PORT` | SMTP port (e.g. 587 or 465) | `587` for TLS / STARTTLS, `465` for SSL |
| `SMTP_USER` | SMTP authentication username | Your SMTP service account user / login |
| `SMTP_PASS` | SMTP authentication password | Your SMTP app password or API secret key |
| `NOTIFY_TO` | Reader comment alert recipient(s) | Comma-separated email addresses (e.g. `author@example.com`) |
| `SITE_URL` | Base site URL for admin links in emails | Production URL (e.g. `https://dust-and-dazzle.vercel.app`) |
| `NEXT_PUBLIC_FEATURE_READER_TOOLS` | Public share, continue reading, reading marks, keyboard navigation | Set to `true` to enable; defaults to `false` |
| `NEXT_PUBLIC_FEATURE_SEARCH` | Full-text indexed story search | Set to `true` to enable; defaults to `false` |
| `NEXT_PUBLIC_FEATURE_AUDIO` | In-browser narration player and audio recordings | Set to `true` to enable; defaults to `false` |
| `NEXT_PUBLIC_FEATURE_INSTALL` | PWA web app manifest & home screen installation | Set to `true` to enable; defaults to `false` |
| `NEXT_PUBLIC_FEATURE_READ_COUNTS` | Privacy-preserving aggregate read counts | Set to `true` to enable; defaults to `false` |
| `NEXT_PUBLIC_FEATURE_TIMELINE` | Chronological decade timeline page | Set to `true` to enable; defaults to `false` |

> ⚠️ **CRITICAL SECURITY NOTE**:
> **DO NOT** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables. The service role key is strictly for offline local administrative CLI scripts and GitHub Actions secrets, and must never exist in the production web runtime.

---

## 5. Notifications Setup (Reader Comment Alerts)
To receive email alerts whenever readers submit new reflections for moderation:

1. Obtain SMTP credentials from your email provider (e.g., Resend, SendGrid, Amazon SES, Brevo, or Gmail App Password).
2. Configure the SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_TO`, `SITE_URL`) in Vercel (**Settings** -> **Environment Variables**).
3. Test your SMTP configuration locally:
   ```bash
   npx tsx scripts/test-notification.ts
   ```
4. **Resilience & Flood Protection**:
   - Notifications run asynchronously in the background via Next.js `after()` (or a 5-second fire-and-forget fallback) so readers experience zero latency.
   - If SMTP is unconfigured or unavailable, comment submissions succeed normally without displaying any error to readers.
   - Anti-flood protection limits email notifications to 5 per hour while continuing to record all comments in the author dashboard.

---

## 6. Automated Weekly Backup (GitHub Actions)

The repository includes a strictly read-only automated weekly backup workflow (`.github/workflows/backup.yml`) that runs every Sunday at 03:00 UTC and can also be triggered manually.

### A. Configuring Repository Secrets in GitHub
1. Navigate to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **"New repository secret"** and add:
   - `SUPABASE_URL`: Your project URL (`https://your-project-ref.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key (from Supabase Dashboard -> **Project Settings** -> **API** -> **service_role secret**).

> 🔒 **PRIVACY & SECURITY WARNING**:
> Automated backup zip artifacts contain complete exports of all stories (including drafts and private stories), site settings, referenced media, and reader comments with emails. **The GitHub repository must remain PRIVATE at all times.**

### B. Downloading Backups
1. Go to the **Actions** tab in your GitHub repository.
2. Select the **"Automated Weekly Backup"** workflow.
3. Click on the latest workflow run.
4. Under **Artifacts**, download `backup-YYYY-MM-DD.zip` (retained for 90 days).

### C. Validating and Restoring a Backup
You can validate any backup zip without making database modifications using the dry-run flag:
```bash
npx tsx scripts/restore-from-backup.ts backup-2026-09-20.zip --dry-run
```

To execute a full restore (after reviewing):
```bash
npx tsx scripts/restore-from-backup.ts backup-2026-09-20.zip
```

---

## 7. Deploying the Project
1. Click the **"Deploy"** button.
2. Vercel will build the application, optimize assets, generate OpenGraph images, and deploy serverless routes globally.
3. Once the build finishes, you will receive your production URL.

---

## 8. Post-Deployment Verification Checklist

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
