"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, User, Bell, Shield, Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-indigo-500" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {session?.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">
                Free Plan
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input defaultValue={session?.user?.name || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                defaultValue={session?.user?.email || ""}
                disabled
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile editing coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-indigo-500" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how SmartHabit looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
                  theme === opt.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-indigo-500" />
            Notifications
          </CardTitle>
          <CardDescription>Control your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Daily reminders", desc: "Get reminded to complete your habits" },
              { label: "Weekly reports", desc: "Weekly summary of your progress" },
              { label: "Streak alerts", desc: "Alert when you're about to lose a streak" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-muted flex-shrink-0 relative cursor-not-allowed" title="Coming soon">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground/40 absolute top-0.5 left-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Push notifications coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-indigo-500" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Last changed at account creation
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="text-sm font-medium text-destructive">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
