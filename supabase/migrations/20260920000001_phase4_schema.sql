-- ==============================================================================
-- Dust and Dazzle: Phase 4 Database Schema
-- Photos, Comments Moderation, Rate Limiting, Site Settings, and Storage
-- ==============================================================================

-- 1. Add allow_comments toggle to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT true;

-- 2. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
    ON public.site_settings
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Author can manage site settings" ON public.site_settings;
CREATE POLICY "Author can manage site settings"
    ON public.site_settings
    FOR ALL
    TO authenticated
    USING (public.is_author())
    WITH CHECK (public.is_author());

-- 3. Create Comment Rate Limits Table (Tracks hashed IPs for spam defense)
CREATE TABLE IF NOT EXISTS public.comment_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comment_rate_limits ON public.comment_rate_limits(ip_hash, created_at);

ALTER TABLE public.comment_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author and service can manage rate limits" ON public.comment_rate_limits;
CREATE POLICY "Author and service can manage rate limits"
    ON public.comment_rate_limits
    FOR ALL
    TO authenticated
    USING (public.is_author())
    WITH CHECK (public.is_author());

-- 4. Supabase Storage Bucket for Story Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view story media" ON storage.objects;
CREATE POLICY "Public can view story media"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'story-media');

DROP POLICY IF EXISTS "Author can upload story media" ON storage.objects;
CREATE POLICY "Author can upload story media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'story-media' AND public.is_author());

DROP POLICY IF EXISTS "Author can update story media" ON storage.objects;
CREATE POLICY "Author can update story media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'story-media' AND public.is_author());

DROP POLICY IF EXISTS "Author can delete story media" ON storage.objects;
CREATE POLICY "Author can delete story media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'story-media' AND public.is_author());
