'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'

interface Habit {
  id: string
  title: string
  description: string | null
  category: string
  isActive: boolean
  user: {
    name: string
    email: string
  }
  _count: {
    logs: number
  }
}

export default function AdminHabitsPage() {
  const { t } = useI18n()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/admin/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Failed to fetch habits:', error)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.habits')}</h2>
        <p className="text-muted-foreground">View all habits across the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.totalHabits')}: {habits.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{habit.title}</h3>
                    <Badge variant={habit.isActive ? 'default' : 'secondary'}>
                      {habit.isActive ? t('habit.active') : t('habit.inactive')}
                    </Badge>
                  </div>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>User: {habit.user.name}</span>
                    <span>Category: {habit.category}</span>
                    <span>{habit._count.logs} logs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
