# SmartHabit - Setup Guide

## 🎉 New Features Implemented

This guide covers the setup and usage of the newly implemented features:
- **Role-Based Authentication** (ADMIN/USER)
- **Multi-Language Support** (English, Bahasa Indonesia, 简体中文)
- **Admin Dashboard**
- **AI Multilingual Insights**

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- OpenAI API key (optional, for AI insights)

---

## 🚀 Setup Instructions

### 1. Install Dependencies

First, ensure you have ts-node installed for running the seed script:

```bash
npm install -D ts-node
```

### 2. Database Migration

The database schema has been updated with new fields. Run the migration:

```bash
# Generate Prisma client
npx prisma generate

# Push changes to database
npx prisma db push

# Or create and run a migration
npx prisma migrate dev --name add-roles-and-language
```

### 3. Seed Demo Accounts

Run the seed script to create demo accounts:

```bash
npx prisma db seed
```

This will create:

**Admin Account:**
- Email: `admin321@gmail.com`
- Password: `admin320`
- Role: ADMIN

**User Account:**
- Email: `userbrok@gmail.com`
- Password: `brokuser`
- Role: USER

### 4. Environment Variables

Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smarthabit"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: For AI features
OPENAI_API_KEY="sk-..."
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

---

## 🔐 Role-Based Authentication

### User Roles

- **USER** (Default): Standard access to personal dashboard, habits, analytics, and insights
- **ADMIN**: Full access including admin panel to manage users and view system analytics

### Role Assignment

By default, all new registrations are assigned the USER role. To create admin accounts:

1. **Use the seed script** (recommended for initial setup)
2. **Manually update the database**:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

### Protected Routes

The following routes are protected by middleware:

**User Routes** (requires authentication):
- `/dashboard`
- `/habits`
- `/analytics`
- `/insights`
- `/settings`

**Admin Routes** (requires ADMIN role):
- `/admin` - System overview
- `/admin/users` - User management
- `/admin/habits` - All habits across system
- `/admin/analytics` - System analytics

Non-admin users attempting to access admin routes will be redirected to `/dashboard`.

---

## 🌍 Multi-Language Support

### Available Languages

1. **English (en)** - Default
2. **Bahasa Indonesia (id)**
3. **简体中文 (zh)** - Simplified Chinese

### Language Selection

Users can change language via:
1. **Language Switcher** in the navbar (top-right)
2. **Settings page** (coming soon)

The selected language is:
- Stored in `localStorage`
- Persisted across sessions
- Applied to:
  - UI components
  - Navigation
  - Forms
  - AI-generated insights

### Language Detection Priority

1. User's explicit language selection
2. Browser language preference
3. Default (English)

### Adding New Languages

To add a new language:

1. **Update config** in [lib/i18n/config.ts](lib/i18n/config.ts):
   ```typescript
   export type Locale = 'en' | 'id' | 'zh' | 'fr'  // Add 'fr'
   
   export const localeNames: Record<Locale, string> = {
     en: 'English',
     id: 'Bahasa Indonesia',
     zh: '简体中文',
     fr: 'Français',  // Add French
   }
   ```

2. **Add translations** in [lib/i18n/translations.ts](lib/i18n/translations.ts):
   ```typescript
   export const translations = {
     // ... existing translations
     fr: {
       nav: {
         dashboard: 'Tableau de bord',
         // ... more translations
       },
     },
   }
   ```

3. **Update AI prompts** in [lib/ai.ts](lib/ai.ts):
   - Add system prompt for the new language
   - Add user prompt template
   - Add fallback messages

---

## 👨‍💼 Admin Panel Features

### Dashboard Overview

Access at `/admin`

Displays:
- Total Users
- Total Habits
- AI Usage Statistics
- Active Users Count

### User Management

Access at `/admin/users`

Features:
- View all registered users
- See user statistics (habit count)
- Delete user accounts (except admins)
- View user roles

### Habit Management

Access at `/admin/habits`

Features:
- View all habits across the system
- See habit details and statistics
- Monitor habit activity status

### System Analytics

Access at `/admin/analytics`

Features:
- Detailed system metrics
- User growth statistics
- Average completion rates
- System-wide insights

---

## 🤖 AI Multilingual Insights

### How It Works

The AI system now generates insights in the user's preferred language:

1. User's language preference is fetched from their profile
2. Language is passed to the AI generation function
3. AI prompt is customized based on language
4. Response is generated in the appropriate language

### Supported AI Languages

- **English**: Professional, motivational coaching style
- **Bahasa Indonesia**: Clear, encouraging Indonesian
- **简体中文**: Simplified Chinese with cultural context

### Fallback System

If OpenAI API is not available or fails:
- System generates intelligent fallback insights
- Fallbacks are also multilingual
- Quality insights based on data analysis

### Testing AI Insights

1. Log in as a user
2. Create some habits and log completions
3. Navigate to `/insights`
4. Click "Generate Insight"
5. AI will analyze habits and provide personalized feedback in your selected language

---

## 🧪 Testing the Implementation

### Test Admin Features

