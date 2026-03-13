# Authentication Redirect Fix - SmartHabit

## Problem
Admin users were not being redirected to the admin panel after login. Both admin and regular users were being redirected to `/dashboard`.

## Solution
Implemented role-based redirect logic that:
1. Checks the user's role from the NextAuth session after successful login
2. Redirects ADMIN users to `/admin`
3. Redirects USER users to `/dashboard`
4. Respects custom callback URLs when provided

## Changes Made

### 1. Login Page (`app/(auth)/login/page.tsx`)
- Added role-aware redirect logic
- Fetches session after successful authentication
- Checks user role and determines appropriate redirect destination
- Defaults to `/dashboard` for users, redirects to `/admin` for admins
- Added 100ms delay to ensure session is updated before fetching

**Key Changes:**
```typescript
// After successful login:
const sessionResponse = await fetch("/api/auth/session");
const sessionData = await sessionResponse.json();

let redirectUrl = "/dashboard"; // default
if (sessionData?.user?.role === "ADMIN") {
  redirectUrl = "/admin";
}
window.location.href = redirectUrl;
```

### 2. Register Page (`app/(auth)/register/page.tsx`)
- Implemented same role-aware redirect logic
- After auto sign-in following registration
- New users are typically created with USER role (can be changed by admin)
- Respects the same redirect logic as login

**Key Changes:**
```typescript
// After auto sign-in:
const sessionResponse = await fetch("/api/auth/session");
const sessionData = await sessionResponse.json();

const redirectUrl = sessionData?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
router.push(redirectUrl);
```

### 3. Auth Config (`lib/auth/auth.config.ts`)
- Added redirect callback for proper URL handling
- Ensures safe redirect URLs (prevents open redirects)

## How It Works

### Authentication Flow
1. User submits login/register form
2. NextAuth credentials provider validates credentials
3. User is authenticated and JWT token is created
4. Session is created with user data including role
5. Client code fetches `/api/auth/session` to get updated session
6. User role is checked and appropriate page is loaded

### Role-Based Routing
- **ADMIN role → `/admin` (Admin Dashboard)**
- **USER role → `/dashboard` (User Dashboard)**

### Middleware Protection
The middleware (`middleware.ts`) provides additional protection:
- Checks user role for `/admin` routes
- Redirects non-admin users to `/dashboard`
- Allows authenticated users to access their respective areas

## Testing

### Test Case 1: Regular User Login
1. Go to `/login`
2. Enter valid user credentials (non-admin)
3. Should be redirected to `/dashboard`

### Test Case 2: Admin User Login
1. Go to `/login`
2. Enter valid admin credentials
3. Should be redirected to `/admin`

### Test Case 3: Regular User Registration
1. Go to `/register`
2. Fill in registration form
3. After registration and auto sign-in
4. Should be redirected to `/dashboard`

### Test Case 4: Admin Access Protection
1. Non-admin user tries to access `/admin`
2. Middleware should redirect to `/dashboard`

## Environment Requirements
- `NEXTAUTH_SECRET` must be set
- `DATABASE_URL` must be configured
- PostgreSQL database must be running

## Files Modified
- `app/(auth)/login/page.tsx` - Login form with role-based redirect
- `app/(auth)/register/page.tsx` - Register form with role-based redirect
- `lib/auth/auth.config.ts` - Added redirect callback

## Notes
- The `/api/auth/session` endpoint is provided by NextAuth
- Role information flows through JWT token → Session → Client
- Uses window.location for full page reload to ensure cookies are properly set
- 100ms delay added to allow session to update before fetching

## Future Improvements
- Consider caching session data client-side to avoid extra fetch
- Add role information to JWT to reduce session fetch calls
- Implement deeper session management testing
