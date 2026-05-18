"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type CollapsibleSectionProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  headerClassName?: string
  badge?: React.ReactNode
}

export function CollapsibleSection({
  title,
  description,
  icon,
  defaultOpen = false,
  children,
  className,
  headerClassName,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={cn("rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full flex items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-[color:var(--muted)]/50 cursor-pointer select-none",
          headerClassName
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && <div className="text-[color:var(--primary)] flex-shrink-0">{icon}</div>}
          <div className="min-w-0">
            <div className="font-semibold text-[color:var(--foreground)] flex items-center gap-2">
              {title}
              {badge}
            </div>
            {description && (
              <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5 truncate">{description}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-[color:var(--muted-foreground)]">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-[color:var(--border)]">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection
