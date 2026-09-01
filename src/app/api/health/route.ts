import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DefaultLLMProvider } from '@/lib/domain/llm';
import { OpenAIEmbeddingProvider } from '@/lib/domain/knowledge';
import { HeartbeatService } from '@/lib/domain/heartbeat';

export async function GET() {
  try {
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    const llmProvider = new DefaultLLMProvider();
    const llmStatus = llmProvider.isConfigured() ? 'configured' : 'NOT_CONFIGURED';

    const embeddingProvider = new OpenAIEmbeddingProvider();
    const embeddingStatus = embeddingProvider.isConfigured() ? 'configured' : 'NOT_CONFIGURED';

    const systemHealth = await HeartbeatService.getSystemHealth(60);

    const overallHealthy =
      dbStatus === 'healthy' &&
      systemHealth.status === 'healthy';

    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'degraded',
      database: dbStatus,
      llm: llmStatus,
      embeddings: embeddingStatus,
      worker: systemHealth.activeWorkersCount > 0 ? 'running' : 'stopped',
      scheduler: systemHealth.activeSchedulersCount > 0 ? 'running' : 'stopped',
      activeWorkers: systemHealth.activeWorkersCount,
      activeSchedulers: systemHealth.activeSchedulersCount,
      credentialVault: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message || 'Health check failed' },
      { status: 500 }
    );
  }
}
