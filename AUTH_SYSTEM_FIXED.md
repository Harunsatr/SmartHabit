# SmartHabit Authentication System - Fixed

## 🎯 Perbaikan yang Sudah Dilakukan

### 1. **Admin Layout Protection (Server-Side)**
- **File**: `app/admin/layout.tsx`
- **Perubahan**:
  - Konversi dari Client Component ke Server Component
  - Menggunakan `getServerSession()` untuk verifikasi auth di server
  - Langsung redirect ke `/login` jika belum login
  - Redirect ke `/dashboard` jika bukan admin
  - Eliminasi race condition dari client-side checks

**Keuntungan**:
- Tidak bisa dibypass dengan JavaScript manipulation
- Session langsung diverifikasi di server
- Loading state dihilangkan (instant protection)

### 2. **Middleware Enhancement**
- **File**: `middleware.ts`
- **Perubahan**:
  - Lebih strict untuk route `/admin`
  - Better error handling dan logging
  - Array-based route checking (lebih performant)
  - Detailed error messages untuk debugging

**Fitur Baru**:
```typescript
// Admin hanya bisa diakses oleh ADMIN role
if (pathname.startsWith("/admin")) {
  if (!token) {
    // Redirect ke login dengan callback
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/admin&error=unauthorized", req.url)
    );
  }
  if (token.role !== "ADMIN") {
    // Non-admin redirect ke dashboard
    console.warn(`Non-admin user attempted to access /admin`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
```

### 3. **Login Page Redirect Logic**
- **File**: `app/(auth)/login/page.tsx`
- **Perubahan**:
  - Improved error handling
  - Better session fetching dengan cache control
  - Debug logging untuk development
  - Fallback redirect jika session fetch gagal
  - Gunakan `router.push()` instead of `window.location.href`

**Login Flow**:
1. User submit email + password
2. NextAuth credentials provider validate
3. Wait 500ms untuk session cookie set
4. Fetch `/api/auth/session` dengan `no-store` cache
5. Check user role dari session
6. Redirect ke `/admin` (admin) atau `/dashboard` (user)

### 4. **Session Callback Improvement**
- **File**: `lib/auth/auth.config.ts`
- **Perubahan**:
  - Explicit type casting untuk role
  - Debug logging di development
  - Better null checking
  - Ensure role always populated

---

## ✅ Cara Testing Sistem

### Prerequisite
```bash
# 1. Install dependencies
npm install

# 2. Setup database (jika belum ada)
npx prisma migrate dev

# 3. Seed test accounts
npx prisma db seed
```

### Test Case 1: Admin Login
```
Email: admin321@gmail.com
Password: admin320

Expected:
1. Login form muncul
2. Input email + password
3. Redirect ke /admin dashboard
4. Admin dapat melihat: Dashboard, Users, Habits, Analytics
5. Session persists across refresh
```

### Test Case 2: Regular User Login
```
Email: userbrok@gmail.com
Password: brokuser

Expected:
1. Login form muncul
2. Input email + password
3. Redirect ke /dashboard
4. Regular dashboard muncul (bukan admin)
5. Tidak bisa akses /admin (akan auto-redirect ke /dashboard)
```

### Test Case 3: Access Control
```
1. Login sebagai regular user
2. Coba akses http://localhost:3000/admin (manual URL)

Expected:
- Middleware intercept
- Auto-redirect ke /dashboard
- Tidak ada error page

3. Logout
4. Coba akses /admin tanpa login

Expected:
- Redirect ke /login?callbackUrl=/admin&error=unauthorized
- Tombol login muncul
```

### Test Case 4: Session Persistence
```
1. Login sebagai admin
2. Refresh page (F5)

Expected:
- Session tetap maintained
- Tidak perlu login lagi
- Role tetap ADMIN
```

### Test Case 5: Invalid Credentials
```
Email: test@example.com
Password: wrongpassword

Expected:
- Error message: "Invalid email or password. Please try again."
- Tetap di login page
- Form tidak reset (user bisa edit)
```

---

## 🔧 Environment Variables Required

```bash
# .env file
DATABASE_URL="postgresql://..."  # PostgreSQL connection
NEXTAUTH_SECRET="min-32-characters-secret-key"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # atau production URL
```

**Generate NEXTAUTH_SECRET**:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 📊 Architecture Overview

