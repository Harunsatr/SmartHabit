/**
 * Auth module exports
 * Clean API for importing auth utilities
 */

// Configuration
export { authOptions as default, authOptions } from "./auth.config";

// Types
export type {
  UserRole,
  AuthUser,
  SafeUser,
  AuthCredentials,
  JWTPayload,
  AuthResponse,
  SessionUser,
  AuthError,
} from "./auth.types";
export { UserRole } from "./auth.types";

// Constants
export { AUTH_CONSTANTS, OAUTH_PROVIDERS } from "./constants";

// Utilities (pure functions, no database)
export {
  hashPassword,
  comparePassword,
  validateCredentials,
  isValidEmail,
  validatePassword,
  sanitizeEmail,
  getSafeUser,
} from "./auth.utils";

// RBAC (Role-based access control)
export {
  hasRole,
  isAdmin,
  isAuthenticated,
  canAccessUserData,
  getUserRole,
  getUserId,
  requireAdmin,
  requireAuth,
  requirePermission,
  PERMISSIONS,
  checkPermission,
  isValidRole,
} from "./rbac";

// Server-side helpers (database operations)
export {
  getCurrentSession,
  getCurrentUser,
  getCurrentUserRole,
  verifyAuth,
  verifyAdminAuth,
  verifyUserAccess,
  authenticateUser,
  getUserById,
  getAllUsers,
  updateUserRole,
} from "./auth.server";
