"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  RefreshCw,
  Target,
  Heart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  content: string;
  recommendation: string | null;
  motivation: string | null;
  type: string;
  createdAt: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const generateInsight = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate insight");
      } else {
        await fetchInsights();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setGenerating(false);
  };

  const latest = insights[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-sm text-muted-foreground">
            Personalized analysis of your habit patterns
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={generateInsight}
          loading={generating}
          className="gap-2 self-start"
        >
          <Sparkles className="h-4 w-4" />
          Generate Insight
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <Card className="border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Analyzing your habits...</h3>
            <p className="text-sm text-muted-foreground">
              AI is reviewing your patterns and building personalized insights
            </p>
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Insight (featured) */}
      {!generating && latest && (
        <Card className="border-indigo-200/60 dark:border-indigo-800/40 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Latest Analysis
                </CardTitle>
                <CardDescription>
                  {format(parseISO(latest.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                AI Generated
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Insight */}
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-4 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  Pattern Analysis
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {latest.content}
              </p>
            </div>

            {/* Recommendation */}
            {latest.recommendation && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Recommendations
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {latest.recommendation}
                </p>
              </div>
            )}

            {/* Motivation */}
            {latest.motivation && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Motivation
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">
                  &ldquo;{latest.motivation}&rdquo;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      {!loading && insights.length > 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Previous Insights</h2>
          <div className="space-y-3">
            {insights.slice(1).map((insight) => (
              <Card key={insight.id} className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        AI Analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(insight.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                    {insight.content}
                  </p>
                  {insight.recommendation && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !generating && insights.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-semibold mb-1">No insights yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Start tracking your habits for a few days, then generate your
              first AI-powered insight.
            </p>
            <Button variant="gradient" onClick={generateInsight}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate First Insight
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
