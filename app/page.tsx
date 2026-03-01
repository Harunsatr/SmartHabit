import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  BarChart2,
  Moon,
  Shield,
  ArrowRight,
  Flame,
  Target,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: CheckCircle2,
    title: "Smart Habit Tracking",
    description:
      "Track daily habits with streaks, completion rates, and visual progress. Stay consistent with intuitive check-ins.",
    color: "#6366f1",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Insights",
    description:
      "Get personalized behavioral analysis and recommendations from AI that understands your unique patterns.",
    color: "#f59e0b",
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description:
      "Visual charts, heatmaps, and trend analysis to understand your performance over time.",
    color: "#10b981",
  },
  {
    icon: Flame,
    title: "Streak Tracking",
    description:
      "Build momentum with streak counters that reward consistency and keep you motivated.",
    color: "#f97316",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description:
      "Set weekly frequency targets per habit and measure progress towards your goals.",
    color: "#ec4899",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "Beautiful dark and light themes with system preference detection. Easy on the eyes.",
    color: "#8b5cf6",
  },
];

const benefits = [
  "Track unlimited habits",
  "AI-powered recommendations",
  "Weekly & monthly analytics",
  "Activity heatmaps",
  "Streak tracking",
  "Mobile-friendly design",
  "Dark & light mode",
  "Instant habit logging",
];

const testimonials = [
  {
    quote:
      "SmartHabit helped me build a morning routine and stick to it for 60+ days. The AI insights were spot on!",
    name: "Sarah K.",
    role: "Product Designer",
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard gives me such clear visibility into my habits. I finally understand my patterns.",
    name: "Marcus J.",
    role: "Software Engineer",
    rating: 5,
  },
  {
    quote:
      "Love how the AI gives personalized recommendations based on my actual data, not generic tips.",
    name: "Priya M.",
    role: "Startup Founder",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">SmartHabit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-indigo-500/10 to-purple-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            AI-Powered Habit Intelligence
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Tracker Smart Habit
            <span className="block bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              For All Your Activities
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Build better habits with AI that understands your lifestyle. Track,
            analyze, and receive personalized recommendations to transform your
            daily routine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="gradient" size="xl" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Free to use · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Everything you need to build better habits
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete habit tracking system with AI-powered intelligence and
              beautiful analytics.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: feature.color + "20" }}
                  >
                    <feature.icon
                      className="h-5 w-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-3">
                Why SmartHabit?
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Built for serious habit builders
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Unlike simple to-do apps, SmartHabit combines behavioral science
                with AI to give you real insights into your patterns and how to
                improve them.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border bg-card p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-bold text-lg">Today&apos;s Progress</p>
                    <p className="text-sm text-muted-foreground">5 of 6 habits done</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    83%
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Morning Meditation", done: true, color: "#8b5cf6", streak: 14 },
                    { name: "30min Exercise", done: true, color: "#f97316", streak: 7 },
                    { name: "Read 20 Pages", done: true, color: "#3b82f6", streak: 21 },
                    { name: "Cold Shower", done: false, color: "#06b6d4", streak: 3 },
                    { name: "Journaling", done: true, color: "#10b981", streak: 9 },
                  ].map((habit) => (
                    <div
                      key={habit.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          habit.done
                            ? "bg-emerald-500"
                            : "border-2 border-muted-foreground/30"
                        }`}
                      >
                        {habit.done && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span
                        className={`text-sm flex-1 ${habit.done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {habit.streak}d
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Loved by habit builders
            </h2>
            <p className="text-muted-foreground">
              Join thousands of people building better habits every day
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/40 dark:border-indigo-800/40 p-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Start building better habits today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join SmartHabit and get AI-powered insights that help you
              understand your behavioral patterns and make lasting change.
            </p>
            <Link href="/register">
              <Button variant="gradient" size="xl" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">SmartHabit</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} SmartHabit. Built with Next.js & AI.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
