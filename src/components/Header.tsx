"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { QuoteButton } from "@/components/QuoteButton";

const NAV_ITEMS_HU = [
  { href: "/", label: "Főoldal" },
  { href: "/szekhelyszolgaltatas", label: "Székhelyszolgáltatás+" },
  { href: "/arak", label: "Árak" },
  { href: "/blog", label: "Blog" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

const NAV_ITEMS_EN = [
  { href: "/en", label: "Home" },
  { href: "/en/registered-office-hungary", label: "Registered Office" },
  { href: "/en/pricing", label: "Pricing" },
  { href: "/en/blog", label: "Blog" },
  { href: "/en/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHome = pathname === "/" || pathname === "/en";

  const isEnglish = pathname.startsWith("/en");
  const navItems = isEnglish ? NAV_ITEMS_EN : NAV_ITEMS_HU;

  const quoteCtaLabel = isEnglish ? "Request a quote" : "Ajánlatot kérek";

  const baseBg = onHome && !scrolled ? "bg-secondary" : "bg-[color:var(--card)]/95";
  const textColor = onHome && !scrolled ? "text-slate-50" : "text-[color:var(--foreground)]";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${baseBg} ${textColor} shadow-sm transition-all duration-200 ${
        scrolled ? "shadow-lg backdrop-blur-md" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 lg:h-24 lg:px-0">
        {/* Logo + slogan */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-auto md:h-14 lg:h-16">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media&token=b1684b4b-932d-4f6d-ba90-d860aa24a98e"
                alt="E-Marketplace Kft. logó"
                width={86}
                height={53}
                className="h-full w-auto object-contain object-left drop-shadow-sm"
              />
            </div>
            <div className="h-8 w-px bg-[color:var(--primary)]/80 md:h-10" />
          </div>
          <p className="hidden max-w-[120px] hyphens-auto text-xs font-bold text-[color:var(--primary)] sm:block sm:max-w-[160px] md:max-w-none md:text-sm">
            Prémium székhelyszolgáltatás
          </p>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex xl:text-base xl:gap-10">
          {navItems.map((item) => {
            const active = item.href === "/" || item.href === "/en"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative inline-flex flex-col items-center transition-colors duration-200 ${
                  active ? "text-[color:var(--primary)]" : "hover:text-[color:var(--primary)]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute -bottom-1 h-0.5 rounded-full bg-[color:var(--primary)] transition-all duration-200 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <QuoteButton
            className="hidden rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-[color:var(--secondary)] shadow-lg shadow-[color:var(--primary)]/40 hover:scale-[1.03] hover:bg-[#f8cf64] hover:shadow-xl transition lg:inline-flex"
          >
            {quoteCtaLabel}
          </QuoteButton>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menü megnyitása"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="space-y-1 rounded-2xl bg-[color:var(--card)]/95 p-4 text-sm shadow-xl ring-1 ring-[color:var(--border)]">
              {navItems.map((item) => {
                const active = item.href === "/" || item.href === "/en"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 font-medium transition ${
                      active
                        ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
                        : "text-[color:var(--foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="flex items-center justify-between gap-3 pt-3">
                <ThemeToggle />
                <LanguageSelector />
              </div>

              <QuoteButton
                className="mt-4 w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-[color:var(--secondary)] shadow-lg shadow-[color:var(--primary)]/40 hover:scale-[1.03] hover:bg-[#f8cf64] hover:shadow-xl transition"
              >
                {quoteCtaLabel}
              </QuoteButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
