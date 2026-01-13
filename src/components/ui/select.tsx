"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Native HTML Select (for simple use cases like blog page)
export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function NativeSelect({ className = "", children, ...props }: NativeSelectProps) {
  const base =
    "flex h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const classes = className ? `${base} ${className}` : base;
  return (
    <select className={classes} {...props}>
      {children}
    </select>
  );
}

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  displayLabel?: string;
  setDisplayLabel: (label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {},
  setDisplayLabel: () => {},
});

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [displayLabel, setDisplayLabel] = React.useState<string | undefined>();

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, displayLabel, setDisplayLabel }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { displayLabel } = React.useContext(SelectContext);
  return <span className={!displayLabel ? "text-muted-foreground" : ""}>{displayLabel || placeholder || ""}</span>;
}

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SelectContent({
  className,
  children,
  ...props
}: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[color:var(--border)] bg-[color:var(--card)] py-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SelectItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({
  value,
  children,
  className,
  ...props
}: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen, setDisplayLabel } =
    React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  // Set display label when this item is selected on mount
  React.useEffect(() => {
    if (isSelected && typeof children === "string") {
      setDisplayLabel(children);
    }
  }, [isSelected, children, setDisplayLabel]);

  const handleClick = () => {
    onValueChange?.(value);
    if (typeof children === "string") {
      setDisplayLabel(children);
    }
    setOpen(false);
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm transition-colors",
        "hover:bg-[color:var(--muted)]",
        isSelected && "bg-[color:var(--primary)]/10 text-[color:var(--primary)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
