import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health Check API Endpoint
 *
 * 1. Performs a lightweight database query to keep the Supabase instance awake.
 * 2. Cleans up stale rate-limit records (> 1 day old) via SECURITY DEFINER RPC
 *    without requiring the service role key.
 * Scheduled via Vercel Cron.
 */
export async function GET() {
  const start = Date.now();

  try {
    const supabase = await createClient();

    // 1. Keep-alive database read
    const { error: readError } = await supabase
      .from('stories')
      .select('id')
      .limit(1);

    if (readError) {
      return NextResponse.json(
        {
          status: 'error',
          error: readError.message,
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - start,
        },
        { status: 500 }
      );
    }

    // 2. Perform daily maintenance cleanup on rate limits
    let cleanedCount: number | null = null;
    try {
      const { data } = await supabase.rpc('cleanup_old_rate_limits');
      cleanedCount = data;
    } catch {
      // Non-blocking cleanup
    }

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        cleanedRateLimits: cleanedCount ?? 0,
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown health check error';
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: message,
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}
