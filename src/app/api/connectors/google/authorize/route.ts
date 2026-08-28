import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/connectors/google/callback';

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'GOOGLE_CLIENT_ID environment variable is not configured' },
      { status: 500 }
    );
  }

  // Generate CSRF state token
  const state = `tenant-northstar-001:state-${Date.now()}`;
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  }).toString()}`;

  return NextResponse.redirect(authUrl);
}
