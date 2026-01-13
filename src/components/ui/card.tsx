import * as React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base =
    "rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)] shadow-sm";
  const classes = className ? `${base} ${className}` : base;
  return <div className={classes} {...props} />;
}

export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base = "flex flex-col space-y-1.5 p-6";
  const classes = className ? `${base} ${className}` : base;
  return <div className={classes} {...props} />;
}

export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const base = "text-lg font-semibold leading-none tracking-tight";
  const classes = className ? `${base} ${className}` : base;
  return <h3 className={classes} {...props} />;
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base = "p-6 pt-0";
  const classes = className ? `${base} ${className}` : base;
  return <div className={classes} {...props} />;
}
