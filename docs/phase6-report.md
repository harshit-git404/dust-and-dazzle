# Phase 6: "HEIRLOOM" — Engineering & Delivery Report

**Project**: Dust and Dazzle (`dust-and-dazzle`)  
**Branch**: `heirloom`  
**Tags**: `heirloom-backup`, `heirloom-author-note`, `heirloom-reader-tools`, `heirloom-book`, `heirloom-search`, `heirloom-audio`, `heirloom-install`, `heirloom-read-counts`, `heirloom-timeline`, `heirloom-prompts`, `heirloom-complete`  
**Date**: September 20, 2026  

---

## 1. Feature Status Breakdown

| # | Feature | Status | Description & Implementation Notes |
|---|---|---|---|
| **1** | **Automated Weekly Backup** | **Done** | Strictly read-only export script (`scripts/export-backup.ts`), GitHub Actions workflow (`.github/workflows/backup.yml`) scheduled Sundays at 03:00 UTC with 90-day artifact retention, and dry-run flag (`--dry-run`) in `scripts/restore-from-backup.ts`. Guarded via `ALLOW_READONLY_EXPORT_IN_CI=1`. |
| **2** | **Author's Note per Story** | **Done** | Migration `20260920000005_heirloom_author_note.sql` adding nullable `author_note` with 1200 character CHECK constraint. Editor sidebar field with live character counter, autosave, and local backup recovery. Public story page displays calm italic block with Diya divider and safe paragraph breaks. Included in backups. |
| **3** | **Reader Tools** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_READER_TOOLS`. Native Web Share API with WhatsApp / Copy Link fallback. `localStorage` reading progress tracking (scroll between 5% and 90%), home page "Continue Reading" banner, `/toc` read ticks (scrolled past 90%), Left/Right keyboard story navigation with `aria-keyshortcuts`, and end-of-story navigation card with estimated reading time. |
| **4** | **Print-Ready Book** | **Done** | Author-only `/admin/book` with `noindex`. Configurable chapter selection, trim sizes (6x9 in default, A5, A4), B&W/color photo modes, toggles for cover, dedication, bio, portrait, TOC, author notes, and colophon. Built with CSS Paged Media `@page`, mirrored margins, running headers, chapter drop caps, thin photo borders, and client-side dynamic print generation. |
| **5** | **Search** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_SEARCH`. Migration `20260920000006_heirloom_search.sql` adding `content_text` tag-stripping trigger, GIN `tsvector` index, and `search_published_stories` RPC with `SECURITY INVOKER`. Safe React snippet highlighter (tokenized into JSX without `dangerouslySetInnerHTML`), ILIKE title fallback, `/search` page, and navigation icon. |
| **6** | **Audio "In His Own Voice"** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_AUDIO`. Migration `20260920000007_heirloom_audio.sql` creating `story-audio` bucket (30MB limit, author-only write/delete) and story columns. Browser-direct upload bypassing Vercel body limits, built-in `MediaRecorder` voice recording/playback/replace/delete, vintage radio player with speed controls, 15s skip, seek bar, MediaSession API, and strict CSP configuration. |
| **7** | **Installable on Phone (PWA)** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_INSTALL`. Web App Manifest (`app/manifest.ts`) configured with standalone display, theme/background design tokens, dynamic 192/512/maskable icons (`app/icon.tsx`, `app/apple-icon.tsx`), and Apple Web App meta tags. Strictly no Service Worker or offline caching to preserve freshness and privacy. |
| **8** | **Private Read Counts** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_READ_COUNTS`. Migration `20260920000008_heirloom_read_counts.sql` creating `story_reads` table, author-only RLS, and `record_story_read` RPC (500 reads/day cap). Client requires 30s dwell time + 40% scroll + DNT check. Author dashboard displays total & 30-day reads with an SVG sparkline labeled "Reads (approximate)". |
| **9** | **Timeline** | **Done** | Gated by `NEXT_PUBLIC_FEATURE_TIMELINE`. `/timeline` page and navigation link rendered only when at least 3 published stories have a year set (otherwise returns 404). Vertical old-book timeline with decade markers, responsive cards, and clean typography. |
| **10** | **Writing Prompts** | **Done** | Author-only "Need a spark?" popover in Tiptap editor. 40 warm, nostalgic, non-intrusive prompts in `src/content/writing-prompts.ts` spanning village memories, journeys, food, festivals, crafts, and kindness. Strictly client-side assistance; never inserts text or modifies database. |

---

## 2. Migration Files in Sequence

All migrations are purely **additive and idempotent** (`IF NOT EXISTS`, `CREATE OR REPLACE`), and adhere strictly to zero-downtime fail-soft queries:

| File | One-Line Purpose | Rollback SQL Note |
|---|---|---|
| `supabase/migrations/20260920000005_heirloom_author_note.sql` | Adds nullable `author_note` text column (max 1200 chars) to `stories`. | `ALTER TABLE public.stories DROP COLUMN IF EXISTS author_note;` |
| `supabase/migrations/20260920000006_heirloom_search.sql` | Adds `content_text` column, sync trigger, GIN index, and `search_published_stories` RPC. | `DROP FUNCTION IF EXISTS public.search_published_stories(text); DROP TRIGGER IF EXISTS trg_stories_sync_content_text ON public.stories; DROP FUNCTION IF EXISTS public.sync_story_content_text(); DROP INDEX IF EXISTS idx_stories_search_gin; ALTER TABLE public.stories DROP COLUMN IF EXISTS content_text;` |
| `supabase/migrations/20260920000007_heirloom_audio.sql` | Adds audio metadata columns to `stories` and creates `story-audio` public storage bucket with author-only policies. | `DELETE FROM storage.buckets WHERE id = 'story-audio'; ALTER TABLE public.stories DROP COLUMN IF EXISTS audio_url, DROP COLUMN IF EXISTS audio_duration_seconds, DROP COLUMN IF EXISTS audio_mime;` |
| `supabase/migrations/20260920000008_heirloom_read_counts.sql` | Creates `story_reads` daily aggregation table, RLS policies, and `record_story_read` RPC. | `DROP FUNCTION IF EXISTS public.record_story_read(uuid); DROP TABLE IF EXISTS public.story_reads CASCADE;` |

---

## 3. Environment Variables & Feature Flags

| Variable | Scope | Purpose & Default |
|---|---|---|
| `NEXT_PUBLIC_FEATURE_READER_TOOLS` | Public / Client | Enables social share, continue reading banner, TOC read marks, and arrow key navigation. Default: `false`. |
| `NEXT_PUBLIC_FEATURE_SEARCH` | Public / Client | Enables full-text search bar and `/search` route. Default: `false`. |
| `NEXT_PUBLIC_FEATURE_AUDIO` | Public / Client | Enables public narration player on stories with audio. Default: `false`. |
| `NEXT_PUBLIC_FEATURE_INSTALL` | Public / Client | Enables PWA webmanifest and home-screen installability meta tags. Default: `false`. |
| `NEXT_PUBLIC_FEATURE_READ_COUNTS` | Public / Client | Enables client read tracking (30s + 40% scroll) and dashboard sparklines. Default: `false`. |
| `NEXT_PUBLIC_FEATURE_TIMELINE` | Public / Client | Enables `/timeline` chronological route and navigation link. Default: `false`. |
| `ALLOW_READONLY_EXPORT_IN_CI` | GitHub Actions | Allows `scripts/export-backup.ts` to execute under CI during scheduled runs. Default: `0`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Offline / GitHub Secrets | Used only by local CLI scripts and automated backup workflow. **Never put in Vercel**. |
| `SUPABASE_URL` | Offline / GitHub Secrets | Supabase project API URL for backup automation. |

---

## 4. Exact Steps to Enable Features

1. **Apply Supabase Migrations**:
   Run the 4 migration SQL files in Supabase SQL Editor in numerical order:
   - `20260920000005_heirloom_author_note.sql`
   - `20260920000006_heirloom_search.sql`
   - `20260920000007_heirloom_audio.sql`
   - `20260920000008_heirloom_read_counts.sql`

2. **Run Post-Migration Security Verification**:
   Execute the offline security audit script:
   ```bash
   npx tsx scripts/verify-heirloom-security.ts
   ```

3. **Configure GitHub Actions Secrets for Automated Backup**:
   In GitHub repository settings -> **Secrets and variables** -> **Actions**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Enable Desired Feature Flags in Vercel**:
   In Vercel Project Settings -> **Environment Variables**, toggle any or all flags to `true`:
   - `NEXT_PUBLIC_FEATURE_READER_TOOLS=true`
   - `NEXT_PUBLIC_FEATURE_SEARCH=true`
   - `NEXT_PUBLIC_FEATURE_AUDIO=true`
   - `NEXT_PUBLIC_FEATURE_INSTALL=true`
   - `NEXT_PUBLIC_FEATURE_READ_COUNTS=true`
   - `NEXT_PUBLIC_FEATURE_TIMELINE=true`

5. **Redeploy to Production**.

---

## 5. Test Outputs

### Unit Test Suite Output (`npx tsx scripts/test-heirloom-units.ts`)
```text
========================================
   HEIRLOOM PHASE 6 UNIT TEST SUITE    
