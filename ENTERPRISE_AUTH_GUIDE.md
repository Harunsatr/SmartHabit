# Enterprise Authentication Architecture

**Status**: Production-Ready | **Last Updated**: March 2026

## 🎯 Overview

This document describes the refactored, enterprise-grade authentication system for SmartHabit. The system is built on clean architecture principles with a focus on security, scalability, and maintainability.

---

## 📁 Architecture Structure

```
lib/auth/                          # Authentication module
├── auth.config.ts                 # NextAuth configuration (main config)
├── auth.types.ts                  # TypeScript type definitions
├── auth.utils.ts                  # Pure utility functions (no database)
├── auth.server.ts                 # Server-side helpers (database operations)
├── rbac.ts                         # Role-Based Access Control utilities
├── constants.ts                    # Configuration constants
└── index.ts                        # Public API exports

app/actions/
└── auth.actions.ts                # Server actions for client-side auth flows

types/
└── next-auth.d.ts                 # NextAuth module extensions

middleware.ts                       # Route protection middleware (enhanced)
```

### Why This Structure?

| File | Purpose | Why Separate? |
|------|---------|---------------|
| **auth.config.ts** | NextAuth options | Configuration is large and changes frequently. Easier to reference and modify. |
| **auth.types.ts** | Type definitions | Types are for documentation. Isolated for clarity and reusability. |
| **auth.utils.ts** | Pure functions | No side effects, no database, testable. Can be used anywhere. |
| **auth.server.ts** | Server helpers | Database operations. Server-side only. Clear intent. |
| **rbac.ts** | Permission checking | Permission logic is separate concern. Easy to audit and extend. |
| **constants.ts** | Config values | Single source of truth for all auth constants. |
| **index.ts** | Public API | Clean exports. Prevents internal API leakage. |

---

## 🔐 Security Features

### 1. **Password Security**
- ✅ Bcrypt hashing (10 salt rounds)
- ✅ Timing attack prevention (constant-time comparison)
- ✅ Minimum 8 characters required
- ✅ Password validation before hashing

```typescript
// Usage
const hashedPassword = await hashPassword(plainPassword);
const isValid = await comparePassword(plainPassword, hashedPassword);
```

### 2. **JWT Session Strategy**
- ✅ Stateless sessions (serverless-friendly)
- ✅ Minimal JWT payload (performance optimized)
- ✅ 7-day expiration by default
- ✅ Secure HTTP-only cookies

```typescript
// JWT payload structure (minimal)
{
  sub: "user-id",           // User ID (standard JWT)
  id: "user-id",            // Application ID
  email: "user@example.com",
  role: "ADMIN",            // Role stored in token
  language: "en",           // User preference
  iat: 1234567890,          // Issued at
  exp: 1234567890           // Expires at
}
```

### 3. **Role-Based Access Control (RBAC)**

**Roles:**
```typescript
enum UserRole {
  ADMIN = "ADMIN",   // Full system access
  USER = "USER",     // User-level access
}
```

**Permission Matrix:**
```typescript
ADMIN can:
  ✓ View all users    ✓ Manage roles       ✓ Delete any habit
  ✓ Edit any user     ✓ Audit logs         ✓ Access admin panel
  ✓ View analytics    ✓ View all habits

USER can:
  ✓ View own habits   ✓ Edit own profile   ✓ View own analytics
  ✗ View other users  ✗ Edit other data    ✗ Access admin panel
```

### 4. **Cookie Security**

| Environment | Cookie Name | Secure | HttpOnly | SameSite |
|---|---|---|---|---|
| **Production** | `__Secure-next-auth.session-token` | ✅ HTTPS only | ✅ Yes | lax |
| **Development** | `next-auth.session-token` | ⚠️ HTTP allowed | ✅ Yes | lax |

### 5. **Information Leakage Prevention**
- ✅ Never return raw user objects from database
- ✅ Always use `getSafeUser()` function
- ✅ No password data exposed in responses
- ✅ Consistent error messages (don't leak user existence)

---

## 🛠 Usage Examples

### 1. **Server Component - Get Current User**

```tsx
// app/(dashboard)/dashboard/page.tsx
import { getCurrentUser, verifyAuth } from "@/lib/auth";

export default async function DashboardPage() {
  // Method 1: Graceful null if not authenticated
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Method 2: Throw error if not authenticated
  const currentUser = await verifyAuth();

  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Role: {currentUser.role}</p>
    </div>
  );
}
```

### 2. **Protected Admin Route**

```tsx
// app/admin/page.tsx
import { verifyAdminAuth } from "@/lib/auth";

export default async function AdminPage() {
  const admin = await verifyAdminAuth(); // Throws if not admin

  return <AdminDashboard user={admin} />;
}
```

### 3. **API Route - Get Current User**

```typescript
// app/api/user/profile/route.ts
import { getCurrentSession, verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await verifyAuth();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

### 4. **API Route - Admin Only**

```typescript
// app/api/admin/users/route.ts
import { verifyAdminAuth, getAllUsers } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await verifyAdminAuth(); // Throws if not admin
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}
```

### 5. **Client Component - Login Form**

```tsx
// app/(auth)/login/page.tsx
"use client";

