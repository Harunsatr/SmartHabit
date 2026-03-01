"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon, Bell, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-2 hover:bg-accent text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-foreground hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {session?.user?.email?.slice(0, 20)}
                {(session?.user?.email?.length ?? 0) > 20 ? "..." : ""}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-lg py-1 animate-fade-in">
                <div className="px-3 py-2 border-b">
                  <p className="text-xs font-medium text-foreground">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-3.5 w-3.5" />
                  {t("nav.settings")}
                </a>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("nav.logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
