"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "language";

type Lang = "hu" | "en" | "de" | "es";

const OPTIONS: { value: Lang; label: string; flag: string; flagSrc: string }[] = [
  {
    value: "hu",
    label: "Magyar",
    flag: "🇭🇺",
    flagSrc: "https://flagcdn.com/w20/hu.png",
  },
  {
    value: "en",
    label: "English",
    flag: "🇬🇧",
    flagSrc: "https://flagcdn.com/w20/gb.png",
  },
  {
    value: "de",
    label: "Deutsch",
    flag: "🇩🇪",
    flagSrc: "https://flagcdn.com/w20/de.png",
  },
  {
    value: "es",
    label: "Español",
    flag: "🇪🇸",
    flagSrc: "https://flagcdn.com/w20/es.png",
  },
];

const VISIBLE_OPTIONS: Lang[] = ["hu", "en"];

export function LanguageSelector() {
  const [lang, setLang] = useState<Lang>("hu");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && ["hu", "en", "de", "es"].includes(stored)) {
      setLang(stored);
      return;
    }

    const safePathname = pathname ?? "";
    if (safePathname.startsWith("/en")) {
      setLang("en");
      return;
    }

    setLang("hu");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const current = OPTIONS.find((o) => o.value === lang)!;
  void current.flag;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--background)]/80 px-3 py-1 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white"
        aria-label="Nyelv választó"
      >
        <Globe className="h-4 w-4" strokeWidth={1.8} />
        <img
          src={current.flagSrc}
          alt={current.label}
          width={16}
          height={12}
          className="h-3.5 w-5 rounded-[2px] ring-1 ring-black/10"
          loading="lazy"
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl bg-[color:var(--card)] p-1 text-xs shadow-lg ring-1 ring-[color:var(--border)]">
          {OPTIONS.filter((option) => VISIBLE_OPTIONS.includes(option.value)).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLang(option.value);

                // Egyszerű útvonal váltás: egyelőre csak a főoldal ("/"   "en") között
                if (option.value === "en" || option.value === "hu") {
                  const mappings: Record<string, { en: string; hu: string }> = {
                    "/": { en: "/en", hu: "/" },
                    "/en": { en: "/en", hu: "/" },
                    "/szerzodes": { en: "/en/contract", hu: "/szerzodes" },
                    "/en/contract": { en: "/en/contract", hu: "/szerzodes" },
                    "/szekhelyszolgaltatas": {
                      en: "/en/registered-office-hungary",
                      hu: "/szekhelyszolgaltatas",
                    },
                    "/en/registered-office-hungary": {
                      en: "/en/registered-office-hungary",
                      hu: "/szekhelyszolgaltatas",
                    },
                    "/arak": { en: "/en/pricing", hu: "/arak" },
                    "/en/pricing": { en: "/en/pricing", hu: "/arak" },
                    "/blog": { en: "/en/blog", hu: "/blog" },
                    "/en/blog": { en: "/en/blog", hu: "/blog" },
                    "/kapcsolat": { en: "/en/contact", hu: "/kapcsolat" },
                    "/en/contact": { en: "/en/contact", hu: "/kapcsolat" },
                  };

                  const safePathname = pathname ?? "";
                  const mapping = mappings[safePathname];
                  if (mapping) {
                    router.push(option.value === "en" ? mapping.en : mapping.hu);
                  } else if (safePathname.startsWith("/blog/")) {
                    const slug = safePathname.replace("/blog/", "");
                    router.push(option.value === "en" ? `/en/blog/${slug}` : safePathname);
                  } else if (safePathname.startsWith("/en/blog/")) {
                    const slug = safePathname.replace("/en/blog/", "");
                    router.push(option.value === "en" ? safePathname : `/blog/${slug}`);
                  }
                }

                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[color:var(--foreground)] hover:bg-[color:var(--muted)] ${
                option.value === lang ? "font-semibold" : "font-normal"
              }`}
            >
              <img
                src={option.flagSrc}
                alt={option.label}
                width={16}
                height={12}
                className="h-3.5 w-5 rounded-[2px] ring-1 ring-black/10"
                loading="lazy"
              />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
