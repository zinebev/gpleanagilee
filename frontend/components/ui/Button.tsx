"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none focus:outline-none";

const variants: Record<Variant, string> = {
  primary: "bg-teal text-white px-4 py-2 hover:bg-teal-700",
  secondary:
    "bg-transparent text-graphite-700 border border-hairline-hover px-4 py-2 hover:bg-inset",
  ghost: "bg-transparent text-graphite-500 px-3 py-2 hover:bg-inset",
  danger:
    "bg-transparent text-risk border border-risk px-4 py-2 hover:bg-risk-soft",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}