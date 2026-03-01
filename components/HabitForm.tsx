"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HABIT_CATEGORIES, HABIT_COLORS } from "@/lib/utils";
import type { HabitFormData, HabitWithStats } from "@/lib/types";

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
  habit?: HabitWithStats | null;
  loading?: boolean;
}

const defaultForm: HabitFormData = {
  title: "",
  description: "",
  category: "general",
  targetFrequency: 7,
  color: "#6366f1",
};

export function HabitForm({
  open,
  onClose,
  onSubmit,
  habit,
  loading,
}: HabitFormProps) {
  const [form, setForm] = useState<HabitFormData>(defaultForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habit) {
      setForm({
        title: habit.title,
        description: habit.description || "",
        category: habit.category,
        targetFrequency: habit.targetFrequency,
        color: habit.color,
      });
    } else {
      setForm(defaultForm);
    }
    setError("");
  }, [habit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter a habit title");
      return;
    }
    setError("");
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
          <DialogDescription>
            {habit
              ? "Update your habit details."
              : "Fill in the details to start tracking a new habit."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning meditation"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this habit..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-[70px] resize-none"
            />
          </div>

          {/* Category + Frequency row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="frequency">Target (days/week)</Label>
              <Input
                id="frequency"
                type="number"
                min={1}
                max={7}
                value={form.targetFrequency}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetFrequency: Math.min(7, Math.max(1, parseInt(e.target.value) || 1)),
                  })
                }
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{
                    backgroundColor: color,
                    transform:
                      form.color === color ? "scale(1.2)" : undefined,
                    outline:
                      form.color === color ? `3px solid ${color}` : undefined,
                    outlineOffset: form.color === color ? "2px" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={loading}>
              {habit ? "Save Changes" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
