import { AppError } from './types';

export interface TenantContext {
  tenantId: string;
  organizationId: string;
}

export function validateTenantContext(tenantId?: string | null): string {
  if (!tenantId || tenantId.trim() === '') {
    throw new AppError('AUTHENTICATION_ERROR', 'Missing or invalid tenant boundary context');
  }
  return tenantId;
}

export function enforceTenantIsolation<T extends { tenantId: string }>(
  record: T | null,
  expectedTenantId: string
): T {
  if (!record) {
    throw new AppError('NOT_FOUND', 'Requested resource not found');
  }
  if (record.tenantId !== expectedTenantId) {
    throw new AppError(
      'AUTHORIZATION_ERROR',
      'Cross-tenant access violation detected. Access denied.'
    );
  }
  return record;
}

export function withTenantWhere<T extends object>(
  whereClause: T,
  tenantId: string
): T & { tenantId: string } {
  const validTenantId = validateTenantContext(tenantId);
  return {
    ...whereClause,
    tenantId: validTenantId,
  };
}
