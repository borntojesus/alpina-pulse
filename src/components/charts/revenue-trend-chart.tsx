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
import type { Deal } from "@/lib/types";
import { formatCurrency } from "@/lib/selectors";
import { ChartTooltipBox } from "./tooltip-box";

export function RevenueTrendChart({ deals }: { deals: Deal[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { month: string; won: number; forecast: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const won = deals
        .filter(
          (x) =>
            x.stage === "closed-won" &&
            new Date(x.updatedAt).getTime() >= d.getTime() &&
            new Date(x.updatedAt).getTime() < end.getTime(),
        )
        .reduce((a, x) => a + x.value, 0);
      const forecast = deals
        .filter(
          (x) =>
            x.stage !== "closed-won" &&
            x.stage !== "closed-lost" &&
            new Date(x.expectedCloseDate).getTime() >= d.getTime() &&
            new Date(x.expectedCloseDate).getTime() < end.getTime(),
        )
        .reduce((a, x) => a + (x.value * x.probability) / 100, 0);
      months.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        won,
        forecast,
      });
    }
    return months;
  }, [deals]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rev-won" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rev-forecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
            tickFormatter={(v) => formatCurrency(v as number)}
            width={46}
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
                        {p.name === "won" ? "Closed won" : "Weighted forecast"}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(Number(p.value))}
                      </span>
                    </div>
                  ))}
                </ChartTooltipBox>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="var(--chart-1)"
            strokeDasharray="4 3"
            strokeWidth={2}
            fill="url(#rev-forecast)"
          />
          <Area
            type="monotone"
            dataKey="won"
            stroke="var(--chart-4)"
            strokeWidth={2}
            fill="url(#rev-won)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
