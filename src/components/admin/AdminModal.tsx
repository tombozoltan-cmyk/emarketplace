"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
};

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  className,
}: AdminModalProps) {
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full my-8 mx-4 bg-[color:var(--card)] rounded-xl shadow-2xl border border-[color:var(--border)]",
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-[color:var(--border)]">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-[color:var(--border)] bg-[color:var(--muted)]/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

type AdminModalSectionProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminModalSection({ title, children, className }: AdminModalSectionProps) {
  return (
    <div className={cn("mb-6 last:mb-0", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-[color:var(--foreground)] mb-3 pb-2 border-b border-[color:var(--border)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

type AdminModalFieldProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
};

export function AdminModalField({
  label,
  value,
  className,
  editable,
  onEdit,
}: AdminModalFieldProps) {
  return (
    <div className={cn("py-2", className)}>
      <span className="text-xs text-[color:var(--muted-foreground)] block mb-0.5">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          {value || "-"}
        </span>
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-[color:var(--primary)] hover:underline"
          >
            Szerkesztés
          </button>
        )}
      </div>
    </div>
  );
}

type AdminModalGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

export function AdminModalGrid({ children, columns = 2, className }: AdminModalGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("grid gap-x-8 gap-y-1", gridCols[columns], className)}>
      {children}
    </div>
  );
}

export default AdminModal;
