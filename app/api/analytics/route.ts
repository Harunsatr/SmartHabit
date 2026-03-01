import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, parseISO, startOfDay } from "date-fns";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = subDays(new Date(), days);

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isActive: true },
      include: {
        logs: {
          where: { date: { gte: startDate } },
          orderBy: { date: "asc" },
        },
      },
    });

    // Build daily completion data
    const dailyData: Record<string, { completed: number; total: number }> = {};

    for (let i = 0; i < days; i++) {
      const day = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      dailyData[day] = { completed: 0, total: habits.length };
    }

    habits.forEach((habit) => {
      habit.logs.forEach((log) => {
        const day = format(log.date, "yyyy-MM-dd");
        if (dailyData[day] && log.completed) {
          dailyData[day].completed++;
        }
      });
    });

    const weeklyChart = Object.entries(dailyData).map(([date, data]) => ({
      date,
      day: format(parseISO(date), "EEE"),
      completed: data.completed,
      total: data.total,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    // Per-habit stats
    const habitStats = habits.map((habit) => {
      const completedLogs = habit.logs.filter((l) => l.completed);
      const rate =
        habit.logs.length > 0
          ? (completedLogs.length / habit.logs.length) * 100
          : 0;

      return {
        id: habit.id,
        title: habit.title,
        color: habit.color,
        category: habit.category,
        completedLogs: completedLogs.length,
        totalLogs: habit.logs.length,
        completionRate: Math.round(rate),
      };
    });

    return NextResponse.json({ weeklyChart, habitStats, days });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
