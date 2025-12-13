import * as React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base =
    "rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)] shadow-sm";
  const classes = className ? `${base} ${className}` : base;
  return <div className={classes} {...props} />;
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base = "p-6";
  const classes = className ? `${base} ${className}` : base;
  return <div className={classes} {...props} />;
}
