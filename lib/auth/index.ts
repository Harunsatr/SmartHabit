/**
 * Auth module exports
 * Clean API for importing auth utilities
 */

// Configuration (default export for NextAuth)
import authConfig from "./auth.config";
export default authConfig;
export { authOptions } from "./auth.config";

// Types
export type {
  AuthUser,
  SafeUser,
  AuthCredentials,
  JWTPayload,
  AuthResponse,
  SessionUser,
  AuthError,
} from "./auth.types";
// Export the UserRole enum (value + type) explicitly
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
