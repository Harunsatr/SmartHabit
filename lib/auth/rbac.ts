/**
 * Role-Based Access Control (RBAC) utilities
 * Enterprise-grade permission and role handling
 * All checks are server-side only
 */

import { Session } from "next-auth";
import { UserRole } from "./auth.types";

/**
 * Check if user has a specific role
 * @param session - User session
 * @param requiredRole - Role to check for
 * @returns true if user has the role
 */
export function hasRole(
  session: Session | null,
  requiredRole: UserRole
): boolean {
  if (!session?.user) return false;
  return session.user.role === requiredRole;
}

/**
 * Check if user is admin
 * @param session - User session
 * @returns true if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, UserRole.ADMIN);
}

/**
 * Check if user is authenticated
 * @param session - User session
 * @returns true if user has valid session
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user?.id;
}

/**
 * Check if user has permission for resource
 * @param session - User session
 * @param userId - Resource owner ID
 * @returns true if user is owner or admin
 */
export function canAccessUserData(
  session: Session | null,
  userId: string
): boolean {
  if (!isAuthenticated(session)) return false;
  if (isAdmin(session)) return true;
  return session?.user?.id === userId;
}

/**
 * Get user role from session
 * @param session - User session
 * @returns User role or null
 */
export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null;
  return (session.user.role as UserRole) || UserRole.USER;
}

/**
 * Get user ID from session
 * @param session - User session
 * @returns User ID or null
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Verify admin access (throw error if not admin)
 * @param session - User session
 * @throws Error if user is not admin
 */
export function requireAdmin(session: Session | null): void {
  if (!isAdmin(session)) {
    throw new Error("FORBIDDEN: Admin access required");
  }
}

/**
 * Verify authenticated (throw error if not authenticated)
 * @param session - User session
 * @throws Error if user is not authenticated
 */
export function requireAuth(session: Session | null): void {
  if (!isAuthenticated(session)) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
}

/**
 * Verify user can access resource (throw error if not)
 * @param session - User session
 * @param userId - Resource owner ID
 * @throws Error if user cannot access resource
 */
export function requirePermission(
  session: Session | null,
  userId: string
): void {
  if (!canAccessUserData(session, userId)) {
    throw new Error("FORBIDDEN: Access denied");
  }
}

/**
 * RBAC permission matrix
 * Define what each role can do
 */
export const PERMISSIONS = {
  [UserRole.ADMIN]: {
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAnalytics: true,
    canViewAllHabits: true,
    canDeleteAnyHabit: true,
    canAccessAdmin: true,
    canManageRoles: true,
    canAuditLogs: true,
  },
  [UserRole.USER]: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAnalytics: true, // Own analytics only
    canViewAllHabits: false, // Own habits only
    canDeleteAnyHabit: false, // Own habits only
    canAccessAdmin: false,
    canManageRoles: false,
    canAuditLogs: false,
  },
} as const;

/**
 * Check if user has permission
 * @param role - User role
 * @param permission - Permission key
 * @returns true if user has permission
 */
export function checkPermission(
  role: UserRole,
  permission: keyof (typeof PERMISSIONS)[UserRole]
): boolean {
  return PERMISSIONS[role][permission] || false;
}

/**
 * Type-safe role check for runtime validation
 * @param role - Role to validate
 * @returns true if valid role
 */
export function isValidRole(role: unknown): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
