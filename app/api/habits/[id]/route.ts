import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/habits/[id] - Update habit
export async function PATCH(
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
    const { title, description, category, targetFrequency, color, isActive } = body;

    const updated = await prisma.habit.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(category && { category }),
        ...(targetFrequency !== undefined && {
          targetFrequency: Number(targetFrequency),
        }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ habit: updated });
  } catch (error) {
    console.error("PATCH habit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/habits/[id] - Soft delete habit
export async function DELETE(
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

    await prisma.habit.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Habit deleted" });
  } catch (error) {
    console.error("DELETE habit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
