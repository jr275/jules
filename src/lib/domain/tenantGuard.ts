export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  userId?: string;
  userRole?: string;
}

export function assertTenantAccess(context: TenantContext, resourceTenantId: string): void {
  if (!context.tenantId) {
    throw new Error('AUTHENTICATION_ERROR: Missing tenant context');
  }
  if (context.tenantId !== resourceTenantId) {
    throw new Error('AUTHORIZATION_ERROR: Cross-tenant access denied');
  }
}

export function withTenantScope<T extends { tenantId: string }>(
  context: TenantContext,
  data: T
): T {
  assertTenantAccess(context, data.tenantId);
  return data;
}
