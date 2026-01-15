"use client";

import * as React from "react";

// Egyszerű, saját accordion megvalósítás Radix és util függőség nélkül.

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
};

type AccordionContextValue = {
  value: string | string[] | undefined;
  setValue: (val: string | string[] | undefined) => void;
  type: "single" | "multiple";
  collapsible: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const Accordion = ({
  children,
  className,
  type = "single",
  collapsible = true,
  ...props
}: AccordionProps) => {
  const [value, setValue] = React.useState<string | string[] | undefined>(
    type === "multiple" ? [] : undefined,
  );

  return (
    <AccordionContext.Provider value={{ value, setValue, type, collapsible }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

type AccordionTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };

const AccordionTrigger = ({ children, className, ...props }: AccordionTriggerProps) => {
  const ctx = React.useContext(AccordionContext);
  const parent = React.useContext(AccordionItemContext);

  if (!ctx || !parent) {
    return (
      <button type="button" className={className} {...props}>
        {children}
      </button>
    );
  }

  const isOpen = isItemOpen(ctx.value, parent.value);

  const handleClick = () => {
    if (ctx.type === "single") {
      if (isOpen && ctx.collapsible) {
        ctx.setValue(undefined);
      } else {
        ctx.setValue(parent.value);
      }
    } else {
      const current = Array.isArray(ctx.value) ? ctx.value : [];
      if (isOpen) {
        ctx.setValue(current.filter((v) => v !== parent.value));
      } else {
        ctx.setValue([...current, parent.value]);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
      className={
        "flex w-full items-center justify-between py-3 text-sm font-medium transition-all hover:text-[color:var(--primary)] " +
        (className ?? "")
      }
      {...props}
    >
      <span className="flex-1 text-left">{children}</span>
      <svg
        className={
          "ml-2 h-4 w-4 shrink-0 text-[color:var(--muted-foreground)] transition-transform duration-200 " +
          (isOpen ? "rotate-180" : "rotate-0")
        }
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 9l6 6 6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const AccordionItemContext =
  React.createContext<{ value: string } | null>(null);

const AccordionItem = ({
  children,
  value,
  className,
  ...props
}: AccordionItemProps) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

const AccordionContent = ({ children, className, ...props }: AccordionContentProps) => {
  const ctx = React.useContext(AccordionContext);
  const parent = React.useContext(AccordionItemContext);

  if (!ctx || !parent) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const isOpen = isItemOpen(ctx.value, parent.value);

  return (
    <div
      className={
        "overflow-hidden text-sm transition-[max-height,opacity] duration-200 " +
        (isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0") +
        " " +
        (className ?? "")
      }
      aria-hidden={!isOpen}
      {...props}
    >
      <div className="pt-0 pb-3">{children}</div>
    </div>
  );
};

function isItemOpen(value: string | string[] | undefined, itemValue: string) {
  if (Array.isArray(value)) {
    return value.includes(itemValue);
  }
  return value === itemValue;
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
