"use client";

import React from "react";
import Button from "./Button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal-700">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-graphite-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-graphite-500">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}