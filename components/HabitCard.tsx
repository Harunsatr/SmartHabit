"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getTodayString } from "@/lib/utils";
import type { HabitWithStats } from "@/lib/types";

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: string) => void;
  onEdit: (habit: HabitWithStats) => void;
  onDelete: (habitId: string) => void;
  loading?: boolean;
}

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  loading,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const completionRate = Math.round(habit.completionRate);
  const completionColor =
    completionRate >= 80
      ? "text-emerald-500"
      : completionRate >= 60
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        habit.todayCompleted && "border-green-200 dark:border-green-800/50"
      )}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: habit.color }}
      />

      <CardContent className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          {/* Check button + info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggle(habit.id)}
              disabled={loading}
              className={cn(
                "flex-shrink-0 mt-0.5 transition-all duration-200",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {habit.todayCompleted ? (
                <CheckCircle2
                  className="h-6 w-6 text-emerald-500"
                  style={{ filter: "drop-shadow(0 0 4px rgb(16 185 129 / 0.4))" }}
                />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground hover:text-indigo-500 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={cn(
                    "font-semibold text-sm",
                    habit.todayCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {habit.title}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-xs capitalize"
                  style={{
                    backgroundColor: habit.color + "20",
                    color: habit.color,
                    border: `1px solid ${habit.color}40`,
                  }}
                >
                  {habit.category}
                </Badge>
              </div>

              {habit.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {habit.description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="font-medium text-foreground">
                    {habit.streak}
                  </span>
                  <span>streak</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className={cn("h-3 w-3", completionColor)} />
                  <span className={cn("font-medium", completionColor)}>
                    {completionRate}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{habit.targetFrequency}x/week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border bg-popover shadow-lg py-1 animate-fade-in">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(habit);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(habit.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
