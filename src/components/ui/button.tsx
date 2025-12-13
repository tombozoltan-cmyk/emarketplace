"use client";

import * as React from "react";

type Variant = "default" | "outline";
type Size = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClass =
      variant === "outline"
        ? " border border-[color:var(--border)] bg-transparent hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]"
        : " bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90";

    const sizeClass =
      size === "sm"
        ? " h-9 rounded-md px-3"
        : size === "lg"
        ? " h-11 rounded-md px-8"
        : size === "icon"
        ? " h-10 w-10"
        : " h-10 px-4 py-2";

    const classes = `${base}${variantClass}${sizeClass}${className ? ` ${className}` : ""}`;

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";
