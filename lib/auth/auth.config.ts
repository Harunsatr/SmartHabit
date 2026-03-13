/**
 * NextAuth configuration
 * Enterprise-grade authentication configuration
 * Centralized, clean, and maintainable
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTH_CONSTANTS } from "./constants";
import { authenticateUser } from "./auth.server";
import type { JWTPayload, SessionUser, UserRole } from "./auth.types";

export const authOptions: NextAuthOptions = {
  // Use JWT for stateless sessions (Vercel serverless compatible)
  session: {
    strategy: "jwt",
    maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
    updateAge: AUTH_CONSTANTS.SESSION.UPDATE_AGE,
  },

  // Secure secret
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key",

  // Custom sign-in and error pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Disable debug in production (prevents _log endpoint issues)
  debug: process.env.NODE_ENV === "development" && false,

  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === "production",

  // Custom cookie configuration
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? AUTH_CONSTANTS.COOKIE.SECURE_NAME
          : AUTH_CONSTANTS.COOKIE.DEVELOPMENT_NAME,
      options: {
        ...AUTH_CONSTANTS.COOKIE.OPTIONS,
        secure: process.env.NODE_ENV === "production",
        maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
      },
    },
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      // Authorize callback: validates credentials against database
      async authorize(credentials) {
        // Validate and authenticate user
        const user = await authenticateUser({
          email: credentials?.email || "",
          password: credentials?.password || "",
        });

        // Return null if authentication fails (no credentials logged)
        if (!user) return null;

        // Return user object to JWT callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
        };
      },
    }),

    // TODO: Add OAuth providers for future expansion
    // GoogleProvider({...}),
    // GitHubProvider({...}),
  ],

  // Callbacks: Transform tokens and sessions
  callbacks: {
    /**
     * JWT callback: Called whenever JWT is created or updated
     * Stores minimal data in token
     */
    async jwt({ token, user }) {
      // Add user data to token on initial sign in
      if (user) {
        token.sub = user.id; // Subject (user ID)
        token.id = user.id;
        token.email = user.email || "";
        token.role = (user.role as unknown as UserRole) || "USER";
        token.language = (user.language as string) || "en";
      }

      return token as JWTPayload;
    },

    /**
     * Session callback: Called whenever session is accessed
     * Enriches session with data from token
     * CRITICAL: Must properly pass role to client
     */
    async session({ session, token }) {
      if (session.user && token) {
        // Add custom properties from JWT to session
        session.user.id = (token.id as string) || token.sub || "";
        // IMPORTANT: Ensure role is properly set
        session.user.role = ((token.role as UserRole) || "USER") as UserRole;
        session.user.language = (token.language as string) || "en";
        
        // Debug logging (remove in production)
        if (process.env.NODE_ENV === "development") {
          console.log("[Session] User session:", {
            userId: session.user.id,
            role: session.user.role,
            email: session.user.email,
          });
        }
      }

      return session as { user: SessionUser; expires: string };
    },

    /**
     * Redirect callback: Handles post-login redirects
     * Routes users based on their role
     */
    async redirect({ url, baseUrl }) {
      // Allow redirects to relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirects to same origin
      else if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },
};

/**
 * Export default for easier imports
 */
export default authOptions;
