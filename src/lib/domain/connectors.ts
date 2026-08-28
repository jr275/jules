import { AppError } from './types';
import { CredentialManager, OAuthTokenPayload } from './credentials';

export type ConnectorCategory = 'GOOGLE' | 'MICROSOFT' | 'FINANCE' | 'BUSINESS' | 'DATA';

export interface ConnectorCapability {
  id: string; // e.g. "spreadsheet.read"
  name: string;
  description: string;
  requiredScopes: string[];
}

export interface ConnectorAdapter {
  providerId: string;
  name: string;
  category: ConnectorCategory;
  authMethod: 'OAUTH2' | 'API_KEY' | 'MTLS' | 'DATABASE_URL' | 'FILE_STREAM';
  capabilities: ConnectorCapability[];
  authenticate?: (tenantId: string, payload: Record<string, unknown>) => Promise<string>;
  refreshCredentials?: (tenantId: string, credentialRef: string) => Promise<boolean>;
  healthCheck: (tenantId: string, credentialRef?: string | null) => Promise<{ status: 'CONNECTED' | 'EXPIRED' | 'NOT_CONNECTED' | 'ERROR'; message: string }>;
  executeCapability: (tenantId: string, credentialRef: string, capabilityId: string, params: Record<string, unknown>) => Promise<Record<string, unknown>>;
  revoke?: (tenantId: string, credentialRef: string) => Promise<boolean>;
}

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

/**
 * Reference Google Sheets Adapter conforming to ConnectorAdapter
 */
export class GoogleSheetsAdapter implements ConnectorAdapter {
  public providerId = 'GOOGLE_SHEETS';
  public name = 'Google Sheets Connector';
  public category: ConnectorCategory = 'GOOGLE';
  public authMethod: 'OAUTH2' = 'OAUTH2';

  public capabilities: ConnectorCapability[] = [
    {
      id: 'spreadsheet.read',
      name: 'Read Spreadsheet Values',
      description: 'Read rows and cell ranges from Google Sheets spreadsheets',
      requiredScopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    },
  ];

  public async healthCheck(tenantId: string, credentialRef?: string | null) {
    if (!credentialRef) {
      return { status: 'NOT_CONNECTED' as const, message: 'Google Sheets connector is not configured' };
    }
    const status = await CredentialManager.checkStatus(tenantId, credentialRef);
    return {
      status: status === 'CONNECTED' ? ('CONNECTED' as const) : ('NOT_CONNECTED' as const),
      message: status === 'CONNECTED' ? 'Google OAuth credentials active' : 'Credential missing or revoked',
    };
  }

  public async executeCapability(
    tenantId: string,
    credentialRef: string,
    capabilityId: string,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (capabilityId !== 'spreadsheet.read') {
      throw new AppError('AUTHORIZATION_ERROR', `Capability '${capabilityId}' is not supported by GoogleSheetsAdapter`);
    }

    const spreadsheetId = (params.spreadsheetId as string) || (params.sheetId as string) || 'FY26_Liquidity_Forecast_Q1';
    const range = (params.range as string) || 'A1:Z100';

    const sheetResult = await ConnectorService.fetchGoogleSheetData(tenantId, credentialRef, spreadsheetId, range);
    return {
      spreadsheetId,
      range,
      source: sheetResult.source,
      rows: sheetResult.rows,
    };
  }
}

/**
 * Central Connector Registry for registering and resolving Connector Adapters dynamically
 */
export class ConnectorRegistry {
  private static adapters: Map<string, ConnectorAdapter> = new Map();

  static register(adapter: ConnectorAdapter): void {
    this.adapters.set(adapter.providerId.toUpperCase(), adapter);
  }

  static get(providerId: string): ConnectorAdapter {
    const adapter = this.adapters.get(providerId.toUpperCase());
    if (!adapter) {
      throw new AppError('NOT_FOUND', `ConnectorAdapter for provider '${providerId}' is not registered in ConnectorRegistry`);
    }
    return adapter;
  }

  static has(providerId: string): boolean {
    return this.adapters.has(providerId.toUpperCase());
  }

  static listAdapters(): ConnectorAdapter[] {
    return Array.from(this.adapters.values());
  }
}

// Register Reference Adapters
ConnectorRegistry.register(new GoogleSheetsAdapter());

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
