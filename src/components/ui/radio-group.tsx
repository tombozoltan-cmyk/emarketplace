"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  name: "",
});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    const generatedName = React.useId();

    return (
      <RadioGroupContext.Provider
        value={{ value, onValueChange, name: name || generatedName }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, disabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const itemId = id || `${context.name}-${value}`;

    const handleChange = () => {
      context.onValueChange?.(value);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="radio"
          ref={ref}
          id={itemId}
          name={context.name}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={itemId}
          className={cn(
            "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[color:var(--border)] bg-[color:var(--background)] transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--primary)] peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            isChecked && "border-[color:var(--primary)]",
            className
          )}
        >
          {isChecked && (
            <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--primary)]" />
          )}
        </label>
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
