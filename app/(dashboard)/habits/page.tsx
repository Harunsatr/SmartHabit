"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { HabitCard } from "@/components/HabitCard";
import { HabitForm } from "@/components/HabitForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateStreak, getTodayString, HABIT_CATEGORIES } from "@/lib/utils";
import type { HabitWithStats, HabitFormData } from "@/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<HabitWithStats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
          const todayLog = h.logs.find(
            (l: any) => format(new Date(l.date), "yyyy-MM-dd") === today
          );
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
      if (res.ok) await fetchHabits();
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
    if (!confirm("Delete this habit and all its logs? This cannot be undone."))
      return;
    await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    await fetchHabits();
  };

  const categories = [
    "all",
    ...Array.from(new Set(habits.map((h) => h.category))),
  ];

  const filtered = habits.filter(
    (h) =>
      (categoryFilter === "all" || h.category === categoryFilter) &&
      (search === "" ||
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Habits</h1>
          <p className="text-sm text-muted-foreground">
            {habits.length} active habit{habits.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen(true)} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Habits */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">
              {search || categoryFilter !== "all"
                ? "No habits found"
                : "No habits yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first habit to get started"}
            </p>
            {!search && categoryFilter === "all" && (
              <Button variant="gradient" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Habit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onEdit={setEditHabit}
              onDelete={handleDelete}
              loading={toggling === habit.id}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={submitting}
      />
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
