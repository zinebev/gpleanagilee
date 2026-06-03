import React from "react";

type WordmarkProps = {
  size?: number;
  withRule?: boolean;
  onDark?: boolean;
  compact?: boolean;
  className?: string;
};

export default function Wordmark({
  size = 18,
  withRule = false,
  onDark = false,
  compact = false,
  className = "",
}: WordmarkProps) {
  const neutral = onDark ? "#E7ECEF" : "var(--color-graphite-700)";

  if (compact) {
    return (
      <span
        className={`inline-flex leading-none ${className}`}
        style={{ fontSize: size }}
        aria-label="GPLeanAgile"
      >
        <span style={{ fontWeight: 600, color: neutral }}>GP</span>
        <span style={{ fontWeight: 600, color: "var(--color-teal)" }}>LA</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-col leading-none ${className}`}
      aria-label="GPLeanAgile"
    >
      <span style={{ fontSize: size }} className="leading-none">
        <span style={{ fontWeight: 500, color: neutral }}>GP</span>
        <span
          style={{ fontWeight: 300, letterSpacing: "-0.02em", color: neutral }}
        >
          Lean
        </span>
        <span
          style={{
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "var(--color-teal)",
          }}
        >
          Agile
        </span>
      </span>
      {withRule && (
        <span
          aria-hidden="true"
          className="wordmark-rule mt-1 block h-px w-full"
          style={{ background: "var(--color-teal)" }}
        />
      )}
    </span>
  );
}