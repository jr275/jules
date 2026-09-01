import { NextResponse } from 'next/server';
import { AgentRuntimeEngine } from '@/lib/domain/engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = 'tenant-northstar-001';

    const success = await AgentRuntimeEngine.cancelExecution(tenantId, resolvedParams.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel execution' },
      { status: 500 }
    );
  }
}
