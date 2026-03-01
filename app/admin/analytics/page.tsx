'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalHabits: number
  totalLogs: number
  avgHabitsPerUser: number
  avgCompletionRate: number
  recentSignups: number
}

export default function AdminAnalyticsPage() {
  const { t } = useI18n()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalHabits: 0,
    totalLogs: 0,
    avgHabitsPerUser: 0,
    avgCompletionRate: 0,
    recentSignups: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const analyticsCards = [
    {
      title: t('admin.totalUsers'),
      value: analytics.totalUsers,
      icon: Users,
      description: `${analytics.recentSignups} new this week`,
    },
    {
      title: t('admin.totalHabits'),
      value: analytics.totalHabits,
      icon: Activity,
      description: `${analytics.avgHabitsPerUser.toFixed(1)} per user`,
    },
    {
      title: 'Total Logs',
      value: analytics.totalLogs,
      icon: Calendar,
      description: 'All time completions',
    },
    {
      title: 'Completion Rate',
      value: `${analytics.avgCompletionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'System average',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.analytics')}</h2>
        <p className="text-muted-foreground">Detailed system analytics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
