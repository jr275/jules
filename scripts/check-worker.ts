import { AgentWorker } from '../src/lib/domain/worker';
import { prisma } from '../src/lib/prisma';

async function checkWorker() {
  console.log('[worker:check] Verifying worker process readiness...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[worker:check] Database connection verified.');

    const worker = new AgentWorker({
      workerId: 'worker-readiness-check',
      concurrency: 1,
      pollIntervalMs: 5000,
    });

    await worker.start();
    console.log('[worker:check] Worker process started successfully with active heartbeat.');

    await new Promise((r) => setTimeout(r, 1000));
    await worker.stop();
    console.log('[worker:check] Worker process stopped cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('[worker:check] Worker readiness check failed:', err);
    process.exit(1);
  }
}

checkWorker();
