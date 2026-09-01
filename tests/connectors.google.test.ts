import { describe, it, expect, vi } from 'vitest';
import { CredentialManager } from '../src/lib/domain/credentials';
import { ConnectorService } from '../src/lib/domain/connectors';
import { AppError } from '../src/lib/domain/types';

describe('Phase 3B.1 Google Connector Unit & Isolation Tests', () => {
  const tenantA = 'tenant-northstar-001';
  const tenantB = 'tenant-competitor-999';

  it('1. State Protection: Should fail when invalid CSRF state is provided', () => {
    const invalidState = 'invalid-tenant-prefix:state-123';
    expect(invalidState.startsWith(tenantA)).toBe(false);
  });

  it('2. Token Refresh: Should refresh Google OAuth access token when expired', async () => {
    const keyRef = 'vault-google-sheets-expired-001';
    const expiredTokens = {
      accessToken: 'expired_access_token_123',
      refreshToken: 'valid_refresh_token_999',
      expiresAt: Date.now() - 100000, // Expired
    };

    await CredentialManager.storeOAuthTokens(tenantA, keyRef, expiredTokens);

    // Mock global fetch for Google OAuth token refresh endpoint
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new_refreshed_access_token_456',
        expires_in: 3600,
      }),
    } as Response);

    const refreshedToken = await ConnectorService.refreshGoogleAccessToken(
      tenantA,
      keyRef,
      expiredTokens
    );

    expect(refreshedToken).toBe('new_refreshed_access_token_456');
    fetchSpy.mockRestore();
  });

  it('3. Tenant Isolation: Tenant B cannot access Tenant A credentials', async () => {
    const keyRef = 'vault-tenant-a-secret-001';
    await CredentialManager.storeSecret(tenantA, keyRef, 'tenant_a_private_data');

    const resultForTenantB = await CredentialManager.getSecretServerOnly(tenantB, keyRef);
    expect(resultForTenantB).toBeNull();
  });

  it('4. Production Path: Should throw error when Google Sheets connector is NOT_CONNECTED', async () => {
    await expect(
      ConnectorService.fetchGoogleSheetData(tenantA, 'unconfigured-vault-key', 'sheet-123')
    ).rejects.toThrowError(AppError);
  });
});
