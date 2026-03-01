# 🎯 SmartHabit - Intelligent Habit Tracker

A modern, full-stack Smart Habit Tracker with AI-powered insights, role-based authentication, and multi-language support. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and OpenAI.

## ✨ Features

### 👤 User Features
- ✅ **Authentication** - Email/password with JWT sessions
- ✅ **Habit Management** - Create, edit, delete, and track habits  
- ✅ **Streak Tracking** - Automatic consecutive day calculation
- ✅ **Progress Visualization** - Interactive charts and heatmaps
- ✅ **AI Insights** - OpenAI-powered behavioral analysis and recommendations
- ✅ **Multi-Language** - English, Indonesian, Chinese support
- ✅ **Personalized Dashboard** - Daily progress and statistics
- ✅ **Analytics** - Weekly trends and completion rates

### 🔐 Admin Features
- ✅ **Role-Based Access** - ADMIN and USER roles
- ✅ **User Management** - View and manage all users
- ✅ **System Monitoring** - Track all habits and analytics
- ✅ **Admin Dashboard** - System-wide statistics
- ✅ **Protected Routes** - Middleware-based authorization

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5.14 |
| **Authentication** | NextAuth.js 4.24 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | Radix UI |
| **Charts** | Recharts |
| **AI** | OpenAI GPT |
| **Password** | bcryptjs |
| **Deployment** | Vercel |

## 📁 Project Structure

```
SmartHabit/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── admin/               # Admin panel (role-protected)
│   └── api/                 # API routes
├── components/              # React components
│   ├── charts/             # Chart components
│   └── ui/                 # UI primitives (shadcn/ui)
├── lib/                    # Core libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   ├── ai.ts              # AI insight generation
│   └── i18n/              # Internationalization
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo accounts seed
├── middleware.ts          # Route protection
└── vercel.json           # Vercel config
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- OpenAI API key (optional)

### 1. Clone & Install

```bash
git clone <your-repo>
cd SmartHabit
npm install
```

### 2. Environment Setup

Create `.env` file (use `.env.example` as template):

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3001"

# OpenAI (optional)
OPENAI_API_KEY="sk-your-api-key"
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Seed demo accounts
npx prisma db seed

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3001`

## 👥 Demo Accounts

After seeding, you can login with:

### Admin Account
- **Email**: `admin321@gmail.com`
- **Password**: `admin320`
- **Access**: Full admin panel + all user features

### User Account  
- **Email**: `userbrok@gmail.com`
- **Password**: `brokuser`
- **Access**: Standard user features

## 🚀 Deployment to Vercel

### Quick Deploy

1. **Setup Database** (choose one):
   - **Vercel Postgres** (easiest): Dashboard → Storage → Create Database
   - **Neon** (free): https://neon.tech
   - **Supabase** (free): https://supabase.com

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your Vercel URL)
     - `OPENAI_API_KEY` (optional)
   - Click Deploy

4. **Initialize Database**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Link project and pull env vars
   vercel link
   vercel env pull .env.local
   
   # Setup database
   npx prisma db push
   npx prisma db seed
   ```

**📖 See [DEPLOY.md](DEPLOY.md) for detailed deployment guide.**

## 🌐 Multi-Language Support

The app supports three languages out of the box:
- 🇬🇧 **English** (`en`)
- 🇮🇩 **Indonesian** (`id`)  
- 🇨🇳 **Chinese Simplified** (`zh`)

Users can switch languages via the navigation bar. Preferences are saved in localStorage.

**Translation files**: `lib/i18n/translations.ts`

## 🔐 Security Features

- ✅ **Password Hashing** - bcrypt with 12 salt rounds
- ✅ **JWT Sessions** - Secure token-based authentication
- ✅ **Protected Routes** - Middleware authorization
- ✅ **Role-Based Access** - ADMIN/USER permissions
- ✅ **CSRF Protection** - Built into NextAuth
- ✅ **SQL Injection Safe** - Prisma parameterized queries
- ✅ **Environment Variables** - Sensitive data not in code

## 📊 Database Schema

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String
  role     UserRole @default(USER)    // ADMIN or USER
  language String   @default("en")     // en, id, or zh
  habits   Habit[]
  insights AIInsight[]
}

model Habit {
  id       String    @id @default(cuid())
  title    String
  category String
  frequency Int      // times per week
  logs     HabitLog[]
}

model HabitLog {
  habitId   String
  date      DateTime
  completed Boolean
}

model AIInsight {
  userId         String
  content        String
  recommendation String
  type           String   // weekly, monthly
}
```

