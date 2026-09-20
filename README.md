# Dust and Dazzle: Tales from a Village and a City

A literary short story collection web application for author **Ajeet Kumar Singh**.

Designed with the quiet elegance of a hand-bound memoir—aged rag paper textures, Playfair Display & Newsreader typography, Diya gold accents, washi tape photo plates, and a continuous flow of 16 chapters.

🌐 **Live Website**: [https://dust-and-dazzle.vercel.app](https://dust-and-dazzle.vercel.app)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+

### 2. Clone & Install Dependencies

```bash
git clone git@github.com:harshit-git404/dust-and-dazzle.git
cd dust-and-dazzle

# Install project packages
npm install
```

### 3. Configure Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:

```env
# Supabase Public API URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Search Engine Indexing Toggle (default: false)
SITE_INDEXABLE=false

# Secret Salt for Reader Comment IP Rate Limiting
IP_HASH_SALT=your-random-secret-salt-here

# ------------------------------------------------------------------------------
# LOCAL OFFLINE CLI SCRIPTS ONLY (NEVER SET IN VERCEL)
# ------------------------------------------------------------------------------
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Building for Production

```bash
npm run build
npm run start
```

---

## 📖 Public Pages & Routing

- `/` — **Book Cover & Frontispiece**: Title, subtitle, author byline, dedication, frontispiece archival photo plate, and direct reading entrance.
- `/toc` — **Table of Contents**: Continuous chronological index of all 16 story chapters.
- `/story/[slug]` — **Story Reading Experience**: Distraction-free 680px reading column, candlelight reading mode toggle, drop caps, reader reflections, sequential next/previous navigation, author notes, audio narration, and share actions.
- `/search` — **Full-Text Search**: Fast, indexed manuscript search with safe keyword highlighting and title fallbacks.
- `/timeline` — **Decade Timeline**: Chronological journey across decades through village memories and city migration.
- `/admin/book` — **Print-Ready Keepsake Book**: CSS paged media preview & PDF export formatted in 6x9, A5, and A4 trim sizes with mirrored margins, running headers, dedication, and colophon.
- `/login` — **Author Studio**: Private author authentication.
- `/admin` — **Author Dashboard**: Manuscript management, reordering, visibility toggling, backups, live word counts, and approximate read statistics.
- `/admin/story/[id]` — **Tiptap Story Editor**: Rich text editor with autosave, crash recovery, Word paste cleanup, photo uploads, audio narration recording, writing prompts spark popover, and live preview.
- `/admin/comments` — **Comment Moderation**: Author approval queue for reader reflections.
- `/admin/media` — **Media Library**: Archival photograph and audio recording manager.
- `/admin/settings` — **Site Settings**: Dedication, author biography, and frontispiece portrait editor.

---

## 💾 Backups and Disaster Recovery

### 1. Automated Weekly Backups (GitHub Actions)
The repository runs `.github/workflows/backup.yml` every Sunday at 03:00 UTC, exporting stories, site settings, media, and comments into a 90-day retained zip artifact.

### 2. Manual Export & Restore
To export manually or run a dry-run validation:
```bash
# Read-only export to backup-YYYY-MM-DD.zip
npx tsx scripts/export-backup.ts

# Dry-run validation (non-destructive)
npx tsx scripts/restore-from-backup.ts backup-2026-09-20.zip --dry-run

# Restore (upsert mode)
npx tsx scripts/restore-from-backup.ts backup-2026-09-20.zip
```

---

## 🚢 Deployment Guide

For complete step-by-step instructions on deploying to **Vercel** and configuring **Supabase**, refer to:

👉 **[DEPLOY.md](file:///c:/Users/harsh/Desktop/Web%20Dev/dust-and-dazzle/DEPLOY.md)**

---

## 📜 Development Roadmap

- [x] **Phase 1**: Project Setup, Design System, Public Pages & Sample Chapters
- [x] **Phase 2**: Supabase Database Setup & Author Login
- [x] **Phase 3**: Author Studio Dashboard & Tiptap Editor with Autosave
- [x] **Phase 4**: Photo Uploads & Reader Comment Moderation
- [x] **Phase 5**: Polish, Security Hardening, A11y & Deployment Prep
- [x] **Phase 6**: "Heirloom" Keepsake Edition (Print Book, Search, Audio, PWA, Reader Tools, Backups, Timeline, Prompts)

---

## 📄 License & Literary Copyright

&copy; 2026 Ajeet Kumar Singh. All literary rights reserved.