import { loginAction } from "@/app/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleLogin(formData: FormData) {
    const result = await loginAction({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Redirect to dashboard after login
    router.push("/dashboard");
  }

  return (
    <form action={handleLogin}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### 6. **Check Role in Server Component**

```tsx
// app/(dashboard)/admin-section/page.tsx
import { getCurrentSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminSection() {
  const session = await getCurrentSession();

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  return <AdminContent />;
}
```

### 7. **RBAC Permission Check**

```typescript
// app/api/habits/[id]/route.ts
import { getCurrentSession, canAccessUserData } from "@/lib/auth";
import { verifyUserAccess } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    // Verify user can access this user's data
    // (throws if not owner or admin)
    await verifyUserAccess(params.id);

    const habit = await getHabitById(params.id);
    return NextResponse.json({ habit });
  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}
```

---

## 🔄 Authentication Flow

### Login Flow

```
Client Form
    ↓
loginAction() [server action]
    ↓
signIn("credentials", {...}) [NextAuth]
    ↓
CredentialsProvider.authorize()
    ↓
authenticateUser() [validates credentials]
    ↓
bcrypt.compare() [check password]
    ↓
JWT callback [create token]
    ↓
Session callback [enrich session]
    ↓
Client redirected to /dashboard
```

### Protected Route Access

```
Client requests /dashboard
    ↓
Middleware checks token
    ↓
withAuth callback → authorized({ token })
    ↓
If token exists → allow
    ↓
If no token → redirect to /login
```

### Role-Based Route Access

```
Client requests /admin
    ↓
Middleware checks token.role
    ↓
If token.role === "ADMIN" → allow
    ↓
If token.role !== "ADMIN" → redirect to /dashboard
```

---

## 🚀 Deployment & Vercel Optimization

### Why This Architecture Works on Vercel

1. **Stateless Sessions (JWT)**
   - ✅ No server-side session storage needed
   - ✅ Scales infinitely across serverless functions
   - ✅ No sticky sessions required

2. **No File System Storage**
   - ✅ No reliance on `/tmp` directories
   - ✅ Database is single source of truth
   - ✅ Works with stateless invocations

3. **Minimal Database Calls**
   - ✅ User info fetched only when needed
   - ✅ Permission checks from JWT (no DB call)
   - ✅ Caching friendly

4. **Prisma Serverless Optimized**
   - ✅ Connection pooling via Neon
   - ✅ Singleton Prisma instance (lib/prisma.ts)
   - ✅ Works with `force-dynamic` exports

### Deployment Checklist

```bash
# ✅ Set environment variables
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://...neon...

# ✅ Build locally first
npm run build

# ✅ Push to GitHub
git push origin main

# ✅ Monitor Vercel deployment
# Check Functions, Logs, and Deployments tabs
```

---

## 🧪 Testing Strategy

### Unit Tests (for utilities)

```typescript
// tests/auth.utils.test.ts
import { validateCredentials, isValidEmail } from "@/lib/auth";

describe("Auth Utils", () => {
  test("validateCredentials rejects missing email", () => {
    const result = validateCredentials({ password: "test" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("INVALID_EMAIL");
  });

  test("isValidEmail validates email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
  });
});
```

### Integration Tests (with database mocks)

```typescript
// tests/auth.server.test.ts
import { authenticateUser } from "@/lib/auth";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Auth Server", () => {
  test("authenticateUser returns user on valid credentials", async () => {
    // Mock user in database
    prismaMock.user.findUnique.mockResolvedValue({
      id: "123",
      email: "user@example.com",
      password: "$2a$10$...", // hashed password
      role: "USER",
      language: "en",
    });

    const result = await authenticateUser({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(result?.id).toBe("123");
  });
});
```

### Manual Testing Checklist

```
[ ] Login with valid credentials → redirects to /dashboard
[ ] Login with invalid email → shows error
[ ] Login with wrong password → shows error
[ ] Login with non-existent user → shows generic error
[ ] Register new user → creates user in database
[ ] Register with duplicate email → shows error
[ ] Session persists after page refresh
[ ] Logout clears session
[ ] Accessing /admin as USER → redirects to /dashboard
[ ] Accessing /admin as ADMIN → allows access
[ ] Accessing /dashboard without auth → redirects to /login
[ ] JWT token in cookie is httpOnly → cannot access from JS
[ ] Token expires after 7 days → user forced to re-login
[ ] Role persists in session across requests
```

---

## 🔧 Extending the System

### Adding OAuth Provider (Google)

```typescript
// lib/auth/auth.config.ts
import GoogleProvider from "next-auth/providers/google";

providers: [
  // ... existing Credentials provider
  GoogleProvider({
    clientId: process.env.GOOGLE_ID || "",
    clientSecret: process.env.GOOGLE_SECRET || "",
  }),
]
```

### Adding 2FA Support

```typescript
// lib/auth/auth.server.ts
export async function enable2FA(userId: string): Promise<{ secret: string }> {
  const secret = generateTOTPSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });
  return { secret };
}

export async function verify2FA(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true },
  });
  return verifyTOTP(user?.twoFactorSecret || "", code);
}
```

### Adding Refresh Tokens

```typescript
// prisma/schema.prisma
model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🛡 Security Best Practices

### What NOT to Do

❌ **Don't store sensitive data in JWT**
```typescript
// ❌ WRONG
token.email = user.email;     // Exposed in JWT (for all to see)
token.password = user.password; // NEVER
```

✅ **Do store minimal data in JWT**
```typescript
// ✅ CORRECT
token.sub = user.id;          // Only ID
token.role = user.role;        // Role for quick checks
```

---

❌ **Don't use client-side role checks for security**
```typescript
// ❌ WRONG - Can be bypassed
if (session.user.role === "ADMIN") { // User can modify JWT
  showAdminPanel();
}
```

✅ **Do verify role on server**
```typescript
// ✅ CORRECT - Server verification
try {
  await verifyAdminAuth(); // Checks role on server
  return adminData;
} catch {
  return forbidden();
}
```

---

❌ **Don't expose error details**
```typescript
// ❌ WRONG
if (!user) return "User not found";          // Leaks user existence
if (password_hash !== input_hash) return "Wrong password"; // Leaks auth attempt
```

✅ **Do use generic errors**
```typescript
// ✅ CORRECT
return "Invalid credentials";  // Same error for all cases
```

---

## 📊 Performance Optimizations

### 1. Database Query Optimization

```typescript
// ❌ SLOW - N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const habits = await prisma.habit.findMany();
}

// ✅ FAST - Single query with relations
const users = await prisma.user.findMany({
  include: { habits: true },
});
```

### 2. Session Update Caching

```typescript
// NextAuth only updates session if data changed
session: {
  maxAge: 7 * 24 * 60 * 60,      // 7 days
  updateAge: 24 * 60 * 60,        // Update every 24 hours
}
```

### 3. Prisma Singleton Pattern

```typescript
// lib/prisma.ts
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
```

---

## 📝 Migration Guide (From Old System)

### 1. Update Imports
```typescript
// ❌ OLD
import { authOptions } from "@/lib/auth";

// ✅ NEW
import { authOptions } from "@/lib/auth/auth.config";
// or use main import
import { default as authOptions } from "@/lib/auth";
```

### 2. Use New Helper Functions
```typescript
// ❌ OLD - No helper available
const session = await getServerSession(authOptions);
if (!session) throw new Error("Unauthorized");

// ✅ NEW - Use helper
const user = await verifyAuth(); // Single function
```

### 3. RBAC Checks
```typescript
// ❌ OLD - Inline checks
if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

// ✅ NEW - Use dedicated utility
requireAdmin(session); // Cleaner, reusable
```

---

## 🎓 Key Learnings

1. **Modular Structure** = Easier testing, maintenance, and scaling
2. **Role in JWT** = No database call needed for permission checks
3. **Server Actions** = Clean client-server separation
4. **Middleware Protection** = Never trust client routes
5. **Type Safety** = NextAuth types extended with custom properties
6. **Serverless** = JWT sessions work better than server sessions

---

## 📞 Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `NextAuth is not configured properly` | Missing NEXTAUTH_SECRET | Set `NEXTAUTH_SECRET` env var |
| `Session is null in server component` | Not in protected route | Wrap with session check or redirect |
| `User can access /admin | Role check not working | Check middleware matcher paths |
| `Password hash is invalid` | Bcrypt version mismatch | Ensure bcryptjs ^2.4.3 |
| `CORS error on API calls` | Cookie not being sent | Add `credentials: "include"` to fetch |
| `Session expires too quickly` | maxAge too small | Check AUTH_CONSTANTS.SESSION.MAX_AGE |

---

## 🎉 Summary

This enterprise-grade authentication system provides:

✅ Clean, modular architecture  
✅ Security best practices (bcrypt, JWT, secure cookies)  
✅ Role-based access control (RBAC)  
✅ Serverless optimization (Vercel ready)  
✅ Type-safe implementations  
✅ Server-side verification only  
✅ Scalable for future expansion  
✅ Production-ready code  

The system is built to scale from 1 to 1 million users without architectural changes.
