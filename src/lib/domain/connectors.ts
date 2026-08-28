import { AppError } from './types';
import { CredentialManager, OAuthTokenPayload } from './credentials';

export type ConnectorCategory = 'GOOGLE' | 'MICROSOFT' | 'FINANCE' | 'BUSINESS' | 'DATA';

export interface ConnectorDefinition {
  type: string;
  category: ConnectorCategory;
  name: string;
  description: string;
  authMethod: 'OAUTH2' | 'API_KEY' | 'MTLS' | 'DATABASE_URL' | 'FILE_STREAM';
  requiredScopes: string[];
}

export const SUPPORTED_CONNECTORS: ConnectorDefinition[] = [
  {
    type: 'GOOGLE_SHEETS',
    category: 'GOOGLE',
    name: 'Google Sheets',
    description: 'Read and write financial model spreadsheets and forecasts',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  },
  {
    type: 'GOOGLE_DRIVE',
    category: 'GOOGLE',
    name: 'Google Drive',
    description: 'Access financial report folders and PDFs',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/drive.readonly'],
  },
  {
    type: 'GMAIL',
    category: 'GOOGLE',
    name: 'Gmail',
    description: 'Send automated executive summaries and payment notifications',
    authMethod: 'OAUTH2',
    requiredScopes: ['https://www.googleapis.com/auth/gmail.send'],
  },
  {
    type: 'POSTGRESQL',
    category: 'DATA',
    name: 'PostgreSQL Database',
    description: 'Direct query connection to enterprise data warehouse',
    authMethod: 'DATABASE_URL',
    requiredScopes: ['readonly'],
  },
  {
    type: 'FILE_STREAM',
    category: 'DATA',
    name: 'Secure Local / Cloud Storage Upload',
    description: 'Parse CSVs, XLSX, and financial PDF bank statements',
    authMethod: 'FILE_STREAM',
    requiredScopes: ['file.read'],
  },
  {
    type: 'BANK_API',
    category: 'FINANCE',
    name: 'Global Banking Open API',
    description: 'Query real-time bank balances and SWIFT cash transactions',
    authMethod: 'MTLS',
    requiredScopes: ['accounts.read', 'balances.read'],
  },
  {
    type: 'SAP_ERP',
    category: 'FINANCE',
    name: 'SAP S/4HANA ERP',
    description: 'Read payables, receivables, and ledger actuals',
    authMethod: 'API_KEY',
    requiredScopes: ['ledger.read', 'invoices.read'],
  },
];

export class ConnectorService {
  /**
   * Safe status check guaranteeing zero plaintext secret exposure to client.
   */
  static getStatusDisplay(status: string): { text: string; color: string } {
    switch (status) {
      case 'CONNECTED':
        return { text: 'CONNECTED', color: 'bg-emerald-500' };
      case 'EXPIRED':
        return { text: 'REAUTHORIZATION REQUIRED', color: 'bg-amber-500' };
      case 'ERROR':
        return { text: 'CONNECTION ERROR', color: 'bg-rose-500' };
      case 'NOT_CONNECTED':
      default:
        return { text: 'NOT CONFIGURED / NOT CONNECTED', color: 'bg-slate-500' };
    }
  }

  /**
   * Safely formats credential reference without exposing secrets.
   */
  static getSafeCredentialSummary(credentialReference?: string | null): string {
    if (!credentialReference) return 'NOT_CONFIGURED';
    return `Vault Ref: ${credentialReference.substring(0, 16)}...`;
  }

  /**
   * Refresh Google OAuth Access Token if expired.
   */
  static async refreshGoogleAccessToken(
    tenantId: string,
    credentialRef: string,
    tokens: OAuthTokenPayload
  ): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !tokens.refreshToken) {
      throw new AppError('INTEGRATION_ERROR', 'Google OAuth Refresh token or Client credentials missing');
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new AppError('INTEGRATION_ERROR', `Google OAuth Token Refresh failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const updatedTokens: OAuthTokenPayload = {
      ...tokens,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };

    await CredentialManager.storeOAuthTokens(tenantId, credentialRef, updatedTokens);
    return updatedTokens.accessToken;
  }

  /**
   * Fetches real spreadsheet values via Google Sheets API v4 when OAuth token is present.
   */
  static async fetchGoogleSheetData(
    tenantId: string,
    credentialRef: string,
    spreadsheetId: string,
    range: string = 'A1:Z100'
  ): Promise<{ rows: any[][]; source: string }> {
    const tokens = await CredentialManager.getOAuthTokensServerOnly(tenantId, credentialRef);

    if (!tokens || !tokens.accessToken) {
      throw new AppError(
        'INTEGRATION_ERROR',
        `Google Sheets Connector is NOT_CONNECTED for tenant '${tenantId}'. Please complete OAuth connection.`
      );
    }

    let accessToken = tokens.accessToken;

    // Auto-refresh access token if expired (or within 5-min expiration buffer)
    if (tokens.expiresAt && tokens.expiresAt <= Date.now() + 300000 && tokens.refreshToken) {
      accessToken = await this.refreshGoogleAccessToken(tenantId, credentialRef, tokens);
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        if (res.status === 401 && tokens.refreshToken) {
          // Retry once after refreshing token
          accessToken = await this.refreshGoogleAccessToken(tenantId, credentialRef, tokens);
          const retryRes = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            return {
              rows: retryData.values || [],
              source: `Google Sheets API [ID: ${spreadsheetId}]`,
            };
          }
        }
        const errText = await res.text();
        throw new AppError('INTEGRATION_ERROR', `Google Sheets API returned HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      return {
        rows: data.values || [],
        source: `Google Sheets API [ID: ${spreadsheetId}]`,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('INTEGRATION_ERROR', `Failed to read Google Sheet: ${err.message}`);
    }
  }
}
