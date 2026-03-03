/**
 * Enterprise-grade authentication types
 * Centralized type definitions for all auth-related entities
 */

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  language: string;
  createdAt: Date;
};

export type SafeUser = Omit<AuthUser, "password"> & {
  id: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type JWTPayload = {
  sub: string; // user ID
  id: string;
  email: string;
  role: UserRole;
  language: string;
  iat?: number;
  exp?: number;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  user?: SafeUser;
  error?: string;
};

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  language: string;
};

export type AuthError =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SESSION_EXPIRED"
  | "INVALID_EMAIL"
  | "PASSWORD_MISMATCH"
  | "USER_EXISTS"
  | "DATABASE_ERROR";
