'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Users, Activity, BarChart3, Settings } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const adminNavItems = [
  { href: '/admin', label: 'admin.title', icon: BarChart3 },
  { href: '/admin/users', label: 'admin.users', icon: Users },
  { href: '/admin/habits', label: 'admin.habits', icon: Activity },
  { href: '/admin/analytics', label: 'admin.analytics', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <nav className="space-y-2">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.label as any)}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
