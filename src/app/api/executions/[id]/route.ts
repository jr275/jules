import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = 'tenant-northstar-001';

    const execution = await prisma.execution.findFirst({
      where: { id: resolvedParams.id, tenantId },
      include: {
        agent: true,
        steps: { orderBy: { createdAt: 'asc' } },
        outputs: { include: { provenance: true } },
        checkpoints: { orderBy: { iteration: 'desc' } },
      },
    });

    if (!execution) {
      return NextResponse.json(
        { success: false, error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, execution });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}