========================================

1. Search Query Sanitizer & Length Guard
  ✓ PASS: Strips dangerous tsquery & SQL injection characters
  ✓ PASS: Enforces 100 character maximum length limit
  ✓ PASS: Normalizes multiple consecutive whitespaces

2. Safe Snippet Highlighter & Tokenizer
  ✓ PASS: Splits snippet into 3 text/mark segments
  ✓ PASS: Snippet rendering strictly produces safe React children, never dangerouslySetInnerHTML

3. Author Note Validation
  ✓ PASS: Valid author note passes 1200 char constraint
  ✓ PASS: Oversized author note correctly flagged as exceeding 1200 chars
  ✓ PASS: Author note splits cleanly into plain text paragraphs

4. Writing Prompts Validation
  ✓ PASS: Contains at least 40 curated prompts (Found: 40)
  ✓ PASS: All writing prompts are warm and free of intrusive/sensitive keywords
  ✓ PASS: getRandomPrompt() returns a valid populated prompt object

5. Timeline Chronological Calculations
  ✓ PASS: Extracts 1974 from "Circa 1974"
  ✓ PASS: Extracts 2005 from "2005 - Monsoon"
  ✓ PASS: Returns 9999 fallback when no 4-digit year exists
  ✓ PASS: Calculates decade "1970s" for year 1974
  ✓ PASS: Calculates decade "1980s" for year 1989
  ✓ PASS: Calculates decade "2000s" for year 2002

