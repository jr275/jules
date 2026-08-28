import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CredentialManager } from '@/lib/domain/credentials';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.json(
      { success: false, error: error || 'OAuth authorization code missing' },
      { status: 400 }
    );
  }

  // Validate CSRF state token
  if (!state || !state.startsWith('tenant-northstar-001:')) {
    return NextResponse.json(
      { success: false, error: 'Invalid OAuth CSRF state parameter' },
      { status: 403 }
    );
  }

  const tenantId = 'tenant-northstar-001';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/connectors/google/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: 'Google OAuth client credentials not configured server-side' },
      { status: 500 }
    );
  }

  try {
    // Exchange Authorization Code for Access & Refresh Tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json(
        { success: false, error: `Google OAuth Token Exchange failed: ${errText}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenRes.json();
    const vaultKey = `vault-ref-google-sheets-${Date.now()}`;

    // Store tokens securely in server vault
    const credentialReference = await CredentialManager.storeOAuthTokens(tenantId, vaultKey, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
      scope: tokenData.scope,
    });

    // Create or update Connector Prisma record
    await prisma.connector.create({
      data: {
        tenantId,
        name: 'Google Sheets OAuth Workspace',
        type: 'GOOGLE_SHEETS',
        category: 'GOOGLE',
        status: 'CONNECTED',
        credentialReference,
      },
    });

    return NextResponse.redirect(new URL('/connectors?status=connected', request.url));
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'OAuth callback processing failed' },
      { status: 500 }
    );
  }
}
