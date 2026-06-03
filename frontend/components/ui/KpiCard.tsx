import React from "react";
import Card from "./Card";
import Badge from "./Badge";

type State = "healthy" | "risk" | "warning" | "neutral";

type KpiCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number[];
  state?: State;
  stateLabel?: string;
};

const stateTone: Record<State, "active" | "risk" | "improvement" | "neutral"> = {
  healthy: "active",
  risk: "risk",
  warning: "improvement",
  neutral: "neutral",
};

const stateStroke: Record<State, string> = {
  healthy: "var(--color-teal)",
  risk: "var(--color-risk)",
  warning: "var(--color-amber)",
  neutral: "var(--color-graphite-400)",
};

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} role="img" aria-label="trend">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KpiCard({
  label,
  value,
  unit,
  trend,
  state = "neutral",
  stateLabel,
}: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-graphite-500">
          {label}
        </p>
        {stateLabel && <Badge tone={stateTone[state]}>{stateLabel}</Badge>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tnum text-[28px] font-semibold leading-none text-graphite-700">
          {value}
        </span>
        {unit && <span className="text-sm text-graphite-500">{unit}</span>}
      </div>
      {trend && trend.length > 1 && (
        <div className="mt-3">
          <Sparkline data={trend} stroke={stateStroke[state]} />
        </div>
      )}
    </Card>
  );
}