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
import type { Deal } from "@/lib/types";
import {
  DEAL_STAGES,
  STAGE_LABEL,
  formatCurrency,
  stageTotals,
} from "@/lib/selectors";
import { ChartTooltipBox } from "./tooltip-box";

const COLORS: Record<string, string> = {
  discovery: "var(--chart-1)",
  proposal: "var(--chart-2)",
  negotiation: "var(--chart-3)",
  "closed-won": "var(--chart-4)",
  "closed-lost": "oklch(0.55 0.05 265)",
};

export function PipelineStageChart({ deals }: { deals: Deal[] }) {
  const data = useMemo(() => {
    const totals = stageTotals(deals);
    return DEAL_STAGES.map((s) => ({
      stage: STAGE_LABEL[s],
      stageKey: s,
      count: totals[s].count,
      value: totals[s].value,
    }));
  }, [deals]);

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
            dataKey="stage"
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v as number)}
            width={50}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <ChartTooltipBox title={payload[0].payload.stage}>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    Deals{" "}
                    <span className="font-medium text-foreground">
                      {payload[0].payload.count}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    Value{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(payload[0].payload.value)}
                    </span>
                  </div>
                </ChartTooltipBox>
              ) : null
            }
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((d) => (
              <Cell
                key={d.stageKey}
                fill={COLORS[d.stageKey] ?? "var(--chart-1)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
