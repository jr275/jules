import { PolicyRule } from './types';

export interface PolicyEvaluationInput {
  amount?: number;
  currency?: string;
  risk?: string;
  counterparty?: string;
  actionType?: string;
  [key: string]: unknown;
}

export interface PolicyEvaluationResult {
  passed: boolean;
  requiresApproval: boolean;
  requiredRole?: string;
  violatedRules: PolicyRule[];
  reasons: string[];
}

export function evaluatePolicyRules(
  rules: PolicyRule[],
  input: PolicyEvaluationInput
): PolicyEvaluationResult {
  const result: PolicyEvaluationResult = {
    passed: true,
    requiresApproval: false,
    violatedRules: [],
    reasons: [],
  };

  for (const rule of rules) {
    const inputValue = input[rule.field];

    if (inputValue === undefined) {
      continue;
    }

    let isMatch = false;

    switch (rule.operator) {
      case 'GREATER_THAN':
        if (typeof inputValue === 'number' && typeof rule.value === 'number') {
          isMatch = inputValue > rule.value;
        }
        break;
      case 'LESS_THAN':
        if (typeof inputValue === 'number' && typeof rule.value === 'number') {
          isMatch = inputValue < rule.value;
        }
        break;
      case 'EQUALS':
        isMatch = inputValue === rule.value;
        break;
      case 'IN':
        if (Array.isArray(rule.value)) {
          isMatch = rule.value.includes(String(inputValue));
        }
        break;
      case 'CONTAINS':
        if (typeof inputValue === 'string') {
          isMatch = inputValue.includes(String(rule.value));
        }
        break;
    }

    if (isMatch) {
      if (rule.action === 'REJECT') {
        result.passed = false;
        result.violatedRules.push(rule);
        result.reasons.push(
          `Policy rule violated: ${rule.field} ${rule.operator} ${rule.value}`
        );
      } else if (rule.action === 'REQUIRE_APPROVAL') {
        result.requiresApproval = true;
        if (rule.requiredRole) {
          result.requiredRole = rule.requiredRole;
        }
        result.reasons.push(
          `Approval required: ${rule.field} ${rule.operator} ${rule.value} (Required role: ${
            rule.requiredRole || 'MANAGER'
          })`
        );
      }
    }
  }

  return result;
}
