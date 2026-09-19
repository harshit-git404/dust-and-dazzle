# Dust & Dazzle: Tales from a Village and a City

A literary short story collection website for author **Ajeet Kumar Singh**.

Designed with the quiet elegance of a hand-bound memoir—aged rag paper textures, Playfair Display & Newsreader typography, Diya gold accents, washi tape photo plates, and a continuous flow of 16 chapters.

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

Create a `.env.local` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:

```env
# Supabase Public API URL (Project Settings > API in Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Public Key (Safe for browser queries)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Supabase Service Role Key (CONFIDENTIAL: Server-side only, NEVER commit)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> [!IMPORTANT]
> Never commit `.env` or `.env.local` to Git. `.gitignore` is pre-configured to keep your credentials confidential.

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Building for Production

```bash
# Generate production bundle
npm run build

# Start production server locally
npm run start
```

---

## 📖 Public Pages & Routing

- `/` — **Book Cover & Frontispiece**: Title, subtitle, author byline, dedication, frontispiece archival photo plate, and direct reading entrance.
- `/toc` — **Table of Contents**: Continuous chronological index of all 16 story chapters.
- `/story/[slug]` — **Story Reading Experience**: Distraction-free 680px reading column, candlelight reading mode toggle, drop caps, and sequential next/previous navigation.
- `/login` — **Author Studio**: Private author access.

---

## 🎨 Design System & Aesthetics

- **Paper Canvas**: `#FFF8F5` (Daylight Parchment) / `#1A120B` (Candlelight Nocturne)
- **Primary Accent**: `#A9502E` (Terracotta baked soil)
- **Secondary Botanical**: `#3F4A32` (Banyan canopy green)
- **Tertiary Accent**: `#C9922E` (Diya flame gold)
- **Ink Primary**: `#261910` (Archival sepia ink)
- **Typography**: `Playfair Display` (Headlines & Hero) + `Newsreader` (Prose, italics & smallcaps)

---

## 📜 Development Roadmap

- [x] **Phase 1**: Project Setup, Design System, Public Pages & Sample Chapters
- [ ] **Phase 2**: Supabase Database Setup & Author Login
- [ ] **Phase 3**: Author Studio Dashboard & Tiptap Editor with Autosave
- [ ] **Phase 4**: Photo Uploads & Reader Comment Moderation
- [ ] **Phase 5**: Mobile Performance Polish, Accessibility & Vercel Deployment

---

## 📄 License & Literary Copyright

&copy; {new Date().getFullYear()} Ajeet Kumar Singh. All literary rights reserved.
