"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-graphite-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "h-[38px] w-full rounded-md bg-card px-3 text-sm text-graphite-700",
          "border placeholder:text-graphite-400 focus:outline-none transition-shadow",
          error
            ? "border-risk focus:ring-[3px] focus:ring-risk-soft"
            : "border-hairline focus:border-teal focus:ring-[3px] focus:ring-teal-soft",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-[13px] text-risk">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;