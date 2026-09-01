import { prisma } from '../prisma';

export class HeartbeatService {
  /**
   * Records or updates worker/scheduler heartbeat in database.
   */
  static async recordHeartbeat(
    nodeId: string,
    role: 'WORKER' | 'SCHEDULER',
    concurrency: number = 1
  ) {
    const now = new Date();
    return await prisma.systemHeartbeat.upsert({
      where: { nodeId },
      create: {
        nodeId,
        role,
        status: 'RUNNING',
        concurrency,
        lastHeartbeatAt: now,
      },
      update: {
        status: 'RUNNING',
        concurrency,
        lastHeartbeatAt: now,
      },
    });
  }

  /**
   * Checks system health and flags stale nodes (> 60 seconds without heartbeat).
   */
  static async getSystemHealth(staleThresholdSeconds: number = 60) {
    const now = new Date();
    const staleCutoff = new Date(now.getTime() - staleThresholdSeconds * 1000);

    const heartbeats = await prisma.systemHeartbeat.findMany();

    const activeWorkers = heartbeats.filter(
      (h) => h.role === 'WORKER' && h.lastHeartbeatAt >= staleCutoff
    );

    const activeSchedulers = heartbeats.filter(
      (h) => h.role === 'SCHEDULER' && h.lastHeartbeatAt >= staleCutoff
    );

    return {
      status: activeWorkers.length > 0 && activeSchedulers.length > 0 ? 'healthy' : 'degraded',
      activeWorkersCount: activeWorkers.length,
      activeSchedulersCount: activeSchedulers.length,
      heartbeats: heartbeats.map((h) => ({
        nodeId: h.nodeId,
        role: h.role,
        status: h.lastHeartbeatAt >= staleCutoff ? 'RUNNING' : 'STALE',
        lastHeartbeatAt: h.lastHeartbeatAt,
      })),
    };
  }
}
