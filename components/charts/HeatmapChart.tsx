"use client";

import { format, parseISO, startOfWeek, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  data: Array<{
    date: string;
    completed: boolean;
    isToday: boolean;
  }>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function HeatmapChart({ data }: HeatmapProps) {
  // Group data by weeks
  const weeks: Array<Array<(typeof data)[0] | null>> = [];
  let currentWeek: Array<(typeof data)[0] | null> = [];

  if (data.length > 0) {
    const firstDate = parseISO(data[0].date);
    const firstDayOfWeek = getDay(firstDate); // 0 = Sunday
    // Fill padding for first week (Mon-based)
    const padding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < padding; i++) {
      currentWeek.push(null);
    }
  }

  data.forEach((d) => {
    const dayOfWeek = getDay(parseISO(d.date));
    // 0=Sun, 1=Mon...6=Sat => convert to Mon-based: Mon=0...Sun=6
    const monBased = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    if (currentWeek.length > 0 && monBased === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-3" /> {/* header spacer */}
          {DAYS.map((day, i) => (
            <div key={i} className="h-3 flex items-center">
              <span className="text-[9px] text-muted-foreground w-6">{day}</span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.slice(-26).map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {/* Month label (first of month) */}
            <div className="h-3">
              {week[0] && format(parseISO(week[0].date), "d") === "1" ? (
                <span className="text-[9px] text-muted-foreground">
                  {MONTHS[parseInt(format(parseISO(week[0].date), "M")) - 1]}
                </span>
              ) : null}
            </div>
            {week.map((day, di) => (
              <div key={di} className="h-3 w-3">
                {day ? (
                  <div
                    title={`${day.date}: ${day.completed ? "✓" : "✗"}`}
                    className={cn(
                      "h-3 w-3 rounded-sm transition-transform hover:scale-125 cursor-pointer",
                      day.isToday && "ring-1 ring-indigo-500 ring-offset-1",
                      day.completed
                        ? "bg-indigo-500"
                        : "bg-muted hover:bg-muted/70"
                    )}
                  />
                ) : (
                  <div className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-muted-foreground">Less</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
          <div
            key={opacity}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: `rgb(99 102 241 / ${opacity})` }}
          />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}
