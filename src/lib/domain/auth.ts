import { Permission, UserRole } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
    'MANAGE_POLICIES',
    'VIEW_AUDIT',
  ],
  CFO: [
    'VIEW',
    'CREATE',
    'EDIT',
    'APPROVE',
    'EXECUTE',
    'MANAGE_POLICIES',
    'VIEW_AUDIT',
  ],
  FINANCE_MANAGER: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'EXECUTE', 'VIEW_AUDIT'],
  TREASURY: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'EXECUTE', 'VIEW_AUDIT'],
  CONTROLLER: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'VIEW_AUDIT'],
  ANALYST: ['VIEW', 'CREATE', 'EDIT', 'VIEW_AUDIT'],
  PROCUREMENT: ['VIEW', 'CREATE', 'EDIT', 'APPROVE'],
  VIEWER: ['VIEW'],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`AUTHORIZATION_ERROR: Role ${role} lacks permission ${permission}`);
  }
}
