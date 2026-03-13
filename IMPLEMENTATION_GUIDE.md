# Authentication System Implementation Guide - SmartHabit

## Overview
This guide explains the complete authentication system for SmartHabit, including the recent fixes for admin redirect functionality.

## Authentication Architecture

### Components
1. **NextAuth v4.24.7** - Authentication framework
2. **Credentials Provider** - Email/password authentication
3. **JWT Strategy** - Stateless, serverless-compatible sessions
4. **PostgreSQL + Prisma** - Database & ORM
5. **bcryptjs** - Password hashing

### Authentication Flow

```
User Registration
    ↓
POST /api/auth/register
    ↓
User stored in DB (role: "USER" by default)
    ↓
Auto sign-in with credentials
    ↓
NextAuth creates JWT token
    ↓
Session callback adds role to session
    ↓
Client checks role and redirects
    ↓
├─ ADMIN → /admin
└─ USER → /dashboard
```

### Login Flow
```
User Login Page (/login)
    ↓
POST credentials via signIn()
    ↓
NextAuth Credentials Provider
    ↓
Validates against DB
    ↓
JWT token created
    ↓
Session updated with user data
    ↓
Client fetches /api/auth/session
    ↓
Role-based redirect logic
    ↓
├─ ADMIN role → /admin
└─ USER role → /dashboard
```

## Key Files

### 1. Configuration Files

#### `lib/auth/auth.config.ts`
- NextAuth configuration
- JWT and session callbacks
- Credentials provider setup
- Custom pages configuration

**Important:** The session callback adds user role to the session:
```typescript
session.user.role = ((token.role as unknown as UserRole) || "USER") as UserRole;
```

#### `middleware.ts`
- Route protection
- Admin access control
- Automatic redirects

**Key Features:**
- Admin routes check user role
- Redirects non-admin users to `/dashboard`
- Allows authenticated users to their areas

### 2. Authentication Pages

#### `app/(auth)/login/page.tsx`
- Email and password input
- Password visibility toggle
- Role-based redirect after login
- Error handling

**Key Logic:**
```typescript
// Fetch session and check role
const sessionData = await fetch("/api/auth/session").then(r => r.json());
if (sessionData?.user?.role === "ADMIN") {
  redirect to "/admin"
} else {
  redirect to "/dashboard"
}
```

#### `app/(auth)/register/page.tsx`
- Name, email, password input
- Password strength indicator
- Auto sign-in after registration
- Role-based redirect

**Default Behavior:**
- New users created with `role: "USER"`
- Redirected to `/dashboard`
- Admins must be promoted by existing admins

### 3. API Endpoints

#### `POST /api/auth/register`
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 400: Missing/invalid fields, weak password
- 409: Email already registered
- 500: Server error

#### `GET /api/auth/session`
Returns current user's session including role.

**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "language": "en"
  },
  "expires": "2024-12-31T23:59:59.000Z"
}
```

### 4. Type Definitions

#### `lib/auth/auth.types.ts`

**UserRole Enum:**
```typescript
enum UserRole {
  ADMIN = "ADMIN",    // Full system access
  USER = "USER"       // Limited user access
}
```

**SessionUser:**
```typescript
type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
  language: string;
}
```

## Setup Instructions

### 1. Environment Variables
Create `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/smarthabit?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-key"
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Testing Scenarios

### Test 1: Register and Login as Regular User
1. Go to `/register`
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123"
3. Click "Create Account"
4. **Expected:** Redirected to `/dashboard`

### Test 2: Login as Admin (requires existing admin)
1. Go to `/login`
2. Enter admin credentials
3. **Expected:** Redirected to `/admin`
4. **Verify:** Admin analytics page loads

### Test 3: Unauthorized Access Prevention
1. Logout or open incognito window
2. Try to access `/admin`
3. **Expected:** Middleware redirects to `/login`
4. Can also try `/dashboard` - should redirect to `/login`

### Test 4: Duplicate Email Prevention
1. Go to `/register`
2. Use email already registered
3. **Expected:** Error message "Email already registered"

### Test 5: Password Strength Validation
1. Go to `/register`
2. Try password < 8 characters
3. **Expected:** Error "Password must be at least 8 characters"

## Admin User Management

### Creating an Admin User
Use database admin tools or Prisma Studio:

```bash
npx prisma studio
```

Then manually update user's role to "ADMIN" in the User table.

Or via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Promoting Users to Admin
Admins can manage users (future feature):
```typescript
await updateUserRole(userId, UserRole.ADMIN);
```

## Security Features

### Password Security
- Minimum 8 characters required
- Hashed with bcryptjs (salt rounds: 10)
- Timing-safe comparison prevents brute force

### Session Security
- JWT-based (stateless)
- Secure httpOnly cookies
- Automatic expiration
- Session max age: 30 days (configurable)

### Route Protection
- Middleware validates auth for protected routes
- Role-based access control (RBAC)
- Cannot access admin panel without ADMIN role

### Data Protection
- No passwords in API responses
- Session data doesn't include password hash
- User objects sanitized before returning

## Troubleshooting

### Issue: Admin not redirected to /admin after login
**Solution:**
1. Verify user role is "ADMIN" in database
2. Check that `/api/auth/session` returns correct role
3. Ensure middleware.ts is in root directory

### Issue: Users redirected to login on every page load
**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify database connection
3. Check browser cookies are enabled
4. Review NextAuth debug logs

### Issue: Registration fails
**Solution:**
1. Check database connection
2. Verify email not already registered
3. Check password meets requirements (8+ chars)
4. Look for database constraint violations

### Issue: Cannot login
**Solution:**
1. Verify user exists in database
2. Check email is correct (case-sensitive in validation)
3. Verify password is correct
4. Check database is running

## Performance Considerations

### Current Implementation
- Session fetch happens on every login/register
- 100ms delay added to ensure session updates
- Middleware validates on each request

### Optimization Opportunities
1. **Cache session client-side** - Reduce /api/auth/session calls
2. **Use useSession hook** - React hook for session state
3. **Implement session events** - Listen for session changes

Example with useSession:
```typescript
const { data: session } = useSession();
if (session?.user?.role === "ADMIN") {
  // Show admin interface
}
```

## Future Improvements

1. **OAuth Integration**
   - Google Sign-in
   - GitHub Sign-in
   - Microsoft 365

2. **Two-Factor Authentication**
   - Email verification
   - TOTP support

3. **Advanced Admin Features**
   - User management dashboard
   - Role and permission management
   - Audit logs

4. **Session Management**
   - Multiple active sessions
   - Session revocation
   - Device management

## References

- [NextAuth.js Documentation](https://next-auth.js.org)
- [JWT Authentication](https://jwt.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the AUTH_REDIRECT_FIX.md document
3. Check NextAuth debug logs
4. Verify environment variables
