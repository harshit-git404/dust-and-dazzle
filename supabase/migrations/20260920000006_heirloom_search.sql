-- Migration: 20260920000006_heirloom_search.sql
-- Description: Full-text search for published stories with content_text sync trigger and search RPC
-- Idempotent & Additive. Does not modify or drop existing tables or columns.

-- 1. Add plain-text content column if not exists
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS content_text text;

-- 2. Helper function to strip HTML tags from content_html
CREATE OR REPLACE FUNCTION public.strip_html_tags(html text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(regexp_replace(coalesce(html, ''), '<[^>]+>', ' ', 'g'), '&[a-zA-Z0-9#]+;', ' ', 'g');
$$;

-- 3. Trigger function to keep content_text in sync with content_html on INSERT / UPDATE
CREATE OR REPLACE FUNCTION public.sync_story_content_text()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.content_text := public.strip_html_tags(NEW.content_html);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_story_content_text ON stories;
CREATE TRIGGER trg_sync_story_content_text
BEFORE INSERT OR UPDATE OF content_html ON stories
FOR EACH ROW
EXECUTE FUNCTION public.sync_story_content_text();

-- 4. Backfill existing stories with stripped plain text
UPDATE stories
SET content_text = public.strip_html_tags(content_html)
WHERE content_text IS NULL AND content_html IS NOT NULL;

-- 5. GIN Index for fast full-text searching
CREATE INDEX IF NOT EXISTS idx_stories_fts ON stories 
USING gin (to_tsvector('simple', title || ' ' || coalesce(content_text, '')));

-- 6. RPC Function for searching published stories
-- SECURITY INVOKER ensures standard RLS applies (only published stories returned to anon)
CREATE OR REPLACE FUNCTION public.search_published_stories(q text)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  subtitle text,
  chapter_label text,
  order_index int,
  year text,
  reading_time text,
  headline text
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  clean_q text;
  ts_q tsquery;
BEGIN
  -- Sanitize input: limit to 100 characters and trim
  clean_q := trim(substring(coalesce(q, '') from 1 for 100));
  
  IF clean_q = '' THEN
    RETURN;
  END IF;

  -- Build safe websearch tsquery
  BEGIN
    ts_q := websearch_to_tsquery('simple', clean_q);
  EXCEPTION WHEN OTHERS THEN
    ts_q := plainto_tsquery('simple', clean_q);
  END;

  -- Try Full-Text Search first
  RETURN QUERY
  SELECT 
    s.id,
    s.slug,
    s.title,
    s.subtitle,
    s.chapter_label,
    s.order_index,
    s.year,
    s.reading_time,
    ts_headline(
      'simple', 
      coalesce(s.content_text, s.excerpt, ''), 
      ts_q, 
      'StartSel=[[, StopSel=]], MaxWords=35, MinWords=15, ShortWord=3, HighlightAll=FALSE, MaxFragments=1'
    ) AS headline
  FROM stories s
  WHERE s.visibility = 'published'
    AND to_tsvector('simple', s.title || ' ' || coalesce(s.content_text, '')) @@ ts_q
  ORDER BY ts_rank(to_tsvector('simple', s.title || ' ' || coalesce(s.content_text, '')), ts_q) DESC
  LIMIT 20;

  -- If no FTS results found, fallback to ILIKE match on title, subtitle, or excerpt
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      s.id,
      s.slug,
      s.title,
      s.subtitle,
      s.chapter_label,
      s.order_index,
      s.year,
      s.reading_time,
      coalesce(s.excerpt, substring(coalesce(s.content_text, '') from 1 for 180)) AS headline
    FROM stories s
    WHERE s.visibility = 'published'
      AND (
        s.title ILIKE '%' || clean_q || '%'
        OR s.subtitle ILIKE '%' || clean_q || '%'
        OR s.excerpt ILIKE '%' || clean_q || '%'
        OR coalesce(s.content_text, '') ILIKE '%' || clean_q || '%'
      )
    ORDER BY s.order_index ASC
    LIMIT 20;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_published_stories(text) TO anon, authenticated;
