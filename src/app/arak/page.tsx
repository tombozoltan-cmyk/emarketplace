import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Check,
  FileCheck,
  Globe,
  Users,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "@/components/QuoteButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Székhelyszolgáltatás Árak 2025 | Díjak és Csomagok Budapesten",
  description:
    "Székhelyszolgáltatás árak 2025-ben Budapest belvárosában: székhely 8.000 Ft/hó, kézbesítési megbízott, kombinált csomagok és virtuális iroda átlátható, rejtett költségek nélküli díjakkal.",
  alternates: {
    canonical: "https://e-marketplace.hu/arak",
    languages: {
      hu: "https://e-marketplace.hu/arak",
      en: "https://e-marketplace.hu/en/pricing",
      de: "https://e-marketplace.hu/de/preise",
      es: "https://e-marketplace.hu/es/precios",
    },
  },
};

export default function PricingPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[color:var(--muted)] pt-16 pb-12 md:pt-24 md:pb-20 lg:pt-32 lg:pb-28">
        {/* Egyszerű bubble dekoráció */}
        <div className="pointer-events-none absolute -left-16 -top-32 h-64 w-64 rounded-full bg-[color:var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-[-6rem] h-72 w-72 rounded-full bg-[color:var(--secondary)]/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[220px] max-w-4xl flex-col items-center justify-center px-4 text-center sm:min-h-[260px] sm:px-6 lg:min-h-[320px] lg:justify-end lg:pb-8 lg:px-8">
          <h1 className="mb-4 text-balance text-3xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            <span>Átlátható Árazás,</span>{" "}
            <span className="text-[color:var(--primary)]">Rejtett Költségek Nélkül</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-[color:var(--muted-foreground)] md:mb-8 md:text-lg lg:text-xl">
            Hiszünk abban, hogy egy vállalkozás elindítása nem kell, hogy bonyolult vagy drága legyen. Átlátható csomagjainkkal pontosan látja, mit kap a pénzéért.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:px-8 md:py-4 md:text-base">
            Ajánlatot kérek
          </QuoteButton>
        </div>
      </section>

      {/* ALAP CSOMAGOK */}
      <section className="bg-[color:var(--background)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Alap Székhelyszolgáltatás Csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Válassza ki az Ön vállalkozásához illő székhelycsomagot. Nincsenek rejtett költségek, minden tartalmazza a postakezelést és az értesítéseket.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {/* Magyar vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Magyar vállalkozóknak
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Hazai Kft-k és Bt-k számára
                  </p>
                </div>
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">8 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  {["Hivatalos székhely cím", "Postakezelés & szkennelés", "Email értesítés 0-24"].map(
                    (item) => (
                      <li key={item} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 96.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="szekhely-hu" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Külföldi vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Külföldi vállalkozóknak
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Nemzetközi ügyfeleknek
                  </p>
                </div>
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">10 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  {["Hivatalos székhely cím", "Postakezelés & szkennelés", "Angol nyelvű szerződés"].map(
                    (item) => (
                      <li key={item} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 120.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="szekhely-kulfoldi" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Kézbesítési megbízott */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Kézbesítési megbízott
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Minden cégnek kötelező
                  </p>
                </div>
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">5 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  {["Átveszi a hatósági iratokat", "Hivatalos képviselet", "Törvényi megfelelés"].map(
                    (item) => (
                      <li key={item} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 60.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="kezbesitesi" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Virtuális iroda PRÉMIUM */}
            <Card className="relative flex h-full flex-col overflow-hidden border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-lg transition-shadow hover:shadow-xl">
              <span className="absolute right-4 top-4 rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-bold text-[color:var(--background)]">
                PRÉMIUM
              </span>
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Virtuális iroda
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    12 hónapos szerződés
                  </p>
                </div>
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">30 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  {[
                    "Banki ügyintézéshez alkalmas",
                    "Hosszú távú szerződés",
                    "Külföldi vállalkozóknak is ideális",
                  ].map((item) => (
                    <li key={item} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--primary)]/10 p-3 text-center text-xs font-medium text-[color:var(--foreground)]">
                  1 évre előre: 360.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="szerzodeses-irodaberles" className="mt-auto w-full rounded-full bg-[color:var(--primary)] text-[color:var(--background)] hover:bg-[color:var(--primary)]/90">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* KOMBINÁLT CSOMAGOK (BUNDLE) */}
      <section className="bg-[color:var(--secondary)]/15 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Kombinált Székhely + Kézbesítési csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Kedvezményes csomagok, ha a székhelyszolgáltatást és a kézbesítési megbízottat egyben veszi igénybe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Teljes csomag magyar vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)]/50 bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Teljes csomag magyar vállalkozóknak
                  </h3>
                  <span className="rounded bg-[color:var(--primary)]/10 px-2 py-1 text-xs font-bold text-[color:var(--primary)]">
                    -15%
                  </span>
                </div>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Székhely + Kézbesítési megbízott
                </p>
                <div className="mb-4">
                  <div className="text-sm text-[color:var(--muted-foreground)] line-through">13 000 Ft</div>
                  <div className="text-4xl font-bold text-[color:var(--primary)]">11 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Székhely (8 000 Ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Kézbesítési megbízott (5 000 Ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Minden szolgáltatás egyben, egyszerűsített adminisztrációval</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 132.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="szekhely-kezbesitesi-hu" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Teljes csomag külföldi vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Teljes csomag külföldi vállalkozóknak
                  </h3>
                  <span className="rounded bg-[color:var(--primary)]/10 px-2 py-1 text-xs font-bold text-[color:var(--primary)]">
                    -13%
                  </span>
                </div>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Székhely + Kézbesítési megbízott
                </p>
                <div className="mb-4">
                  <div className="text-sm text-[color:var(--muted-foreground)] line-through">15 000 Ft</div>
                  <div className="text-4xl font-bold text-[color:var(--primary)]">13 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Székhely (10 000 Ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Kézbesítési megbízott (5 000 Ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Angol nyelvű szerződés és dokumentáció</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 156.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="szekhely-kezbesitesi-kulfoldi" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IRODA CSOMAGOK */}
      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Kombinált Iroda Csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Székhelyszolgáltatás és irodahasználat egyben – ha nemcsak hivatalos címet, hanem alkalmi munkavégzésre alkalmas irodát is szeretne.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Iroda csomag magyar vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Teljeskörű megoldás magyar vállalkozóknak
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Székhely + Irodahasználat
                  </p>
                </div>
                <div className="mb-4">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">18 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Székhelyszolgáltatás (8 000 Ft/hó).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Havi 4 alkalmas irodahasználat.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Kedvezményes iroda díj: 10 000 Ft/hó.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Postakezelés és továbbítás.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Email értesítés a beérkező postáról.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Tárgyaló bérlési lehetőség kedvezményes áron.</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  Fél vagy 1 évre előre fizetendő.
                </div>
                <QuoteButton packageId="iroda-hu" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Iroda csomag külföldi vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Komplex csomag külföldi vállalkozóknak
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Székhely + Iroda hosszú távra
                  </p>
                </div>
                <div className="mb-4">
                  <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">20 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Havi 4 alkalommal irodahasználat.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Angol vagy magyar nyelvű szerződés.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Eco-Office coworking használata.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Cégbejegyzéshez szükséges dokumentumok kiállítása.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Dedikált ügyintéző a külföldi ügyfeleknek.</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre fizetendő.
                </div>
                <QuoteButton packageId="iroda-kulfoldi" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TELJES KÖRŰ CSOMAGOK */}
      <section className="bg-[color:var(--muted)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Teljes körű vállalkozói csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Ha mindent egyben szeretne: székhely, iroda és kézbesítési megbízott kedvezményes havi díjjal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Teljes csomag magyar vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Teljes csomag magyar vállalkozóknak
                  </h3>
                  <span className="rounded bg-[color:var(--primary)]/10 px-2 py-1 text-xs font-bold text-[color:var(--primary)]">
                    -
                     
                    8%
                  </span>
                </div>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Székhely + Iroda + Kézbesítési megbízott
                </p>
                <div className="mb-4">
                  <div className="text-sm text-[color:var(--muted-foreground)] line-through">26 000 Ft</div>
                  <div className="text-4xl font-bold text-[color:var(--primary)]">24 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Székhelyszolgáltatás (8 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Irodahasználat (10 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Kézbesítési megbízott (5 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Teljes körű adminisztráció és postakezelés.</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 288.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="iroda-kezbesitesi-hu" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>

            {/* Teljes csomag külföldi vállalkozóknak */}
            <Card className="flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    Teljes csomag külföldi vállalkozóknak
                  </h3>
                  <span className="rounded bg-[color:var(--primary)]/10 px-2 py-1 text-xs font-bold text-[color:var(--primary)]">
                    -10%
                  </span>
                </div>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Székhely + Iroda + Kézbesítési megbízott
                </p>
                <div className="mb-4">
                  <div className="text-sm text-[color:var(--muted-foreground)] line-through">30 000 Ft</div>
                  <div className="text-4xl font-bold text-[color:var(--primary)]">27 000 Ft</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">+ ÁFA / hó</p>
                </div>
                <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Székhelyszolgáltatás (10 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Irodahasználat (10 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Kézbesítési megbízott (5 000 Ft).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>Angol nyelvű szerződés és dokumentáció.</span>
                  </li>
                </ul>
                <div className="mb-6 rounded-md bg-[color:var(--muted)]/50 p-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  1 évre előre: 324.000 Ft + ÁFA
                </div>
                <QuoteButton packageId="iroda-kezbesitesi-kulfoldi" className="mt-auto w-full rounded-full font-semibold">
                  Árajánlat
                </QuoteButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* ÖSSZEHASONLÍTÁS SZEKCIÓ */}
      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Melyik csomag Önnek való?
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Segítünk kiválasztani az Ön vállalkozásához leginkább illeszkedő csomagot. Nézze meg, hogy induló, növekvő vagy külföldi vállalkozásként melyik megoldás támogatja legjobban a céljait.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Indulóknak */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Building2 className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Indulóknak
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha most alapítja vállalkozását, és fontos az alacsony fix költség, miközben hivatalos budapesti címet szeretne.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Alap székhely csomag + Kézbesítési megbízott
                </p>
              </CardContent>
            </Card>

            {/* Növekvőknek */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-4 h-10 w-10 text-[color:var(--secondary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Növekvőknek
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha rendszeresen találkozik ügyfelekkel, és szüksége van alkalmi irodahasználatra tárgyalásokhoz vagy csapatmegbeszélésekhez.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Székhely + Iroda csomag
                </p>
              </CardContent>
            </Card>

            {/* Külföldi vállalkozóknak */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Globe className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Külföldi vállalkozóknak
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha magyar bankszámlát szeretne nyitni, hivatalos magyar címet és angol nyelvű szerződéseket igényel a partnerei felé.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Virtuális iroda vagy Teljes csomag külföldi vállalkozóknak
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SZEKCIÓ – designos, lenyíló accordion */}
      <section className="bg-[color:var(--muted)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[color:var(--foreground)]">
              Gyakran Ismételt Kérdések
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Összegyűjtöttük a legfontosabb kérdéseket a székhelyszolgáltatás és a csomagjaink díjai kapcsán.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="space-y-3"
          >
            <AccordionItem value="faq-1" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Milyen gyakran kell fizetnem?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden csomagunk esetében 1 évre előre kell fizetni, ami jelentős kedvezményt jelent a havi díjakhoz képest. Így Önnek nem kell havonta számlákkal foglalkoznia, és biztonságban tudhatja székhelyét.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Van-e rejtett költség?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Nincsenek rejtett költségek. Az áraink tartalmazzák a teljes körű postakezelést és szkennelést, valamint az emailes értesítéseket. Külön díjat csak extra igénybevett szolgáltatások (pl. plusz irodahasználat) esetén számítunk fel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Mi a különbség a virtuális iroda és a székhely között?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                A székhelyszolgáltatás elsősorban a hivatalos cégcím biztosításáról szól, míg a virtuális iroda 12 hónapos, bankok által is elfogadott bérleti szerződéssel jár, amely irodahasználatot is tartalmaz. Ha banki hitelhez vagy komolyabb partnerekhez kell szerződéses iroda, a virtuális iroda a megfelelő választás.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Hogyan működik a postakezelés?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden Önnek érkező postai küldeményt átvesszünk, iktatunk és beszkennelünk. A szkennelt dokumentumokat emailben továbbítjuk, igény esetén pedig futárral vagy postán továbbítjuk az eredeti példányt is.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Mikor kötelező kézbesítési megbízottat igénybe venni?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden olyan külföldi ügyvezető vagy tulajdonos esetében kötelező kézbesítési megbízottat megjelölni, akinek nincs magyarországi lakcíme. Ebben a csomagjaink teljes körű megoldást nyújtanak, amely jogszabályoknak megfelelő.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ZÁRÓ CTA */}
      <section className="bg-gradient-to-b from-[color:var(--primary)]/5 to-[color:var(--background)] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-[color:var(--foreground)]">
            Készen áll vállalkozása indítására?
          </h2>
          <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
            Foglaljon időpontot most, és indítsa el vállalkozását profi székhelyszolgáltatással, átlátható árakkal és rejtett költségek nélkül.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-8 py-3 text-sm font-semibold text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:text-base">
            Ajánlatot kérek
          </QuoteButton>
        </div>
      </section>

      <Footer />
    </main>
  );
}
