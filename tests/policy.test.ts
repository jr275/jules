import { describe, it, expect } from 'vitest';
import { PolicyEngine, PolicyRule } from '../src/lib/domain/policy';
import { AutonomyEngine } from '../src/lib/domain/autonomy';
import { hasPermission, enforcePermission, UserContext } from '../src/lib/domain/auth';
import { enforceTenantIsolation } from '../src/lib/domain/tenant';

describe('Multi-Tenancy Isolation Guard', () => {
  it('should allow access to matching tenant records', () => {
    const record = { id: '1', tenantId: 'tenant-123', name: 'Entity A' };
    const result = enforceTenantIsolation(record, 'tenant-123');
    expect(result).toEqual(record);
  });

  it('should throw AUTHORIZATION_ERROR on cross-tenant access', () => {
    const record = { id: '1', tenantId: 'tenant-123', name: 'Entity A' };
    expect(() => enforceTenantIsolation(record, 'tenant-456')).toThrowError(
      'Cross-tenant access violation'
    );
  });
});

describe('RBAC Authorization', () => {
  it('should grant full permissions to OWNER and CFO', () => {
    expect(hasPermission('OWNER', 'EXECUTE')).toBe(true);
    expect(hasPermission('CFO', 'APPROVE')).toBe(true);
    expect(hasPermission('VIEWER', 'EXECUTE')).toBe(false);
  });

  it('should enforce permission and throw AppError on unauthorized access', () => {
    const user: UserContext = {
      userId: 'u1',
      email: 'viewer@company.com',
      tenantId: 't1',
      organizationId: 'o1',
      role: 'VIEWER',
    };
    expect(() => enforcePermission(user, 'APPROVE')).toThrowError(
      "Role 'VIEWER' lacks required permission 'APPROVE'"
    );
  });
});

describe('Deterministic Policy Engine', () => {
  const sampleRules: PolicyRule[] = [
    {
      id: 'rule-1',
      name: 'High payment threshold',
      field: 'amount',
      operator: 'GREATER_THAN',
      value: 100000,
      action: 'REQUIRE_APPROVAL',
      requiredRole: 'CFO',
      message: 'Payments over $100,000 require CFO approval',
    },
    {
      id: 'rule-2',
      name: 'Prohibit high risk counterparty',
      field: 'riskLevel',
      operator: 'EQUALS',
      value: 'CRITICAL',
      action: 'PROHIBIT',
      message: 'Critical risk execution is prohibited',
    },
  ];

  it('should require approval when payment exceeds limit', () => {
    const res = PolicyEngine.evaluate(sampleRules, { amount: 150000, riskLevel: 'LOW' });
    expect(res.passed).toBe(false);
    expect(res.action).toBe('REQUIRE_APPROVAL');
    expect(res.requiredRole).toBe('CFO');
    expect(res.violations).toHaveLength(1);
  });

  it('should prohibit execution when critical risk detected', () => {
    const res = PolicyEngine.evaluate(sampleRules, { amount: 50000, riskLevel: 'CRITICAL' });
    expect(res.passed).toBe(false);
    expect(res.action).toBe('PROHIBIT');
  });

  it('should allow execution when no policies are violated', () => {
    const res = PolicyEngine.evaluate(sampleRules, { amount: 50000, riskLevel: 'LOW' });
    expect(res.passed).toBe(true);
    expect(res.action).toBe('ALLOW');
  });
});

describe('Autonomy Boundary Engine', () => {
  it('should prevent autonomous execution for LEVEL_1 and demand human review', () => {
    const gate = AutonomyEngine.checkGate({
      workerAutonomyLevel: 'LEVEL_1_RECOMMEND',
      skillAutonomyLevel: 'LEVEL_1_RECOMMEND',
      policyResult: { passed: true, action: 'ALLOW', violations: [] },
      isFinancialTransaction: true,
    });

    expect(gate.canExecuteAutonomous).toBe(false);
    expect(gate.requiresHumanApproval).toBe(true);
  });

  it('should allow autonomous execution when policy allows and level >= LEVEL_3', () => {
    const gate = AutonomyEngine.checkGate({
      workerAutonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      skillAutonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      policyResult: { passed: true, action: 'ALLOW', violations: [] },
      isFinancialTransaction: true,
    });

    expect(gate.canExecuteAutonomous).toBe(true);
    expect(gate.requiresHumanApproval).toBe(false);
  });
});
