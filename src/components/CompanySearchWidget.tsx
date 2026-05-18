"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Building2,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
} from "lucide-react";
import type { CegjelzoCompany, CegjelzoSearchResponse } from "@/lib/cegjelzo-api";

// =============================================================================
// Rate Limiting
// =============================================================================

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000,
  cooldownMs: 30000,
};

function useRateLimiter() {
  const requestTimestamps = useRef<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    requestTimestamps.current = requestTimestamps.current.filter(
      (ts) => now - ts < RATE_LIMIT.windowMs
    );

    if (requestTimestamps.current.length >= RATE_LIMIT.maxRequests) {
      setIsLimited(true);
      setCooldownRemaining(Math.ceil(RATE_LIMIT.cooldownMs / 1000));
      return false;
    }

    requestTimestamps.current.push(now);
    return true;
  }, []);

  useEffect(() => {
    if (!isLimited) return;

    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setIsLimited(false);
          requestTimestamps.current = [];
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLimited]);

  return { checkLimit, isLimited, cooldownRemaining };
}

// =============================================================================
// Copy Hook
// =============================================================================

function useCopyToClipboard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  }, []);

  return { copy, copiedField };
}

// =============================================================================
// Result Card
// =============================================================================

function CompanyResultItem({
  company,
  onCopy,
  copiedField,
  isExpanded,
  onToggle,
}: {
  company: CegjelzoCompany;
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const CopyBtn = ({ value, fieldId }: { value: string; fieldId: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCopy(value, fieldId);
      }}
      className="p-1 hover:bg-white/10 rounded transition-colors"
      title="Másolás"
    >
      {copiedField === fieldId ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400" />
      )}
    </button>
  );

  const statusLabel = company.status_code === 1 ? "Aktív" : "Megszűnt";
  const statusColor = company.status_code === 1 ? "bg-green-500" : "bg-red-500";

  return (
    <div className="bg-white/5 rounded-xl ring-1 ring-white/10 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
      >
        <Building2 className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">
            {company.short_name || company.full_name}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {company.address}
          </div>
        </div>
        <span className={`${statusColor} text-white text-[10px] font-medium px-2 py-0.5 rounded shrink-0`}>
          {statusLabel}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-2">
          {/* Full name */}
          {company.short_name && company.full_name !== company.short_name && (
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Teljes név:</span> {company.full_name}
            </div>
          )}

          {/* Tax number */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Adószám:</span>{" "}
              <span className="text-white font-mono">{company.tax_number || "-"}</span>
            </div>
            {company.tax_number && (
              <CopyBtn value={company.tax_number} fieldId={`tax-${company.registration_number}`} />
            )}
          </div>

          {/* Registration number */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Cégjegyzékszám:</span>{" "}
              <span className="text-white font-mono">{company.registration_number || "-"}</span>
            </div>
            {company.registration_number && (
              <CopyBtn value={company.registration_number} fieldId={`reg-${company.registration_number}`} />
            )}
          </div>

          {/* Address */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex-1 min-w-0">
              <span className="text-slate-500">Székhely:</span>{" "}
              <span className="text-slate-300">{company.address || "-"}</span>
            </div>
            {company.address && (
              <CopyBtn value={company.address} fieldId={`addr-${company.registration_number}`} />
            )}
          </div>

          {/* Representatives */}
          {company.representatives && company.representatives.length > 0 && (
            <div className="text-xs">
              <span className="text-slate-500">Képviselő:</span>{" "}
              <span className="text-slate-300">
                {company.representatives.map((r) => r.name).join(", ")}
              </span>
            </div>
          )}

          {/* Main activity */}
          {company.main_activities && company.main_activities.length > 0 && (
            <div className="text-xs">
              <span className="text-slate-500">Főtevékenység:</span>{" "}
              <span className="text-slate-300 text-[11px]">{company.main_activities[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Widget
// =============================================================================

export function CompanySearchWidget() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CegjelzoCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { checkLimit, isLimited, cooldownRemaining } = useRateLimiter();
  const { copy, copiedField } = useCopyToClipboard();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setError("Minimum 3 karakter szükséges.");
      return;
    }

    if (!checkLimit()) {
      setError(`Várj ${cooldownRemaining} másodpercet.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setExpandedIndex(null);

    try {
      const res = await fetch(
        `/api/cegjelzo/search?value=${encodeURIComponent(trimmedQuery)}&limit=10`
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "API hiba");
      }

      const response = data as CegjelzoSearchResponse;
      setResults(response.results);
      if (response.results.length > 0) {
        setExpandedIndex(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Hiba történt.";
      setError(message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, checkLimit, cooldownRemaining]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !isLimited) {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setExpandedIndex(null);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Cégkereső
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-4">
        Keress magyar cégeket név alapján. Azonnal láthatod az adószámot, cégjegyzékszámot és más fontos adatokat.
      </p>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Cégnév (pl. OTP Bank, MOL Nyrt)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={isLimited}
          className="w-full bg-white/10 text-white placeholder-slate-400 text-sm rounded-xl px-4 py-3 pr-20 ring-1 ring-white/20 focus:ring-primary focus:outline-none transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Keresés törlése"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading || isLimited || query.trim().length < 3}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-secondary p-2 rounded-lg transition-colors"
            aria-label="Cég keresése"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Rate limit warning */}
      {isLimited && (
        <div className="text-xs text-amber-400 mb-3 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Várj {cooldownRemaining} másodpercet...
        </div>
      )}

      {/* Error */}
      {error && !isLimited && (
        <div className="text-xs text-red-400 mb-3 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {/* Results */}
      {isOpen && (hasSearched || results.length > 0) && (
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 && hasSearched && !error ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Nincs találat
            </div>
          ) : (
            results.map((company, index) => (
              <CompanyResultItem
                key={`${company.registration_number}-${index}`}
                company={company}
                onCopy={copy}
                copiedField={copiedField}
                isExpanded={expandedIndex === index}
                onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              />
            ))
          )}
        </div>
      )}

      {/* Result count */}
      {results.length > 0 && (
        <div className="mt-2 text-[11px] text-slate-500 text-right">
          {results.length} találat
        </div>
      )}
    </div>
  );
}

export default CompanySearchWidget;
