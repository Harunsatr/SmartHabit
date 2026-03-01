import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, parseISO } from "date-fns";

export const dynamic = 'force-dynamic'

// GET /api/habits - List user habits with today's logs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = format(new Date(), "yyyy-MM-dd");

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isActive: true },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("GET habits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/habits - Create new habit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, targetFrequency, color } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || "general",
        targetFrequency: Number(targetFrequency) || 1,
        color: color || "#6366f1",
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error("POST habit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
