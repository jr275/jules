import { Role, Permission, AppError } from './types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
    'CONFIGURE',
    'MANAGE_CREDENTIALS',
    'MANAGE_POLICIES',
    'VIEW_AUDIT',
  ],
  ADMIN: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
    'CONFIGURE',
    'MANAGE_CREDENTIALS',
    'MANAGE_POLICIES',
    'VIEW_AUDIT',
  ],
  CFO: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
    'CONFIGURE',
    'MANAGE_POLICIES',
    'VIEW_AUDIT',
  ],
  FINANCE_MANAGER: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
    'VIEW_AUDIT',
  ],
  TREASURY: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
  ],
  CONTROLLER: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'VIEW_AUDIT',
  ],
  ANALYST: [
    'VIEW',
    'CREATE',
    'EDIT',
  ],
  PROCUREMENT: [
    'VIEW',
    'CREATE',
    'EDIT',
  ],
  VIEWER: [
    'VIEW',
  ],
};

export interface UserContext {
  userId: string;
  email: string;
  tenantId: string;
  organizationId: string;
  role: Role;
}

export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function enforcePermission(user: UserContext, requiredPermission: Permission): void {
  if (!hasPermission(user.role, requiredPermission)) {
    throw new AppError(
      'AUTHORIZATION_ERROR',
      `Role '${user.role}' lacks required permission '${requiredPermission}'`,
      { userId: user.userId, role: user.role, requiredPermission }
    );
  }
}
