import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, parseISO } from "date-fns";

export const dynamic = 'force-dynamic'

// POST /api/habits/[id]/log - Toggle habit completion for a date
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await req.json();
    const dateStr = body.date || format(new Date(), "yyyy-MM-dd");
    const date = parseISO(dateStr);

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: params.id, date } },
    });

    let log;
    if (existing) {
      log = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { completed: !existing.completed },
      });
    } else {
      log = await prisma.habitLog.create({
        data: {
          habitId: params.id,
          date,
          completed: true,
        },
      });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error("POST habit log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
