"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Lead } from "@/lib/types";
import { scoreDistribution } from "@/lib/selectors";
import { ChartTooltipBox } from "./tooltip-box";

const COLORS = [
  "oklch(0.65 0.22 25 / 0.6)",
  "oklch(0.65 0.22 25 / 0.8)",
  "oklch(0.75 0.15 75 / 0.85)",
  "oklch(0.68 0.17 145 / 0.8)",
  "oklch(0.68 0.17 145)",
];

export function ScoreDistributionChart({ leads }: { leads: Lead[] }) {
  const data = useMemo(() => scoreDistribution(leads), [leads]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="2 3"
            vertical={false}
          />
          <XAxis
            dataKey="bucket"
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
            width={30}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <ChartTooltipBox title={`Score ${payload[0].payload.bucket}`}>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    Leads
                    <span className="font-medium text-foreground">
                      {payload[0].payload.count}
                    </span>
                  </div>
                </ChartTooltipBox>
              ) : null
            }
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={44}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