```
User Login Form (/login/page.tsx)
        ↓
   signIn() dengan credentials
        ↓
NextAuth Provider (CredentialsProvider)
        ↓
authenticateUser() - check database
        ↓
JWT Callback - create token dengan role
        ↓
Session Callback - enrich session dari token
        ↓
Login page fetch /api/auth/session
        ↓
Check role → determine redirect
        ↓
Router.push() ke /admin atau /dashboard
        ↓
Middleware intercept jika diperlukan
        ↓
Layout render dengan proper auth check
```

---

## 🔐 Security Features

### 1. Server-Side Validation
- Admin layout menggunakan `getServerSession()` di server
- Tidak bisa dibypass dari client

### 2. Middleware Protection
```typescript
// Middleware run sebelum component render
// CRITICAL untuk protect /admin routes
```

### 3. JWT Token
- Role disimpan di JWT token (secure)
- Token divalidate di setiap request
- Session timeout: 7 hari

### 4. Password Security
- Hash dengan bcrypt (10 rounds)
- Timing-safe password comparison
- Minimum 8 characters

### 5. CSRF Protection
- NextAuth built-in CSRF protection
- Secure cookies (httpOnly, sameSite)

---

## 🐛 Debugging

### Enable Debug Logs
Di `auth.config.ts`:
```typescript
debug: process.env.NODE_ENV === "development" && true,
```

### Check Session
```bash
# Di browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### Check NextAuth Logs
```bash
# Terminal output saat npm run dev
# Lihat [Session] User session log messages
```

### Database Check
```bash
# Cek user di database
npx prisma studio

# Atau SQL
SELECT id, email, role, created_at FROM "User" WHERE email = 'admin321@gmail.com';
```

---

## 🚀 Deployment Checklist

- [ ] NEXTAUTH_SECRET di production adalah secret yang kuat (32+ chars)
- [ ] NEXTAUTH_URL set ke production domain
- [ ] DATABASE_URL pointing ke production database
- [ ] Seed database dengan admin account
- [ ] Test login/admin access di production
- [ ] Check HTTPS cookies are working
- [ ] Monitor logs untuk auth errors

---

## 📝 Seed Database

Untuk menambah user baru:

```bash
# Edit prisma/seed.ts
# Tambah user baru di main() function
# Jalankan
npx prisma db seed
```

Atau manual dengan `npx prisma studio`:
1. Buka http://localhost:5555
2. Click User table
3. Add record dengan:
   - email: unique
   - password: hash dengan bcrypt
   - role: "ADMIN" atau "USER"
   - name: display name
   - language: "en"

---

## ⚠️ Common Issues

### Issue: "Unauthorized" saat akses /admin
**Solusi**:
1. Check NEXTAUTH_SECRET ada di .env
2. Check session cookie ada di browser DevTools
3. Verify database punya user dengan role="ADMIN"
4. Clear browser cookies dan login ulang

### Issue: Login infinite loop
**Solusi**:
1. Check NEXTAUTH_SECRET valid
2. Check DATABASE_URL connection OK
3. Check email ada di database
4. Check password hash correct

### Issue: Admin role tidak terdeteksi
**Solusi**:
1. Verify database field `role` = "ADMIN"
2. Check session callback di auth.config.ts
3. Enable debug logging di auth.config.ts
4. Check token role di browser DevTools

---

## 📖 File Locations

| File | Purpose |
|------|---------|
| `lib/auth/auth.config.ts` | NextAuth configuration |
| `lib/auth/auth.server.ts` | Server-side auth helpers |
| `middleware.ts` | Route protection middleware |
| `app/admin/layout.tsx` | Admin dashboard layout |
| `app/(auth)/login/page.tsx` | Login form |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Test data seeding |

---

## 🎓 Konsep Penting

1. **JWT Token**: Stateless authentication token disimpan di cookie
2. **Session**: Kombinasi dari JWT token + client session
3. **Middleware**: Berjalan di edge, intercept setiap request
4. **Server Component**: Render di server, lebih aman untuk auth check
5. **Role-Based Access Control**: Beda route untuk beda role

---

## 📞 Tips

- Selalu clear cookies saat ubah auth config
- Gunakan incognito mode untuk test multiple sessions
- Check network tab di DevTools untuk debug redirects
- Use `npm run dev` dengan `-- --debug` untuk verbose logging

---

**Status**: ✅ Sistem Fixed dan Ready to Test

Lakukan testing sesuai test cases di atas untuk ensure semuanya berfungsi dengan baik!
