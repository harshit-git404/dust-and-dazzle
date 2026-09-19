-- ==============================================================================
-- Migration: Add content_json JSONB column to public.stories for Tiptap editor
-- ==============================================================================

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS content_json JSONB;
