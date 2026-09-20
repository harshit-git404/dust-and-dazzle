-- Migration: 20260920000007_heirloom_audio.sql
-- Description: Add audio narration columns and story-audio storage bucket for author voice recordings
-- Idempotent & Additive. Does not drop or modify existing tables or columns.

-- 1. Add audio narration columns to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS audio_url text,
ADD COLUMN IF NOT EXISTS audio_duration_seconds int,
ADD COLUMN IF NOT EXISTS audio_mime text;

-- 2. Create story-audio storage bucket (if storage schema exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'story-audio',
      'story-audio',
      true,
      31457280, -- 30 MB
      ARRAY['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav']::text[]
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 31457280,
      allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav']::text[];

    -- Public Read policy
    DROP POLICY IF EXISTS "Public story audio read" ON storage.objects;
    CREATE POLICY "Public story audio read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'story-audio');

    -- Author Write policy
    DROP POLICY IF EXISTS "Author story audio insert" ON storage.objects;
    CREATE POLICY "Author story audio insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'story-audio'
      AND (
        public.is_author()
        OR auth.uid() IN (SELECT user_id FROM public.authors)
      )
    );

    -- Author Delete policy
    DROP POLICY IF EXISTS "Author story audio delete" ON storage.objects;
    CREATE POLICY "Author story audio delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'story-audio'
      AND (
        public.is_author()
        OR auth.uid() IN (SELECT user_id FROM public.authors)
      )
    );
  END IF;
END $$;
