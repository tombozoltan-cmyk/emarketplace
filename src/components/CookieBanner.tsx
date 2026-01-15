"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Cookie, Shield, Settings, ChevronDown, ChevronUp, BarChart3, Megaphone } from "lucide-react";

type ConsentMode = "simple" | "detailed";

type ConsentValue = "accepted" | "necessary-only" | "custom";

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_KEY = "cookie-consent";
const PREF_KEY = "cookie-preferences";

function getInitialConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (!raw) return null;
    if (["accepted", "necessary-only", "custom"].includes(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

function getInitialPrefs(): CookiePreferences {
  if (typeof window === "undefined") {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) {
      return {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };
    }

    const parsed = JSON.parse(raw) as CookiePreferences;
    return {
      necessary: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }
}

export function CookieBanner() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/ops/");

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ConsentMode>("simple");
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [expandedCategory, setExpandedCategory] = useState<"necessary" | "functional" | "analytics" | "marketing" | null>(
    null,
  );

  // Initialize state on client only to avoid hydration mismatch
  useEffect(() => {
    const initialConsent = getInitialConsent();
    const initialPrefs = getInitialPrefs();
    setConsent(initialConsent);
    setPrefs(initialPrefs);
    setOpen(initialConsent === null);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAdminRoute) {
      return;
    }

    const handler = () => {
      setOpen(true);
    };

    window.addEventListener("open-cookie-settings", handler);
    return () => {
      window.removeEventListener("open-cookie-settings", handler);
    };
  }, [isAdminRoute]);

  if (!mounted || isAdminRoute || !open) {
    return null;
  }

  const handleSave = (value: ConsentValue) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CONSENT_KEY, value);
        window.localStorage.setItem(
          PREF_KEY,
          JSON.stringify({
            necessary: true,
            functional: prefs.functional,
            analytics: prefs.analytics,
            marketing: prefs.marketing,
          }),
        );
      } catch {
        // Ignore storage errors (privacy mode / blocked storage)
      }
    }
    setConsent(value);
    setOpen(false);
  };

  const content = (
    <>
      {/* Overlay */}
      <div className="pointer-events-auto fixed inset-0 z-[9998] bg-black/50" />

      {/* Banner */}
      <div className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[9999] md:bottom-8 md:right-8 md:left-auto md:max-w-md">
        <div className="pointer-events-auto overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl ring-2 ring-secondary">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-secondary to-secondary/80 p-6 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Cookie className="h-6 w-6 text-[color:var(--primary)]" />
              </div>
              <div>
                <h3 className="text-base font-bold">Cookie beállítások</h3>
                <p className="text-xs text-white/90">
                  Adatvédelem és süti kezelés – Ön dönt arról, milyen sütiket engedélyez.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSave("necessary-only")}
              className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Bezárás csak szükséges sütikkel"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          {mode === "simple" ? (
            <div className="space-y-4 bg-card p-6 text-xs text-foreground">
                  <p className="leading-relaxed">
                    Az oldal működéséhez szükséges sütiket mindig használjuk. Opcionális
                    funkcionális, statisztikai és marketing sütikhez az Ön hozzájárulása
                    szükséges.
                  </p>

                  {/* GDPR badge */}
                  <div className="flex items-start gap-3 rounded-lg border border-secondary/20 bg-secondary/5 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                      <Shield className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">GDPR megfelelőség</p>
                      <p className="text-[11px] text-muted-foreground">
                        Sütiket csak az Ön engedélyével használunk statisztikai és
                        marketing célokra, az európai adatvédelmi szabályozásnak megfelelően.
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSave("accepted")}
                      className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[color:var(--primary)]/90"
                    >
                      Összes elfogadása
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("detailed")}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[color:var(--muted)]"
                    >
                      <Settings className="h-4 w-4" />
                      Részletes beállítások
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave("necessary-only")}
                      className="w-full rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Csak szükségesek
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    További információért olvassa el az
                    <span className="px-1 text-[color:var(--primary)] underline-offset-2 hover:underline">
                      Adatkezelési tájékoztatót
                    </span>
                    .
                  </p>
            </div>
          ) : (
            <div className="bg-card p-6 text-xs text-foreground">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Részletes süti beállítások</p>
                    <button
                      type="button"
                      onClick={() => setMode("simple")}
                      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-medium text-foreground hover:bg-[color:var(--muted)]"
                    >
                      Vissza az egyszerű nézethez
                    </button>
                  </div>

                  <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                    {/* Szükséges sütik */}
                    <details
                      open={expandedCategory === "necessary"}
                      onToggle={(e) =>
                        setExpandedCategory(e.currentTarget.open ? "necessary" : null)
                      }
                      className="group rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Szükséges sütik</p>
                            <p className="text-[11px] text-muted-foreground">Mindig aktív</p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-open:hidden" />
                        <ChevronUp className="hidden h-4 w-4 text-muted-foreground group-open:block" />
                      </summary>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        A weboldal működéséhez, biztonsági funkciókhoz és a bejelentkezési
                        folyamatokhoz elengedhetetlen sütik. Ezek letiltása technikailag
                        nem lehetséges.
                      </p>
                    </details>

                    {/* Funkcionális sütik */}
                    <details
                      open={expandedCategory === "functional"}
                      onToggle={(e) =>
                        setExpandedCategory(e.currentTarget.open ? "functional" : null)
                      }
                      className="group rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Settings className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Funkcionális sütik</p>
                            <p className="text-[11px] text-muted-foreground">Nyelv, preferenciák</p>
                          </div>
                        </div>
                        <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={prefs.functional}
                            onChange={(e) =>
                              setPrefs((p) => ({ ...p, functional: e.target.checked }))
                            }
                            className="peer sr-only"
                          />
                          <span className="toggle block h-6 w-11 rounded-full bg-[color:var(--border)] transition peer-checked:bg-[color:var(--primary)]" />
                          <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 peer-checked:translate-x-5" />
                        </label>
                      </summary>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Ezek a sütik segítenek megjegyezni az Ön beállításait (pl. nyelv,
                        űrlapadatok), hogy kényelmesebben használhassa az oldalt.
                      </p>
                    </details>

                    {/* Statisztikai sütik */}
                    <details
                      open={expandedCategory === "analytics"}
                      onToggle={(e) =>
                        setExpandedCategory(e.currentTarget.open ? "analytics" : null)
                      }
                      className="group rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Statisztikai sütik</p>
                            <p className="text-[11px] text-muted-foreground">Látogatottság mérése</p>
                          </div>
                        </div>
                        <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={prefs.analytics}
                            onChange={(e) =>
                              setPrefs((p) => ({ ...p, analytics: e.target.checked }))
                            }
                            className="peer sr-only"
                          />
                          <span className="toggle block h-6 w-11 rounded-full bg-[color:var(--border)] transition peer-checked:bg-[color:var(--primary)]" />
                          <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 peer-checked:translate-x-5" />
                        </label>
                      </summary>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Névtelen statisztikai adatokat gyűjtünk arról, hogyan használják az
                        oldalt, hogy fejleszthessük szolgáltatásainkat.
                      </p>
                    </details>

                    {/* Marketing sütik */}
                    <details
                      open={expandedCategory === "marketing"}
                      onToggle={(e) =>
                        setExpandedCategory(e.currentTarget.open ? "marketing" : null)
                      }
                      className="group rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                            <Megaphone className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Marketing sütik</p>
                            <p className="text-[11px] text-muted-foreground">Célzott hirdetések</p>
                          </div>
                        </div>
                        <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={prefs.marketing}
                            onChange={(e) =>
                              setPrefs((p) => ({ ...p, marketing: e.target.checked }))
                            }
                            className="peer sr-only"
                          />
                          <span className="toggle block h-6 w-11 rounded-full bg-[color:var(--border)] transition peer-checked:bg-[color:var(--primary)]" />
                          <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 peer-checked:translate-x-5" />
                        </label>
                      </summary>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Ezek a sütik segítenek személyre szabott hirdetéseket és ajánlatokat
                        megjeleníteni az Ön érdeklődése alapján.
                      </p>
                    </details>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSave("custom")}
                      className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[color:var(--primary)]/90"
                    >
                      Beállítások mentése
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("simple")}
                      className="w-full rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[color:var(--muted)]"
                    >
                      Vissza
                    </button>
                  </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
