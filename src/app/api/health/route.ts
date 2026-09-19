import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health Check API Endpoint
 *
 * Performs a lightweight database query to keep the Supabase free tier instance active
 * and prevents automatic pausing due to inactivity. Scheduled via Vercel Cron.
 */
export async function GET() {
  const start = Date.now();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('stories')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - start,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
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
