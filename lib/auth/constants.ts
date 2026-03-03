/**
 * Authentication constants
 * Centralized configuration values
 */

export const AUTH_CONSTANTS = {
  // Session configuration
  SESSION: {
    MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
    UPDATE_AGE: 24 * 60 * 60, // Update every 24 hours
  },

  // Cookie configuration
  COOKIE: {
    SECURE_NAME: "__Secure-next-auth.session-token",
    DEVELOPMENT_NAME: "next-auth.session-token",
    OPTIONS: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
    },
  },

  // Routes
  ROUTES: {
    PUBLIC: ["/", "/login", "/register"],
    PROTECTED: ["/dashboard", "/habits", "/analytics", "/insights", "/settings"],
    ADMIN: ["/admin"],
  },

  // Password policy
  PASSWORD: {
    MIN_LENGTH: 8,
    // Add complexity requirements
  },

  // Error messages
  ERRORS: {
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_NOT_FOUND: "User not found",
    USER_EXISTS: "User already exists",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Access denied",
    SESSION_EXPIRED: "Session expired",
    INVALID_EMAIL: "Invalid email address",
    PASSWORD_MISMATCH: "Passwords do not match",
    DATABASE_ERROR: "Database error",
  },
} as const;

// OAuth configuration (for future expansion)
export const OAUTH_PROVIDERS = {
  GOOGLE: {
    ENABLED: Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
    SCOPE: ["profile", "email"],
  },
  GITHUB: {
    ENABLED: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
    SCOPE: ["read:user", "user:email"],
  },
} as const;
