import { AgentSchedulerService } from '../src/lib/domain/scheduler';
import { prisma } from '../src/lib/prisma';

async function checkScheduler() {
  console.log('[scheduler:check] Verifying scheduler readiness...');
  try {
    const triggersCount = await prisma.agentTrigger.count();
    const occurrencesCount = await prisma.triggerOccurrence.count();
    console.log(`[scheduler:check] Scheduler DB state verified (${triggersCount} triggers, ${occurrencesCount} occurrences).`);

    const result = await AgentSchedulerService.processDueTriggers();
    console.log(`[scheduler:check] Scheduler loop executed cleanly. Triggered ${result.processed} due triggers.`);
    process.exit(0);
  } catch (err) {
    console.error('[scheduler:check] Scheduler readiness check failed:', err);
    process.exit(1);
  }
}

checkScheduler();
