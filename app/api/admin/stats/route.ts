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

    const [totalUsers, totalHabits, totalInsights] = await Promise.all([
      prisma.user.count(),
      prisma.habit.count(),
      prisma.aIInsight.count(),
    ])

    // Count users with at least one habit as active
    const activeUsers = await prisma.user.count({
      where: {
        habits: {
          some: {},
        },
      },
    })

    return NextResponse.json({
      totalUsers,
      totalHabits,
      aiInsights: totalInsights,
      activeUsers,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
