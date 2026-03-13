# SmartHabit Authentication - Quick Reference

## 🚀 Quick Start Commands

```bash
# Setup
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Access
http://localhost:3000/register   # Register new user
http://localhost:3000/login      # Login page
http://localhost:3000/dashboard  # User dashboard (after login)
http://localhost:3000/admin      # Admin dashboard (admin only)
```

---

## 📋 User Roles

| Role | Access | Pages |
|------|--------|-------|
| **ADMIN** | Full system | /admin, /dashboard, etc. |
| **USER** | Limited | /dashboard, /habits, etc. |
| **Guest** | Public only | /, /login, /register |

---

## 🔄 Login/Register Flow

### Register New User
```
User → /register → Fill form → POST /api/auth/register 
→ Create in DB → Auto login → /dashboard
```

### Login Existing User
```
User → /login → Enter credentials → NextAuth verify 
→ Create JWT → Check role → Redirect:
  - ADMIN → /admin
  - USER → /dashboard
```

---

## 🛡️ Protected Routes

### User Dashboard Routes
- `/dashboard` - User home
- `/habits` - Manage habits
- `/analytics` - View analytics
- `/insights` - AI insights
- `/settings` - User settings

### Admin Routes
- `/admin` - Admin dashboard (ADMIN only)
- Non-admins trying to access → redirected to `/dashboard`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/(auth)/login/page.tsx` | Login page + logic |
| `app/(auth)/register/page.tsx` | Register page + logic |
| `app/api/auth/register/route.ts` | Register API endpoint |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `middleware.ts` | Route protection |
| `lib/auth/auth.config.ts` | NextAuth config |
| `prisma/schema.prisma` | Database schema |

---

## 🔑 Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secret-key-32-chars-min
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-key (optional)
```

---

## 📊 Database Model

### User Table
```
id (String)           - Unique identifier
name (String)         - User's full name
email (String)        - Email address (unique)
password (String)     - Bcrypt hashed password
role (ADMIN|USER)     - User role (default: USER)
language (String)     - Preferred language (default: en)
timezone (String)     - User timezone (default: UTC)
createdAt (DateTime)  - Account creation time
updatedAt (DateTime)  - Last update time
```

---

## 🔑 API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
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

**Errors:**
- 400: Missing fields, weak password
- 409: Email already registered
- 500: Server error

### GET /api/auth/session
**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "language": "en"
  },
  "expires": "2024-12-31T23:59:59.000Z"
}
```

---

## 🧪 Test Scenarios

### Test 1: New User Registration
```
1. Go to /register
2. Fill: Name, Email, Password (8+ chars)
3. Click "Create Account"
4. Expected: Auto-logged in, redirected to /dashboard
5. Check: User in database with role="USER"
```

### Test 2: User Login
```
1. Go to /login
2. Enter valid email & password
3. Click "Sign In"
4. Expected: Redirected to /dashboard
5. Check: Session contains user data
```

### Test 3: Admin Login (if admin exists)
```
1. Go to /login
2. Enter admin email & password
3. Click "Sign In"
4. Expected: Redirected to /admin
5. Check: Session contains role="ADMIN"
```

### Test 4: Route Protection
```
1. Logout (or use incognito)
2. Try to access /dashboard
3. Expected: Redirect to /login
4. Try to access /admin
5. Expected: Redirect to /login
```

### Test 5: Admin Access Control
```
1. Login as regular user
2. Try to access /admin manually
3. Expected: Redirect to /dashboard
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Admin redirected to /dashboard | Check DB role="ADMIN", clear cache |
| Cannot login | Verify email/password, check DB connection |
| Registration fails | Check password 8+ chars, email not taken |
| Routes redirect to /login | Set NEXTAUTH_SECRET, enable cookies |
| 500 error | Check DATABASE_URL, verify DB running |

---

## 📝 Password Requirements

- ✅ Minimum 8 characters
- ✅ Can contain letters, numbers, symbols
- ✅ Case sensitive
- ✅ No special validation required

---

## 🔒 Security Notes

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens stateless and serverless-compatible
- Sessions expire after 30 days
- Middleware validates on every protected route
- No passwords in API responses

---

## 🚪 Session Management

### Login Flow
1. Credentials validated
2. JWT token created with user ID, email, role
3. Session callback enriches session with role
4. Client redirects based on role

### Logout Flow
1. Click logout
2. Session cleared
3. Redirect to /login or /
4. Cannot access protected routes

### Session Duration
- JWT maxAge: 30 days
- Can be adjusted in `lib/auth/auth.config.ts`
- Sessions automatically expire

---

## 👨‍💼 Admin User Management

### Create Admin User (via Database)

**Using Prisma Studio:**
```bash
npx prisma studio
# Navigate to User table
# Find user and set role to "ADMIN"
```

**Using SQL:**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

**Using Prisma Client:**
```typescript
await prisma.user.update({
  where: { email: "admin@example.com" },
  data: { role: "ADMIN" }
});
```

---

## 📱 Frontend Components

### Login Component
- Email input with validation
- Password input with show/hide toggle
- Submit button with loading state
- Error message display
- Link to register page

### Register Component
- Name input
- Email input with validation
- Password input with strength indicator
- Show/hide password toggle
- Terms of service checkbox
- Submit button with loading state

---

## 🔄 Middleware Flow

```
Request to Protected Route
    ↓
Check Authentication Token
    ├─ No Token? → Redirect to /login
    └─ Has Token? → Continue
    ↓
Check Route Type
    ├─ Public Route? → Allow
    ├─ Admin Route?
    │   ├─ ADMIN role? → Allow
    │   └─ Not ADMIN? → Redirect to /dashboard
    └─ User Route? → Allow
    ↓
Load Page
```

---

## 📊 Status Checks

```bash
# Check database connection
curl http://localhost:3000/api/auth/session

# Check if logged in (should return user data)
# If not logged in, response will be null

# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Password123"}'
```

---

## 🎯 Next Steps

1. ✅ Verify setup with test registration
2. ✅ Test login/logout flow
3. ✅ Verify admin redirect works
4. ✅ Test route protection
5. ✅ Deploy to production

---

## 📞 Support

- Check AUTH_SYSTEM_SUMMARY.md for detailed docs
- Review VERIFICATION_CHECKLIST.md for testing
- Check IMPLEMENTATION_GUIDE.md for setup details

---

**Last Updated:** March 13, 2026 | **Status:** ✅ Ready for Production
