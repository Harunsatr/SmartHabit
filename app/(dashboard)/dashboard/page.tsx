"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Flame,
  TrendingUp,
  Calendar,
  Plus,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/StatCard";
import { HabitCard } from "@/components/HabitCard";
import { HabitForm } from "@/components/HabitForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { calculateStreak, getTodayString } from "@/lib/utils";
import type { HabitWithStats, HabitFormData } from "@/lib/types";

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<HabitWithStats | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = getTodayString();

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (data.habits) {
        const withStats: HabitWithStats[] = data.habits.map((h: any) => {
          const streak = calculateStreak(
            h.logs.map((l: any) => ({ date: l.date, completed: l.completed }))
          );
          const recentLogs = h.logs.slice(0, 30);
          const completed = recentLogs.filter((l: any) => l.completed).length;
          const completionRate =
            recentLogs.length > 0 ? (completed / recentLogs.length) * 100 : 0;
          const todayLog = h.logs.find((l: any) => {
            const d = new Date(l.date);
            return format(d, "yyyy-MM-dd") === today;
          });

          return {
            ...h,
            streak,
            completionRate,
            todayCompleted: todayLog?.completed ?? false,
          };
        });
        setHabits(withStats);
      }
    } catch {}
    setLoading(false);
  }, [today]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggle = async (habitId: string) => {
    setToggling(habitId);
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      if (res.ok) {
        await fetchHabits();
      }
    } finally {
      setToggling(null);
    }
  };

  const handleCreate = async (data: HabitFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setFormOpen(false);
        await fetchHabits();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: HabitFormData) => {
    if (!editHabit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/habits/${editHabit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditHabit(null);
        await fetchHabits();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm("Delete this habit?")) return;
    await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    await fetchHabits();
  };

  // Stats
  const todayCompleted = habits.filter((h) => h.todayCompleted).length;
  const todayTotal = habits.length;
  const completionPct =
    todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const avgRate =
    habits.length > 0
      ? Math.round(
          habits.reduce((s, h) => s + h.completionRate, 0) / habits.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => setFormOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Progress"
          value={`${todayCompleted}/${todayTotal}`}
          description={`${completionPct}% completed`}
          icon={CheckSquare}
          color="#6366f1"
          loading={loading}
        />
        <StatCard
          title="Best Streak"
          value={maxStreak}
          description="consecutive days"
          icon={Flame}
          color="#f97316"
          loading={loading}
        />
        <StatCard
          title="Avg Rate"
          value={`${avgRate}%`}
          description="30-day completion"
          icon={TrendingUp}
          color="#10b981"
          loading={loading}
        />
        <StatCard
          title="Total Habits"
          value={habits.length}
          description="active habits"
          icon={Calendar}
          color="#06b6d4"
          loading={loading}
        />
      </div>

      {/* Today's Progress Bar */}
      {!loading && todayTotal > 0 && (
        <Card className="border-indigo-200/50 dark:border-indigo-800/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold">Today&apos;s Progress</span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {completionPct}%
              </span>
            </div>
            <Progress
              value={completionPct}
              className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {todayCompleted} of {todayTotal} habits completed today
            </p>
          </CardContent>
        </Card>
      )}

      {/* Habits List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
          {!loading && habits.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {habits.filter((h) => !h.todayCompleted).length} remaining
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-semibold mb-1">No habits yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Start building better habits. Create your first habit to begin
                tracking.
              </p>
              <Button variant="gradient" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onEdit={(h) => setEditHabit(h)}
                onDelete={handleDelete}
                loading={toggling === habit.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Form */}
      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={submitting}
      />

      {/* Edit Form */}
      <HabitForm
        open={!!editHabit}
        onClose={() => setEditHabit(null)}
        onSubmit={handleEdit}
        habit={editHabit}
        loading={submitting}
      />
    </div>
  );
}
