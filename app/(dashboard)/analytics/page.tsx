"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyChart } from "@/components/charts/WeeklyChart";
import { CompletionChart } from "@/components/charts/CompletionChart";
import { HeatmapChart } from "@/components/charts/HeatmapChart";
import { getLastNDays } from "@/lib/utils";

interface AnalyticsData {
  weeklyChart: Array<{
    date: string;
    day: string;
    completed: number;
    total: number;
    rate: number;
  }>;
  habitStats: Array<{
    id: string;
    title: string;
    color: string;
    category: string;
    completedLogs: number;
    totalLogs: number;
    completionRate: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?days=${period}`);
        const json = await res.json();
        setData(json);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [period]);

  const avgRate =
    data?.weeklyChart.length
      ? Math.round(
          data.weeklyChart.reduce((s, d) => s + d.rate, 0) /
            data.weeklyChart.length
        )
      : 0;

  const totalCompleted =
    data?.weeklyChart.reduce((s, d) => s + d.completed, 0) ?? 0;

  const bestHabit =
    data?.habitStats.sort((a, b) => b.completionRate - a.completionRate)[0];

  // Build heatmap data from weekly chart
  const heatmapData = (data?.weeklyChart ?? []).map((d) => ({
    date: d.date,
    completed: d.rate >= 50,
    isToday: d.date === new Date().toISOString().slice(0, 10),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visualize your habit performance over time
          </p>
        </div>
        <div className="flex gap-2">
          {([30, 60, 90] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === p
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Avg Completion
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {avgRate}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Completions
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalCompleted}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Best Habit
                </p>
                <p className="text-sm font-bold truncate" title={bestHabit?.title}>
                  {bestHabit?.title ?? "—"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Completion Trend
          </CardTitle>
          <CardDescription>Daily habit completion rate over {period} days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : data ? (
            <WeeklyChart data={data.weeklyChart} />
          ) : null}
        </CardContent>
      </Card>

      {/* Per Habit Breakdown */}
      {!loading && data && data.habitStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-indigo-500" />
              Habit Performance
            </CardTitle>
            <CardDescription>Completion rate per habit</CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionChart data={data.habitStats} />
          </CardContent>
        </Card>
      )}

      {/* Activity Heatmap */}
      {!loading && heatmapData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-indigo-500" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>
              Days where 50%+ habits were completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart data={heatmapData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
