/**
 * Server-side authentication helpers
 * Database operations and NextAuth integration
 * Use only in server components and API routes
 */

import { getServerSession, Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./auth.config";
import {
  getSafeUser,
  comparePassword,
  validateCredentials,
  sanitizeEmail,
} from "./auth.utils";
import { requireAuth, requireAdmin, requirePermission } from "./rbac";
import type { SafeUser, AuthError, AuthCredentials, JWTPayload } from "./auth.types";
import { UserRole } from "./auth.types";

/**
 * Get current user session (server-side only)
 * @returns Session with user data or null
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user with role checking
 * @returns Safe user object or null if not authenticated
 * @throws Error if not authenticated (use requireAuth first)
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    return user ? getSafeUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Get current user role
 * @returns User role or null
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getCurrentSession();
  if (!session?.user) return null;
  const role = session.user.role as UserRole;
  return Object.values(UserRole).includes(role) ? role : null;
}

/**
 * Verify request is authenticated
 * Server-side version of requireAuth - throws error if not auth
 * @throws Error if not authenticated
 */
export async function verifyAuth(): Promise<SafeUser> {
  const session = await getCurrentSession();
  requireAuth(session);

  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED: User not found");

  return user;
}

/**
 * Verify request is from admin
 * Server-side version of requireAdmin - throws error if not admin
 * @throws Error if not admin
 */
export async function verifyAdminAuth(): Promise<SafeUser> {
  const session = await getCurrentSession();
  requireAdmin(session);

  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED: User not found");

  return user;
}

/**
 * Verify user can access another user's data
 * @param userId - User ID to access
 * @throws Error if permission denied
 */
export async function verifyUserAccess(userId: string): Promise<void> {
  const session = await getCurrentSession();
  requirePermission(session, userId);
}

/**
 * Authenticate user with credentials
 * Used by NextAuth Credentials Provider
 * @param credentials - User credentials
 * @returns User object or null if authentication fails
 */
export async function authenticateUser(
  credentials: AuthCredentials
): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  language: string;
} | null> {
  // Validate credentials format
  const validation = validateCredentials(credentials);
  if (!validation.valid) return null;

  try {
    const email = sanitizeEmail(credentials.email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        language: true,
      },
    });

    if (!user) return null;

    // Compare password (timing safe)
    const isValid = await comparePassword(credentials.password, user.password);
    if (!isValid) return null;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch {
    // Prevent information leakage
    return null;
  }
}

/**
 * Get user by ID (admin only)
 * @param userId - User ID
 * @throws Error if not admin
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const session = await getCurrentSession();
  requireAdmin(session);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    return user ? getSafeUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Get all users (admin only)
 * @throws Error if not admin
 */
export async function getAllUsers(
  limit: number = 50,
  offset: number = 0
): Promise<SafeUser[]> {
  const session = await getCurrentSession();
  requireAdmin(session);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return users.map(getSafeUser);
  } catch {
    return [];
  }
}

/**
 * Update user role (admin only)
 * @param userId - User ID to update
 * @param newRole - New role
 * @throws Error if not admin
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<SafeUser | null> {
  const session = await getCurrentSession();
  requireAdmin(session);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    return getSafeUser(user);
  } catch {
    return null;
  }
}
