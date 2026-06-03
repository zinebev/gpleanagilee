import React from "react";

type Tone = "active" | "improvement" | "risk" | "info" | "done" | "neutral";

type BadgeProps = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
};

const tones: Record<Tone, string> = {
  active: "bg-teal-soft text-teal-700",
  improvement: "bg-amber-soft text-amber-700",
  risk: "bg-risk-soft text-risk-700",
  info: "bg-info-soft text-info-700",
  done: "bg-ok-soft text-ok-700",
  neutral: "bg-inset text-graphite-700",
};

export default function Badge({
  tone = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`tnum inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}