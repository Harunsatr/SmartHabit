import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex flex-col items-start justify-between bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">SmartHabit</span>
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Build habits that
              <br />
              actually stick.
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              AI-powered insights meet beautiful habit tracking. Understand your
              patterns, stay consistent, and achieve your goals.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "2M+", label: "Habits Tracked" },
              { value: "95%", label: "Satisfaction" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 backdrop-blur p-3 text-center"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="border-l-2 border-white/40 pl-4">
            <p className="text-indigo-100 italic text-sm">
              &ldquo;We are what we repeatedly do. Excellence, then, is not an
              act, but a habit.&rdquo;
            </p>
            <footer className="text-indigo-200 text-xs mt-1">— Aristotle</footer>
          </blockquote>
        </div>

        <p className="text-indigo-200 text-xs">
          © {new Date().getFullYear()} SmartHabit. All rights reserved.
        </p>
      </div>

      {/* Right - Auth Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">SmartHabit</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
