"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HabitStat {
  title: string;
  completionRate: number;
  color: string;
}

interface CompletionChartProps {
  data: HabitStat[];
}

export function CompletionChart({ data }: CompletionChartProps) {
  const chartData = data.map((h) => ({
    name:
      h.title.length > 14 ? h.title.slice(0, 14) + "…" : h.title,
    rate: h.completionRate,
    color: h.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value}%`, "Rate"]}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
