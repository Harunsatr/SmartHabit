/**
 * Enterprise authentication middleware
 * Route protection with role-based access control
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes (no auth required)
const PUBLIC_ROUTES = ["/", "/login", "/register"];

// Define admin routes (requires ADMIN role)
const ADMIN_ROUTES = ["/admin"];

// Define protected dashboard routes
const DASHBOARD_ROUTES = [
  "/dashboard",
  "/habits",
  "/analytics",
  "/insights",
  "/settings",
];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    /**
     * PUBLIC ROUTES
     * Allow access without authentication
     */
    if (PUBLIC_ROUTES.includes(pathname)) {
      // If user is already logged in, redirect away from login/register
      if ((pathname === "/login" || pathname === "/register") && token) {
        // Redirect based on role
        const redirectUrl = token?.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      return NextResponse.next();
    }

    /**
     * ADMIN ROUTES
     * Require ADMIN role exclusively
     */
    if (pathname.startsWith("/admin")) {
      if (!token) {
        // Not authenticated - redirect to login with callback
        return NextResponse.redirect(
          new URL("/login?callbackUrl=/admin&error=unauthorized", req.url)
        );
      }

      if (token.role !== "ADMIN") {
        // Authenticated but not admin - redirect to dashboard
        console.warn(
          `[Middleware] Non-admin user (${token.email}) attempted to access /admin`
        );
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    /**
     * DASHBOARD ROUTES
     * Require authentication
     */
    if (DASHBOARD_ROUTES.some((route) => pathname.startsWith(route))) {
      if (!token) {
        // Not authenticated - redirect to login
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${pathname}&error=unauthorized`, req.url)
        );
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
        // Allow if token exists (middleware will do detailed checks)
        return !!token || true; // Allow to pass; detailed checks in middleware
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
    // Auth pages (for redirect logic)
    "/login",
    "/register",
    // Dashboard routes
    "/dashboard/:path*",
    "/habits/:path*",
    "/analytics/:path*",
    "/insights/:path*",
    "/settings/:path*",
    // Admin routes (CRITICAL - must be protected)
    "/admin/:path*",
  ],
};
