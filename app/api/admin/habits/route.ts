import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
try {
const session = await getServerSession(authOptions)

if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const habits = await prisma.habit.findMany({
    select: {
    id: true,
    title: true,
    description: true,
    category: true,
    isActive: true,
    user: {
        select: {
        name: true,
        email: true,
        },
    },
    _count: {
        select: {
        logs: true,
        },
    },
    },
    orderBy: {
    createdAt: 'desc',
    },
    take: 100,
})

return NextResponse.json(habits)
} catch (error) {
console.error('Failed to fetch habits:', error)
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
}