----------------------------------------
Results: 17 / 17 tests passed.
----------------------------------------

✨ All Heirloom unit tests passed successfully!
```

---

## 6. Performance: First Load JS Comparison

| Route | Baseline JS | Post-Phase 6 JS | Delta | Notes |
|---|---|---|---|---|
| `/` (Frontispiece) | 115 kB | 116 kB | +1 kB | Dynamic continue reading banner |
| `/toc` (Contents) | 109 kB | 112 kB | +3 kB | Local storage read ticks |
| `/story/[slug]` (Story) | 121 kB | 125 kB | +4 kB | Reader share, keyboard nav, audio player container |
| `/search` (Search) | N/A | 109 kB | New | Server-rendered, minimal client JS |
| `/timeline` (Timeline) | N/A | 109 kB | New | Server-rendered static cards |
| `/admin/book` (Print Book) | N/A | 114 kB | New | Author-only paged media manager |
| **Shared by all routes** | **105 kB** | **105 kB** | **+0 kB** | **Zero increase to shared global bundle** |

---

## 7. Assumptions & Design Decisions

1. **Fail-Soft Schema Handling**: All database insert/update/query actions catch PostgreSQL error `42703` (undefined column) or missing relation errors, automatically falling back to baseline schemas so the application never breaks if deployed before migrations run.
2. **Snippet Safety**: Highlighting strictly parses `[[` and `]]` delimiters into React JSX `<mark>` elements without invoking `dangerouslySetInnerHTML`.
3. **Storage Direct Upload**: Audio narration uploads directly from the author's browser to Supabase Storage using authenticated author tokens, bypassing Vercel serverless request body limits (4.5 MB).
4. **Privacy-Preserving Analytics**: Read tracking requires 30 seconds dwell time + 40% scroll, respects browser Do Not Track headers, and aggregates strictly into daily integer counts with no IP or personal identifiers retained.

---

## 8. Manual Verification Checklist for Author

- [ ] **Author's Note**: Edit a story in `/admin`, type a note in "Note from the author", save, and verify rendering on the public story page under the Diya divider.
- [ ] **Writing Prompts**: In the Tiptap editor, click "Need a spark?" and verify popover prompt cycles cleanly with "Another spark".
- [ ] **Voice Narration**: In the editor "Narration" panel, record a short clip or upload an `.m4a`/`.mp3` file. Verify audio player appears on the public story page.
- [ ] **Reader Tools**: On a story page, verify keyboard Left/Right arrows navigate between chapters, click Share to test native share / WhatsApp / Copy link, and verify reading progress tick on `/toc`.
- [ ] **Search**: Visit `/search`, search for words from published stories (e.g. "village", "pillar"), and check highlighted snippets.
- [ ] **Print Book**: Visit `/admin/book`, customize trim size (6x9 in), click "Print / Save as PDF", and verify PDF preview.
- [ ] **Timeline**: Set years on 3+ published stories, visit `/timeline`, and verify decade grouping.
- [ ] **Automated Backup**: Trigger `.github/workflows/backup.yml` in GitHub Actions and download the resulting zip artifact.
