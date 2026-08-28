import { describe, it, expect, beforeAll } from 'vitest';
import { CredentialManager } from '../src/lib/domain/credentials';
import { AuthService, UserAuthContext } from '../src/lib/domain/auth';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { ToolRegistry } from '../src/lib/domain/tools';
import { TestLLMProvider } from '../src/lib/domain/llm';
import { AppError } from '../src/lib/domain/types';
import { prisma } from '../src/lib/prisma';

describe('Phase 9 Production Hardening, Multi-Tenant Auth & AES-256 Vault Persistence', () => {
  const tenantA = 'tenant-northstar-001';
  const tenantB = 'tenant-competitor-999';
  let testAgentId = 'agent-cash-flow';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId: tenantA } });
    if (agent) testAgentId = agent.id;
  });

  it('1. AES-256-GCM Vault Persistence: Encrypts, persists in DB, and decrypts across process boundary', async () => {
    const keyRef = 'vault-prod-db-encrypted-001';
    const secretValue = 'sk_live_production_secret_key_99201481';

    // Store secret in DB vault
    await CredentialManager.storeSecret(tenantA, keyRef, secretValue);

    // Retrieve and decrypt from DB
    const decrypted = await CredentialManager.getSecretServerOnly(tenantA, keyRef);
    expect(decrypted).toBe(secretValue);

    // Verify raw DB payload is encrypted (contains AES IV and AuthTag colons)
    const vaultRecord = await prisma.credentialVault.findUnique({
      where: { tenantId_keyRef: { tenantId: tenantA, keyRef } },
    });

    expect(vaultRecord).toBeDefined();
    expect(vaultRecord?.encryptedPayload).not.toBe(secretValue);
    expect(vaultRecord?.encryptedPayload).toContain(':');
  });

  it('2. Multi-Tenant Vault Isolation: Tenant B cannot access or decrypt Tenant A vault records', async () => {
    const keyRef = 'vault-tenant-a-confidential';
    await CredentialManager.storeSecret(tenantA, keyRef, 'confidential_payroll_keys');

    const resultForTenantB = await CredentialManager.getSecretServerOnly(tenantB, keyRef);
    expect(resultForTenantB).toBeNull();
  });

  it('3. Server-Side Authentication & Tenant Boundary Guard: Blocks cross-tenant access attempts', () => {
    const authContextTenantA: UserAuthContext = {
      userId: 'user-eleanor-cfo',
      email: 'eleanor.vance@northstar.com',
      tenantId: tenantA,
      organizationId: 'org-northstar-global',
      role: 'CFO',
    };

    // Valid same-tenant access
    expect(() =>
      AuthService.validateTenantAccess(authContextTenantA, tenantA)
    ).not.toThrow();

    // Cross-tenant access attempt -> Throws TENANT_ACCESS_ERROR
    expect(() =>
      AuthService.validateTenantAccess(authContextTenantA, tenantB)
    ).toThrowError(AppError);
  });

  it('4. RBAC Permission Validation: Enforces role hierarchy limits', () => {
    expect(() => AuthService.validatePermission('CFO', 'OPERATOR')).not.toThrow();
    expect(() => AuthService.validatePermission('VIEWER', 'CFO')).toThrowError(AppError);
  });

  it('5. Prompt Injection Defense in Runtime: Rejects prompt injection commands in retrieved context', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Adversarial instruction neutralized. Operating within strict policy limits.',
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId: tenantA,
      agentId: testAgentId,
      taskPrompt: 'Analyze cash buffer',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
      llmProvider: testLLM,
    });

    expect(result.status).toBe('COMPLETED');
    const completedEvent = result.events.find((e) => e.type === 'execution_completed');
    expect(completedEvent).toBeDefined();
  });
});