1. **Log in as admin**:
   - Email: `admin321@gmail.com`
   - Password: `admin320`

2. **Verify admin access**:
   - Check admin link appears in sidebar
   - Navigate to `/admin`
   - Test user management features

3. **Verify user protection**:
   - Log in as regular user
   - Try accessing `/admin` (should redirect)

### Test Multi-Language

1. **Change language**:
   - Click language switcher in navbar
   - Select different language
   - Verify UI updates

2. **Test persistence**:
   - Refresh page
   - Language should remain selected

3. **Test AI insights**:
   - Create habits and logs
   - Change language
   - Generate insight
   - Verify insight is in selected language

### Test Roles

1. **Register new account**:
   - Should default to USER role
   - Should not see admin panel

2. **Check role permissions**:
   - USER: Access dashboard, habits, analytics, insights
   - ADMIN: All of above + admin panel

---

## 🏗️ Architecture Overview

### New File Structure

```
SmartHabit/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── users/page.tsx       # User management
│   │   ├── habits/page.tsx      # Habit management
│   │   └── analytics/page.tsx   # System analytics
│   ├── api/
│   │   └── admin/
│   │       ├── stats/route.ts   # Admin stats API
│   │       ├── users/route.ts   # Users API
│   │       ├── habits/route.ts  # Habits API
│   │       └── analytics/route.ts # Analytics API
├── components/
│   └── LanguageSwitcher.tsx     # Language selector
├── lib/
│   └── i18n/
│       ├── config.ts            # i18n configuration
│       ├── context.tsx          # i18n context & provider
│       └── translations.ts      # All translations
├── prisma/
│   ├── schema.prisma            # Updated with role & language
│   └── seed.ts                  # Seed script for demo accounts
└── types/
    └── next-auth.d.ts           # Extended NextAuth types
```

### Key Technologies

- **Next.js 14**: App router with server/client components
- **NextAuth**: Authentication with JWT strategy
- **Prisma**: ORM with PostgreSQL
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible components

---

## 🔧 Troubleshooting

### Issue: Seed script fails

**Solution**: Ensure ts-node is installed and package.json has the prisma.seed configuration:

```bash
npm install -D ts-node
```

### Issue: Language not persisting

**Solution**: Check browser localStorage and ensure JavaScript is enabled. The language preference is stored in `localStorage.getItem('locale')`.

### Issue: Admin routes accessible to users

**Solution**: Verify middleware is properly configured and session includes role information. Check browser console for session data.

### Issue: AI insights in wrong language

**Solution**: 
1. Check user's language field in database
2. Verify language is passed to `generateHabitInsight()`
3. Check translations exist for that language

### Issue: Database migration fails

**Solution**:
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or push schema changes
npx prisma db push
```

---

## 📝 API Documentation

### Admin Endpoints

#### GET `/api/admin/stats`
Returns system statistics.

**Auth**: Requires ADMIN role

**Response**:
```json
{
  "totalUsers": 42,
  "totalHabits": 156,
  "aiInsights": 89,
  "activeUsers": 38
}
```

#### GET `/api/admin/users`
Returns all users with their statistics.

**Auth**: Requires ADMIN role

**Response**:
```json
[
  {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "language": "en",
    "createdAt": "2024-01-01T00:00:00Z",
    "_count": {
      "habits": 5
    }
  }
]
```

#### DELETE `/api/admin/users/[id]`
Deletes a user account (except admins).

**Auth**: Requires ADMIN role

**Response**:
```json
{
  "success": true
}
```

#### GET `/api/admin/habits`
Returns all habits across the system.

**Auth**: Requires ADMIN role

#### GET `/api/admin/analytics`
Returns detailed system analytics.

**Auth**: Requires ADMIN role

---

## 🎯 Best Practices

### Security

1. **Never commit** demo account credentials to production
2. **Change default admin password** immediately
3. **Use environment variables** for sensitive data
4. **Enable HTTPS** in production
5. **Implement rate limiting** for API routes

### Performance

1. **Index database fields** used in queries (email, role)
2. **Implement pagination** for large user lists
3. **Cache frequently accessed data**
4. **Optimize AI calls** (avoid excessive requests)

### Maintenance

1. **Regular backups** of database
2. **Monitor API usage** (OpenAI costs)
3. **Update dependencies** regularly
4. **Review admin logs** periodically

---

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add role-based auth and i18n"
   git push
   ```

2. **Configure Vercel**:
   - Connect GitHub repository
   - Set environment variables
   - Deploy

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Environment Variables (Production)

Ensure these are set in Vercel:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` (optional)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check browser console for errors
4. Verify database schema matches expectations

---

## ✅ Feature Checklist

- [x] Role-based authentication (ADMIN/USER)
- [x] Database schema with role and language fields
- [x] Seed script with demo accounts
- [x] Admin dashboard
- [x] User management interface
- [x] System analytics
- [x] Middleware for role protection
- [x] Multi-language support (en, id, zh)
- [x] Language switcher component
- [x] i18n context and translations
- [x] AI multilingual insights
- [x] Updated components for i18n
- [x] Comprehensive documentation

---

**Happy coding! 🎉**
