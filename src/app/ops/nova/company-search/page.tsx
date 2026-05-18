"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Building2,
  MapPin,
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Calendar,
  Loader2,
  AlertCircle,
  Info,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminLayout,
  AdminCard,
} from "@/components/admin";
import type { CegjelzoCompany, CegjelzoSearchResponse } from "@/lib/cegjelzo-api";

function extractBankAccounts(company: CegjelzoCompany): string[] {
  return (company.bank_accounts || []).map((ba) => ba.bank_account);
}

function extractRepresentativeNames(company: CegjelzoCompany): string[] {
  return (company.representatives || []).map((rep) => rep.name);
}

// =============================================================================
// Rate Limiting / Anti-bot Protection
// =============================================================================

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  cooldownMs: 30000, // 30 seconds cooldown after hitting limit
};

function useRateLimiter() {
  const requestTimestamps = useRef<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    // Clean old timestamps
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
// Copy to Clipboard Hook
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
// Company Card Component
// =============================================================================

function CompanyResultCard({ company, onCopy, copiedField }: { 
  company: CegjelzoCompany; 
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
}) {
  const bankAccounts = extractBankAccounts(company);
  const representatives = extractRepresentativeNames(company);

  const CopyButton = ({ value, fieldId }: { value: string; fieldId: string }) => (
    <button
      onClick={() => onCopy(value, fieldId)}
      className="ml-2 p-1 hover:bg-[color:var(--muted)] rounded transition-colors"
      title="Másolás"
    >
      {copiedField === fieldId ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-[color:var(--muted-foreground)]" />
      )}
    </button>
  );

  const statusLabel = company.status_code === 1 ? "Aktív" : company.status_code === 2 ? "Megszűnt" : `Státusz: ${company.status_code}`;
  const statusColor = company.status_code === 1 ? "bg-green-500" : company.status_code === 2 ? "bg-red-500" : "bg-gray-500";

  return (
    <AdminCard className="p-5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[color:var(--foreground)] text-lg leading-tight">
              {company.full_name}
            </h3>
            {company.short_name && company.short_name !== company.full_name && (
              <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
                Rövid név: {company.short_name}
              </p>
            )}
          </div>
          <span className={`${statusColor} text-white text-xs font-medium px-2.5 py-1 rounded shrink-0`}>
            {statusLabel}
          </span>
        </div>

        {/* Main Info Grid */}
        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-[color:var(--border)]">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-[color:var(--muted-foreground)] text-xs block">Székhely</span>
                <span className="text-[color:var(--foreground)]">{company.address || "-"}</span>
              </div>
              {company.address && <CopyButton value={company.address} fieldId={`addr-${company.registration_number}`} />}
            </div>

            {/* Tax Number */}
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-[color:var(--muted-foreground)] text-xs block">Adószám</span>
                <span className="text-[color:var(--foreground)] font-mono">{company.tax_number || "-"}</span>
              </div>
              {company.tax_number && <CopyButton value={company.tax_number} fieldId={`tax-${company.registration_number}`} />}
            </div>

            {/* Registration Number */}
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-[color:var(--muted-foreground)] text-xs block">Cégjegyzékszám</span>
                <span className="text-[color:var(--foreground)] font-mono">{company.registration_number || "-"}</span>
              </div>
              {company.registration_number && <CopyButton value={company.registration_number} fieldId={`reg-${company.registration_number}`} />}
            </div>

            {/* EU VAT Number */}
            {company.social_tax_number && (
              <div className="flex items-start gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[color:var(--muted-foreground)] text-xs block">EU adószám</span>
                  <span className="text-[color:var(--foreground)] font-mono">{company.social_tax_number}</span>
                </div>
                <CopyButton value={company.social_tax_number} fieldId={`vat-${company.registration_number}`} />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Founded */}
            {company.founded_at && (
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[color:var(--muted-foreground)] text-xs block">Alapítás dátuma</span>
                  <span className="text-[color:var(--foreground)]">{company.founded_at}</span>
                </div>
              </div>
            )}

            {/* Representatives */}
            {representatives.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[color:var(--muted-foreground)] text-xs block">Képviselő(k)</span>
                  <span className="text-[color:var(--foreground)]">{representatives.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Bank Accounts */}
            {bankAccounts.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[color:var(--muted-foreground)] text-xs block">Bankszámla</span>
                  {bankAccounts.map((acc, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-[color:var(--foreground)] font-mono text-xs">{acc}</span>
                      <CopyButton value={acc} fieldId={`bank-${company.registration_number}-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Activities */}
            {company.main_activities && company.main_activities.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-[color:var(--muted-foreground)] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[color:var(--muted-foreground)] text-xs block">Főtevékenység</span>
                  <span className="text-[color:var(--foreground)] text-xs">
                    {company.main_activities[0]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CegjelzoCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const { checkLimit, isLimited, cooldownRemaining } = useRateLimiter();
  const { copy, copiedField } = useCopyToClipboard();

  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setError("A keresési kifejezésnek legalább 3 karakter hosszúnak kell lennie.");
      return;
    }

    // Check rate limit
    if (!checkLimit()) {
      setError(`Túl sok keresés! Kérjük, várjon ${cooldownRemaining} másodpercet.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/cegjelzo/search?value=${encodeURIComponent(trimmedQuery)}&limit=50`
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "API hiba");
      }

      const response = data as CegjelzoSearchResponse;
      setResults(response.results);
      setResultCount(response.results.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba történt a keresés során.";
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

  return (
    <AdminLayout
      title="Cégkereső"
      description="Céginformáció lekérdezés a Cégjelző adatbázisból"
    >
      {/* Feature Description */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Mire jó ez a funkció?</p>
            <p className="text-blue-700 dark:text-blue-300">
              A Cégkereső segítségével gyorsan lekérdezheted a magyar cégek hivatalos adatait 
              a Cégjelző adatbázisából. Kereshetsz cégnév vagy cégnév-részlet alapján. 
              A találatok között megtalálod a cég adószámát, cégjegyzékszámát, székhelyét, 
              képviselőit és bankszámla adatait. Ideális szerződéskötés előtti ellenőrzéshez 
              vagy ügyféladatok validálásához.
            </p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted-foreground)]" />
            <Input
              placeholder="Cégnév vagy cégnév részlet (min. 3 karakter)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 h-12 text-base"
              disabled={isLimited}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || isLimited || query.trim().length < 3}
            className="h-12 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Keresés...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Keresés
              </>
            )}
          </Button>
        </div>

        {/* Rate Limit Warning */}
        {isLimited && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Biztonsági korlátozás aktív. Újra kereshetsz <strong>{cooldownRemaining}</strong> másodperc múlva.
            </span>
          </div>
        )}

        {/* Search Tips */}
        <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
          Tipp: A keresés szó eleji egyezést keres, pl. &quot;mol nyrt&quot; vagy &quot;otp bank&quot;. 
          Ékezet- és kis/nagybetű-érzéketlen.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[color:var(--primary)] mb-4" />
          <p className="text-[color:var(--muted-foreground)]">Cégek keresése...</p>
        </div>
      ) : hasSearched && results.length === 0 && !error ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-[color:var(--muted-foreground)] mx-auto mb-4 opacity-50" />
          <p className="text-[color:var(--muted-foreground)]">
            Nincs találat a megadott keresésre.
          </p>
          <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
            Próbálj másik keresőkifejezést használni.
          </p>
        </div>
      ) : results.length > 0 ? (
        <>
          {/* Result Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              <strong className="text-[color:var(--foreground)]">{resultCount}</strong> találat
            </p>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {results.map((company, index) => (
              <CompanyResultCard
                key={`${company.registration_number}-${index}`}
                company={company}
                onCopy={copy}
                copiedField={copiedField}
              />
            ))}
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}
