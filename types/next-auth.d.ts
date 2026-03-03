/**
 * NextAuth type extensions
 * Extends NextAuth module to include custom properties
 */

import { UserRole } from "@/lib/auth";
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extended Session type
   * Includes custom user properties
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      language: string;
    };
  }

  /**
   * Extended User type
   * Includes custom properties returned by authorize
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    language: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type
   * Includes custom properties in token
   */
  interface JWT {
    id: string;
    sub: string; // User ID (standard JWT claim)
    email: string;
    role: UserRole;
    language: string;
  }
}
