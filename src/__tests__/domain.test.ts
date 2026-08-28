import { describe, it, expect } from 'vitest';
import { assertPermission, hasPermission } from '../lib/domain/auth';
import { assertTenantAccess } from '../lib/domain/tenantGuard';
import { evaluatePolicyRules } from '../lib/domain/policyEngine';
import { calculatePriorityScore } from '../lib/domain/scoring';
import { LLMProviderService } from '../lib/domain/llm';
import { PolicyRule } from '../lib/domain/types';

describe('Uncle Scrooge Domain Invariants & Architecture', () => {
  describe('Authorization & Role Matrix', () => {
    it('CFO should have APPROVE and EXECUTE permissions', () => {
      expect(hasPermission('CFO', 'APPROVE')).toBe(true);
      expect(hasPermission('CFO', 'EXECUTE')).toBe(true);
    });

    it('VIEWER should only have VIEW permission', () => {
      expect(hasPermission('VIEWER', 'VIEW')).toBe(true);
      expect(hasPermission('VIEWER', 'EXECUTE')).toBe(false);
      expect(hasPermission('VIEWER', 'APPROVE')).toBe(false);
    });

    it('assertPermission should throw error on missing permission', () => {
      expect(() => assertPermission('VIEWER', 'MANAGE_POLICIES')).toThrow(
        /AUTHORIZATION_ERROR/
      );
    });
  });

  describe('Multi-Tenant Isolation Guard', () => {
    it('should pass when tenant IDs match', () => {
      expect(() =>
        assertTenantAccess({ tenantId: 'tenant_123' }, 'tenant_123')
      ).not.toThrow();
    });

    it('should throw AUTHORIZATION_ERROR on cross-tenant access attempt', () => {
      expect(() =>
        assertTenantAccess({ tenantId: 'tenant_123' }, 'tenant_999')
      ).toThrow(/AUTHORIZATION_ERROR: Cross-tenant access denied/);
    });

    it('should throw AUTHENTICATION_ERROR when tenant context is missing', () => {
      expect(() =>
        assertTenantAccess({ tenantId: '' }, 'tenant_123')
      ).toThrow(/AUTHENTICATION_ERROR: Missing tenant context/);
    });
  });

  describe('Deterministic Policy Evaluation Engine', () => {
    const rules: PolicyRule[] = [
      {
        id: 'r1',
        field: 'amount',
        operator: 'GREATER_THAN',
        value: 100000,
        action: 'REQUIRE_APPROVAL',
        requiredRole: 'CFO',
      },
      {
        id: 'r2',
        field: 'risk',
        operator: 'EQUALS',
        value: 'CRITICAL',
        action: 'REJECT',
      },
    ];

    it('should pass clean transaction without requiring approval', () => {
      const result = evaluatePolicyRules(rules, { amount: 50000, risk: 'LOW' });
      expect(result.passed).toBe(true);
      expect(result.requiresApproval).toBe(false);
    });

    it('should trigger approval requirement for disbursements over threshold', () => {
      const result = evaluatePolicyRules(rules, { amount: 250000, risk: 'LOW' });
      expect(result.passed).toBe(true);
      expect(result.requiresApproval).toBe(true);
      expect(result.requiredRole).toBe('CFO');
    });

    it('should reject transactions with CRITICAL risk', () => {
      const result = evaluatePolicyRules(rules, { amount: 10000, risk: 'CRITICAL' });
      expect(result.passed).toBe(false);
      expect(result.violatedRules.length).toBe(1);
    });
  });

  describe('Opportunity Priority Scoring Engine', () => {
    it('should accurately calculate Priority Score based on economic impact and risk', () => {
      const score = calculatePriorityScore({
        economicImpact: 100000,
        probability: 0.9,
        urgency: 0.8,
        feasibility: 0.9,
        reversibility: 0.8,
        risk: 0.2,
        effort: 0.3,
      });

      // Numerator: 100000 * 0.9 * 0.8 * 0.9 * 0.8 = 51840
      // Denominator: 0.2 * 0.3 + 0.1 = 0.16
      // Expected Score: 51840 / 0.16 = 324000
      expect(score).toBe(324000);
    });
  });

  describe('LLM Safety Boundary', () => {
    it('should return NOT_CONFIGURED status when provider key is unconfigured', () => {
      const llm = new LLMProviderService();
      const res = llm.generate({ prompt: 'Analyze cash forecast' });
      expect(res.status).toBe('NOT_CONFIGURED');
    });
  });
});
