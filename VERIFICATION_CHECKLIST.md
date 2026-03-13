# Auth System Verification Checklist

## Pre-Deployment Verification

### Environment Setup
- [ ] `NEXTAUTH_SECRET` is set in `.env.local`
- [ ] `DATABASE_URL` is configured and pointing to correct DB
- [ ] `NEXTAUTH_URL` matches deployment URL
- [ ] PostgreSQL database is running and accessible
- [ ] Prisma migrations have been applied

### Dependencies
- [ ] Run `npm install` to install all dependencies
- [ ] Verify no dependency conflicts
- [ ] Check `package.json` has required versions:
  - next-auth: ^4.24.7
  - @prisma/client: ^5.14.0
  - bcryptjs: ^2.4.3

### Database Schema
- [ ] `User` table exists with columns:
  - `id` (String, primary key)
  - `email` (String, unique)
  - `name` (String)
  - `password` (String)
  - `role` (UserRole enum: ADMIN | USER)
  - `language` (String, default: "en")
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- [ ] Prisma client is generated: `npx prisma generate`
- [ ] Database migrations are up to date: `npx prisma migrate status`

## File Verification

### Core Auth Files
- [ ] `lib/auth/auth.config.ts` - Contains NextAuth configuration
  - Verify JWT callback adds role
  - Verify session callback enriches with role
  - Verify redirect callback exists
- [ ] `lib/auth/auth.server.ts` - Server-side auth helpers
  - Verify `authenticateUser` function exists
  - Verify password comparison is timing-safe
- [ ] `lib/auth/auth.types.ts` - Type definitions
  - Verify `UserRole` enum defined
  - Verify `SessionUser` type includes role
- [ ] `middleware.ts` - Route protection
  - Verify admin route protection (line 42-48)
  - Verify matcher configuration

### API Endpoints
- [ ] `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
  - Verify `export const dynamic = "force-dynamic"`
  - Verify exports GET and POST
- [ ] `app/api/auth/register/route.ts` - Registration endpoint
  - Verify user creation with default role: USER
  - Verify bcrypt password hashing
  - Verify email uniqueness check
  - Verify 400/409/500 error responses

### Auth Pages
- [ ] `app/(auth)/login/page.tsx` - Login form
  - Verify role-based redirect logic (lines 36-50)
  - Verify session fetch call
  - Verify error handling
- [ ] `app/(auth)/register/page.tsx` - Registration form
  - Verify role-based redirect logic (lines 56-67)
  - Verify session fetch call
  - Verify form validation
- [ ] `app/(auth)/layout.tsx` - Auth layout wrapper
  - Verify children rendered correctly

### Protected Routes
- [ ] `app/(dashboard)/` - User dashboard (protected)
- [ ] `app/admin/` - Admin dashboard (protected)
  - Verify admin check in middleware
  - Verify 404 or redirect for non-admins

## Functionality Tests

### User Registration Flow
- [ ] Navigate to `/register`
- [ ] Fill all fields correctly
- [ ] Submit form
- [ ] Verify user created in database
- [ ] Verify password is hashed (not plain text)
- [ ] Verify user role is "USER"
- [ ] Verify redirected to `/dashboard`
- [ ] Verify user is logged in (session set)

### User Login Flow
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify user redirected to `/dashboard`
- [ ] Verify session contains user data
- [ ] Verify role in session is "USER"

### Admin Login Flow (if admin exists)
- [ ] Navigate to `/login`
- [ ] Enter admin credentials
- [ ] Verify user redirected to `/admin` (not `/dashboard`)
- [ ] Verify admin dashboard loads
- [ ] Verify session contains role "ADMIN"

### Logout Flow
- [ ] Click logout/sign out
- [ ] Verify session cleared
- [ ] Verify redirected to `/login` or `/`

### Route Protection
- [ ] Logout user
- [ ] Try to access `/dashboard`
- [ ] Verify redirected to `/login`
- [ ] Try to access `/admin`
- [ ] Verify redirected to `/login`
- [ ] Login as regular user
- [ ] Try to access `/admin`
- [ ] Verify redirected to `/dashboard` (or show error)

### Error Scenarios
- [ ] Enter non-existent email on login
- [ ] Verify error message shown
- [ ] Enter wrong password
- [ ] Verify error message shown
- [ ] Enter duplicate email on register
- [ ] Verify error message "Email already registered"
- [ ] Enter password < 8 characters on register
- [ ] Verify error message "Password must be at least 8 characters"

## Database Verification

### Manual Checks
1. Connect to database with tool (pgAdmin, DBeaver, etc.)
2. Check `User` table:
   ```sql
   SELECT id, email, role, created_at FROM "User" ORDER BY created_at DESC LIMIT 5;
   ```
3. Verify:
   - [ ] Users exist
   - [ ] Roles are either ADMIN or USER
   - [ ] Passwords are hashed (bcrypt format: $2a$...)
   - [ ] Created/updated timestamps are correct

4. Check indexes:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'User';
   ```
   Verify:
   - [ ] Index on email
   - [ ] Index on role

## Browser Console Checks

During login/register:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Check for errors:
   - [ ] No CORS errors
   - [ ] No 401/403 errors
   - [ ] No NextAuth session errors

4. Go to Application tab
5. Check Cookies:
   - [ ] `next-auth.session-token` exists after login
   - [ ] Cookie has correct domain
   - [ ] Cookie is httpOnly (secure flag in production)
   - [ ] Cookie maxAge matches configuration

## Network Verification

During authentication flow, verify API calls:
1. Open Network tab
2. Perform login
3. Check requests:
   - [ ] POST to `/api/auth/callback/credentials` - returns 302 redirect
   - [ ] GET to `/api/auth/session` - returns user data with role
   - [ ] Page navigation happens correctly

## Performance Checks

1. Login and monitor:
   - [ ] Page loads within 2 seconds
   - [ ] No unnecessary API calls
   - [ ] Session fetch completes < 500ms

2. Admin redirect check:
   - [ ] Admin login takes < 3 seconds total
   - [ ] No redirect loops detected

## Security Verification

### Password Storage
- [ ] Passwords never logged or exposed
- [ ] Passwords hashed with bcryptjs
- [ ] Test bcrypt verification works

### Session Security
- [ ] JWT secret is strong (32+ characters)
- [ ] Sessions expire after configured time
- [ ] Session data doesn't include passwords

### CSRF Protection
- [ ] CSRF tokens handled by NextAuth
- [ ] Form submissions protected

### SQL Injection
- [ ] Using Prisma (safe from SQL injection)
- [ ] No raw SQL queries with string interpolation

## Production Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] All verification tests pass
- [ ] Environment variables configured
- [ ] Database backups taken
- [ ] Rollback plan documented

### Post-Deployment
- [ ] Test login on production environment
- [ ] Test admin access
- [ ] Monitor error logs
- [ ] Verify database connectivity
- [ ] Check session creation in logs

## Rollback Plan

If authentication breaks in production:
1. [ ] Revert last auth-related commits
2. [ ] Check database for corruption
3. [ ] Verify environment variables
4. [ ] Restart application server
5. [ ] Clear browser cache/cookies
6. [ ] Test authentication again

## Sign-Off

- [ ] All checks completed
- [ ] All tests passed
- [ ] Ready for production

**Verified by:** _________________
**Date:** _________________
**Notes:** _________________________________________________
