import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalUsers, totalHabits, totalLogs, users] = await Promise.all([
      prisma.user.count(),
      prisma.habit.count(),
      prisma.habitLog.count(),
      prisma.user.findMany({
        select: {
          _count: {
            select: {
              habits: true,
            },
          },
          createdAt: true,
        },
      }),
    ])

    // Calculate average habits per user
    const avgHabitsPerUser = totalUsers > 0 ? totalHabits / totalUsers : 0

    // Calculate recent signups (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentSignups = users.filter(u => u.createdAt >= weekAgo).length

    // Calculate average completion rate
    const allLogs = await prisma.habitLog.findMany({
      select: {
        completed: true,
      },
    })
    const completedLogs = allLogs.filter(log => log.completed).length
    const avgCompletionRate = allLogs.length > 0 
      ? (completedLogs / allLogs.length) * 100 
      : 0

    return NextResponse.json({
      totalUsers,
      totalHabits,
      totalLogs,
      avgHabitsPerUser,
      avgCompletionRate,
      recentSignups,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
