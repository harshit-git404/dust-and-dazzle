/**
 * Test for development latency simulator
 * 
 * Verifies that:
 * 1. Under NODE_ENV === 'production', latency is strictly 0ms even if NEXT_PUBLIC_SIMULATE_LATENCY_MS is set.
 * 2. Under NODE_ENV === 'development', latency respects NEXT_PUBLIC_SIMULATE_LATENCY_MS.
 */

import { simulateNetworkLatency } from '../src/lib/latency';

async function runTest() {
  console.log('Testing simulateNetworkLatency()...\n');

  // Test 1: Production safety check
  const originalEnv = process.env.NODE_ENV;
  const originalLatency = process.env.NEXT_PUBLIC_SIMULATE_LATENCY_MS;

  try {
    (process.env as any).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SIMULATE_LATENCY_MS = '500';

    const startProd = Date.now();
    await simulateNetworkLatency();
    const elapsedProd = Date.now() - startProd;

    if (elapsedProd < 50) {
      console.log(`  ✓ PASS: Production mode ignored latency (${elapsedProd}ms elapsed)`);
    } else {
      console.error(`  ✗ FAIL: Production mode added latency (${elapsedProd}ms elapsed)`);
      process.exit(1);
    }

    // Test 2: Development latency check
    (process.env as any).NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_SIMULATE_LATENCY_MS = '150';

    const startDev = Date.now();
    await simulateNetworkLatency();
    const elapsedDev = Date.now() - startDev;

    if (elapsedDev >= 120 && elapsedDev <= 300) {
      console.log(`  ✓ PASS: Development mode applied requested latency (~150ms, took ${elapsedDev}ms)`);
    } else {
      console.error(`  ✗ FAIL: Development mode did not apply latency correctly (${elapsedDev}ms)`);
      process.exit(1);
    }
  } finally {
    (process.env as any).NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_SIMULATE_LATENCY_MS = originalLatency;
  }

  console.log('\n✨ Latency simulation test passed!\n');
}

runTest();
