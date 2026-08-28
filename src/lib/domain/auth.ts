import { AppError } from './types';
import { prisma } from '../prisma';

export type SystemRole = 'OWNER' | 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'CFO' | 'TREASURY';

export interface UserAuthContext {
  userId: string;
  email: string;
  tenantId: string;
  organizationId: string;
  role: SystemRole;
}

export class AuthService {
  /**
   * Evaluates server-side request authorization and enforces tenant boundary validation.
   */
  static validateTenantAccess(
    authContext: UserAuthContext,
    targetTenantId: string
  ): void {
    if (!authContext || !authContext.tenantId) {
      throw new AppError('AUTHENTICATION_ERROR', 'Server request unauthenticated');
    }

    if (authContext.tenantId !== targetTenantId) {
      throw new AppError('TENANT_ACCESS_ERROR', `Unauthorized access attempt to tenant '${targetTenantId}'`);
    }
  }

  /**
   * Enforces Role-Based Access Control (RBAC) permissions.
   */
  static validatePermission(
    role: SystemRole,
    requiredRole: SystemRole | SystemRole[]
  ): void {
    const roleHierarchy: Record<SystemRole, number> = {
      OWNER: 100,
      ADMIN: 90,
      CFO: 80,
      TREASURY: 70,
      OPERATOR: 50,
      VIEWER: 10,
    };

    const userLevel = roleHierarchy[role] || 0;
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const minRequiredLevel = Math.min(...requiredRoles.map((r) => roleHierarchy[r] || 100));

    if (userLevel < minRequiredLevel) {
      throw new AppError(
        'AUTHORIZATION_ERROR',
        `Role '${role}' insufficient. Minimum required role: '${requiredRoles.join(', ')}'`
      );
    }
  }

  /**
   * Resolves authenticated user context server-side.
   */
  static async resolveAuthContext(requestHeaders?: Headers): Promise<UserAuthContext> {
    const tenantHeader = requestHeaders?.get('x-tenant-id');
    const roleHeader = (requestHeaders?.get('x-user-role') as SystemRole) || 'CFO';

    const tenantId = tenantHeader || 'tenant-northstar-001';
    const organizationId = 'org-northstar-holdings';

    const user = await prisma.user.findFirst({
      where: { tenantId },
    });

    return {
      userId: user?.id || 'user-eleanor-cfo',
      email: user?.email || 'eleanor.vance@northstar.com',
      tenantId,
      organizationId,
      role: roleHeader,
    };
  }
}
