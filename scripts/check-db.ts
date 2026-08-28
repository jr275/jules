import { prisma } from '../src/lib/prisma';

async function checkDb() {
  console.log('[db:check] Connecting to database...');
  try {
    const tenants = await prisma.tenant.count();
    const agents = await prisma.agent.count();
    const jobs = await prisma.agentJob.count();
    console.log(`[db:check] Connection successful. Database stats: ${tenants} tenants, ${agents} agents, ${jobs} jobs.`);
    process.exit(0);
  } catch (err) {
    console.error('[db:check] Database connection or query failed:', err);
    process.exit(1);
  }
}

checkDb();
