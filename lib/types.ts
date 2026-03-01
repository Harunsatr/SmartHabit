import { Habit, HabitLog, AIInsight } from "@prisma/client";

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
};

export type HabitWithStats = Habit & {
  logs: HabitLog[];
  streak: number;
  completionRate: number;
  todayCompleted: boolean;
};

export interface DashboardStats {
  totalHabits: number;
  todayCompleted: number;
  todayTotal: number;
  weeklyRate: number;
  longestStreak: number;
  currentStreaks: number;
}

export interface WeeklyChartData {
  day: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HabitFormData {
  title: string;
  description?: string;
  category: string;
  targetFrequency: number;
  color: string;
}

export interface InsightData {
  habits: Array<{
    title: string;
    category: string;
    targetFrequency: number;
    completionRate: number;
    currentStreak: number;
    totalLogs: number;
    completedLogs: number;
  }>;
  overallStats: {
    totalHabits: number;
    averageCompletionRate: number;
    totalStreakDays: number;
    activeDays: number;
  };
  period: string;
}

export type { Habit, HabitLog, AIInsight };
