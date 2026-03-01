'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Brain, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface AdminStats {
  totalUsers: number
  totalHabits: number
  aiInsights: number
  activeUsers: number
}

export default function AdminPage() {
  const { t } = useI18n()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHabits: 0,
    aiInsights: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: t('admin.totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: t('admin.totalHabits'),
      value: stats.totalHabits,
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: t('admin.aiUsage'),
      value: stats.aiInsights,
      icon: Brain,
      color: 'text-purple-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.analytics')}</h2>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
