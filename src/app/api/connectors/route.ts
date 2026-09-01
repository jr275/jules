import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SUPPORTED_CONNECTORS, ConnectorService } from '@/lib/domain/connectors';
import { CredentialManager } from '@/lib/domain/credentials';

export async function GET() {
  try {
    const tenantId = 'tenant-northstar-001';
    const activeConnectors = await prisma.connector.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      activeConnectors,
      supportedConnectors: SUPPORTED_CONNECTORS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = 'tenant-northstar-001';
    const body = await request.json();

    const { name, type, category, credentials } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and connector type are required' },
        { status: 400 }
      );
    }

    // Store credentials safely in server vault
    let credentialReference: string | null = null;
    if (credentials) {
      const vaultKey = `connector-${type.toLowerCase()}-${Date.now()}`;
      if (typeof credentials === 'object') {
        credentialReference = await CredentialManager.storeOAuthTokens(
          tenantId,
          vaultKey,
          credentials
        );
      } else {
        credentialReference = await CredentialManager.storeSecret(
          tenantId,
          vaultKey,
          String(credentials)
        );
      }
    }

    const newConnector = await prisma.connector.create({
      data: {
        tenantId,
        name,
        type,
        category: category || 'GOOGLE',
        status: credentialReference ? 'CONNECTED' : 'NOT_CONFIGURED',
        credentialReference,
      },
    });

    return NextResponse.json({
      success: true,
      connector: {
        ...newConnector,
        credentialSummary: ConnectorService.getSafeCredentialSummary(newConnector.credentialReference),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create connector' },
      { status: 500 }
    );
  }
}
