-- Migration: 20260920000005_heirloom_author_note.sql
-- Description: Add optional author_note field to stories table (max 1200 characters)
-- Idempotent & Additive. Does not drop or modify existing columns or data.

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS author_note text CHECK (char_length(author_note) <= 1200);

COMMENT ON COLUMN stories.author_note IS 'Optional personal reflections or backstory from the author, displayed at the end of the chapter.';
