import { AgentWorker } from '../lib/domain/worker';

console.log('[UNCLE SCROOGE] Starting background agent worker process...');

const worker = new AgentWorker({
  workerId: `dev-worker-${process.pid}`,
  concurrency: 4,
  pollIntervalMs: 1000,
});

worker.start();

process.on('SIGINT', () => {
  console.log('[UNCLE SCROOGE] Gracefully stopping worker...');
  worker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[UNCLE SCROOGE] Gracefully stopping worker...');
  worker.stop();
  process.exit(0);
});
