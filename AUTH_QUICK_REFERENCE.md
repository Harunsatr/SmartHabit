# Authentication Quick Reference

**Quick lookup** for common auth tasks. See `ENTERPRISE_AUTH_GUIDE.md` for detailed docs.

## 📌 Most Used Functions

### Server Components

```typescript
import { getCurrentUser, verifyAuth, verifyAdminAuth } from "@/lib/auth";

// Get user (returns null if not authenticated)
const user = await getCurrentUser();

// Verify user is authenticated (throws if not)
const user = await verifyAuth();

// Verify user is admin (throws if not)
const admin = await verifyAdminAuth();
```

### Server Components - Role Checks

```typescript
import { getCurrentSession, isAdmin, hasRole, UserRole } from "@/lib/auth";

const session = await getCurrentSession();

if (isAdmin(session)) { /* admin code */ }
if (hasRole(session, UserRole.USER)) { /* user code */ }
```

### Server Actions (Client Components)

```typescript
"use server"
import { loginAction, registerAction, logoutAction } from "@/app/actions/auth.actions";

// In form/button handlers
await loginAction({ email, password });
await registerAction({ name, email, password, confirmPassword });
await logoutAction();
```

### API Routes

```typescript
import { verifyAuth, verifyAdminAuth, verifyUserAccess } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await verifyAuth();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await verifyAdminAuth();
    await verifyUserAccess(params.id); // Check user can access
    // ... delete operation
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

---

## 🔐 Common Patterns

### Protect a Server Component

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  
  return <div>Welcome, {user.name}</div>;
}
```

### Protect an Admin Page

```tsx
import { redirect } from "next/navigation";
import { verifyAdminAuth } from "@/lib/auth";

export default async function AdminPage() {
  try {
    const admin = await verifyAdminAuth();
    return <AdminDashboard user={admin} />;
  } catch {
    redirect("/dashboard");
  }
}
```

### Check Permission in API

```typescript
export async function PATCH(req: Request, { params }: any) {
  try {
    await verifyUserAccess(params.userId);
    // Allow if user is owner or admin
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

---

## 🚀 Environment Setup

### Required Environment Variables

```env
# Required
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000           # dev
NEXTAUTH_URL=https://yourdomain.com          # prod

# Database
DATABASE_URL=postgresql://...
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
# Output: AbCdEfGhIjKlMnOpQrStUvWxYz123456789+/=
```

---

## 📂 File Structure

```
lib/auth/
├── auth.config.ts    ← NextAuth config (edit for OAuth setup)
├── auth.types.ts     ← All TypeScript types
├── auth.utils.ts     ← Pure functions (no database)
├── auth.server.ts    ← Server import helpers (database)
├── rbac.ts           ← Role permission logic
├── constants.ts      ← Config constants
└── index.ts          ← Public exports

app/actions/
└── auth.actions.ts   ← Server actions for client forms

types/
└── next-auth.d.ts    ← NextAuth module extensions

middleware.ts         ← Route protection
```

---

## Types Cheat Sheet

```typescript
import {
  UserRole,        // enum: ADMIN, USER
  AuthUser,        // Full user with password
  SafeUser,        // User without password
  AuthCredentials, // { email, password }
  SessionUser,     // User in session
  JWTPayload,      // Token contents
  AuthResponse,    // { success, message, error }
} from "@/lib/auth";
```

---

## Role Enum

```typescript
enum UserRole {
  ADMIN = "ADMIN",  // Full system access
  USER = "USER",    // Limited access (own data only)
}
```

---

## Error Handling

### Auth Errors

```typescript
import { AUTH_CONSTANTS } from "@/lib/auth";

AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS
AUTH_CONSTANTS.ERRORS.USER_NOT_FOUND
AUTH_CONSTANTS.ERRORS.USER_EXISTS
AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
AUTH_CONSTANTS.ERRORS.FORBIDDEN
AUTH_CONSTANTS.ERRORS.DATABASE_ERROR
```

### Try-Catch Pattern

```typescript
export async function GET(req: Request) {
  try {
    const user = await verifyAuth();
    return NextResponse.json({ user });
  } catch (error) {
    if (error?.message?.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

---

## Session Types

```typescript
// NextAuth Session with Session type from imports
import { Session } from "next-auth";

interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    role: UserRole;
    language: string;
  };
  expires: string;
}
```

---

## 🔧 Common Tasks

| Task | Code |
|------|------|
| Get current user | `const user = await getCurrentUser();` |
| Check if admin | `if (isAdmin(session)) { ... }` |
| Require auth | `await verifyAuth();` |
| Require admin | `await verifyAdminAuth();` |
| Get user ID | `session?.user?.id` |
| Get user role | `session?.user?.role` |
| Hash password | `const hash = await hashPassword(pwd);` |
| Compare password | `const match = await comparePassword(pwd, hash);` |
| Validate email | `isValidEmail("user@example.com")` |
| Update user role | `await updateUserRole(userId, UserRole.ADMIN)` |
| Get all users | `const users = await getAllUsers(50, 0)` |

---

## ⚠️ Important Notes

- ✅ Always use `verifyAuth()` in API routes, not `getCurrentUser()`
- ✅ Role checks must happen on **server**, never just on client
- ✅ Never expose passwords or hashed passwords in responses
- ✅ Always use `export const dynamic = "force-dynamic"` in auth routes
- ✅ JWT token is sent in secure, httpOnly cookie - safe from XSS
- ❌ Don't store complex objects in JWT (keep token small)
- ❌ Don't make admin checks only on frontend
- ❌ Don't expose specific error messages (use generic "Invalid credentials")

---

## 🚀 Deployment

### Before Deploy

```bash
# ✅ Check for TypeScript errors
npm run build

# ✅ Test auth flow locally
npm run dev
# Try login at http://localhost:3000/login

# ✅ Generate NEXTAUTH_SECRET
openssl rand -base64 32

# ✅ Set Vercel environment variables
# Dashboard → Settings → Environment Variables
# NEXTAUTH_SECRET=<generated-value>
# DATABASE_URL=<neon-production-url>
```

### Verify on Vercel

1. Deploy to Vercel
2. Check Vercel Logs for errors
3. Try login at https://yourdomain.com/login
4. Verify session persists after refresh
5. Check admin access if admin user

---

## 📚 See Also

- **Full Guide**: [ENTERPRISE_AUTH_GUIDE.md](./ENTERPRISE_AUTH_GUIDE.md)
- **Setup Instructions**: [SETUP.md](./SETUP.md)
- **Deployment Guide**: [DEPLOY.md](./DEPLOY.md)

---

**Last Updated**: March 2026  
**Status**: Production-Ready
