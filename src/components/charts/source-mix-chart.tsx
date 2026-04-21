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
import { leadsBySource } from "@/lib/selectors";
import { ChartTooltipBox } from "./tooltip-box";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.7 0.15 30)",
  "oklch(0.7 0.15 200)",
];

export function SourceMixChart({ leads }: { leads: Lead[] }) {
  const data = useMemo(() => leadsBySource(leads), [leads]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="2 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="source"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <ChartTooltipBox title={payload[0].payload.source}>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    Leads{" "}
                    <span className="font-medium text-foreground">
                      {payload[0].payload.count}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    Converted{" "}
                    <span className="font-medium text-foreground">
                      {payload[0].payload.converted}
                    </span>
                  </div>
                </ChartTooltipBox>
              ) : null
            }
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
