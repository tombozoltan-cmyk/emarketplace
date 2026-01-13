"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
};

export function AdminCard({
  children,
  className,
  onClick,
  selected,
  hoverable = true,
}: AdminCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl p-4 transition-all",
        hoverable && onClick && "cursor-pointer hover:shadow-md hover:border-[color:var(--primary)]/50",
        selected && "ring-2 ring-[color:var(--primary)] border-[color:var(--primary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

type AdminCardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminCardHeader({ children, className }: AdminCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-3", className)}>
      {children}
    </div>
  );
}

type AdminCardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminCardTitle({ children, className }: AdminCardTitleProps) {
  return (
    <h3 className={cn("font-semibold text-[color:var(--foreground)] line-clamp-1", className)}>
      {children}
    </h3>
  );
}

type AdminCardDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminCardDescription({ children, className }: AdminCardDescriptionProps) {
  return (
    <p className={cn("text-sm text-[color:var(--muted-foreground)] line-clamp-2", className)}>
      {children}
    </p>
  );
}

type AdminCardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminCardContent({ children, className }: AdminCardContentProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

type AdminCardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminCardFooter({ children, className }: AdminCardFooterProps) {
  return (
    <div className={cn("flex items-center gap-2 mt-4 pt-3 border-t border-[color:var(--border)]", className)}>
      {children}
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
};

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  );
}

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <span className="text-[color:var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-[color:var(--foreground)]">{value}</span>
    </div>
  );
}

export default AdminCard;
