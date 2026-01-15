import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  const base = "text-sm font-medium text-foreground";
  const classes = className ? `${base} ${className}` : base;
  return <label className={classes} {...props} />;
}
