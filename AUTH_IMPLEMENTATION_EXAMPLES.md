# Enterprise Authentication - Implementation Examples

This file shows real-world examples of how to use the refactored authentication system.

---

## 1. Protected Dashboard Page

**File**: `app/(dashboard)/dashboard/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // Method 1: Graceful redirect if not authenticated
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user-specific data
  const habitsCount = await prisma.habit.count({
    where: { userId: user.id },
  });

  const completedToday = await prisma.habitLog.count({
    where: {
      habit: { userId: user.id },
      date: new Date().toISOString().split("T")[0],
      completed: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Habits</p>
          <p className="text-4xl font-bold">{habitsCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Completed Today</p>
          <p className="text-4xl font-bold">{completedToday}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Your Role</p>
          <p className="text-xl font-semibold">{user.role}</p>
        </div>
      </div>

      {/* User can see their data */}
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">User ID: {user.id}</p>
        <p className="text-sm">Email: {user.email}</p>
        <p className="text-sm">Language: {user.language}</p>
      </div>
    </div>
  );
}
```

---

## 2. Admin Only Page

**File**: `app/admin/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { verifyAdminAuth, getAllUsers } from "@/lib/auth";

export default async function AdminDashboard() {
  let admin: Awaited<ReturnType<typeof verifyAdminAuth>> | null = null;
  let users = [];

  try {
    // This throws if user is not admin
    admin = await verifyAdminAuth();
    users = await getAllUsers(100);
  } catch (error) {
    // If not admin, redirect to dashboard
    redirect("/dashboard");
  }

  if (!admin) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="bg-yellow-50 p-4 rounded">
        <p className="text-sm font-semibold">Admin Access Verified</p>
        <p className="text-sm">You have full system access</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Total Users: {users.length}</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between p-3 bg-white rounded shadow">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Login Form Component

**File**: `app/(auth)/login/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginAction({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      // Login successful, redirect to dashboard
      // window.location.href ensures cookies are set before redirect
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">SmartHabit</h1>
          <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>

          {/* Demo credentials for testing */}
          <div className="mt-6 p-4 bg-gray-50 rounded text-xs">
            <p className="font-semibold mb-2">Demo Accounts:</p>
            <p>Admin: admin321@gmail.com / admin320</p>
            <p>User: userbrok@gmail.com / brokuser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. API Route - Get User Profile

**File**: `app/api/user/profile/route.ts`

```typescript
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/profile
 * Returns current user's profile
 * Requires authentication
 */
export async function GET() {
  try {
    // Verify user is authenticated (throws if not)
    const user = await verifyAuth();

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("[GET /api/user/profile]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }
}
```

---

## 5. API Route - Admin Only (Delete User)

**File**: `app/api/admin/users/[id]/route.ts`

```typescript
import { verifyAdminAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 * Requires ADMIN role
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is admin (throws if not)
    await verifyAdminAuth();

    const userId = params.id;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Cannot delete self
    const session = await verifyAdminAuth(); // Get current admin user
    if (session.id === userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete your own account",
        },
        { status: 400 }
      );
    }

    // Delete user and related data (cascading deletes)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message?.includes("Forbidden")
          ? "Admin access required"
          : "Internal server error",
      },
      { status: error?.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}
```

---

## 6. API Route - Check User's Own Habit

**File**: `app/api/habits/[id]/route.ts`

```typescript
import { getCurrentSession, verifyUserAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/habits/[id]
 * Get habit details if user is owner or admin
 * Requires authentication
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
      include: { logs: true },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found" },
        { status: 404 }
      );
    }

    // Verify user can access this habit
    // (throws if not owner or admin)
    try {
      await verifyUserAccess(habit.userId);
    } catch {
      return NextResponse.json(
        { error: "Forbidden - cannot access this habit" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { habit },
    });
  } catch (error) {
    console.error("[GET /api/habits/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 7. Client Component with Session Check

**File**: `components/UserMenu.tsx`

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-12 h-12 bg-gray-200 rounded-full" />;
  }

  if (!session) {
    return (
      <Link href="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">{session.user?.name}</span>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
```

---

## 8. Role-Based Content Rendering

**File**: `app/(dashboard)/layout.tsx`

```tsx
import { getCurrentSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userIsAdmin = isAdmin(session);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg p-6">
        <h2 className="font-bold text-lg mb-6">SmartHabit</h2>
        
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="hover:bg-gray-100 p-2 rounded block">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/habits" className="hover:bg-gray-100 p-2 rounded block">
              Habits
            </a>
          </li>
          <li>
            <a href="/analytics" className="hover:bg-gray-100 p-2 rounded block">
              Analytics
            </a>
          </li>
          
          {/* Admin Section - Only visible to admins */}
          {userIsAdmin && (
            <li className="pt-4 border-t mt-4">
              <a href="/admin" className="hover:bg-yellow-100 p-2 rounded block font-semibold">
                Admin Panel
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 9. Form with Server Action

**File**: `app/(dashboard)/settings/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { updateLanguageAction } from "@/app/actions/auth.actions";

export default function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");

  async function handleLanguageChange(newLanguage: string) {
    setLanguage(newLanguage);
    const result = await updateLanguageAction(newLanguage);
    
    if (result.success) {
      setMessage("Language updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.error || "Failed to update language");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Language Preference</h2>
        
        <div className="space-y-2">
          {["en", "id", "zh"].map((lang) => (
            <label key={lang} className="flex items-center">
              <input
                type="radio"
                name="language"
                value={lang}
                checked={language === lang}
                onChange={() => handleLanguageChange(lang)}
                className="mr-2"
              />
              <span>
                {lang === "en" ? "English" : lang === "id" ? "Bahasa Indonesia" : "中文"}
              </span>
            </label>
          ))}
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📌 Key Takeaways

1. **Server Components** import from `@/lib/auth` directly
2. **Client Components** use Server Actions from `@/app/actions`
3. **API Routes** use `verifyAuth()` or `verifyAdminAuth()` for protection
4. **All database access** happens server-side only
5. **Role checks** happen on server, never just on client
6. **Add `export const dynamic = "force-dynamic"`** to all auth-related routes

---

**See full documentation**: [ENTERPRISE_AUTH_GUIDE.md](./ENTERPRISE_AUTH_GUIDE.md)
