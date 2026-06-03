import React from "react";

type Variant = "line" | "block" | "card" | "circle";

type SkeletonProps = {
  variant?: Variant;
  width?: string | number;
  height?: string | number;
  className?: string;
};

const radii: Record<Variant, string> = {
  line: "rounded-sm",
  block: "rounded-md",
  card: "rounded-lg",
  circle: "rounded-full",
};

const defaults: Record<Variant, { width: string; height: string }> = {
  line: { width: "100%", height: "14px" },
  block: { width: "100%", height: "80px" },
  card: { width: "100%", height: "120px" },
  circle: { width: "40px", height: "40px" },
};

export default function Skeleton({
  variant = "line",
  width,
  height,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer ${radii[variant]} ${className}`}
      style={{
        width: width ?? defaults[variant].width,
        height: height ?? defaults[variant].height,
      }}
      aria-hidden="true"
    />
  );
}