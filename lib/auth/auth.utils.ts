/**
 * Authentication utilities
 * Reusable, pure functions for auth operations
 * Does NOT use Prisma (database-agnostic)
 */

import bcrypt from "bcryptjs";
import { AUTH_CONSTANTS } from "./constants";
import type { AuthCredentials, AuthError } from "./auth.types";

/**
 * Hash password with bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * Prevents timing attacks by ensuring consistent timing
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    // Return false on any bcrypt error (timing safe)
    return false;
  }
}

/**
 * Validate credentials format
 * @param credentials - User credentials
 * @returns Validation result with error if invalid
 */
export function validateCredentials(
  credentials: unknown
): { valid: boolean; error?: AuthError } {
  if (!credentials || typeof credentials !== "object") {
    return { valid: false, error: "INVALID_CREDENTIALS" };
  }

  const creds = credentials as Record<string, unknown>;

  // Email validation
  if (!creds.email || typeof creds.email !== "string") {
    return { valid: false, error: "INVALID_EMAIL" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(creds.email)) {
    return { valid: false, error: "INVALID_EMAIL" };
  }

  // Password validation
  if (!creds.password || typeof creds.password !== "string") {
    return { valid: false, error: "INVALID_CREDENTIALS" };
  }

  if (creds.password.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
    return { valid: false, error: "INVALID_CREDENTIALS" };
  }

  return { valid: true };
}

/**
 * Validate email format
 * @param email - Email address
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with error if invalid
 */
export function validatePassword(
  password: string
): { valid: boolean; error?: string } {
  if (password.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${AUTH_CONSTANTS.PASSWORD.MIN_LENGTH} characters`,
    };
  }

  // Add complexity check if needed
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return { valid: true };
}

/**
 * Sanitize user email (normalize)
 * @param email - Email to sanitize
 * @returns Normalized email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Get safe user object (without sensitive data)
 * @param user - User object from database
 * @returns Safe user object
 */
export function getSafeUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  language: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
    createdAt: user.createdAt,
  };
}
