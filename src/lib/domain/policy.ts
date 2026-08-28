import { AppError } from './types';

export interface PolicyRule {
  id: string;
  name: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'IN';
  value: unknown;
  action: 'REQUIRE_APPROVAL' | 'PROHIBIT' | 'FLAG_RISK';
  requiredRole?: string;
  message: string;
}

export interface PolicyEvaluationContext {
  amount?: number;
  currency?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  counterpartyType?: 'EXISTING' | 'NEW';
  autonomyLevel?: string;
  actionType?: string;
  userRole?: string;
}

export interface PolicyEvaluationResult {
  passed: boolean;
  action: 'ALLOW' | 'REQUIRE_APPROVAL' | 'PROHIBIT';
  requiredRole?: string;
  violations: Array<{
    ruleId: string;
    ruleName: string;
    action: 'REQUIRE_APPROVAL' | 'PROHIBIT' | 'FLAG_RISK';
    message: string;
  }>;
}

export class PolicyEngine {
  static evaluate(
    rules: PolicyRule[],
    context: PolicyEvaluationContext
  ): PolicyEvaluationResult {
    const result: PolicyEvaluationResult = {
      passed: true,
      action: 'ALLOW',
      violations: [],
    };

    for (const rule of rules) {
      const fieldValue = context[rule.field as keyof PolicyEvaluationContext];
      const isMatch = this.evaluateCondition(fieldValue, rule.operator, rule.value);

      if (isMatch) {
        result.violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action,
          message: rule.message,
        });

        if (rule.action === 'PROHIBIT') {
          result.passed = false;
          result.action = 'PROHIBIT';
        } else if (rule.action === 'REQUIRE_APPROVAL' && result.action !== 'PROHIBIT') {
          result.passed = false;
          result.action = 'REQUIRE_APPROVAL';
          if (rule.requiredRole) {
            result.requiredRole = rule.requiredRole;
          }
        }
      }
    }

    return result;
  }

  private static evaluateCondition(
    fieldValue: unknown,
    operator: PolicyRule['operator'],
    targetValue: unknown
  ): boolean {
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (operator) {
      case 'EQUALS':
        return fieldValue === targetValue;
      case 'NOT_EQUALS':
        return fieldValue !== targetValue;
      case 'GREATER_THAN':
        return (fieldValue as number) > (targetValue as number);
      case 'GREATER_THAN_OR_EQUAL':
        return (fieldValue as number) >= (targetValue as number);
      case 'LESS_THAN':
        return (fieldValue as number) < (targetValue as number);
      case 'LESS_THAN_OR_EQUAL':
        return (fieldValue as number) <= (targetValue as number);
      case 'IN':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      default:
        return false;
    }
  }
}
