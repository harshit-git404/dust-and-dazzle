-- ==============================================================================
-- Dust and Dazzle: Secure Reader Comment Submission & RLS Policies
-- Allows anonymous readers to submit unapproved comments & rate limits
-- via Server Actions using ONLY the public ANON key (zero Service Role Key on Vercel).
-- ==============================================================================

-- 1. RLS Policies allowing unauthenticated public clients to submit unapproved comments
DROP POLICY IF EXISTS "Public can submit unapproved comments" ON public.comments;
CREATE POLICY "Public can submit unapproved comments"
    ON public.comments
    FOR INSERT
    TO public
    WITH CHECK (is_approved = false);

-- 2. RLS Policies for comment rate limits table
DROP POLICY IF EXISTS "Public can record rate limits" ON public.comment_rate_limits;
CREATE POLICY "Public can record rate limits"
    ON public.comment_rate_limits
    FOR INSERT
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can check rate limits" ON public.comment_rate_limits;
CREATE POLICY "Public can check rate limits"
    ON public.comment_rate_limits
    FOR SELECT
    TO public
    USING (true);

-- 3. High-Security Atomic RPC Function (SECURITY DEFINER)
-- Bypasses table-level RLS inside a controlled stored procedure, atomically checking
-- rate limits, story comment status, and inserting with is_approved = false.
CREATE OR REPLACE FUNCTION public.submit_reader_comment(
    p_story_id UUID,
    p_author_name TEXT,
    p_author_email TEXT,
    p_content TEXT,
    p_ip_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_recent_count INT;
    v_allow_comments BOOLEAN;
    v_visibility TEXT;
BEGIN
    -- 1. Check story validity & comments enabled
    SELECT allow_comments, visibility INTO v_allow_comments, v_visibility
    FROM public.stories
    WHERE id = p_story_id;

    IF NOT FOUND OR v_visibility != 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Story not found or not published.');
    END IF;

    IF v_allow_comments = false THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reflections are closed for this chapter.');
    END IF;

    -- 2. Check rate limit (max 5 comments per 10 minutes per IP hash)
    SELECT COUNT(*) INTO v_recent_count
    FROM public.comment_rate_limits
    WHERE ip_hash = p_ip_hash
      AND created_at >= timezone('utc'::text, now()) - interval '10 minutes';

    IF v_recent_count >= 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too many reflections submitted recently. Please try again later.');
    END IF;

    -- 3. Record rate limit
    INSERT INTO public.comment_rate_limits (ip_hash) VALUES (p_ip_hash);

    -- 4. Insert comment (STRICTLY ALWAYS is_approved = false)
    INSERT INTO public.comments (
        story_id,
        author_name,
        author_email,
        content,
        is_approved
    ) VALUES (
        p_story_id,
        p_author_name,
        p_author_email,
        p_content,
        false
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execution to public / anon so the Server Action can call it using only the anon key
GRANT EXECUTE ON FUNCTION public.submit_reader_comment(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
