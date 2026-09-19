-- ==============================================================================
-- Dust and Dazzle: Comment Security Hardening Migration
-- 1. Closes all direct anonymous read/write access to comments & rate-limits tables.
-- 2. Hardens submit_reader_comment RPC with strict input validation, global limits,
--    per-story limits, pending queue capacity limits, and IP rate limits.
-- 3. Adds cleanup_old_rate_limits SECURITY DEFINER function for daily cron.
-- ==============================================================================

-- 1. Remove all direct public/anonymous policies on comments and comment_rate_limits
DROP POLICY IF EXISTS "Public can submit unapproved comments" ON public.comments;
DROP POLICY IF EXISTS "Public visitors can submit comments" ON public.comments;
DROP POLICY IF EXISTS "Public can record rate limits" ON public.comment_rate_limits;
DROP POLICY IF EXISTS "Public can check rate limits" ON public.comment_rate_limits;
DROP POLICY IF EXISTS "Public can check own rate limits" ON public.comment_rate_limits;

-- Ensure comment_rate_limits has NO public access (only author via RLS or SECURITY DEFINER RPC)
DROP POLICY IF EXISTS "Author and service can manage rate limits" ON public.comment_rate_limits;
CREATE POLICY "Author can manage rate limits"
    ON public.comment_rate_limits
    FOR ALL
    TO authenticated
    USING (public.is_author())
    WITH CHECK (public.is_author());

-- 2. Hardened submit_reader_comment RPC function
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
    v_clean_name TEXT;
    v_clean_email TEXT;
    v_clean_content TEXT;
    v_clean_ip_hash TEXT;
    v_allow_comments BOOLEAN;
    v_visibility TEXT;
    v_pending_count INT;
    v_global_hourly_count INT;
    v_story_hourly_count INT;
    v_ip_recent_count INT;
BEGIN
    -- Sanitized input variables
    v_clean_name := trim(COALESCE(p_author_name, ''));
    v_clean_email := trim(COALESCE(p_author_email, ''));
    v_clean_content := trim(COALESCE(p_content, ''));
    v_clean_ip_hash := lower(trim(COALESCE(p_ip_hash, '')));

    -- 1. Strict Input Validations
    -- Name: 1-80 chars
    IF length(v_clean_name) < 1 OR length(v_clean_name) > 80 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Name must be between 1 and 80 characters.');
    END IF;

    -- Content: 1-2000 chars
    IF length(v_clean_content) < 1 OR length(v_clean_content) > 2000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reflection must be between 1 and 2,000 characters.');
    END IF;

    -- Email: empty or valid email shape up to 254 chars
    IF length(v_clean_email) > 0 THEN
        IF length(v_clean_email) > 254 OR v_clean_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Please provide a valid email address or leave it blank.');
        END IF;
    ELSE
        v_clean_email := NULL;
    END IF;

    -- IP Hash: 16-64 hex chars
    IF length(v_clean_ip_hash) < 16 OR length(v_clean_ip_hash) > 64 OR v_clean_ip_hash !~ '^[a-f0-9]+$' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid submission signature.');
    END IF;

    -- 2. Story validity & comments enabled
    SELECT allow_comments, visibility INTO v_allow_comments, v_visibility
    FROM public.stories
    WHERE id = p_story_id;

    IF NOT FOUND OR v_visibility != 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Story not found or unavailable.');
    END IF;

    IF v_allow_comments = false THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reflections are closed for this chapter.');
    END IF;

    -- 3. Global & Story Rate Limits (Independent of IP)
    -- Pending Moderation Queue Capacity (max 100 pending comments)
    SELECT COUNT(*) INTO v_pending_count
    FROM public.comments
    WHERE is_approved = false;

    IF v_pending_count >= 100 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'The reflection moderation queue is currently full. Please try again later.'
        );
    END IF;

    -- Global hourly rate limit across whole site (max 20 new comments / hour)
    SELECT COUNT(*) INTO v_global_hourly_count
    FROM public.comments
    WHERE created_at >= timezone('utc'::text, now()) - interval '1 hour';

    IF v_global_hourly_count >= 20 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'The collection has received many reflections recently. Please try again in a little while.'
        );
    END IF;

    -- Per-story hourly rate limit (max 10 new comments / hour per story)
    SELECT COUNT(*) INTO v_story_hourly_count
    FROM public.comments
    WHERE story_id = p_story_id
      AND created_at >= timezone('utc'::text, now()) - interval '1 hour';

    IF v_story_hourly_count >= 10 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This chapter has received many reflections recently. Please try again in a little while.'
        );
    END IF;

    -- 4. IP-based Rate Limit (max 5 comments per 10 minutes per IP hash)
    SELECT COUNT(*) INTO v_ip_recent_count
    FROM public.comment_rate_limits
    WHERE ip_hash = v_clean_ip_hash
      AND created_at >= timezone('utc'::text, now()) - interval '10 minutes';

    IF v_ip_recent_count >= 5 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Too many reflections submitted recently. Please try again later.'
        );
    END IF;

    -- 5. Record rate limit event
    INSERT INTO public.comment_rate_limits (ip_hash) VALUES (v_clean_ip_hash);

    -- 6. Insert comment (STRICTLY hardcoded is_approved = false)
    INSERT INTO public.comments (
        story_id,
        author_name,
        author_email,
        content,
        is_approved
    ) VALUES (
        p_story_id,
        v_clean_name,
        v_clean_email,
        v_clean_content,
        false
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Explicitly revoke from PUBLIC and grant only to anon and authenticated
REVOKE ALL ON FUNCTION public.submit_reader_comment(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_reader_comment(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 3. Cleanup Old Rate Limits Function for Daily Cron
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INT;
BEGIN
    DELETE FROM public.comment_rate_limits
    WHERE created_at < timezone('utc'::text, now()) - interval '1 day';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO anon, authenticated;
