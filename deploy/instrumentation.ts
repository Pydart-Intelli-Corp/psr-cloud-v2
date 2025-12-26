/**
 * Next.js Instrumentation Hook
 * This runs when the Next.js server starts
 * Used to initialize background services like the pulse scheduler
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startPulseScheduler } = await import('../src/lib/pulseSchedulerService');
    await startPulseScheduler();
  }
}
