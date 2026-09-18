"use client";

/**
 * Renders a chart spec emitted by a TheoAI tool call, using recharts.
 * Styled off this site's own tokens (`--ink`, `--ink-muted`, `--line`) so it
 * repaints across the dark/light toggle with no JS — black/white quant, no
 * added accent color.
 */

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { ChartSpec } from "@/lib/ai/profile-tools";

export type { ChartSpec };

const AXIS = { fontSize: 10, fill: "var(--ink-muted)" } as const;

export function TheoAIChart({ spec }: { spec: ChartSpec }) {
  if (!spec?.data?.length) return null;

  // Horizontal bars: role/category labels are words, and they stay readable
  // in a narrow panel only when the category axis runs down the side.
  const isBar = spec.kind !== "line";

  return (
    <figure className="theoai-chart">
      <figcaption className="theoai-chart-caption">
        {spec.title}
        {spec.unit ? ` (${spec.unit})` : ""}
      </figcaption>

      <div style={{ height: Math.max(150, spec.data.length * (isBar ? 34 : 18) + 24) }}>
        <ResponsiveContainer width="100%" height="100%">
          {isBar ? (
            <BarChart data={spec.data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="var(--line)" strokeOpacity={0.6} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={112} interval={0} tick={AXIS} axisLine={false} tickLine={false} />
              <Bar dataKey="value" fill="var(--ink)" radius={[0, 3, 3, 0]} />
            </BarChart>
          ) : (
            <LineChart data={spec.data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
              <CartesianGrid stroke="var(--line)" strokeOpacity={0.6} />
              <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} width={24} />
              <Line type="monotone" dataKey="value" stroke="var(--ink)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
