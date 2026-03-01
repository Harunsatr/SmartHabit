"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Lightbulb,
  Settings,
  Zap,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: t("nav.dashboard"),
    },
    {
      href: "/habits",
      icon: CheckSquare,
      label: t("nav.habits"),
    },
    {
      href: "/analytics",
      icon: BarChart2,
      label: t("nav.analytics"),
    },
    {
      href: "/insights",
      icon: Lightbulb,
      label: t("nav.insights"),
    },
    {
      href: "/settings",
      icon: Settings,
      label: t("nav.settings"),
    },
  ];

  // Add admin link if user is admin
  if (session?.user?.role === 'ADMIN') {
    navItems.push({
      href: "/admin",
      icon: Shield,
      label: t("nav.admin"),
    });
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sidebar-foreground text-sm">
            SmartHabit
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-indigo-500" : "text-muted-foreground"
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 border border-indigo-200/30 dark:border-indigo-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get personalized insights from your habit data.
          </p>
        </div>
      </div>
    </aside>
  );
}
