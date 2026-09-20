-- Migration: 20260920000008_heirloom_read_counts.sql
-- Description: Private aggregate read counts table and record_story_read RPC
-- Idempotent & Additive. Does not drop or modify existing tables or columns.

-- 1. Create story_reads aggregate table
CREATE TABLE IF NOT EXISTS public.story_reads (
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  reads int NOT NULL DEFAULT 0,
  PRIMARY KEY (story_id, day)
);

-- 2. Enable RLS
ALTER TABLE public.story_reads ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Strictly author-only SELECT
DROP POLICY IF EXISTS "Author select story_reads" ON public.story_reads;
CREATE POLICY "Author select story_reads"
ON public.story_reads FOR SELECT
TO authenticated
USING (
  public.is_author()
  OR auth.uid() IN (SELECT user_id FROM public.authors)
);

-- Deny all direct inserts/updates from client
DROP POLICY IF EXISTS "No direct insert story_reads" ON public.story_reads;
CREATE POLICY "No direct insert story_reads"
ON public.story_reads FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "No direct update story_reads" ON public.story_reads;
CREATE POLICY "No direct update story_reads"
ON public.story_reads FOR UPDATE
USING (false);

-- 4. RPC to record aggregate read with security definer & flood capping
CREATE OR REPLACE FUNCTION public.record_story_read(p_story_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_visibility text;
BEGIN
  -- Validate story exists and is published
  SELECT visibility INTO v_visibility
  FROM public.stories
  WHERE id = p_story_id;

  IF v_visibility IS NULL OR v_visibility != 'published' THEN
    RETURN false;
  END IF;

  -- Upsert daily bucket capped at 500 reads/day
  INSERT INTO public.story_reads (story_id, day, reads)
  VALUES (p_story_id, CURRENT_DATE, 1)
  ON CONFLICT (story_id, day) DO UPDATE
  SET reads = LEAST(public.story_reads.reads + 1, 500)
  WHERE public.story_reads.reads < 500;

  RETURN true;
END;
$$;

-- 5. Revoke from PUBLIC, grant execute to anon and authenticated
REVOKE ALL ON FUNCTION public.record_story_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_story_read(uuid) TO anon, authenticated;
