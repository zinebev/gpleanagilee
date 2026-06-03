"use client";

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean;
  padded?: boolean;
};

export default function Card({
  clickable = false,
  padded = true,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "bg-card border border-hairline rounded-lg shadow-sm",
        padded ? "px-6 py-5" : "",
        clickable
          ? "cursor-pointer transition-all duration-150 hover:border-hairline-hover hover:shadow-md"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}