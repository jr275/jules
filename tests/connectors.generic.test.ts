import { describe, it, expect } from 'vitest';
import { CredentialManager } from '../src/lib/domain/credentials';
import { ConnectorRegistry, GoogleSheetsAdapter } from '../src/lib/domain/connectors';
import { ToolRegistry } from '../src/lib/domain/tools';

describe('Phase 3C Generic Connector Architecture & AES-256 Vault', () => {
  const tenantA = 'tenant-northstar-001';
  const tenantB = 'tenant-competitor-999';

  it('1. AES-256-GCM Vault: Encrypts secrets server-side and decrypts correctly', async () => {
    const rawSecret = 'sk_live_super_secret_api_key_99201';
    const encrypted = CredentialManager.encrypt(rawSecret);

    expect(encrypted).not.toBe(rawSecret);
    expect(encrypted).toContain(':'); // IV : AuthTag : Ciphertext

    const decrypted = CredentialManager.decrypt(encrypted);
    expect(decrypted).toBe(rawSecret);
  });

  it('2. ConnectorRegistry: Resolves registered adapters and capabilities dynamically', () => {
    expect(ConnectorRegistry.has('GOOGLE_SHEETS')).toBe(true);

    const adapter = ConnectorRegistry.get('GOOGLE_SHEETS');
    expect(adapter.name).toBe('Google Sheets Connector');
    expect(adapter.capabilities.length).toBeGreaterThan(0);
    expect(adapter.capabilities[0].id).toBe('spreadsheet.read');
  });

  it('3. Tool -> Connector Decoupling: ToolRegistry resolves tool through ConnectorRegistry', async () => {
    const keyRef = 'vault-google-sheets-generic-test';
    const tokens = {
      accessToken: 'ya29.test_access_token_123',
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    };

    await CredentialManager.storeOAuthTokens(tenantA, keyRef, tokens);

    const tool = ToolRegistry.getTool('tool-google-sheet-read');
    expect(tool.providerId).toBe('GOOGLE_SHEETS');
    expect(tool.capabilityId).toBe('spreadsheet.read');
  });

  it('4. Tenant Isolation: Tenant B cannot decrypt or access Tenant A credentials', async () => {
    const keyRef = 'vault-tenant-a-secret-key';
    await CredentialManager.storeSecret(tenantA, keyRef, 'tenant_a_confidential_vault');

    const resultForTenantB = await CredentialManager.getSecretServerOnly(tenantB, keyRef);
    expect(resultForTenantB).toBeNull();
  });
});
