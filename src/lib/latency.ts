/**
 * Development-only simulated latency utility.
 * 
 * Configured via NEXT_PUBLIC_SIMULATE_LATENCY_MS.
 * Strictly ignored (0ms delay) when NODE_ENV is "production".
 */

export async function simulateNetworkLatency(defaultMs: number = 0): Promise<void> {
  // Never add latency in production environments
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const configuredLatency = process.env.NEXT_PUBLIC_SIMULATE_LATENCY_MS;
  const ms = configuredLatency ? parseInt(configuredLatency, 10) : defaultMs;

  if (ms > 0 && !isNaN(ms)) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
