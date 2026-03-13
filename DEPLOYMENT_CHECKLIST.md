# SmartHabit Authentication - Deployment Checklist

## ✅ Pre-Deployment

### Environment Setup
- [ ] `.env.local` file created
- [ ] `DATABASE_URL` configured (PostgreSQL)
- [ ] `NEXTAUTH_SECRET` set (min 32 characters, use: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to deployment URL
- [ ] `OPENAI_API_KEY` set (optional, for AI features)

### Code Review
- [ ] Review changes in `middleware.ts`
- [ ] Review changes in `app/(auth)/login/page.tsx`
- [ ] Review changes in `app/(auth)/register/page.tsx`
- [ ] No hardcoded secrets in code
- [ ] No console.logs in production code

### Dependencies
- [ ] Run `npm install` to update dependencies
- [ ] Check for dependency conflicts
- [ ] Verify versions in package.json:
  - [ ] `next`: 14.2.5
  - [ ] `next-auth`: 4.24.7
  - [ ] `@prisma/client`: 5.14.0
  - [ ] `bcryptjs`: 2.4.3

### Database
- [ ] PostgreSQL database created
- [ ] Database connection verified: `psql <DATABASE_URL>`
- [ ] Prisma schema reviewed: `cat prisma/schema.prisma`
- [ ] Migrations generated: `npx prisma generate`
- [ ] Migrations applied: `npx prisma migrate dev`
- [ ] User table created with correct schema
- [ ] Indexes created (email, role)

### Initial Admin Setup
- [ ] Create first admin user (see below)
- [ ] Test admin login locally
- [ ] Verify admin redirects to /admin
- [ ] Admin user credentials documented (securely)

---

## 🧪 Testing (Local Development)

### Registration Flow
- [ ] Navigate to `http://localhost:3000/register`
- [ ] Fill form with valid data
- [ ] Password requirements checked (8+ chars)
- [ ] Click "Create Account"
- [ ] User redirected to `/dashboard`
- [ ] User appears in database with role="USER"
- [ ] User data shows no plain-text password

### Login Flow
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter valid credentials
- [ ] Click "Sign In"
- [ ] User redirected to `/dashboard`
- [ ] Session data contains user info
- [ ] Session data contains role="USER"

### Admin Login Flow
- [ ] Set existing user role to "ADMIN" in database:
  ```sql
  UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
  ```
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter admin credentials
- [ ] Click "Sign In"
- [ ] User redirected to `/admin` (NOT `/dashboard`)
- [ ] Admin page loads correctly
- [ ] Session data shows role="ADMIN"

### Error Handling
- [ ] Non-existent email on login → Error message shown
- [ ] Wrong password → Error message shown
- [ ] Duplicate email on register → Error message shown
- [ ] Password < 8 chars → Error message shown
- [ ] Missing fields → Error message shown

### Route Protection
- [ ] Logout or use incognito
- [ ] Try to access `/dashboard` → Redirected to `/login`
- [ ] Try to access `/admin` → Redirected to `/login`
- [ ] Login as regular user
- [ ] Try to access `/admin` directly → Redirected to `/dashboard`

### Middleware Tests
- [ ] Login as admin, try to access `/login` → Redirected to `/admin`
- [ ] Login as user, try to access `/login` → Redirected to `/dashboard`
- [ ] Login as user, try to access `/register` → Redirected to `/dashboard`

### Session Tests
- [ ] Open browser DevTools → Application tab
- [ ] After login, check cookies exist
- [ ] Cookie `next-auth.session-token` present
- [ ] Cookie has correct domain
- [ ] Cookie maxAge is set
- [ ] Refresh page → Still logged in
- [ ] Close browser tab, reopen → Session persists

### Password Tests
- [ ] Passwords in database are hashed (bcrypt format: $2a$...)
- [ ] Same password doesn't create same hash
- [ ] Changing password invalidates old session (if logout involved)

---

## 🔐 Security Verification

### Code Security
- [ ] No passwords logged anywhere
- [ ] No sensitive data in API responses
- [ ] JWT secret not in source code
- [ ] Database URL not in source code
- [ ] Error messages don't leak user information

### Authentication Security
- [ ] Password hashing working (bcryptjs)
- [ ] Timing-safe password comparison
- [ ] JWT tokens properly signed
- [ ] Session expiration set correctly
- [ ] Cookies httpOnly in production

### Authorization Security
- [ ] Middleware validates on protected routes
- [ ] Admin check prevents non-admin access
- [ ] Role-based redirects working
- [ ] No way to bypass role checks

---

## 📊 Build Verification

```bash
# Run type checking
npm run build

# Check for errors
# ✓ No TypeScript errors
# ✓ No warnings
# ✓ Build completes successfully
```

### Verification Checklist
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No warnings about deprecated APIs
- [ ] Next.js optimization passes
- [ ] CSS compiles correctly
- [ ] Images optimized

---

## 🚀 Deployment Steps

### Vercel Deployment (Recommended)
1. [ ] Push code to GitHub
2. [ ] Connect repository to Vercel
3. [ ] Add environment variables:
   - [ ] `DATABASE_URL`
   - [ ] `NEXTAUTH_SECRET`
   - [ ] `NEXTAUTH_URL`
   - [ ] `OPENAI_API_KEY`
4. [ ] Deploy
5. [ ] Verify deployment successful
6. [ ] Test login/register on deployed site
7. [ ] Test admin access

### Manual Server Deployment
1. [ ] SSH into server
2. [ ] Clone repository
3. [ ] Create `.env` file with variables
4. [ ] Run `npm install`
5. [ ] Run `npx prisma generate`
6. [ ] Run `npx prisma migrate deploy`
7. [ ] Run `npm run build`
8. [ ] Start with `npm start`
9. [ ] Verify on public URL

---

## ✅ Post-Deployment Testing

### Smoke Tests (Essential)
- [ ] Homepage loads
- [ ] Registration page works
- [ ] Login page works
- [ ] Can register new account
- [ ] Can login with registered account
- [ ] Redirects to /dashboard
- [ ] Dashboard loads
- [ ] Can logout

### Admin Verification (if admin exists)
- [ ] Create admin account in production database
- [ ] Login with admin account
- [ ] Redirects to /admin
- [ ] Admin dashboard loads
- [ ] Analytics visible

### Security Verification
- [ ] Try accessing /admin as non-admin
- [ ] Try accessing /dashboard as non-authenticated user
- [ ] Check cookies are secure (https in production)
- [ ] No sensitive data in browser console
- [ ] No sensitive data in Network tab

### Performance Checks
- [ ] Pages load within acceptable time
- [ ] No memory leaks in console
- [ ] No JavaScript errors in console
- [ ] Database queries are performant

---

## 📋 Database Backup

Before deployment:
```bash
# Backup production database
pg_dump <DATABASE_URL> > backup-$(date +%Y%m%d-%H%M%S).sql

# Store backup securely
# Keep for at least 7 days
```

---

## 🆘 Rollback Plan

If something goes wrong:

1. [ ] Database backup verified
2. [ ] Previous version of code available
3. [ ] Environment variables documented
4. [ ] Deployment instructions documented

**Rollback Steps:**
1. Revert code to previous commit
2. Run `npm run build`
3. Restart application
4. Verify deployment

---

## 📝 Documentation

### User Documentation
- [ ] Setup guide created
- [ ] Login/Register instructions provided
- [ ] Admin manual prepared
- [ ] FAQ documented

### Developer Documentation
- [ ] Architecture documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Configuration documented

### Deployment Documentation
- [ ] Deployment steps documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide prepared
- [ ] Support contacts listed

---

## 🔍 Final Sign-Off

### Code Quality
- [ ] Linting passed: `npm run lint`
- [ ] No unused imports
- [ ] Consistent code style
- [ ] Comments where needed

### Testing
- [ ] All manual tests passed
- [ ] No reported bugs
- [ ] Error handling works
- [ ] Edge cases tested

### Security
- [ ] No security vulnerabilities
- [ ] Secrets properly managed
- [ ] Authentication working
- [ ] Authorization enforced

### Performance
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] API response times good
- [ ] No memory leaks detected

### Documentation
- [ ] All files documented
- [ ] APIs documented
- [ ] Deployment documented
- [ ] Troubleshooting guide complete

---

## ✨ Sign-Off

**Deployment Authorization:**

- [ ] Code reviewed and approved
- [ ] Security check passed
- [ ] Testing completed
- [ ] Documentation complete
- [ ] Ready for production

**Approver:** ________________________  
**Date:** ________________________  
**Time:** ________________________  
**Notes:** ________________________________________________
_________________________________________________________

---

## 📞 Support Contact

After deployment, support channel:

**Slack:** #smarthabit-support  
**Email:** support@smarthabit.com  
**On-Call:** [Add phone]  
**Escalation:** [Add manager contact]

---

## 🎉 Deployment Complete

When all checkboxes are marked:
- ✅ System is ready for production
- ✅ All features working
- ✅ Security verified
- ✅ Documentation complete
- ✅ Team trained

**Celebrate! 🚀**

---

**Last Updated:** March 13, 2026  
**Version:** 1.0  
**Status:** Ready for Deployment
