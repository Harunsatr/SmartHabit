/**
 * Enterprise authentication middleware
 * Route protection with role-based access control
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes (no auth required)
const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);

// Define admin routes (requires ADMIN role)
const ADMIN_ROUTES = new Set(["/admin"]);

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    /**
     * PUBLIC ROUTES
     * Allow access without authentication
     */
    if (PUBLIC_ROUTES.has(pathname)) {
      // If user is already logged in, redirect away from login/register
      if ((pathname === "/login" || pathname === "/register") && token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    /**
     * PROTECTED ROUTES
     * Require authentication (checked by withAuth callback below)
     */

    /**
     * ADMIN ROUTES
     * Require ADMIN role
     */
    if (pathname.startsWith("/admin")) {
      // Check if user is admin
      if (token?.role !== "ADMIN") {
        // Redirect non-admin to dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Authorized callback: determines if user can access protected routes
       * withAuth only calls this for matcher routes
       */
      authorized: ({ token }) => {
        // Allow if token exists
        return !!token;
      },
    },
  }
);

/**
 * Middleware matcher configuration
 * Only runs middleware for these routes
 * This improves performance for static routes
 */
export const config = {
  matcher: [
    // Protected dashboard routes
    "/dashboard/:path*",
    "/habits/:path*",
    "/analytics/:path*",
    "/insights/:path*",
    "/settings/:path*",
    // Admin routes
    "/admin/:path*",
    // Redirect authenticated users away from auth pages
    "/login",
    "/register",
  ],
};
