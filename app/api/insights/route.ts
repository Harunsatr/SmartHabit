import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateHabitInsight } from "@/lib/ai";
import { calculateStreak, calculateCompletionRate } from "@/lib/utils";
import { format, subDays } from "date-fns";

export const dynamic = 'force-dynamic'

// GET /api/insights - Get user's AI insights
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = await prisma.aIInsight.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("GET insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/insights - Generate new AI insight
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user language preference
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { language: true },
    });

    const startDate = subDays(new Date(), 30);

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isActive: true },
      include: {
        logs: {
          where: { date: { gte: startDate } },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!habits.length) {
      return NextResponse.json(
        { error: "No habits to analyze" },
        { status: 400 }
      );
    }

    const habitsData = habits.map((habit) => {
      const completedLogs = habit.logs.filter((l) => l.completed);
      const completionRate =
        habit.logs.length > 0
          ? (completedLogs.length / habit.logs.length) * 100
          : 0;
      const streak = calculateStreak(
        habit.logs.map((l) => ({ date: l.date, completed: l.completed }))
      );

      return {
        title: habit.title,
        category: habit.category,
        targetFrequency: habit.targetFrequency,
        completionRate,
        currentStreak: streak,
        totalLogs: habit.logs.length,
        completedLogs: completedLogs.length,
      };
    });

    const avgCompletionRate =
      habitsData.reduce((sum, h) => sum + h.completionRate, 0) /
      habitsData.length;

    const userData = {
      habits: habitsData,
      overallStats: {
        totalHabits: habits.length,
        averageCompletionRate: avgCompletionRate,
        totalStreakDays: habitsData.reduce((sum, h) => sum + h.currentStreak, 0),
        activeDays: 30,
      },
      period: `${format(startDate, "MMM dd")} - ${format(new Date(), "MMM dd, yyyy")}`,
    };

    const result = await generateHabitInsight(userData, user?.language || 'en');

    const insight = await prisma.aIInsight.create({
      data: {
        userId: session.user.id,
        content: result.insight,
        recommendation: result.recommendation,
        motivation: result.motivation,
        type: "weekly",
      },
    });

    return NextResponse.json({ insight, score: result.score }, { status: 201 });
  } catch (error) {
    console.error("POST insight error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
