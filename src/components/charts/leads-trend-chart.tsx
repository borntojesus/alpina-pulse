"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Lead } from "@/lib/types";
import { leadsByMonth } from "@/lib/selectors";
import { ChartTooltipBox } from "./tooltip-box";

export function LeadsTrendChart({ leads }: { leads: Lead[] }) {
  const data = useMemo(() => leadsByMonth(leads), [leads]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="leads-trend-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="leads-trend-converted"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="2 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox title={label as string}>
                  {payload.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: p.color }}
                        />
                        {p.name === "count" ? "Leads" : "Converted"}
                      </span>
                      <span className="font-medium tabular-nums">
                        {p.value}
                      </span>
                    </div>
                  ))}
                </ChartTooltipBox>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#leads-trend-gradient)"
          />
          <Area
            type="monotone"
            dataKey="converted"
            stroke="var(--chart-4)"
            strokeWidth={2}
            fill="url(#leads-trend-converted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