## 🧪 Testing

### Manual Testing

1. **Authentication Flow**:
   - Register new account → Login → Logout
   - Try accessing protected routes without auth

2. **User Features**:
   - Create habit → Log completion → View analytics
   - Generate AI insights → Check recommendations
   - Switch languages

3. **Admin Features** (login as admin):
   - Access `/admin/dashboard`
   - View user list → Delete user
   - Monitor system habits and analytics

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - Authentication
- `GET /api/habits` - List user habits
- `POST /api/habits` - Create habit
- `POST /api/habits/[id]/log` - Log completion
- `GET /api/analytics` - User analytics
- `GET /api/insights` - AI insights
- `GET /api/admin/*` - Admin endpoints (protected)

## 🐛 Troubleshooting

### TypeScript Errors

If VS Code shows Prisma type errors after generation:
```bash
# Restart TypeScript server
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Database Connection

```bash
# Test connection
npx prisma db push

# View data
npx prisma studio
```

### Build Issues

```bash
# Clear cache
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

### Common Errors

| Error | Solution |
|-------|----------|
| `Can't reach database` | Check `DATABASE_URL` and database is running |
| `NEXTAUTH_SECRET missing` | Add to `.env` file |
| `Prisma errors` | Run `npx prisma generate` |
| `Module not found` | Delete `node_modules` and reinstall |

## 📚 Documentation

- **[DEPLOY.md](DEPLOY.md)** - Complete Vercel deployment guide
- **[SETUP.md](SETUP.md)** - Local development setup guide
- **[.env.example](.env.example)** - Environment variable template

## 🎨 Customization

### Adding New Language

1. Add locale to `lib/i18n/config.ts`:
   ```ts
   export const locales = ['en', 'id', 'zh', 'fr'] as const
   ```

2. Add translations to `lib/i18n/translations.ts`:
   ```ts
   fr: {
     nav: { dashboard: 'Tableau de bord', ... },
     // ... more translations
   }
   ```

### Changing Theme Colors

Edit `tailwind.config.ts`:
```js
colors: {
  primary: { DEFAULT: '#your-color', ... }
}
```

### Adding New Habit Categories

Update `lib/types.ts` and modify habit creation form accordingly.

## 📈 Performance Optimization

- ✅ **Server Components** - Reduced client bundle size
- ✅ **API Route Handlers** - Efficient data fetching
- ✅ **Database Indexing** - Optimized queries
- ✅ **Edge Middleware** - Fast auth checks
- ✅ **Static Generation** - Pre-rendered pages
- ✅ **Image Optimization** - Next.js automatic optimization

## 🔄 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run ESLint
npx prisma studio  # Open database GUI
npx prisma db push # Sync schema to database
npx prisma db seed # Seed demo accounts
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database toolkit
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Radix UI](https://radix-ui.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Vercel](https://vercel.com) - Deployment platform

## 📞 Support

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 📖 [Prisma Docs](https://www.prisma.io/docs)
- 📖 [NextAuth Docs](https://next-auth.js.org)
- 📖 [Vercel Docs](https://vercel.com/docs)

---

**🎉 Your SmartHabit app is ready to deploy!**

**Quick Start**: Check [DEPLOY.md](DEPLOY.md) for Vercel deployment instructions.

Built with ❤️ using Next.js 14 & TypeScript
#   T e s t   G i t H u b   A c t i o n s   W o r k f l o w   f o r   N e o n   P r e v i e w   D a t a b a s e s  
 