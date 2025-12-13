"use client";

import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = "", children, ...props }: SelectProps) {
  const base =
    "flex h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const classes = className ? `${base} ${className}` : base;
  return (
    <select className={classes} {...props}>
      {children}
    </select>
  );
}
