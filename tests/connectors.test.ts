import { describe, it, expect } from 'vitest';
import { CredentialManager } from '../src/lib/domain/credentials';
import { ConnectorService, SUPPORTED_CONNECTORS } from '../src/lib/domain/connectors';
import { ToolRegistry } from '../src/lib/domain/tools';

describe('Phase 3B Enterprise Connector Framework & Credential Manager', () => {
  const tenantId = 'tenant-northstar-001';

  it('should store and retrieve OAuth token payloads safely server-side', async () => {
    const keyRef = 'vault-google-sheets-oauth-001';
    const tokens = {
      accessToken: 'ya29.a0AxM51289123012930',
      refreshToken: '1//0gX92019201293',
      expiresAt: Date.now() + 3600000,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    };

    const storedRef = await CredentialManager.storeOAuthTokens(tenantId, keyRef, tokens);
    expect(storedRef).toBe(keyRef);

    const retrieved = await CredentialManager.getOAuthTokensServerOnly(tenantId, keyRef);
    expect(retrieved).toBeDefined();
    expect(retrieved?.accessToken).toBe('ya29.a0AxM51289123012930');
  });

  it('should sanitize payloads containing access and refresh tokens', () => {
    const rawPayload = {
      user: 'finance-admin@northstar.com',
      accessToken: 'ya29.secret_access_token_value',
      refreshToken: 'secret_refresh_token_value',
    };

    const sanitized = CredentialManager.sanitizePayload(rawPayload);
    expect(sanitized.user).toBe('finance-admin@northstar.com');
    expect(sanitized.accessToken).toBe('[REDACTED]');
    expect(sanitized.refreshToken).toBe('[REDACTED]');
  });

  it('should format safe credential summary without leaking tokens', () => {
    const summary = ConnectorService.getSafeCredentialSummary('vault-ref-google-sheets-001');
    expect(summary).toContain('Vault Ref: vault-ref-google');
    expect(summary).not.toContain('secret_access_token');
  });

  it('should execute Google Sheets Reader tool through ConnectorService', async () => {
    const result = await ToolRegistry.executeTool(
      'tool-google-sheet-read',
      { sheetId: 'FY26_Liquidity_Forecast', range: 'A1:D10' },
      { tenantId, organizationId: 'org-northstar-global' }
    );

    expect(result.sheetId).toBe('FY26_Liquidity_Forecast');
    expect(result.rows).toBeDefined();
    expect(Array.isArray(result.rows)).toBe(true);
  });
});
