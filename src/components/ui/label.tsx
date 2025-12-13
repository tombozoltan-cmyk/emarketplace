import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", ...props }: LabelProps) {
  const base = "text-sm font-medium text-[color:var(--secondary)]";
  const classes = className ? `${base} ${className}` : base;
  return <label className={classes} {...props} />;
}
