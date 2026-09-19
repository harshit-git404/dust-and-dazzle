-- ==============================================================================
-- Dust and Dazzle: Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    chapter_label TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    year TEXT,
    visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'published', 'private')),
    reading_time TEXT NOT NULL DEFAULT '5 min read',
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    cover_image_url TEXT,
    image_caption TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for ordering, slug, and visibility lookups
CREATE INDEX IF NOT EXISTS idx_stories_order ON public.stories(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_stories_slug ON public.stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_visibility ON public.stories(visibility);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT, -- Optional, never exposed to public queries
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_story ON public.comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(is_approved);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS Policies: STORIES
-- ==============================================================================

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public visitors can only view published stories" ON public.stories;
DROP POLICY IF EXISTS "Authenticated author can perform all actions on stories" ON public.stories;

-- Policy 1: Public visitors (anon) can ONLY view published stories
CREATE POLICY "Public visitors can only view published stories"
    ON public.stories
    FOR SELECT
    TO public
    USING (visibility = 'published');

-- Policy 2: Strictly restrict write access to the authenticated author (verified via JWT email & auth.uid)
CREATE POLICY "Authenticated author can perform all actions on stories"
    ON public.stories
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') = 'kumar.ajeet@gmail.com'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') = 'kumar.ajeet@gmail.com'
    );

-- ==============================================================================
-- RLS Policies: COMMENTS
-- ==============================================================================

DROP POLICY IF EXISTS "Public visitors can only view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Public visitors can submit comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated author can manage all comments" ON public.comments;

-- Policy 1: Public visitors can ONLY view approved comments
CREATE POLICY "Public visitors can only view approved comments"
    ON public.comments
    FOR SELECT
    TO public
    USING (is_approved = true);

-- Policy 2: Public visitors can submit comments (always forced to is_approved = false)
CREATE POLICY "Public visitors can submit comments"
    ON public.comments
    FOR INSERT
    TO public
    WITH CHECK (is_approved = false);

-- Policy 3: Authenticated Author can manage all comments (approve, delete, edit)
CREATE POLICY "Authenticated author can manage all comments"
    ON public.comments
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') = 'kumar.ajeet@gmail.com'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') = 'kumar.ajeet@gmail.com'
    );

-- ==============================================================================
-- Trigger for automatic updated_at timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_stories_updated_at ON public.stories;
CREATE TRIGGER set_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
