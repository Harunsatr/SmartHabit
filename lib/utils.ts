import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  parseISO,
  differenceInDays,
  subDays,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd, yyyy");
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd");
}

export function getWeekDays(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function calculateStreak(
  logs: Array<{ date: Date | string; completed: boolean }>
): number {
  if (!logs.length) return 0;

  const sortedLogs = [...logs]
    .filter((l) => l.completed)
    .map((l) => ({
      ...l,
      dateStr: format(
        typeof l.date === "string" ? parseISO(l.date) : l.date,
        "yyyy-MM-dd"
      ),
    }))
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  if (!sortedLogs.length) return 0;

  let streak = 0;
  let current = new Date();

  for (const log of sortedLogs) {
    const logDate = parseISO(log.dateStr);
    const diff = differenceInDays(current, logDate);

    if (diff <= 1) {
      streak++;
      current = logDate;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateCompletionRate(
  logs: Array<{ completed: boolean }>,
  days: number = 7
): number {
  if (!logs.length) return 0;
  const recent = logs.slice(0, days);
  const completed = recent.filter((l) => l.completed).length;
  return (completed / recent.length) * 100;
}

export function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    format(subDays(new Date(), i), "yyyy-MM-dd")
  ).reverse();
}

export function getWeeklyData(
  logs: Array<{ date: Date | string; completed: boolean }>,
  weeks: number = 7
) {
  const days = getLastNDays(weeks * 7);
  const logMap = new Map(
    logs.map((l) => [
      format(
        typeof l.date === "string" ? parseISO(l.date) : l.date,
        "yyyy-MM-dd"
      ),
      l.completed,
    ])
  );

  return days.map((day) => ({
    date: day,
    completed: logMap.get(day) ?? false,
    isToday: isToday(parseISO(day)),
  }));
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    health: "#10b981",
    fitness: "#f59e0b",
    mindfulness: "#8b5cf6",
    learning: "#3b82f6",
    productivity: "#6366f1",
    social: "#ec4899",
    nutrition: "#f97316",
    sleep: "#06b6d4",
    general: "#6b7280",
  };
  return colors[category.toLowerCase()] ?? "#6366f1";
}

export const HABIT_CATEGORIES = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "learning", label: "Learning" },
  { value: "productivity", label: "Productivity" },
  { value: "social", label: "Social" },
  { value: "nutrition", label: "Nutrition" },
  { value: "sleep", label: "Sleep" },
  { value: "general", label: "General" },
] as const;

export const HABIT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
] as const;

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
